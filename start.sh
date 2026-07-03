#!/bin/bash
echo "Starting REDROB ARTIFACT..."
echo ""
echo "Starting Backend (Node.js/Express)..."
cd backend
npm install --silent
npm start &
BACKEND_PID=$!

echo ""
echo "Starting Frontend (React)..."
cd ../frontend
npm install --silent
npm start &
FRONTEND_PID=$!

echo ""
echo "================================================"
echo "✅ REDROB ARTIFACT is starting..."
echo "   Backend: http://localhost:5000"
echo "   Frontend: http://localhost:3000"
echo "================================================"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

wait $BACKEND_PID $FRONTEND_PID
