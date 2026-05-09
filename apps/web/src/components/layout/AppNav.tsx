'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { LogOut, ChevronDown, Compass, LayoutDashboard, Radio } from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '@/hooks/useAuth'
import { getAgentSession } from '@/lib/agent-session'
import { logout } from '@/lib/auth'

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
  match: (pathname: string) => boolean
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/arena',
    label: 'Arena',
    icon: <Radio size={14} />,
    match: (p) => p === '/arena' || p.startsWith('/arena/'),
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard size={14} />,
    match: (p) => p === '/dashboard' || p.startsWith('/dashboard/'),
  },
  {
    href: '/onboarding/sync',
    label: 'Fuentes',
    icon: <Compass size={14} />,
    match: (p) => p.startsWith('/onboarding/sync'),
  },
]

export default function AppNav({ maxWidth = 'max-w-6xl' }: { maxWidth?: string }) {
  const pathname = usePathname() || ''
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [agentSessionName, setAgentSessionName] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const syncAgentSession = () => {
      setAgentSessionName(getAgentSession()?.activeAgentName || null)
    }

    syncAgentSession()
    window.addEventListener('agent-session-change', syncAgentSession)
    return () => window.removeEventListener('agent-session-change', syncAgentSession)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  const handleSignOut = async () => {
    setMenuOpen(false)
    await logout()
    router.push('/landing')
  }

  const displayName = user?.name || user?.username || agentSessionName || user?.email?.split('@')[0] || 'Tu agente'
  const displayEmail = user?.email
  const initial = (displayName?.[0] || 'A').toUpperCase()
  const hasSession = isAuthenticated || Boolean(agentSessionName)

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-ink-950/80 backdrop-blur supports-[backdrop-filter]:bg-ink-950/60">
      <div className={`${maxWidth} mx-auto px-6 py-3 flex items-center gap-6`}>
        <Logo href="/dashboard" />

        <nav className="hidden md:flex items-center gap-1 ml-2">
          {NAV_ITEMS.map((item) => {
            const active = item.match(pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex items-center justify-center gap-2 min-w-[118px] px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-white/[0.06] text-white border border-white/10'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <span className={active ? 'text-white' : 'text-zinc-500'}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {/* Mobile nav (compact icons) */}
          <nav className="flex md:hidden items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = item.match(pathname)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  className={`inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                    active
                      ? 'bg-white/[0.06] text-white border border-white/10'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  {item.icon}
                </Link>
              )
            })}
          </nav>

          {hasSession ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="inline-flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
              >
                <Avatar src={user?.avatar_url} initial={initial} />
                <span className="hidden sm:inline text-xs text-zinc-300 max-w-[110px] truncate">
                  {displayName}
                </span>
                <ChevronDown size={12} className="text-zinc-500" />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-ink-950/95 backdrop-blur shadow-xl shadow-black/40 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
                    <Avatar src={user?.avatar_url} initial={initial} size={36} />
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{displayName}</p>
                      {displayEmail && (
                        <p className="text-xs text-zinc-500 truncate">{displayEmail}</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    <LogOut size={14} />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth"
              className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium hover:bg-zinc-200 transition-colors"
            >
              Acceder
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

function Avatar({
  src,
  initial,
  size = 28,
}: {
  src?: string
  initial: string
  size?: number
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className="rounded-full object-cover"
        referrerPolicy="no-referrer"
        unoptimized
      />
    )
  }
  return (
    <div
      className="rounded-full bg-white/10 text-white text-xs font-medium flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {initial}
    </div>
  )
}
