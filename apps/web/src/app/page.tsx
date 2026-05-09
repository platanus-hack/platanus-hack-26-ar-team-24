'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        console.log('✅ Session found for user:', session.user.id)

        // Check user_type in database (persists across logout/login)
        const { data: user, error } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', session.user.id)
          .single()

        console.log('Database user lookup:', { user, error })

        if (user?.user_type === 'talent') {
          console.log('Redirecting to talent dashboard')
          router.push('/dashboard/talent')
          return
        } else if (user?.user_type === 'founder') {
          console.log('Redirecting to founder dashboard')
          router.push('/dashboard/founder')
          return
        } else {
          console.log('No user_type found, going to select-type')
          router.push('/onboarding/select-type')
          return
        }
      }

      setLoading(false)
    }

    checkSession()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-pulse">
          <div className="h-12 w-12 bg-purple-500 rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20">
        <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          AgentLink
        </div>
        <div className="space-x-4">
          <Link href="/auth" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg">
            Sign In with Google
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
          Connect with Your Perfect Startup Team
        </h1>
        <p className="text-xl text-slate-300 mb-12 leading-relaxed">
          AgentLink uses AI agents to intelligently match talented professionals with visionary founders, creating the perfect startup teams automatically.
        </p>

        {/* Two Path Buttons */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {/* Talent Path */}
          <Link href="/auth" className="group no-underline">
            <div className="p-8 bg-slate-800/50 border border-purple-500/30 rounded-xl hover:border-purple-400/60 transition-all hover:bg-slate-800/70 cursor-pointer">
              <div className="text-4xl mb-4">💼</div>
              <h2 className="text-2xl font-bold mb-3 group-hover:text-purple-300 transition">
                Busco sumarme a una startup
              </h2>
              <p className="text-slate-400 group-hover:text-slate-300 transition">
                Showcase your skills and connect with founders building the future. Your AI agent will find the perfect match.
              </p>
              <div className="mt-6 inline-block px-6 py-2 bg-purple-600 group-hover:bg-purple-500 rounded-lg transition">
                Get Started →
              </div>
            </div>
          </Link>

          {/* Founder Path */}
          <Link href="/auth/register?type=founder" className="group">
            <div className="p-8 bg-slate-800/50 border border-pink-500/30 rounded-xl hover:border-pink-400/60 transition-all hover:bg-slate-800/70 cursor-pointer">
              <div className="text-4xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold mb-3 group-hover:text-pink-300 transition">
                Busco gente para mi startup
              </h2>
              <p className="text-slate-400 group-hover:text-slate-300 transition">
                Define your vision and let our AI agents find the perfect team members for your dream startup.
              </p>
              <div className="mt-6 inline-block px-6 py-2 bg-pink-600 group-hover:bg-pink-500 rounded-lg transition">
                Build Your Team →
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-slate-800/30 border-y border-purple-500/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How AgentLink Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-4">1️⃣</div>
              <h3 className="font-bold mb-2">Create Your Profile</h3>
              <p className="text-slate-400">Tell us about your skills, experience, or startup vision.</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4">2️⃣</div>
              <h3 className="font-bold mb-2">AI Matching</h3>
              <p className="text-slate-400">Our AI agents analyze compatibility based on skills, culture, and goals.</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4">3️⃣</div>
              <h3 className="font-bold mb-2">Connect</h3>
              <p className="text-slate-400">Get matched with compatible people and start building together.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
