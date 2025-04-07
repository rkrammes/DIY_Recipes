const express = require('express');
const axios = require('axios');
require('dotenv').config();

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID; // optional
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID; // optional

if (!VERCEL_TOKEN) {
  console.error('Missing VERCEL_TOKEN environment variable');
  process.exit(1);
}

const apiBase = 'https://api.vercel.com';

const vercelHeaders = {
  Authorization: `Bearer ${VERCEL_TOKEN}`,
  'Content-Type': 'application/json',
};

const tools = {
  deploy_project: async ({ projectId = VERCEL_PROJECT_ID, teamId = VERCEL_TEAM_ID }) => {
    if (!projectId) throw new Error('projectId is required');
    const params = teamId ? { teamId } : {};
    const url = \`\${apiBase}/v13/deployments?projectId=\${projectId}\`;
    const res = await axios.post(url, {}, { headers: vercelHeaders, params });
    return res.data;
  },

