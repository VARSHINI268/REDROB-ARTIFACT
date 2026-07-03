# REDROB ARTIFACT - Setup & Deployment Guide

## 🚀 Quick Start (5 minutes)

### Prerequisites
- **Node.js** (v16+) — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Gemini API Key** (free tier) — [Get free key](https://ai.google.dev/)
- **GitHub Account** (optional, for testing)

### Step 1: Clone/Navigate to Project
```bash
cd path/to/REDROB-ARTIFACT
```

### Step 2: Setup Environment Variables

**Backend (.env)**
```bash
cd backend
cp .env.example .env
# Edit .env and add your Gemini API Key:
# GEMINI_API_KEY=your_key_here
```

### Step 3: Install & Start Backend
```bash
cd backend
npm install
npm start
```
✓ Backend running on `http://localhost:5000`

### Step 4: Start Frontend (in a new terminal)
```bash
cd frontend
npm install
npm start
```
✓ Frontend running on `http://localhost:3000`

### Step 5: Open Browser
Navigate to `http://localhost:3000` and start verifying!

---

## 📋 Detailed Setup

### For Windows Users
Use `start.bat` to launch both servers automatically:
```bash
start.bat
```

### For macOS/Linux Users
Use `start.sh`:
```bash
chmod +x start.sh
./start.sh
```

### Manual Setup (All Platforms)

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm start
```

---

## 🧪 Testing the Pipeline

### Test with Real GitHub Data

1. Open `http://localhost:3000`
2. Enter GitHub username: `torvalds` (Linux creator)
3. Paste sample resume:
```
Software Engineer with 20+ years of C experience.
Skills: C, Linux Kernel, Git, Python, Unix Systems
Experience: Created Linux kernel, Created Git VCS
```
4. Click "Verify Identity Artifact"
5. View the verification score and evidence breakdown

### Automated Test
```bash
# From root directory
npm install axios  # if not already installed
node test.js
```

---

## 🔧 Configuration

### Backend Environment Variables
Create `backend/.env`:
```env
# Required
GEMINI_API_KEY=your_gemini_api_key

# Optional
GITHUB_API_TOKEN=your_github_token
PORT=5000
NODE_ENV=development
CACHE_DIR=./cache
```

### Frontend Environment Variables
`frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000
```

---

## 📦 Project Structure

```
REDROB-ARTIFACT/
├── backend/                    # Express.js Backend
│   ├── src/
│   │   ├── agents/
│   │   │   ├── intakeAgent.js       # Parse resume text
│   │   │   ├── retrievalAgent.js    # Fetch GitHub data
│   │   │   ├── verificationAgent.js # Match skills
│   │   │   ├── scoringAgent.js      # Calculate score
│   │   │   └── pipeline.js          # Orchestrate pipeline
│   │   ├── utils/
│   │   │   ├── github.js            # GitHub API client
│   │   │   ├── gemini.js            # Gemini AI client
│   │   │   └── cache.js             # Caching layer
│   │   └── index.js                 # Express server
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── App.js               # Main component
│   │   └── index.css            # Styling (dark theme)
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── .env
│
├── test.js                      # Integration test
├── start.sh                     # macOS/Linux launcher
├── start.bat                    # Windows launcher
└── README.md
```

---

## 🤖 Agent Pipeline Overview

The system works in 5 stages:

### 1️⃣ **Intake Agent** (Parsing)
- Receives resume text
- Uses Gemini 2.0 Flash to extract skills
- Outputs: `{skills: [{name, yearsOfExperience, proficiency}], summary}`

### 2️⃣ **Retrieval Agent** (GitHub Fetch)
- Calls GitHub API for user profile & repositories
- Extracts languages, commits, metadata
- Outputs: Enriched GitHub data with all repositories

### 3️⃣ **Verification Agent** (Skill Matching)
- Compares claimed skills to actual GitHub evidence
- For each skill: checks repos, commit history, language usage
- Outputs: Per-skill verdicts (verified/partially_verified/unverified)

### 4️⃣ **Scoring Agent** (Aggregation)
- Combines all skill verdicts into one score (0-100)
- Flags suspicious or unverified claims
- Outputs: Final score, breakdown, evidence summary

### 5️⃣ **Output Layer** (JSON Response)
```json
{
  "status": "success",
  "candidate": {
    "githubUsername": "username",
    "profileUrl": "https://github.com/...",
    "repoCount": 42
  },
  "verification": {
    "score": 88,
    "summary": "2 verified, 1 partially verified, 0 unverified",
    "breakdown": [...],
    "flaggedClaims": [...]
  },
  "stats": {
    "totalSkills": 3,
    "verified": 2,
    "partiallyVerified": 1,
    "unverified": 0
  }
}
```

---

## 🎯 Example API Call

**Request:**
```bash
curl -X POST http://localhost:5000/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "githubUsername": "torvalds",
    "resumeText": "20+ years C programming, Linux kernel, Git creator"
  }'
```

**Response:**
```json
{
  "status": "success",
  "candidate": {
    "githubUsername": "torvalds",
    "profileUrl": "https://github.com/torvalds",
    "repoCount": 8
  },
  "verification": {
    "score": 92,
    "summary": "7 verified, 0 partially verified, 0 unverified",
    "breakdown": [...]
  }
}
```

---

## 📊 UI Features

### Input Form
- GitHub username field
- Resume/skills textarea
- Real-time form validation
- Loading state with spinner

### Results Dashboard
- **Verification Score** (0-100) with animated circular meter
- **Agent Insights** showing consistency & confidence metrics
- **Evidence Breakdown** with per-skill verdicts and repo counts
- **Flagged Claims** section for suspicious or unverified skills
- **Footer Stats** showing repository and timestamp info

### Design Theme
- Dark background (#0a0a0a)
- Cyan/Turquoise accents (#00d4aa)
- Monospace font (Courier New) for technical feel
- Responsive grid layout
- Smooth transitions and animations

---

## 🐛 Troubleshooting

### "Backend not responding"
```bash
# Check if backend is running
curl http://localhost:5000/health
# If not, make sure to run: npm start (from backend/)
```

### "GEMINI_API_KEY is required"
```bash
# Set API key in backend/.env
GEMINI_API_KEY=your_actual_key_here
# Restart backend: npm start
```

### "GitHub API rate limited"
- GitHub allows 60 requests/hour without authentication
- Add GITHUB_API_TOKEN for 5000 requests/hour

### "React starts but can't reach backend"
```bash
# Check backend is running
npm start (from backend/)
# Check frontend .env has correct API_URL:
REACT_APP_API_URL=http://localhost:5000
```

### Cache Issues
```bash
# Clear cache to start fresh
rm -rf backend/cache
```

---

## 🚀 Deployment (Production)

### Deploy Backend
```bash
# Using Heroku/Railway/Render
git push heroku main
```

### Deploy Frontend
```bash
# Using Vercel/Netlify
npm run build
# Deploy build/ folder
```

---

## 📝 Notes

- **No payment needed**: Gemini free tier supports demo usage
- **Public repos only**: GitHub API works without authentication for public repos
- **Caching**: Results cached locally to avoid repeated API calls
- **AI Models**: Uses Gemini 2.0 Flash (lightweight) + optional heavy model for deep verification
- **Security**: Never commit .env files; use environment variables in production

---

## 📞 Support

For issues or questions:
1. Check logs: `backend/` console output
2. Review error messages in UI
3. Verify API keys and environment setup
4. Test with known GitHub users (torvalds, octocat, gvanrossum)

---

**REDROB ARTIFACT v2.4.12** — Built for AI-Driven Developer Talent Verification
