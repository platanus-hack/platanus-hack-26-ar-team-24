export type ThinkingLevel = 'off' | 'minimal' | 'low' | 'medium' | 'high'

export type AgentRole = 'talent' | 'founder'

export interface AgentListResponse {
  agents: Array<{ id: string }>
}

export interface AgentIdentity {
  agent_id: string
  agent_name: string
  agent_role: AgentRole | null
  grading_profile?: GradingProfile | null
  updated_at?: string
}

export interface AgentIdentitiesResponse {
  agents: AgentIdentity[]
}

export interface UserProfilePayload {
  name: string
  age?: string | number
  location?: string
  githubUrl?: string
  linkedinUrl?: string
  xUrl?: string
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

export interface DashboardSignal {
  label: string
  count: number
}

export interface DashboardAnalytics {
  agentId: string | null
  summary: {
    totalSimulations: number
    matchRate: number
    averageScore: number
    compatibleCount: number
    incompatibleCount: number
    undecidedCount: number
    conversationsThisWeek: number
    recentMatchDelta: number
    averageMessages: number
    averageRounds: number
    thresholdScore: number
  }
  trend: Array<{
    date: string
    score: number
    matches: number
    total: number
  }>
  scoreBands: {
    high: number
    medium: number
    low: number
  }
  recentConversations: Array<{
    id: string
    counterpartId: string
    counterpartLabel: string
    counterpartRole: string | null
    score: number
    outcome: 'match' | 'no_match' | 'continue'
    summary: string
    sharedInterests: string[]
    reasons: string[]
    createdAt: string
    transcriptCount: number
  }>
  topConnections: Array<{
    counterpartId: string
    counterpartLabel: string
    counterpartRole: string | null
    averageScore: number
    matchRate: number
    conversations: number
    matches: number
    lastConversationAt: string
    strongestSummary: string
  }>
  sharedInterestSignals: DashboardSignal[]
  incompatibilitySignals: DashboardSignal[]
  insights: Array<{
    kind: 'pattern' | 'warning' | 'calibration'
    title: string
    body: string
  }>
}

export interface DashboardAnalyticsResponse {
  analytics: DashboardAnalytics
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
  candidateProfile?: {
    name: string
    role?: string | null
    githubUrl?: string
    linkedinUrl?: string
    xUrl?: string
  }
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
