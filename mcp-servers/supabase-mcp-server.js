const { createServer } = require('@modelcontextprotocol/server-core');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const server = createServer({
  name: 'supabase-mcp-server',
  description: 'MCP server for Supabase database and authentication',
  tools: {
    query_data: {
      description: 'Execute a SQL query on the Supabase database',
      input_schema: {
        type: 'object',
        properties: {
          sql: { type: 'string' },
        },
        required: ['sql'],
      },
      handler: async ({ sql }) => {
        const { data, error } = await supabase.rpc('execute_raw_sql', { query: sql });
        if (error) throw error;
        return data;
      },
    },
    get_user: {
      description: 'Retrieve user information by user ID',
      input_schema: {
        type: 'object',
        properties: {
          user_id: { type: 'string' },
        },
        required: ['user_id'],
      },
      handler: async ({ user_id }) => {
        const { data, error } = await supabase.auth.admin.getUserById(user_id);
        if (error) throw error;
        return data;
      },
    },
    authenticate: {
      description: 'Authenticate a user with email and password',
      input_schema: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          password: { type: 'string' },
        },
        required: ['email', 'password'],
      },
      handler: async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
      },
    },
    create_record: {
      description: 'Create a new record in a specified table',
      input_schema: {
        type: 'object',
        properties: {
          table: { type: 'string' },
          record: { type: 'object' },
        },
        required: ['table', 'record'],
      },
      handler: async ({ table, record }) => {
        const { data, error } = await supabase.from(table).insert(record).select();
        if (error) throw error;
        return data;
      },
    },
    update_record: {
      description: 'Update an existing record in a specified table',
      input_schema: {
        type: 'object',
        properties: {
          table: { type: 'string' },
          record_id: { type: 'string' },
          updates: { type: 'object' },
          id_field: { type: 'string', default: 'id' },
        },
        required: ['table', 'record_id', 'updates'],
      },
      handler: async ({ table, record_id, updates, id_field = 'id' }) => {
        const { data, error } = await supabase.from(table).update(updates).eq(id_field, record_id).select();
        if (error) throw error;
        return data;
      },
    },
    delete_record: {
      description: 'Delete a record from a specified table',
      input_schema: {
        type: 'object',
        properties: {
          table: { type: 'string' },
          record_id: { type: 'string' },
          id_field: { type: 'string', default: 'id' },
        },
        required: ['table', 'record_id'],
      },
      handler: async ({ table, record_id, id_field = 'id' }) => {
        const { data, error } = await supabase.from(table).delete().eq(id_field, record_id).select();
        if (error) throw error;
        return data;
      },
    },
  },
});

server.listen(3002).then(() => {
  console.log('Supabase MCP server running on port 3002');
});