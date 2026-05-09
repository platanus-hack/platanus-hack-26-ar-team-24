'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'
import { AmbientBg } from '@/components/ambient-bg'

export default function CallbackPage() {
  const router = useRouter()
  const calledRef = useRef(false)

  useEffect(() => {
    if (calledRef.current) return
    calledRef.current = true

    const handleCallback = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))

        const { data, error } = await supabase.auth.getSession()

        if (error || !data.session) {
          console.error('No session:', error)
          window.location.href = '/auth'
          return
        }

        const token = data.session.access_token
        api.setToken(token)

        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token)
          localStorage.setItem('user_id', data.session.user.id)
        }

        await new Promise((resolve) => setTimeout(resolve, 200))
        window.location.href = '/onboarding/select-type'
      } catch (err) {
        console.error('Callback error:', err)
        window.location.href = '/auth'
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <AmbientBg />
      <div className="text-center">
        <div className="mx-auto size-12 rounded-full bg-foreground animate-pulse-ring" />
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          conectando agente…
        </p>
      </div>
    </div>
  )
}
