'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppNav from '@/components/layout/AppNav'
import Section from '@/components/dashboard/Section'
import { getAgentSession } from '@/lib/agent-session'
import type { AgentSession } from '@/lib/agent-session'
import { Brain, Heart, Compass, Zap, Code } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [session, setSession] = useState<AgentSession | null>(null)

  useEffect(() => {
    const activeSession = getAgentSession()
    if (!activeSession) {
      router.replace('/auth/register')
      return
    }

    setSession(activeSession)
  }, [router])

  if (!session) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  const grading = session.grading
  const dimensions = grading ? [
    { label: 'Personal', value: grading.personalScore, accent: '#a78bfa' },
    { label: 'Social', value: grading.socialScore, accent: '#38bdf8' },
    { label: 'Professional', value: grading.professionalScore, accent: '#34d399' },
    { label: 'Overall', value: grading.overallScore, accent: '#f472b6' },
  ] : []

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <AppNav />

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-16">
          <p className="text-xs font-mono text-zinc-500 mb-3 tracking-wider uppercase">
            Agent Profile
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl mb-3">Así quedó {session.activeAgentName}.</h1>
          <p className="text-zinc-400 max-w-2xl">
            Este dashboard consume el perfil devuelto por `POST /agents` y reutiliza el `agentId`
            persistido para el resto del frontend.
          </p>
        </div>

        <Section
          eyebrow="Personality"
          title="Resumen del grader"
          description={grading?.summary || 'Sin grading disponible todavía.'}
        >
          <div className="grid grid-cols-12 gap-4 auto-rows-[140px]">
            <div className="col-span-12 sm:col-span-8 row-span-2 glass-panel rounded-2xl p-6 flex flex-col">
              <div className="flex items-center gap-2 text-zinc-400 mb-5">
                <Brain size={14} />
                <span className="text-xs font-mono uppercase tracking-wider">Scores</span>
              </div>
              <div className="flex-1 flex flex-col justify-center gap-3">
                {dimensions.map((dimension) => (
                  <div key={dimension.label} className="flex items-center gap-4">
                    <span className="text-xs text-zinc-400 w-28 shrink-0">{dimension.label}</span>
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${dimension.value * 100}%`, background: dimension.accent }}
                      />
                    </div>
                    <span className="text-xs font-mono text-zinc-300 w-10 text-right tabular-nums">
                      {Math.round(dimension.value * 100)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <BentoCard className="col-span-6 sm:col-span-4" icon={<Heart size={14} />} label="Valores">
              <p className="font-serif text-2xl text-white">{grading?.values[0] || 'Sin datos'}</p>
              <p className="text-xs text-zinc-500 mt-1">{grading?.values.slice(1, 3).join(' · ') || 'Esperando onboarding'}</p>
            </BentoCard>

            <BentoCard className="col-span-6 sm:col-span-4" icon={<Compass size={14} />} label="Tono">
              <p className="font-serif text-2xl text-white">{grading?.conversationStyle || 'Sin datos'}</p>
              <p className="text-xs text-zinc-500 mt-1">{session.activeAgentId}</p>
            </BentoCard>

            <BentoCard className="col-span-12 sm:col-span-8" icon={<Code size={14} />} label="Fortalezas">
              <div className="flex flex-wrap gap-2">
                {(grading?.strengths || []).map((item) => (
                  <span key={item} className="px-2.5 py-1 text-xs rounded-md bg-white/5 border border-white/10 text-zinc-300">{item}</span>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="col-span-6 sm:col-span-4" icon={<Zap size={14} />} label="Match baseline">
              <p className="font-serif text-3xl text-white tabular-nums">
                {grading ? Math.round(grading.overallScore * 100) : 0}
                <span className="text-zinc-500 text-xl">%</span>
              </p>
              <p className="text-xs text-zinc-500 mt-1">{grading?.personalitySummary || 'Sin resumen'}</p>
            </BentoCard>
          </div>
        </Section>
      </main>
    </div>
  )
}

function BentoCard({
  className = '',
  icon,
  label,
  children,
}: {
  className?: string
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className={`glass-panel rounded-2xl p-5 flex flex-col ${className}`}>
      <div className="flex items-center gap-2 text-zinc-400 mb-4">
        {icon}
        <span className="text-[10px] font-mono uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex-1 flex flex-col justify-center">{children}</div>
    </div>
  )
}
