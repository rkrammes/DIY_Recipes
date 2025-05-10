#!/bin/bash

# Script to start DIY Formulations app on a working port (8080)
# This script avoids port 3000 which has connection issues on this system

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Log function for better readability
log() {
  echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
  echo -e "${GREEN}✅ $1${NC}"
}

warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
  echo -e "${RED}❌ $1${NC}"
}

# Port to use (avoiding port 3000)
PORT=8080

# Print header
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}   DIY Formulations - Port ${PORT} Setup   ${NC}"
echo -e "${CYAN}========================================${NC}"

log "Starting Next.js application on port ${PORT}..."

# Check port availability
log "Checking if port ${PORT} is available..."
if lsof -i :${PORT} | grep LISTEN > /dev/null; then
  warning "Port ${PORT} is already in use. Attempting to free it..."
  lsof -i :${PORT} -t | xargs kill -9 2>/dev/null
  sleep 1

  # Verify port is now free
  if lsof -i :${PORT} | grep LISTEN > /dev/null; then
    error "Failed to free port ${PORT}. Please manually kill the process and try again."
    echo -e "You can manually stop the process with: ${YELLOW}lsof -i :${PORT} -t | xargs kill -9${NC}"
    exit 1
  else
    success "Port ${PORT} is now available"
  fi
else
  success "Port ${PORT} is available"
fi

# Stop any running servers to ensure a clean start
log "Stopping any existing servers..."
if [ -f "./stop-all-servers.sh" ]; then
  chmod +x ./stop-all-servers.sh
  ./stop-all-servers.sh >/dev/null 2>&1
  success "All servers stopped"
else
  warning "No stop-all-servers.sh script found, continuing anyway"
fi

# Create logs directory
mkdir -p logs

# Clear cache for a fresh start
log "Clearing cache..."
rm -rf .next/cache
rm -rf node_modules/.cache
success "Cache cleared"

# Set up required environment variables
log "Setting up environment variables..."
export PORT=${PORT}
export NEXT_PUBLIC_PORT=${PORT}
export NEXT_PUBLIC_UI_MODE=terminal
export NEXT_PUBLIC_ENABLE_MODULES=true
export NEXT_PUBLIC_ENABLE_RECIPE_VERSIONING=true
export NEXT_PUBLIC_TERMINAL_UI_ENABLED=true
export NODE_OPTIONS="--max-old-space-size=4096"
export NEXT_PUBLIC_SUPABASE_NO_MOCK_DATA=true

# Check if we should use mock data
if [ "$1" = "--use-mock-data" ] || [ "$1" = "-m" ]; then
  log "🧪 Mock data mode enabled"
  export NEXT_PUBLIC_USE_MOCK_DATA=true
  export NEXT_PUBLIC_SUPABASE_NO_MOCK_DATA=false
else
  export NEXT_PUBLIC_USE_MOCK_DATA=false
fi

# Check if we want development auth
if [ "$1" = "--dev-auth" ] || [ "$2" = "--dev-auth" ]; then
  log "🔑 Development authentication enabled"
  export NEXT_PUBLIC_AUTO_DEV_LOGIN=true
else
  export NEXT_PUBLIC_AUTO_DEV_LOGIN=false
fi

log "Starting application on port ${PORT}..."
echo -e "${CYAN}----------------------------------------${NC}"
echo -e "${CYAN}  Environment Configuration:${NC}"
echo -e "${CYAN}  - Port: ${YELLOW}${PORT}${NC}"
echo -e "${CYAN}  - UI Mode: ${YELLOW}${NEXT_PUBLIC_UI_MODE}${NC}"
echo -e "${CYAN}  - Mock Data: ${YELLOW}${NEXT_PUBLIC_USE_MOCK_DATA}${NC}"
echo -e "${CYAN}  - No Mock Data: ${YELLOW}${NEXT_PUBLIC_SUPABASE_NO_MOCK_DATA}${NC}"
echo -e "${CYAN}  - Dev Auth: ${YELLOW}${NEXT_PUBLIC_AUTO_DEV_LOGIN}${NC}"
echo -e "${CYAN}  - Modules: ${YELLOW}${NEXT_PUBLIC_ENABLE_MODULES}${NC}"
echo -e "${CYAN}  - Recipe Versioning: ${YELLOW}${NEXT_PUBLIC_ENABLE_RECIPE_VERSIONING}${NC}"
echo -e "${CYAN}----------------------------------------${NC}"
echo -e "${CYAN}  Access the app at: ${GREEN}http://localhost:${PORT}${NC}"
echo -e "${CYAN}  For settings page: ${GREEN}http://localhost:${PORT}/settings${NC}"
echo -e "${CYAN}----------------------------------------${NC}"

# Run application with explicit port setting
npx next dev -p ${PORT} -H 0.0.0.0

# This will only execute if next dev fails
error "Application failed to start properly"
exit 1