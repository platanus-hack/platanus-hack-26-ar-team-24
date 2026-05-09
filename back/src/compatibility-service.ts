import { randomUUID } from "node:crypto";
import type {
  ConversationConfig,
  GraderProfile,
  JudgeDecision,
  MatchmakingRequest,
  TranscriptMessage,
  UserProfile
} from "./types.js";
import { graderProfileSchema, judgeDecisionSchema } from "./types.js";
import { PersistenceService } from "./persistence-service.js";
import { RuntimeClient } from "./runtime-client.js";
import { logger } from "./logger.js";
import { GithubProfileService, type GithubProfileInsight } from "./github-profile-service.js";

const PERSONAL_TOPIC_AGENDA = [
  {
    key: "values-and-priorities",
    label: "valores y prioridades personales",
    instruction:
      "Hablen de qué valores ordenan sus decisiones, qué les importa de verdad en la vida y qué cosas no están dispuestos a negociar."
  },
  {
    key: "relationships-and-conflict",
    label: "vínculos, amistad y manejo del conflicto",
    instruction:
      "Hablen de cómo construyen confianza, qué esperan de una amistad cercana y cómo reaccionan cuando hay desacuerdo o tensión."
  },
  {
    key: "life-direction-and-growth",
    label: "rumbo de vida, ambición y crecimiento personal",
    instruction:
      "Hablen de hacia dónde quieren llevar su vida, qué tipo de crecimiento buscan y qué sacrificios están o no dispuestos a hacer."
  }
] as const;

export class CompatibilityService {
  constructor(
    private runtime: RuntimeClient,
    private graderAgentId: string,
    private judgeAgentId: string,
    private persistence: PersistenceService,
    private githubProfileService?: GithubProfileService
  ) {}

  async createProfiledAgent(
    agentId: string,
    user: UserProfile,
    ownerUserId?: string,
    ownerAccessToken?: string
  ): Promise<GraderProfile> {
    logger.info("Creating profiled agent", { agentId, userName: user.name });

    await this.runtime.ensureAgentExists(this.graderAgentId);
    await this.runtime.createAgent(agentId);

    const githubInsight = await this.maybeEnrichGithubProfile(user);
    const enrichedUser = this.mergeGithubInsightIntoUser(user, githubInsight);

    logger.debug("Evaluating user profile", { agentId });
    const grade = await this.evaluateProfile(agentId, enrichedUser, githubInsight);

    logger.debug("Writing agent profile files", { agentId, overallScore: grade.overallScore });
    await this.writeAgentProfileFiles(agentId, enrichedUser, grade, githubInsight);

    if (ownerUserId && ownerAccessToken) {
      await this.persistence.upsertAgentIdentity({
        ownerUserId,
        ownerAccessToken,
        agentId,
        agentName: user.name,
        role: this.extractAgentRole(enrichedUser),
        profile: enrichedUser,
        grading: grade
      });
    }

    logger.info("Profiled agent created successfully", { agentId, overallScore: grade.overallScore });
    return grade;
  }

