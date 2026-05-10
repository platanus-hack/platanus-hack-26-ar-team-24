'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Quote, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Logo from '@/components/layout/Logo'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    setError(null)

    if (!email || !password) {
      setError('Email y contraseña son requeridos.')
      return
    }

    setIsLoading(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      router.push('/dashboard')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No pudimos iniciar sesión. Intentá de nuevo.'
      setError(message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 text-white grid grid-cols-1 lg:grid-cols-2">
      {/* LEFT — editorial side */}
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
            &ldquo;Las conexiones que importan no se buscan.{' '}
            <span className="italic text-zinc-300">Se reconocen.</span>&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #a78bfa, transparent 70%)',
              }}
            />
            <div>
              <p className="text-sm text-white">Tu agente IA</p>
              <p className="text-[11px] text-zinc-500 font-mono">v2.1 · listo para vos</p>
            </div>
          </div>
        </div>

        <div className="relative grid grid-cols-3 gap-6 max-w-md">
          <Stat value="1,284" label="simulaciones" />
          <Stat value="37%" label="match rate" />
          <Stat value="21" label="conexiones reales" />
        </div>
      </aside>

      {/* RIGHT — form side */}
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
            Email y contraseña
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl mb-3 leading-tight">
            Volvé con tu<br />
            <span className="italic text-zinc-300">agente.</span>
          </h1>
          <p className="text-zinc-400 mb-10">
            Ingresá con tu cuenta para retomar tus simulaciones y matches abiertos.
          </p>

          {error && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-500/[0.06] text-sm text-red-300"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vos@ejemplo.com"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-colors disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-colors disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              aria-busy={isLoading}
              className="w-full py-3.5 px-4 bg-white text-black rounded-xl font-medium text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2.5 min-h-[48px] mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Ingresando…
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-8">
            ¿Sin cuenta?{' '}
            <Link href="/auth/register" className="text-white hover:text-zinc-300 transition-colors">
              Crear una
            </Link>
          </p>

          <p className="text-center text-xs text-zinc-600 mt-10">
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
      <p className="text-[11px] text-zinc-500 mt-0.5">{label}</p>
    </div>
  )
}
