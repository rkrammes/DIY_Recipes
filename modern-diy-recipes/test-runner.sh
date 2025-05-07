#!/bin/bash

# test-runner.sh - Consolidated test runner script
# Usage: ./test-runner.sh [options]
#
# This script consolidates various test scripts into a single configurable script

# Default settings
TEST_TYPE="all"
HEADLESS=true
SERVER=false
PORT=3000
VERBOSE=false
COVERAGE=false
COMPONENT=""
SKIP_LINT=false

# Show help
show_help() {
  echo "DIY Formulations Test Runner Script"
  echo "----------------------------------"
  echo "Usage: ./test-runner.sh [options]"
  echo ""
  echo "Options:"
  echo "  --test=TYPE         Test type: all, unit, integration, e2e, layout, feature-toggle,"
  echo "                      iterations, formulations, ingredients, theme (default: all)"
  echo "  --component=NAME    Run tests for a specific component"
  echo "  --headless=BOOL     Run in headless mode (true/false) (default: true)"
  echo "  --with-server       Start a server for tests that require it (default: false)"
  echo "  --port=PORT         Port for test server (default: 3000)"
  echo "  --verbose           Show verbose output (default: false)"
  echo "  --coverage          Collect test coverage (default: false)"
  echo "  --skip-lint         Skip linting (default: false)"
  echo "  --help              Show this help message"
  echo ""
  echo "Examples:"
  echo "  ./test-runner.sh                       # Run all tests"
  echo "  ./test-runner.sh --test=unit           # Run unit tests only"
  echo "  ./test-runner.sh --component=RecipeList  # Test specific component"
  echo "  ./test-runner.sh --test=e2e --headless=false  # Run E2E tests with browser visible"
  echo "  ./test-runner.sh --coverage            # Run tests with coverage report"
  echo "  ./test-runner.sh --test=layout --with-server  # Run layout tests with a server"
  exit 0
}

# Parse arguments
for arg in "$@"; do
  case $arg in
    --test=*)
      TEST_TYPE="${arg#*=}"
      ;;
    --component=*)
      COMPONENT="${arg#*=}"
      ;;
    --headless=*)
      HEADLESS="${arg#*=}"
      ;;
    --with-server)
      SERVER=true
      ;;
    --port=*)
      PORT="${arg#*=}"
      ;;
    --verbose)
      VERBOSE=true
      ;;
    --coverage)
      COVERAGE=true
      ;;
    --skip-lint)
      SKIP_LINT=true
      ;;
    --help)
      show_help
      ;;
    *)
      echo "Unknown option: $arg"
      show_help
      ;;
  esac
done

# Function to run Jest tests
run_jest_tests() {
  local test_path=$1
  local test_args=""
  
  # Add coverage if requested
  if [ "$COVERAGE" = true ]; then
    test_args="$test_args --coverage"
  fi
  
  # Add verbose if requested
  if [ "$VERBOSE" = true ]; then
    test_args="$test_args --verbose"
  fi
  
  # Run tests
  if [ -z "$test_path" ]; then
    echo "Running all Jest tests..."
    npx jest $test_args
  else
    echo "Running Jest tests in $test_path..."
    npx jest $test_path $test_args
  fi
}

# Function to run Puppeteer tests
run_puppeteer_tests() {
  local test_file=$1
  local test_args=""
  
  # Set headless mode
  if [ "$HEADLESS" = "true" ]; then
    export HEADLESS=true
  else
    export HEADLESS=false
  fi
  
  # Set port if server is running
  if [ "$SERVER" = true ]; then
    export TEST_PORT=$PORT
  fi
  
  # Run Puppeteer tests
  if [ -z "$test_file" ]; then
    echo "Running all Puppeteer tests..."
    node tests/puppeteer.test.js
  else
    echo "Running Puppeteer test: $test_file..."
    node $test_file
  fi
}

# Function to start a test server if needed
start_test_server() {
  if [ "$SERVER" = true ]; then
    echo "Starting test server on port $PORT..."
    ./server.sh --port=$PORT --mode=minimal &
    SERVER_PID=$!
    
    # Wait for server to start
    echo "Waiting for server to start..."
    sleep 5
  fi
}

# Function to stop test server if it was started
stop_test_server() {
  if [ "$SERVER" = true ] && [ ! -z "$SERVER_PID" ]; then
    echo "Stopping test server..."
    kill $SERVER_PID
    # Give it a moment to shut down
    sleep 2
  fi
}

# Run linting unless skipped
if [ "$SKIP_LINT" = false ]; then
  echo "Running linting..."
  npx eslint .
fi

# Start server if needed
start_test_server

# Trap to ensure server is stopped on script exit
trap stop_test_server EXIT

# Run tests based on type
case $TEST_TYPE in
  all)
    echo "Running all tests..."
    run_jest_tests
    run_puppeteer_tests
    ;;
  unit)
    echo "Running unit tests..."
    run_jest_tests "src/__tests__"
    ;;
  integration)
    echo "Running integration tests..."
    run_jest_tests "tests/integration"
    ;;
  e2e)
    echo "Running end-to-end tests..."
    run_puppeteer_tests "tests/puppeteer-ui-tests.js"
    ;;
  layout)
    echo "Running layout tests..."
    run_puppeteer_tests "test-layout-screenshots.js"
    ;;
  feature-toggle)
    echo "Running feature toggle tests..."
    run_puppeteer_tests "test-feature-toggle-bar.js"
    ;;
  iterations)
    echo "Running iterations tests..."
    run_puppeteer_tests "tests/puppeteer-iterations.js"
    ;;
  formulations)
    echo "Running formulation tests..."
    if [ -z "$COMPONENT" ]; then
      run_jest_tests "src/__tests__/Recipe*.test.tsx"
    else
      run_jest_tests "src/__tests__/${COMPONENT}.test.tsx"
    fi
    ;;
  ingredients)
    echo "Running ingredient tests..."
    run_jest_tests "src/__tests__/Ingredient*.test.tsx"
    ;;
  theme)
    echo "Running theme tests..."
    run_jest_tests "src/lib/themes/__tests__"
    ;;
  *)
    if [ ! -z "$COMPONENT" ]; then
      echo "Running tests for component: $COMPONENT..."
      run_jest_tests "src/__tests__/${COMPONENT}.test.tsx"
    else
      echo "Unknown test type: $TEST_TYPE"
      exit 1
    fi
    ;;
esac

echo "All tests completed."