  async runConversation(config: ConversationConfig, ownerUserId?: string, ownerAccessToken?: string) {
    if (config.agentA === config.agentB) {
      throw new Error("agentA and agentB must be different");
    }

    const conversationId = randomUUID();
    const shortConversationId = conversationId.split("-")[0];
    logger.info("Starting compatibility conversation", {
      conversationId,
      agentA: config.agentA,
      agentB: config.agentB,
      maxRounds: config.maxRounds
    });

    await this.runtime.ensureAgentExists(this.judgeAgentId);
    await this.runtime.ensureAgentExists(config.agentA);
    await this.runtime.ensureAgentExists(config.agentB);

    const transcript: TranscriptMessage[] = [];
    const sessionIds = {
      [config.agentA]: `a-${shortConversationId}`,
      [config.agentB]: `b-${shortConversationId}`
    };
    const effectiveMaxRounds = Math.max(config.maxRounds, PERSONAL_TOPIC_AGENDA.length);

    let currentPrompt = config.openingMessage;
    let finalDecision: JudgeDecision | null = null;

    for (let round = 1; round <= effectiveMaxRounds; round += 1) {
      logger.debug("Running conversation round", { conversationId, round });
      let currentSpeaker = config.agentA;
      let otherSpeaker = config.agentB;
      const roundTopic = this.getRoundTopic(round);

      for (let turnIndex = 0; turnIndex < config.turnsPerAgent * 2; turnIndex += 1) {
        const speakerTurnNumber =
          currentSpeaker === config.agentA
            ? Math.floor(turnIndex / 2) + 1
            : Math.floor((turnIndex - 1) / 2) + 1;

        const turnInstruction = this.buildTurnPrompt({
          speaker: currentSpeaker,
          listener: otherSpeaker,
          openingMessage:
            turnIndex === 0 && round === 1 ? currentPrompt : undefined,
          priorMessage:
            turnIndex === 0 && round === 1 ? undefined : currentPrompt,
          turnNumber: speakerTurnNumber,
          turnsPerAgent: config.turnsPerAgent,
          globalTurnNumber: transcript.length + 1,
          round,
          topicLabel: roundTopic.label,
          topicInstruction: roundTopic.instruction
        });

        const text = await this.runtime.sendMessage({
          agentId: currentSpeaker,
          message: turnInstruction,
          thinking: config.thinking,
          sessionId: sessionIds[currentSpeaker]
        });
        const cleanedText = this.sanitizeAgentUtterance(text);

        transcript.push({
          speaker: currentSpeaker,
          text: cleanedText,
          round,
          turn: turnIndex + 1
        });

        currentPrompt = cleanedText;
        [currentSpeaker, otherSpeaker] = [otherSpeaker, currentSpeaker];
      }

      finalDecision = await this.evaluateConversation({
        conversationId,
        agentA: config.agentA,
        agentB: config.agentB,
        currentRound: round,
        maxRounds: effectiveMaxRounds,
        transcript,
        thinking: config.thinking,
        requiredTopics: PERSONAL_TOPIC_AGENDA.map((topic) => topic.label)
      });

      if (round < PERSONAL_TOPIC_AGENDA.length) {
        finalDecision = {
          ...finalDecision,
          done: false,
          outcome: "continue",
          summary: `Todavía faltan temas personales obligatorios por cubrir antes de decidir compatibilidad. Ya hablaron de ${roundTopic.label}.`,
          reasons: [
            ...finalDecision.reasons,
            `La conversación aún no cubrió los ${PERSONAL_TOPIC_AGENDA.length} tópicos personales mínimos.`
          ]
        };
      }

      logger.debug("Judge evaluation result", {
        conversationId,
        round,
        outcome: finalDecision.outcome,
        score: finalDecision.score,
        done: finalDecision.done
      });

      if (finalDecision.done) {
        break;
      }

      if (round < effectiveMaxRounds) {
        currentPrompt = this.buildInterRoundPrompt(round + 1, finalDecision.summary);
      }
    }

    if (!finalDecision) {
      throw new Error("Judge evaluation did not run");
    }

    if (!finalDecision.done) {
      finalDecision = {
        ...finalDecision,
        done: true,
        outcome: finalDecision.score >= 0.65 ? "match" : "no_match",
        summary: `${finalDecision.summary} Max rounds reached.`,
        reasons: [...finalDecision.reasons, "Reached max rounds without early decision"]
      };
    }

    logger.info("Compatibility conversation completed", {
      conversationId,
      outcome: finalDecision.outcome,
      score: finalDecision.score,
      roundsUsed: transcript.length / (config.turnsPerAgent * 2)
    });

    if (ownerUserId && ownerAccessToken) {
      await this.persistence.saveConversation({
        conversationId,
        ownerUserId,
        ownerAccessToken,
        agentA: config.agentA,
        agentB: config.agentB,
        judgeAgentId: this.judgeAgentId,
        openingMessage: config.openingMessage,
        turnsPerAgent: config.turnsPerAgent,
        maxRounds: effectiveMaxRounds,
        compatibility: finalDecision,
        transcript
      });
    }

    return {
      conversationId,
      agentA: config.agentA,
      agentB: config.agentB,
      turnsPerAgent: config.turnsPerAgent,
      maxRounds: effectiveMaxRounds,
      judgeAgentId: this.judgeAgentId,
      compatibility: finalDecision,
      transcript
    };
  }

