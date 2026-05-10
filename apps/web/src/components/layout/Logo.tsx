import Link from 'next/link'
import Image from 'next/image'

const SIZES = {
  sm: {
    frame: 'h-8 w-8 rounded-md',
    image: 32,
  },
  md: {
    frame: 'h-11 w-11 rounded-lg',
    image: 44,
  },
} as const

export default function Logo({
  size = 'sm',
  href,
  showName = true,
  showMark = true,
  wordmarkClassName,
}: {
  size?: keyof typeof SIZES
  href?: string
  showName?: boolean
  showMark?: boolean
  wordmarkClassName?: string
}) {
  const mark = (
    <div className="flex items-center gap-2">
      {showMark && (
        <div className={`${SIZES[size].frame} overflow-hidden bg-white/95 ring-1 ring-black/5`}>
          <Image
            src="/images/agentlink-logo.png"
            alt="knowAhuman"
            width={SIZES[size].image}
            height={SIZES[size].image}
            className="h-full w-full object-cover"
            priority={size === 'md'}
          />
        </div>
      )}
      {showName && (
        <span className={wordmarkClassName ?? 'text-sm font-medium tracking-tight'}>
          knowAhuman
        </span>
      )}
    </div>
  )
  return href ? <Link href={href}>{mark}</Link> : mark
}
