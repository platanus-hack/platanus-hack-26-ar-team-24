'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Github, Music, Briefcase, CheckCircle2, Loader2, Clock, Zap } from 'lucide-react'

type ConnectionStatus = 'pending' | 'syncing' | 'connected'

interface Platform {
  id: string
  name: string
  icon: React.ReactNode
  status: ConnectionStatus
  color: string
  glowColor: string
  description: string
}

const INITIAL_PLATFORMS: Platform[] = [
  {
    id: 'github',
    name: 'GitHub',
    icon: <Github size={28} />,
    status: 'syncing',
    color: 'from-slate-400 to-slate-200',
    glowColor: 'rgba(148,163,184,0.25)',
    description: 'Repositorios & actividad de código',
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.636 5.903-5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    status: 'syncing',
    color: 'from-sky-400 to-sky-200',
    glowColor: 'rgba(56,189,248,0.25)',
    description: 'Actividad pública & sentimiento',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: <Briefcase size={28} />,
    status: 'pending',
    color: 'from-blue-500 to-blue-300',
    glowColor: 'rgba(59,130,246,0.25)',
    description: 'Red profesional & experiencia',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    icon: <Music size={28} />,
    status: 'pending',
    color: 'from-emerald-500 to-emerald-300',
    glowColor: 'rgba(16,185,129,0.25)',
    description: 'Gustos musicales & personalidad',
  },
]

const LOG_POOL = [
  '[GitHub] Analizando 45 repositorios...',
  '[GitHub] Detectando lenguajes: TypeScript 67%, Python 21%...',
  '[GitHub] Extrayendo patrones de commit...',
  '[GitHub] Mapeando contribuciones open-source...',
  '[GitHub] Calculando índice de colaboración...',
  '[X] Extrayendo sentimiento semántico de 300 tweets...',
  '[X] Identificando tópicos de interés...',
  '[X] Analizando red de interacciones...',
  '[X] Detectando tono comunicacional...',
  '[X] Vectorizando embeddings de personalidad...',
  '[LinkedIn] Mapeando grafo de contactos B2B...',
  '[LinkedIn] Analizando trayectoria profesional...',
  '[LinkedIn] Construyendo vector de habilidades...',
  '[AI] Generando representación semántica...',
  '[AI] Calibrando modelo de compatibilidad...',
  '[AI] Fusionando señales de identidad digital...',
  '[AI] Entrenando agente de personalidad...',
]

function StatusBadge({ status }: { status: ConnectionStatus }) {
  if (status === 'connected') {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
        <CheckCircle2 size={13} />
        Conectado
      </span>
    )
  }
  if (status === 'syncing') {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-purple-300">
        <Loader2 size={13} className="animate-spin" />
        Sincronizando
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
      <Clock size={13} />
      Pendiente
    </span>
  )
}

export default function IdentitySync() {
  const [platforms, setPlatforms] = useState(INITIAL_PLATFORMS)
  const [logs, setLogs] = useState<{ id: number; text: string }[]>([])
  const logIdRef = useRef(0)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      const text = LOG_POOL[Math.floor(Math.random() * LOG_POOL.length)]
      const id = ++logIdRef.current
      setLogs(prev => [...prev.slice(-18), { id, text }])
    }, 650)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [logs])

  function handleConnect(id: string) {
    setPlatforms(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, status: p.status === 'pending' ? 'syncing' : p.status === 'syncing' ? 'connected' : 'pending' }
          : p
      )
    )
  }

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16 overflow-hidden"
      style={{ background: '#050505' }}
    >
      {/* Background orbs */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.35) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)',
            filter: 'blur(60px)',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center mb-12"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Zap size={18} className="text-purple-400" />
          <span className="text-xs font-semibold tracking-widest uppercase text-purple-400">
            Identity Sync
          </span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">
          Clona tu identidad digital
        </h1>
        <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
          Tu agente IA analiza tus señales digitales para construir una representación auténtica de quién eres.
        </p>
      </motion.div>

      {/* Connection Cards Grid */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
        className="relative z-10 grid grid-cols-2 gap-4 w-full max-w-xl mb-8"
      >
        {platforms.map((platform) => (
          <motion.div
            key={platform.id}
            variants={{
              hidden: { opacity: 0, y: 24, scale: 0.96 },
              show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
            }}
            whileHover={{ scale: 1.03, transition: { duration: 0.15 } }}
            className="glass-panel rounded-2xl p-5 flex flex-col gap-3 cursor-default"
            style={{
              boxShadow:
                platform.status === 'syncing'
                  ? `0 0 0 1px rgba(168,85,247,0.2) inset, 0 8px 32px rgba(0,0,0,0.5), 0 0 40px ${platform.glowColor}`
                  : platform.status === 'connected'
                  ? `0 0 0 1px rgba(16,185,129,0.2) inset, 0 8px 32px rgba(0,0,0,0.5), 0 0 30px rgba(16,185,129,0.15)`
                  : undefined,
            }}
          >
            {/* Icon + status row */}
            <div className="flex items-start justify-between">
              <div
                className={`p-2.5 rounded-xl bg-gradient-to-br ${platform.color} text-black`}
                style={{ boxShadow: `0 4px 16px ${platform.glowColor}` }}
              >
                {platform.icon}
              </div>
              <StatusBadge status={platform.status} />
            </div>

            {/* Name + description */}
            <div>
              <p className="font-semibold text-white text-sm">{platform.name}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">{platform.description}</p>
            </div>

            {/* Action button */}
            <button
              onClick={() => handleConnect(platform.id)}
              className={`mt-auto text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                platform.status === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                  : platform.status === 'syncing'
                  ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20 cursor-not-allowed opacity-70'
                  : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white'
              }`}
              disabled={platform.status === 'syncing'}
            >
              {platform.status === 'connected'
                ? 'Desconectar'
                : platform.status === 'syncing'
                ? 'Sincronizando...'
                : 'Conectar'}
            </button>
          </motion.div>
        ))}
      </motion.div>

      {/* Crystal Terminal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="relative z-10 w-full max-w-xl glass-panel rounded-2xl overflow-hidden"
        style={{
          boxShadow:
            '0 0 0 1px rgba(168,85,247,0.12) inset, 0 8px 32px rgba(0,0,0,0.6), 0 0 60px rgba(168,85,247,0.08)',
        }}
      >
        {/* Terminal header bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
          <span className="ml-2 text-xs text-slate-500 font-mono">identity-agent — sync.log</span>
          <span className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs text-purple-400 font-mono">LIVE</span>
          </span>
        </div>

        {/* Log stream */}
        <div
          ref={terminalRef}
          className="h-40 overflow-y-hidden px-4 py-3 font-mono text-xs flex flex-col gap-1"
          style={{ scrollBehavior: 'smooth' }}
        >
          <AnimatePresence initial={false}>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="text-slate-400 leading-relaxed whitespace-nowrap overflow-hidden text-ellipsis"
              >
                <span className="text-purple-500 select-none mr-1">›</span>
                {log.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Continue CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 mt-10"
      >
        <button
          className="px-8 py-3 rounded-xl font-semibold text-sm text-white transition-all"
          style={{
            background: 'linear-gradient(135deg, rgba(168,85,247,0.8), rgba(236,72,153,0.8))',
            boxShadow: '0 0 32px rgba(168,85,247,0.3)',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 48px rgba(168,85,247,0.5)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 32px rgba(168,85,247,0.3)'
          }}
        >
          Continuar → Generar Agente IA
        </button>
      </motion.div>
    </div>
  )
}
