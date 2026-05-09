import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AmbientBg } from '@/components/ambient-bg'
import { Wordmark } from '@/components/wordmark'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <AmbientBg />
      <header className="px-6 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
            <ArrowLeft className="size-4" />
            <span>Volver</span>
          </Link>
          <Wordmark />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        {children}
      </main>
    </div>
  )
}
