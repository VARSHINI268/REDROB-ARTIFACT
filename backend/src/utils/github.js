import axios from 'axios';

const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_API_TOKEN || '';

const githubClient = axios.create({
  baseURL: GITHUB_API_URL,
  headers: GITHUB_TOKEN
    ? { Authorization: `token ${GITHUB_TOKEN}` }
    : {},
  timeout: 10000,
});

export async function getUserProfile(username) {
  try {
    const response = await githubClient.get(`/users/${username}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch GitHub profile for ${username}: ${error.message}`);
  }
}

export async function getUserRepos(username) {
  try {
    const response = await githubClient.get(`/users/${username}/repos`, {
      params: {
        type: 'owner',
        sort: 'updated',
        per_page: 50,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch repos for ${username}: ${error.message}`);
  }
}

export async function getRepoLanguages(owner, repo) {
  try {
    const response = await githubClient.get(`/repos/${owner}/${repo}/languages`);
    return response.data;
  } catch (error) {
    console.warn(`Failed to fetch languages for ${owner}/${repo}:`, error.message);
    return {};
  }
}

export async function enrichRepoData(owner, repo, repoData = {}) {
  const languages = await getRepoLanguages(owner, repo);
  const languageKeys = Object.keys(languages);

  const topLanguage =
    languageKeys.length > 0
      ? languageKeys.reduce((a, b) => (languages[a] > languages[b] ? a : b))
      : null;

  return {
    languages: languageKeys,
    commitCount: repoData.size || 0,
    repoSize: repoData.size || 0,
    lastPushedAt: repoData.pushed_at || null,
    topLanguage,
  };
}
