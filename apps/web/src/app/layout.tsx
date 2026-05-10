import type { Metadata } from 'next'
import { Inter, Lora } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'knowAhuman — IA para reconexión humana',
  description: 'Tu IA clona tu personalidad para encontrar conexiones genuinas.',
  icons: {
    icon: '/images/agentlink-logo.png',
    shortcut: '/images/agentlink-logo.png',
    apple: '/images/agentlink-logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${lora.variable}`}>
      <body className="bg-ink-950 text-white font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
