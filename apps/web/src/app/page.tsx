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
      try {
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
      } catch (error) {
        console.error('Error checking session:', error)
        setLoading(false)
      }
    }

    checkSession()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse">
          <div className="h-12 w-12 bg-primary rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-secondary">
        <div className="text-2xl font-bold font-playfair text-primary">
          AgentLink
        </div>
        <div className="space-x-4">
          <Link href="/auth" className="px-6 py-2 bg-primary text-white hover:bg-opacity-90 rounded-full font-semibold transition-all">
            Sign In with Google
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl font-playfair font-bold mb-6 text-primary">
          Connect with Your Perfect Startup Team
        </h1>
        <p className="text-xl text-primary/80 mb-12 leading-relaxed font-inter">
          AgentLink uses AI agents to intelligently match talented professionals with visionary founders, creating the perfect startup teams automatically.
        </p>

        {/* Two Path Buttons */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {/* Talent Path */}
          <Link href="/auth" className="group no-underline">
            <div className="p-8 bg-white border border-secondary rounded-3xl hover:shadow-md transition-all cursor-pointer">
              <div className="h-16 w-16 bg-primary/10 rounded-full mb-4"></div>
              <h2 className="text-2xl font-playfair font-bold mb-3 group-hover:text-primary/80 transition text-primary">
                Busco sumarme a una startup
              </h2>
              <p className="text-primary/70 group-hover:text-primary/80 transition">
                Showcase your skills and connect with founders building the future. Your AI agent will find the perfect match.
              </p>
              <div className="mt-6 inline-block px-6 py-2 bg-primary text-white hover:bg-opacity-90 rounded-full transition">
                Get Started →
              </div>
            </div>
          </Link>

          {/* Founder Path */}
          <Link href="/auth/register?type=founder" className="group">
            <div className="p-8 bg-white border border-secondary rounded-3xl hover:shadow-md transition-all cursor-pointer">
              <div className="h-16 w-16 bg-primary/10 rounded-full mb-4"></div>
              <h2 className="text-2xl font-playfair font-bold mb-3 group-hover:text-primary/80 transition text-primary">
                Busco gente para mi startup
              </h2>
              <p className="text-primary/70 group-hover:text-primary/80 transition">
                Define your vision and let our AI agents find the perfect team members for your dream startup.
              </p>
              <div className="mt-6 inline-block px-6 py-2 bg-primary text-white hover:bg-opacity-90 rounded-full transition">
                Build Your Team →
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-secondary/20 border-y border-secondary">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-playfair font-bold text-center mb-12 text-primary">How AgentLink Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mx-auto mb-4 text-primary font-playfair font-bold">1</div>
              <h3 className="font-playfair font-bold mb-2 text-primary">Create Your Profile</h3>
              <p className="text-primary/70">Tell us about your skills, experience, or startup vision.</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mx-auto mb-4 text-primary font-playfair font-bold">2</div>
              <h3 className="font-playfair font-bold mb-2 text-primary">AI Matching</h3>
              <p className="text-primary/70">Our AI agents analyze compatibility based on skills, culture, and goals.</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mx-auto mb-4 text-primary font-playfair font-bold">3</div>
              <h3 className="font-playfair font-bold mb-2 text-primary">Connect</h3>
              <p className="text-primary/70">Get matched with compatible people and start building together.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