  async runPurposeMatchmaking(
    agentId: string,
    request: MatchmakingRequest,
    ownerUserId?: string,
    ownerAccessToken?: string
  ) {
    logger.info("Starting purpose matchmaking", {
      agentId,
      purpose: request.purpose,
      limit: request.limit ?? null
    });

    await this.runtime.ensureAgentExists(agentId);

    const agents = await this.runtime.listAgents();
    const excludedIds = new Set(["main", this.graderAgentId, this.judgeAgentId, agentId]);
    const candidates = (agents.agents ?? [])
      .map((agent) => agent.id)
      .filter((candidateId): candidateId is string => Boolean(candidateId) && !excludedIds.has(candidateId))
      .slice(0, request.limit ?? Number.MAX_SAFE_INTEGER);

    const matches = [];
    const failures = [];

    for (const candidateId of candidates) {
      try {
        const result = await this.runConversation({
          agentA: agentId,
          agentB: candidateId,
          openingMessage: this.buildPurposeOpeningMessage(agentId, candidateId, request.purpose),
          turnsPerAgent: request.turnsPerAgent,
          maxRounds: request.maxRounds,
          thinking: request.thinking
        }, ownerUserId, ownerAccessToken);

        if (result.compatibility.score >= request.minScore) {
          matches.push({
            candidateId,
            conversationId: result.conversationId,
            compatibility: result.compatibility,
            transcript: result.transcript
          });
        }
      } catch (error) {
        failures.push({
          candidateId,
          error: error instanceof Error ? error.message : "Unexpected error"
        });
      }
    }

    matches.sort((left, right) => right.compatibility.score - left.compatibility.score);

    logger.info("Purpose matchmaking completed", {
      agentId,
      evaluated: candidates.length,
      returned: matches.length,
      failures: failures.length
    });

    return {
      agentId,
      purpose: request.purpose,
      evaluatedCandidates: candidates.length,
      returnedMatches: matches.length,
      matches,
      failures
    };
  }

  private async evaluateProfile(
    agentId: string,
    user: UserProfile,
    githubInsight?: GithubProfileInsight | null
  ): Promise<GraderProfile> {
    const graderPrompt = [
      `Crea un perfil psicológico auténtico para ${agentId}.`,
      "",
      "Devuelve SOLO JSON válido, sin markdown.",
      'Esquema: {"overallScore": 0-1, "personalScore": 0-1, "socialScore": 0-1, "professionalScore": 0-1, "summary": string, "personalitySummary": string, "strengths": [], "risks": [], "interests": [], "conversationStyle": string, "values": []}',
      "",
      "- summary: 1-2 frases sobre quién es",
      "- personalitySummary: Cómo actúa, tono, qué le importa. SÉ AUTÉNTICO, no adaptes.",
      "- conversationStyle: Cómo habla (formal/casual, directo/indirecto, preguntador)",
      "- strengths: 3-5 fortalezas reales",
      "- risks: 2-4 limitaciones honestas",
      "- interests: Temas que genuinamente le importan",
      "- values: Sus principios",
      "",
      githubInsight
        ? `Contexto adicional verificado desde GitHub: ${githubInsight.summary}`
        : null,
      githubInsight && githubInsight.strengthSignals.length > 0
        ? `Señales técnicas detectadas: ${githubInsight.strengthSignals.join(", ")}`
        : null,
      "",
      "Datos del usuario:",
      JSON.stringify(user, null, 2)
    ]
      .filter(Boolean)
      .join("\n\n");

    const rawText = await this.runtime.sendMessage({
      agentId: this.graderAgentId,
      message: graderPrompt,
      thinking: "minimal",
      sessionId: `grader-profile-${agentId}`
    });

    const jsonStr = RuntimeClient.extractJsonObject(rawText);
    const parsed = JSON.parse(jsonStr);
    return graderProfileSchema.parse(parsed);
  }

