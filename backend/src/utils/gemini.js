import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function parseResumeText(resumeText) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `Extract technical skills and years of experience from the following resume/profile text. 
Return a JSON object with the structure: {"skills": [{"name": "skill_name", "yearsOfExperience": number, "proficiency": "beginner|intermediate|expert"}], "summary": "brief summary"}

Resume text:
${resumeText}

Return ONLY valid JSON, no additional text.`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Try to parse JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Invalid JSON in response');
  } catch (error) {
    console.error('Gemini parsing error:', error.message);
    // Fallback: extract skills manually
    const skillPattern = /(?:react|node\.?js|python|typescript|javascript|java|c\+\+|go|rust|kubernetes|docker|aws|gcp|azure|sql|nosql|graphql|rest)/gi;
    const skills = [...new Set(resumeText.match(skillPattern) || [])].map(s => ({
      name: s.toLowerCase(),
      yearsOfExperience: 2,
      proficiency: 'intermediate',
    }));
    
    return {
      skills,
      summary: 'Fallback extraction due to parsing error',
    };
  }
}

export async function verifySkillWithLLM(skill, githubEvidence) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `Based on the following GitHub evidence, provide a verification verdict for the claimed skill "${skill}".

GitHub Evidence:
- Repositories with this technology: ${githubEvidence.repoCount}
- Total commits: ${githubEvidence.totalCommits}
- Repository names: ${githubEvidence.repoNames.join(', ')}
- Code samples available: ${githubEvidence.hasSampleCode ? 'Yes' : 'No'}

Return a JSON object: {"verdict": "verified|partially_verified|unverified", "confidence": 0-100, "reasoning": "brief explanation"}

Return ONLY valid JSON, no additional text.`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Invalid JSON in response');
  } catch (error) {
    console.error('LLM verification error:', error.message);
    // Fallback verdict
    return {
      verdict: githubEvidence.repoCount > 0 ? 'partially_verified' : 'unverified',
      confidence: githubEvidence.repoCount > 2 ? 75 : 40,
      reasoning: 'Fallback assessment due to LLM error',
    };
  }
}
