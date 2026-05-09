import { randomUUID } from "node:crypto";
import type {
  ConversationConfig,
  GraderProfile,
  JudgeDecision,
  TranscriptMessage,
  UserProfile
} from "./types.js";
import { graderProfileSchema, judgeDecisionSchema } from "./types.js";
import { RuntimeClient } from "./runtime-client.js";
import { logger } from "./logger.js";

export class CompatibilityService {
  constructor(
    private runtime: RuntimeClient,
    private graderAgentId: string,
    private judgeAgentId: string
  ) {}

  async createProfiledAgent(agentId: string, user: UserProfile): Promise<GraderProfile> {
    logger.info("Creating profiled agent", { agentId, userName: user.name });

    await this.runtime.ensureAgentExists(this.graderAgentId);
    await this.runtime.createAgent(agentId);

    logger.debug("Evaluating user profile", { agentId });
    const grade = await this.evaluateProfile(agentId, user);

    logger.debug("Writing agent profile files", { agentId, overallScore: grade.overallScore });
    await this.writeAgentProfileFiles(agentId, user, grade);

    logger.info("Profiled agent created successfully", { agentId, overallScore: grade.overallScore });
    return grade;
  }

  async runConversation(config: ConversationConfig) {
    if (config.agentA === config.agentB) {
      throw new Error("agentA and agentB must be different");
    }

    const conversationId = randomUUID();
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
      [config.agentA]: `conversation-${conversationId}-${config.agentA}`,
      [config.agentB]: `conversation-${conversationId}-${config.agentB}`
    };

    let currentPrompt = config.openingMessage;
    let finalDecision: JudgeDecision | null = null;

    for (let round = 1; round <= config.maxRounds; round += 1) {
      logger.debug("Running conversation round", { conversationId, round });
      let currentSpeaker = config.agentA;
      let otherSpeaker = config.agentB;

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
          globalTurnNumber: transcript.length + 1
        });

        const text = await this.runtime.sendMessage({
          agentId: currentSpeaker,
          message: turnInstruction,
          thinking: config.thinking,
          sessionId: sessionIds[currentSpeaker]
        });

        transcript.push({
          speaker: currentSpeaker,
          text,
          round,
          turn: turnIndex + 1
        });

        currentPrompt = text;
        [currentSpeaker, otherSpeaker] = [otherSpeaker, currentSpeaker];
      }

      finalDecision = await this.evaluateConversation({
        conversationId,
        agentA: config.agentA,
        agentB: config.agentB,
        currentRound: round,
        maxRounds: config.maxRounds,
        transcript,
        thinking: config.thinking
      });

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

      if (round < config.maxRounds) {
        currentPrompt = [
          "Continúen la charla desde donde quedó.",
          `Última evaluación del juez: ${finalDecision.summary}`,
          "No reinicien la conversación, no vuelvan a saludar y no se re-presenten.",
          "Profundicen en intereses compartidos o aclaren diferencias, pero mantengan la conversación natural."
        ].join("\n\n");
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

    return {
      conversationId,
      agentA: config.agentA,
      agentB: config.agentB,
      turnsPerAgent: config.turnsPerAgent,
      maxRounds: config.maxRounds,
      judgeAgentId: this.judgeAgentId,
      compatibility: finalDecision,
      transcript
    };
  }

  private async evaluateProfile(agentId: string, user: UserProfile): Promise<GraderProfile> {
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
      "Datos del usuario:",
      JSON.stringify(user, null, 2)
    ].join("\n\n");

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
      "- MATCH (0.65+): Interés mutuo genuino, valores alineados, podrían trabajar juntos",
      "- NO_MATCH (≤0.4): Valores opuestos, desinterés, incompatibilidad clara",
      "- CONTINUE (0.4-0.65): Incierto, necesita más datos",
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
  }): string {
    if (args.globalTurnNumber === 1 && args.openingMessage) {
      return [
        `Estás conversando con ${args.listener}. Sé auténtico, responde con tu criterio genuino.`,
        "",
        `${args.openingMessage}`,
        "",
        "IMPORTANTE: Responde BREVE. 1-2 oraciones máximo. Nada de párrafos largos."
      ].join("\n\n");
    }

    return [
      `${args.priorMessage}`,
      "",
      "IMPORTANTE: Responde BREVE. 1-2 oraciones máximo. Mantén la conversación natural y fluida, no filosófica."
    ].join("\n\n");
  }

  private async writeAgentProfileFiles(
    agentId: string,
    user: UserProfile,
    grade: GraderProfile
  ) {
    const identityContent = [
      "# Identity",
      "",
      `Agent id: \`${agentId}\``,
      user.name ? `Name represented: ${user.name}` : null,
      user.age ? `Age: ${user.age}` : null,
      user.location ? `Location: ${user.location}` : null,
      "",
      "Summary:",
      grade.summary
    ]
      .filter(Boolean)
      .join("\n");

    const soulContent = [
      `# ${agentId} Persona`,
      "",
      grade.personalitySummary,
      "",
      `Conversation style: ${grade.conversationStyle}`,
      "",
      "Values:",
      ...grade.values.map((value) => `- ${value}`),
      "",
      "Strengths:",
      ...grade.strengths.map((value) => `- ${value}`),
      "",
      "Risks or friction points:",
      ...grade.risks.map((value) => `- ${value}`)
    ].join("\n");

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
      ...grade.interests.map((interest) => `- ${interest}`)
    ].join("\n");

    const agentsContent = [
      `# ${agentId}`,
      "",
      "This agent represents a real user and responds following their profile.",
      "Maintain coherence with SOUL.md, IDENTITY.md, and USER.md.",
      "Never invent character traits opposite to evaluated scores and traits.",
      "",
      "Main interests:",
      ...grade.interests.map((interest) => `- ${interest}`)
    ].join("\n");

    await this.runtime.updateFiles(agentId, {
      "IDENTITY.md": identityContent,
      "SOUL.md": soulContent,
      "USER.md": userContent,
      "AGENTS.md": agentsContent
    });
  }
}
