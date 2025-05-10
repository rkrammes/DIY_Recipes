#!/bin/bash

# Comprehensive debug script for port 3000 with advanced error logging
# This script will show exactly what's happening with Supabase when the server fails

# Set up error log file with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/debug-port-3000-$TIMESTAMP.log"
ERROR_LOG="logs/errors-port-3000-$TIMESTAMP.log"

# Ensure logs directory exists
mkdir -p logs

# Helper function to log with timestamps
log() {
  echo "[$(date +%H:%M:%S)] $1" | tee -a "$LOG_FILE"
}

# Clean up existing processes
log "Cleaning up any existing processes..."
pkill -f "node.*next" 2>/dev/null
pkill -f "next dev" 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Clean Next.js cache
log "Cleaning Next.js cache for a fresh start..."
rm -rf .next
rm -rf node_modules/.cache

# First, run the Supabase diagnostics
log "Running Supabase diagnostics..."
node diagnose-supabase-errors.js | tee -a "$LOG_FILE"

# Set proper environment variables for testing
log "Setting up environment for port 3000 testing..."
export PORT=3000
export NEXT_PUBLIC_PORT=3000
export NEXT_PUBLIC_UI_MODE=terminal
export NEXT_PUBLIC_ENABLE_MODULES=true
export NEXT_PUBLIC_TERMINAL_UI_ENABLED=true
export NODE_OPTIONS="--max-old-space-size=4096"

# Add tracing for better error visibility
export NODE_OPTIONS="$NODE_OPTIONS --trace-warnings"

# Configure for verbose error output
export NEXT_DEBUG=true

# Special environment setting to capture all Supabase errors
export DEBUG=supabase*

log "Environment configuration complete"
log "Debug logs will be saved to: $LOG_FILE"
log "Error logs will be saved to: $ERROR_LOG"

log "=== Configuration Summary ==="
log "Port: 3000"
log "UI Mode: terminal"
log "Next.js Debug: enabled"
log "Supabase Debug: enabled"

# Start Next.js with error redirection to capture all errors
log "Starting Next.js on port 3000..."
log "IMPORTANT: This will show all errors including Supabase connection issues"
log "Watch the logs for detailed error information"
log "========================================"

# Start with error capturing - show all output and also save to log files
(npx next dev -p 3000 2>&1 | tee -a "$LOG_FILE" "$ERROR_LOG") || {
  log "❌ Next.js server crashed"
  log "Check the error logs for details: $ERROR_LOG"
  
  # Extract the most recent error messages for immediate visibility
  log "Most recent errors:"
  tail -n 20 "$ERROR_LOG"
  
  # Create a summary of what went wrong
  log "Creating error summary file..."
  {
    echo "=== PORT 3000 ERROR SUMMARY ==="
    echo "Date: $(date)"
    echo ""
    echo "=== LAST 20 ERRORS ==="
    tail -n 20 "$ERROR_LOG"
    echo ""
    echo "=== SUPABASE ERRORS ==="
    grep -i "supabase\|database\|db\|sql" "$ERROR_LOG" | tail -n 20
    echo ""
    echo "=== MISSING COMPONENT ERRORS ==="
    grep -i "module not found\|can't resolve\|cannot find module" "$ERROR_LOG" | tail -n 20
  } > "logs/error-summary-$TIMESTAMP.txt"
  
  log "Error summary created at: logs/error-summary-$TIMESTAMP.txt"
}