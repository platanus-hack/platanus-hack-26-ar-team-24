import Link from 'next/link'

const SIZES = {
  sm: 'w-7 h-7 rounded-md text-sm',
  md: 'w-10 h-10 rounded-lg text-lg',
} as const

export default function Logo({
  size = 'sm',
  href,
  showName = true,
}: {
  size?: keyof typeof SIZES
  href?: string
  showName?: boolean
}) {
  const mark = (
    <div className="flex items-center gap-2">
      <div className={`${SIZES[size]} bg-white text-black flex items-center justify-center font-serif font-bold`}>
        A
      </div>
      {showName && <span className="text-sm font-medium tracking-tight">AgentLink</span>}
    </div>
  )
  return href ? <Link href={href}>{mark}</Link> : mark
}
