export const matchingService = {
  calculateMatchScore(startup: any, candidate: any): number {
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

    const finalScore = Math.min(1, Math.max(0.3, score));
    return parseFloat(finalScore.toFixed(2));
  },

  generateSummary(candidate: any, startup: any, score: number): string {
    const summaries = [
      `${candidate.username} brings ${score * 100 | 0}% compatibility with ${startup.name}'s needs.`,
      `Excellent match! ${candidate.username} is a great fit for ${startup.name} (${score * 100 | 0}%).`,
      `${candidate.username} demonstrates ${score * 100 | 0}% alignment with your needs.`,
    ];
    return summaries[Math.floor(Math.random() * summaries.length)];
  },

  generateReasons(candidate: any, startup: any): string[] {
    const reasons = [];
    const candidateSkills = (candidate.skills || []).map((s: string) => s.toLowerCase());
    const startupStack = (startup.stack || []).map((s: string) => s.toLowerCase());

    const commonSkills = candidateSkills.filter((skill: string) =>
      startupStack.some((tech: string) => tech.includes(skill) || skill.includes(tech))
    );

    if (commonSkills.length > 0) {
      reasons.push(`Matching skills: ${commonSkills.slice(0, 2).join(', ')}`);
    }

    if (candidate.experience_years >= 3) {
      reasons.push(`${candidate.experience_years}+ years of experience`);
    }

    if (reasons.length === 0) {
      reasons.push(`Good technical alignment`);
    }

    return reasons;
  },
};
