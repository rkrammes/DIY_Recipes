#!/bin/bash

# Check if the app is already running
if curl -s http://localhost:3000 > /dev/null; then
  echo "App is already running on port 3000"
else
  echo "Starting the app..."
  npm run dev &
  APP_PID=$!
  echo "App started with PID $APP_PID"
  
  # Wait for app to be ready
  echo "Waiting for app to start..."
  COUNTER=0
  MAX_WAIT=30
  while ! curl -s http://localhost:3000 > /dev/null && [ $COUNTER -lt $MAX_WAIT ]; do
    sleep 1
    ((COUNTER++))
    echo -n "."
  done
  echo ""
  
  if [ $COUNTER -ge $MAX_WAIT ]; then
    echo "App failed to start in $MAX_WAIT seconds"
    exit 1
  fi
  
  echo "App is now running on port 3000"
fi

# Run the Puppeteer test
echo "Running recipe iteration test..."
node test-recipe-iterations.js

# Don't stop the app if we didn't start it
if [ -n "$APP_PID" ]; then
  echo "Stopping the app (PID $APP_PID)..."
  kill $APP_PID
fi

echo "Test complete. Check test-artifacts/recipe-iterations directory for results."