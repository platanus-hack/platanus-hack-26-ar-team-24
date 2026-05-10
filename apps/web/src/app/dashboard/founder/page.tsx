'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Radar, Sparkle, Target } from 'lucide-react'
import AppNav from '@/components/layout/AppNav'
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
      router.replace('/onboarding/candidate')
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
      <div className="min-h-[100dvh] bg-ink-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/60" />
      </div>
    )
  }

  const grading = session.grading

  return (
    <div className="min-h-[100dvh] bg-ink-950 text-white">
      <AppNav />

      <main className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
        <section className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-8 items-start mb-10">
          <div>
            <p className="text-xs font-mono text-zinc-500 mb-4 tracking-[0.22em] uppercase">
              Founder dashboard
            </p>
            <h1 className="font-serif text-5xl sm:text-6xl leading-[0.98] tracking-tight mb-5">
              {session.activeAgentName}
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-[38rem]">
              Tu agente fundador ya puede filtrar conversaciones, detectar química real y decidir
              con quién vale la pena seguir hablando.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl">
              <StatCard icon={<Radar size={16} />} label="Agent ID" value={session.activeAgentId} />
              <StatCard
                icon={<Target size={16} />}
                label="Candidates"
                value={matching ? String(matching.evaluatedCandidates) : '0'}
              />
              <StatCard
                icon={<Sparkle size={16} />}
                label="Matches"
                value={matching ? String(matching.returnedMatches) : '0'}
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] backdrop-blur-xl shadow-[0_24px_80px_-28px_rgba(0,0,0,0.65)] overflow-hidden">
            <div className="px-7 sm:px-9 py-7 border-b border-white/6">
              <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-zinc-500 mb-3">
                Matchmaking
              </p>
              <h2 className="font-serif text-3xl leading-tight mb-3">
                Definí qué tipo de conexión querés encontrar.
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                Tu agente usa este brief para salir a filtrar conversaciones y detectar con quién
                realmente vale la pena seguir hablando.
              </p>
            </div>

            <div className="px-7 sm:px-9 py-7">
              {error && (
                <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-2">
                    Search brief
                  </label>
                  <textarea
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    rows={5}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-base text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/25 focus:bg-white/[0.06] resize-none transition-colors"
                  />
                </div>

                {grading && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Metric label="Overall" value={grading.overallScore} />
                    <Metric label="Personal" value={grading.personalScore} />
                    <Metric label="Social" value={grading.socialScore} />
                    <Metric label="Professional" value={grading.professionalScore} />
                  </div>
                )}

                <button
                  onClick={handleRunMatching}
                  disabled={matchingLoading}
                  className="group w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-black px-5 py-4 text-base font-medium hover:bg-zinc-200 active:scale-[0.99] transition-all disabled:opacity-60"
                >
                  {matchingLoading ? 'Corriendo matchmaking...' : 'Buscar matches'}
                  {!matchingLoading && <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
                </button>
              </div>
            </div>
          </div>
        </section>

        {matching && (
          <section className="space-y-6">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs font-mono text-zinc-500 mb-2 tracking-[0.22em] uppercase">
                  Results
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl leading-tight">
                  Conversaciones que sí sobrevivieron el filtro.
                </h2>
              </div>
              <p className="text-sm text-zinc-500">
                Evaluados: {matching.evaluatedCandidates} · Matches: {matching.returnedMatches}
              </p>
            </div>

            <div className="grid gap-4">
              {matching.matches.map((match) => (
                <div
                  key={match.conversationId}
                  className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] px-6 py-6 sm:px-7 sm:py-7"
                >
                  <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
                    <div className="max-w-2xl">
                      <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-2">
                        Candidate
                      </p>
                      <h3 className="font-serif text-2xl text-white mb-2">{match.candidateId}</h3>
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        {match.compatibility.summary}
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
                    <div className="text-right">
                      <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-1">
                        Compatibility
                      </p>
                      <p className="font-serif text-4xl text-white">
                        {Math.round(match.compatibility.score * 100)}
                        <span className="text-zinc-500 text-2xl">%</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
                    <div>
                      <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-3">
                        Reasons
                      </p>
                      <div className="space-y-2">
                        {match.compatibility.reasons.map((reason) => (
                          <div
                            key={reason}
                            className="rounded-xl border border-white/8 bg-black/15 px-4 py-3 text-sm text-zinc-300"
                          >
                            {reason}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {match.compatibility.sharedInterests.length > 0 && (
                        <div>
                          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-3">
                            Shared interests
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {match.compatibility.sharedInterests.map((interest) => (
                              <span
                                key={interest}
                                className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-sm text-white"
                              >
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <Link
                        href="/arena"
                        className="inline-flex items-center gap-2 text-sm text-white hover:text-zinc-300 transition-colors"
                      >
                        Abrir Arena para revisar el historial
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
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

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.025] px-5 py-5">
      <div className="flex items-center gap-2 text-zinc-500 mb-3">
        {icon}
        <span className="text-[11px] font-mono uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="text-base text-white break-all">{value}</p>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-2">
        {label}
      </div>
      <div className="text-2xl font-semibold text-white">{Math.round(value * 100)}%</div>
    </div>
  )
}