  private async evaluateConversation(args: {
    conversationId: string;
    agentA: string;
    agentB: string;
    currentRound: number;
    maxRounds: number;
    transcript: TranscriptMessage[];
    thinking: string;
    requiredTopics: string[];
  }): Promise<JudgeDecision> {
    const transcriptText = args.transcript
      .map(
        (message) =>
          `Round ${message.round}, turn ${message.turn}, ${message.speaker}: ${message.text}`
      )
      .join("\n");

    const judgePrompt = [
      `Evalúa compatibilidad entre ${args.agentA} y ${args.agentB}.`,
      `Ronda ${args.currentRound}/${args.maxRounds}.`,
      "",
      "Decide: ¿MATCH, NO_MATCH, o CONTINUE?",
      "",
      "Devuelve SOLO JSON: {\"done\": bool, \"score\": 0-1, \"outcome\": \"match\"|\"no_match\"|\"continue\", \"summary\": string, \"sharedInterests\": [], \"reasons\": []}",
      "",
      "Criterios:",
      "- MATCH (0.65+): Interés mutuo genuino, química social o intelectual, valores suficientemente alineados y ganas reales de seguir hablando o verse.",
      "- NO_MATCH (≤0.4): Valores opuestos, desinterés, conversación forzada, falta de química, o incompatibilidad clara incluso para amistad.",
      "- CONTINUE (0.4-0.65): Incierto, necesita más datos",
      "- Si ya hay evidencia suficiente para MATCH o NO_MATCH, marca done=true de inmediato.",
      "- Después de la ronda 1, usa CONTINUE solo si realmente falta información crítica.",
      "- No asumas que deben hacer match. Es totalmente válido concluir que no conectarían ni como amigos.",
      "- Valora también desacuerdos productivos: debatir no implica incompatibilidad si hay curiosidad, respeto y buena señal interpersonal.",
      `- Antes de emitir una decisión final, asegúrate de que hayan recorrido al menos estos ${args.requiredTopics.length} tópicos personales: ${args.requiredTopics.join(", ")}.`,
      "- Si todavía no pasaron por todos esos tópicos, debes devolver done=false y outcome=continue.",
      "",
      "Conversación:",
      transcriptText
    ].join("\n\n");

    const rawText = await this.runtime.sendMessage({
      agentId: this.judgeAgentId,
      message: judgePrompt,
      thinking: args.thinking,
      sessionId: `judge-${args.conversationId}`
    });

    const jsonStr = RuntimeClient.extractJsonObject(rawText);
    const parsed = JSON.parse(jsonStr);
    return judgeDecisionSchema.parse(parsed);
  }

