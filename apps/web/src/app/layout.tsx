import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'AgentLink - AI-Powered Startup Team Matching',
  description: 'Connect with compatible talent and founders through intelligent AI matching',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-slate-900 text-slate-100">
        <main>{children}</main>
      </body>
    </html>
  )
}
