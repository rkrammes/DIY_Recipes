#!/bin/bash
# Script to kill any process using port 3000

PID=$(lsof -t -i:3000)
if [ -n "$PID" ]; then
  echo "Killing process $PID running on port 3000"
  kill -9 $PID
  echo "Process killed"
else
  echo "No process found running on port 3000"
fi