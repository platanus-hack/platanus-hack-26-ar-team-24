'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SelectTypePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleSelectType = async (userType: 'talent' | 'founder') => {
    setLoading(true)
    setError('')

    try {
      console.log('Updating user type to:', userType)

      const { data, error: updateError } = await supabase.auth.updateUser({
        data: { user_type: userType },
      })

      console.log('Update result:', { data, updateError })

      if (updateError) {
        console.error('Update error:', updateError)
        throw new Error(updateError.message || 'Failed to update user type')
      }

      console.log('User type updated successfully, redirecting...')

      if (userType === 'talent') {
        window.location.href = '/onboarding/candidate'
      } else {
        window.location.href = '/onboarding/startup'
      }
    } catch (err: any) {
      console.error('Error in handleSelectType:', err)
      setError(err.message || 'An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            Welcome to AgentLink
          </h1>
          <p className="text-slate-400">What's your role?</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-300 text-center">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Talent Path */}
          <button
            onClick={() => handleSelectType('talent')}
            disabled={loading}
            className="group p-8 bg-slate-800/50 border border-purple-500/30 rounded-xl hover:border-purple-400 transition-all hover:bg-slate-800/70 cursor-pointer disabled:opacity-50"
          >
            <div className="text-4xl mb-4">💼</div>
            <h2 className="text-2xl font-bold mb-3 group-hover:text-purple-300 transition">
              I'm a Talent
            </h2>
            <p className="text-slate-400 group-hover:text-slate-300 transition">
              I'm looking to join a startup and grow with a team.
            </p>
            <div className="mt-6 inline-block px-6 py-2 bg-purple-600 group-hover:bg-purple-500 rounded-lg transition">
              {loading ? 'Loading...' : 'Continue'}
            </div>
          </button>

          {/* Founder Path */}
          <button
            onClick={() => handleSelectType('founder')}
            disabled={loading}
            className="group p-8 bg-slate-800/50 border border-pink-500/30 rounded-xl hover:border-pink-400 transition-all hover:bg-slate-800/70 cursor-pointer disabled:opacity-50"
          >
            <div className="text-4xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold mb-3 group-hover:text-pink-300 transition">
              I'm a Founder
            </h2>
            <p className="text-slate-400 group-hover:text-slate-300 transition">
              I'm building a startup and looking for talented team members.
            </p>
            <div className="mt-6 inline-block px-6 py-2 bg-pink-600 group-hover:bg-pink-500 rounded-lg transition">
              {loading ? 'Loading...' : 'Continue'}
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
