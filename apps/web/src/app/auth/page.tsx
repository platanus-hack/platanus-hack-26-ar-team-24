'use client'

import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AuthPage() {
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        },
      })
      if (error) console.error('Login error:', error)
    } catch (err) {
      console.error('OAuth error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 text-white flex items-center justify-center px-6 relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,255,255,0.04), transparent 60%)',
        }}
      />

      <Link
        href="/landing"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
      >
        <ArrowLeft size={14} />
        Volver
      </Link>

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-10 h-10 rounded-lg bg-white text-black flex items-center justify-center font-serif text-lg font-bold mx-auto mb-6">
            A
          </div>
          <h1 className="font-serif text-3xl mb-2">Acceder a AgentLink</h1>
          <p className="text-sm text-zinc-400">
            Tu agente te está esperando.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 bg-white text-black rounded-xl font-medium text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2.5 min-h-[48px]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar con Google
          </button>

          <Link
            href="/auth/login"
            className="w-full py-3 px-4 rounded-xl border border-white/10 bg-white/[0.03] text-white font-medium text-sm hover:bg-white/[0.06] transition-colors flex items-center justify-center min-h-[48px]"
          >
            Email y contraseña
          </Link>

          <Link
            href="/onboarding/sync"
            className="w-full py-3 px-4 rounded-xl border border-dashed border-white/10 text-zinc-400 font-medium text-sm hover:text-white hover:border-white/20 transition-colors flex items-center justify-center min-h-[48px]"
          >
            Saltar al demo →
          </Link>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-8">
          Al continuar aceptás los términos. Tu data es tuya.
        </p>
      </div>
    </div>
  )
}
