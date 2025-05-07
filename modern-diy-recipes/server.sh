#!/bin/bash

# server.sh - Consolidated server management script
# Usage: ./server.sh [options]
#
# This script replaces multiple individual server scripts with a single
# configurable script to manage Next.js, font servers, and API servers.

# Default settings
MODE="standard"
SERVER_TYPE="nextjs"
PORT=3000
HOST="localhost"
CLEAN=false
API=false
FONT_SERVER=false
DEBUG=false
ACTION="start"
INTEGRATIONS=""

# Show help
show_help() {
  echo "DIY Formulations Server Management Script"
  echo "----------------------------------------"
  echo "Usage: ./server.sh [options]"
  echo ""
  echo "Options:"
  echo "  --mode=MODE         Server mode: standard, minimal, document, formula (default: standard)"
  echo "  --type=TYPE         Server type: nextjs, express, static, http (default: nextjs)"
  echo "  --port=PORT         Port to run on (default: 3000)"
  echo "  --host=HOST         Host to bind to (localhost, 0.0.0.0, etc) (default: localhost)"
  echo "  --clean             Clean cache before starting (default: false)"
  echo "  --with-api          Start with API server (default: false)"
  echo "  --with-font-server  Start with Font server (default: false)"
  echo "  --with=INTEGRATIONS Comma-separated list: context7,memory,supabase"
  echo "  --debug             Start in debug mode (default: false)"
  echo "  --stop              Stop servers instead of starting"
  echo "  --restart           Restart servers"
  echo "  --help              Show this help message"
  echo ""
  echo "Examples:"
  echo "  ./server.sh                          # Start NextJS on port 3000"
  echo "  ./server.sh --clean --port=3001      # Clean cache and start on port 3001"
  echo "  ./server.sh --mode=formula           # Start in formula database mode"
  echo "  ./server.sh --with-api --with-font-server  # Start with API and font servers"
  echo "  ./server.sh --stop                   # Stop all servers"
  echo "  ./server.sh --with=context7,memory   # Start with Context7 and Memory integrations"
  exit 0
}

# Parse arguments
for arg in "$@"; do
  case $arg in
    --mode=*)
      MODE="${arg#*=}"
      ;;
    --type=*)
      SERVER_TYPE="${arg#*=}"
      ;;
    --port=*)
      PORT="${arg#*=}"
      ;;
    --host=*)
      HOST="${arg#*=}"
      ;;
    --clean)
      CLEAN=true
      ;;
    --with-api)
      API=true
      ;;
    --with-font-server)
      FONT_SERVER=true
      ;;
    --with=*)
      INTEGRATIONS="${arg#*=}"
      ;;
    --debug)
      DEBUG=true
      ;;
    --stop)
      ACTION="stop"
      ;;
    --restart)
      ACTION="restart"
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

# Function to check if a process is running on a port
is_port_in_use() {
  lsof -i ":$1" >/dev/null 2>&1
  return $?
}

# Function to kill process on a specific port
kill_port() {
  echo "Stopping processes on port $1..."
  lsof -ti ":$1" | xargs kill -9 2>/dev/null
}

# Stop servers
stop_servers() {
  echo "Stopping servers..."
  
  # Stop NextJS server
  if is_port_in_use $PORT; then
    echo "Stopping server on port $PORT..."
    kill_port $PORT
  else
    echo "No server running on port $PORT"
  fi
  
  # Stop font server on port 3001 if it exists
  if is_port_in_use 3001; then
    echo "Stopping font server on port 3001..."
    kill_port 3001
  fi
  
  # Stop API server on port 3005 if it exists
  if is_port_in_use 3005; then
    echo "Stopping API server on port 3005..."
    kill_port 3005
  fi
  
  echo "All servers stopped."
}

# If stop action is requested, stop servers and exit
if [ "$ACTION" = "stop" ]; then
  stop_servers
  exit 0
fi

# If restart action is requested, stop servers first
if [ "$ACTION" = "restart" ]; then
  stop_servers
fi

# Clean cache if requested
if [ "$CLEAN" = true ]; then
  echo "Cleaning Next.js cache..."
  rm -rf .next
  echo "Cache cleaned."
fi

# Start font server if requested
if [ "$FONT_SERVER" = true ]; then
  echo "Starting Font server on port 3001..."
  node simple-font-server-3000.js --port=3001 > logs/font-server.log 2>&1 &
  echo "Font server started. Check logs/font-server.log for details."
fi

# Start API server if requested
if [ "$API" = true ]; then
  echo "Starting API server on port 3005..."
  node recipe-api-server.js > logs/api-server.log 2>&1 &
  echo "API server started. Check logs/api-server.log for details."
fi

# Set up integrations
INTEGRATION_ARGS=""
if [ ! -z "$INTEGRATIONS" ]; then
  IFS=',' read -ra INTEGRATION_ARRAY <<< "$INTEGRATIONS"
  for integration in "${INTEGRATION_ARRAY[@]}"; do
    case $integration in
      context7)
        echo "Enabling Context7 integration..."
        INTEGRATION_ARGS="$INTEGRATION_ARGS --context7"
        ;;
      memory)
        echo "Enabling Memory integration..."
        INTEGRATION_ARGS="$INTEGRATION_ARGS --memory"
        ;;
      supabase)
        echo "Enabling Supabase integration..."
        INTEGRATION_ARGS="$INTEGRATION_ARGS --supabase"
        ;;
      *)
        echo "Unknown integration: $integration"
        ;;
    esac
  done
fi

# Start server based on type and mode
echo "Starting $SERVER_TYPE server in $MODE mode on $HOST:$PORT..."

# Debug flag
DEBUG_ARG=""
if [ "$DEBUG" = true ]; then
  DEBUG_ARG="--debug"
fi

# Start server based on type
case $SERVER_TYPE in
  nextjs)
    case $MODE in
      standard)
        npx next dev -p $PORT -H $HOST $DEBUG_ARG $INTEGRATION_ARGS
        ;;
      minimal)
        npx next dev -p $PORT -H $HOST --app minimal $DEBUG_ARG $INTEGRATION_ARGS
        ;;
      document)
        npx next dev -p $PORT -H $HOST --app document-interface $DEBUG_ARG $INTEGRATION_ARGS
        ;;
      formula)
        npx next dev -p $PORT -H $HOST --app formula-database $DEBUG_ARG $INTEGRATION_ARGS
        ;;
      *)
        echo "Unknown mode: $MODE"
        exit 1
        ;;
    esac
    ;;
  express)
    node express-server.js --port=$PORT --host=$HOST --mode=$MODE $DEBUG_ARG $INTEGRATION_ARGS
    ;;
  static)
    node static-server.js --port=$PORT --host=$HOST --mode=$MODE $DEBUG_ARG $INTEGRATION_ARGS
    ;;
  http)
    node http-server-3000.js --port=$PORT --host=$HOST --mode=$MODE $DEBUG_ARG $INTEGRATION_ARGS
    ;;
  *)
    echo "Unknown server type: $SERVER_TYPE"
    exit 1
    ;;
esac