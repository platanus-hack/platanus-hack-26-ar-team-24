'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Quote, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Logo from '@/components/layout/Logo'

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    if (isLoading) return
    setError(null)
    setIsLoading(true)

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (oauthError) {
        throw oauthError
      }
    } catch (err) {
      console.error('Google OAuth error:', err)
      setError('No pudimos iniciar tu sesión con Google. Intentá de nuevo.')
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

        <div className="relative">
          <Logo href="/landing" />
        </div>

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
        <Link
          href="/landing"
          className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          Volver
        </Link>

        <div className="w-full max-w-md">
          <div className="lg:hidden mb-10">
            <Logo />
          </div>

          <p className="text-xs font-mono text-zinc-500 mb-3 tracking-wider uppercase">
            Acceder
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl mb-3 leading-tight">
            Tu agente te está<br />
            <span className="italic text-zinc-300">esperando.</span>
          </h1>
          <p className="text-zinc-400 mb-10">
            Empezá con tu identidad existente. Ya entrenamos modelos contra
            <span className="text-white"> 1,284</span> personas — solo falta vos.
          </p>

          {error && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-500/[0.06] text-sm text-red-300"
            >
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              aria-busy={isLoading}
              className="w-full py-3.5 px-4 bg-white text-black rounded-xl font-medium text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2.5 min-h-[48px] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Conectando…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continuar con Google
                </>
              )}
            </button>

            <Link
              href="/auth/login"
              className="w-full py-3.5 px-4 rounded-xl border border-white/10 bg-white/[0.03] text-white font-medium text-sm hover:bg-white/[0.06] transition-colors flex items-center justify-center min-h-[48px]"
            >
              Email y contraseña
            </Link>
          </div>

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
