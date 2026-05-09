'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium tracking-tight transition-[transform,box-shadow,background] duration-200 ease-out focus-mac disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.15)_inset,0_8px_24px_-8px_rgba(0,0,0,0.4)] hover:shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset,0_12px_32px_-8px_rgba(0,0,0,0.5)] hover:-translate-y-px',
        accent:
          'bg-accent text-accent-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.4)_inset,0_8px_28px_-8px_color-mix(in_oklab,var(--accent)_55%,transparent)] hover:-translate-y-px hover:shadow-[0_1px_0_0_rgba(255,255,255,0.5)_inset,0_14px_36px_-8px_color-mix(in_oklab,var(--accent)_70%,transparent)]',
        outline:
          'border border-border bg-card/60 backdrop-blur text-foreground hover:bg-card hover:-translate-y-px hover:shadow-sm',
        ghost: 'text-foreground/80 hover:text-foreground hover:bg-foreground/5',
        glass:
          'glass text-foreground hover:bg-card/85 hover:-translate-y-px',
        destructive:
          'bg-destructive text-destructive-foreground hover:opacity-90',
        link: 'text-foreground underline-offset-4 hover:underline rounded-none',
      },
      size: {
        default: 'h-10 px-5',
        sm: 'h-8 px-4 text-xs',
        lg: 'h-12 px-7 text-[0.95rem]',
        xl: 'h-14 px-9 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
