import React from 'react';

export default function InputForm({
  githubUrl,
  resumeText,
  onGithubUrlChange,
  onResumeTextChange,
  onSubmit,
  isLoading,
  error,
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <div className="input-section">
      <div className="form-card">
        <h2>Resume Artifact</h2>
        <p className="subtitle">SOURCE CODE / TEXT PAYLOAD</p>
        <p className="description">Paste resume text or technical bio here for agent decomposition...</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="github">GITHUB URL / USERNAME</label>
            <input
              id="github"
              type="text"
              placeholder="username or https://github.com/username"
              value={githubUrl}
              onChange={(e) => onGithubUrlChange(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="resume">RESUME TEXT</label>
            <textarea
              id="resume"
              placeholder="Paste your resume, skills list, or technical bio here..."
              value={resumeText}
              onChange={(e) => onResumeTextChange(e.target.value)}
              required
              disabled={isLoading}
              rows="10"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="verify-btn" disabled={isLoading}>
            {isLoading ? 'Verifying...' : '⚡ Verify Identity Artifact'}
          </button>
        </form>
      </div>
    </div>
  );
}
