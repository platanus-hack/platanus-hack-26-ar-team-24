import type { JudgeDecision, TranscriptMessage, UserProfile, GraderProfile } from "./types.js";
import { createSupabaseUserClient } from "./supabase.js";

type StoredConversationRow = {
  id: string;
  owner_user_id: string;
  agent_a_id: string;
  agent_b_id: string;
  judge_agent_id: string;
  opening_message: string;
  turns_per_agent: number;
  max_rounds: number;
  status: "match" | "no_match" | "continue";
  compatibility: JudgeDecision;
  transcript: TranscriptMessage[];
  transcript_preview: string;
  created_at: string;
  updated_at: string;
};

type AgentIdentityRow = {
  agent_id: string;
  agent_name: string;
  agent_role: string | null;
  source_profile?: UserProfile | null;
};

type DashboardSignal = {
  label: string;
  count: number;
};

export type DashboardAnalytics = {
  agentId: string | null;
  summary: {
    totalSimulations: number;
    matchRate: number;
    averageScore: number;
    compatibleCount: number;
    incompatibleCount: number;
    undecidedCount: number;
    conversationsThisWeek: number;
    recentMatchDelta: number;
    averageMessages: number;
    averageRounds: number;
    thresholdScore: number;
  };
  trend: Array<{
    date: string;
    score: number;
    matches: number;
    total: number;
  }>;
  scoreBands: {
    high: number;
    medium: number;
    low: number;
  };
  recentConversations: Array<{
    id: string;
    counterpartId: string;
    counterpartLabel: string;
    counterpartRole: string | null;
    score: number;
    outcome: "match" | "no_match" | "continue";
    summary: string;
    sharedInterests: string[];
    reasons: string[];
    createdAt: string;
    transcriptCount: number;
  }>;
  topConnections: Array<{
    counterpartId: string;
    counterpartLabel: string;
    counterpartRole: string | null;
    averageScore: number;
    matchRate: number;
    conversations: number;
    matches: number;
    lastConversationAt: string;
    strongestSummary: string;
  }>;
  sharedInterestSignals: DashboardSignal[];
  incompatibilitySignals: DashboardSignal[];
  insights: Array<{
    kind: "pattern" | "warning" | "calibration";
    title: string;
    body: string;
  }>;
};

type PersistedConversationInput = {
  conversationId: string;
  ownerUserId: string;
  ownerAccessToken: string;
  agentA: string;
  agentB: string;
  judgeAgentId: string;
  openingMessage: string;
  turnsPerAgent: number;
  maxRounds: number;
  compatibility: JudgeDecision;
  transcript: TranscriptMessage[];
};

export class PersistenceService {
  async upsertAgentIdentity(args: {
    ownerUserId: string;
    ownerAccessToken: string;
    agentId: string;
    agentName: string;
    role: string | null;
    profile: UserProfile;
    grading: GraderProfile;
  }) {
    const client = createSupabaseUserClient(args.ownerAccessToken);
    const { error } = await client.from("agent_identities").upsert(
      {
        user_id: args.ownerUserId,
        agent_id: args.agentId,
        agent_name: args.agentName,
        agent_role: args.role,
        source_profile: args.profile,
        grading_profile: args.grading
      },
      { onConflict: "agent_id" }
    );

    if (error) {
      throw new Error(`Failed to persist agent identity: ${error.message}`);
    }
  }

