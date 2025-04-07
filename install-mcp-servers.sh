#!/bin/bash

echo "Installing official MCP servers globally..."

# Use sudo for global installations to avoid permission errors
echo "Installing GitHub MCP server..."
sudo npm install -g @modelcontextprotocol/server-github

echo "Installing Brave Search MCP server..."
sudo npm install -g @modelcontextprotocol/server-brave-search

echo "Installing Puppeteer MCP server..."
sudo npm install -g @modelcontextprotocol/server-puppeteer

# Removed Supabase server install attempt as it's not on npm

echo "Official MCP server installations attempted."
echo "Please check the output above for any errors."