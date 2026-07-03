#!/usr/bin/env node

/**
 * REDROB ARTIFACT Quick Start Script
 * Automated setup for Windows/macOS/Linux
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = __dirname;
const backendDir = path.join(projectRoot, 'backend');
const frontendDir = path.join(projectRoot, 'frontend');

function log(message, type = 'info') {
  const prefix = {
    info: 'ℹ️ ',
    success: '✓ ',
    error: '✗ ',
    warn: '⚠️ ',
  }[type];
  console.log(`${prefix} ${message}`);
}

function checkNode() {
  try {
    const version = execSync('node --version').toString().trim();
    log(`Node.js ${version} detected`);
    return true;
  } catch {
    log('Node.js not found. Please install from https://nodejs.org/', 'error');
    return false;
  }
}

function setupBackend() {
  log('Setting up backend...');
  
  // Create .env if not exists
  const envPath = path.join(backendDir, '.env');
  if (!fs.existsSync(envPath)) {
    const examplePath = path.join(backendDir, '.env.example');
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, envPath);
      log('Created backend/.env from .env.example');
      log('⚠️  Please add your GEMINI_API_KEY to backend/.env', 'warn');
    }
  }

  // Install dependencies
  log('Installing backend dependencies...');
  try {
    execSync('npm install', { cwd: backendDir, stdio: 'inherit' });
    log('Backend dependencies installed', 'success');
  } catch {
    log('Failed to install backend dependencies', 'error');
    return false;
  }

  return true;
}

function setupFrontend() {
  log('Setting up frontend...');
  
  // Install dependencies
  log('Installing frontend dependencies...');
  try {
    execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });
    log('Frontend dependencies installed', 'success');
  } catch {
    log('Failed to install frontend dependencies', 'error');
    return false;
  }

  return true;
}

function main() {
  console.clear();
  console.log('\n' + '='.repeat(70));
  console.log('🚀 REDROB ARTIFACT - Quick Start Setup');
  console.log('='.repeat(70) + '\n');

  // Check Node.js
  if (!checkNode()) {
    process.exit(1);
  }

  // Setup
  if (!setupBackend()) {
    process.exit(1);
  }

  if (!setupFrontend()) {
    process.exit(1);
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ Setup Complete!');
  console.log('='.repeat(70) + '\n');

  console.log('📋 Next Steps:\n');
  console.log('1. Add your Gemini API Key to backend/.env');
  console.log('   GEMINI_API_KEY=your_key_here\n');

  console.log('2. Start the backend (Terminal 1):');
  console.log('   cd backend && npm start\n');

  console.log('3. Start the frontend (Terminal 2):');
  console.log('   cd frontend && npm start\n');

  console.log('4. Open http://localhost:3000 in your browser\n');

  console.log('Or use the start scripts:');
  if (process.platform === 'win32') {
    console.log('   start.bat  (Windows)\n');
  } else {
    console.log('   ./start.sh (macOS/Linux)\n');
  }

  console.log('For detailed setup: cat SETUP_GUIDE.md');
  console.log('To run tests: node test.js\n');
}

main();
