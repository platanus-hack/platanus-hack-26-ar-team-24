'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Logo from '@/components/layout/Logo'

type Status = 'pending' | 'error'

export default function CallbackPage() {
  const router = useRouter()
  const calledRef = useRef(false)
  const [status, setStatus] = useState<Status>('pending')

  useEffect(() => {
    if (calledRef.current) return
    calledRef.current = true

    const handleCallback = async () => {
      try {
        // Give Supabase a moment to process the URL fragment
        await new Promise((resolve) => setTimeout(resolve, 500))

        const { data, error } = await supabase.auth.getSession()

        if (error || !data.session) {
          console.error('No session:', error)
          setStatus('error')
          return
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', data.session.access_token)
          localStorage.setItem('user_id', data.session.user.id)
        }

        // Small buffer so storage settles before navigating
        await new Promise((resolve) => setTimeout(resolve, 200))

        router.replace('/onboarding/sync')
      } catch (err) {
        console.error('Callback error:', err)
        setStatus('error')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-ink-950 text-white relative overflow-hidden flex items-center justify-center px-6">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(168,85,247,0.18), transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(6,182,212,0.12), transparent 55%)',
        }}
      />

      <div className="absolute top-6 left-6">
        <Logo href="/landing" />
      </div>

      <div className="relative w-full max-w-md text-center">
        {status === 'pending' ? (
          <>
            <div className="relative inline-flex items-center justify-center mb-8">
              <div
                className="absolute w-24 h-24 rounded-full"
                aria-hidden="true"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, #a78bfa, transparent 70%)',
                  filter: 'blur(2px)',
                }}
              />
              <div className="relative w-12 h-12 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center">
                <Loader2 size={18} className="animate-spin text-white" />
              </div>
            </div>

            <p className="text-xs font-mono text-zinc-500 mb-3 tracking-wider uppercase">
              Conectando
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl mb-3 leading-tight">
              Sincronizando tu<br />
              <span className="italic text-zinc-300">identidad.</span>
            </h1>
            <p className="text-zinc-400 text-sm">
              Tu agente está leyendo lo que ya está disponible. Un segundo.
            </p>
          </>
        ) : (
          <>
            <p className="text-xs font-mono text-red-300/80 mb-3 tracking-wider uppercase">
              Sesión no detectada
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl mb-3 leading-tight">
              No pudimos cerrar el ingreso.
            </h1>
            <p className="text-zinc-400 text-sm mb-8">
              El proveedor no devolvió una sesión válida. Intentá de nuevo desde la pantalla de acceso.
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors min-h-[48px]"
            >
              Volver a acceder
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
