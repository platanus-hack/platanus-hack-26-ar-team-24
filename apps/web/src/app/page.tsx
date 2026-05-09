'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Sparkles, Cpu, Users, Command } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AmbientBg } from '@/components/ambient-bg'
import { Wordmark } from '@/components/wordmark'
import { MacWindow } from '@/components/mac-window'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        const userType = session.user.user_metadata?.user_type
        if (userType === 'talent') {
          router.push('/dashboard/talent')
          return
        } else if (userType === 'founder') {
          router.push('/dashboard/founder')
          return
        } else {
          router.push('/onboarding/select-type')
          return
        }
      }

      setLoading(false)
    }

    checkSession()
  }, [router])

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <AmbientBg />
        <div className="size-12 rounded-full bg-foreground/90 animate-pulse-ring" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AmbientBg />

      {/* Top nav — floating macOS pill */}
      <header className="sticky top-4 z-50 px-4">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 glass rounded-full px-3 py-2 pl-5">
          <Wordmark />
          <div className="hidden items-center gap-1 md:flex">
            <a
              href="#how"
              className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground"
            >
              Cómo funciona
            </a>
            <a
              href="#manifesto"
              className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground"
            >
              Manifesto
            </a>
          </div>
          <Button asChild size="sm" variant="default">
            <Link href="/auth">
              Ingresar
              <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative px-4 pt-20 pb-24 sm:pt-28">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center animate-fade-in">
            <Badge variant="outline" className="mb-6 gap-1.5 px-3 py-1 text-[11px]">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
              </span>
              Agentes IA · Match en tiempo real
            </Badge>

            <h1 className="font-serif text-[clamp(2.75rem,8vw,6.5rem)] font-normal leading-[0.95] tracking-tight text-balance">
              Equipos que no <em className="italic text-accent">deberían</em>
              <br />
              haberse encontrado.
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              AgentLink combina founders y talento mediante agentes de IA que entienden
              skills, cultura y química. Sin scrolls infinitos. Sin matches tibios.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
              <Button asChild size="xl" variant="accent" className="glow-accent">
                <Link href="/auth">
                  Empezar gratis
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="glass">
                <a href="#how">
                  <Command className="size-4" />
                  Ver cómo funciona
                </a>
              </Button>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
              <kbd className="font-mono inline-flex h-5 items-center gap-1 rounded border border-border bg-card/60 px-1.5 text-[10px] backdrop-blur">
                ⌘
              </kbd>
              <span>+</span>
              <kbd className="font-mono inline-flex h-5 items-center rounded border border-border bg-card/60 px-1.5 text-[10px] backdrop-blur">
                K
              </kbd>
              <span>para acción rápida</span>
            </div>
          </div>

          {/* Hero showcase — mac window mockup */}
          <div className="mt-20 animate-fade-in [animation-delay:200ms]">
            <MacWindow
              title="agentlink — match.tsx"
              subtitle="conectando agentes…"
              className="mx-auto max-w-5xl"
            >
              <div className="grid gap-px bg-border/60 sm:grid-cols-[1fr_1.4fr]">
                {/* Left: composer */}
                <div className="bg-card/60 p-6 backdrop-blur sm:p-8">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Founder · Buenos Aires
                  </div>
                  <div className="mt-4 font-serif text-2xl leading-tight text-foreground">
                    {`"Buscamos un fullstack que sepa de IA y se banque construir desde cero."`}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-1.5">
                    {['React', 'Python', 'OpenAI', 'PostgreSQL', 'Early-stage'].map((t) => (
                      <Badge key={t} variant="soft" className="rounded-md">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Right: matches */}
                <div className="bg-background/40 p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      3 matches encontrados
                    </div>
                    <Sparkles className="size-3.5 text-accent" />
                  </div>
                  <div className="mt-4 space-y-2.5">
                    {[
                      { name: 'María L.', role: 'Senior Fullstack', score: 96 },
                      { name: 'Joaquín R.', role: 'AI Engineer', score: 91 },
                      { name: 'Ana V.', role: 'Tech Lead', score: 88 },
                    ].map((c) => (
                      <div
                        key={c.name}
                        className="group flex items-center justify-between rounded-xl border border-border/60 bg-card/70 px-4 py-3 backdrop-blur transition hover:bg-card hover:-translate-y-px"
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-gradient-to-br from-foreground/80 to-foreground/40 ring-1 ring-foreground/10" />
                          <div>
                            <div className="text-sm font-medium leading-tight">
                              {c.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {c.role}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-baseline gap-0.5 font-mono">
                          <span className="text-lg font-semibold tabular-nums text-foreground">
                            {c.score}
                          </span>
                          <span className="text-[10px] text-muted-foreground">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </MacWindow>
          </div>
        </div>
      </section>

      {/* Two paths */}
      <section className="relative px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-end justify-between gap-4">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                / 01 — elegí tu lado
              </div>
              <h2 className="mt-3 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
                Dos caminos.
                <br />
                <span className="italic text-muted-foreground">Una sola red.</span>
              </h2>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Talent */}
            <Link href="/auth" className="group">
              <article className="relative h-full overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.18)]">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
                <div className="flex items-start justify-between">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-foreground text-background">
                    <Users className="size-5" />
                  </div>
                  <ArrowUpRight className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
                <div className="mt-12">
                  <Badge variant="outline" className="mb-3">Talento</Badge>
                  <h3 className="font-serif text-3xl leading-tight tracking-tight">
                    Sumate a una <em className="italic">startup que vibra</em>.
                  </h3>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    Mostrá lo que hacés. Tu agente IA va a buscar founders que valoren tu
                    stack, tu energía y tu visión.
                  </p>
                </div>
              </article>
            </Link>

            {/* Founder */}
            <Link href="/auth/register?type=founder" className="group">
              <article className="relative h-full overflow-hidden rounded-3xl border border-foreground bg-foreground p-8 text-background transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.4)]">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
                <div
                  className="absolute -right-20 -top-20 size-64 rounded-full bg-accent/30 blur-3xl"
                  aria-hidden
                />
                <div className="relative flex items-start justify-between">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <Cpu className="size-5" />
                  </div>
                  <ArrowUpRight className="size-5 text-background/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                </div>
                <div className="relative mt-12">
                  <Badge variant="accent" className="mb-3">Founder</Badge>
                  <h3 className="font-serif text-3xl leading-tight tracking-tight">
                    Encontrá tu <em className="italic text-accent">primer co-creador</em>.
                  </h3>
                  <p className="mt-4 text-background/70 leading-relaxed">
                    Definí la visión. Nuestros agentes van a peinar miles de perfiles para
                    devolverte sólo los que realmente importan.
                  </p>
                </div>
              </article>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              / 02 — el proceso
            </div>
            <h2 className="mt-3 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
              Tres pasos. <span className="italic text-muted-foreground">Cero ruido.</span>
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                n: '01',
                title: 'Creás tu perfil',
                desc: 'Skills, experiencia, visión. Lo justo para que el agente te entienda.',
              },
              {
                n: '02',
                title: 'Match con IA',
                desc: 'Agentes analizan compatibilidad técnica, cultural y de momentum.',
              },
              {
                n: '03',
                title: 'Conectás',
                desc: 'Sólo te mostramos personas que realmente tiene sentido conocer.',
              },
            ].map((step, i) => (
              <div
                key={step.n}
                className="group relative rounded-3xl border border-border bg-card/80 p-7 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-card hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.12)]"
              >
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs tracking-tight text-muted-foreground">
                    {step.n}
                  </div>
                  {i === 1 && (
                    <Badge variant="accent" className="text-[10px]">
                      <Sparkles className="size-2.5" />
                      Core
                    </Badge>
                  )}
                </div>
                <h3 className="mt-8 font-serif text-2xl leading-tight tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manifesto / closing */}
      <section id="manifesto" className="relative px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[32px] border border-border bg-foreground p-10 text-background sm:p-16">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
              / manifesto
            </div>
            <p className="mt-6 font-serif text-3xl leading-[1.15] tracking-tight sm:text-5xl">
              Construir algo grande no debería empezar con un{' '}
              <span className="italic text-accent">formulario tibio</span>. Empieza con
              una persona que ya entendió tu idea antes de que termines la frase.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="accent">
                <Link href="/auth">
                  Crear cuenta
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-background/20 bg-transparent text-background hover:bg-background/10"
              >
                <Link href="/auth">Ya tengo cuenta</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="px-4 pb-10 pt-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-xs text-muted-foreground">
          <Wordmark />
          <span className="font-mono">© {new Date().getFullYear()} · made in BA</span>
        </div>
      </footer>
    </div>
  )
}
