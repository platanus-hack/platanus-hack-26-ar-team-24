'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Compass,
  Heart,
  Radar,
  Sparkles,
  Target,
} from 'lucide-react'
import AppNav from '@/components/layout/AppNav'
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
      <div className="min-h-[100dvh] bg-ink-950 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-white/60" />
      </div>
    )
  }

  const grading = session.grading
  const metrics = grading
    ? [
        { label: 'Overall', value: grading.overallScore, icon: <Radar size={15} /> },
        { label: 'Personal', value: grading.personalScore, icon: <Heart size={15} /> },
        { label: 'Social', value: grading.socialScore, icon: <Sparkles size={15} /> },
        { label: 'Professional', value: grading.professionalScore, icon: <Target size={15} /> },
      ]
    : []

  return (
    <div className="min-h-[100dvh] bg-ink-950 text-white">
      <AppNav maxWidth="max-w-7xl" />

      <main className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 xl:grid-cols-[0.78fr_1.22fr] gap-8 items-start">
          <aside className="xl:sticky xl:top-28 space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] px-6 py-6 sm:px-7 sm:py-7 shadow-[0_24px_80px_-28px_rgba(0,0,0,0.65)]">
              <p className="text-xs font-mono text-zinc-500 mb-4 tracking-[0.22em] uppercase">
                Talent dashboard
              </p>
              <h1 className="text-4xl sm:text-5xl tracking-tight leading-[0.94] text-white mb-4">
                {session.activeAgentName}
              </h1>
              <p className="text-base text-zinc-400 leading-relaxed mb-6">
                Tu agente ya tiene una lectura base de cómo te movés, dónde aparece señal y qué
                vale la pena explorar mejor en una conversación real.
              </p>

              <div className="grid grid-cols-1 gap-3">
                <InfoTile label="Agent ID" value={session.activeAgentId} icon={<Radar size={14} />} />
                <InfoTile
                  label="Tono"
                  value={grading?.conversationStyle || 'Sin datos'}
                  icon={<Compass size={14} />}
                />
                <InfoTile
                  label="Valores"
                  value={grading?.values.slice(0, 2).join(' · ') || 'Sin datos'}
                  icon={<Heart size={14} />}
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] px-6 py-6 sm:px-7 sm:py-7 shadow-[0_24px_80px_-28px_rgba(0,0,0,0.65)]">
              <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-zinc-500 mb-4">
                Próximos pasos
              </p>
              <div className="space-y-3">
                <PrimaryAction onClick={() => router.push('/arena')} label="Abrir Arena" />
                <SecondaryLink
                  href="/dashboard"
                  title="Ver dashboard general"
                  body="Volvé al panel principal para revisar lectura, señales y contexto."
                />
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] overflow-hidden shadow-[0_24px_80px_-28px_rgba(0,0,0,0.65)]">
              <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="px-7 sm:px-9 py-7 border-b lg:border-b-0 lg:border-r border-white/6">
                  <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-zinc-500 mb-3">
                    Resumen
                  </p>
                  <h2 className="text-3xl sm:text-4xl leading-tight tracking-tight text-white mb-3">
                    Lo que el grader detectó en tu perfil.
                  </h2>
                  <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-[34rem] mb-8">
                    Esta lectura reúne tu forma de pensar, tus señales más fuertes y los puntos
                    donde conviene prestar más atención en futuras conversaciones.
                  </p>

                  <div className="rounded-[1.5rem] border border-white/8 bg-black/15 px-5 py-5">
                    <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-3">
                      Síntesis
                    </p>
                    <p className="text-white leading-relaxed mb-3">
                      {grading?.summary || 'Todavía no hay summary disponible.'}
                    </p>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {grading?.personalitySummary ||
                        'Cuando exista más contexto, esta lectura se va a refinar.'}
                    </p>
                  </div>
                </div>

                <div className="px-7 sm:px-9 py-7">
                  <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-zinc-500 mb-4">
                    Scores
                  </p>
                  <div className="space-y-3">
                    {metrics.map((metric) => (
                      <MetricStrip
                        key={metric.label}
                        icon={metric.icon}
                        label={metric.label}
                        value={metric.value}
                      />
                    ))}
                    {metrics.length === 0 && (
                      <p className="text-sm text-zinc-500">Todavía no hay scores disponibles.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-6">
              <ContentPanel
                eyebrow="Señales fuertes"
                title="Lo que hoy más empuja tu perfil."
              >
                <div className="flex flex-wrap gap-2">
                  {(grading?.strengths || []).map((item) => (
                    <SignalChip key={item} value={item} tone="bright" />
                  ))}
                  {(!grading?.strengths || grading.strengths.length === 0) && (
                    <p className="text-sm text-zinc-500">Todavía no hay fortalezas detectadas.</p>
                  )}
                </div>
              </ContentPanel>

              <ContentPanel
                eyebrow="Riesgos y fricción"
                title="Los puntos donde puede aparecer ruido."
              >
                <div className="space-y-2">
                  {(grading?.risks || []).map((risk) => (
                    <div
                      key={risk}
                      className="rounded-xl border border-white/8 bg-black/15 px-4 py-3 text-sm text-zinc-300"
                    >
                      {risk}
                    </div>
                  ))}
                  {(!grading?.risks || grading.risks.length === 0) && (
                    <p className="text-sm text-zinc-500">No hay riesgos marcados por ahora.</p>
                  )}
                </div>
              </ContentPanel>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] px-7 sm:px-9 py-7 shadow-[0_24px_80px_-28px_rgba(0,0,0,0.65)]">
              <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-zinc-500 mb-3">
                Intereses
              </p>
              <h2 className="text-3xl leading-tight tracking-tight text-white mb-5">
                Los temas donde tu agente tiene más tracción.
              </h2>
              <div className="flex flex-wrap gap-2">
                {(grading?.interests || []).map((item) => (
                  <SignalChip key={item} value={item} tone="soft" />
                ))}
                {(!grading?.interests || grading.interests.length === 0) && (
                  <p className="text-sm text-zinc-500">Todavía no hay intereses priorizados.</p>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function InfoTile({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-[1.35rem] border border-white/8 bg-black/15 px-4 py-4">
      <div className="flex items-center gap-2 text-zinc-400 mb-2">
        {icon}
        <span className="text-[10px] font-mono uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="text-sm text-white break-all">{value}</p>
    </div>
  )
}

function MetricStrip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="rounded-[1.35rem] border border-white/8 bg-black/15 px-4 py-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-zinc-400">
          {icon}
          <span className="text-[10px] font-mono uppercase tracking-[0.18em]">{label}</span>
        </div>
        <p className="font-mono text-sm text-white tabular-nums">{Math.round(value * 100)}%</p>
      </div>
      <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
        <div className="h-full rounded-full bg-white/80" style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  )
}

function ContentPanel({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] px-7 sm:px-8 py-7 shadow-[0_24px_80px_-28px_rgba(0,0,0,0.65)]">
      <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-zinc-500 mb-3">
        {eyebrow}
      </p>
      <h2 className="text-2xl sm:text-3xl tracking-tight leading-tight text-white mb-5">{title}</h2>
      {children}
    </div>
  )
}

function SignalChip({
  value,
  tone,
}: {
  value: string
  tone: 'bright' | 'soft'
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm ${
        tone === 'bright'
          ? 'border-white/10 bg-white/[0.06] text-white'
          : 'border-white/10 bg-black/15 text-zinc-200'
      }`}
    >
      {value}
    </span>
  )
}

function PrimaryAction({
  onClick,
  label,
}: {
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className="group w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-black px-5 py-4 text-base font-medium hover:bg-zinc-200 active:scale-[0.99] transition-all"
    >
      {label}
      <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
    </button>
  )
}

function SecondaryLink({
  href,
  title,
  body,
}: {
  href: string
  title: string
  body: string
}) {
  return (
    <Link
      href={href}
      className="block rounded-[1.35rem] border border-white/8 bg-black/15 px-5 py-5 hover:bg-white/[0.04] hover:border-white/12 transition-colors"
    >
      <p className="text-white mb-2">{title}</p>
      <p className="text-sm text-zinc-400 leading-relaxed">{body}</p>
    </Link>
  )
}
