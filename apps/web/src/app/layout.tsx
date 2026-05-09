import type { Metadata, Viewport } from 'next'
import { Inter, Instrument_Serif, JetBrains_Mono } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AgentLink — AI Matching for Startup Teams',
  description:
    'Conecta talento y founders a través de agentes de IA. Compatibilidad real, equipos extraordinarios.',
}

export const viewport: Viewport = {
  themeColor: '#f7f5f0',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${instrumentSerif.variable} ${jetbrains.variable} bg-background`}
    >
      <body className="font-sans antialiased text-foreground">
        {children}
      </body>
    </html>
  )
}
