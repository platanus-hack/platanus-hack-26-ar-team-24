import Link from 'next/link'
import { Activity, Target, TrendingUp, Users, ArrowUpRight } from 'lucide-react'
import { SIMULATIONS, type SimStatus } from '@/lib/simulations'

const STATS = [
  { label: 'Simulaciones', value: '1,284', delta: '+24 hoy', icon: <Activity size={14} /> },
  { label: 'Match rate', value: '37%', delta: '+5pp vs. semana', icon: <Target size={14} /> },
  { label: 'Avg. score', value: '0.78', delta: 'umbral 0.65', icon: <TrendingUp size={14} /> },
  { label: 'Conexiones reales', value: '21', delta: '+3 esta semana', icon: <Users size={14} /> },
]

const SPARK = [0.32, 0.28, 0.41, 0.38, 0.52, 0.48, 0.61, 0.55, 0.7, 0.68, 0.82, 0.78, 0.85, 0.91]

export default function SimStats() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATS.map(s => (
          <div key={s.label} className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-zinc-500 mb-3">
              {s.icon}
              <span className="text-[10px] font-mono uppercase tracking-wider">{s.label}</span>
            </div>
            <p className="font-serif text-3xl text-white mb-1 tabular-nums">{s.value}</p>
            <p className="text-[11px] text-zinc-500">{s.delta}</p>
          </div>
        ))}
      </div>

      <div className="col-span-12 lg:col-span-7 glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">Match rate · 14d</p>
            <p className="font-serif text-2xl text-white">Tendencia ascendente</p>
          </div>
          <span className="text-xs text-emerald-400 font-mono">+59%</span>
        </div>
        <Sparkline values={SPARK} />
        <div className="flex justify-between text-[10px] font-mono text-zinc-600 mt-2">
          <span>14d ago</span>
          <span>hoy</span>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-5 glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Últimas simulaciones</p>
          <span className="text-[10px] font-mono text-zinc-600">click para ver</span>
        </div>
        <ul className="space-y-1">
          {SIMULATIONS.map(m => (
            <li key={m.id}>
              <Link
                href={`/dashboard/simulations/${m.id}`}
                className="group flex items-center gap-3 -mx-2 px-2 py-2 rounded-lg hover:bg-white/[0.04] transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[11px] text-zinc-300 shrink-0">
                  {m.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{m.name}</p>
                  <p className="text-[11px] text-zinc-500 truncate">{m.role}</p>
                </div>
                <span className="font-mono text-sm text-white tabular-nums">{m.score.toFixed(2)}</span>
                <StatusDot status={m.status} />
                <ArrowUpRight size={13} className="text-zinc-600 group-hover:text-white transition-colors shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function Sparkline({ values }: { values: number[] }) {
  const w = 100
  const h = 32
  const max = Math.max(...values)
  const min = Math.min(...values)
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w
      const y = h - ((v - min) / (max - min || 1)) * h
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-16" aria-hidden="true">
      <defs>
        <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${points} ${w},${h}`} fill="url(#sparkFill)" />
      <polyline points={points} fill="none" stroke="#a78bfa" strokeWidth="0.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function StatusDot({ status }: { status: SimStatus }) {
  const color = status === 'matched' ? 'bg-emerald-400' : status === 'pending' ? 'bg-amber-400' : 'bg-zinc-600'
  return <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${color}`} />
}
