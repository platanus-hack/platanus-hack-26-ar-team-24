import { v4 as uuidv4 } from 'uuid';
import { HttpError } from '../types/index.js';

// In-memory storage
const candidateProfiles: Map<string, any> = new Map();
const startupProfiles: Map<string, any> = new Map();

export const mockProfileService = {
  // Candidate Profile Methods
  async createCandidateProfile(userId: string, profileData: any) {
    const id = uuidv4();
    const now = new Date().toISOString();

    const profile = {
      id,
      user_id: userId,
      ...profileData,
      ai_agent: null,
      created_at: now,
      updated_at: now,
    };

    candidateProfiles.set(userId, profile);
    console.log(`✅ Candidate profile created for user: ${userId}`);
    return profile;
  },

  async getCandidateProfile(userId: string) {
    const profile = candidateProfiles.get(userId);
    if (!profile) {
      throw new HttpError('Candidate profile not found', 404);
    }
    return profile;
  },

  async updateCandidateProfile(userId: string, profileData: any) {
    const profile = candidateProfiles.get(userId);
    if (!profile) {
      throw new HttpError('Candidate profile not found', 404);
    }

    const updated = {
      ...profile,
      ...profileData,
      updated_at: new Date().toISOString(),
    };

    candidateProfiles.set(userId, updated);
    return updated;
  },

  // Startup Profile Methods
  async createStartupProfile(userId: string, profileData: any) {
    const id = uuidv4();
    const now = new Date().toISOString();

    const profile = {
      id,
      user_id: userId,
      ...profileData,
      recruiter_agent: null,
      created_at: now,
      updated_at: now,
    };

    startupProfiles.set(userId, profile);
    console.log(`✅ Startup profile created for user: ${userId}`);
    return profile;
  },

  async getStartupProfile(userId: string) {
    const profile = startupProfiles.get(userId);
    if (!profile) {
      throw new HttpError('Startup profile not found', 404);
    }
    return profile;
  },

  async updateStartupProfile(userId: string, profileData: any) {
    const profile = startupProfiles.get(userId);
    if (!profile) {
      throw new HttpError('Startup profile not found', 404);
    }

    const updated = {
      ...profile,
      ...profileData,
      updated_at: new Date().toISOString(),
    };

    startupProfiles.set(userId, updated);
    return updated;
  },

  // List methods
  async getAllCandidates() {
    return Array.from(candidateProfiles.values());
  },

  async getAllStartups() {
    return Array.from(startupProfiles.values());
  },
};
