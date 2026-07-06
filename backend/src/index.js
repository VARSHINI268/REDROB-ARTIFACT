import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { verificationPipeline } from './agents/pipeline.js';
import { initializeCache } from './utils/cache.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Initialize cache
initializeCache();

function extractGithubUsername(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  // If full URL is provided, extract the last path segment
  try {
    const url = new URL(trimmed);
    if (url.hostname.includes('github.com')) {
      const segments = url.pathname.split('/').filter(Boolean);
      return segments.length > 0 ? segments[0] : null;
    }
  } catch {
    // Not a full URL, continue
  }

  return trimmed.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '').split('/')[0];
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'REDROB ARTIFACT Backend Running' });
});

async function handleVerify(req, res) {
  try {
    const { githubUrl, resumeText } = req.body;

    if (!githubUrl || !resumeText) {
      return res.status(400).json({
        error: 'Missing required fields: githubUrl, resumeText',
        message: 'Missing required fields: githubUrl, resumeText',
      });
    }

    const githubUsername = extractGithubUsername(githubUrl);
    if (!githubUsername) {
      return res.status(400).json({
        error: 'Invalid GitHub URL or username provided',
        message: 'Invalid GitHub URL or username provided',
      });
    }

    console.log(`Starting verification for user: ${githubUsername}`);

    const result = await verificationPipeline(githubUsername, resumeText);
    res.json(result);
  } catch (error) {
    console.error('Verification error:', error.message);
    res.status(500).json({
      error: 'Verification failed',
      message: error.message,
    });
  }
}

app.post('/verify', handleVerify);
app.post('/api/verify', handleVerify);

app.listen(PORT, () => {
  console.log(`🚀 REDROB ARTIFACT Backend running on port ${PORT}`);
});
