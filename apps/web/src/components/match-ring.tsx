'use client'

import { motion } from 'framer-motion'
import { AnimatedNumber } from './animated-number'
import { cn } from '@/lib/utils'

interface MatchRingProps {
  /** 0–100 */
  score: number
  size?: number
  thickness?: number
  className?: string
  delay?: number
  variant?: 'purple-pink' | 'cyan-emerald'
}

const GRADIENTS: Record<NonNullable<MatchRingProps['variant']>, [string, string]> = {
  'purple-pink': ['var(--accent)', 'var(--accent-pink)'],
  'cyan-emerald': ['var(--accent-cyan)', 'var(--accent-emerald)'],
}

export function MatchRing({
  score,
  size = 120,
  thickness = 8,
  className,
  delay = 0,
  variant = 'purple-pink',
}: MatchRingProps) {
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.max(0, Math.min(100, score))
  const offset = circumference * (1 - pct / 100)
  const [from, to] = GRADIENTS[variant]
  const id = `mr-${variant}`

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={thickness}
          fill="none"
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${id})`}
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay }}
          style={{ filter: `drop-shadow(0 0 8px ${from})` }}
        />
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-serif text-3xl leading-none tabular-nums text-foreground">
          <AnimatedNumber value={pct} duration={1400} />
        </div>
        <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          match
        </div>
      </div>
    </div>
  )
}
