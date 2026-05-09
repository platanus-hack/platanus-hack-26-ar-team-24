'use client'

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import {
  GitBranch,
  Music,
  Briefcase,
  CheckCircle2,
  Loader2,
  Clock,
  ArrowRight,
  Zap,
} from 'lucide-react'

type Status = 'pending' | 'syncing' | 'connected'

interface Platform {
  id: string
  name: string
  description: string
  status: Status
  accent: string
  accentRgb: string
  icon: React.ReactNode
}

const PLATFORM_DEFS: Omit<Platform, 'status'>[] = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Repositorios & actividad de código',
    accent: '#a78bfa',
    accentRgb: '167,139,250',
    icon: <GitBranch size={22} strokeWidth={1.5} />,
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    description: 'Tweets & sentimiento semántico',
    accent: '#38bdf8',
    accentRgb: '56,189,248',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.636 5.903-5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Red profesional & experiencia',
    accent: '#60a5fa',
    accentRgb: '96,165,250',
    icon: <Briefcase size={22} strokeWidth={1.5} />,
  },
  {
    id: 'spotify',
    name: 'Spotify',
    description: 'Gustos & personalidad sonora',
    accent: '#34d399',
    accentRgb: '52,211,153',
    icon: <Music size={22} strokeWidth={1.5} />,
  },
]

const PlatformCard = memo(function PlatformCard({
  platform,
  onToggle,
}: {
  platform: Platform
  onToggle: (id: string) => void
}) {
  const { id, name, description, status, accent, accentRgb, icon } = platform
  return (
    <div
      className="identity-card"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid rgba(${accentRgb},${status === 'pending' ? '0.1' : '0.25'})`,
        borderRadius: 18,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow: status !== 'pending'
          ? `0 8px 32px rgba(0,0,0,0.5), 0 0 40px rgba(${accentRgb},0.12), inset 0 1px 0 rgba(255,255,255,0.06)`
          : '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {status !== 'pending' ? (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse at 15% 15%, rgba(${accentRgb},0.1) 0%, transparent 55%)`,
        }} />
      ) : null}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          padding: 10, borderRadius: 12,
          background: `rgba(${accentRgb},0.12)`,
          border: `1px solid rgba(${accentRgb},0.22)`,
          color: accent, display: 'flex',
        }}>
          {icon}
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 10, fontWeight: 600, padding: '4px 9px', borderRadius: 999,
          ...(status === 'connected'
            ? { background: 'rgba(52,211,153,0.1)', color: '#6ee7b7', border: '1px solid rgba(52,211,153,0.2)' }
            : status === 'syncing'
            ? { background: `rgba(${accentRgb},0.1)`, color: accent, border: `1px solid rgba(${accentRgb},0.2)` }
            : { background: 'rgba(255,255,255,0.05)', color: '#475569', border: '1px solid rgba(255,255,255,0.08)' }),
        }}>
          {status === 'connected'
            ? <CheckCircle2 size={10} aria-hidden="true" />
            : status === 'syncing'
            ? <Loader2 size={10} className="spin-icon" aria-hidden="true" />
            : <Clock size={10} aria-hidden="true" />}
          {status === 'connected' ? 'Conectado' : status === 'syncing' ? 'Sincronizando' : 'Pendiente'}
        </span>
      </div>

      <div>
        <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14, margin: '0 0 3px' }}>{name}</p>
        <p style={{ color: '#334155', fontSize: 11, margin: 0, lineHeight: 1.5 }}>{description}</p>
      </div>

      <button
        className="identity-btn"
        onClick={() => onToggle(id)}
        disabled={status === 'syncing'}
        style={{
          fontSize: 11, fontWeight: 600, padding: '11px 12px',
          borderRadius: 8, cursor: status === 'syncing' ? 'not-allowed' : 'pointer',
          minHeight: 44,
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          transition: 'background 0.2s ease, color 0.2s ease, opacity 0.2s ease',
          ...(status === 'connected'
            ? { background: 'rgba(52,211,153,0.1)', color: '#6ee7b7', border: '1px solid rgba(52,211,153,0.2)' }
            : status === 'syncing'
            ? { background: `rgba(${accentRgb},0.08)`, color: accent, border: `1px solid rgba(${accentRgb},0.15)`, opacity: 0.6 }
            : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }),
        }}
      >
        {status === 'connected' ? 'Desconectar' : status === 'syncing' ? 'Analizando...' : 'Conectar'}
      </button>
    </div>
  )
})

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

const INITIAL_STATUSES: Record<string, Status> = {
  github: 'syncing',
  x: 'syncing',
  linkedin: 'pending',
  spotify: 'pending',
}

