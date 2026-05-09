import { supabaseClient, supabaseAdmin } from '../config/supabase.js';
import { Match, HttpError, CompatibilityScore } from '../types/index.js';

export const matchingService = {
  async calculateCompatibility(
    candidateId: string,
    startupId: string
  ): Promise<CompatibilityScore> {
    // Get candidate profile
    const { data: candidate } = await supabaseClient
      .from('candidate_profiles')
      .select('*')
      .eq('id', candidateId)
      .single();

    // Get startup profile
    const { data: startup } = await supabaseClient
      .from('startup_profiles')
      .select('*')
      .eq('id', startupId)
      .single();

    if (!candidate || !startup) {
      throw new HttpError('Candidate or startup not found', 404);
    }

    // Mock compatibility score for MVP
    // In production, this would call actual AI
    const candidateSkills = new Set(candidate.skills || []);
    const startupStack = new Set(startup.stack || []);

    // Calculate skill overlap
    const commonSkills = Array.from(candidateSkills).filter((skill) =>
      Array.from(startupStack).some(
        (tech) =>
          (tech as string).toLowerCase().includes((skill as string).toLowerCase()) ||
          (skill as string).toLowerCase().includes((tech as string).toLowerCase())
      )
    );

    const skillMatch = candidateSkills.size > 0
      ? (commonSkills.length / candidateSkills.size) * 0.6
      : 0.3;

    // Calculate experience match
    const experienceMatch = Math.min(
      candidate.experience_years / 5,
      1
    ) * 0.2;

    // Calculate technology match
    const techMatch = Math.min(
      (candidate.technologies?.length || 0) / (startup.stack.length || 1),
      1
    ) * 0.2;

    const matchScore = Math.min(
      skillMatch + experienceMatch + techMatch + 0.15,
      1
    );

    // Generate reasons
    const reasons: string[] = [];
    if (commonSkills.length > 0) {
      reasons.push(
        `${commonSkills.length} matching skills: ${commonSkills.join(', ')}`
      );
    }
    if (candidate.experience_years >= 3) {
      reasons.push('Strong professional experience');
    }
    if ((candidate.technologies?.length || 0) > 0) {
      reasons.push('Diverse technical background');
    }

    return {
      match_score: Math.round(matchScore * 100) / 100,
      summary: `Strong match between ${candidate.id} and startup. Compatible technical background and experience level.`,
      reasons,
      metadata: {
        skillMatch,
        experienceMatch,
        techMatch,
      },
    };
  },

  async createMatch(
    candidateId: string,
    startupId: string
  ): Promise<Match> {
    // Calculate compatibility first
    const compatibility = await this.calculateCompatibility(
      candidateId,
      startupId
    );

    // Save match
    const { data, error } = await supabaseAdmin
      .from('matches')
      .insert({
        candidate_id: candidateId,
        startup_id: startupId,
        match_score: compatibility.match_score,
        summary: compatibility.summary,
        reasons: compatibility.reasons,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      throw new HttpError('Failed to create match', 500);
    }

    return data;
  },

  async getMatchesForCandidate(candidateId: string): Promise<Match[]> {
    const { data, error } = await supabaseClient
      .from('matches')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('match_score', { ascending: false });

    if (error) {
      throw new HttpError('Failed to fetch matches', 500);
    }

    return data || [];
  },

  async getMatchesForStartup(startupId: string): Promise<Match[]> {
    const { data, error } = await supabaseClient
      .from('matches')
      .select('*')
      .eq('startup_id', startupId)
      .order('match_score', { ascending: false });

    if (error) {
      throw new HttpError('Failed to fetch matches', 500);
    }

    return data || [];
  },

  async updateMatchStatus(
    matchId: string,
    status: 'accepted' | 'rejected'
  ): Promise<Match> {
    const { data, error } = await supabaseAdmin
      .from('matches')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', matchId)
      .select()
      .single();

    if (error || !data) {
      throw new HttpError('Failed to update match', 500);
    }

    return data;
  },

  async runMatchingProcess(startupId: string): Promise<Match[]> {
    // Get startup profile
    const { data: startup } = await supabaseClient
      .from('startup_profiles')
      .select('*')
      .eq('id', startupId)
      .single();

    if (!startup) {
      throw new HttpError('Startup not found', 404);
    }

    // Get all candidates
    const { data: candidates } = await supabaseClient
      .from('candidate_profiles')
      .select('id');

    if (!candidates || candidates.length === 0) {
      return [];
    }

    // Calculate matches for all candidates
    const matches: Match[] = [];
    for (const candidate of candidates) {
      try {
        const match = await this.createMatch(candidate.id, startupId);
        matches.push(match);
      } catch (error) {
        // Skip if match already exists
        console.log(`Match already exists for candidate ${candidate.id}`);
      }
    }

    return matches.sort((a, b) => b.match_score - a.match_score);
  },
};
