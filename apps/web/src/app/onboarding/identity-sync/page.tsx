'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Status = 'pending' | 'syncing' | 'connected'

const mockLogs = [
  '[GitHub] Conectando...',
  '[GitHub] 45 repositorios encontrados',
  '[GitHub] Analizando commits...',
  '[GitHub] Lenguajes: TypeScript, Python, Rust',
  '[X] Conectando...',
  '[X] 312 tweets analizados',
  '[X] Personalidad: Tech optimist',
  '[LinkedIn] Conectando...',
  '[LinkedIn] Experiencia: 8 anos en startups',
  '[LinkedIn] Skills: AI/ML, Full-Stack',
  '[Spotify] Conectando...',
  '[Spotify] 2,340 tracks analizados',
  '[Sistema] Correlacionando datos...',
  '[Sistema] Generando perfil...',
  '[Sistema] Twin digital listo!',
]

export default function IdentitySyncPage() {
  const router = useRouter()
  
  const [platforms, setPlatforms] = useState([
    { id: 'github', name: 'GitHub', icon: '⚡', status: 'pending' as Status },
    { id: 'twitter', name: 'X / Twitter', icon: '𝕏', status: 'pending' as Status },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', status: 'pending' as Status },
    { id: 'spotify', name: 'Spotify', icon: '🎵', status: 'pending' as Status },
  ])
  
  const [logs, setLogs] = useState<string[]>([])
  const [logIndex, setLogIndex] = useState(0)
  const [isReady, setIsReady] = useState(false)

  const connectedCount = platforms.filter(p => p.status === 'connected').length
  const isSyncing = platforms.some(p => p.status === 'syncing')

  // Stream logs when syncing
  useEffect(() => {
    if (!isSyncing && connectedCount === 0) return
    
    if (logIndex < mockLogs.length) {
      const timer = setTimeout(() => {
        setLogs(prev => [...prev.slice(-7), mockLogs[logIndex]])
        setLogIndex(i => i + 1)
      }, 400)
      return () => clearTimeout(timer)
    } else if (connectedCount >= 2) {
      setIsReady(true)
    }
  }, [logIndex, isSyncing, connectedCount])

  const handleConnect = (id: string) => {
    setPlatforms(prev =>
      prev.map(p => (p.id === id ? { ...p, status: 'syncing' as Status } : p))
    )
    
    // Complete after 2.5s
    setTimeout(() => {
      setPlatforms(prev =>
        prev.map(p => (p.id === id ? { ...p, status: 'connected' as Status } : p))
      )
    }, 2500)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-16">
          <Link href="/" className="text-zinc-500 hover:text-white text-sm">
            ← Volver
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-xs">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Paso 1 de 2
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Conecta tu identidad digital
          </h1>
          <p className="text-zinc-400 max-w-md mx-auto">
            Sincroniza tus redes para que nuestra IA clone tu personalidad
          </p>
        </div>

        {/* Platform Cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {platforms.map(platform => (
            <div
              key={platform.id}
              className={`p-6 rounded-xl border transition-all ${
                platform.status === 'connected'
                  ? 'bg-green-500/5 border-green-500/30'
                  : platform.status === 'syncing'
                  ? 'bg-blue-500/5 border-blue-500/30'
                  : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{platform.icon}</span>
                  <span className="font-semibold">{platform.name}</span>
                </div>
                
                {platform.status === 'connected' && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                
                {platform.status === 'syncing' && (
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              {platform.status === 'pending' && (
                <button
                  onClick={() => handleConnect(platform.id)}
                  className="w-full py-2.5 text-sm border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  Conectar
                </button>
              )}
              
              {platform.status === 'syncing' && (
                <p className="text-sm text-blue-400">Sincronizando...</p>
              )}
              
              {platform.status === 'connected' && (
                <p className="text-sm text-green-400">Conectado</p>
              )}
            </div>
          ))}
        </div>

        {/* Terminal */}
        {logs.length > 0 && (
          <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden mb-8">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-xs text-zinc-500 font-mono">sync.log</span>
            </div>
            <div className="p-4 font-mono text-sm space-y-1 h-48 overflow-hidden">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={
                    log.includes('[Sistema]') ? 'text-purple-400' :
                    log.includes('[GitHub]') ? 'text-green-400' :
                    log.includes('[X]') ? 'text-blue-400' :
                    log.includes('[LinkedIn]') ? 'text-cyan-400' :
                    'text-yellow-400'
                  }
                >
                  {`> ${log}`}
                </div>
              ))}
              {!isReady && <div className="text-zinc-600 animate-pulse">{`> _`}</div>}
            </div>
          </div>
        )}

        {/* Continue button */}
        <div className="text-center">
          {isReady ? (
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-semibold hover:bg-zinc-200 transition-colors"
            >
              Entrenar mi Twin
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          ) : (
            <p className="text-zinc-500 text-sm">
              {connectedCount}/4 conectadas (minimo 2)
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
