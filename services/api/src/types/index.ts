// User Types
export type UserType = 'talent' | 'founder';

export interface User {
  id: string;
  email: string;
  username: string;
  user_type: UserType;
  created_at: string;
  updated_at: string;
}

export interface AuthPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Candidate Profile (Talent)
export interface CandidateProfile {
  id: string;
  user_id: string;
  bio: string;
  skills: string[];
  experience_years: number;
  technologies: string[];
  github_url?: string;
  linkedin_url?: string;
  ai_agent?: string;
  created_at: string;
  updated_at: string;
}

// Startup Profile (Founder)
export interface StartupProfile {
  id: string;
  user_id: string;
  name: string;
  description: string;
  stack: string[];
  culture_values: string[];
  recruiter_agent?: string;
  created_at: string;
  updated_at: string;
}

// Opportunity (Job/Role at Startup)
export interface Opportunity {
  id: string;
  startup_id: string;
  title: string;
  description: string;
  required_skills: string[];
  required_experience: number;
  created_at: string;
  updated_at: string;
}

// Match (Compatibility Result)
export interface Match {
  id: string;
  candidate_id: string;
  startup_id: string;
  match_score: number;
  summary: string;
  reasons: string[];
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

// AI Agent
export interface AIAgent {
  id: string;
  owner_id: string;
  agent_type: 'candidate' | 'recruiter';
  profile_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// GitHub Profile
export interface GitHubProfile {
  id: string;
  user_id: string;
  github_username: string;
  repositories: number;
  stars: number;
  languages: string[];
  analyzed_at: string;
}

// LinkedIn Profile
export interface LinkedInProfile {
  id: string;
  user_id: string;
  linkedin_username: string;
  headline: string;
  company: string;
  analyzed_at: string;
}

// Compatibility Score Response
export interface CompatibilityScore {
  match_score: number;
  summary: string;
  reasons: string[];
  metadata?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  timestamp: string;
}

export interface JWTPayload {
  id: string;
  email: string;
  user_type?: UserType;
  iat?: number;
  exp?: number;
}

// Update DTOs
export interface CandidateProfileUpdate extends Partial<CandidateProfile> {
  bio?: string;
  skills?: string[];
  experience_years?: number;
  technologies?: string[];
  github_url?: string;
  linkedin_url?: string;
  ai_agent?: string;
}

export interface StartupProfileUpdate extends Partial<StartupProfile> {
  name?: string;
  description?: string;
  stack?: string[];
  culture_values?: string[];
  recruiter_agent?: string;
}

export class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}