  private buildTurnPrompt(args: {
    speaker: string;
    listener: string;
    openingMessage?: string;
    priorMessage?: string;
    turnNumber: number;
    turnsPerAgent: number;
    globalTurnNumber: number;
    round: number;
    topicLabel: string;
    topicInstruction: string;
  }): string {
    if (args.globalTurnNumber === 1 && args.openingMessage) {
      return [
        `Estás conversando con ${args.listener}. Habla en primera persona como si fueras la persona representada, no como observador externo ni en tercera persona.`,
        `Tu próximo mensaje será enviado DIRECTAMENTE a ${args.listener}.`,
        "No le respondas al usuario, al operador, al configurador ni a quien armó la simulación.",
        "No respondas al contexto como si te hubieran hecho esa pregunta a ti. Ese contexto NO es un mensaje del otro agente.",
        "Sé auténtico, responde con tu criterio genuino, con opiniones reales y sin intentar caer bien artificialmente.",
        "Puedes coincidir, disentir, cuestionar ideas y debatir con naturalidad. No estás obligado a gustarle al otro agente.",
        "Responde como una persona hablando con otra persona.",
        "No describas la conversación desde afuera. No uses fórmulas como 'Tu mensaje ha sido enviado a...', 'Él respondió:', 'ella dijo:', ni comillas narrativas.",
        "Devuelve solo el texto que realmente le dirías al otro agente.",
        `TEMA OBLIGATORIO DE ESTA RONDA (${args.round}/${PERSONAL_TOPIC_AGENDA.length}): ${args.topicLabel}.`,
        args.topicInstruction,
        "",
        "CONTEXTO INICIAL DE LA CONVERSACIÓN:",
        args.openingMessage,
        "",
        "Ese contexto describe qué busca explorar esta conversación. No lo trates como un mensaje textual del otro agente.",
        "Tu tarea es abrir la charla de forma natural, como en la vida real, usando ese contexto solo como orientación.",
        `Empieza tú la conversación con una observación, opinión o pregunta genuina dirigida a ${args.listener}.`,
        "Tu primera línea debe sonar como el inicio natural de un chat entre dos personas, no como una respuesta a un formulario o consigna.",
        "",
        "IMPORTANTE: Responde BREVE. 1-3 oraciones máximo. Nada de párrafos largos."
      ].join("\n\n");
    }

    return [
      `Último mensaje recibido de ${args.listener}:`,
      args.priorMessage ?? "",
      "",
      `Tu próximo mensaje será enviado DIRECTAMENTE a ${args.listener}.`,
      "No le respondas al usuario, al operador, al configurador ni a quien armó la simulación.",
      "",
      `TEMA OBLIGATORIO DE ESTA RONDA (${args.round}/${PERSONAL_TOPIC_AGENDA.length}): ${args.topicLabel}.`,
      args.topicInstruction,
      "Habla en primera persona como una conversación real entre dos personas.",
      "No describas la conversación desde afuera. No uses fórmulas como 'Tu mensaje ha sido enviado a...', 'Él respondió:', 'ella dijo:', ni comillas narrativas.",
      "Devuelve solo el texto que realmente le dirías al otro agente.",
      "Mantén la conversación natural y fluida. Puedes debatir ideas, marcar desacuerdos y defender tu punto sin volverte hostil.",
      "IMPORTANTE: Responde BREVE. 1-3 oraciones máximo.",
      "No hagas preguntas abiertas infinitas. Si ya tienes suficiente señal, cierra con una conclusión concreta."
    ].join("\n\n");
  }

  private buildPurposeOpeningMessage(agentA: string, agentB: string, purpose: string): string {
    return [
      `Tu objetivo en esta charla es evaluar si ${agentA} y ${agentB} deberían conectarse por el siguiente propósito: ${purpose}.`,
      "Conversen de forma natural para detectar compatibilidad real, intereses compartidos, estilo de trabajo, visión del mundo y posibles fricciones.",
      "No hagan un pitch artificial. Traten de descubrir rápido si vale la pena la conexión.",
      "Si no hay química, afinidad o curiosidad mutua, también es válido concluir que no deberían conectar.",
      `Antes de decidir, recorran estos ${PERSONAL_TOPIC_AGENDA.length} temas personales: ${PERSONAL_TOPIC_AGENDA.map((topic) => topic.label).join(", ")}.`
    ].join("\n\n");
  }

  private buildInterRoundPrompt(nextRound: number, lastJudgeSummary: string): string {
    const nextTopic = this.getRoundTopic(nextRound);

    return [
      "Continúen la charla desde donde quedó.",
      `Última evaluación del juez: ${lastJudgeSummary}`,
      "No reinicien la conversación, no vuelvan a saludar y no se re-presenten.",
      `Ahora pasen explícitamente al siguiente tema personal: ${nextTopic.label}.`,
      nextTopic.instruction,
      "No busquen agradarse rápido. Intercambien posturas reales, incluyendo desacuerdos si aparecen.",
      "Busquen cerrar una conclusión concreta sobre este tema antes de pasar al siguiente."
    ].join("\n\n");
  }

