'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-11 w-full rounded-xl border border-border bg-card/60 px-4 py-2 text-sm text-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.6)_inset,0_1px_2px_0_rgba(0,0,0,0.03)] backdrop-blur transition-all duration-200',
          'placeholder:text-muted-foreground',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'focus-visible:outline-none focus-visible:border-foreground/40 focus-visible:ring-4 focus-visible:ring-foreground/5',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
