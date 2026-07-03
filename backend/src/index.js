import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { verificationPipeline } from './agents/pipeline.js';
import { initializeCache } from './utils/cache.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize cache
initializeCache();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'REDROB ARTIFACT Backend Running' });
});

// Main verification endpoint
app.post('/api/verify', async (req, res) => {
  try {
    const { githubUsername, resumeText } = req.body;

    if (!githubUsername || !resumeText) {
      return res.status(400).json({
        error: 'Missing required fields: githubUsername, resumeText',
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
});

app.listen(PORT, () => {
  console.log(`🚀 REDROB ARTIFACT Backend running on port ${PORT}`);
});