  private getRoundTopic(round: number) {
    return PERSONAL_TOPIC_AGENDA[Math.min(round - 1, PERSONAL_TOPIC_AGENDA.length - 1)];
  }

  private async writeAgentProfileFiles(
    agentId: string,
    user: UserProfile,
    grade: GraderProfile,
    githubInsight?: GithubProfileInsight | null
  ) {
    const identityContent = [
      "# Identity",
      "",
      `Agent id: \`${agentId}\``,
      user.name ? `Name represented: ${user.name}` : null,
      user.age ? `Age: ${user.age}` : null,
      user.location ? `Location: ${user.location}` : null,
      githubInsight?.profileUrl ? `GitHub: ${githubInsight.profileUrl}` : null,
      "",
      "Summary:",
      grade.summary,
      githubInsight ? "" : null,
      githubInsight ? "GitHub snapshot:" : null,
      githubInsight ? githubInsight.headline : null
    ]
      .filter(Boolean)
      .join("\n");

    const soulContent = [
      `# ${agentId} Persona`,
      "",
      grade.personalitySummary,
      "",
      `Conversation style: ${grade.conversationStyle}`,
      githubInsight ? `Technical headline: ${githubInsight.headline}` : null,
      "",
      "Values:",
      ...grade.values.map((value) => `- ${value}`),
      "",
      "Strengths:",
      ...grade.strengths.map((value) => `- ${value}`),
      ...(githubInsight?.strengthSignals.length
        ? ["", "GitHub-backed strength signals:", ...githubInsight.strengthSignals.map((value) => `- ${value}`)]
        : []),
      "",
      "Risks or friction points:",
      ...grade.risks.map((value) => `- ${value}`)
    ]
      .filter(Boolean)
      .join("\n");

    const userContent = [
      "# User Profile",
      "",
      "## Raw profile",
      "```json",
      JSON.stringify(user, null, 2),
      "```",
      "",
      "## Scores",
      `- overallScore: ${grade.overallScore}`,
      `- personalScore: ${grade.personalScore}`,
      `- socialScore: ${grade.socialScore}`,
      `- professionalScore: ${grade.professionalScore}`,
      "",
      "## Interests",
      ...grade.interests.map((interest) => `- ${interest}`),
      githubInsight ? "" : null,
      githubInsight ? "## GitHub enrichment" : null,
      githubInsight ? `- username: ${githubInsight.username}` : null,
      githubInsight ? `- summary: ${githubInsight.summary}` : null,
      ...(githubInsight?.strengthSignals ?? []).map((signal) => `- strengthSignal: ${signal}`),
      ...(githubInsight?.interestSignals ?? []).map((signal) => `- interestSignal: ${signal}`),
      ...(githubInsight?.languageBreakdown.length
        ? ["", "## GitHub languages", ...githubInsight.languageBreakdown.map((item) => `- ${item.language}`)]
        : []),
      ...(githubInsight?.topicBreakdown.length
        ? ["", "## GitHub topics", ...githubInsight.topicBreakdown.map((item) => `- ${item.topic}`)]
        : [])
    ]
      .filter(Boolean)
      .join("\n");

    const agentsContent = [
      `# ${agentId}`,
      "",
      "This agent represents a real user and must speak in first person, as that person.",
      "Never narrate the user from the outside. Do not say things like 'Roman would...' or 'Roman thinks...'.",
      "Respond as 'I', with the user's own point of view, tradeoffs, preferences, and doubts.",
      "Never wrap replies with meta text such as 'Your message has been sent', 'He replied', 'She said', or quoted dialogue labels.",
      "Output only the direct message content the person would say.",
      "Maintain coherence with SOUL.md, IDENTITY.md, and USER.md.",
      "Never invent character traits opposite to evaluated scores and traits.",
      "You are allowed to disagree, debate ideas, lose interest, or decide there is no compatibility.",
      githubInsight ? "Use the GitHub context as real evidence about technical depth, stack, and builder habits." : null,
      "",
      "Main interests:",
      ...grade.interests.map((interest) => `- ${interest}`),
      ...(githubInsight?.languageBreakdown.length
        ? ["", "Observed technical stack:", ...githubInsight.languageBreakdown.map((item) => `- ${item.language}`)]
        : [])
    ]
      .filter(Boolean)
      .join("\n");

    const githubContent = githubInsight
      ? [
          "# GitHub Context",
          "",
          `Profile: ${githubInsight.profileUrl}`,
          `Username: ${githubInsight.username}`,
          "",
          "Headline:",
          githubInsight.headline,
          "",
          "Summary:",
          githubInsight.summary,
          "",
          "Languages:",
          ...githubInsight.languageBreakdown.map((item) => `- ${item.language}`),
          "",
          "Topics:",
          ...githubInsight.topicBreakdown.map((item) => `- ${item.topic}`),
          "",
          "Strength signals:",
          ...githubInsight.strengthSignals.map((item) => `- ${item}`),
          "",
          "Collaboration signals:",
          ...githubInsight.collaborationSignals.map((item) => `- ${item}`)
        ].join("\n")
      : "";

    await this.runtime.updateFiles(agentId, {
      "IDENTITY.md": identityContent,
      "SOUL.md": soulContent,
      "USER.md": userContent,
      "AGENTS.md": agentsContent,
      ...(githubContent ? { "GITHUB.md": githubContent } : {})
    });
  }