export default function IdentitySync() {
  const [platforms, setPlatforms] = useState<Platform[]>(() =>
    PLATFORM_DEFS.map(p => ({ ...p, status: INITIAL_STATUSES[p.id] ?? 'pending' }))
  )

  const [logs, setLogs] = useState<string[]>([])
  const logIdxRef = useRef(0)
  const termRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setInterval(() => {
      const line = LOGS[logIdxRef.current % LOGS.length]
      logIdxRef.current++
      setLogs(prev => [...prev.slice(-12), line])
    }, 800)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight
    }
  }, [logs])

  const toggle = useCallback((id: string) => {
    setPlatforms(prev =>
      prev.map(p => {
        if (p.id !== id) return p
        const next: Record<Status, Status> = {
          pending: 'syncing',
          syncing: 'connected',
          connected: 'pending',
        }
        return { ...p, status: next[p.status] }
      })
    )
  }, [])

  return (
    <>
      <style>{`
        @keyframes orb-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.08); }
        }
        @keyframes spin-slow {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeup {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .identity-card { transition: box-shadow 0.35s ease, border-color 0.35s ease; }
        .identity-card:hover { transform: translateY(-2px); transition: transform 0.2s ease, box-shadow 0.35s ease; }
        .log-line { animation: fadeup 0.25s ease-out both; }
        .live-dot { animation: blink 1.4s ease-in-out infinite; }
        .spin-icon { animation: spin-slow 1.2s linear infinite; }
        .cta-btn:focus-visible { outline: 2px solid #a78bfa; outline-offset: 3px; }
        .identity-btn:focus-visible { outline: 2px solid #a78bfa; outline-offset: 2px; }
        @media (max-width: 480px) {
          .cards-grid { grid-template-columns: 1fr !important; }
          .page-heading { font-size: 28px !important; }
          .cta-btn { width: 100%; justify-content: center; }
        }
        @media (prefers-reduced-motion: reduce) {
          .identity-card, .identity-card:hover { transition: none; transform: none; }
          .log-line { animation: none; }
          .live-dot { animation: none; }
          .spin-icon { animation: none; }
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          width: '100%',
          background: '#050505',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'calc(80px + env(safe-area-inset-top)) 20px calc(80px + env(safe-area-inset-bottom)) 20px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', borderRadius: '50%',
            width: 700, height: 700, top: '-15%', left: '-12%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 65%)',
            filter: 'blur(70px)',
            animation: 'orb-pulse 8s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', borderRadius: '50%',
            width: 550, height: 550, bottom: '-18%', right: '-10%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 65%)',
            filter: 'blur(60px)',
            animation: 'orb-pulse 10s ease-in-out infinite 2s',
          }} />
          <div style={{
            position: 'absolute', borderRadius: '50%',
            width: 350, height: 350, top: '50%', left: '48%',
            background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 65%)',
            filter: 'blur(50px)',
            transform: 'translate(-50%, -50%)',
            animation: 'orb-pulse 12s ease-in-out infinite 4s',
          }} />
        </div>

        {/* Header */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', marginBottom: 48, maxWidth: 480 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(139,92,246,0.12)',
            border: '1px solid rgba(139,92,246,0.3)',
            color: '#c4b5fd',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
            padding: '6px 14px', borderRadius: 999, marginBottom: 20,
          }}>
            <Zap size={11} aria-hidden="true" />
            Identity Sync
          </div>
          <h1 className="page-heading" style={{
            fontSize: 36, fontWeight: 700, color: '#ffffff',
            letterSpacing: '-0.025em', lineHeight: 1.15, margin: '0 0 12px',
          }}>
            Clona tu identidad digital
          </h1>
          <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
            Tu agente IA analiza tus señales en la web para construir
            una representación auténtica — lista para conectar.
          </p>
        </div>

        {/* Cards */}
        <div className="cards-grid" style={{
          position: 'relative', zIndex: 10,
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 12, width: '100%', maxWidth: 560, marginBottom: 16,
        }}>
          {platforms.map(p => (
            <PlatformCard key={p.id} platform={p} onToggle={toggle} />
          ))}
        </div>

        {/* Terminal */}
        <div style={{
          position: 'relative', zIndex: 10,
          width: '100%', maxWidth: 560,
          background: 'rgba(255,255,255,0.025)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(139,92,246,0.18)',
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 60px rgba(139,92,246,0.07), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>
          {/* titlebar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(239,68,68,0.6)' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(234,179,8,0.6)' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(34,197,94,0.6)' }} />
            <span style={{ marginLeft: 8, fontSize: 11, color: '#334155', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
              identity-agent — sync.log
            </span>
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa' }} />
              <span style={{ fontSize: 11, color: '#a78bfa', fontFamily: 'monospace', fontWeight: 700 }}>LIVE</span>
            </span>
          </div>

          {/* logs */}
          <div
            ref={termRef}
            role="log"
            aria-live="polite"
            aria-label="Registro de sincronización de identidad"
            style={{
              height: 144, overflow: 'hidden', overscrollBehavior: 'contain',
              padding: '12px 16px',
              display: 'flex', flexDirection: 'column', gap: 6,
            }}
          >
            {logs.map((line, i) => (
              <div
                key={i}
                className="log-line"
                style={{
                  fontFamily: 'monospace', fontSize: 11,
                  color: '#475569', lineHeight: 1.5,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  flexShrink: 0,
                }}
              >
                <span style={{ color: '#6d28d9', marginRight: 8 }}>›</span>
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ position: 'relative', zIndex: 10, marginTop: 36 }}>
          <button
            className="cta-btn"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '14px 28px', borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(139,92,246,0.9), rgba(236,72,153,0.9))',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#ffffff', fontSize: 14, fontWeight: 600,
              cursor: 'pointer',
              minHeight: 48,
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              boxShadow: '0 4px 24px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
              transition: 'box-shadow 0.2s ease, transform 0.15s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 40px rgba(139,92,246,0.6), inset 0 1px 0 rgba(255,255,255,0.2)'
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.15)'
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
            }}
          >
            Continuar — Generar Agente IA
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </>
  )
}
