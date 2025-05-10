#!/bin/bash

# Enhanced script to start the DIY Formulations app on port 3000
# This script includes environment validation and better error handling

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

# Print header
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}   DIY Formulations - Port 3000 Setup   ${NC}"
echo -e "${CYAN}========================================${NC}"

log "Starting Next.js application on port 3000..."

# Check port 3000 availability
log "Checking if port 3000 is available..."
if lsof -i :3000 | grep LISTEN > /dev/null; then
  warning "Port 3000 is already in use. Attempting to free it..."
  lsof -i :3000 -t | xargs kill -9 2>/dev/null
  sleep 1

  # Verify port is now free
  if lsof -i :3000 | grep LISTEN > /dev/null; then
    error "Failed to free port 3000. Please manually kill the process and try again."
    echo -e "You can manually stop the process with: ${YELLOW}lsof -i :3000 -t | xargs kill -9${NC}"
    exit 1
  else
    success "Port 3000 is now available"
  fi
else
  success "Port 3000 is available"
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
export PORT=3000
export NEXT_PUBLIC_PORT=3000
export NEXT_PUBLIC_UI_MODE=terminal
export NEXT_PUBLIC_ENABLE_MODULES=true
export NEXT_PUBLIC_ENABLE_RECIPE_VERSIONING=true
export NEXT_PUBLIC_TERMINAL_UI_ENABLED=true
export NODE_OPTIONS="--max-old-space-size=4096"

# Check if we should use mock data
if [ "$1" = "--use-mock-data" ] || [ "$1" = "-m" ]; then
  log "🧪 Mock data mode enabled"
  export NEXT_PUBLIC_USE_MOCK_DATA=true
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

log "Starting application on port 3000..."
echo -e "${CYAN}----------------------------------------${NC}"
echo -e "${CYAN}  Environment Configuration:${NC}"
echo -e "${CYAN}  - Port: ${YELLOW}3000${NC}"
echo -e "${CYAN}  - UI Mode: ${YELLOW}${NEXT_PUBLIC_UI_MODE}${NC}"
echo -e "${CYAN}  - Mock Data: ${YELLOW}${NEXT_PUBLIC_USE_MOCK_DATA}${NC}"
echo -e "${CYAN}  - Dev Auth: ${YELLOW}${NEXT_PUBLIC_AUTO_DEV_LOGIN}${NC}"
echo -e "${CYAN}  - Modules: ${YELLOW}${NEXT_PUBLIC_ENABLE_MODULES}${NC}"
echo -e "${CYAN}  - Recipe Versioning: ${YELLOW}${NEXT_PUBLIC_ENABLE_RECIPE_VERSIONING}${NC}"
echo -e "${CYAN}----------------------------------------${NC}"

# Run application with explicit port setting
npx next dev -p 3000 -H 0.0.0.0

# This will only execute if next dev fails
error "Application failed to start properly"
exit 1