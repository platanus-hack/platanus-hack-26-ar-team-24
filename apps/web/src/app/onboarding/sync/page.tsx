'use client'

import IdentitySync from '@/components/onboarding/IdentitySync'
import AppHeader from '@/components/layout/AppHeader'
import FlowNav from '@/components/layout/FlowNav'
import Section from '@/components/dashboard/Section'
import { GitBranch, Briefcase, Music as MusicIcon } from 'lucide-react'

const SOURCES = [
  { icon: <GitBranch size={12} />, label: 'GitHub' },
  {
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.636 5.903-5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    label: 'X',
  },
  { icon: <Briefcase size={12} />, label: 'LinkedIn' },
  { icon: <MusicIcon size={12} />, label: 'Spotify' },
]

export default function SyncPage() {
  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <AppHeader meta="/onboarding/sync" />

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-16 max-w-2xl">
          <p className="text-xs font-mono text-zinc-500 mb-3 tracking-wider uppercase">
            Identity Sync
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl mb-4 leading-[1.1]">
            Lo que dejaste en internet,<br />
            <span className="italic text-zinc-300">tu agente lo lee.</span>
          </h1>
          <p className="text-zinc-400 leading-relaxed">
            Conectá las fuentes que ya hablan de vos. No leemos DMs, no extraemos contenido privado —
            solo lo público que ya define cómo te ven los demás.
          </p>
          <div className="mt-6 flex items-center gap-2 flex-wrap">
            {SOURCES.map(s => (
              <span key={s.label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/10 text-[11px] text-zinc-400">
                {s.icon}
                {s.label}
              </span>
            ))}
          </div>
        </div>

        <Section
          eyebrow="Sources"
          title="Conectá tus fuentes."
          description="Mientras más conecta, más fina queda la representación."
        >
          <IdentitySync />
        </Section>

        <FlowNav
          prev={{ href: '/auth', label: 'Volver a Acceder' }}
          next={{ href: '/dashboard', label: 'Continuar al Dashboard' }}
        />
      </main>
    </div>
  )
}
