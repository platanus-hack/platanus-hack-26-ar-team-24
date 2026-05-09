import { useEffect, useState } from 'react'
import { AuthState, subscribeToAuth, getAuthState } from '@/lib/auth'

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => getAuthState())

  useEffect(() => {
    const unsubscribe = subscribeToAuth(setAuthState)
    return unsubscribe
  }, [])

  return authState
}