  private extractAgentRole(user: UserProfile): string | null {
    const role = user.professional?.role;
    return typeof role === "string" ? role : null;
  }

  private async maybeEnrichGithubProfile(user: UserProfile) {
    const githubUrl =
      typeof user.githubUrl === "string"
        ? user.githubUrl
        : typeof user.extra?.githubUrl === "string"
          ? user.extra.githubUrl
          : null;

    if (!githubUrl || !this.githubProfileService) {
      return null;
    }

    logger.info("Enriching profile with GitHub data", { githubUrl });
    return await this.githubProfileService.enrichFromUrl(githubUrl);
  }

  private mergeGithubInsightIntoUser(user: UserProfile, githubInsight?: GithubProfileInsight | null): UserProfile {
    if (!githubInsight) {
      return user;
    }

    const derivedStack = [
      ...githubInsight.languageBreakdown.map((item) => item.language),
      ...githubInsight.topicBreakdown.map((item) => item.topic)
    ].slice(0, 12);

    return {
      ...user,
      professional: {
        ...user.professional,
        githubSummary: githubInsight.summary,
        githubHeadline: githubInsight.headline,
        githubStack: derivedStack,
        githubStrengthSignals: githubInsight.strengthSignals
      },
      extra: {
        ...user.extra,
        githubUrl: githubInsight.profileUrl,
        githubProfile: {
          username: githubInsight.username,
          headline: githubInsight.headline,
          summary: githubInsight.summary,
          strengthSignals: githubInsight.strengthSignals,
          interestSignals: githubInsight.interestSignals,
          collaborationSignals: githubInsight.collaborationSignals,
          languageBreakdown: githubInsight.languageBreakdown,
          topicBreakdown: githubInsight.topicBreakdown,
          derivedStack
        }
      }
    };
  }

  private sanitizeAgentUtterance(text: string): string {
    let cleaned = text.trim();

    cleaned = cleaned.replace(
      /^tu mensaje ha sido enviado a [^.]+?\.\s*(él|ella) respondió:\s*/i,
      ""
    );
    cleaned = cleaned.replace(/^(él|ella) respondió:\s*/i, "");
    cleaned = cleaned.replace(/^respuesta:\s*/i, "");
    cleaned = cleaned.replace(/^mensaje:\s*/i, "");

    const quotedMatch = cleaned.match(/^["“](.*)["”]$/s);
    if (quotedMatch) {
      cleaned = quotedMatch[1].trim();
    }

    return cleaned;
  }
}
