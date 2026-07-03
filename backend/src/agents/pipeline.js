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

    const output = {
      status: 'success',
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
