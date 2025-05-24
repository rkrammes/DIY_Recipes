#!/bin/bash

# Verified Start Script for Kraft AI on port 3000
# This script starts the application AND verifies it's actually running

# Color codes for readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}  VERIFIED START - KRAFT AI ON PORT 3000  ${NC}"
echo -e "${BLUE}==========================================${NC}"

# Clean up existing processes
echo -e "${BLUE}Cleaning up existing processes...${NC}"
pkill -f "node.*next" 2>/dev/null
pkill -f "next dev" 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Clean Next.js cache for a fresh start
echo -e "${BLUE}Cleaning Next.js cache...${NC}"
rm -rf .next
rm -rf node_modules/.cache

# Create logs directory
mkdir -p logs

# Set environment variables
export PORT=3000
export NEXT_PUBLIC_PORT=3000
export NEXT_PUBLIC_UI_MODE=terminal
export NEXT_PUBLIC_ENABLE_MODULES=true
export NEXT_PUBLIC_TERMINAL_UI_ENABLED=true
export NEXT_PUBLIC_USE_MOCK_DATA=false
export NEXT_PUBLIC_SUPABASE_NO_MOCK_DATA=true
export NODE_OPTIONS="--max-old-space-size=8192"

# Log file for Next.js
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/nextjs-verified-${TIMESTAMP}.log"

echo -e "${BLUE}Starting Next.js application on port 3000...${NC}"
echo -e "${BLUE}Logs will be saved to: ${LOG_FILE}${NC}"

# Start Next.js as a background process
npx next dev -p 3000 > "${LOG_FILE}" 2>&1 &
NEXT_PID=$!

echo -e "${BLUE}Next.js process started with PID: ${NEXT_PID}${NC}"
echo -e "${BLUE}Verifying server is actually running...${NC}"

# Wait for the server to start
sleep 5

# Check if process is still running
if ! kill -0 $NEXT_PID 2>/dev/null; then
  echo -e "${RED}ERROR: Next.js process has already exited!${NC}"
  echo -e "${RED}Check the log file: ${LOG_FILE}${NC}"
  tail -n 20 "${LOG_FILE}"
  exit 1
fi

# Run the verification script
echo -e "${BLUE}Running verification tests...${NC}"
node real-test-and-report.js

# Check the verification result
if [ $? -eq 0 ]; then
  echo -e "${GREEN}======================================${NC}"
  echo -e "${GREEN}       SERVER IS RUNNING!            ${NC}"
  echo -e "${GREEN}      http://localhost:3000          ${NC}"
  echo -e "${GREEN}======================================${NC}"
  echo ""
  echo -e "To stop the server: ${YELLOW}kill $NEXT_PID${NC}"
  echo -e "To view logs: ${YELLOW}tail -f ${LOG_FILE}${NC}"
  
  # Save the PID for later reference
  echo $NEXT_PID > .kraft-pid
  
  exit 0
else
  echo -e "${RED}======================================${NC}"
  echo -e "${RED}  SERVER VERIFICATION FAILED!        ${NC}"
  echo -e "${RED}  The server is NOT accessible       ${NC}"
  echo -e "${RED}======================================${NC}"
  
  # Kill the process if it's still running
  kill $NEXT_PID 2>/dev/null
  
  echo -e "${BLUE}Checking the log file for errors...${NC}"
  echo -e "${YELLOW}Last 20 lines from the log:${NC}"
  tail -n 20 "${LOG_FILE}"
  
  exit 1
fi