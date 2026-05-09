'use client'

import { useEffect, useMemo, useState } from 'react'
import AppNav from '@/components/layout/AppNav'
import { Bot, ChevronRight, History } from 'lucide-react'
import { api } from '@/lib/api'
import { getAgentSession } from '@/lib/agent-session'
import type { AgentSession } from '@/lib/agent-session'
import type { ConversationResponse, StoredConversation } from '@/types/api'

export default function ArenaPage() {
  const [session, setSession] = useState<AgentSession | null>(null)
  const [agents, setAgents] = useState<Array<{ id: string }>>([])
  const [selectedAgent, setSelectedAgent] = useState('')
  const [openingMessage, setOpeningMessage] = useState('Quiero que conversen como dos personas reales y recorran al menos tres temas personales antes de decidir si hay conexión genuina.')
  const [result, setResult] = useState<ConversationResponse | null>(null)
  const [savedConversations, setSavedConversations] = useState<StoredConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const activeSession = getAgentSession()
      if (!activeSession) {
        setLoading(false)
        return
      }

      setSession(activeSession)

      try {
        const [response, conversationsResponse] = await Promise.all([
          api.listAgents(),
          api.listConversations(),
        ])
        const availableAgents = response.agents.filter(
          (agent) => !['main', 'grader', 'judge', activeSession.activeAgentId].includes(agent.id)
        )

        setAgents(availableAgents)
        setSelectedAgent(availableAgents[0]?.id || '')
        setSavedConversations(conversationsResponse.conversations)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No pudimos cargar los agentes.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const liveScore = result?.compatibility.score || 0
  const transcript = result?.transcript || []
  const counterpartLabel = useMemo(() => selectedAgent || 'Otro agente', [selectedAgent])

  const handleRun = async () => {
    if (!session || !selectedAgent) return

    setRunning(true)
    setError('')

    try {
      const conversation = await api.runConversation({
        agentA: session.activeAgentId,
        agentB: selectedAgent,
        openingMessage,
        turnsPerAgent: 1,
        maxRounds: 3,
        thinking: 'minimal',
      })

      setResult(conversation)
      const conversationsResponse = await api.listConversations()
      setSavedConversations(conversationsResponse.conversations)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos correr la conversación.')
    } finally {
      setRunning(false)
    }
  }

  const handleOpenSavedConversation = async (conversationId: string) => {
    setHistoryLoading(true)
    setError('')

    try {
      const response = await api.getConversation(conversationId)
      const saved = response.conversation
      setResult({
        conversationId: saved.id,
        agentA: saved.agent_a_id,
        agentB: saved.agent_b_id,
        turnsPerAgent: saved.turns_per_agent,
        maxRounds: saved.max_rounds,
        judgeAgentId: saved.judge_agent_id,
        compatibility: saved.compatibility,
        transcript: saved.transcript,
      })
      setSelectedAgent(saved.agent_b_id)
      setOpeningMessage(saved.opening_message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos abrir la conversación guardada.')
    } finally {
      setHistoryLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-ink-950 text-white flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="font-serif text-4xl mb-3">No hay agente activo.</h1>
          <p className="text-zinc-400">Completá un onboarding antes de usar la arena.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <AppNav maxWidth="max-w-7xl" />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-xs font-mono text-zinc-500 mb-3 tracking-wider uppercase">Simulation Arena</p>
          <h1 className="font-serif text-4xl sm:text-5xl mb-3">Tu agente conversa por vos.</h1>
          <p className="text-zinc-400 max-w-2xl">
            Esta pantalla está conectada a `GET /agents` y `POST /conversations/run`.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-5 mb-6 grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
          <div>
            <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2">Tu agente</label>
            <div className="px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm">
              {session.activeAgentId}
            </div>
          </div>
          <div>
            <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2">Otro agente</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white"
            >
              {agents.length === 0 && <option value="">No hay otros agentes disponibles</option>}
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.id}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleRun}
            disabled={running || !selectedAgent}
            className="px-6 py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 self-end"
          >
            {running ? 'Corriendo...' : 'Correr conversación'}
          </button>
          <div className="lg:col-span-3">
            <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2">Opening message</label>
            <textarea
              value={openingMessage}
              onChange={(e) => setOpeningMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white placeholder:text-zinc-600 resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/[0.06] p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr_1fr] gap-4 min-h-[500px]">
          <AgentPanel name={`Agent · ${session.activeAgentName}`} tagline={session.activeAgentId} accent="#a78bfa" align="left" />

          <div className="glass-panel rounded-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Conversation</span>
              <span className="text-[10px] font-mono text-zinc-600">
                {transcript.length ? `${transcript.length} mensajes` : 'sin ejecución'}
              </span>
            </div>
            <div className="flex-1 px-5 py-4 flex flex-col gap-3 overflow-y-auto min-h-[380px]">
              {transcript.length === 0 ? (
                <div className="text-sm text-zinc-500">Corré una conversación para ver el transcript real del backend.</div>
              ) : (
                transcript.map((message, index) => (
                  <div
                    key={`${message.speaker}-${index}`}
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                      message.speaker === session.activeAgentId
                        ? 'self-start bg-white/[0.03] border border-white/5 text-zinc-200'
                        : 'self-end bg-white/[0.06] border border-white/10 text-white'
                    }`}
                  >
                    <div className="text-[10px] font-mono mb-1 opacity-50">
                      {message.speaker}
                    </div>
                    {message.text}
                  </div>
                ))
              )}
            </div>
            <div className="px-5 py-3 border-t border-white/5 flex items-center gap-2 text-xs text-zinc-500">
              <span className={`w-1.5 h-1.5 rounded-full ${running ? 'bg-purple-400 animate-pulse' : 'bg-zinc-600'}`} />
              <span className="font-mono">{running ? 'processing conversation…' : 'idle'}</span>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 flex flex-col min-h-[400px]">
            <div className="flex items-center gap-2 text-zinc-400 mb-4">
              <History size={14} />
              <span className="text-[10px] font-mono uppercase tracking-wider">Conversation Dashboard</span>
            </div>
            <p className="text-xs text-zinc-500 mb-4">
              Historial persistente de esta cuenta de Google.
            </p>
            <div className="flex-1 overflow-y-auto space-y-3">
              {historyLoading && (
                <div className="text-xs text-zinc-500">Cargando conversación...</div>
              )}
              {savedConversations.length === 0 ? (
                <div className="text-sm text-zinc-500">Todavía no hay conversaciones guardadas.</div>
              ) : (
                savedConversations.map((conversation) => {
                  const active = conversation.id === result?.conversationId
                  const counterpart = conversation.agent_a_id === session.activeAgentId
                    ? conversation.agent_b_id
                    : conversation.agent_a_id

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => handleOpenSavedConversation(conversation.id)}
                      className={`w-full text-left rounded-xl border p-3 transition-colors ${
                        active
                          ? 'border-white/20 bg-white/[0.06]'
                          : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="text-sm text-white">{counterpart}</p>
                          <p className="text-[10px] font-mono text-zinc-500">
                            {new Date(conversation.created_at).toLocaleString()}
                          </p>
                        </div>
                        <span className="text-xs text-zinc-300">
                          {Math.round(conversation.compatibility.score * 100)}%
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-3">
                        {conversation.compatibility.summary || conversation.transcript_preview}
                      </p>
                    </button>
                  )
                })
              )}
            </div>
            <div className="pt-4 border-t border-white/5 mt-4">
              <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 mb-2">
                Agente seleccionado
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {counterpartLabel}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 glass-panel rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">Compatibility score</p>
            <p className="font-serif text-4xl text-white">
              {liveScore.toFixed(2)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">
              {result?.compatibility.summary || 'Esperando conversación'}
            </span>
            <ChevronRight size={14} className="text-zinc-600" />
          </div>
        </div>
      </main>
    </div>
  )
}

function AgentPanel({
  name,
  tagline,
  accent,
  align,
}: {
  name: string
  tagline: string
  accent: string
  align: 'left' | 'right'
}) {
  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[400px]">
      <div className="relative mb-6">
        <div
          className="w-24 h-24 rounded-full"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${accent}, transparent 70%)`,
            filter: 'blur(2px)',
          }}
        />
        <div
          className="absolute inset-0 m-auto w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: `${accent}20`,
            border: `1px solid ${accent}40`,
          }}
        >
          <Bot size={20} style={{ color: accent }} />
        </div>
      </div>
      <p className="font-serif text-lg text-white mb-1">{name}</p>
      <p className="text-xs text-zinc-500 font-mono mb-6">{tagline}</p>
      <div className="w-full pt-4 border-t border-white/5 text-left">
        <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 mb-2">
          {align === 'left' ? 'Agent slot A' : 'Agent slot B'}
        </p>
        <p className="text-xs text-zinc-400 leading-relaxed">
          {align === 'left'
            ? 'Este panel representa al agente persistido en localStorage.'
            : 'Este panel representa el agente elegido desde el backend.'}
        </p>
      </div>
    </div>
  )
}
