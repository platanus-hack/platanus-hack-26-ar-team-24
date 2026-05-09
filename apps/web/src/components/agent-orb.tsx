import { cn } from '@/lib/utils'

type Variant = 'purple' | 'pink' | 'cyan' | 'emerald'

interface AgentOrbProps {
  variant?: Variant
  size?: number
  label?: string
  pulse?: boolean
  orbit?: boolean
  className?: string
}

const COLOR: Record<Variant, string> = {
  purple: 'var(--accent)',
  pink: 'var(--accent-pink)',
  cyan: 'var(--accent-cyan)',
  emerald: 'var(--accent-emerald)',
}

/**
 * AgentOrb — visual representation of an AI agent.
 * Radial gradient sphere + breathing animation + orbiting particles.
 */
export function AgentOrb({
  variant = 'purple',
  size = 96,
  label,
  pulse = true,
  orbit = true,
  className,
}: AgentOrbProps) {
  const color = COLOR[variant]

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      {/* Outer glow halo */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-70"
        style={{ background: color }}
      />

      {/* Pulsing ring */}
      {pulse && (
        <div
          className="absolute inset-2 rounded-full animate-pulse-ring"
          style={
            {
              ['--accent' as string]: color,
              border: `1px solid ${color}`,
            } as React.CSSProperties
          }
        />
      )}

      {/* Orbiting particles */}
      {orbit && (
        <>
          <div
            className="absolute inset-0 animate-orbit"
            style={{ width: size, height: size }}
          >
            <span
              className="absolute left-1/2 -top-0.5 size-1.5 -translate-x-1/2 rounded-full"
              style={{ background: color, boxShadow: `0 0 8px ${color}` }}
            />
          </div>
          <div
            className="absolute inset-0 animate-orbit-rev"
            style={{ width: size, height: size }}
          >
            <span
              className="absolute -left-0.5 top-1/2 size-1 -translate-y-1/2 rounded-full"
              style={{ background: 'white', boxShadow: `0 0 6px ${color}` }}
            />
          </div>
        </>
      )}

      {/* Core orb */}
      <div
        className="relative animate-breathe rounded-full"
        style={{
          width: size * 0.62,
          height: size * 0.62,
          background: `radial-gradient(circle at 30% 25%, white 0%, ${color} 35%, color-mix(in oklab, ${color} 40%, black) 100%)`,
          boxShadow: `inset -4px -8px 18px rgba(0,0,0,0.35), 0 0 28px ${color}`,
        }}
      >
        {/* Highlight */}
        <div
          className="absolute left-[18%] top-[14%] rounded-full opacity-80"
          style={{
            width: size * 0.2,
            height: size * 0.12,
            background:
              'radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 70%)',
            filter: 'blur(2px)',
          }}
        />
        {label && (
          <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-medium text-white/90 mix-blend-screen">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
