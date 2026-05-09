'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, Github, Linkedin, LogOut, Sparkles, Activity } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AmbientBg } from '@/components/ambient-bg'
import { Wordmark } from '@/components/wordmark'
import { MacWindow } from '@/components/mac-window'
import { AgentOrb } from '@/components/agent-orb'
import { MatchRadar, type RadarDatum } from '@/components/match-radar'
import { AnimatedNumber } from '@/components/animated-number'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function TalentDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [hasProfile, setHasProfile] = useState(true)

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
          .from('candidate_profiles')
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <AmbientBg />
        <AgentOrb variant="cyan" size={96} />
      </div>
    )
  }

  if (!hasProfile) {
    return (
      <div className="relative min-h-screen px-4 py-16">
        <AmbientBg />
        <div className="mx-auto max-w-xl">
          <MacWindow title="profile required" variant="cyan">
            <div className="flex flex-col items-center p-10 text-center">
              <AgentOrb variant="cyan" size={88} className="mb-6" />
              <h2 className="font-serif text-3xl leading-tight tracking-tight">
                Antes de matchear, <em className="italic text-neon-cyan">contate</em>.
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Creá tu perfil de talento para que los agentes puedan encontrarte.
              </p>
              <Button asChild size="lg" variant="accent" className="mt-6 glow-accent">
                <Link href="/onboarding/candidate">
                  Crear perfil
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </MacWindow>
        </div>
      </div>
    )
  }

  const username =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0]

  const skillsCount = profileData?.skills?.length ?? 0
  const techCount = profileData?.technologies?.length ?? 0
  const expYears = profileData?.experience_years ?? 0
  const bioLen = profileData?.bio?.length ?? 0

  const radarData: RadarDatum[] = [
    { axis: 'Skills', value: Math.min(skillsCount * 14, 100) },
    { axis: 'Tech', value: Math.min(techCount * 14, 100) },
    { axis: 'Exp', value: Math.min(expYears * 12, 100) },
    { axis: 'Bio', value: Math.min(bioLen / 3, 100) },
    {
      axis: 'Links',
      value:
        (profileData?.github_url ? 50 : 0) + (profileData?.linkedin_url ? 50 : 0),
    },
  ]

  const profileStrength = Math.round(
    radarData.reduce((acc, d) => acc + d.value, 0) / radarData.length
  )

  return (
    <div className="relative min-h-screen">
      <AmbientBg />

      <header className="sticky top-4 z-40 px-4">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 glass rounded-full px-3 py-2 pl-5">
          <Wordmark />
          <div className="flex items-center gap-2">
            <Badge variant="cyan" className="font-mono text-[10px]">
              <span className="mr-1 size-1.5 rounded-full bg-traffic-green animate-pulse" />
              talento · activo
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
          className="mx-auto max-w-6xl space-y-6"
        >
          {/* Hero */}
          <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                / dashboard · talento
              </div>
              <h1 className="mt-1 font-serif text-5xl leading-[0.95] tracking-tight sm:text-7xl">
                Hola, <em className="italic text-neon-cyan">{username}</em>.
              </h1>
              <p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">
                Tu perfil está vivo. Founders y agentes están explorando match en este
                momento.
              </p>
            </div>
            <AgentOrb variant="cyan" size={96} className="shrink-0" />
          </div>

          {/* Stats row */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: 'Profile strength',
                value: profileStrength,
                suffix: '%',
                variant: 'cyan' as const,
              },
              {
                label: 'Experiencia',
                value: expYears,
                suffix: ' años',
                variant: 'emerald' as const,
              },
              {
                label: 'Skills declarados',
                value: skillsCount + techCount,
                suffix: '',
                variant: 'pink' as const,
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 p-5 backdrop-blur-xl"
              >
                <div
                  aria-hidden
                  className="absolute -right-12 -top-12 size-32 rounded-full blur-2xl"
                  style={{
                    background:
                      stat.variant === 'cyan'
                        ? 'color-mix(in oklab, var(--accent-cyan) 25%, transparent)'
                        : stat.variant === 'emerald'
                        ? 'color-mix(in oklab, var(--accent-emerald) 25%, transparent)'
                        : 'color-mix(in oklab, var(--accent-pink) 25%, transparent)',
                  }}
                />
                <div className="relative">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {stat.label}
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-serif text-5xl leading-none tabular-nums text-foreground">
                      <AnimatedNumber value={stat.value} duration={1400} />
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {stat.suffix}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bio + Radar */}
          <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
            <div className="rounded-2xl border border-white/10 bg-card/60 p-7 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <Badge variant="soft" className="rounded-md">
                  Sobre vos
                </Badge>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  bio
                </span>
              </div>
              <p className="mt-4 font-serif text-2xl leading-snug text-foreground">
                "{profileData?.bio}"
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <Badge variant="cyan" className="rounded-md">
                  <Activity className="size-3" />
                  Agent profile
                </Badge>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  radar
                </span>
              </div>
              <MatchRadar data={radarData} height={240} />
            </div>
          </div>

          {/* Skills + Tech */}
          <div className="grid gap-5 md:grid-cols-2">
            {profileData?.skills && profileData.skills.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <Badge variant="soft" className="rounded-md">
                    Skills
                  </Badge>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {profileData.skills.length} items
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {profileData.skills.map((skill: string, i: number) => (
                    <Badge key={i} variant="cyan" className="rounded-md">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {profileData?.technologies && profileData.technologies.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <Badge variant="soft" className="rounded-md">
                    Tecnologías
                  </Badge>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {profileData.technologies.length} items
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {profileData.technologies.map((tech: string, i: number) => (
                    <Badge key={i} variant="accent" className="rounded-md">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Links */}
          {(profileData?.github_url || profileData?.linkedin_url) && (
            <div className="flex flex-wrap gap-2 px-1">
              {profileData?.github_url && (
                <Button asChild variant="outline" size="sm">
                  <a
                    href={profileData.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="size-3.5" />
                    GitHub
                  </a>
                </Button>
              )}
              {profileData?.linkedin_url && (
                <Button asChild variant="outline" size="sm">
                  <a
                    href={profileData.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="size-3.5" />
                    LinkedIn
                  </a>
                </Button>
              )}
            </div>
          )}

          {/* Waiting state */}
          <MacWindow
            title="matching engine"
            subtitle="agente activo · escaneando"
            variant="purple"
          >
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <AgentOrb variant="purple" size={96} className="mb-6" />
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <Sparkles className="mr-1 inline size-3" />
                matching engine · activo
              </div>
              <h3 className="mt-3 font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
                Esperando <em className="italic text-neon">la persona indicada</em>.
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                Los agentes de los founders están analizando tu perfil. Cuando haya un
                match relevante, te avisamos.
              </p>
            </div>
          </MacWindow>
        </motion.div>
      </main>
    </div>
  )
}
