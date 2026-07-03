import { verifySkillWithLLM } from '../utils/gemini.js';

const SKILL_MAPPING = {
  react: ['javascript', 'typescript', 'jsx'],
  'node.js': ['javascript', 'nodejs'],
  'node': ['javascript', 'nodejs'],
  python: ['python'],
  typescript: ['typescript'],
  javascript: ['javascript'],
  java: ['java'],
  'c++': ['c++'],
  go: ['go'],
  rust: ['rust'],
  kubernetes: ['kubernetes', 'docker'],
  docker: ['docker'],
  aws: ['aws'],
  gcp: ['gcp'],
  azure: ['azure'],
  sql: ['sql', 'postgres', 'mysql'],
  nosql: ['mongodb', 'redis', 'dynamodb'],
  graphql: ['graphql'],
  rest: ['rest'],
};

export async function verificationAgent(claimedSkills, githubData) {
  console.log('🔎 Verification Agent: Matching claimed skills to GitHub evidence...');

  const verdicts = [];

  for (const skill of claimedSkills) {
    const skillName = skill.name.toLowerCase();
    const mappedLanguages = SKILL_MAPPING[skillName] || [skillName];

    // Find matching repos
    const matchingRepos = githubData.repos.filter((repo) =>
      mappedLanguages.some((lang) =>
        repo.languages.map((l) => l.toLowerCase()).includes(lang.toLowerCase())
      )
    );

    const evidence = {
      skillName,
      repoCount: matchingRepos.length,
      repoNames: matchingRepos.map((r) => r.name),
      totalCommits: matchingRepos.reduce((sum, r) => sum + r.commitCount, 0),
      hasSampleCode: matchingRepos.length > 0,
    };

    // Get LLM verification
    let verdict;
    try {
      verdict = await verifySkillWithLLM(skillName, evidence);
    } catch (error) {
      console.warn(`Failed to get LLM verdict for ${skillName}, using fallback`);
      verdict = {
        verdict: evidence.repoCount > 0 ? 'partially_verified' : 'unverified',
        confidence: evidence.repoCount > 2 ? 75 : 40,
        reasoning: 'Fallback assessment',
      };
    }

    verdicts.push({
      skill: skillName,
      claimedYears: skill.yearsOfExperience,
      claimedProficiency: skill.proficiency,
      ...verdict,
      evidence,
    });
  }

  console.log(`✓ Verification complete: ${verdicts.length} skills assessed`);
  return verdicts;
}
