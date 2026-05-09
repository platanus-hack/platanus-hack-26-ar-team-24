'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [isTraining, setIsTraining] = useState(false)
  const [progress, setProgress] = useState(0)

  const startTraining = () => {
    setIsTraining(true)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 100)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-40 right-20 w-96 h-96 bg-green-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-zinc-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">AgentLink</Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-xs text-green-400">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Twin Activo
            </div>
            <button className="text-sm text-zinc-400 hover:text-white">
              Cerrar sesion
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-2">Tu Twin Digital</h1>
          <p className="text-zinc-400">Tu agente de IA esta listo para representarte</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            { label: 'Redes conectadas', value: '4', icon: '🔗' },
            { label: 'Datos procesados', value: '2.8K', icon: '📊' },
            { label: 'Precision del modelo', value: '94%', icon: '🎯' },
          ].map(stat => (
            <div key={stat.label} className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-zinc-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Twin Status */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Profile Card */}
          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <h2 className="text-lg font-semibold mb-4">Perfil detectado</h2>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-zinc-500 mb-1">Rol</div>
                <div className="font-medium">Full-Stack Developer</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 mb-1">Skills principales</div>
                <div className="flex flex-wrap gap-2">
                  {['React', 'Python', 'AI/ML', 'TypeScript', 'PostgreSQL'].map(skill => (
                    <span key={skill} className="px-2 py-1 bg-zinc-800 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 mb-1">Personalidad</div>
                <div className="text-sm text-zinc-300">
                  Tech optimist, Early adopter, Builder mindset
                </div>
              </div>
            </div>
          </div>

          {/* Training Card */}
          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <h2 className="text-lg font-semibold mb-4">Entrenamiento</h2>
            
            {!isTraining && progress === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🤖</div>
                <p className="text-zinc-400 mb-6">
                  Entrena tu twin para que pueda simular entrevistas por vos
                </p>
                <button
                  onClick={startTraining}
                  className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors"
                >
                  Iniciar entrenamiento
                </button>
              </div>
            )}

            {isTraining && progress < 100 && (
              <div className="py-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Entrenando modelo...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {progress === 100 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Twin entrenado!</h3>
                <p className="text-zinc-400 mb-6">
                  Tu agente esta listo para simular entrevistas
                </p>
                <button className="px-6 py-3 bg-green-500 text-black rounded-lg font-medium hover:bg-green-400 transition-colors">
                  Iniciar simulacion
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Activity */}
        <div className="mt-8 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Actividad reciente</h2>
          <div className="space-y-3">
            {[
              { time: 'Hace 2 min', action: 'Spotify sincronizado', icon: '🎵' },
              { time: 'Hace 5 min', action: 'LinkedIn analizado', icon: '💼' },
              { time: 'Hace 8 min', action: 'X/Twitter procesado', icon: '𝕏' },
              { time: 'Hace 12 min', action: 'GitHub escaneado', icon: '⚡' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 py-2 border-b border-zinc-800 last:border-0">
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1">
                  <div className="text-sm">{item.action}</div>
                  <div className="text-xs text-zinc-500">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
