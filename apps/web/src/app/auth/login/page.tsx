'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/auth'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('Email and password are required')
      return
    }

    setLoading(true)

    try {
      const user = await login(formData.email, formData.password)

      if (user.user_type === 'talent') {
        router.push('/dashboard/talent')
      } else {
        router.push('/dashboard/founder')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-secondary rounded-3xl p-8 shadow-sm">
          <h1 className="text-3xl font-playfair font-bold mb-2 text-primary">
            Welcome Back
          </h1>
          <p className="text-primary/70 mb-8 font-inter">Log in to your account</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-primary text-white hover:bg-opacity-90 disabled:opacity-50 rounded-full font-semibold transition-all mt-6"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center text-primary/70 mt-6 font-inter">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-primary hover:text-primary/80 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
