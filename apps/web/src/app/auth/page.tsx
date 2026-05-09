'use client'

import { supabase } from '@/lib/supabase'
import { MacWindow } from '@/components/mac-window'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sparkles } from 'lucide-react'

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
    <div className="w-full max-w-md animate-fade-in">
      <MacWindow title="auth.agentlink" subtitle="sesión segura">
        <div className="p-8 sm:p-10">
          <div className="mb-8">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              / acceso
            </div>
            <h1 className="mt-3 font-serif text-4xl leading-[1] tracking-tight">
              Bienvenido <em className="italic text-muted-foreground">de nuevo</em>.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Conectá tu cuenta y dejá que tu agente haga el resto.
            </p>
          </div>

          <Button
            onClick={handleGoogleLogin}
            size="lg"
            variant="default"
            className="w-full"
          >
            <svg className="size-4" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar con Google
          </Button>

          <div className="my-7 flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              o
            </span>
            <Separator className="flex-1" />
          </div>

          <div className="rounded-2xl border border-border bg-foreground/[0.02] p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Sparkles className="size-4" />
              </div>
              <div>
                <div className="text-sm font-medium">Match-first auth</div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Tu sesión se vincula automáticamente con tu agente personal —
                  sin contraseñas, sin fricción.
                </p>
              </div>
            </div>
          </div>
        </div>
      </MacWindow>
    </div>
  )
}
