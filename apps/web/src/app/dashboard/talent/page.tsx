'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getAgentSession } from '@/lib/agent-session'
import type { AgentSession } from '@/lib/agent-session'

export default function TalentDashboard() {
  const router = useRouter()
  const [session, setSession] = useState<AgentSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const activeSession = getAgentSession()

    if (!activeSession || activeSession.role !== 'talent') {
      router.replace('/onboarding/candidate')
      return
    }

    setSession(activeSession)
    setLoading(false)
  }, [router])

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  const grading = session.grading

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center gap-6 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              {session.activeAgentName}
            </h1>
            <p className="text-slate-400">Tu agente quedó creado y ya puede participar en conversaciones y matchmaking.</p>
          </div>
          <div className="px-4 py-2 rounded-lg bg-slate-800/60 border border-purple-500/20 text-sm text-slate-300">
            Agent ID: <span className="font-mono text-white">{session.activeAgentId}</span>
          </div>
        </div>

        {grading && (
          <div className="bg-slate-800/50 border border-purple-500/30 rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-bold">Perfil generado por el backend</h2>
            <p className="text-slate-300">{grading.summary}</p>
            <p className="text-slate-400">{grading.personalitySummary}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Metric label="Overall" value={grading.overallScore} />
              <Metric label="Personal" value={grading.personalScore} />
              <Metric label="Social" value={grading.socialScore} />
              <Metric label="Professional" value={grading.professionalScore} />
            </div>

            <TagSection label="Fortalezas" items={grading.strengths} tone="purple" />
            <TagSection label="Intereses" items={grading.interests} tone="pink" />
            <TagSection label="Valores" items={grading.values} tone="slate" />

            {grading.risks.length > 0 && (
              <div>
                <h3 className="font-semibold text-red-300 mb-3">Riesgos detectados</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  {grading.risks.map((risk) => (
                    <li key={risk}>• {risk}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/arena" className="rounded-xl border border-purple-500/30 bg-slate-800/40 p-6 hover:border-purple-400 transition-colors">
            <h3 className="text-lg font-semibold text-white mb-2">Abrir Arena</h3>
            <p className="text-sm text-slate-400">Elegí otro agente y corré una conversación real contra el backend.</p>
          </Link>
          <Link href="/dashboard" className="rounded-xl border border-pink-500/30 bg-slate-800/40 p-6 hover:border-pink-400 transition-colors">
            <h3 className="text-lg font-semibold text-white mb-2">Ver dashboard general</h3>
            <p className="text-sm text-slate-400">Revisá el resumen sintético de personalidad generado para tu agente.</p>
          </Link>
        </div>
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

function TagSection({ label, items, tone }: { label: string; items: string[]; tone: 'purple' | 'pink' | 'slate' }) {
  const toneClass = tone === 'pink' ? 'bg-pink-600/30' : tone === 'slate' ? 'bg-slate-700/70' : 'bg-purple-600/30'

  if (items.length === 0) return null

  return (
    <div>
      <h3 className="font-semibold text-slate-200 mb-3">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className={`px-3 py-1 rounded-full text-sm text-white ${toneClass}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
