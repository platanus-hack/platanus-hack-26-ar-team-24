import * as React from 'react'
import { cn } from '@/lib/utils'

interface MacWindowProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  toolbar?: React.ReactNode
}

export function MacWindow({
  title,
  subtitle,
  toolbar,
  className,
  children,
  ...props
}: MacWindowProps) {
  return (
    <div
      className={cn(
        'glass-strong overflow-hidden rounded-[28px]',
        className
      )}
      {...props}
    >
      {/* Title bar */}
      <div className="relative flex items-center justify-between border-b border-border/60 bg-foreground/[0.02] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-traffic-red shadow-[0_1px_0_0_rgba(255,255,255,0.3)_inset,0_0_0_0.5px_rgba(0,0,0,0.1)]" />
          <span className="size-3 rounded-full bg-traffic-yellow shadow-[0_1px_0_0_rgba(255,255,255,0.3)_inset,0_0_0_0.5px_rgba(0,0,0,0.1)]" />
          <span className="size-3 rounded-full bg-traffic-green shadow-[0_1px_0_0_rgba(255,255,255,0.3)_inset,0_0_0_0.5px_rgba(0,0,0,0.1)]" />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
          {title && (
            <div className="text-[11px] font-medium tracking-tight text-foreground/70">
              {title}
            </div>
          )}
          {subtitle && (
            <div className="text-[10px] tracking-wide text-muted-foreground">
              {subtitle}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">{toolbar}</div>
      </div>

      {children}
    </div>
  )
}
