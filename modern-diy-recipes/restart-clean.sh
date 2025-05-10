#!/bin/bash

# restart-clean.sh - Restart servers with a clean environment
# This script stops all servers, cleans cache, and ensures proper environment setup

# Make this script executable
chmod +x "$0"

# First, ensure we stop any running processes
echo "Stopping all running servers..."
./stop-all-servers.sh

# Clean Next.js cache
echo "Cleaning Next.js cache..."
rm -rf .next

# Ensure .env.local exists based on example
if [ ! -f .env.local ] && [ -f .env.example ]; then
  echo "WARNING: .env.local not found, but .env.example exists"
  echo "Consider creating .env.local from .env.example by running:"
  echo "  cp .env.example .env.local"
  echo "  nano .env.local  # Edit with your credentials"
  echo ""
fi

# Validate required environment variables
validate_env() {
  local missing=false
  
  echo "Validating environment variables..."
  
  if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "⚠️  Missing NEXT_PUBLIC_SUPABASE_URL"
    missing=true
  fi
  
  if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "⚠️  Missing NEXT_PUBLIC_SUPABASE_ANON_KEY"
    missing=true
  fi
  
  if [ "$missing" = true ]; then
    echo ""
    echo "Some environment variables are missing."
    echo "The application may not function correctly."
    echo "Consider updating your .env.local file."
    echo ""
    read -p "Continue anyway? (y/n): " continue_anyway
    if [ "$continue_anyway" != "y" ]; then
      echo "Aborting..."
      exit 1
    fi
  else
    echo "✅ All required environment variables are set."
  fi
}

# Load environment variables from .env.local if it exists
if [ -f .env.local ]; then
  echo "Loading environment from .env.local..."
  export $(grep -v '^#' .env.local | xargs)
  validate_env
fi

# Start the server
echo "Starting development server..."
./server.sh --clean --with=context7,memory