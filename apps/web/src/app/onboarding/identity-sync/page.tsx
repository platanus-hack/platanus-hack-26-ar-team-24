'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Loader2, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Wordmark } from '@/components/wordmark'

type ConnectionStatus = 'pending' | 'syncing' | 'connected'

interface ConnectionCard {
  id: string
  name: string
  icon: string
  status: ConnectionStatus
  description: string
  color: string
}

const mockLogs = [
  '[GitHub] Escaneando 45 repositorios...',
  '[GitHub] Lenguajes detectados: Python, TypeScript, Rust',
  '[GitHub] Analizando 2,847 commits...',
  '[GitHub] Patrones de codigo extraidos',
  '[X] Descargando 300 tweets...',
  '[X] Analizando sentimiento semantico...',
  '[X] Perfil: Tech enthusiast, Early adopter',
  '[X] Engagement rate: 8.5%',
  '[LinkedIn] Mapeando grafo de contactos...',
  '[LinkedIn] 8 anos en startup scale-ups',
  '[LinkedIn] Skills: AI/ML, Full Stack, Product',
  '[Spotify] Analizando 2,340 tracks...',
  '[Spotify] Generos: Synthwave, Electronica',
  '[SYNTHESIS] Compilando personalidad virtual...',
  '[SYNTHESIS] Modelo de agente entrenado',
  '[SYNTHESIS] Twin digital listo',
]

