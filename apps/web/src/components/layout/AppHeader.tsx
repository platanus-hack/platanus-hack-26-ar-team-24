import Logo from './Logo'

export default function AppHeader({
  meta,
  rightSlot,
  maxWidth = 'max-w-6xl',
}: {
  meta?: string
  rightSlot?: React.ReactNode
  maxWidth?: string
}) {
  return (
    <header className="border-b border-white/5">
      <div className={`${maxWidth} mx-auto px-6 py-5 flex items-center justify-between`}>
        <Logo
          href="/landing"
          showMark={false}
          wordmarkClassName="font-sans text-lg font-extralight tracking-[0.24em] text-zinc-200 pl-[0.24em]"
        />
        {rightSlot ?? (meta && (
          <span className="text-xs text-zinc-500 font-mono">{meta}</span>
        ))}
      </div>
    </header>
  )
}
