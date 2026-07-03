import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import InputForm from './components/InputForm';
import ResultsView from './components/ResultsView';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (githubUsername, resumeText) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/api/verify`, {
        githubUsername,
        resumeText,
      });

      setResults(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Verification failed. Please try again.'
      );
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
          <button className="launch-agent-btn">LAUNCH AGENT</button>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          {!results ? (
            <InputForm onSubmit={handleSubmit} isLoading={loading} error={error} />
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
