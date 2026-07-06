import React, { useState } from 'react';
import './App.css';
import InputForm from './components/InputForm';
import ResultsView from './components/ResultsView';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [githubUrl, setGithubUrl] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    if (!githubUrl.trim() || !resumeText.trim()) {
      setError('Please enter a GitHub URL/username and resume text.');
      setLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ githubUrl: githubUrl.trim(), resumeText: resumeText.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Verification failed. Please try again.');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">⚙️</span>
            <h1>redrob ARTIFACT</h1>
          </div>
          <button
            className="launch-agent-btn"
            type="button"
            onClick={handleSubmit}
            disabled={loading}
          >
            LAUNCH AGENT
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          {!results ? (
            <InputForm
              githubUrl={githubUrl}
              resumeText={resumeText}
              onGithubUrlChange={setGithubUrl}
              onResumeTextChange={setResumeText}
              onSubmit={handleSubmit}
              isLoading={loading}
              error={error}
            />
          ) : (
            <ResultsView results={results} onReset={() => setResults(null)} />
          )}

          {loading && <LoadingSpinner />}
        </div>
      </main>

      <footer className="footer">
        <p>REDROB ARTIFACT v2.4.12 — AI-Driven Talent Verification</p>
      </footer>
    </div>
  );
}

export default App;
