#!/bin/bash

echo "Installing official MCP servers globally..."

# GitHub MCP server
npm install -g @modelcontextprotocol/server-github

# Supabase MCP server
npm install -g @modelcontextprotocol/server-supabase

echo "All official MCP servers installed successfully."