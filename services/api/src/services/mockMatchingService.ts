import { v4 as uuidv4 } from 'uuid';
import { HttpError } from '../types/index.js';
import { mockProfileService } from './mockProfileService.js';

// In-memory storage for matches
const matches: Map<string, any> = new Map();

export const mockMatchingService = {
  async runMatching(userId: string) {
    // Get the startup for this founder
    const startup = await mockProfileService.getStartupProfile(userId);

    // Get all candidate profiles
    const candidates = await mockProfileService.getAllCandidates();

    if (candidates.length === 0) {
      return {
        startup_id: startup.id,
        matches_count: 0,
        matches: [],
      };
    }

    // Calculate matches
    const calculatedMatches = candidates.map(candidate => {
      const matchScore = this.calculateMatch(startup, candidate);
      const matchId = uuidv4();
      const now = new Date().toISOString();

      const match = {
        id: matchId,
        candidate_id: candidate.id,
        startup_id: startup.id,
        match_score: matchScore,
        summary: this.generateSummary(candidate, startup, matchScore),
        reasons: this.generateReasons(candidate, startup),
        status: 'pending',
        created_at: now,
        updated_at: now,
      };

      // Store in memory
      matches.set(matchId, match);
      return match;
    });

    // Sort by match score descending
    const sortedMatches = calculatedMatches.sort((a, b) => b.match_score - a.match_score);

    return {
      startup_id: startup.id,
      matches_count: sortedMatches.length,
      matches: sortedMatches,
    };
  },

  async getMatchResults(userId: string) {
    // Get startup profile
    const startup = await mockProfileService.getStartupProfile(userId);

    // Get matches for this startup
    const userMatches = Array.from(matches.values()).filter(
      m => m.startup_id === startup.id
    );

    return { matches: userMatches };
  },

  async updateMatchStatus(matchId: string, status: 'accepted' | 'rejected') {
    const match = matches.get(matchId);
    if (!match) {
      throw new HttpError('Match not found', 404);
    }

    const updated = {
      ...match,
      status,
      updated_at: new Date().toISOString(),
    };

    matches.set(matchId, updated);
    return updated;
  },

  calculateMatch(startup: any, candidate: any): number {
    let score = 0;

    // Skill overlap (40%)
    const candidateSkills = (candidate.skills || []).map((s: string) => s.toLowerCase());
    const startupStack = (startup.stack || []).map((s: string) => s.toLowerCase());

    const commonSkills = candidateSkills.filter((skill: string) =>
      startupStack.some((tech: string) => tech.includes(skill) || skill.includes(tech))
    );

    const skillScore = commonSkills.length > 0 ? Math.min(1, (commonSkills.length / 3) * 0.7) : 0;
    score += skillScore * 0.4;

    // Experience match (30%)
    const experienceMatch = candidate.experience_years > 0 ? Math.min(1, candidate.experience_years / 10) : 0.3;
    score += experienceMatch * 0.3;

    // Tech stack overlap (30%)
    const candidateTechs = (candidate.technologies || []).map((t: string) => t.toLowerCase());
    const commonTechs = candidateTechs.filter((tech: string) =>
      startupStack.some((s: string) => s.toLowerCase().includes(tech) || tech.includes(s.toLowerCase()))
    );

    const techScore = commonTechs.length > 0 ? Math.min(1, (commonTechs.length / 3) * 0.7) : 0;
    score += techScore * 0.3;

    // Add some randomness for demo purposes
    const randomFactor = 0.85 + Math.random() * 0.15;
    const finalScore = Math.min(1, Math.max(0.3, score * randomFactor));

    return parseFloat(finalScore.toFixed(2));
  },

  generateSummary(candidate: any, startup: any, score: number): string {
    const summaries = [
      `Excellent match with ${score * 100 | 0}% compatibility. ${candidate.username} brings strong technical skills that align well with ${startup.name}'s vision.`,
      `${candidate.username} is a great fit for ${startup.name} with ${score * 100 | 0}% compatibility. Their experience in ${candidate.skills?.[0] || 'tech'} aligns with your stack.`,
      `Strong compatibility (${score * 100 | 0}%) detected. ${candidate.username}'s background in ${candidate.technologies?.[0] || 'development'} makes them a valuable addition to ${startup.name}.`,
      `Outstanding match! ${candidate.username} shares ${score * 100 | 0}% compatibility with ${startup.name}'s requirements and culture.`,
      `${candidate.username} demonstrates ${score * 100 | 0}% compatibility with ${startup.name}'s technical and cultural needs.`,
    ];

    return summaries[Math.floor(Math.random() * summaries.length)];
  },

  generateReasons(candidate: any, startup: any): string[] {
    const reasons = [];

    // Skill match reasons
    const candidateSkills = (candidate.skills || []).map((s: string) => s.toLowerCase());
    const startupStack = (startup.stack || []).map((s: string) => s.toLowerCase());

    const commonSkills = candidateSkills.filter((skill: string) =>
      startupStack.some((tech: string) => tech.includes(skill) || skill.includes(tech))
    );

    if (commonSkills.length > 0) {
      reasons.push(`${commonSkills.length} matching skills: ${commonSkills.join(', ')}`);
    }

    // Experience
    if (candidate.experience_years >= 5) {
      reasons.push(`Strong professional experience (${candidate.experience_years}+ years)`);
    } else if (candidate.experience_years >= 2) {
      reasons.push(`Solid experience level (${candidate.experience_years} years)`);
    }

    // Tech overlap
    const candidateTechs = (candidate.technologies || []).map((t: string) => t.toLowerCase());
    const commonTechs = candidateTechs.filter((tech: string) =>
      startupStack.some((s: string) => s.toLowerCase().includes(tech) || tech.includes(s.toLowerCase()))
    );

    if (commonTechs.length > 0) {
      reasons.push(`Familiar with key technologies in your stack`);
    }

    // Culture alignment
    if (startup.culture_values && startup.culture_values.length > 0) {
      reasons.push(`Likely to thrive in your company culture`);
    }

    // Add generic reasons if needed
    if (reasons.length === 0) {
      reasons.push(`Complementary skills and experience`);
      reasons.push(`Good cultural fit potential`);
    }

    return reasons;
  },
};
