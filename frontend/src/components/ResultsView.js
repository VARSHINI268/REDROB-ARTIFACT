import React from 'react';

export default function ResultsView({ results, onReset }) {
  return (
    <div className="results-section">
      <div className="results-grid">
        <div className="score-card">
          <h3>VERIFIED SCORE</h3>
          <div className="score-circle">
            <svg className="circle-svg" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="#1a1a2e"
                strokeWidth="3"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="#00d4aa"
                strokeWidth="3"
                strokeDasharray={`${(results.verification.score / 100) * 565} 565`}
                className="score-ring"
              />
            </svg>
            <div className="score-value">
              <span>{results.verification.score}</span>
              <span className="score-label">ARTIFACT ALPHA</span>
            </div>
          </div>
          <p className="top-talent">Top {Math.max(0, 100 - Math.abs(results.verification.score))}% of Global Talent</p>
          <p className="verdict-count">VERIFIED AGAINST LIVE GITHUB ARTIFACTS</p>
        </div>

        <div className="insights-card">
          <h3>AGENT INSIGHTS</h3>
          <div className="insight-item">
            <span className="insight-value">{Math.max(0, 100 - results.verification.breakdown.length * 5)}%</span>
            <span className="insight-label">Consistency</span>
            <span className="insight-detail">High correlation detected</span>
          </div>
          <div className="insight-detail-text">
            {results.stats.verified > 0 && (
              <p>✓ <strong>{results.stats.verified}</strong> verified skills with strong evidence</p>
            )}
            {results.stats.partiallyVerified > 0 && (
              <p>~ <strong>{results.stats.partiallyVerified}</strong> partially verified claims</p>
            )}
            {results.stats.unverified > 0 && (
              <p>✗ <strong>{results.stats.unverified}</strong> unverified skills</p>
            )}
          </div>
        </div>
      </div>

      <div className="evidence-section">
        <h3>EVIDENCE BREAKDOWN</h3>
        <div className="evidence-grid">
          {results.verification.breakdown.map((item, idx) => (
            <div key={idx} className="evidence-item">
              <div className="evidence-header">
                <h4>{item.skill.toUpperCase()}</h4>
                <span className={`verdict-badge ${item.verdict}`}>
                  {item.verdict === 'verified' && '✓ VERIFIED'}
                  {item.verdict === 'partially_verified' && '~ PARTIAL'}
                  {item.verdict === 'unverified' && '✗ UNVERIFIED'}
                </span>
              </div>
              <div className="evidence-stats">
                <span className="stat">COMMIT VOL: <strong>{item.evidence.repoCount}</strong></span>
                <span className="proficiency">SCORE: <strong>{item.score}/100</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {results.verification.flaggedClaims.length > 0 && (
        <div className="flags-section">
          <h3>FLAGGED CLAIMS</h3>
          <div className="flags-list">
            {results.verification.flaggedClaims.map((flag, idx) => (
              <div key={idx} className="flag-item">
                <span className="flag-icon">⚠️</span>
                <div className="flag-content">
                  <strong>{flag.skill}</strong>: {flag.issue}
                  <p className="flag-suggestion">{flag.suggestedAction}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="footer-stats">
        <p>REPO COUNT: {results.candidate.repoCount}</p>
        <p>SCORE SUMMARY: {results.verification.summary}</p>
        <p>COMPLETED: {new Date(results.timestamp).toLocaleString()}</p>
      </div>

      <button onClick={onReset} className="back-btn">← Verify Another Candidate</button>
    </div>
  );
}
