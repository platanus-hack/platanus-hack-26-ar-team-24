'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type') as 'talent' | 'founder' | null

  const [formData, setFormData] = useState({
    user_type: typeParam || ('talent' as 'talent' | 'founder'),
  })

  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (formData.user_type === 'talent') {
        router.push('/onboarding/candidate')
      } else {
        router.push('/onboarding/startup')
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-slate-800/50 border border-purple-500/30 rounded-2xl p-8 backdrop-blur">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
          Join AgentLink
        </h1>
        <p className="text-slate-400 mb-8">Elegí el flujo y creamos tu agente desde el onboarding.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">I am a</label>
            <select
              name="user_type"
              value={formData.user_type}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="talent">Talent (Job Seeker)</option>
              <option value="founder">Founder</option>
            </select>
          </div>

          <div className="rounded-lg border border-purple-500/20 bg-slate-900/40 p-4 text-sm text-slate-300">
            Este flujo ya no crea cuentas locales. El backend de agentes genera y persiste tu identidad operativa cuando completes el onboarding.
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 rounded-lg font-semibold transition-all mt-6"
          >
            Continuar al onboarding
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-slate-400 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-purple-400 hover:text-purple-300">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  )
}
