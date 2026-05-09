'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[100px] w-full rounded-xl border border-border bg-card/60 px-4 py-3 text-sm text-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.6)_inset,0_1px_2px_0_rgba(0,0,0,0.03)] backdrop-blur transition-all duration-200',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:border-foreground/40 focus-visible:ring-4 focus-visible:ring-foreground/5',
          'disabled:cursor-not-allowed disabled:opacity-50 resize-none',
          className
        )}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
