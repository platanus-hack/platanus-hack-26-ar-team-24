'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'

export default function CallbackPage() {
  const router = useRouter()
  const calledRef = useRef(false)

  useEffect(() => {
    if (calledRef.current) return
    calledRef.current = true

    const handleCallback = async () => {
      try {
        // Small delay to ensure URL params are processed
        await new Promise(resolve => setTimeout(resolve, 500))

        const { data, error } = await supabase.auth.getSession()

        if (error || !data.session) {
          console.error('No session:', error)
          window.location.href = '/auth'
          return
        }

        // Store the token for API calls
        const token = data.session.access_token
        console.log('✅ Got token from Supabase')
        api.setToken(token)

        // Store in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token)
          localStorage.setItem('user_id', data.session.user.id)
          console.log('✅ Token stored in localStorage')
        }

        // Wait a moment for storage to complete
        await new Promise(resolve => setTimeout(resolve, 200))

        console.log('✅ Redirecting to sync...')
        window.location.href = '/onboarding/sync'
      } catch (err) {
        console.error('Callback error:', err)
        window.location.href = '/auth'
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
        <p className="mt-4 text-slate-300">Signing you in...</p>
      </div>
    </div>
  )
}
