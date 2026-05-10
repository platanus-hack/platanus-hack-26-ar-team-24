'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Quote } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Logo from '@/components/layout/Logo'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (isLoading) return
    setError(null)

    if (!email || !password || !confirmPassword) {
      setError('Email y contraseña son requeridos.')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setIsLoading(true)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) throw signUpError

      if (data.session) {
        router.push('/dashboard')
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw new Error(
          'La cuenta se creó, pero esta instancia pide confirmación de email antes de iniciar sesión.'
        )
      }

      router.push('/dashboard')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No pudimos crear tu cuenta. Intentá de nuevo.'
      setError(message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 text-white grid grid-cols-1 lg:grid-cols-2">
      <aside className="relative hidden lg:flex flex-col justify-between p-12 border-r border-white/5 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse at 30% 20%, rgba(168,85,247,0.18), transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(6,182,212,0.12), transparent 55%)',
          }}
        />

        <div className="relative" />

        <div className="relative max-w-md">
          <Quote size={28} className="text-purple-400/50 mb-6" />
          <p className="font-serif text-3xl xl:text-4xl text-white leading-snug mb-6">
            &ldquo;Primero existe la cuenta.{' '}
            <span className="italic text-zinc-300">Después construimos el agente.</span>&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #a78bfa, transparent 70%)',
              }}
            />
            <div>
              <p className="text-sm text-white">Acceso seguro</p>
              <p className="text-[11px] text-zinc-500 font-mono">email · password · luego onboarding</p>
            </div>
          </div>
        </div>

        <div className="relative grid grid-cols-3 gap-6 max-w-md">
          <Stat value="1" label="cuenta" />
          <Stat value="0" label="agentes creados" />
          <Stat value="100%" label="después del acceso" />
        </div>
      </aside>

      <main className="relative flex items-center justify-center px-6 py-12 sm:py-16">
        <div className="absolute top-6 left-1/2 -translate-x-1/2">
          <Logo
            href="/landing"
            showMark={false}
            wordmarkClassName="font-sans text-xl sm:text-2xl font-extralight tracking-[0.28em] text-zinc-100 pl-[0.28em]"
          />
        </div>
        <Link
          href="/auth"
          className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          Volver
        </Link>

        <div className="w-full max-w-md">
          <p className="text-xs font-mono text-zinc-500 mb-3 tracking-wider uppercase">
            Crear cuenta
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl mb-3 leading-tight">
            Entrá con email,<br />
            <span className="italic text-zinc-300">armá el resto adentro.</span>
          </h1>
          <p className="text-zinc-400 mb-10">
            Este paso solo crea tu acceso. El onboarding y la creación o gestión de tu agente
            quedan para después de iniciar sesión.
          </p>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-500/30 bg-red-500/[0.06] p-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[11px] font-mono uppercase tracking-wider text-zinc-500"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="vos@ejemplo.com"
                disabled={isLoading}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-zinc-600 transition-colors focus:border-white/30 focus:bg-white/[0.05] focus:outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-[11px] font-mono uppercase tracking-wider text-zinc-500"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mínimo 6 caracteres"
                disabled={isLoading}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-zinc-600 transition-colors focus:border-white/30 focus:bg-white/[0.05] focus:outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="confirm_password"
                className="mb-2 block text-[11px] font-mono uppercase tracking-wider text-zinc-500"
              >
                Repetir contraseña
              </label>
              <input
                id="confirm_password"
                type="password"
                name="confirm_password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repetí tu contraseña"
                disabled={isLoading}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-zinc-600 transition-colors focus:border-white/30 focus:bg-white/[0.05] focus:outline-none disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              aria-busy={isLoading}
              className="mt-2 flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-xl bg-white px-4 py-3.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creando cuenta…
                </>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-500">
            ¿Ya tenés cuenta?{' '}
            <Link href="/auth/login" className="text-white transition-colors hover:text-zinc-300">
              Iniciar sesión
            </Link>
          </p>

          <p className="mt-10 text-center text-xs text-zinc-600">
            Al continuar aceptás los términos. Tu data es tuya — siempre.
          </p>
        </div>
      </main>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-2xl text-white tabular-nums">{value}</p>
      <p className="mt-0.5 text-[11px] text-zinc-500">{label}</p>
    </div>
  )
}
