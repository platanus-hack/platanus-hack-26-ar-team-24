'use client'

import AppNav from '@/components/layout/AppNav'
import { Bot, ChevronRight } from 'lucide-react'

const TRANSCRIPT = [
  { from: 'A', text: 'Veo que ambos venimos de open source. ¿Qué te lleva a buscar equipo ahora?' },
  { from: 'B', text: 'Quiero construir algo que importe. Solo es lento. Vos?' },
  { from: 'A', text: 'Mismo. Pero priorizo culture-fit antes que stack. ¿Cómo manejás disagreement?' },
  { from: 'B', text: 'Directo, sin politiquería. Diff > consensus prematuro.' },
  { from: 'A', text: 'Compatibles. Marcando 0.91 en eje "communication style".' },
]

export default function ArenaPage() {
  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <AppNav maxWidth="max-w-7xl" />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-xs font-mono text-zinc-500 mb-3 tracking-wider uppercase">Simulation Arena</p>
          <h1 className="font-serif text-4xl sm:text-5xl mb-3">Tu agente conversa por vos.</h1>
          <p className="text-zinc-400 max-w-xl">
            Dos personalidades sintéticas hablan en tiempo real para evaluar compatibilidad.
            Solo verás el resultado si hay match real.
          </p>
        </div>

        {/* 3-col lab console */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr_1fr] gap-4 min-h-[500px]">
          {/* Agent A */}
          <AgentPanel name="Agent · You" tagline="Apertura 0.82 · Reflexivo" accent="#a78bfa" align="left" />

          {/* Conversation */}
          <div className="glass-panel rounded-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Conversation</span>
              <span className="text-[10px] font-mono text-zinc-600">turn 04 / 12</span>
            </div>
            <div className="flex-1 px-5 py-4 flex flex-col gap-3 overflow-y-auto">
              {TRANSCRIPT.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                    m.from === 'A'
                      ? 'self-start bg-white/[0.03] border border-white/5 text-zinc-200'
                      : 'self-end bg-white/[0.06] border border-white/10 text-white'
                  }`}
                >
                  <div className="text-[10px] font-mono mb-1 opacity-50">
                    {m.from === 'A' ? 'AGENT · YOU' : 'AGENT · MARÍA'}
                  </div>
                  {m.text}
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-white/5 flex items-center gap-2 text-xs text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="font-mono">processing turn…</span>
            </div>
          </div>

          {/* Agent B */}
          <AgentPanel name="Agent · María" tagline="Apertura 0.79 · Pragmática" accent="#f472b6" align="right" />
        </div>

        {/* Score row */}
        <div className="mt-4 glass-panel rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">Compatibility score (live)</p>
            <p className="font-serif text-4xl text-white">
              0.<span>91</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Communication 0.91 · Values 0.88 · Domain 0.84</span>
            <ChevronRight size={14} className="text-zinc-600" />
          </div>
        </div>

      </main>
    </div>
  )
}

function AgentPanel({
  name,
  tagline,
  accent,
  align,
}: {
  name: string
  tagline: string
  accent: string
  align: 'left' | 'right'
}) {
  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[400px]">
      <div className="relative mb-6">
        <div
          className="w-24 h-24 rounded-full"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${accent}, transparent 70%)`,
            filter: 'blur(2px)',
          }}
        />
        <div
          className="absolute inset-0 m-auto w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: `${accent}20`,
            border: `1px solid ${accent}40`,
          }}
        >
          <Bot size={20} style={{ color: accent }} />
        </div>
      </div>
      <p className="font-serif text-lg text-white mb-1">{name}</p>
      <p className="text-xs text-zinc-500 font-mono mb-6">{tagline}</p>
      <div className="w-full pt-4 border-t border-white/5 text-left">
        <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 mb-2">
          {align === 'left' ? 'Last thought' : 'Listening to'}
        </p>
        <p className="text-xs text-zinc-400 leading-relaxed">
          {align === 'left'
            ? 'Probing values around conflict resolution. Need 2 more turns.'
            : 'Calibrating against communication-style baseline.'}
        </p>
      </div>
    </div>
  )
}
