'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="text-xl font-bold tracking-tight">AgentLink</div>
        <Link href="/auth/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
          Iniciar sesion
        </Link>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-xs border border-zinc-800 rounded-full bg-zinc-900/50">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Twin Digital con IA
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl leading-[1.1]">
          Tu clon digital.
          <br />
          <span className="text-zinc-500">Entrenado para brillar.</span>
        </h1>

        <p className="mt-6 text-lg text-zinc-400 max-w-xl">
          Conecta tus redes, entrena tu agente de IA y deja que simule entrevistas y encuentre el equipo perfecto para vos.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Crear mi Twin
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="#how"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium border border-zinc-800 rounded-lg hover:bg-zinc-900 transition-colors"
          >
            Como funciona
          </Link>
        </div>

        {/* Demo visual */}
        <div className="mt-20 w-full max-w-4xl">
          <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-3 text-xs text-zinc-500 font-mono">twin-digital.ai</span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Identidad conectada</div>
                {[
                  { name: 'GitHub', status: 'Sincronizado', color: 'green' },
                  { name: 'LinkedIn', status: 'Sincronizado', color: 'green' },
                  { name: 'Twitter/X', status: 'Analizando...', color: 'blue' },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-zinc-800">
                    <span className="text-sm">{item.name}</span>
                    <span className={`text-xs ${item.color === 'green' ? 'text-green-500' : 'text-blue-500'}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-black/50 border border-zinc-800 rounded-lg font-mono">
                <div className="text-xs text-zinc-500 mb-3">$ agent analyze --profile</div>
                <div className="space-y-1 text-xs text-zinc-400">
                  <div className="text-green-500">{`>`} Perfil: Full-Stack Developer</div>
                  <div className="text-green-500">{`>`} Skills: React, Python, AI/ML</div>
                  <div className="text-green-500">{`>`} Estilo: Early-stage builder</div>
                  <div className="text-blue-500 animate-pulse">{`>`} Generando twin digital...</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* How it works */}
      <section id="how" className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">Como funciona</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Conecta tus redes', desc: 'GitHub, LinkedIn, Twitter. Todo lo que define tu identidad profesional.' },
            { step: '02', title: 'Entrena tu agente', desc: 'Nuestra IA analiza tu personalidad, skills y forma de comunicar.' },
            { step: '03', title: 'Simula y matchea', desc: 'Tu twin hace entrevistas por vos y encuentra equipos compatibles.' },
          ].map((item) => (
            <div key={item.step} className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <div className="text-xs text-zinc-500 font-mono mb-4">{item.step}</div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-24 max-w-6xl mx-auto text-center">
        <div className="p-12 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          <h2 className="text-3xl font-bold mb-4">Listo para crear tu Twin?</h2>
          <p className="text-zinc-400 mb-8">Empieza gratis. Sin tarjeta de credito.</p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors"
          >
            Comenzar ahora
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-zinc-500">
          <span>AgentLink</span>
          <span>Hecho en Buenos Aires</span>
        </div>
      </footer>
    </div>
  )
}
