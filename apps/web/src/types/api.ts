export type ThinkingLevel = 'off' | 'minimal' | 'low' | 'medium' | 'high'

export type AgentRole = 'talent' | 'founder'

export interface AgentListResponse {
  agents: Array<{ id: string }>
}

export interface UserProfilePayload {
  name: string
  age?: string | number
  location?: string
  bio?: string
  personal?: Record<string, unknown>
  social?: Record<string, unknown>
  professional?: Record<string, unknown>
  extra?: Record<string, unknown>
}

export interface GradingProfile {
  overallScore: number
  personalScore: number
  socialScore: number
  professionalScore: number
  summary: string
  personalitySummary: string
  strengths: string[]
  risks: string[]
  interests: string[]
  conversationStyle: string
  values: string[]
}

export interface CreateAgentResponse {
  agent: {
    id: string
  }
  grading: GradingProfile
}

export interface AgentFilesResponse {
  agentId: string
  workspace: string
  files: Record<string, string>
}

export interface ConversationRequest {
  agentA: string
  agentB: string
  openingMessage: string
  turnsPerAgent?: number
  maxRounds?: number
  thinking?: ThinkingLevel
}

export interface TranscriptMessage {
  speaker: string
  text: string
  round: number
  turn: number
}

export interface CompatibilityDecision {
  done: boolean
  score: number
  outcome: 'match' | 'no_match' | 'continue'
  summary: string
  sharedInterests: string[]
  reasons: string[]
}

export interface ConversationResponse {
  conversationId: string
  agentA: string
  agentB: string
  turnsPerAgent: number
  maxRounds: number
  judgeAgentId: string
  compatibility: CompatibilityDecision
  transcript: TranscriptMessage[]
}

export interface StoredConversation {
  id: string
  owner_user_id: string
  agent_a_id: string
  agent_b_id: string
  judge_agent_id: string
  opening_message: string
  turns_per_agent: number
  max_rounds: number
  status: 'match' | 'no_match' | 'continue'
  compatibility: CompatibilityDecision
  transcript: TranscriptMessage[]
  transcript_preview: string
  created_at: string
  updated_at: string
}

export interface ConversationsListResponse {
  conversations: StoredConversation[]
}

export interface ConversationDetailResponse {
  conversation: StoredConversation
}

export interface MatchmakeRequest {
  purpose: string
  turnsPerAgent?: number
  maxRounds?: number
  thinking?: ThinkingLevel
  limit?: number
  minScore?: number
}

export interface MatchmakeResult {
  candidateId: string
  conversationId: string
  compatibility: CompatibilityDecision
  transcript: TranscriptMessage[]
}

export interface MatchmakeResponse {
  agentId: string
  purpose: string
  evaluatedCandidates: number
  returnedMatches: number
  matches: MatchmakeResult[]
  failures: Array<{
    candidateId: string
    error: string
  }>
}
