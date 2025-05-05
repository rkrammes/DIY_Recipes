#!/bin/bash

# Start script for DIY Recipes with Context7 MCP integration
# This script starts the DIY Recipes app with Context7 MCP integration

# Make sure the script is executable
chmod +x "$0"

# Set environment variables
export NODE_ENV=development
export NEXT_PUBLIC_MCP_ENABLED=true
export CONTEXT7_TOKEN=${CONTEXT7_TOKEN:-public}  # Use public token if not provided

# Check for required packages
if ! command -v npx &> /dev/null; then
    echo "Error: npx is not installed or not in the PATH"
    exit 1
fi

if ! npx -y context7 --version &> /dev/null; then
    echo "Installing Context7 package..."
    npm install -g context7
fi

echo "Starting DIY Recipes with Context7 MCP integration..."
echo "Using Context7 token: ${CONTEXT7_TOKEN:-public (limited access)}"

# Start the app with Context7 MCP
echo "Starting development server..."
npm run dev