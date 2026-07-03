#!/usr/bin/env node

/**
 * REDROB ARTIFACT Integration Test
 * Tests the full verification pipeline with a real GitHub user
 */

import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:5000';
const TEST_GITHUB_USER = 'torvalds';
const TEST_RESUME = `
Software Engineer with 20+ years of experience.

Skills:
- C Programming (Expert) - 20+ years
- Linux Kernel Development (Expert) - 20+ years
- Git Version Control (Expert) - 15+ years
- Python (Intermediate) - 5 years
- Linux/Unix Systems (Expert) - 20+ years

Experience:
- Created Linux kernel (1991)
- Created Git version control system (2005)
- Led Linux Kernel development for 30+ years

Education:
- MSc Computer Science (theoretical)
`;

async function testVerificationPipeline() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 REDROB ARTIFACT Integration Test');
  console.log('='.repeat(70));

  try {
    console.log(`\n📍 API URL: ${API_URL}`);
    console.log(`👤 Test GitHub User: ${TEST_GITHUB_USER}`);
    console.log(`📄 Resume Preview: "${TEST_RESUME.substring(0, 50)}..."`);

    // Test 1: Health Check
    console.log('\n[Test 1/3] Health Check...');
    try {
      const healthResponse = await axios.get(`${API_URL}/health`);
      console.log('✓ Backend health check passed');
      console.log(`  Response: ${JSON.stringify(healthResponse.data)}`);
    } catch (error) {
      console.error('✗ Backend health check failed');
      console.error(`  Error: ${error.message}`);
      throw new Error('Backend not responding. Make sure the server is running on port 5000.');
    }

    // Test 2: Verification Pipeline
    console.log('\n[Test 2/3] Running Verification Pipeline...');
    console.log(`  GitHub Username: ${TEST_GITHUB_USER}`);
    console.log('  Processing...');

    const verificationResponse = await axios.post(`${API_URL}/api/verify`, {
      githubUsername: TEST_GITHUB_USER,
      resumeText: TEST_RESUME,
    });

    const result = verificationResponse.data;

    if (result.status !== 'success') {
      throw new Error('Verification failed');
    }

    console.log('✓ Verification pipeline completed successfully');

    // Test 3: Result Validation
    console.log('\n[Test 3/3] Validating Results...');

    // Check required fields
    const requiredFields = ['status', 'candidate', 'verification', 'stats'];
    for (const field of requiredFields) {
      if (!(field in result)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    console.log('✓ Result structure is valid');

    // Display Results
    console.log('\n' + '='.repeat(70));
    console.log('📊 VERIFICATION RESULTS');
    console.log('='.repeat(70));

    console.log(`\n👤 Candidate:`);
    console.log(`   GitHub: ${result.candidate.githubUsername}`);
    console.log(`   Profile: ${result.candidate.profileUrl}`);
    console.log(`   Repositories: ${result.candidate.repoCount}`);

    console.log(`\n📈 Score: ${result.verification.score}/100`);
    console.log(`📝 Summary: ${result.verification.summary}`);

    console.log(`\n📊 Statistics:`);
    console.log(`   Total Skills: ${result.stats.totalSkills}`);
    console.log(`   Verified: ${result.stats.verified}`);
    console.log(`   Partially Verified: ${result.stats.partiallyVerified}`);
    console.log(`   Unverified: ${result.stats.unverified}`);

    console.log(`\n🔍 Evidence Breakdown:`);
    result.verification.breakdown.forEach((item) => {
      const icon =
        item.verdict === 'verified'
          ? '✓'
          : item.verdict === 'partially_verified'
          ? '~'
          : '✗';
      console.log(
        `   ${icon} ${item.skill}: ${item.verdict} (${item.evidenceRepos} repos)`
      );
    });

    if (result.verification.flaggedClaims.length > 0) {
      console.log(`\n⚠️  Flagged Claims:`);
      result.verification.flaggedClaims.forEach((flag) => {
        console.log(`   • ${flag.skill}: ${flag.issue}`);
      });
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ All tests passed!');
    console.log('='.repeat(70) + '\n');

    return true;
  } catch (error) {
    console.error('\n' + '='.repeat(70));
    console.error('❌ Test Failed');
    console.error('='.repeat(70));
    console.error(`\nError: ${error.message}`);
    console.error('\n💡 Troubleshooting Tips:');
    console.error('1. Make sure the backend server is running: npm start (from backend/)');
    console.error('2. Check that GEMINI_API_KEY is set in backend/.env');
    console.error('3. Check that GitHub is accessible');
    console.error('4. Review backend logs for detailed error information');
    console.error('='.repeat(70) + '\n');

    process.exit(1);
  }
}

testVerificationPipeline();
