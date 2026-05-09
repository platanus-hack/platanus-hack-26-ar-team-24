'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'

export interface RadarDatum {
  axis: string
  value: number // 0–100
}

interface MatchRadarProps {
  data: RadarDatum[]
  height?: number
}

export function MatchRadar({ data, height = 220 }: MatchRadarProps) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="78%">
          <defs>
            <linearGradient id="radar-fill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.55} />
              <stop offset="100%" stopColor="var(--accent-pink)" stopOpacity={0.45} />
            </linearGradient>
            <linearGradient id="radar-stroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--accent)" />
              <stop offset="100%" stopColor="var(--accent-pink)" />
            </linearGradient>
          </defs>
          <PolarGrid
            stroke="rgba(255,255,255,0.12)"
            strokeDasharray="2 4"
          />
          <PolarAngleAxis
            dataKey="axis"
            tick={{
              fill: 'rgba(255,255,255,0.6)',
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.1em',
            }}
          />
          <PolarRadiusAxis
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            dataKey="value"
            stroke="url(#radar-stroke)"
            strokeWidth={2}
            fill="url(#radar-fill)"
            isAnimationActive
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
