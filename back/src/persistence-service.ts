import type { JudgeDecision, TranscriptMessage, UserProfile, GraderProfile } from "./types.js";
import { createSupabaseUserClient } from "./supabase.js";

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

    return data ?? [];
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
}
