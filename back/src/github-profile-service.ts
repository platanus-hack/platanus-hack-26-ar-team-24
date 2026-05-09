type GithubUserApi = {
  login: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  followers: number;
  following: number;
  public_repos: number;
  company: string | null;
  blog: string | null;
  twitter_username: string | null;
};

type GithubRepoApi = {
  name: string;
  description: string | null;
  language: string | null;
  topics?: string[];
  fork: boolean;
  stargazers_count: number;
  updated_at: string;
};

export type GithubProfileInsight = {
  username: string;
  profileUrl: string;
  user: GithubUserApi;
  repos: GithubRepoApi[];
  headline: string;
  summary: string;
  strengthSignals: string[];
  interestSignals: string[];
  collaborationSignals: string[];
  languageBreakdown: Array<{ language: string }>;
  topicBreakdown: Array<{ topic: string }>;
};

export class GithubProfileService {
  constructor(private githubToken?: string) {}

  async enrichFromUrl(githubUrl: string): Promise<GithubProfileInsight> {
    const username = this.parseUsername(githubUrl);
    const [user, repos] = await Promise.all([
      this.fetchGithubUser(username),
      this.fetchGithubRepos(username)
    ]);

    const languages = this.collectLanguages(repos);
    const topics = this.collectTopics(repos);
    const strengthSignals = this.buildStrengthSignals(user, repos, languages, topics);
    const interestSignals = this.buildInterestSignals(repos, topics);
    const collaborationSignals = this.buildCollaborationSignals(user, repos);

    return {
      username,
      profileUrl: githubUrl,
      user,
      repos,
      headline: this.buildHeadline(user, languages, topics),
      summary: this.buildSummary(user, repos, languages, topics),
      strengthSignals,
      interestSignals,
      collaborationSignals,
      languageBreakdown: languages.map((language) => ({ language })),
      topicBreakdown: topics.map((topic) => ({ topic }))
    };
  }

  private parseUsername(url: string) {
    const parsed = new URL(url);
    if (!["github.com", "www.github.com"].includes(parsed.hostname)) {
      throw new Error("GitHub URL inválida");
    }

    const username = parsed.pathname.split("/").filter(Boolean)[0];
    if (!username) {
      throw new Error("No pudimos extraer el username de GitHub");
    }

    return username;
  }

  private async fetchGithubUser(username: string): Promise<GithubUserApi> {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: this.buildHeaders()
    });

    if (!response.ok) {
      throw new Error(`GitHub user lookup failed for ${username}: ${response.status}`);
    }

    return response.json() as Promise<GithubUserApi>;
  }

  private async fetchGithubRepos(username: string): Promise<GithubRepoApi[]> {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=30&sort=updated`,
      {
        headers: this.buildHeaders()
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub repos lookup failed for ${username}: ${response.status}`);
    }

    return response.json() as Promise<GithubRepoApi[]>;
  }

  private collectLanguages(repos: GithubRepoApi[]) {
    const counts = new Map<string, number>();

    for (const repo of repos) {
      if (!repo.language) continue;
      counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
    }

    return [...counts.entries()]
      .sort((left, right) => right[1] - left[1])
      .map(([language]) => language)
      .slice(0, 8);
  }

  private collectTopics(repos: GithubRepoApi[]) {
    const counts = new Map<string, number>();

    for (const repo of repos) {
      for (const topic of repo.topics ?? []) {
        counts.set(topic, (counts.get(topic) ?? 0) + 1);
      }
    }

    return [...counts.entries()]
      .sort((left, right) => right[1] - left[1])
      .map(([topic]) => topic)
      .slice(0, 12);
  }

  private buildHeadline(user: GithubUserApi, languages: string[], topics: string[]) {
    const displayName = user.name || user.login;
    const stack = languages.slice(0, 3).join(", ");
    const topicSummary = topics.slice(0, 2).join(" y ");

    if (stack && topicSummary) {
      return `${displayName} muestra un perfil builder con foco en ${stack} y señales repetidas alrededor de ${topicSummary}.`;
    }

    if (stack) {
      return `${displayName} muestra un perfil técnico activo con foco en ${stack}.`;
    }

    return `${displayName} tiene actividad pública en GitHub, aunque el stack visible todavía es acotado.`;
  }

  private buildSummary(
    user: GithubUserApi,
    repos: GithubRepoApi[],
    languages: string[],
    topics: string[]
  ) {
    const displayName = user.name || user.login;
    const repoCount = repos.length;
    const stack = languages.length > 0 ? languages.slice(0, 4).join(", ") : "stack variado";
    const topTopics = topics.length > 0 ? topics.slice(0, 4).join(", ") : "sin topics consistentes";
    const collaborationHint = repos.some((repo) => repo.fork)
      ? "También aparece interacción con repos ajenos o forks."
      : "La actividad visible parece concentrarse sobre proyectos propios.";

    return [
      `${displayName} tiene ${user.public_repos} repos públicos y en la muestra reciente aparecen ${repoCount} proyectos relevantes.`,
      `El stack más visible pasa por ${stack}.`,
      topics.length > 0 ? `Los temas que más se repiten son ${topTopics}.` : "No hay suficientes topics públicos para inferir intereses finos.",
      collaborationHint
    ].join(" ");
  }

  private buildStrengthSignals(
    user: GithubUserApi,
    repos: GithubRepoApi[],
    languages: string[],
    topics: string[]
  ) {
    const signals: string[] = [];

    if (languages.length > 0) {
      signals.push(`Trabaja seguido con ${languages.slice(0, 3).join(", ")}`);
    }

    if (topics.length > 0) {
      signals.push(`Sus repos repiten temas como ${topics.slice(0, 3).join(", ")}`);
    }

    if (user.public_repos >= 20) {
      signals.push(`Tiene un volumen visible de proyectos públicos (${user.public_repos} repos)`);
    }

    if (repos.some((repo) => repo.description)) {
      signals.push("Suele documentar o contextualizar lo que construye");
    }

    return signals.slice(0, 5);
  }

  private buildInterestSignals(repos: GithubRepoApi[], topics: string[]) {
    const fromDescriptions = repos
      .map((repo) => repo.description?.trim())
      .filter((description): description is string => Boolean(description))
      .slice(0, 3);

    return [...topics.slice(0, 4), ...fromDescriptions].slice(0, 6);
  }

  private buildCollaborationSignals(user: GithubUserApi, repos: GithubRepoApi[]) {
    const signals: string[] = [];

    if (user.followers > 0) {
      signals.push(`Tiene visibilidad pública básica en GitHub (${user.followers} followers)`);
    }

    if (repos.some((repo) => repo.fork)) {
      signals.push("Hay señales de trabajo sobre forks o código compartido");
    }

    const starCount = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    if (starCount > 0) {
      signals.push(`La muestra reciente acumula ${starCount} estrellas`);
    }

    if (signals.length === 0) {
      signals.push("La colaboración no es obvia desde la muestra pública actual");
    }

    return signals.slice(0, 4);
  }

  private buildHeaders() {
    return {
      "User-Agent": "agentlink-backend",
      Accept: "application/vnd.github+json",
      ...(this.githubToken ? { Authorization: `Bearer ${this.githubToken}` } : {})
    };
  }
}
