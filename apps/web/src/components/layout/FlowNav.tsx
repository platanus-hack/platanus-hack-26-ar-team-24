'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface FlowNavProps {
  prev?: { href: string; label: string }
  next?: { href: string; label: string }
}

export default function FlowNav({ prev, next }: FlowNavProps) {
  return (
    <div className="flex items-center justify-between gap-3 mt-12 pt-6 border-t border-white/5 max-w-3xl mx-auto w-full">
      {prev ? (
        <Link
          href={prev.href}
          className="group inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          {prev.label}
        </Link>
      ) : <span />}
      {next ? (
        <Link
          href={next.href}
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors"
        >
          {next.label}
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : <span />}
    </div>
  )
}
