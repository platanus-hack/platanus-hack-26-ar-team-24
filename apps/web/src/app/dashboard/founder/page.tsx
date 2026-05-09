'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { getAgentSession } from '@/lib/agent-session'
import type { AgentSession } from '@/lib/agent-session'
import type { MatchmakeResponse } from '@/types/api'

export default function FounderDashboard() {
  const router = useRouter()
  const [session, setSession] = useState<AgentSession | null>(null)
  const [matching, setMatching] = useState<MatchmakeResponse | null>(null)
  const [purpose, setPurpose] = useState('Encontrar founders, hires o socios compatibles para construir una startup de AI, pero solo después de conversar a fondo sobre valores, vínculos y rumbo de vida.')
  const [loading, setLoading] = useState(true)
  const [matchingLoading, setMatchingLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const activeSession = getAgentSession()

    if (!activeSession || activeSession.role !== 'founder') {
      router.replace('/onboarding/startup')
      return
    }

    setSession(activeSession)
    setLoading(false)
  }, [router])

  const handleRunMatching = async () => {
    if (!session) return

    setMatchingLoading(true)
    setError('')

    try {
      const result = await api.runMatchmake(session.activeAgentId, {
        purpose,
        minScore: 0.55,
        limit: 3,
        turnsPerAgent: 1,
        maxRounds: 3,
        thinking: 'minimal',
      })

      setMatching(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos correr matchmaking.')
    } finally {
      setMatchingLoading(false)
    }
  }

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400"></div>
      </div>
    )
  }

  const grading = session.grading

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center gap-6 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
              {session.activeAgentName}
            </h1>
            <p className="text-slate-400">Tu agente fundador ya puede evaluar compatibilidad contra otros agentes existentes.</p>
          </div>
          <div className="px-4 py-2 rounded-lg bg-slate-800/60 border border-pink-500/20 text-sm text-slate-300">
            Agent ID: <span className="font-mono text-white">{session.activeAgentId}</span>
          </div>
        </div>

        {grading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Metric label="Overall" value={grading.overallScore} />
            <Metric label="Personal" value={grading.personalScore} />
            <Metric label="Social" value={grading.socialScore} />
            <Metric label="Professional" value={grading.professionalScore} />
          </div>
        )}

        <div className="rounded-2xl border border-pink-500/30 bg-slate-800/40 p-6 space-y-4">
          <h2 className="text-2xl font-bold text-white">Matchmaking automático</h2>
          <p className="text-slate-400">Esto llama a `POST /agents/:id/matchmake` usando tu `agentId` persistido.</p>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-slate-900/70 border border-pink-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 resize-none"
          />
          <button
            onClick={handleRunMatching}
            disabled={matchingLoading}
            className="px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 rounded-lg font-semibold transition-all"
          >
            {matchingLoading ? 'Corriendo matchmaking...' : 'Buscar matches'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {matching && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6">
              <h2 className="text-2xl font-bold mb-2">Resultado</h2>
              <p className="text-slate-300">Evaluados: {matching.evaluatedCandidates} · Devueltos: {matching.returnedMatches}</p>
            </div>

            <div className="grid gap-4">
              {matching.matches.map((match) => (
                <div key={match.conversationId} className="bg-slate-800/50 border border-purple-500/30 rounded-xl p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-100">{match.candidateId}</h3>
                      <p className="text-sm text-slate-400">{match.compatibility.summary}</p>
                    </div>
                    <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                      {Math.round(match.compatibility.score * 100)}%
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-slate-300 mb-2">Razones</h4>
                    <ul className="space-y-1 text-sm text-slate-400">
                      {match.compatibility.reasons.map((reason) => (
                        <li key={reason}>• {reason}</li>
                      ))}
                    </ul>
                  </div>

                  {match.compatibility.sharedInterests.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {match.compatibility.sharedInterests.map((interest) => (
                        <span key={interest} className="px-2 py-1 bg-purple-600/40 rounded text-xs">
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4">
                    <Link href="/arena" className="text-sm text-pink-300 hover:text-pink-200">
                      Abrir Arena para correr otra conversación →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
      <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">{label}</div>
      <div className="text-2xl font-bold text-white">{Math.round(value * 100)}%</div>
    </div>
  )
}
