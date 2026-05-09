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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-purple-500/20 bg-slate-900/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            AgentLink
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              {auth.user?.username} ({auth.user?.user_type})
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
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
