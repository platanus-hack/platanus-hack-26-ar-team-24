import type { AgentRole, GradingProfile } from '@/types/api'

export interface AgentSession {
  activeAgentId: string
  activeAgentName: string
  role: AgentRole
  grading?: GradingProfile
}

const STORAGE_KEY = 'activeAgentSession'

function notifyAgentSessionChange() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event('agent-session-change'))
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
  notifyAgentSessionChange()
}

export function clearAgentSession() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
  window.localStorage.removeItem('activeAgentId')
  notifyAgentSessionChange()
}
