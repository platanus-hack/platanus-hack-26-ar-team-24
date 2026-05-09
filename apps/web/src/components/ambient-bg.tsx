export function AmbientBg() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Mesh gradients */}
      <div className="absolute inset-0 mesh" />

      {/* Floating blobs (fachera) */}
      <div className="absolute -top-40 -left-32 size-[520px] rounded-full bg-accent/30 blur-[120px] animate-float-slow" />
      <div
        className="absolute top-1/3 -right-40 size-[460px] rounded-full blur-[120px] animate-float-slow"
        style={{
          background: 'color-mix(in oklab, oklch(0.8 0.13 200) 35%, transparent)',
          animationDelay: '-4s',
        }}
      />
      <div
        className="absolute -bottom-40 left-1/3 size-[500px] rounded-full blur-[140px] animate-float-slow"
        style={{
          background: 'color-mix(in oklab, oklch(0.85 0.13 50) 30%, transparent)',
          animationDelay: '-8s',
        }}
      />

      {/* Subtle grid lines (minimal) */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Grain */}
      <div className="absolute inset-0 grain" />
    </div>
  )
}
