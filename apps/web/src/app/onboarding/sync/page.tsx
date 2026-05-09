'use client'

import IdentitySync from '@/components/onboarding/IdentitySync'
import FlowNav from '@/components/layout/FlowNav'

export default function SyncPage() {
  return (
    <div className="min-h-screen bg-ink-950">
      <IdentitySync />
      <div className="px-6 pb-12">
        <FlowNav
          prev={{ href: '/auth', label: 'Volver a Acceder' }}
          next={{ href: '/dashboard', label: 'Continuar al Dashboard' }}
        />
      </div>
    </div>
  )
}
