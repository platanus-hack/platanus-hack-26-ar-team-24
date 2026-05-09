'use client'

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import {
  GitBranch,
  Music,
  Briefcase,
  CheckCircle2,
  Loader2,
  Clock,
} from 'lucide-react'

type Status = 'pending' | 'syncing' | 'connected'

interface Platform {
  id: string
  name: string
  description: string
  status: Status
  accent: string
  icon: React.ReactNode
}

const NEXT_STATUS: Record<Status, Status> = {
  pending: 'syncing',
  syncing: 'connected',
  connected: 'pending',
}

const PLATFORM_DEFS: Omit<Platform, 'status'>[] = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Repositorios, lenguajes, patrones de commit.',
    accent: 'text-purple-300',
    icon: <GitBranch size={18} strokeWidth={1.5} />,
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    description: 'Tweets, sentimiento, tópicos de interés.',
    accent: 'text-sky-300',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.636 5.903-5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Trayectoria, red profesional, industria.',
    accent: 'text-blue-300',
    icon: <Briefcase size={18} strokeWidth={1.5} />,
  },
  {
    id: 'spotify',
    name: 'Spotify',
    description: 'Gustos, energía, personalidad sonora.',
    accent: 'text-emerald-300',
    icon: <Music size={18} strokeWidth={1.5} />,
  },
]

const INITIAL_STATUSES: Record<string, Status> = {
  github: 'syncing',
  x: 'syncing',
  linkedin: 'pending',
  spotify: 'pending',
}

const LOGS = [
  '[GitHub] Clonando fingerprint de 45 repositorios...',
  '[GitHub] Lenguajes: TypeScript 67%, Python 21%, Go 12%',
  '[GitHub] Índice de colaboración: 0.84 — alta actividad',
  '[GitHub] Patrones de commit analizados: score 92/100',
  '[X] Extrayendo sentimiento semántico de 312 tweets...',
  '[X] Tópicos: AI, startups, distributed systems',
  '[X] Vector de comunicación generado — tono: técnico',
  '[X] Grafo de interacciones — 1.2k conexiones relevantes',
  '[LinkedIn] Mapeando grafo de contactos B2B...',
  '[LinkedIn] Trayectoria: 4 roles, 3 industrias detectadas',
  '[AI] Fusionando señales de identidad digital...',
  '[AI] Generando embedding — dimensiones: 768',
  '[AI] Calibrando modelo de compatibilidad v2.1...',
  '[AI] Agente listo — precisión estimada: 94.3%',
]

const PlatformCard = memo(function PlatformCard({
  platform,
  onToggle,
}: {
  platform: Platform
  onToggle: (id: string) => void
}) {
  const { id, name, description, status, accent, icon } = platform

  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden">
      {status !== 'pending' && (
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse at 15% 0%, rgba(168,85,247,0.12), transparent 55%)',
          }}
        />
      )}

      <div className="flex items-start justify-between relative">
        <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${accent}`}>
          {icon}
        </div>
        <StatusChip status={status} />
      </div>

      <div className="relative">
        <p className="font-serif text-xl text-white">{name}</p>
        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{description}</p>
      </div>

      <button
        onClick={() => onToggle(id)}
        disabled={status === 'syncing'}
        className={`mt-auto inline-flex items-center justify-center text-xs font-medium px-4 py-2.5 rounded-lg transition-colors min-h-[40px] disabled:cursor-not-allowed disabled:opacity-60 ${
          status === 'connected'
            ? 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20 hover:bg-emerald-400/15'
            : status === 'syncing'
            ? 'bg-white/[0.03] text-zinc-400 border border-white/10'
            : 'bg-white text-black hover:bg-zinc-200'
        }`}
      >
        {status === 'connected' ? 'Desconectar' : status === 'syncing' ? 'Analizando...' : 'Conectar'}
      </button>
    </div>
  )
})

function StatusChip({ status }: { status: Status }) {
  const map = {
    connected: { label: 'Conectado', tone: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20', icon: <CheckCircle2 size={11} aria-hidden="true" /> },
    syncing: { label: 'Sincronizando', tone: 'bg-purple-400/10 text-purple-300 border-purple-400/20', icon: <Loader2 size={11} className="animate-spin" aria-hidden="true" /> },
    pending: { label: 'Pendiente', tone: 'bg-white/5 text-zinc-500 border-white/10', icon: <Clock size={11} aria-hidden="true" /> },
  }
  const m = map[status]
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border ${m.tone}`}>
      {m.icon}
      {m.label}
    </span>
  )
}

interface LogEntry { id: number; text: string }

export default function IdentitySync() {
  const [platforms, setPlatforms] = useState<Platform[]>(() =>
    PLATFORM_DEFS.map(p => ({ ...p, status: INITIAL_STATUSES[p.id] ?? 'pending' }))
  )
  const [logs, setLogs] = useState<LogEntry[]>([])
  const tickRef = useRef(0)

  useEffect(() => {
    const t = setInterval(() => {
      const text = LOGS[tickRef.current % LOGS.length]
      const id = ++tickRef.current
      setLogs(prev => [...prev.slice(-7), { id, text }])
    }, 800)
    return () => clearInterval(t)
  }, [])

  const toggle = useCallback((id: string) => {
    setPlatforms(prev =>
      prev.map(p => (p.id === id ? { ...p, status: NEXT_STATUS[p.status] } : p))
    )
  }, [])

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {platforms.map(p => (
          <PlatformCard key={p.id} platform={p} onToggle={toggle} />
        ))}
      </div>

      <div className="mt-6 glass-panel rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
          <span className="w-2 h-2 rounded-full bg-red-500/60" />
          <span className="w-2 h-2 rounded-full bg-yellow-500/60" />
          <span className="w-2 h-2 rounded-full bg-emerald-500/60" />
          <span className="ml-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            identity-agent · sync.log
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-[10px] font-mono text-purple-300 font-semibold">LIVE</span>
          </span>
        </div>

        <div
          role="log"
          aria-live="polite"
          aria-label="Registro de sincronización de identidad"
          className="h-44 overflow-hidden px-5 py-4 flex flex-col justify-end gap-1.5"
        >
          {logs.map(log => (
            <div
              key={log.id}
              className="log-line font-mono text-[11px] text-zinc-500 leading-relaxed whitespace-nowrap overflow-hidden text-ellipsis"
            >
              <span className="text-purple-500 mr-2">›</span>
              {log.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
