import { gemini, GEMINI_MODEL } from "../gemini";
import { logger } from "../logger";
import type { GithubProfile } from "./githubAgent";

export type SkillVerdictValue = "verified" | "partial" | "unverified";

const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;

function normalize(value: string): string {
  return value.toLowerCase().replace(/[.\s-]/g, "");
}

function matchesSkill(skill: string, repoLanguage: string | null, repoName: string): boolean {
  const normalizedSkill = normalize(skill);
  if (!normalizedSkill) return false;

  if (repoLanguage && normalize(repoLanguage) === normalizedSkill) {
    return true;
  }

  const normalizedRepoName = normalize(repoName);
  return normalizedRepoName.includes(normalizedSkill) && normalizedSkill.length >= 3;
}

export function computeVerdicts(
  skills: string[],
  profile: GithubProfile,
): Record<string, SkillVerdictValue> {
  const verdicts: Record<string, SkillVerdictValue> = {};
  const now = Date.now();

  for (const skill of skills) {
    const matchingRepos = profile.repos.filter((repo) =>
      matchesSkill(skill, repo.language, repo.name),
    );

    const activeMatches = matchingRepos.filter((repo) => {
      const pushedAt = new Date(repo.pushed_at).getTime();
      const isRecent = !Number.isNaN(pushedAt) && now - pushedAt <= TWO_YEARS_MS;
      return repo.size > 0 && isRecent;
    });

    if (activeMatches.length >= 2) {
      verdicts[skill] = "verified";
    } else if (matchingRepos.length >= 1) {
      verdicts[skill] = "partial";
    } else {
      verdicts[skill] = "unverified";
    }
  }

  return verdicts;
}

export async function generateEvidenceSummary(
  verdicts: Record<string, SkillVerdictValue>,
  profile: GithubProfile,
): Promise<string> {
  const repoSummary = profile.repos
    .slice(0, 20)
    .map((repo) => `${repo.name} (${repo.language ?? "unknown"}, pushed ${repo.pushed_at})`)
    .join("; ");

  const verdictSummary = Object.entries(verdicts)
    .map(([skill, verdict]) => `${skill}: ${verdict}`)
    .join(", ");

  try {
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are writing a short evidence summary paragraph for a developer credibility report. Given these skill verdicts: ${verdictSummary}. And this GitHub repository data: ${repoSummary || "no public repositories"}. Write a single human-readable paragraph (3-5 sentences) explaining what was verified, partially verified, and unverified, referencing specific evidence like repo counts or recent activity where relevant. Return ONLY the paragraph text, no headers or JSON.`,
            },
          ],
        },
      ],
      config: { maxOutputTokens: 8192 },
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error("Empty response from Gemini");
    }
    return text;
  } catch (err) {
    logger.error({ err }, "Verification agent failed to generate evidence summary");
    throw new Error("AI verification failed. Try again.");
  }
}
