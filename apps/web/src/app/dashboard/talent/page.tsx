'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight, Github, Linkedin, LogOut, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AmbientBg } from '@/components/ambient-bg'
import { Wordmark } from '@/components/wordmark'
import { MacWindow } from '@/components/mac-window'
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
                Antes de matchear, <em className="italic">contate</em>.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Creá tu perfil de talento para que los agentes puedan encontrarte.
              </p>
              <Button asChild size="lg" variant="default" className="mt-6">
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

  return (
    <div className="relative min-h-screen">
      <AmbientBg />

      {/* Top bar */}
      <header className="sticky top-4 z-40 px-4">
        <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 glass rounded-full px-3 py-2 pl-5">
          <Wordmark />
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-[10px]">
              <span className="mr-1 size-1.5 rounded-full bg-traffic-green" />
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
        <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
          {/* Hero */}
          <div className="flex flex-col gap-2 px-2">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              / dashboard · talento
            </div>
            <h1 className="font-serif text-5xl leading-[0.95] tracking-tight sm:text-7xl">
              Hola, <em className="italic text-accent">{username}</em>.
            </h1>
            <p className="mt-2 max-w-xl text-muted-foreground leading-relaxed">
              Tu perfil está vivo. Founders y agentes están explorando match en este momento.
            </p>
          </div>

          {/* Status card */}
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 md:col-span-2">
              <div className="flex items-center justify-between">
                <Badge variant="soft" className="rounded-md">
                  Sobre vos
                </Badge>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  bio
                </span>
              </div>
              <p className="mt-4 font-serif text-xl leading-snug text-foreground">
                "{profileData?.bio}"
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-foreground bg-foreground p-6 text-background">
              <div
                className="absolute -right-16 -top-16 size-48 rounded-full bg-accent/30 blur-3xl"
                aria-hidden
              />
              <div className="relative">
                <Badge variant="accent" className="rounded-md">
                  Experiencia
                </Badge>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-serif text-6xl leading-none tracking-tight text-accent">
                    {profileData?.experience_years ?? 0}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-wider text-background/60">
                    años
                  </span>
                </div>
                <p className="mt-2 text-xs text-background/60">
                  en industria · validados por agente
                </p>
              </div>
            </div>
          </div>

          {/* Skills + Tech */}
          <div className="grid gap-5 md:grid-cols-2">
            {profileData?.skills && profileData.skills.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6">
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
                    <Badge key={i} variant="default" className="rounded-md">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {profileData?.technologies && profileData.technologies.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6">
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
                  <a href={profileData.github_url} target="_blank" rel="noopener noreferrer">
                    <Github className="size-3.5" />
                    GitHub
                  </a>
                </Button>
              )}
              {profileData?.linkedin_url && (
                <Button asChild variant="outline" size="sm">
                  <a href={profileData.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="size-3.5" />
                    LinkedIn
                  </a>
                </Button>
              )}
            </div>
          )}

          {/* Waiting state */}
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 text-center">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center">
              <span className="absolute size-16 rounded-full bg-accent/20 animate-pulse-ring" />
              <span className="relative size-3 rounded-full bg-accent" />
            </div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              / matching engine · activo
            </div>
            <h3 className="mt-3 font-serif text-3xl leading-tight tracking-tight">
              Esperando <em className="italic">la persona indicada</em>.
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Los agentes de los founders están analizando tu perfil. Cuando haya un
              match relevante, te avisamos.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
