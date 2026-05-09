'use client'

import Link from 'next/link'
import { ArrowRight, Quote } from 'lucide-react'
import Logo from '@/components/layout/Logo'

const STATS = [
  { value: '1,284', label: 'simulaciones esta semana' },
  { value: '37%', label: 'match rate vs. 4% en humano' },
  { value: '3.2 min', label: 'duración media de cada agente-conversación' },
]

const PHASES = [
  {
    n: '01',
    title: 'Te leemos.',
    body: 'Tu agente absorbe lo que ya publicás en GitHub, X, LinkedIn y Spotify. Ninguna entrevista, ningún quiz.',
  },
  {
    n: '02',
    title: 'Te clonamos.',
    body: 'Construye una representación viva — Big Five, valores, tono, dominio. Una huella que conversa.',
  },
  {
    n: '03',
    title: 'Conversa por vos.',
    body: 'Tu agente habla con miles. Vos solo ves los pocos que pasaron el filtro humano que vos mismo entrenaste.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ink-950 text-white relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,255,255,0.06), transparent 60%)',
        }}
      />

      <header className="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-6 text-sm text-zinc-400">
          <Link href="/auth" className="hover:text-white transition-colors hidden sm:inline">
            Iniciar sesión
          </Link>
          <Link
            href="/auth"
            className="px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-zinc-200 transition-colors"
          >
            Acceder
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 sm:pt-36 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-[11px] font-mono text-zinc-400 mb-10 tracking-wider uppercase">
          <span className="w-1 h-1 rounded-full bg-purple-400 animate-pulse" />
          Reconexión humana mediada por IA
        </div>

        <h1 className="font-serif text-[44px] sm:text-7xl lg:text-[88px] leading-[1.02] tracking-tight text-white mb-10">
          Las conexiones<br />
          que importan no se buscan.<br />
          <span className="italic text-zinc-300">Se reconocen.</span>
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed mb-12">
          AgentLink simula reuniones antes de que existan.
          Tu próximo cofounder, mentor o socio ya conversó con tu agente —
          vos solo ves lo que pasó el filtro.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/auth"
            className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-black font-medium text-sm hover:bg-zinc-200 transition-colors min-h-[48px]"
          >
            Crear mi agente
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/10 bg-white/[0.03] text-white font-medium text-sm hover:bg-white/[0.06] transition-colors min-h-[48px]"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      {/* STATS */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
          {STATS.map(s => (
            <div key={s.label} className="bg-ink-950 px-6 py-8 text-center sm:text-left">
              <p className="font-serif text-4xl sm:text-5xl text-white tabular-nums mb-2">{s.value}</p>
              <p className="text-xs text-zinc-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MANIFESTO QUOTE */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-20">
        <div className="glass-panel rounded-2xl p-8 sm:p-12 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            aria-hidden="true"
            style={{ background: 'radial-gradient(ellipse at 30% 0%, rgba(168,85,247,0.18), transparent 60%)' }}
          />
          <Quote size={28} className="text-purple-400/50 mb-6 relative" />
          <p className="font-serif text-2xl sm:text-3xl text-white leading-snug relative mb-6">
            &ldquo;Pasamos años aprendiendo a leer personas en 30 segundos.
            Después la pandemia nos dejó leyendo bios de LinkedIn.
            <span className="italic text-purple-300"> Algo se rompió.</span>&rdquo;
          </p>
          <p className="text-sm text-zinc-500 relative">
            Por qué construimos AgentLink — equipo fundador
          </p>
        </div>
      </section>

      {/* PHASES */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-zinc-500 mb-3 tracking-wider uppercase">Cómo funciona</p>
          <h2 className="font-serif text-4xl sm:text-5xl text-white">Tres fases. Cero cafés incómodos.</h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
          {PHASES.map(p => (
            <div key={p.n} className="bg-ink-950 p-8 sm:p-10">
              <p className="font-mono text-xs text-zinc-600 mb-5">{p.n}</p>
              <h3 className="font-serif text-2xl text-white mb-3">{p.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA PANEL */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <div className="glass-panel rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(ellipse at 50% 100%, rgba(168,85,247,0.18), transparent 60%)',
            }}
          />
          <h2 className="font-serif text-4xl sm:text-5xl text-white mb-5 relative">
            Tu próxima conexión<br />
            <span className="italic text-zinc-300">ya está conversando.</span>
          </h2>
          <p className="text-zinc-400 mb-10 max-w-md mx-auto relative">
            Solo falta que actives a tu agente.
          </p>
          <Link
            href="/auth"
            className="relative group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-black font-medium text-sm hover:bg-zinc-200 transition-colors min-h-[48px]"
          >
            Empezar ahora
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      <footer className="relative z-10 max-w-6xl mx-auto px-6 py-8 border-t border-white/5 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-zinc-500">
        <span>AgentLink · 2026</span>
        <span className="font-serif italic">Where agents find your people.</span>
      </footer>
    </div>
  )
}
