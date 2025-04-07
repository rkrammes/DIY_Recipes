const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const tools = {
  query_data: async ({ sql }) => {
    const { data, error } = await supabase.rpc('execute_raw_sql', { query: sql });
    if (error) throw error;
    return data;
  },
  get_user: async ({ user_id }) => {
    const { data, error } = await supabase.auth.admin.getUserById(user_id);
    if (error) throw error;
    return data;
  },
  authenticate: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  create_record: async ({ table, record }) => {
    const { data, error } = await supabase.from(table).insert(record).select();
    if (error) throw error;
    return data;
  },
  update_record: async ({ table, record_id, updates, id_field = 'id' }) => {
    const { data, error } = await supabase.from(table).update(updates).eq(id_field, record_id).select();
    if (error) throw error;
    return data;
  },
  delete_record: async ({ table, record_id, id_field = 'id' }) => {
    const { data, error } = await supabase.from(table).delete().eq(id_field, record_id).select();
    if (error) throw error;
    return data;
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

app.listen(3002, () => {
  console.log('Supabase MCP server running on port 3002');
});