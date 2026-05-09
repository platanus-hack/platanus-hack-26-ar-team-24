'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { register } from '@/lib/auth'
import Link from 'next/link'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type') as 'talent' | 'founder' | null

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    user_type: typeParam || ('talent' as 'talent' | 'founder'),
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.username || !formData.password) {
      setError('All fields are required')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const user = await register(
        formData.email,
        formData.username,
        formData.password,
        formData.user_type
      )

      if (formData.user_type === 'talent') {
        router.push('/onboarding/candidate')
      } else {
        router.push('/onboarding/startup')
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white border border-secondary rounded-3xl p-8 shadow-sm">
        <h1 className="text-3xl font-playfair font-bold mb-2 text-primary">
          Join AgentLink
        </h1>
        <p className="text-primary/70 mb-8 font-inter">Start your journey today</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-primary">I am a</label>
            <select
              name="user_type"
              value={formData.user_type}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white border border-secondary rounded-lg text-primary focus:outline-none focus:border-primary transition"
            >
              <option value="talent">Talent (Job Seeker)</option>
              <option value="founder">Founder</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2 text-primary">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-2 bg-white border border-secondary rounded-lg text-primary placeholder-primary/50 focus:outline-none focus:border-primary transition"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-2 text-primary">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="your_username"
              className="w-full px-4 py-2 bg-white border border-secondary rounded-lg text-primary placeholder-primary/50 focus:outline-none focus:border-primary transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2 text-primary">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-white border border-secondary rounded-lg text-primary placeholder-primary/50 focus:outline-none focus:border-primary transition"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-2 text-primary">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-white border border-secondary rounded-lg text-primary placeholder-primary/50 focus:outline-none focus:border-primary transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-primary text-white hover:bg-opacity-90 disabled:opacity-50 rounded-full font-semibold transition-all mt-6"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-primary/70 mt-6 font-inter">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary hover:text-primary/80 font-semibold">
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
