import { cn } from '@/lib/utils'

export function Wordmark({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      <div className="relative">
        <div
          className="size-7 rounded-[9px] bg-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset,0_4px_12px_-2px_color-mix(in_oklab,var(--foreground)_40%,transparent)]"
          aria-hidden
        >
          <div className="absolute inset-[5px] rounded-[5px] bg-accent" />
          <div className="absolute right-1 bottom-1 size-1.5 rounded-full bg-background" />
        </div>
      </div>
      <span className="text-base font-semibold tracking-tight">
        Agent<span className="text-accent">Link</span>
      </span>
    </div>
  )
}
