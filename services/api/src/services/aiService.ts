import { config } from '../config/env.js';
import { CompatibilityScore, HttpError, CandidateProfile, StartupProfile } from '../types/index.js';

export const aiService = {
  async generateCandidateAgent(profile: CandidateProfile): Promise<string> {
    // Mock AI agent generation for candidate
    const agent = `CandidateAgent_${profile.id.substring(0, 8)}`;
    return agent;
  },

  async generateRecruiterAgent(profile: StartupProfile): Promise<string> {
    // Mock AI recruiter agent generation
    const agent = `RecruiterAgent_${profile.id.substring(0, 8)}`;
    return agent;
  },

  async generateSummary(candidateId: string, startupId: string): Promise<string> {
    // Mock summary generation
    return `Professional match between candidate ${candidateId.substring(0, 8)} and startup ${startupId.substring(0, 8)}. Strong technical compatibility and shared values.`;
  },

  async scoreCompatibilityDeep(
    candidate: CandidateProfile,
    startup: StartupProfile
  ): Promise<CompatibilityScore> {
    if (!config.openai.apiKey && !config.anthropic.apiKey) {
      throw new HttpError('No AI service configured', 500);
    }

    // Mock deep compatibility analysis
    const candidateSkills = new Set(candidate.skills || []);
    const startupStack = new Set(startup.stack || []);

    const commonSkills = Array.from(candidateSkills).filter((skill) =>
      Array.from(startupStack).some(
        (tech) =>
          tech.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(tech.toLowerCase())
      )
    );

    const matchScore = Math.min(
      (commonSkills.length / Math.max(candidateSkills.size, 1)) * 0.6 +
        Math.min(candidate.experience_years / 5, 1) * 0.2 +
        Math.min((candidate.technologies?.length || 0) / (startup.stack.length || 1), 1) * 0.2,
      1
    );

    const reasons = [
      commonSkills.length > 0
        ? `${commonSkills.length} matching skills: ${commonSkills.join(', ')}`
        : 'Growing skill match potential',
      candidate.experience_years >= 3
        ? 'Strong professional experience'
        : 'Early-stage talent with growth mindset',
      (candidate.technologies?.length || 0) > 0
        ? `${candidate.technologies?.length || 0} technologies in toolkit`
        : 'Open to learning new technologies',
    ];

    return {
      match_score: Math.round(matchScore * 100) / 100,
      summary: `Strong AI engineer compatible with ${startup.name || 'this'} early-stage startup`,
      reasons,
      metadata: {
        analyzed_at: new Date().toISOString(),
        model: 'agentlink-v1',
      },
    };
  },
};
