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
    const url = `${apiBase}/v13/deployments?projectId=${projectId}`;
    const res = await axios.post(url, {}, { headers: vercelHeaders, params });
    return res.data;
  },

  get_deployments: async ({ projectId = VERCEL_PROJECT_ID, teamId = VERCEL_TEAM_ID, limit = 10 }) => {
    if (!projectId) throw new Error('projectId is required');
    const params = { projectId, limit };
    if (teamId) params.teamId = teamId;
    const url = `${apiBase}/v6/deployments`;
    const res = await axios.get(url, { headers: vercelHeaders, params });
    return res.data;
  },

  get_deployment_status: async ({ deploymentId, teamId = VERCEL_TEAM_ID }) => {
    if (!deploymentId) throw new Error('deploymentId is required');
    const params = teamId ? { teamId } : {};
    const url = `${apiBase}/v13/deployments/${deploymentId}`;
    const res = await axios.get(url, { headers: vercelHeaders, params });
    return res.data;
  },

  set_environment_variables: async ({ projectId = VERCEL_PROJECT_ID, envVars, teamId = VERCEL_TEAM_ID }) => {
    if (!projectId) throw new Error('projectId is required');
    if (!Array.isArray(envVars)) throw new Error('envVars must be an array');
    const params = teamId ? { teamId } : {};
    const url = `${apiBase}/v9/projects/${projectId}/env`;
    const res = await axios.patch(url, envVars, { headers: vercelHeaders, params });
    return res.data;
  },

  create_preview_deployment: async ({ projectId = VERCEL_PROJECT_ID, teamId = VERCEL_TEAM_ID }) => {
    if (!projectId) throw new Error('projectId is required');
    const params = teamId ? { teamId } : {};
    const url = `${apiBase}/v13/deployments?projectId=${projectId}&target=preview`;
    const res = await axios.post(url, {}, { headers: vercelHeaders, params });
    return res.data;
  },
};

const app = express();
app.use(express.json());

app.post('/tool/:tool_name', async (req, res) => {
  const { tool_name } = req.params;
  const params = req.body;

  const handler = tools[tool_name];
  if (!handler) {
    return res.status(404).json({ error: 'Tool not found' });
  }

  try {
    const result = await handler(params);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message || error.toString() });
  }
});

app.listen(3003, () => {
  console.log('Vercel MCP server running on port 3003');
});