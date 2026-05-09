'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { logout } from '@/lib/auth'
import Link from 'next/link'
import { ReactNode, useEffect } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push('/')
    }
  }, [auth.isAuthenticated, auth.isLoading, router])

  if (!auth.isAuthenticated) {
    return <div>Redirecting...</div>
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-secondary bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-playfair font-bold text-primary">
            AgentLink
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-primary/70">
              {auth.user?.username} ({auth.user?.user_type})
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-primary hover:bg-secondary/30 rounded-full transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {children}
      </div>
    </div>
  )
}
