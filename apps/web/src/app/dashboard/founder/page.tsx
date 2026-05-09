'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUpRight,
  LogOut,
  Sparkles,
  Cpu,
  CheckCircle2,
  Zap,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AmbientBg } from '@/components/ambient-bg'
import { Wordmark } from '@/components/wordmark'
import { MacWindow } from '@/components/mac-window'
import { AgentOrb } from '@/components/agent-orb'
import { MatchRing } from '@/components/match-ring'
import { MatchRadar, type RadarDatum } from '@/components/match-radar'
import { AnimatedNumber } from '@/components/animated-number'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface MatchItem {
  id: string
  candidate_id: string
  match_score: number
  reasons: string[]
  bio: string
  skills: string[]
  technologies: string[]
  experience_years: number
  radar: RadarDatum[]
}

export default function FounderDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [hasProfile, setHasProfile] = useState(true)
  const [matches, setMatches] = useState<MatchItem[]>([])
  const [matchingLoading, setMatchingLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push('/auth')
          return
        }

        setUser(session.user)

        const { data: profile, error } = await supabase
          .from('startup_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (error || !profile) {
          setHasProfile(false)
        } else {
          setProfileData(profile)
          setHasProfile(true)
        }
      } catch (err) {
        console.error('Error loading dashboard:', err)
        setHasProfile(false)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleRunMatching = async () => {
    setMatchingLoading(true)
    setError('')

    try {
      const { data: candidates, error: candidatesError } = await supabase
        .from('candidate_profiles')
        .select('*')

      if (candidatesError) throw candidatesError

      if (!candidates || candidates.length === 0) {
        setError('Todavía no hay talento disponible.')
        return
      }

      const stack = (profileData.stack || []) as string[]

      const calculatedMatches: MatchItem[] = candidates
        .map((candidate: any) => {
          const candSkills = (candidate.skills || []) as string[]
          const candTechs = (candidate.technologies || []) as string[]

          const skillOverlap = stack.filter(
            (s) =>
              candSkills.some((cs) => cs.toLowerCase() === s.toLowerCase()) ||
              candTechs.some((cs) => cs.toLowerCase() === s.toLowerCase())
          ).length

          const totalSkills = Math.max(stack.length, 1)
          const skillScore = skillOverlap / totalSkills
          const expScore = Math.min(candidate.experience_years / 10, 1)
          const techDepth = Math.min((candSkills.length + candTechs.length) / 14, 1)
          const culture = Math.min((candidate.bio?.length ?? 0) / 240, 1)
          const score =
            skillScore * 0.45 + expScore * 0.3 + techDepth * 0.15 + culture * 0.1

          const radar: RadarDatum[] = [
            { axis: 'Skills', value: Math.round(skillScore * 100) },
            { axis: 'Exp', value: Math.round(expScore * 100) },
            { axis: 'Stack', value: Math.round(techDepth * 100) },
            { axis: 'Cultura', value: Math.round(culture * 100) },
            { axis: 'Match', value: Math.round(score * 100) },
          ]

          return {
            id: candidate.id,
            candidate_id: candidate.user_id,
            match_score: score,
            reasons: [
              `${skillOverlap} skill${skillOverlap !== 1 ? 's' : ''} coinciden con tu stack`,
              `${candidate.experience_years} año${candidate.experience_years !== 1 ? 's' : ''} de experiencia`,
              `${candSkills.length} skills declarados`,
            ],
            bio: candidate.bio,
            skills: candSkills,
            technologies: candTechs,
            experience_years: candidate.experience_years,
            radar,
          }
        })
        .sort((a, b) => b.match_score - a.match_score)

      setMatches(calculatedMatches)
    } catch (err: any) {
      setError(err.message || 'No se pudo correr el matching')
    } finally {
      setMatchingLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <AmbientBg />
        <AgentOrb variant="pink" size={96} />
      </div>
    )
  }

  if (!hasProfile) {
    return (
      <div className="relative min-h-screen px-4 py-16">
        <AmbientBg />
        <div className="mx-auto max-w-xl">
          <MacWindow title="profile required" variant="pink">
            <div className="flex flex-col items-center p-10 text-center">
              <AgentOrb variant="pink" size={88} className="mb-6" />
              <h2 className="font-serif text-3xl leading-tight tracking-tight">
                Definí tu <em className="italic text-neon">visión</em> primero.
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Creá el perfil de la startup para empezar a matchear.
              </p>
              <Button asChild size="lg" variant="accent" className="mt-6 glow-accent">
                <Link href="/onboarding/startup">
                  Crear perfil de startup
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </MacWindow>
        </div>
      </div>
    )
  }

  void user

  const topMatches = matches.filter((m) => m.match_score >= 0.8).length
  const avgScore =
    matches.length > 0
      ? Math.round(
          (matches.reduce((acc, m) => acc + m.match_score, 0) / matches.length) * 100
        )
      : 0

  return (
    <div className="relative min-h-screen">
      <AmbientBg />

      <header className="sticky top-4 z-40 px-4">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 glass rounded-full px-3 py-2 pl-5">
          <Wordmark />
          <div className="flex items-center gap-2">
            <Badge variant="pink" className="font-mono text-[10px]">
              <span className="mr-1 size-1.5 rounded-full bg-traffic-green animate-pulse" />
              founder · {profileData?.name}
            </Badge>
            <Button onClick={handleLogout} size="sm" variant="ghost">
              <LogOut className="size-3.5" />
              Salir
            </Button>
          </div>
        </nav>
      </header>

      <main className="px-4 pb-20 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-6xl space-y-8"
        >
          {/* Hero */}
          <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                / dashboard · founder
              </div>
              <h1 className="mt-1 font-serif text-5xl leading-[0.95] tracking-tight sm:text-7xl">
                Encontrá tu <em className="italic text-neon">team</em>.
              </h1>
              <p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">
                Lanzá los agentes para descubrir candidatos compatibles con{' '}
                {profileData?.name}.
              </p>
            </div>
            <AgentOrb variant="pink" size={96} className="shrink-0" />
          </div>

          {/* Stats row */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: 'Total matches',
                value: matches.length,
                suffix: '',
                variant: 'purple' as const,
              },
              {
                label: 'Top matches (≥80%)',
                value: topMatches,
                suffix: '',
                variant: 'pink' as const,
              },
              {
                label: 'Avg score',
                value: avgScore,
                suffix: '%',
                variant: 'cyan' as const,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 p-5 backdrop-blur-xl"
              >
                <div
                  aria-hidden
                  className="absolute -right-12 -top-12 size-32 rounded-full blur-2xl"
                  style={{
                    background:
                      stat.variant === 'purple'
                        ? 'color-mix(in oklab, var(--accent) 25%, transparent)'
                        : stat.variant === 'pink'
                        ? 'color-mix(in oklab, var(--accent-pink) 25%, transparent)'
                        : 'color-mix(in oklab, var(--accent-cyan) 25%, transparent)',
                  }}
                />
                <div className="relative">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {stat.label}
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-serif text-5xl leading-none tabular-nums text-foreground">
                      <AnimatedNumber value={stat.value} duration={1200} />
                    </span>
                    {stat.suffix && (
                      <span className="font-mono text-xs text-muted-foreground">
                        {stat.suffix}
                      </span>
                    )}
                    <span className="ml-auto" aria-hidden>
                      <span
                        className="block size-2 rounded-full"
                        style={{
                          background:
                            stat.variant === 'purple'
                              ? 'var(--accent)'
                              : stat.variant === 'pink'
                              ? 'var(--accent-pink)'
                              : 'var(--accent-cyan)',
                          boxShadow: `0 0 12px ${
                            stat.variant === 'purple'
                              ? 'var(--accent)'
                              : stat.variant === 'pink'
                              ? 'var(--accent-pink)'
                              : 'var(--accent-cyan)'
                          }`,
                        }}
                      />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Matching console */}
          <MacWindow
            title="matching.console"
            subtitle={matchingLoading ? 'agente analizando…' : 'agente listo'}
            variant="purple"
          >
            <div className="relative grid gap-px bg-white/5 sm:grid-cols-[1fr_1.5fr]">
              {/* Left: command */}
              <div className="bg-white/[0.02] p-7 backdrop-blur">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  / comando
                </div>
                <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight">
                  Ejecutar
                  <br />
                  <em className="italic text-neon">match engine</em>.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  El agente va a comparar tu stack y cultura contra todos los talentos.
                </p>

                {profileData?.stack && profileData.stack.length > 0 && (
                  <div className="mt-5">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      tu stack
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {profileData.stack.slice(0, 6).map((s: string, i: number) => (
                        <Badge key={i} variant="soft" className="rounded-md">
                          {s}
                        </Badge>
                      ))}
                      {profileData.stack.length > 6 && (
                        <Badge variant="outline" className="rounded-md">
                          +{profileData.stack.length - 6}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleRunMatching}
                  disabled={matchingLoading}
                  size="lg"
                  variant="accent"
                  className="mt-6 w-full glow-accent"
                >
                  {matchingLoading ? (
                    <>
                      <Cpu className="size-4 animate-pulse" />
                      Buscando matches…
                    </>
                  ) : (
                    <>
                      <Zap className="size-4" />
                      Correr matching IA
                    </>
                  )}
                </Button>
              </div>

              {/* Right: status */}
              <div className="relative bg-black/20 p-7">
                {matchingLoading && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-px animate-scan"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent, var(--accent), var(--accent-pink), transparent)',
                      boxShadow: '0 0 16px var(--accent)',
                    }}
                  />
                )}

                <div className="flex items-center justify-between">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    / output
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {matches.length > 0
                      ? `${matches.length} matches`
                      : matchingLoading
                      ? 'procesando…'
                      : 'idle'}
                  </Badge>
                </div>

                {matches.length === 0 && !matchingLoading && (
                  <div className="mt-6 flex flex-col items-center justify-center py-10 text-center">
                    <AgentOrb variant="purple" size={64} pulse={false} className="mb-4" />
                    <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">
                      Apretá{' '}
                      <span className="font-mono text-foreground">Correr matching</span>{' '}
                      para empezar.
                    </p>
                  </div>
                )}

                {matchingLoading && (
                  <div className="mt-8 space-y-2.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-14 animate-pulse rounded-xl bg-white/[0.04]"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                )}

                {matches.length > 0 && !matchingLoading && (
                  <div className="mt-5 max-h-[320px] space-y-2 overflow-y-auto pr-1">
                    <AnimatePresence>
                      {matches.slice(0, 5).map((m, i) => (
                        <motion.div
                          key={m.id}
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08, duration: 0.5 }}
                          className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur transition hover:bg-white/[0.07]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="font-mono text-xs text-muted-foreground tabular-nums">
                              #{(i + 1).toString().padStart(2, '0')}
                            </div>
                            <AgentOrb
                              variant={
                                i === 0
                                  ? 'pink'
                                  : i === 1
                                  ? 'purple'
                                  : i === 2
                                  ? 'cyan'
                                  : 'emerald'
                              }
                              size={32}
                              pulse={false}
                              orbit={false}
                            />
                            <div>
                              <div className="text-sm font-medium leading-tight">
                                {m.experience_years} años ·{' '}
                                {(m.skills || []).slice(0, 2).join(', ')}
                              </div>
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {m.bio?.slice(0, 60)}…
                              </div>
                            </div>
                          </div>
                          <div className="flex items-baseline gap-0.5 font-mono">
                            <span className="text-lg font-semibold tabular-nums text-foreground">
                              <AnimatedNumber
                                value={Math.round(m.match_score * 100)}
                                duration={1200}
                              />
                            </span>
                            <span className="text-[10px] text-muted-foreground">%</span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </MacWindow>

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Detailed results */}
          {matches.length > 0 && (
            <div>
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    / detalle de candidatos
                  </div>
                  <h2 className="mt-2 font-serif text-4xl leading-tight tracking-tight">
                    {matches.length}{' '}
                    <em className="italic text-neon">
                      {matches.length === 1 ? 'match' : 'matches'}
                    </em>
                  </h2>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {matches.map((match, idx) => {
                  const score = Math.round(match.match_score * 100)
                  const isTop = score >= 80
                  const orbVariant: 'pink' | 'purple' | 'cyan' | 'emerald' =
                    idx === 0
                      ? 'pink'
                      : idx === 1
                      ? 'purple'
                      : idx === 2
                      ? 'cyan'
                      : 'emerald'
                  return (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06, duration: 0.5 }}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_24px_60px_-20px_color-mix(in_oklab,var(--accent-pink)_25%,transparent)]"
                    >
                      {isTop && (
                        <div className="absolute right-4 top-4">
                          <Badge variant="accent" className="rounded-md">
                            <Sparkles className="size-3" />
                            Top match
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-start gap-4">
                        <div className="shrink-0">
                          <MatchRing
                            score={score}
                            size={108}
                            delay={idx * 0.06}
                            variant={isTop ? 'purple-pink' : 'cyan-emerald'}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <AgentOrb
                              variant={orbVariant}
                              size={32}
                              pulse={false}
                              orbit={false}
                            />
                            <h3 className="font-serif text-xl leading-tight tracking-tight">
                              Candidato compatible
                            </h3>
                          </div>
                          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                            {match.experience_years} años · {match.skills.length} skills ·{' '}
                            {match.technologies.length} tech
                          </p>
                          {match.bio && (
                            <p className="mt-3 text-sm italic leading-relaxed text-muted-foreground line-clamp-2">
                              "{match.bio}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Radar */}
                      <div className="mt-4 rounded-xl border border-white/5 bg-black/20 p-2">
                        <MatchRadar data={match.radar} height={180} />
                      </div>

                      {/* Reasons */}
                      <div className="mt-5 space-y-2">
                        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          ¿por qué matchea?
                        </div>
                        <ul className="space-y-1.5">
                          {match.reasons.map((reason: string, i: number) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-foreground/85"
                            >
                              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-accent" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {match.skills.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-1.5">
                          {match.skills.slice(0, 5).map((skill: string, i: number) => (
                            <Badge key={i} variant="soft" className="rounded-md">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
