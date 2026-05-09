'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AmbientBg } from '@/components/ambient-bg'
import { Wordmark } from '@/components/wordmark'
import { Button } from '@/components/ui/button'

export default function FounderDashboard() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || session.user.user_metadata?.user_type !== 'founder') {
        router.push('/auth/login')
      }
    }
    checkAuth()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="relative min-h-screen">
      <AmbientBg />
      <header className="relative z-20 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Wordmark />
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 size-4" />
            Logout
          </Button>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        <h1 className="font-serif text-4xl font-bold mb-8">Founder Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your founder dashboard</p>
      </main>
    </div>
  )
}