  async saveConversation(args: PersistedConversationInput) {
    const client = createSupabaseUserClient(args.ownerAccessToken);
    const transcriptPreview = args.transcript
      .slice(0, 2)
      .map((message) => `${message.speaker}: ${message.text}`)
      .join(" ");

    const { error: conversationError } = await client.from("conversations").upsert(
      {
        id: args.conversationId,
        owner_user_id: args.ownerUserId,
        agent_a_id: args.agentA,
        agent_b_id: args.agentB,
        judge_agent_id: args.judgeAgentId,
        opening_message: args.openingMessage,
        turns_per_agent: args.turnsPerAgent,
        max_rounds: args.maxRounds,
        compatibility: args.compatibility,
        transcript: args.transcript,
        transcript_preview: transcriptPreview,
        status: args.compatibility.outcome
      },
      { onConflict: "id" }
    );

    if (conversationError) {
      throw new Error(`Failed to persist conversation: ${conversationError.message}`);
    }

    const { error: deleteMessagesError } = await client
      .from("conversation_messages")
      .delete()
      .eq("conversation_id", args.conversationId);

    if (deleteMessagesError) {
      throw new Error(`Failed to refresh conversation messages: ${deleteMessagesError.message}`);
    }

    if (args.transcript.length > 0) {
      const { error: messagesError } = await client.from("conversation_messages").insert(
        args.transcript.map((message, index) => ({
          conversation_id: args.conversationId,
          owner_user_id: args.ownerUserId,
          speaker_agent_id: message.speaker,
          body: message.text,
          round: message.round,
          turn: message.turn,
          message_index: index
        }))
      );

      if (messagesError) {
        throw new Error(`Failed to persist conversation messages: ${messagesError.message}`);
      }
    }
  }

  async listConversations(ownerUserId: string, ownerAccessToken: string) {
    const client = createSupabaseUserClient(ownerAccessToken);
    const { data, error } = await client
      .from("conversations")
      .select("*")
      .eq("owner_user_id", ownerUserId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to list conversations: ${error.message}`);
    }

    return (data ?? []) as StoredConversationRow[];
  }

  async getConversation(ownerUserId: string, ownerAccessToken: string, conversationId: string) {
    const client = createSupabaseUserClient(ownerAccessToken);
    const { data, error } = await client
      .from("conversations")
      .select("*")
      .eq("owner_user_id", ownerUserId)
      .eq("id", conversationId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch conversation: ${error.message}`);
    }

