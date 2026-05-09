'use client'

import FlowNav from '@/components/layout/FlowNav'
import AppHeader from '@/components/layout/AppHeader'
import Section from '@/components/dashboard/Section'
import SimStats from '@/components/dashboard/SimStats'
import AgentFeedback from '@/components/dashboard/AgentFeedback'
import { Brain, Heart, Compass, Zap, Code, Music } from 'lucide-react'

const TRAITS = [
  { label: 'Apertura', value: 0.82, accent: '#a78bfa' },
  { label: 'Conciencia', value: 0.71, accent: '#38bdf8' },
  { label: 'Extraversión', value: 0.54, accent: '#34d399' },
  { label: 'Amabilidad', value: 0.78, accent: '#f472b6' },
  { label: 'Estabilidad', value: 0.66, accent: '#facc15' },
]

const STACK = ['TypeScript', 'Python', 'React', 'Postgres', 'AI/ML']

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <AppHeader meta="/dashboard" />

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-16">
          <p className="text-xs font-mono text-zinc-500 mb-3 tracking-wider uppercase">
            Personality Base
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl mb-3">Así te ve tu agente.</h1>
          <p className="text-zinc-400 max-w-xl">
            Una representación viva de quién sos, construida desde tus señales digitales.
            Tu agente la usa cada vez que conversa por vos.
          </p>
        </div>

        {/* Personality bento */}
        <Section
          eyebrow="Personality"
          title="Tu base de personalidad"
          description="Cinco dimensiones, una huella, lista para conversar."
        >
          <div className="grid grid-cols-12 gap-4 auto-rows-[140px]">
            <div className="col-span-12 sm:col-span-8 row-span-2 glass-panel rounded-2xl p-6 flex flex-col">
              <div className="flex items-center gap-2 text-zinc-400 mb-5">
                <Brain size={14} />
                <span className="text-xs font-mono uppercase tracking-wider">Big Five</span>
              </div>
              <div className="flex-1 flex flex-col justify-center gap-3">
                {TRAITS.map(t => (
                  <div key={t.label} className="flex items-center gap-4">
                    <span className="text-xs text-zinc-400 w-28 shrink-0">{t.label}</span>
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${t.value * 100}%`, background: t.accent }}
                      />
                    </div>
                    <span className="text-xs font-mono text-zinc-300 w-10 text-right tabular-nums">
                      {Math.round(t.value * 100)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <BentoCard className="col-span-6 sm:col-span-4" icon={<Heart size={14} />} label="Valores">
              <p className="font-serif text-2xl text-white">Autenticidad</p>
              <p className="text-xs text-zinc-500 mt-1">+ Curiosidad, Honestidad</p>
            </BentoCard>

            <BentoCard className="col-span-6 sm:col-span-4" icon={<Compass size={14} />} label="Tono">
              <p className="font-serif text-2xl text-white">Reflexivo</p>
              <p className="text-xs text-zinc-500 mt-1">Técnico · Visionario</p>
            </BentoCard>

            <BentoCard className="col-span-12 sm:col-span-8" icon={<Code size={14} />} label="Stack dominante">
              <div className="flex flex-wrap gap-2">
                {STACK.map(s => (
                  <span key={s} className="px-2.5 py-1 text-xs rounded-md bg-white/5 border border-white/10 text-zinc-300">{s}</span>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="col-span-6 sm:col-span-4" icon={<Music size={14} />} label="Vibe">
              <p className="font-serif text-2xl text-white">Indie + Lo-fi</p>
              <p className="text-xs text-zinc-500 mt-1">93% match con builders</p>
            </BentoCard>

            <BentoCard className="col-span-6 sm:col-span-4" icon={<Zap size={14} />} label="Compatibilidad media">
              <p className="font-serif text-3xl text-white tabular-nums">87<span className="text-zinc-500 text-xl">%</span></p>
              <p className="text-xs text-zinc-500 mt-1">vs. baseline 41%</p>
            </BentoCard>
          </div>
        </Section>

        {/* Simulation Stats */}
        <Section
          eyebrow="Simulations"
          title="Lo que tu agente está haciendo."
          description="Cada noche, tu agente conversa con cientos de otros para encontrar señal real."
        >
          <SimStats />
        </Section>

        {/* Agent Feedback */}
        <Section
          eyebrow="Agent Feedback"
          title="Lo que aprendió de vos."
          description="Patrones, sesgos y calibraciones que tu agente descubre observándote."
        >
          <AgentFeedback />
        </Section>

        <FlowNav
          prev={{ href: '/onboarding/sync', label: 'Volver a Identity Sync' }}
          next={{ href: '/arena', label: 'Entrar a la Arena' }}
        />
      </main>
    </div>
  )
}

function BentoCard({
  className = '',
  icon,
  label,
  children,
}: {
  className?: string
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className={`glass-panel rounded-2xl p-5 flex flex-col ${className}`}>
      <div className="flex items-center gap-2 text-zinc-400 mb-4">
        {icon}
        <span className="text-[10px] font-mono uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex-1 flex flex-col justify-center">{children}</div>
    </div>
  )
}
