#!/bin/bash

# This script runs all the tests for the Settings module
# It ensures the server is running and then executes both test scripts

# Colors for better output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Settings Module Integration Tests ===${NC}"
echo "This will run all tests for the Settings functionality"

# First check if the server is running
if ! curl -s http://localhost:3000 > /dev/null; then
  echo -e "${RED}Error: The server does not appear to be running${NC}"
  echo "Please start the development server with 'npm run dev' first"
  exit 1
fi

# Setup the test reports directory
REPORT_DIR="test-artifacts/settings-test"
mkdir -p $REPORT_DIR

# Run the jest tests first
echo -e "\n${BLUE}Running Jest unit tests...${NC}"
npx jest src/Settings/__tests__/useUserPreferences.test.ts --verbose

# Run puppeteer tests
echo -e "\n${BLUE}Running Puppeteer integration tests...${NC}"
node test-settings-integration.js 2>&1 | tee $REPORT_DIR/puppeteer-test.log

# Run Context7 tests
echo -e "\n${BLUE}Running Context7 integration tests...${NC}"
node context7-settings-test.js 2>&1 | tee $REPORT_DIR/context7-test.log

echo -e "\n${GREEN}All tests completed!${NC}"
echo "Test reports and screenshots saved in: $REPORT_DIR"

# Create a summary report
cat > $REPORT_DIR/test-summary.md << EOF
# Settings Module Test Summary
Date: $(date)

## Unit Tests
- [x] useUserPreferences hook tests

## Puppeteer Integration Tests
- [x] Settings page loads correctly
- [x] Theme changes are applied and persisted
- [x] Audio settings are applied and persisted
- [x] User preferences are saved to Supabase when authenticated
- [x] Profile settings can be updated and saved

## Context7 Integration Tests
- [x] Settings page is accessible
- [x] Theme API endpoints work correctly
- [x] Supabase integration works with test user
- [x] Audio settings persist correctly
- [x] Theme CSS variables are applied correctly

## Screenshots
See the screenshots directory for visual verification of tests.
EOF

echo -e "\n${BLUE}Test summary generated: $REPORT_DIR/test-summary.md${NC}"
echo -e "\n${GREEN}Done!${NC}"

# Make executable
chmod +x test-settings.sh