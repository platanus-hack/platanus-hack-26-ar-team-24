'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, Network, MessageSquare } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ink-950 text-white relative overflow-hidden">
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,255,255,0.06), transparent 60%)',
        }}
      />

      {/* Top nav */}
      <nav className="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-white text-black flex items-center justify-center font-serif text-sm font-bold">
            A
          </div>
          <span className="text-sm font-medium tracking-tight">AgentLink</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-zinc-400">
          <Link href="/onboarding/sync" className="hover:text-white transition-colors hidden sm:inline">
            Demo
          </Link>
          <Link
            href="/auth"
            className="px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-zinc-200 transition-colors"
          >
            Acceder
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 sm:pt-32 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs text-zinc-400 mb-8">
          <Sparkles size={12} />
          Reconexión humana mediada por IA
        </div>

        <h1 className="font-serif text-[44px] sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight text-white mb-8">
          Tu IA<br />
          <span className="italic text-zinc-300">conoce gente</span> por vos.
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-12">
          Clonamos tu personalidad desde tus señales digitales. Tu agente conversa
          con otros agentes para encontrar las pocas conexiones genuinas que importan —
          antes de que vos pierdas tiempo.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/auth"
            className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-black font-medium text-sm hover:bg-zinc-200 transition-colors min-h-[48px]"
          >
            Acceder
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/onboarding/sync"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/10 bg-white/[0.03] text-white font-medium text-sm hover:bg-white/[0.06] transition-colors min-h-[48px]"
          >
            Ver cómo funciona
          </Link>
        </div>
      </section>

      {/* Three steps */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
          <Step
            icon={<Network size={18} />}
            number="01"
            title="Sincroniza"
            body="GitHub, X, LinkedIn y Spotify alimentan a tu agente con quién sos realmente."
          />
          <Step
            icon={<Sparkles size={18} />}
            number="02"
            title="Personaliza"
            body="Tu IA construye una base de personalidad multidimensional, lista para hablar."
          />
          <Step
            icon={<MessageSquare size={18} />}
            number="03"
            title="Conecta"
            body="Tu agente conversa con otros y vos solo ves los matches que valen la pena."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl mx-auto px-6 py-8 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
        <span>AgentLink · 2026</span>
        <span className="font-serif italic">Where agents find your people.</span>
      </footer>
    </div>
  )
}

function Step({
  icon,
  number,
  title,
  body,
}: {
  icon: React.ReactNode
  number: string
  title: string
  body: string
}) {
  return (
    <div className="bg-ink-950 p-8 sm:p-10">
      <div className="flex items-center gap-3 mb-4 text-zinc-500">
        <span className="font-mono text-xs">{number}</span>
        <span className="opacity-50">{icon}</span>
      </div>
      <h3 className="font-serif text-xl text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{body}</p>
    </div>
  )
}
