'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Github, Linkedin, Music, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// X (Twitter) icon as custom SVG since Lucide doesn't have the new X logo
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

type ConnectionStatus = 'pending' | 'syncing' | 'connected'

interface Platform {
  id: string
  name: string
  icon: React.ReactNode
  status: ConnectionStatus
  color: string
  glowColor: string
}

const platforms: Platform[] = [
  {
    id: 'github',
    name: 'GitHub',
    icon: <Github className="size-7" />,
    status: 'syncing',
    color: 'from-white/10 to-white/5',
    glowColor: 'rgba(255, 255, 255, 0.15)',
  },
  {
    id: 'x',
    name: 'X',
    icon: <XIcon className="size-6" />,
    status: 'syncing',
    color: 'from-white/10 to-white/5',
    glowColor: 'rgba(255, 255, 255, 0.15)',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: <Linkedin className="size-7" />,
    status: 'pending',
    color: 'from-blue-500/20 to-blue-600/10',
    glowColor: 'rgba(59, 130, 246, 0.2)',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    icon: <Music className="size-7" />,
    status: 'pending',
    color: 'from-green-500/20 to-green-600/10',
    glowColor: 'rgba(34, 197, 94, 0.2)',
  },
]

const mockLogs = [
  { platform: 'GitHub', message: 'Iniciando análisis de repositorios...' },
  { platform: 'GitHub', message: 'Analizando 45 repositorios públicos...' },
  { platform: 'GitHub', message: 'Extrayendo patrones de código en TypeScript, Python...' },
  { platform: 'X', message: 'Conectando con API de X...' },
  { platform: 'X', message: 'Extrayendo sentimiento semántico de 300 tweets...' },
  { platform: 'GitHub', message: 'Detectando estilo de commits y documentación...' },
  { platform: 'X', message: 'Analizando red de interacciones...' },
  { platform: 'LinkedIn', message: 'Preparando conexión OAuth...' },
  { platform: 'GitHub', message: 'Mapeando contribuciones open source...' },
  { platform: 'X', message: 'Identificando temas de interés: AI, Startups, Tech...' },
  { platform: 'LinkedIn', message: 'Mapeando grafo de contactos B2B...' },
  { platform: 'GitHub', message: 'Calculando velocity de desarrollo: 94th percentile' },
  { platform: 'X', message: 'Procesando engagement patterns...' },
  { platform: 'Spotify', message: 'Esperando autorización...' },
  { platform: 'GitHub', message: 'Sincronización completada: 45 repos, 1,234 commits' },
  { platform: 'X', message: 'Perfil semántico generado exitosamente' },
]

function StatusBadge({ status }: { status: ConnectionStatus }) {
  const config = {
    pending: {
      label: 'Pendiente',
      className: 'bg-white/10 text-white/60',
    },
    syncing: {
      label: 'Sincronizando',
      className: 'bg-amber-500/20 text-amber-400',
    },
    connected: {
      label: 'Conectado',
      className: 'bg-emerald-500/20 text-emerald-400',
    },
  }

  const { label, className } = config[status]

  return (
    <div className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', className)}>
      {status === 'syncing' && <Loader2 className="size-3 animate-spin" />}
      {status === 'connected' && <Check className="size-3" />}
      {status === 'pending' && <div className="size-1.5 rounded-full bg-current opacity-60" />}
      {label}
    </div>
  )
}

function ConnectionCard({ platform }: { platform: Platform }) {
  const isPending = platform.status === 'pending'
  const isSyncing = platform.status === 'syncing'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'glass-panel glass-panel-hover relative overflow-hidden p-6',
        isSyncing && 'ring-1 ring-white/20'
      )}
      style={{
        boxShadow: isSyncing ? `0 0 40px ${platform.glowColor}` : undefined,
      }}
    >
      {/* Syncing pulse effect */}
      {isSyncing && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      )}

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Icon container with gradient */}
          <div
            className={cn(
              'flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br',
              platform.color
            )}
            style={{
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.3)`,
            }}
          >
            {platform.icon}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">{platform.name}</h3>
            <StatusBadge status={platform.status} />
          </div>
        </div>

        {/* Action button */}
        <button
          className={cn(
            'rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200',
            isPending
              ? 'bg-white/10 text-white hover:bg-white/15 active:scale-95'
              : 'bg-white/5 text-white/40 cursor-not-allowed'
          )}
          disabled={!isPending}
        >
          {isPending ? 'Conectar' : isSyncing ? 'Analizando...' : 'Listo'}
        </button>
      </div>
    </motion.div>
  )
}

function TerminalLogs() {
  const [logs, setLogs] = useState<typeof mockLogs>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      if (index < mockLogs.length) {
        setLogs((prev) => [...prev, mockLogs[index]])
        index++
      } else {
        // Loop back
        index = 0
        setLogs([])
      }
    }, 1200)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [logs])

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'GitHub':
        return 'text-white'
      case 'X':
        return 'text-white'
      case 'LinkedIn':
        return 'text-blue-400'
      case 'Spotify':
        return 'text-green-400'
      default:
        return 'text-white/60'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-terminal overflow-hidden"
    >
      {/* Terminal header */}
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="size-3 rounded-full bg-red-500/80" />
          <div className="size-3 rounded-full bg-yellow-500/80" />
          <div className="size-3 rounded-full bg-green-500/80" />
        </div>
        <span className="ml-2 font-mono text-xs text-white/40">identity_sync.log</span>
      </div>

      {/* Logs container */}
      <div
        ref={containerRef}
        className="h-48 overflow-y-auto p-4 font-mono text-sm scrollbar-thin scrollbar-thumb-white/10"
      >
        <AnimatePresence mode="popLayout">
          {logs.map((log, i) => (
            <motion.div
              key={`${log.platform}-${log.message}-${i}`}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mb-1.5 flex"
            >
              <span className={cn('mr-2', getPlatformColor(log.platform))}>
                [{log.platform}]
              </span>
              <span className="text-white/70">{log.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Blinking cursor */}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block h-4 w-2 bg-white/60"
        />
      </div>
    </motion.div>
  )
}

export function IdentitySync() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505]">
      {/* Ambient orbs background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Purple orb */}
        <motion.div
          className="absolute -left-32 top-1/4 size-96 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Blue orb */}
        <motion.div
          className="absolute -right-32 top-1/3 size-80 rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, -40, 0],
            y: [0, 30, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        {/* Green orb */}
        <motion.div
          className="absolute bottom-1/4 left-1/3 size-72 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.5) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, -40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />

        {/* Subtle pink accent */}
        <motion.div
          className="absolute right-1/4 top-10 size-64 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.5) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{
            x: [0, -30, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-white/40">
            Digital Twin Protocol
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Sincroniza tu{' '}
            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
              identidad
            </span>
          </h1>
          <p className="mx-auto max-w-md text-lg text-white/50">
            Conecta tus redes para que la IA clone tu personalidad y aptitudes profesionales.
          </p>
        </motion.div>

        {/* Connection cards grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {platforms.map((platform, i) => (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <ConnectionCard platform={platform} />
            </motion.div>
          ))}
        </div>

        {/* Terminal logs */}
        <TerminalLogs />

        {/* Continue button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <button
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/30 active:scale-[0.98]"
          >
            <span className="relative z-10">Continuar al siguiente paso</span>
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-blue-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default IdentitySync
