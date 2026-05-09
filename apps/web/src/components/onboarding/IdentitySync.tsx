'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Code, MessageSquare, Check, Loader2, Music } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ConnectionStatus = 'pending' | 'syncing' | 'connected'

interface ConnectionCard {
  id: string
  name: string
  icon: string
  status: ConnectionStatus
  description: string
}

const mockLogs = [
  '[GitHub] Analizando 45 repositorios...',
  '[GitHub] Extrayendo lenguaje de commits: Python, TypeScript, Rust',
  '[GitHub] Analizando patrones de código: 2847 commits analizados',
  '[X] Extrayendo sentimiento semántico de 300 tweets...',
  '[X] Detectado: Tech enthusiast, Early adopter, Community builder',
  '[X] Análisis de engagement: 12K followers, 8.5% interaction rate',
  '[LinkedIn] Mapeando grafo de contactos B2B...',
  '[LinkedIn] Experiencia detectada: 8 años en startup scale-ups',
  '[LinkedIn] Extrayendo skills: AI/ML, Full Stack, Product Strategy',
  '[Spotify] Analizando 2,340 tracks escuchados...',
  '[Spotify] Géneros preferidos: Synthwave, Indie Electrónica, Hip-Hop',
  '[Synthesis] Creando perfil digital único...',
  '[Synthesis] ✓ Identidad clonada exitosamente',
]

export function IdentitySync() {
  const [connections, setConnections] = useState<ConnectionCard[]>([
    {
      id: 'github',
      name: 'GitHub',
      icon: '💻',
      status: 'syncing',
      description: 'Repositorios y actividad',
    },
    {
      id: 'x',
      name: 'X (Twitter)',
      icon: '𝕏',
      status: 'syncing',
      description: 'Tweets y engagement',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: '💼',
      status: 'pending',
      description: 'Experiencia y contactos',
    },
    {
      id: 'spotify',
      name: 'Spotify',
      icon: '🎵',
      status: 'pending',
      description: 'Gustos musicales',
    },
  ])

  const [displayedLogs, setDisplayedLogs] = useState<string[]>([])
  const [logIndex, setLogIndex] = useState(0)

  // Simular logs que se desplazan
  useEffect(() => {
    if (logIndex < mockLogs.length) {
      const timer = setTimeout(() => {
        setDisplayedLogs((prev) => {
          const newLogs = [...prev, mockLogs[logIndex]]
          if (newLogs.length > 6) {
            newLogs.shift()
          }
          return newLogs
        })
        setLogIndex(logIndex + 1)
      }, 400)

      return () => clearTimeout(timer)
    }
  }, [logIndex])

  const handleConnect = (id: string) => {
    setConnections((prev) =>
      prev.map((conn) =>
        conn.id === id ? { ...conn, status: 'syncing' as const } : conn
      )
    )

    setTimeout(() => {
      setConnections((prev) =>
        prev.map((conn) =>
          conn.id === id ? { ...conn, status: 'connected' as const } : conn
        )
      )
    }, 2000)
  }

  const getStatusIcon = (status: ConnectionStatus) => {
    switch (status) {
      case 'connected':
        return <Check className="size-4 text-accent" />
      case 'syncing':
        return <Loader2 className="size-4 text-accent animate-spin" />
      case 'pending':
        return <div className="size-4 rounded-full border border-muted-foreground" />
    }
  }

  const getStatusText = (status: ConnectionStatus) => {
    switch (status) {
      case 'connected':
        return 'Conectado'
      case 'syncing':
        return 'Sincronizando...'
      case 'pending':
        return 'Pendiente'
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] px-6 py-12">
      {/* Animated background orbs */}
      <motion.div
        className="absolute -top-40 -left-40 size-96 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 blur-3xl"
        animate={{
          x: [0, 20, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 -right-40 size-80 rounded-full bg-gradient-to-br from-accent-cyan/15 to-accent-cyan/5 blur-3xl"
        animate={{
          x: [0, -30, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight text-foreground">
            Conecta tu <span className="text-accent">identidad digital</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Sincroniza tus redes para que nuestra IA clone tu personalidad y simule tus habilidades en entrevistas reales.
          </p>
        </motion.div>

        {/* Connection Cards Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {connections.map((conn, idx) => (
            <motion.div
              key={conn.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * idx }}
              className="glass-panel glass-panel-hover group relative overflow-hidden p-6"
            >
              {/* Animated gradient overlay on sync */}
              {conn.status === 'syncing' && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent"
                  animate={{ x: [-100, 100] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: '200%' }}
                />
              )}

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center text-center">
                {/* Icon */}
                <div className="mb-4 text-5xl">{conn.icon}</div>

                {/* Title */}
                <h3 className="font-serif text-lg font-semibold text-foreground">{conn.name}</h3>

                {/* Description */}
                <p className="mt-1 text-xs text-muted-foreground">{conn.description}</p>

                {/* Status */}
                <div className="mt-4 flex items-center gap-2">
                  {getStatusIcon(conn.status)}
                  <span className="text-xs font-medium text-muted-foreground">
                    {getStatusText(conn.status)}
                  </span>
                </div>

                {/* Button */}
                {conn.status === 'pending' && (
                  <Button
                    onClick={() => handleConnect(conn.id)}
                    variant="accent"
                    size="sm"
                    className="mt-4 w-full"
                  >
                    Conectar
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Terminal-style Log Viewer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-terminal p-6"
        >
          {/* Terminal header */}
          <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-4">
            <div className="size-3 rounded-full bg-accent" />
            <div className="size-3 rounded-full bg-accent/50" />
            <div className="size-3 rounded-full bg-accent/30" />
            <span className="ml-3 text-xs font-mono text-muted-foreground">
              identity-sync.log
            </span>
          </div>

          {/* Log lines */}
          <div className="space-y-2 font-mono text-xs">
            {displayedLogs.map((log, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-accent/80"
              >
                &gt; {log}
              </motion.div>
            ))}

            {/* Blinking cursor */}
            {logIndex < mockLogs.length && (
              <motion.div
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-accent"
              >
                &gt; _
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Info text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 rounded-lg border border-white/10 bg-white/[0.02] p-4 text-center text-sm text-muted-foreground"
        >
          Tus datos se procesan de forma anónima y segura. Nuestra IA entrenará un modelo personalizado de tu forma de ser, habilidades y comportamiento comunicacional.
        </motion.div>
      </div>
    </div>
  )
}
