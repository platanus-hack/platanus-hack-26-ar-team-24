import type { AgentRole, GradingProfile } from '@/types/api'

export interface AgentSession {
  activeAgentId: string
  activeAgentName: string
  role: AgentRole
  grading?: GradingProfile
}

const STORAGE_KEY = 'activeAgentSession'
const LAST_AGENT_KEY_PREFIX = 'lastActiveAgentId:'

function notifyAgentSessionChange() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event('agent-session-change'))
}

function getLastAgentKey(userId: string) {
  return `${LAST_AGENT_KEY_PREFIX}${userId}`
}

export function getAgentSession(): AgentSession | null {
  if (typeof window === 'undefined') return null

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AgentSession
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function setAgentSession(session: AgentSession) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  window.localStorage.setItem('activeAgentId', session.activeAgentId)
  const userId = window.localStorage.getItem('user_id')
  if (userId) {
    window.localStorage.setItem(getLastAgentKey(userId), session.activeAgentId)
  }
  notifyAgentSessionChange()
}

export function clearAgentSession() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
  window.localStorage.removeItem('activeAgentId')
  notifyAgentSessionChange()
}

export async function restoreAgentSession(userId: string): Promise<AgentSession | null> {
  if (typeof window === 'undefined') return null

  const current = getAgentSession()
  if (current) {
    window.localStorage.setItem(getLastAgentKey(userId), current.activeAgentId)
    return current
  }

  const { api } = await import('@/lib/api')
  const response = await api.listAgentIdentities()
  if (response.agents.length === 0) {
    return null
  }

  const preferredAgentId = window.localStorage.getItem(getLastAgentKey(userId))
  const selected =
    response.agents.find((agent) => agent.agent_id === preferredAgentId) ||
    response.agents[0]

  const session: AgentSession = {
    activeAgentId: selected.agent_id,
    activeAgentName: selected.agent_name,
    role: selected.agent_role === 'founder' ? 'founder' : 'talent',
    grading: selected.grading_profile || undefined,
  }

  setAgentSession(session)
  return session
}
