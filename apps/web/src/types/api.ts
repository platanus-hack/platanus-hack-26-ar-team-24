// Auth Types
export interface AuthResponse {
  success: boolean
  data: {
    token: string
    user: User
  }
  error: string | null
  timestamp: string
}

export interface User {
  id: string
  email: string
  username: string
  user_type: 'talent' | 'founder'
  created_at: string
  updated_at: string
}

// Candidate Profile Types
export interface CandidateProfile {
  id: string
  user_id: string
  bio: string
  skills: string[]
  experience_years: number
  technologies: string[]
  github_url: string
  linkedin_url: string
  ai_agent: string | null
  created_at: string
  updated_at: string
}

export interface CandidateProfileInput {
  bio: string
  skills: string[]
  experience_years: number
  technologies: string[]
  github_url: string
  linkedin_url: string
}

// Startup Profile Types
export interface StartupProfile {
  id: string
  user_id: string
  name: string
  description: string
  stack: string[]
  culture_values: string[]
  recruiter_agent: string | null
  created_at: string
  updated_at: string
}

export interface StartupProfileInput {
  name: string
  description: string
  stack: string[]
  culture_values: string[]
}

// Match Types
export interface Match {
  id: string
  candidate_id: string
  startup_id: string
  match_score: number
  summary: string
  reasons: string[]
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
}

export interface MatchRunResponse {
  success: boolean
  data: {
    startup_id: string
    matches_count: number
    matches: Match[]
  }
  error: string | null
  timestamp: string
}

export interface MatchResultsResponse {
  success: boolean
  data: {
    matches: Match[]
  }
  error: string | null
  timestamp: string
}

// Generic API Response
export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: string | null
  details?: Record<string, string>
  timestamp: string
}