    return data;
  }

  async getAgentIdentityMap(
    ownerUserId: string,
    ownerAccessToken: string,
    agentIds: string[]
  ) {
    if (agentIds.length === 0) {
      return new Map<string, AgentIdentityRow>();
    }

    const client = createSupabaseUserClient(ownerAccessToken);
    const { data, error } = await client
      .from("agent_identities")
      .select("agent_id, agent_name, agent_role, source_profile")
      .eq("user_id", ownerUserId)
      .in("agent_id", agentIds);

    if (error) {
      throw new Error(`Failed to fetch agent identities: ${error.message}`);
    }

    return new Map(
      ((data ?? []) as AgentIdentityRow[]).map((identity) => [identity.agent_id, identity] as const)
    );
  }

  async getDashboardAnalytics(
    ownerUserId: string,
    ownerAccessToken: string,
    agentId?: string
  ): Promise<DashboardAnalytics> {
    const client = createSupabaseUserClient(ownerAccessToken);
    let conversationsQuery = client
      .from("conversations")
      .select("*")
      .eq("owner_user_id", ownerUserId)
      .order("created_at", { ascending: false });

    if (agentId) {
      conversationsQuery = conversationsQuery.or(`agent_a_id.eq.${agentId},agent_b_id.eq.${agentId}`);
    }

    const [{ data: conversations, error: conversationsError }, { data: identities, error: identitiesError }] =
      await Promise.all([
        conversationsQuery,
        client
          .from("agent_identities")
          .select("agent_id, agent_name, agent_role")
          .eq("user_id", ownerUserId)
      ]);

    if (conversationsError) {
      throw new Error(`Failed to fetch dashboard analytics: ${conversationsError.message}`);
    }

    if (identitiesError) {
      throw new Error(`Failed to fetch agent identities: ${identitiesError.message}`);
    }

    return this.buildDashboardAnalytics(
      (conversations ?? []) as StoredConversationRow[],
      (identities ?? []) as AgentIdentityRow[],
      agentId ?? null
    );
  }

  private buildDashboardAnalytics(
    conversations: StoredConversationRow[],
    identities: AgentIdentityRow[],
    focusedAgentId: string | null
  ): DashboardAnalytics {
    const thresholdScore = 0.65;
    const today = new Date();
    const identityMap = new Map(
      identities.map((identity) => [identity.agent_id, identity] as const)
    );
    const totalSimulations = conversations.length;
    const compatibleCount = conversations.filter((conversation) => conversation.status === "match").length;
    const incompatibleCount = conversations.filter((conversation) => conversation.status === "no_match").length;
    const undecidedCount = totalSimulations - compatibleCount - incompatibleCount;
    const averageScore = totalSimulations
      ? conversations.reduce((sum, conversation) => sum + (conversation.compatibility?.score ?? 0), 0) /
        totalSimulations
      : 0;
    const averageMessages = totalSimulations
      ? conversations.reduce((sum, conversation) => sum + (conversation.transcript?.length ?? 0), 0) /
        totalSimulations
      : 0;
    const averageRounds = totalSimulations
      ? conversations.reduce((sum, conversation) => sum + this.getConversationRoundCount(conversation), 0) /
        totalSimulations
      : 0;

    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - 7);
    const previousWeekStart = new Date(today);
    previousWeekStart.setDate(today.getDate() - 14);

    const currentWeek = conversations.filter((conversation) => new Date(conversation.created_at) >= thisWeekStart);
    const previousWeek = conversations.filter((conversation) => {
      const createdAt = new Date(conversation.created_at);
      return createdAt >= previousWeekStart && createdAt < thisWeekStart;
    });

    const currentWeekMatchRate = currentWeek.length
      ? currentWeek.filter((conversation) => conversation.status === "match").length / currentWeek.length
      : 0;
    const previousWeekMatchRate = previousWeek.length
      ? previousWeek.filter((conversation) => conversation.status === "match").length / previousWeek.length
      : 0;

    const sharedInterestSignals = this.countSignals(
      conversations.flatMap((conversation) => conversation.compatibility?.sharedInterests ?? []),
      6
    );
    const incompatibilitySignals = this.countSignals(
      conversations
        .filter((conversation) => conversation.status === "no_match")
        .flatMap((conversation) => conversation.compatibility?.reasons ?? []),
      6
    );

    const trend = this.buildTrend(conversations, today);
    const scoreBands = {
      high: conversations.filter((conversation) => (conversation.compatibility?.score ?? 0) >= 0.8).length,
      medium: conversations.filter((conversation) => {
        const score = conversation.compatibility?.score ?? 0;
        return score >= thresholdScore && score < 0.8;
      }).length,
      low: conversations.filter((conversation) => (conversation.compatibility?.score ?? 0) < thresholdScore).length
    };

    const recentConversations = conversations.slice(0, 6).map((conversation) => {
      const counterpartId = this.getCounterpartId(conversation, focusedAgentId);
      const counterpartIdentity = identityMap.get(counterpartId);
      return {
        id: conversation.id,
        counterpartId,
        counterpartLabel: counterpartIdentity?.agent_name ?? this.formatAgentId(counterpartId),
        counterpartRole: counterpartIdentity?.agent_role ?? null,
        score: conversation.compatibility?.score ?? 0,
        outcome: conversation.status,
        summary: conversation.compatibility?.summary ?? "",
        sharedInterests: conversation.compatibility?.sharedInterests ?? [],
        reasons: conversation.compatibility?.reasons ?? [],
        createdAt: conversation.created_at,
        transcriptCount: conversation.transcript?.length ?? 0
      };
    });
    const topConnections = this.buildTopConnections(conversations, identityMap, focusedAgentId);

    const insights = this.buildInsights({
      totalSimulations,
      compatibleCount,
      incompatibleCount,
      averageScore,
      averageMessages,
      sharedInterestSignals,
      incompatibilitySignals,
      currentWeekMatchRate,
      previousWeekMatchRate
    });

    return {
      agentId: focusedAgentId,
      summary: {
        totalSimulations,
        matchRate: totalSimulations ? compatibleCount / totalSimulations : 0,
        averageScore,
        compatibleCount,
        incompatibleCount,
        undecidedCount,
        conversationsThisWeek: currentWeek.length,
        recentMatchDelta: currentWeekMatchRate - previousWeekMatchRate,
        averageMessages,
        averageRounds,
        thresholdScore
      },
      trend,
      scoreBands,
      recentConversations,
      topConnections,
      sharedInterestSignals,
      incompatibilitySignals,
      insights
    };
  }

  private buildTrend(conversations: StoredConversationRow[], today: Date) {
    const points: Array<{ date: string; score: number; matches: number; total: number }> = [];
    const dayMap = new Map<string, StoredConversationRow[]>();

    for (const conversation of conversations) {
      const dayKey = conversation.created_at.slice(0, 10);
      const current = dayMap.get(dayKey) ?? [];
      current.push(conversation);
      dayMap.set(dayKey, current);
    }

    let lastScore = 0;
    for (let offset = 13; offset >= 0; offset -= 1) {
      const day = new Date(today);
      day.setHours(0, 0, 0, 0);
      day.setDate(today.getDate() - offset);
      const key = day.toISOString().slice(0, 10);
      const dayConversations = dayMap.get(key) ?? [];
      const dayAverage = dayConversations.length
        ? dayConversations.reduce((sum, conversation) => sum + (conversation.compatibility?.score ?? 0), 0) /
          dayConversations.length
        : lastScore;

      if (dayConversations.length) {
        lastScore = dayAverage;
      }

      points.push({
        date: key,
        score: Number(dayAverage.toFixed(3)),
        matches: dayConversations.filter((conversation) => conversation.status === "match").length,
        total: dayConversations.length
      });
    }

    return points;
  }

  private buildInsights(args: {
    totalSimulations: number;
    compatibleCount: number;
    incompatibleCount: number;
    averageScore: number;
    averageMessages: number;
    sharedInterestSignals: DashboardSignal[];
    incompatibilitySignals: DashboardSignal[];
    currentWeekMatchRate: number;
    previousWeekMatchRate: number;
  }) {
    const topShared = args.sharedInterestSignals[0];
    const topFriction = args.incompatibilitySignals[0];
    const delta = args.currentWeekMatchRate - args.previousWeekMatchRate;

    return [
      {
        kind: "pattern" as const,
        title: "Patrón compatible",
        body: topShared
          ? `La señal más repetida es ${topShared.label}. Aparece en ${topShared.count} conversaciones con mejor compatibilidad.`
          : "Todavía faltan simulaciones para detectar un patrón de compatibilidad estable."
      },
      {
        kind: "warning" as const,
        title: "Fricción recurrente",
        body: topFriction
          ? `${topFriction.label} aparece como objeción en ${topFriction.count} conversaciones incompatibles. Conviene revisar ese eje en el perfil o en la estrategia de matching.`
          : "Todavía no hay suficientes incompatibilidades registradas para detectar una fricción repetida."
      },
      {
        kind: "calibration" as const,
        title: "Calibración operativa",
        body:
          args.totalSimulations === 0
            ? "Todavía no hay conversaciones guardadas. El dashboard se completa automáticamente a medida que corren simulaciones."
            : delta >= 0
              ? `El match rate de los últimos 7 días subió ${this.formatSignedPercent(delta)} y el score promedio está en ${this.formatScore(args.averageScore)}. Tus conversaciones están convergiendo.`
              : `El match rate reciente cayó ${this.formatSignedPercent(delta)} mientras el promedio de mensajes quedó en ${Math.round(args.averageMessages)}. Hay más charla, pero no mejor señal.`
      }
    ];
  }

  private buildTopConnections(
    conversations: StoredConversationRow[],
    identityMap: Map<string, AgentIdentityRow>,
    focusedAgentId: string | null
  ) {
    const groups = new Map<
      string,
      {
        counterpartId: string;
        scores: number[];
        matches: number;
        total: number;
        lastConversationAt: string;
        strongestSummary: string;
        strongestScore: number;
      }
    >();

    for (const conversation of conversations) {
      const counterpartId = this.getCounterpartId(conversation, focusedAgentId);
      const score = conversation.compatibility?.score ?? 0;
      const current = groups.get(counterpartId) ?? {
        counterpartId,
        scores: [],
        matches: 0,
        total: 0,
        lastConversationAt: conversation.created_at,
        strongestSummary: conversation.compatibility?.summary ?? "",
        strongestScore: score
      };

      current.scores.push(score);
      current.total += 1;
      current.matches += conversation.status === "match" ? 1 : 0;

      if (new Date(conversation.created_at) > new Date(current.lastConversationAt)) {
        current.lastConversationAt = conversation.created_at;
      }

      if (score >= current.strongestScore) {
        current.strongestScore = score;
        current.strongestSummary = conversation.compatibility?.summary ?? current.strongestSummary;
      }

      groups.set(counterpartId, current);
    }

    return [...groups.values()]
      .map((group) => {
        const counterpartIdentity = identityMap.get(group.counterpartId);
        const averageScore = group.total
          ? group.scores.reduce((sum, score) => sum + score, 0) / group.total
          : 0;

        return {
          counterpartId: group.counterpartId,
          counterpartLabel: counterpartIdentity?.agent_name ?? this.formatAgentId(group.counterpartId),
          counterpartRole: counterpartIdentity?.agent_role ?? null,
          averageScore: Number(averageScore.toFixed(3)),
          matchRate: group.total ? Number((group.matches / group.total).toFixed(3)) : 0,
          conversations: group.total,
          matches: group.matches,
          lastConversationAt: group.lastConversationAt,
          strongestSummary: group.strongestSummary
        };
      })
      .sort((left, right) => {
        if (right.averageScore !== left.averageScore) {
          return right.averageScore - left.averageScore;
        }

        if (right.matches !== left.matches) {
          return right.matches - left.matches;
        }

        return right.conversations - left.conversations;
      })
      .slice(0, 10);
  }

  private countSignals(values: string[], limit: number): DashboardSignal[] {
    const counts = new Map<string, number>();

    for (const rawValue of values) {
      const normalizedKey = this.normalizeSignal(rawValue);
      if (!normalizedKey) {
        continue;
      }

      counts.set(normalizedKey, (counts.get(normalizedKey) ?? 0) + 1);
    }

    return [...counts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, limit);
  }

  private normalizeSignal(value: string) {
    return value
      .replace(/\s+/g, " ")
      .replace(/[.:]+$/g, "")
      .trim()
      .toLowerCase();
  }

  private getConversationRoundCount(conversation: StoredConversationRow) {
    const rounds = new Set((conversation.transcript ?? []).map((message) => message.round));
    return rounds.size;
  }

  private getCounterpartId(conversation: StoredConversationRow, focusedAgentId: string | null) {
    if (!focusedAgentId) {
      return conversation.agent_b_id;
    }

    if (conversation.agent_a_id === focusedAgentId) {
      return conversation.agent_b_id;
    }

    if (conversation.agent_b_id === focusedAgentId) {
      return conversation.agent_a_id;
    }

    return conversation.agent_b_id;
  }

  private formatAgentId(agentId: string) {
    return agentId
      .replace(/-[a-f0-9]{6,}$/i, "")
      .split("-")
      .filter(Boolean)
      .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
      .join(" ");
  }

  private formatScore(score: number) {
    return score.toFixed(2);
  }

  private formatSignedPercent(delta: number) {
    const rounded = Math.round(delta * 100);
    return `${rounded >= 0 ? "+" : ""}${rounded}pp`;
  }
}
