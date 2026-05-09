import { supabaseClient, supabaseAdmin } from '../config/supabase.js';
import {
  CandidateProfile,
  StartupProfile,
  HttpError,
  GitHubProfile,
  LinkedInProfile,
  CandidateProfileUpdate,
  StartupProfileUpdate,
} from '../types/index.js';
import {
  CandidateProfileInput,
  StartupProfileInput,
} from '../utils/validators.js';

export const profileService = {
  // CANDIDATE PROFILES
  async createCandidateProfile(
    userId: string,
    input: CandidateProfileInput
  ): Promise<CandidateProfile> {
    const { data, error } = await supabaseAdmin
      .from('candidate_profiles')
      .insert({
        user_id: userId,
        ...input,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      throw new HttpError('Failed to create candidate profile', 500);
    }

    return data;
  },

  async getCandidateProfile(userId: string): Promise<CandidateProfile> {
    const { data, error } = await supabaseClient
      .from('candidate_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new HttpError('Candidate profile not found', 404);
    }

    return data;
  },

  async updateCandidateProfile(
    userId: string,
    input: CandidateProfileUpdate
  ): Promise<CandidateProfile> {
    const { data, error } = await supabaseAdmin
      .from('candidate_profiles')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      throw new HttpError('Failed to update candidate profile', 500);
    }

    return data;
  },

  // STARTUP PROFILES
  async createStartupProfile(
    userId: string,
    input: StartupProfileInput
  ): Promise<StartupProfile> {
    const { data, error } = await supabaseAdmin
      .from('startup_profiles')
      .insert({
        user_id: userId,
        ...input,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      throw new HttpError('Failed to create startup profile', 500);
    }

    return data;
  },

  async getStartupProfile(startupId: string): Promise<StartupProfile> {
    const { data, error } = await supabaseClient
      .from('startup_profiles')
      .select('*')
      .eq('id', startupId)
      .single();

    if (error || !data) {
      throw new HttpError('Startup profile not found', 404);
    }

    return data;
  },

  async getStartupProfileByUserId(userId: string): Promise<StartupProfile> {
    const { data, error } = await supabaseClient
      .from('startup_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new HttpError('Startup profile not found', 404);
    }

    return data;
  },

  async updateStartupProfile(
    userId: string,
    input: StartupProfileUpdate
  ): Promise<StartupProfile> {
    const { data, error } = await supabaseAdmin
      .from('startup_profiles')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      throw new HttpError('Failed to update startup profile', 500);
    }

    return data;
  },

  // GITHUB PROFILES
  async analyzeGitHub(
    userId: string,
    githubUsername: string
  ): Promise<GitHubProfile> {
    // Mock GitHub analysis for MVP
    const { data, error } = await supabaseAdmin
      .from('github_profiles')
      .upsert({
        user_id: userId,
        github_username: githubUsername,
        repositories: Math.floor(Math.random() * 50),
        stars: Math.floor(Math.random() * 100),
        languages: ['TypeScript', 'JavaScript', 'Python', 'Go'],
        analyzed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      throw new HttpError('Failed to analyze GitHub profile', 500);
    }

    return data;
  },

  // LINKEDIN PROFILES
  async analyzeLinkedIn(
    userId: string,
    linkedinUrl: string
  ): Promise<LinkedInProfile> {
    // Mock LinkedIn analysis for MVP
    const { data, error } = await supabaseAdmin
      .from('linkedin_profiles')
      .upsert({
        user_id: userId,
        linkedin_username: linkedinUrl.split('/').pop() || 'unknown',
        headline: 'Full Stack Developer | AI Enthusiast',
        company: 'Tech Company Inc',
        analyzed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      throw new HttpError('Failed to analyze LinkedIn profile', 500);
    }

    return data;
  },
};
