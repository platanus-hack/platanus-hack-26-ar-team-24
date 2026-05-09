import { supabase } from './supabase'

export interface AuthUser {
  id: string
  email: string
  username?: string
  user_type?: 'talent' | 'founder'
}

export interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

let authState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
}

const listeners: Set<(state: AuthState) => void> = new Set()

export function subscribeToAuth(listener: (state: AuthState) => void) {
  listeners.add(listener)
  listener(authState)
  return () => listeners.delete(listener)
}

function notifyListeners() {
  listeners.forEach(listener => listener(authState))
}

export function getAuthState(): AuthState {
  return { ...authState }
}

async function syncAuthFromSupabase() {
  if (typeof window === 'undefined') return

  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      authState = {
        user: {
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
          user_type: session.user.user_metadata?.user_type,
        },
        token: session.access_token,
        isAuthenticated: true,
        isLoading: false,
      }

      localStorage.setItem('auth_token', session.access_token)
    } else {
      authState = {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      }
      localStorage.removeItem('auth_token')
    }

    notifyListeners()
  } catch (error) {
    console.error('Auth sync error:', error)
    authState.isLoading = false
    notifyListeners()
  }
}

export function clearAuth() {
  authState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
  }

  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
  }

  notifyListeners()
}

export async function logout() {
  await supabase.auth.signOut()
  clearAuth()
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('Login failed')

  const user: AuthUser = {
    id: data.user.id,
    email: data.user.email || '',
    username: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0],
    user_type: data.user.user_metadata?.user_type as 'talent' | 'founder' | undefined,
  }

  authState = {
    user,
    token: data.session?.access_token || null,
    isAuthenticated: true,
    isLoading: false,
  }

  notifyListeners()
  return user
}

export async function register(email: string, password: string, user_type: 'talent' | 'founder'): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { user_type },
    },
  })

  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('Registration failed')

  const user: AuthUser = {
    id: data.user.id,
    email: data.user.email || '',
    username: data.user.email?.split('@')[0],
    user_type,
  }

  authState = {
    user,
    token: data.session?.access_token || null,
    isAuthenticated: !!data.session,
    isLoading: false,
  }

  notifyListeners()
  return user
}

if (typeof window !== 'undefined') {
  syncAuthFromSupabase()

  supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      authState = {
        user: {
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
          user_type: session.user.user_metadata?.user_type,
        },
        token: session.access_token,
        isAuthenticated: true,
        isLoading: false,
      }
      localStorage.setItem('auth_token', session.access_token)
    } else {
      authState = {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      }
      localStorage.removeItem('auth_token')
    }
    notifyListeners()
  })
}
