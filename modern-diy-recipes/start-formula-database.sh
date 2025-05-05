#!/bin/bash

# Formula Database Startup Script
# This script starts the DIY Recipes application with the Formula Database interface
# and integrates both Context7 MCP and Memory MCP for development workflow

# Make this script executable
chmod +x "$0"

# Set colors for better readability
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}==================================================${NC}"
echo -e "${CYAN}🧪 Formula Database Development Environment Setup 🧪${NC}"
echo -e "${CYAN}==================================================${NC}"

# Step 1: Initialize Memory MCP
echo -e "\n${YELLOW}[1/5]${NC} Initializing Memory MCP..."
node ../../start-development.js &
MEMORY_PID=$!

# Give memory agent a moment to initialize
sleep 2

# Record the start of development session
echo -e "${GREEN}Recording development session start...${NC}"
curl -X POST -H "Content-Type: application/json" -d '{
  "task_id": "formula-database-'$(date +%s)'",
  "title": "Formula Database Development Session",
  "description": "Working on the retro terminal UI for the Formula Database interface",
  "status": "in_progress",
  "priority": "high",
  "assigned_to": "'$(whoami)'",
  "tags": ["formula-database", "retro-ui", "terminal"]
}' http://localhost:3001/memory/recordTask || echo -e "${RED}Failed to record session - Memory agent may not be running${NC}"

# Step 2: Record the decision to use Context7 MCP
echo -e "\n${YELLOW}[2/5]${NC} Recording development decision..."
curl -X POST -H "Content-Type: application/json" -d '{
  "title": "Using Context7 MCP for React Documentation",
  "description": "Using Context7 MCP to access React documentation during Formula Database development",
  "rationale": "Context7 MCP provides access to React documentation and examples that help maintain best practices",
  "alternatives": ["Manual documentation lookup", "No documentation reference"],
  "component": "FormulaDatabase"
}' http://localhost:3001/memory/recordDecision || echo -e "${RED}Failed to record decision - Memory agent may not be running${NC}"

# Step 3: Prepare environment for Context7 MCP
echo -e "\n${YELLOW}[3/5]${NC} Setting up Context7 MCP environment..."
export NODE_ENV=development
export NEXT_PUBLIC_MCP_ENABLED=true
export CONTEXT7_TOKEN=${CONTEXT7_TOKEN:-public}  # Use public token if not provided

echo -e "${GREEN}Using Context7 token: ${CONTEXT7_TOKEN:-public (limited access)}${NC}"

# Step 4: Clean the build cache for a fresh start
echo -e "\n${YELLOW}[4/5]${NC} Cleaning build cache..."
echo -e "${GREEN}Cleaning Next.js cache...${NC}"
rm -rf .next
rm -rf node_modules/.cache

# Create log directory
mkdir -p logs

# Step 5: Start the development server
echo -e "\n${YELLOW}[5/5]${NC} Starting development server..."
echo -e "${GREEN}Starting Next.js development server with MCP integration...${NC}"
NODE_OPTIONS="--max-old-space-size=4096" DEBUG=next:* npm run dev > logs/formula-database.log 2>&1 &
DEV_PID=$!

# Wait a moment for the server to start
sleep 3

# Open the Formula Database page in the default browser
echo -e "\n${GREEN}Opening Formula Database interface...${NC}"
open http://localhost:3000/formula-database

echo -e "\n${CYAN}==================================================${NC}"
echo -e "${GREEN}✅ Formula Database development environment initialized${NC}"
echo -e "${CYAN}Memory MCP running with PID: ${MEMORY_PID}${NC}"
echo -e "${CYAN}Next.js server running with PID: ${DEV_PID}${NC}"
echo -e "${CYAN}Formula Database URL: http://localhost:3000/formula-database${NC}"
echo -e "${CYAN}Logs are written to logs/formula-database.log${NC}"
echo -e "${CYAN}==================================================${NC}"
echo -e "\n${YELLOW}Press Ctrl+C to stop all services${NC}"

# Function to clean up processes on exit
function cleanup {
  echo -e "\n${YELLOW}Stopping services...${NC}"
  
  # Stop Next.js server
  kill $DEV_PID
  
  # Record development session end
  echo -e "${GREEN}Recording development session end...${NC}"
  curl -X POST -H "Content-Type: application/json" -d '{
    "task_id": "formula-database-'$(date +%s)'",
    "status": "completed",
    "completion_date": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
  }' http://localhost:3001/memory/recordTask || echo -e "${RED}Failed to record session end${NC}"
  
  # Stop memory agent
  kill $MEMORY_PID
  
  echo -e "${GREEN}Services stopped${NC}"
  exit 0
}

# Set up trap to catch Ctrl+C
trap cleanup SIGINT

# Wait for Next.js process
wait $DEV_PID