import type {
  AgentIdentitiesResponse,
  AgentFilesResponse,
  AgentListResponse,
  DashboardAnalyticsResponse,
  ConversationDetailResponse,
  ConversationsListResponse,
  ConversationRequest,
  ConversationResponse,
  CreateAgentResponse,
  MatchmakeRequest,
  MatchmakeResponse,
  UserProfilePayload,
} from '@/types/api'
import { supabase } from '@/lib/supabase'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000'

class ApiClient {
  private async getAuthToken() {
    if (typeof window !== 'undefined') {
      const localToken = window.localStorage.getItem('auth_token')
      if (localToken) return localToken
    }

    const { data } = await supabase.auth.getSession()
    return data.session?.access_token || null
  }

  private async request<T>(endpoint: string, options?: RequestInit, includeAuth = true): Promise<T> {
    const token = includeAuth ? await this.getAuthToken() : null
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers || {}),
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`)
    }

    return data as T
  }

  async health() {
    return this.request<{ ok: boolean; runtimeUrl: string }>('/health', undefined, false)
  }

  async listAgents() {
    return this.request<AgentListResponse>('/agents')
  }

  async getAgentFiles(agentId: string) {
    return this.request<AgentFilesResponse>(`/agents/${agentId}/files`)
  }

  async listAgentIdentities() {
    return this.request<AgentIdentitiesResponse>('/agent-identities')
  }

  async createAgent(user: UserProfilePayload) {
    return this.request<CreateAgentResponse>('/agents', {
      method: 'POST',
      body: JSON.stringify({ user }),
    })
  }

  async runConversation(payload: ConversationRequest) {
    return this.request<ConversationResponse>('/conversations/run', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async runMatchmake(agentId: string, payload: MatchmakeRequest) {
    return this.request<MatchmakeResponse>(`/agents/${agentId}/matchmake`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async listConversations(agentId?: string) {
    const query = agentId ? `?agentId=${encodeURIComponent(agentId)}` : ''
    return this.request<ConversationsListResponse>(`/conversations${query}`)
  }

  async getConversation(conversationId: string) {
    return this.request<ConversationDetailResponse>(`/conversations/${conversationId}`)
  }

  async getDashboardAnalytics(agentId?: string) {
    const query = agentId ? `?agentId=${encodeURIComponent(agentId)}` : ''
    return this.request<DashboardAnalyticsResponse>(`/dashboard/analytics${query}`)
  }
}

export const api = new ApiClient()
