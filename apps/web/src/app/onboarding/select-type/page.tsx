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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      console.log('👤 Creating/updating user with type:', userType, 'User ID:', user.id)

      const username = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'user'

      // Check if user exists in users table
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      console.log('User existence check:', { existingUser, checkError })

      if (!existingUser) {
        console.log('Creating new user record...')
        // Create user record with user_type
        const { error: createError, data: createData } = await supabase
          .from('users')
          .insert([{
            id: user.id,
            email: user.email,
            username: username,
            user_type: userType,
            password_hash: 'oauth_user',
          }])
          .select()

        console.log('User create result:', { createData, createError })

        if (createError) {
          console.error('❌ User create error:', createError)
          throw createError
        }
      } else {
        console.log('Updating existing user...')
        // Update existing user with user_type
        const { error: updateError, data: updateData } = await supabase
          .from('users')
          .update({ user_type: userType })
          .eq('id', user.id)
          .select()

        console.log('User update result:', { updateData, updateError })

        if (updateError) {
          console.error('❌ User update error:', updateError)
          throw updateError
        }
      }

      console.log('✅ User type saved successfully, redirecting...')

      if (userType === 'talent') {
        window.location.href = '/onboarding/candidate'
      } else {
        window.location.href = '/onboarding/startup'
      }
    } catch (err: any) {
      console.error('❌ Error in handleSelectType:', err)
      setError(err.message || 'An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-playfair font-bold mb-2 text-primary">
            Welcome to AgentLink
          </h1>
          <p className="text-primary/70">What's your role?</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-2xl text-red-700 text-center">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Talent Path */}
          <button
            onClick={() => handleSelectType('talent')}
            disabled={loading}
            className="group p-8 bg-white border border-secondary rounded-3xl hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <div className="text-4xl mb-4">💼</div>
            <h2 className="text-2xl font-playfair font-bold mb-3 group-hover:text-primary/80 transition text-primary">
              I'm a Talent
            </h2>
            <p className="text-primary/70 group-hover:text-primary/80 transition">
              I'm looking to join a startup and grow with a team.
            </p>
            <div className="mt-6 inline-block px-6 py-2 bg-primary text-white hover:bg-opacity-90 rounded-full transition">
              {loading ? 'Loading...' : 'Continue'}
            </div>
          </button>

          {/* Founder Path */}
          <button
            onClick={() => handleSelectType('founder')}
            disabled={loading}
            className="group p-8 bg-white border border-secondary rounded-3xl hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <div className="text-4xl mb-4">🚀</div>
            <h2 className="text-2xl font-playfair font-bold mb-3 group-hover:text-primary/80 transition text-primary">
              I'm a Founder
            </h2>
            <p className="text-primary/70 group-hover:text-primary/80 transition">
              I'm building a startup and looking for talented team members.
            </p>
            <div className="mt-6 inline-block px-6 py-2 bg-primary text-white hover:bg-opacity-90 rounded-full transition">
              {loading ? 'Loading...' : 'Continue'}
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
