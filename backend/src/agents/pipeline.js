import { intakeAgent } from './intakeAgent.js';
import { retrievalAgent } from './retrievalAgent.js';
import { verificationAgent } from './verificationAgent.js';
import { scoringAgent } from './scoringAgent.js';

export async function verificationPipeline(githubUsername, resumeText) {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 REDROB ARTIFACT Verification Pipeline Started');
  console.log('='.repeat(60));

  try {
    // Step 1: Parse resume
    const parsedResume = await intakeAgent(resumeText);

    // Step 2: Retrieve GitHub data
    const githubData = await retrievalAgent(githubUsername);

    // Step 3: Verify skills
    const verdicts = await verificationAgent(parsedResume.skills, githubData);

    // Step 4: Calculate score
    const finalResult = scoringAgent(verdicts);

    const verdictsMap = finalResult.breakdown.reduce((acc, item) => {
      acc[item.skill] = item.verdict;
      return acc;
    }, {});

    const evidenceSummary = finalResult.breakdown
      .map((item) => {
        if (item.verdict === 'verified') {
          return `${item.skill}: ${item.evidenceRepos} active repos found`;
        }
        if (item.verdict === 'partially_verified') {
          return `${item.skill}: ${item.evidenceRepos} repos partially match`;
        }
        return `${item.skill}: no repos found`;
      })
      .join('. ');

    const githubSummary = {
      total_repos: githubData.repos.length,
      top_languages: Object.entries(githubData.extractedLanguages || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([lang]) => lang),
      most_active_repo:
        githubData.repos
          .slice()
          .sort((a, b) => (b.repoSize || 0) - (a.repoSize || 0))[0]?.name || null,
    };

    const output = {
      status: 'success',
      score: finalResult.score,
      verdicts: verdictsMap,
      evidence: evidenceSummary || finalResult.summary,
      github_summary: githubSummary,
      breakdown: finalResult.breakdown,
      candidate: {
        githubUsername,
        profileUrl: githubData.profile.profileUrl,
        repoCount: githubData.repos.length,
      },
      verification: {
        score: finalResult.score,
        summary: finalResult.summary,
        breakdown: finalResult.breakdown,
        flaggedClaims: finalResult.flaggedClaims,
      },
      stats: finalResult.stats,
      timestamp: new Date().toISOString(),
    };

    console.log('✅ Pipeline completed successfully');
    console.log('='.repeat(60) + '\n');

    return output;
  } catch (error) {
    console.error('❌ Pipeline failed:', error.message);
    throw error;
  }
}
