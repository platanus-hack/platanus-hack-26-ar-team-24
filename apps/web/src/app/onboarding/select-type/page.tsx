'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Briefcase, Rocket, Cpu } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AmbientBg } from '@/components/ambient-bg'
import { Wordmark } from '@/components/wordmark'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function SelectTypePage() {
  const router = useRouter()
  const [loading, setLoading] = useState<'talent' | 'founder' | null>(null)
  const [error, setError] = useState<string>('')

  const handleSelectType = async (userType: 'talent' | 'founder') => {
    setLoading(userType)
    setError('')

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { user_type: userType },
      })

      if (updateError) {
        throw new Error(updateError.message || 'No se pudo actualizar el tipo de usuario')
      }

      if (userType === 'talent') {
        window.location.href = '/onboarding/candidate'
      } else {
        window.location.href = '/onboarding/startup'
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error. Probá de nuevo.')
      setLoading(null)
    }
  }

  void router

  return (
    <div className="relative min-h-screen">
      <AmbientBg />

      <header className="px-6 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Wordmark />
          <Badge variant="outline" className="font-mono text-[10px]">
            STEP 01 / 02
          </Badge>
        </div>
      </header>

      <main className="px-4 pb-20 pt-12">
        <div className="mx-auto max-w-5xl animate-fade-in">
          <div className="mb-12 text-center">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              / elegí tu rol
            </div>
            <h1 className="mt-4 font-serif text-5xl leading-[0.95] tracking-tight sm:text-7xl">
              ¿Qué venís
              <br />
              a <em className="italic text-accent">construir</em>?
            </h1>
            <p className="mx-auto mt-6 max-w-md text-muted-foreground leading-relaxed">
              Esto define qué tipo de agente te asignamos. Podés cambiarlo más tarde.
            </p>
          </div>

          {error && (
            <div className="mx-auto mb-8 max-w-md rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-center text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            {/* Talent */}
            <button
              onClick={() => handleSelectType('talent')}
              disabled={loading !== null}
              className={cn(
                'group relative overflow-hidden rounded-3xl border border-border bg-card p-8 text-left transition-all duration-300',
                'hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.18)]',
                'disabled:opacity-50',
                loading === 'talent' && 'ring-2 ring-foreground/30'
              )}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
              <div className="flex items-start justify-between">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-foreground text-background">
                  <Briefcase className="size-5" />
                </div>
                <ArrowUpRight className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </div>
              <div className="mt-12">
                <Badge variant="outline" className="mb-3">Talento</Badge>
                <h2 className="font-serif text-3xl leading-tight tracking-tight">
                  Soy <em className="italic">talento</em>
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Estoy buscando sumarme a una startup y crecer con un equipo.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                  <Cpu className="size-3.5" />
                  {loading === 'talent' ? 'asignando agente…' : 'continuar'}
                </div>
              </div>
            </button>

            {/* Founder */}
            <button
              onClick={() => handleSelectType('founder')}
              disabled={loading !== null}
              className={cn(
                'group relative overflow-hidden rounded-3xl border border-foreground bg-foreground p-8 text-left text-background transition-all duration-300',
                'hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.4)]',
                'disabled:opacity-50',
                loading === 'founder' && 'ring-2 ring-accent'
              )}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
              <div className="absolute -right-20 -top-20 size-64 rounded-full bg-accent/30 blur-3xl" aria-hidden />
              <div className="relative flex items-start justify-between">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <Rocket className="size-5" />
                </div>
                <ArrowUpRight className="size-5 text-background/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
              </div>
              <div className="relative mt-12">
                <Badge variant="accent" className="mb-3">Founder</Badge>
                <h2 className="font-serif text-3xl leading-tight tracking-tight">
                  Soy <em className="italic text-accent">founder</em>
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-background/70">
                  Estoy construyendo una startup y busco team members talentosos.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-background/60">
                  <Cpu className="size-3.5" />
                  {loading === 'founder' ? 'asignando agente…' : 'continuar'}
                </div>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
