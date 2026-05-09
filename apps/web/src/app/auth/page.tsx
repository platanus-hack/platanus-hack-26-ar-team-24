'use client'

import Link from 'next/link'

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="text-sm text-zinc-500 hover:text-white mb-8 block">
          ← Volver
        </Link>
        
        <h1 className="text-2xl font-bold mb-2">Bienvenido a AgentLink</h1>
        <p className="text-zinc-400 text-sm mb-8">Elige como quieres continuar</p>

        <div className="space-y-3">
          <Link
            href="/auth/login"
            className="block w-full p-4 text-center border border-zinc-800 rounded-lg hover:bg-zinc-900 transition-colors"
          >
            Iniciar sesion
          </Link>
          <Link
            href="/auth/register"
            className="block w-full p-4 text-center bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors font-medium"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </div>
  )
}
