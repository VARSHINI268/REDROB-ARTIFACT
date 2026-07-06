import {
  getUserProfile,
  getUserRepos,
  enrichRepoData,
} from '../utils/github.js';
import { readCache, writeCache } from '../utils/cache.js';

export async function retrievalAgent(githubUsername) {
  console.log(`📚 Retrieval Agent: Fetching data for ${githubUsername}...`);

  // Check cache first
  const cacheKey = `github-${githubUsername}`;
  const cachedData = readCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const [profile, repos] = await Promise.all([
      getUserProfile(githubUsername),
      getUserRepos(githubUsername),
    ]);

    // Enrich repo data with language and commit info
    const enrichedRepos = await Promise.all(
      repos.slice(0, 20).map(async (repo) => {
        try {
          const enriched = await enrichRepoData(githubUsername, repo.name, repo);
          return {
            name: repo.name,
            url: repo.html_url,
            description: repo.description,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            languages: enriched.languages,
            topLanguage: enriched.topLanguage,
            commitCount: enriched.commitCount,
            repoSize: enriched.repoSize,
            lastPushedAt: enriched.lastPushedAt,
            updatedAt: repo.updated_at,
            isForked: repo.fork,
          };
        } catch (error) {
          console.warn(`Error enriching ${repo.name}:`, error.message);
          return {
            name: repo.name,
            url: repo.html_url,
            description: repo.description,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            languages: [],
            repoSize: repo.size || 0,
            lastPushedAt: repo.pushed_at || null,
            updatedAt: repo.updated_at,
            isForked: repo.fork,
          };
        }
      })
    );

    const result = {
      username: githubUsername,
      profile: {
        name: profile.name,
        bio: profile.bio,
        followers: profile.followers,
        publicRepos: profile.public_repos,
        profileUrl: profile.html_url,
      },
      repos: enrichedRepos,
      totalCommits: repos.length,
      extractedLanguages: extractLanguages(enrichedRepos),
      timestamp: new Date().toISOString(),
    };

    // Cache the result
    writeCache(cacheKey, result);

    console.log(`✓ Retrieved ${enrichedRepos.length} repositories for ${githubUsername}`);
    return result;
  } catch (error) {
    console.error('Retrieval Agent error:', error.message);
    throw error;
  }
}

function extractLanguages(repos) {
  const languageMap = {};
  
  repos.forEach((repo) => {
    repo.languages.forEach((lang) => {
      languageMap[lang] = (languageMap[lang] || 0) + 1;
    });
  });

  return languageMap;
}
