export function scoringAgent(verdicts) {
  console.log('📊 Scoring Agent: Aggregating verdicts...');

  if (verdicts.length === 0) {
    return {
      score: 0,
      summary: 'No skills to verify',
      breakdown: [],
      flaggedClaims: [],
    };
  }

  // Calculate score based on verdicts
  const scoreMap = {
    verified: 100,
    partially_verified: 60,
    unverified: 20,
  };

  let totalScore = 0;
  const breakdown = [];
  const flaggedClaims = [];

  verdicts.forEach((verdict) => {
    const baseScore = scoreMap[verdict.verdict] || 0;
    const confidenceMultiplier = verdict.confidence / 100;
    const skillScore = baseScore * confidenceMultiplier;

    totalScore += skillScore;

    breakdown.push({
      skill: verdict.skill,
      verdict: verdict.verdict,
      score: Math.round(skillScore),
      confidence: verdict.confidence,
      evidenceRepos: verdict.evidence.repoCount,
      reasoning: verdict.reasoning,
    });

    // Flag unverified or low-confidence claims
    if (verdict.verdict === 'unverified' || verdict.confidence < 50) {
      flaggedClaims.push({
        skill: verdict.skill,
        issue: `${verdict.verdict} - ${verdict.reasoning}`,
        suggestedAction:
          verdict.evidence.repoCount === 0
            ? 'No GitHub repositories found with this technology'
            : 'Repository evidence is weak or insufficient',
      });
    }
  });

  const finalScore = Math.round(totalScore / verdicts.length);

  // Generate evidence summary
  const verified = breakdown.filter((b) => b.verdict === 'verified').length;
  const partiallyVerified = breakdown.filter((b) => b.verdict === 'partially_verified').length;
  const unverified = breakdown.filter((b) => b.verdict === 'unverified').length;

  const summary = `${verified} verified, ${partiallyVerified} partially verified, ${unverified} unverified skills`;

  console.log(`✓ Score calculated: ${finalScore}/100 - ${summary}`);

  return {
    score: finalScore,
    summary,
    breakdown,
    flaggedClaims,
    stats: {
      totalSkills: verdicts.length,
      verified,
      partiallyVerified,
      unverified,
    },
  };
}
