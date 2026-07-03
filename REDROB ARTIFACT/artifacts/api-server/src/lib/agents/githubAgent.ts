import { logger } from "../logger";

export class GithubAgentError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}

export interface GithubRepo {
  name: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  size: number;
}

export interface GithubProfile {
  username: string;
  profileUrl: string;
  repos: GithubRepo[];
}

interface CacheEntry {
  profile: GithubProfile;
  fetchedAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

export function extractUsername(input: string): string {
  const trimmed = input.trim();
  const withoutProtocol = trimmed.replace(/^https?:\/\//i, "");
  const withoutDomain = withoutProtocol.replace(/^(www\.)?github\.com\//i, "");
  const username = withoutDomain.split(/[/?#]/)[0]?.trim();

  if (!username) {
    throw new GithubAgentError("Please provide a valid GitHub username.", 400);
  }

  return username;
}

async function fetchGithubJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "redrob-artifact",
    },
  });

  if (response.status === 404) {
    throw new GithubAgentError("GitHub profile not found. Check the username.", 404);
  }

  if (!response.ok) {
    throw new GithubAgentError(
      `GitHub API request failed with status ${response.status}.`,
      502,
    );
  }

  return response.json();
}

export async function fetchGithubProfile(usernameInput: string): Promise<GithubProfile> {
  const username = extractUsername(usernameInput);
  const cacheKey = username.toLowerCase();
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.profile;
  }

  try {
    await fetchGithubJson(`https://api.github.com/users/${encodeURIComponent(username)}`);
    const reposData = await fetchGithubJson(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100`,
    );

    const repos: GithubRepo[] = Array.isArray(reposData)
      ? reposData.map((repo) => ({
          name: String((repo as Record<string, unknown>)["name"] ?? ""),
          language: ((repo as Record<string, unknown>)["language"] as string | null) ?? null,
          stargazers_count: Number((repo as Record<string, unknown>)["stargazers_count"] ?? 0),
          forks_count: Number((repo as Record<string, unknown>)["forks_count"] ?? 0),
          pushed_at: String((repo as Record<string, unknown>)["pushed_at"] ?? ""),
          size: Number((repo as Record<string, unknown>)["size"] ?? 0),
        }))
      : [];

    const profile: GithubProfile = {
      username,
      profileUrl: `https://github.com/${username}`,
      repos,
    };

    cache.set(cacheKey, { profile, fetchedAt: Date.now() });

    return profile;
  } catch (err) {
    if (err instanceof GithubAgentError) {
      throw err;
    }
    logger.error({ err, username }, "GitHub agent failed to fetch profile");
    throw new GithubAgentError("Failed to reach GitHub. Try again.", 502);
  }
}

export interface GithubSummary {
  username: string;
  total_repos: number;
  top_languages: string[];
  most_active_repo: string | null;
  profile_url: string;
}

export function summarizeGithubProfile(profile: GithubProfile): GithubSummary {
  const languageCounts = new Map<string, number>();
  for (const repo of profile.repos) {
    if (!repo.language) continue;
    languageCounts.set(repo.language, (languageCounts.get(repo.language) ?? 0) + 1);
  }

  const topLanguages = Array.from(languageCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([language]) => language);

  const mostActiveRepo = [...profile.repos]
    .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
    .at(0);

  return {
    username: profile.username,
    total_repos: profile.repos.length,
    top_languages: topLanguages,
    most_active_repo: mostActiveRepo?.name ?? null,
    profile_url: profile.profileUrl,
  };
}