export default function IdentitySyncPage() {
  const router = useRouter()
  
  const [connections, setConnections] = useState<ConnectionCard[]>([
    {
      id: 'github',
      name: 'GitHub',
      icon: '/icons/github.svg',
      status: 'pending',
      description: 'Repositorios y commits',
      color: '#7c3aed',
    },
    {
      id: 'x',
      name: 'X (Twitter)',
      icon: '/icons/x.svg',
      status: 'pending',
      description: 'Tweets y engagement',
      color: '#06b6d4',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: '/icons/linkedin.svg',
      status: 'pending',
      description: 'Experiencia y red',
      color: '#0077b5',
    },
    {
      id: 'spotify',
      name: 'Spotify',
      icon: '/icons/spotify.svg',
      status: 'pending',
      description: 'Gustos musicales',
      color: '#1db954',
    },
  ])

  const [displayedLogs, setDisplayedLogs] = useState<string[]>([])
  const [logIndex, setLogIndex] = useState(0)
  const [isTraining, setIsTraining] = useState(false)
  const [trainingComplete, setTrainingComplete] = useState(false)

  const connectedCount = connections.filter(c => c.status === 'connected').length
  const syncingCount = connections.filter(c => c.status === 'syncing').length

  // Auto-start syncing when page loads for demo
  useEffect(() => {
    const timer = setTimeout(() => {
      // Start GitHub sync
      setConnections(prev => prev.map(c => 
        c.id === 'github' ? { ...c, status: 'syncing' as const } : c
      ))
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Simulate log streaming
  useEffect(() => {
    if (!isTraining && syncingCount === 0) return
    
    if (logIndex < mockLogs.length) {
      const timer = setTimeout(() => {
        setDisplayedLogs(prev => {
          const newLogs = [...prev, mockLogs[logIndex]]
          return newLogs.slice(-8) // Keep last 8 logs
        })
        setLogIndex(i => i + 1)
      }, 300)
      return () => clearTimeout(timer)
    } else if (isTraining && !trainingComplete) {
      setTimeout(() => setTrainingComplete(true), 500)
    }
  }, [logIndex, isTraining, syncingCount, trainingComplete])

  // Auto-complete syncing connections after delay
  useEffect(() => {
    const syncingConns = connections.filter(c => c.status === 'syncing')
    syncingConns.forEach(conn => {
      const timer = setTimeout(() => {
        setConnections(prev => prev.map(c => 
          c.id === conn.id ? { ...c, status: 'connected' as const } : c
        ))
      }, 3000 + Math.random() * 2000)
      return () => clearTimeout(timer)
    })
  }, [connections])

  const handleConnect = (id: string) => {
    setConnections(prev =>
      prev.map(conn =>
        conn.id === id ? { ...conn, status: 'syncing' as const } : conn
      )
    )
  }

  const handleStartTraining = () => {
    setIsTraining(true)
  }

  const handleContinue = () => {
    router.push('/onboarding/candidate')
  }

  const getStatusIcon = (status: ConnectionStatus) => {
    switch (status) {
      case 'connected':
        return <Check className="size-5 text-emerald-400" />
      case 'syncing':
        return <Loader2 className="size-5 text-violet-400 animate-spin" />
      case 'pending':
        return <div className="size-5 rounded-full border-2 border-white/20" />
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030303]">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -left-40 size-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, 40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 -right-40 size-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, -40, 0],
            y: [0, 50, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute -bottom-20 left-1/3 size-[450px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Header */}
      <header className="relative z-20 px-6 py-5">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Wordmark />
          <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs font-medium text-white/60 backdrop-blur-sm border border-white/10">
            <div className="size-2 rounded-full bg-violet-500 animate-pulse" />
            Configurando tu twin digital
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-6 py-8">
        <div className="mx-auto max-w-5xl">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Conecta tu{' '}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                identidad digital
              </span>
            </h1>
            <p className="mt-4 text-lg text-white/50">
              Sincroniza tus redes para entrenar tu agente de IA personalizado
            </p>
          </motion.div>

          {/* Connection Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {connections.map((conn, idx) => (
              <motion.div
                key={conn.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * idx }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.06] hover:border-white/20"
                style={{
                  boxShadow: conn.status === 'syncing' 
                    ? `0 0 40px -10px ${conn.color}40`
                    : conn.status === 'connected'
                    ? `0 0 30px -10px ${conn.color}30`
                    : 'none',
                }}
              >
                {/* Sync animation overlay */}
                {conn.status === 'syncing' && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}

                <div className="relative z-10 flex flex-col items-center text-center">
                  {/* Platform icon */}
                  <div 
                    className="mb-3 flex size-14 items-center justify-center rounded-xl text-3xl"
                    style={{ 
                      background: `linear-gradient(135deg, ${conn.color}20, ${conn.color}10)`,
                      border: `1px solid ${conn.color}30`,
                    }}
                  >
                    {conn.id === 'github' && (
                      <svg className="size-7" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    )}
                    {conn.id === 'x' && (
                      <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    )}
                    {conn.id === 'linkedin' && (
                      <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    )}
                    {conn.id === 'spotify' && (
                      <svg className="size-7" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-sm font-semibold text-white">{conn.name}</h3>
                  <p className="mt-1 text-xs text-white/40">{conn.description}</p>

                  {/* Status */}
                  <div className="mt-3 flex items-center gap-2">
                    {getStatusIcon(conn.status)}
                    <span className="text-xs text-white/50">
                      {conn.status === 'connected' && 'Conectado'}
                      {conn.status === 'syncing' && 'Sincronizando...'}
                      {conn.status === 'pending' && 'Pendiente'}
                    </span>
                  </div>

                  {/* Connect button */}
                  {conn.status === 'pending' && (
                    <Button
                      onClick={() => handleConnect(conn.id)}
                      size="sm"
                      className="mt-4 w-full bg-white/10 text-white hover:bg-white/20 border-0"
                    >
                      Conectar
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Terminal Log Viewer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden"
          >
            {/* Terminal header */}
            <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.02] px-4 py-3">
              <div className="size-3 rounded-full bg-red-500/80" />
              <div className="size-3 rounded-full bg-yellow-500/80" />
              <div className="size-3 rounded-full bg-green-500/80" />
              <span className="ml-3 font-mono text-xs text-white/40">
                agent-training.log
              </span>
              {(syncingCount > 0 || isTraining) && (
                <div className="ml-auto flex items-center gap-2">
                  <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-xs text-emerald-400">LIVE</span>
                </div>
              )}
            </div>

            {/* Log content */}
            <div className="h-48 overflow-hidden p-4 font-mono text-sm">
              <AnimatePresence mode="popLayout">
                {displayedLogs.map((log, idx) => (
                  <motion.div
                    key={`${log}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-white/60"
                  >
                    <span className="text-white/30">$</span> {log}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Blinking cursor */}
              {(syncingCount > 0 || (isTraining && !trainingComplete)) && (
                <motion.div
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="text-violet-400"
                >
                  <span className="text-white/30">$</span> _
                </motion.div>
              )}

              {/* Empty state */}
              {displayedLogs.length === 0 && syncingCount === 0 && !isTraining && (
                <div className="flex h-full items-center justify-center text-white/30">
                  Conecta una red para comenzar el analisis...
                </div>
              )}
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 flex flex-col items-center gap-4"
          >
            {connectedCount >= 2 && !isTraining && !trainingComplete && (
              <Button
                onClick={handleStartTraining}
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 border-0 shadow-lg shadow-violet-500/25"
              >
                <Sparkles className="mr-2 size-4" />
                Entrenar mi Agente de IA
              </Button>
            )}

            {trainingComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-2 text-emerald-400">
                  <Check className="size-5" />
                  <span className="font-medium">Twin digital creado exitosamente</span>
                </div>
                <Button
                  onClick={handleContinue}
                  size="lg"
                  className="bg-white text-black hover:bg-white/90"
                >
                  Continuar al perfil
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </motion.div>
            )}

            {connectedCount < 2 && (
              <p className="text-sm text-white/40">
                Conecta al menos 2 redes para entrenar tu agente
              </p>
            )}
          </motion.div>

          {/* Info footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center text-sm text-white/40"
          >
            Tus datos se procesan de forma segura. El agente de IA aprende tu personalidad, 
            habilidades y estilo de comunicacion para representarte en simulaciones de entrevistas.
          </motion.div>
        </div>
      </main>
    </div>
  )
}
