import { ApiResponse, AuthResponse, User } from '@/types/api'
import { supabase } from '@/lib/supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export class ApiClient {
  private static instance: ApiClient
  private token: string | null = null

  private constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient()
    }
    return ApiClient.instance
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  getToken(): string | null {
    return this.token
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  private async getToken(): Promise<string | null> {
    // Try in-memory token first
    if (this.token) return this.token

    // Try localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth_token')
      if (stored) return stored
    }

    // Try Supabase session as fallback
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        this.token = session.access_token
        return session.access_token
      }
    } catch (err) {
      console.error('Error getting token from Supabase:', err)
    }

    return null
  }

  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Always get fresh token from localStorage
    let token = this.token
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('auth_token')
    }

    if (includeAuth && token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: Record<string, any>,
    includeAuth = true
  ): Promise<ApiResponse<T>> {
    const url = `${API_URL}${endpoint}`

    const options: RequestInit = {
      method,
      headers: this.getHeaders(includeAuth),
    }

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body)
    }

    try {
      const response = await fetch(url, options)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      return data as ApiResponse<T>
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error)
      throw error
    }
  }

  // Auth endpoints
  async register(
    email: string,
    username: string,
    password: string,
    user_type: 'talent' | 'founder'
  ): Promise<AuthResponse> {
    const response = await this.request<{
      token: string
      user: User
    }>('/auth/register', 'POST', {
      email,
      username,
      password,
      user_type,
    }, false)

    if (response.data) {
      this.setToken(response.data.token)
    }

    return response as AuthResponse
  }

  async login(
    email: string,
    password: string
  ): Promise<AuthResponse> {
    const response = await this.request<{
      token: string
      user: User
    }>('/auth/login', 'POST', {
      email,
      password,
    }, false)

    if (response.data) {
      this.setToken(response.data.token)
    }

    return response as AuthResponse
  }

  // Candidate profile endpoints
  async createCandidateProfile(profileData: any) {
    return this.request('/profile/candidate', 'POST', profileData)
  }

  async getCandidateProfile() {
    return this.request('/profile/candidate', 'GET')
  }

  async updateCandidateProfile(profileData: any) {
    return this.request('/profile/candidate', 'PUT', profileData)
  }

  // Startup profile endpoints
  async createStartupProfile(profileData: any) {
    return this.request('/profile/startup', 'POST', profileData)
  }

  async getStartupProfile() {
    return this.request('/profile/startup', 'GET')
  }

  async updateStartupProfile(profileData: any) {
    return this.request('/profile/startup', 'PUT', profileData)
  }

  // Matching endpoints
  async runMatching() {
    return this.request('/match/run', 'POST', {})
  }

  async getMatchResults() {
    return this.request('/match/results', 'GET')
  }

  async updateMatchStatus(matchId: string, status: 'accepted' | 'rejected') {
    return this.request('/match/status', 'PUT', { matchId, status })
  }

  // List endpoints
  async getCandidates() {
    return this.request('/user/candidates', 'GET', undefined, false)
  }

  async getFounders() {
    return this.request('/user/founders', 'GET', undefined, false)
  }
}

export const api = ApiClient.getInstance()
