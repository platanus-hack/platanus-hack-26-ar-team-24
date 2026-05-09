import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z.string().min(2, 'Username must be at least 2 characters'),
  user_type: z.enum(['talent', 'founder'], { errorMap: () => ({ message: 'Must be talent or founder' }) }),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Candidate Profile Schema
export const candidateProfileSchema = z.object({
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  skills: z.array(z.string()).min(1, 'At least one skill required'),
  experience_years: z.number().min(0).max(60),
  technologies: z.array(z.string()).optional(),
  github_url: z.string().url().optional().or(z.literal('')),
  linkedin_url: z.string().url().optional().or(z.literal('')),
});

// Startup Profile Schema
export const startupProfileSchema = z.object({
  name: z.string().min(2, 'Startup name required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  stack: z.array(z.string()).min(1, 'At least one tech in stack required'),
  culture_values: z.array(z.string()).optional(),
});

// Opportunity Schema
export const opportunitySchema = z.object({
  title: z.string().min(5, 'Title required'),
  description: z.string().min(20, 'Description required'),
  required_skills: z.array(z.string()).min(1, 'At least one skill required'),
  required_experience: z.number().min(0).max(60),
});

// Compatibility Score Request
export const compatibilitySchema = z.object({
  candidate_id: z.string().uuid(),
  startup_id: z.string().uuid(),
});

// GitHub Analysis
export const githubAnalysisSchema = z.object({
  github_username: z.string().min(1, 'GitHub username required'),
});

// LinkedIn Analysis
export const linkedinAnalysisSchema = z.object({
  linkedin_url: z.string().url('Valid LinkedIn URL required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CandidateProfileInput = z.infer<typeof candidateProfileSchema>;
export type StartupProfileInput = z.infer<typeof startupProfileSchema>;
export type OpportunityInput = z.infer<typeof opportunitySchema>;
export type CompatibilityInput = z.infer<typeof compatibilitySchema>;
export type GitHubAnalysisInput = z.infer<typeof githubAnalysisSchema>;
export type LinkedInAnalysisInput = z.infer<typeof linkedinAnalysisSchema>;
