'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppNav from '@/components/layout/AppNav'
import Section from '@/components/dashboard/Section'
import { getAgentSession } from '@/lib/agent-session'
import type { AgentSession } from '@/lib/agent-session'
import { Brain, Heart, Compass, Zap, Code, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const [session, setSession] = useState<AgentSession | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const activeSession = getAgentSession()
    if (!activeSession) {
      setSession(null)
      setReady(true)
      return
    }

    setSession(activeSession)
    setReady(true)
  }, [router])

  useEffect(() => {
    if (ready && !authLoading && !session && !isAuthenticated) {
      router.replace('/auth/register')
    }
  }, [authLoading, isAuthenticated, ready, router, session])

  if (!ready || authLoading) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  if (!session && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  if (!session) {
    const displayName = user?.name || user?.username || user?.email?.split('@')[0] || 'tu cuenta'

    return (
      <div className="min-h-screen bg-ink-950 text-white">
        <AppNav />

        <main className="max-w-6xl mx-auto px-6 py-16">
          <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
            <div className="space-y-6">
              <p className="text-xs font-mono text-zinc-500 tracking-wider uppercase">
                Agent Workspace
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl leading-[1.02]">
                La cuenta ya existe.
                <br />
                <span className="italic text-zinc-300">Ahora falta modelar tu agente.</span>
              </h1>
              <p className="max-w-2xl text-zinc-400 leading-relaxed">
                {displayName}, ya estás adentro. Ahora toca crear tu agente para que pueda empezar
                a conversar, buscar matches y aprender de cada interacción.
              </p>

              <div>
                <Link
                  href="/onboarding/candidate"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-4 text-base font-medium text-black hover:bg-zinc-200 active:scale-[0.99] transition-all"
                >
                  Crear agente
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="glass-panel rounded-[1.75rem] p-6 sm:p-7">
              <div className="flex items-center gap-2 text-zinc-400 mb-5">
                <Compass size={14} />
                <span className="text-[10px] font-mono uppercase tracking-wider">
                  Qué vas a desbloquear
                </span>
              </div>

              <div className="space-y-4">
                <Capability
                  title="Fuentes conectadas"
                  body="Sincronizá señales públicas y dejá que el perfil se refine desde dentro de la app."
                />
                <Capability
                  title="Conversaciones guardadas"
                  body="Cada simulación queda persistida para revisar compatibilidades, objeciones y evolución."
                />
                <Capability
                  title="Dashboard operativo"
                  body="Una vez creado el agente, el dashboard centraliza score, fricción y patrones reales."
                />
              </div>

              <Link
                href="/onboarding/sync"
                className="mt-7 inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors"
              >
                Ver fuentes disponibles
                <ArrowRight size={14} />
              </Link>
            </div>
          </section>
        </main>
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
            Acá ves la lectura base del agente: cómo quedó modelado, qué señales aparecen primero
            y qué rasgos tienen más peso en las conversaciones.
          </p>
        </div>

        <Section
          eyebrow="Personality"
          title="Resumen del grader"
          description={grading?.summary || 'Sin grading disponible todavía.'}
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(18rem,1fr)] lg:items-start">
            <div className="grid gap-4">
              <div className="glass-panel rounded-2xl p-6 flex flex-col min-h-[20rem]">
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

              <BentoCard icon={<Code size={14} />} label="Fortalezas">
                <div className="flex flex-wrap gap-2">
                  {(grading?.strengths || []).map((item) => (
                    <span key={item} className="px-2.5 py-1 text-xs rounded-md bg-white/5 border border-white/10 text-zinc-300">{item}</span>
                  ))}
                </div>
              </BentoCard>
            </div>

            <div className="grid gap-4">
              <BentoCard icon={<Heart size={14} />} label="Valores">
                <p className="font-serif text-2xl text-white">{grading?.values[0] || 'Sin datos'}</p>
                <p className="text-xs text-zinc-500 mt-1">{grading?.values.slice(1, 3).join(' · ') || 'Esperando onboarding'}</p>
              </BentoCard>

              <BentoCard icon={<Compass size={14} />} label="Tono">
                <p className="font-serif text-2xl text-white">{grading?.conversationStyle || 'Sin datos'}</p>
                <p className="text-xs text-zinc-500 mt-1">{session.activeAgentId}</p>
              </BentoCard>

              <BentoCard icon={<Zap size={14} />} label="Match baseline">
                <p className="font-serif text-3xl text-white tabular-nums">
                  {grading ? Math.round(grading.overallScore * 100) : 0}
                  <span className="text-zinc-500 text-xl">%</span>
                </p>
                <p className="text-xs text-zinc-500 mt-1">{grading?.personalitySummary || 'Sin resumen'}</p>
              </BentoCard>
            </div>
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

function Capability({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-4">
      <p className="text-sm text-white mb-1.5">{title}</p>
      <p className="text-sm text-zinc-500 leading-relaxed">{body}</p>
    </div>
  )
}
