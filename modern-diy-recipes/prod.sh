#!/bin/bash

# prod.sh - Production build and start
# This script builds and runs the production version

# Set production environment
export NODE_ENV=production

# Load environment variables from .env.production if it exists
if [ -f .env.production ]; then
  export $(cat .env.production | grep -v '^#' | xargs)
elif [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

# Always use real data in production
export NEXT_PUBLIC_USE_MOCK_DATA=false
export NEXT_PUBLIC_SUPABASE_NO_MOCK_DATA=true

echo "Building for production..."
npm run build

if [ $? -eq 0 ]; then
  echo "Build successful. Starting production server..."
  npm start
else
  echo "Build failed. Please fix errors before deploying."
  exit 1
fi