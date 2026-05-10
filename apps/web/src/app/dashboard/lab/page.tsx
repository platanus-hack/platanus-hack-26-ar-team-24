'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowRight, Radar, Users, Waypoints } from 'lucide-react'
import AppNav from '@/components/layout/AppNav'
import { api } from '@/lib/api'
import { getAgentSession } from '@/lib/agent-session'
import type { AgentSession } from '@/lib/agent-session'
import type { MatchmakeResponse } from '@/types/api'

const DEFAULT_PURPOSE =
  'Quiero que mi agente converse con otros perfiles como una persona real, explore intereses, hábitos, valores y tensión creativa, y detecte con quién hay conexión genuina.'

export default function AgentLabPage() {
  const router = useRouter()
  const [session, setSession] = useState<AgentSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [availableCandidates, setAvailableCandidates] = useState(0)
  const [purpose, setPurpose] = useState(DEFAULT_PURPOSE)
  const [limit, setLimit] = useState(0)
  const [minScore, setMinScore] = useState(0)
  const [result, setResult] = useState<MatchmakeResponse | null>(null)

  useEffect(() => {
    const load = async () => {
      const activeSession = getAgentSession()

      if (!activeSession) {
        router.replace('/dashboard')
        return
      }

      setSession(activeSession)

      try {
        const response = await api.listAgents()
        const candidates = response.agents.filter(
          (agent) => !['main', 'grader', 'judge', activeSession.activeAgentId].includes(agent.id)
        )
        setAvailableCandidates(candidates.length)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No pudimos cargar los agentes disponibles.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router])

  const handleRun = async () => {
    if (!session) return

    setRunning(true)
    setError('')

    try {
      const response = await api.runMatchmake(session.activeAgentId, {
        purpose,
        limit,
        minScore,
        turnsPerAgent: 1,
        maxRounds: 3,
        thinking: 'minimal',
      })

      setResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos correr la prueba.')
    } finally {
      setRunning(false)
    }
  }

  const topScore = result?.matches[0]?.compatibility.score ?? 0
  const averageScore = useMemo(() => {
    if (!result || result.matches.length === 0) return 0
    return result.matches.reduce((sum, match) => sum + match.compatibility.score, 0) / result.matches.length
  }, [result])

  if (loading || !session) {
    return (
      <div className="min-h-[100dvh] bg-ink-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/60" />
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-ink-950 text-white">
      <AppNav maxWidth="max-w-7xl" />

      <main className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
        <section className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr] items-start mb-10">
          <div>
            <p className="text-xs font-mono text-zinc-500 mb-4 tracking-[0.22em] uppercase">
              Agent Lab
            </p>
            <h1 className="font-serif text-5xl sm:text-6xl leading-[0.98] tracking-tight mb-5">
              Poné a prueba cómo se mueve tu agente frente al resto.
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-[40rem]">
              Esta pestaña corre un batch de conversaciones en paralelo y te devuelve un ranking
              limpio con los perfiles que más conexión generaron.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                icon={<Radar size={16} />}
                label="Agente activo"
                value={session.activeAgentName}
                caption={session.activeAgentId}
              />
              <StatCard
                icon={<Users size={16} />}
                label="Perfiles disponibles"
                value={String(availableCandidates)}
                caption="excluyendo grader, judge y main"
              />
              <StatCard
                icon={<Waypoints size={16} />}
                label="Mejor conexión"
                value={result ? `${Math.round(topScore * 100)}%` : '—'}
                caption={result ? `${Math.round(averageScore * 100)}% promedio del run` : 'sin batch todavía'}
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] backdrop-blur-xl shadow-[0_24px_80px_-28px_rgba(0,0,0,0.65)] overflow-hidden">
            <div className="px-7 sm:px-9 py-7 border-b border-white/6">
              <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-zinc-500 mb-3">
                Batch setup
              </p>
              <h2 className="font-serif text-3xl leading-tight mb-3">
                Definí el experimento y corré el lote.
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                El backend ya procesa varios candidatos al mismo tiempo. Acá elegís cuántos
                perfiles querés evaluar y qué tan permisivo querés ser con el ranking final.
              </p>
            </div>

            <div className="px-7 sm:px-9 py-7 space-y-6">
              {error && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-2">
                  Brief
                </label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  rows={5}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-base text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/25 focus:bg-white/[0.06] resize-none transition-colors"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ControlPanel
                  label="Candidatos a evaluar"
                  value={String(limit)}
                  caption="más candidatos = mejor señal del batch"
                >
                  <input
                    type="range"
                    min={0}
                    max={Math.max(availableCandidates, 1)}
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="w-full accent-white"
                  />
                </ControlPanel>

                <ControlPanel
                  label="Piso mínimo de score"
                  value={`${Math.round(minScore * 100)}%`}
                  caption="0% muestra todo el ranking, incluso conexiones flojas"
                >
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={Math.round(minScore * 100)}
                    onChange={(e) => setMinScore(Number(e.target.value) / 100)}
                    className="w-full accent-white"
                  />
                </ControlPanel>
              </div>

              <button
                onClick={handleRun}
                disabled={running || availableCandidates === 0}
                className="group w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-black px-5 py-4 text-base font-medium hover:bg-zinc-200 active:scale-[0.99] transition-all disabled:opacity-60"
              >
                {running ? 'Corriendo pruebas...' : 'Correr prueba paralela'}
                {!running && <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] overflow-hidden">
            <div className="px-6 py-5 border-b border-white/6 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-2">
                  Ranking del run
                </p>
                <h3 className="font-serif text-3xl leading-tight">
                  Los perfiles que mejor conectaron en este batch.
                </h3>
              </div>
              {result && (
                <p className="text-sm text-zinc-500">
                  Evaluados: {result.evaluatedCandidates} · Devueltos: {result.returnedMatches}
                </p>
              )}
            </div>

            <div className="p-6 space-y-4">
              {!result ? (
                <EmptyState
                  title="Todavía no corriste ninguna prueba."
                  body="Armá el brief, elegí cuántos perfiles querés evaluar y dejá que el agente salga a conversar."
                />
              ) : result.matches.length === 0 ? (
                <EmptyState
                  title="No apareció ninguna conexión con ese filtro."
                  body="Probá bajando el piso mínimo de score o ampliando la cantidad de candidatos."
                />
              ) : (
                result.matches.map((match, index) => (
                  <article
                    key={match.conversationId}
                    className="rounded-[1.5rem] border border-white/8 bg-black/15 px-5 py-5"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                      <div className="max-w-2xl">
                        <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-2">
                          #{index + 1} · {match.candidateId}
                        </p>
                        <h4 className="font-serif text-2xl mb-2">
                          {match.compatibility.summary}
                        </h4>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                          {match.transcript[0]?.text || 'Sin apertura registrada.'}
                        </p>
                        {match.candidateProfile && hasSocialLinks(match.candidateProfile) && (
                          <div className="mt-4 flex items-center gap-2">
                            <SocialLink href={match.candidateProfile.githubUrl} label="GitHub">
                              <GithubMark />
                            </SocialLink>
                            <SocialLink href={match.candidateProfile.linkedinUrl} label="LinkedIn">
                              <LinkedinMark />
                            </SocialLink>
                            <SocialLink href={match.candidateProfile.xUrl} label="X">
                              <XMark />
                            </SocialLink>
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-1">
                          Score
                        </p>
                        <p className="font-serif text-4xl text-white">
                          {Math.round(match.compatibility.score * 100)}
                          <span className="text-zinc-500 text-2xl">%</span>
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
                      <div>
                        <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-3">
                          Por qué subió
                        </p>
                        <div className="space-y-2">
                          {match.compatibility.reasons.map((reason) => (
                            <div
                              key={reason}
                              className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300"
                            >
                              {reason}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-3">
                            Intereses compartidos
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {match.compatibility.sharedInterests.length > 0 ? (
                              match.compatibility.sharedInterests.map((interest) => (
                                <span
                                  key={interest}
                                  className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-sm text-white"
                                >
                                  {interest}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-zinc-500">
                                No apareció un interés compartido fuerte.
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-zinc-400">
                          {match.transcript.length} mensajes intercambiados en esta corrida.
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <aside className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] px-6 py-6">
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-3">
                Qué estás probando
              </p>
              <h3 className="font-serif text-3xl leading-tight mb-3">
                No es una charla aislada. Es comportamiento frente a la red.
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-5">
                Acá no elegís un solo oponente. Tu agente sale a hablar con varios perfiles,
                filtra señal y te devuelve quiénes realmente merecen una segunda mirada.
              </p>
              <div className="space-y-3">
                <InfoRow
                  title="Paralelo de verdad"
                  body="Cada corrida puede evaluar múltiples candidatos sin esperar a que termine uno para arrancar el siguiente."
                />
                <InfoRow
                  title="Ranking limpio"
                  body="La lista final ya vuelve ordenada por compatibilidad, así que ves primero dónde hay más química."
                />
                <InfoRow
                  title="Filtro ajustable"
                  body="Podés mirar todo el espectro o quedarte solo con las conexiones más fuertes."
                />
              </div>
            </aside>

            <aside className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] px-6 py-6">
              <div className="flex items-center gap-2 text-zinc-400 mb-4">
                <AlertCircle size={14} />
                <span className="text-[11px] font-mono uppercase tracking-[0.18em]">
                  Estado del último batch
                </span>
              </div>

              {!result ? (
                <p className="text-sm text-zinc-500">
                  Todavía no corriste una prueba desde esta pestaña.
                </p>
              ) : (
                <div className="space-y-3">
                  <ResultMeta label="Propósito activo" value={result.purpose} multiline />
                  <ResultMeta label="Agente base" value={result.agentId} />
                  <ResultMeta label="Candidatos evaluados" value={String(result.evaluatedCandidates)} />
                  <ResultMeta label="Conexiones devueltas" value={String(result.returnedMatches)} />
                  <ResultMeta label="Fallos" value={String(result.failures.length)} />
                </div>
              )}
            </aside>
          </div>
        </section>
      </main>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  caption,
}: {
  icon: React.ReactNode
  label: string
  value: string
  caption: string
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] px-5 py-5">
      <div className="flex items-center gap-2 text-zinc-400 mb-3">
        {icon}
        <span className="text-[11px] font-mono uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="font-serif text-3xl leading-none text-white mb-2">{value}</p>
      <p className="text-xs text-zinc-500">{caption}</p>
    </div>
  )
}

function ControlPanel({
  label,
  value,
  caption,
  children,
}: {
  label: string
  value: string
  caption: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-1">
            {label}
          </p>
          <p className="text-xs text-zinc-500">{caption}</p>
        </div>
        <span className="text-sm text-white">{value}</span>
      </div>
      {children}
    </div>
  )
}

function EmptyState({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/8 bg-black/15 px-5 py-8">
      <h4 className="font-serif text-2xl mb-2">{title}</h4>
      <p className="text-sm text-zinc-500 max-w-xl">{body}</p>
    </div>
  )
}

function InfoRow({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/15 px-4 py-4">
      <p className="text-sm text-white mb-1.5">{title}</p>
      <p className="text-sm text-zinc-500 leading-relaxed">{body}</p>
    </div>
  )
}

function ResultMeta({
  label,
  value,
  multiline = false,
}: {
  label: string
  value: string
  multiline?: boolean
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/15 px-4 py-3">
      <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-1.5">
        {label}
      </p>
      <p className={`text-sm text-zinc-300 ${multiline ? 'leading-relaxed' : ''}`}>{value}</p>
    </div>
  )
}

function SocialLink({
  href,
  label,
  children,
}: {
  href?: string
  label: string
  children: React.ReactNode
}) {
  if (!href) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
    >
      {children}
    </a>
  )
}

function hasSocialLinks(profile: NonNullable<MatchmakeResponse['matches'][number]['candidateProfile']>) {
  return Boolean(profile.githubUrl || profile.linkedinUrl || profile.xUrl)
}

function GithubMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.42-4.04-1.42-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.22 1.84 1.22 1.07 1.81 2.8 1.29 3.49.99.11-.76.42-1.29.76-1.58-2.66-.3-5.47-1.31-5.47-5.86 0-1.3.47-2.36 1.23-3.19-.12-.3-.53-1.5.12-3.13 0 0 1.01-.32 3.3 1.22a11.53 11.53 0 0 1 6 0c2.28-1.54 3.29-1.22 3.29-1.22.65 1.63.24 2.83.12 3.13.77.83 1.23 1.89 1.23 3.19 0 4.56-2.81 5.55-5.49 5.84.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  )
}

function LinkedinMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.11 1 2.48 1h.02C3.87 1 4.98 2.12 4.98 3.5ZM.5 8h4V23h-4ZM8 8h3.83v2.05h.05c.53-1.01 1.84-2.08 3.79-2.08 4.05 0 4.8 2.67 4.8 6.14V23h-4v-7.87c0-1.88-.03-4.29-2.62-4.29-2.62 0-3.02 2.05-3.02 4.16V23H8Z" />
    </svg>
  )
}

function XMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.25l-4.9-7.16L5.8 22H2.68l7.24-8.28L.8 2h6.4l4.43 6.58L18.9 2Zm-1.1 18h1.73L6.27 3.9H4.4L17.8 20Z" />
    </svg>
  )
}
