import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="loading-overlay">
      <div className="spinner" />
      <div className="spinner-text">Loading verification...</div>
    </div>
  );
}
