'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight, LogOut, Sparkles, Search, Cpu, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AmbientBg } from '@/components/ambient-bg'
import { Wordmark } from '@/components/wordmark'
import { MacWindow } from '@/components/mac-window'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function FounderDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [hasProfile, setHasProfile] = useState(true)
  const [matches, setMatches] = useState<any[]>([])
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

      const calculatedMatches = candidates
        .map((candidate: any) => {
          const skillOverlap = (profileData.stack || []).filter(
            (s: string) =>
              (candidate.skills || []).some((cs: string) => cs.toLowerCase() === s.toLowerCase()) ||
              (candidate.technologies || []).some(
                (cs: string) => cs.toLowerCase() === s.toLowerCase()
              )
          ).length

          const totalSkills = Math.max((profileData.stack || []).length, 1)
          const skillScore = skillOverlap / totalSkills
          const expScore = Math.min(candidate.experience_years / 10, 1)
          const score = skillScore * 0.6 + expScore * 0.4

          return {
            id: candidate.id,
            candidate_id: candidate.user_id,
            match_score: score,
            reasons: [
              `${skillOverlap} skills coinciden con tu stack`,
              `${candidate.experience_years} años de experiencia`,
              `Skills: ${(candidate.skills || []).slice(0, 3).join(', ')}`,
            ],
            bio: candidate.bio,
            skills: candidate.skills,
            technologies: candidate.technologies,
            experience_years: candidate.experience_years,
          }
        })
        .sort((a: any, b: any) => b.match_score - a.match_score)

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
        <div className="size-12 rounded-full bg-foreground animate-pulse-ring" />
      </div>
    )
  }

  if (!hasProfile) {
    return (
      <div className="relative min-h-screen px-4 py-16">
        <AmbientBg />
        <div className="mx-auto max-w-xl">
          <MacWindow title="profile required">
            <div className="p-10 text-center">
              <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <Sparkles className="size-5" />
              </div>
              <h2 className="font-serif text-3xl leading-tight tracking-tight">
                Definí tu <em className="italic">visión</em> primero.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Creá el perfil de la startup para empezar a matchear.
              </p>
              <Button asChild size="lg" variant="default" className="mt-6">
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

  return (
    <div className="relative min-h-screen">
      <AmbientBg />

      <header className="sticky top-4 z-40 px-4">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 glass rounded-full px-3 py-2 pl-5">
          <Wordmark />
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-[10px]">
              <span className="mr-1 size-1.5 rounded-full bg-accent" />
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
        <div className="mx-auto max-w-6xl space-y-8 animate-fade-in">
          {/* Hero */}
          <div className="flex flex-col gap-2 px-2">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              / dashboard · founder
            </div>
            <h1 className="font-serif text-5xl leading-[0.95] tracking-tight sm:text-7xl">
              Encontrá tu <em className="italic text-accent">team</em>.
            </h1>
            <p className="mt-2 max-w-xl text-muted-foreground leading-relaxed">
              Lanzá los agentes para descubrir candidatos compatibles con{' '}
              {profileData?.name}.
            </p>
          </div>

          {/* Matching console */}
          <MacWindow title="matching.console" subtitle="agente listo">
            <div className="relative grid gap-px bg-border/60 sm:grid-cols-[1fr_1.5fr]">
              {/* Left: command */}
              <div className="bg-card/60 p-7 backdrop-blur">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  / comando
                </div>
                <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight">
                  Ejecutar
                  <br />
                  <em className="italic text-accent">match engine</em>.
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
                      <Search className="size-4" />
                      Correr matching IA
                    </>
                  )}
                </Button>
              </div>

              {/* Right: status */}
              <div className="bg-background/40 p-7">
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
                    <Cpu className="size-10 text-muted-foreground/40" />
                    <p className="mt-4 max-w-xs text-sm text-muted-foreground leading-relaxed">
                      Apretá <span className="font-mono text-foreground">Correr matching</span> para empezar.
                    </p>
                  </div>
                )}

                {matchingLoading && (
                  <div className="mt-8 space-y-2.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-14 animate-pulse rounded-xl bg-foreground/[0.04]"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                )}

                {matches.length > 0 && !matchingLoading && (
                  <div className="mt-5 max-h-[320px] space-y-2 overflow-y-auto pr-1">
                    {matches.slice(0, 5).map((m, i) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between rounded-xl border border-border/60 bg-card/70 px-4 py-3 backdrop-blur"
                      >
                        <div className="flex items-center gap-3">
                          <div className="font-mono text-xs text-muted-foreground tabular-nums">
                            #{(i + 1).toString().padStart(2, '0')}
                          </div>
                          <div>
                            <div className="text-sm font-medium leading-tight">
                              {m.experience_years} años · {(m.skills || []).slice(0, 2).join(', ')}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {m.bio?.slice(0, 60)}…
                            </div>
                          </div>
                        </div>
                        <div className="flex items-baseline gap-0.5 font-mono">
                          <span className="text-lg font-semibold tabular-nums text-foreground">
                            {Math.round(m.match_score * 100)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </MacWindow>

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
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
                    {matches.length} <em className="italic text-accent">match{matches.length !== 1 && 'es'}</em>
                  </h2>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {matches.map((match) => {
                  const score = Math.round(match.match_score * 100)
                  const isTop = score >= 80
                  return (
                    <div
                      key={match.id}
                      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.18)]"
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
                        <div className="relative">
                          <div className="flex size-20 items-center justify-center rounded-2xl bg-foreground text-background">
                            <div className="text-center">
                              <div className="font-serif text-2xl leading-none text-accent">
                                {score}
                              </div>
                              <div className="font-mono text-[8px] uppercase tracking-wider text-background/50">
                                match
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-serif text-xl leading-tight tracking-tight">
                            Candidato compatible
                          </h3>
                          <p className="mt-1 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                            {match.experience_years} años · {(match.skills || []).length} skills
                          </p>
                          {match.bio && (
                            <p className="mt-3 text-sm italic leading-relaxed text-muted-foreground line-clamp-2">
                              "{match.bio}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 space-y-2">
                        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          ¿por qué matchea?
                        </div>
                        <ul className="space-y-1.5">
                          {match.reasons.map((reason: string, i: number) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-foreground/80"
                            >
                              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-accent" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {match.skills && match.skills.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-1.5">
                          {match.skills.slice(0, 5).map((skill: string, i: number) => (
                            <Badge key={i} variant="soft" className="rounded-md">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
