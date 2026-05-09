'use client'

import { useState } from 'react'
import { notFound, useParams } from 'next/navigation'
import Link from 'next/link'
import AppHeader from '@/components/layout/AppHeader'
import { ArrowLeft, ThumbsUp, ThumbsDown, Bot, Quote } from 'lucide-react'
import { getSimulation, type SimStatus } from '@/lib/simulations'

const STATUS_LABEL: Record<SimStatus, { text: string; tone: string }> = {
  matched: { text: 'Match aceptado', tone: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20' },
  pending: { text: 'Pendiente de revisión', tone: 'bg-amber-400/10 text-amber-300 border-amber-400/20' },
  declined: { text: 'Descartado', tone: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
}

export default function SimulationDetailPage() {
  const params = useParams<{ id: string }>()
  const sim = getSimulation(params.id)
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)
  const [note, setNote] = useState('')

  if (!sim) return notFound()

  const status = STATUS_LABEL[sim.status]

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <AppHeader meta={`/simulations/${sim.id}`} />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-10"
        >
          <ArrowLeft size={14} />
          Volver al dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12 pb-10 border-b border-white/5">
          <div>
            <p className="text-xs font-mono text-zinc-500 mb-3 tracking-wider uppercase">Simulación · {sim.date}</p>
            <h1 className="font-serif text-4xl sm:text-5xl mb-3">{sim.name}</h1>
            <p className="text-zinc-400">{sim.role}</p>
          </div>
          <div className="flex flex-col sm:items-end gap-3">
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 rounded-full border ${status.tone}`}>
              {status.text}
            </span>
            <p className="font-serif text-5xl text-white tabular-nums">{sim.score.toFixed(2)}</p>
          </div>
        </div>

        {/* Score breakdown */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
          {sim.scoreBreakdown.map(b => (
            <div key={b.axis} className="glass-panel rounded-xl p-4">
              <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">{b.axis}</p>
              <p className="font-serif text-2xl text-white tabular-nums mb-2">{b.value.toFixed(2)}</p>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-purple-400 rounded-full" style={{ width: `${b.value * 100}%` }} />
              </div>
            </div>
          ))}
        </section>

        {/* Run metadata */}
        <section className="grid grid-cols-3 gap-4 mb-12 text-sm">
          <Meta label="Duración" value={sim.duration} />
          <Meta label="Turnos" value={`${sim.turns}`} />
          <Meta label="Modelo" value="agent-v2.1" />
        </section>

        {/* Transcript */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl mb-1">Cómo se dio la conversación.</h2>
          <p className="text-sm text-zinc-500 mb-6">Transcript completo entre tu agente y el de {sim.name}.</p>

          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Transcript</span>
              <span className="text-[10px] font-mono text-zinc-600">{sim.transcript.length} mensajes</span>
            </div>
            <div className="px-5 py-5 flex flex-col gap-3">
              {sim.transcript.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[80%] px-4 py-3 rounded-xl text-sm leading-relaxed ${
                    m.from === 'you'
                      ? 'self-end bg-white/[0.06] border border-white/10 text-white'
                      : 'self-start bg-white/[0.03] border border-white/5 text-zinc-200'
                  }`}
                >
                  <div className="text-[10px] font-mono mb-1 opacity-50">
                    {m.from === 'you' ? 'TU AGENTE' : `AGENTE · ${sim.name.toUpperCase()}`}
                  </div>
                  {m.text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI verdict */}
        <section className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-2 text-purple-300 mb-3">
              <Bot size={14} />
              <span className="text-[10px] font-mono uppercase tracking-wider">Tu agente reporta</span>
            </div>
            <p className="text-sm text-zinc-200 leading-relaxed">{sim.yourAgentNote}</p>
          </div>
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-2 text-cyan-300 mb-3">
              <Bot size={14} />
              <span className="text-[10px] font-mono uppercase tracking-wider">Agente contrario</span>
            </div>
            <p className="text-sm text-zinc-200 leading-relaxed">{sim.theirAgentNote}</p>
          </div>
        </section>

        <section className="mb-12 glass-panel rounded-2xl p-8 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none opacity-50"
            aria-hidden="true"
            style={{ background: 'radial-gradient(ellipse at 30% 0%, rgba(168,85,247,0.15), transparent 60%)' }}
          />
          <Quote size={24} className="text-purple-400/40 mb-4 relative" />
          <p className="font-serif text-2xl sm:text-3xl text-white leading-snug relative">
            &ldquo;{sim.verdict}&rdquo;
          </p>
        </section>

        {/* Your feedback */}
        <section className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-2 text-zinc-400 mb-4">
            <span className="text-[10px] font-mono uppercase tracking-wider">Tu feedback</span>
          </div>
          <p className="text-sm text-zinc-400 mb-5">
            Tu agente aprende de cómo evaluás cada simulación. Sé directo.
          </p>
          <div className="flex items-center gap-3 mb-5">
            <FeedbackButton active={feedback === 'up'} onClick={() => setFeedback('up')}>
              <ThumbsUp size={14} />
              El agente acertó
            </FeedbackButton>
            <FeedbackButton active={feedback === 'down'} onClick={() => setFeedback('down')}>
              <ThumbsDown size={14} />
              El agente falló
            </FeedbackButton>
          </div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Notas para tu agente (opcional)..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 resize-none"
            rows={3}
          />
        </section>
      </main>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel rounded-xl p-4">
      <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">{label}</p>
      <p className="text-white font-mono text-sm">{value}</p>
    </div>
  )
}

function FeedbackButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[40px] ${
        active
          ? 'bg-white text-black'
          : 'bg-white/[0.03] border border-white/10 text-zinc-300 hover:bg-white/[0.06] hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}
