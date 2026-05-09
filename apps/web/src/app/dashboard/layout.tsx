import { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  // Each dashboard page renders its own chrome (top bar, etc.) for a tailored macOS feel.
  return <>{children}</>
}
