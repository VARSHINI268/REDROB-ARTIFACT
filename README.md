# REDROB ARTIFACT - Autonomous Developer Verification Agent
https://red-rob-artifact--varshini246810.replit.app
A multi-agent AI system that verifies developer talent by cross-checking resume claims against real GitHub evidence.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Gemini API Key (free tier)
- GitHub Account (no auth needed for public repos)

### Setup

1. **Clone and navigate to the project:**
```bash
cd path/to/REDROB-ARTIFACT
```

2. **Setup Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env and add your Gemini API Key
npm install
npm start
```

Backend runs on `http://localhost:5000`

3. **Setup Frontend (in a new terminal):**
```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`

4. **Or use the start script:**
```bash
# On macOS/Linux:
./start.sh

# On Windows:
start.bat
```

## 🏗️ Project Structure

```
REDROB-ARTIFACT/
├── backend/
│   ├── src/
│   │   ├── agents/
│   │   │   ├── intakeAgent.js       # Parse resume text
│   │   │   ├── retrievalAgent.js    # Fetch GitHub data
│   │   │   ├── verificationAgent.js # Verify skills
│   │   │   ├── scoringAgent.js      # Calculate score
│   │   │   └── pipeline.js          # Orchestrate agents
│   │   ├── utils/
│   │   │   ├── github.js            # GitHub API client
│   │   │   ├── gemini.js            # Gemini AI client
│   │   │   └── cache.js             # Caching layer
│   │   └── index.js                 # Express server
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.js                   # Main React component
│   │   └── index.css                # Styling
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── .env
└── README.md
```

## 🤖 Agent Pipeline

1. **Intake Agent**: Parses resume text and extracts claimed skills using Gemini 2.0 Flash
2. **Retrieval Agent**: Calls GitHub API to fetch repos, languages, commits, and metadata
3. **Verification Agent**: Matches claimed skills against actual GitHub evidence
4. **Scoring Agent**: Aggregates verdicts into an overall credibility score (0-100)
5. **Output Layer**: Returns JSON with score, breakdown, and flagged claims

## 📊 Example API Request

```bash
curl -X POST http://localhost:5000/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "githubUsername": "torvalds",
    "resumeText": "I have 20+ years of C experience, Linux kernel development, Git creator"
  }'
```

## 🎨 UI Features

- Dark theme with cyan/turquoise accents
- Real-time verification score (0-100)
- Evidence breakdown by skill
- Flagged claims with suggestions
- Agent insights with consistency metrics
- Responsive design

## 🔑 Environment Variables

### Backend (.env)
```
GEMINI_API_KEY=your_api_key_here
GITHUB_API_TOKEN=optional_github_token
PORT=5000
NODE_ENV=development
CACHE_DIR=./cache
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

## 🧪 Testing

Try with these GitHub accounts:
- `torvalds` - Linux kernel developer
- `gvanrossum` - Python creator
- `octocat` - GitHub mascot

## 📝 Notes

- GitHub API works without authentication for public repos
- Results are cached locally to avoid repeated API calls
- Gemini 2.0 Flash handles lightweight parsing; heavy verification uses Gemini 1.5 Pro
- All API calls are logged for debugging

## 📄 License

MIT
