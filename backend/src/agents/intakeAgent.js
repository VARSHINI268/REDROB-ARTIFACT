import { parseResumeText } from '../utils/gemini.js';

export async function intakeAgent(resumeText) {
  console.log('🔍 Intake Agent: Parsing resume text...');
  
  try {
    const parsed = await parseResumeText(resumeText);
    
    console.log(`✓ Extracted ${parsed.skills.length} skills from resume`);
    
    return {
      skills: parsed.skills || [],
      summary: parsed.summary || 'Resume parsed successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Intake Agent error:', error.message);
    throw error;
  }
}
