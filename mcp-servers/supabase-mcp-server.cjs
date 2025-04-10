const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

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
  // Adding the missing tools from mcp_settings.json for completeness
  get_table_schema: async ({ table_name }) => {
    // Placeholder: Actual implementation depends on how schema is fetched
    console.warn(`Tool 'get_table_schema' called for ${table_name}, but not fully implemented in this script.`);
    // Example: Fetching schema might involve a specific RPC or query
    // const { data, error } = await supabase.rpc('get_schema_info', { t_name: table_name });
    // if (error) throw error;
    // return data;
    return { schema: `Schema for ${table_name} (implementation pending)` };
  },
  live_dangerously: async (params) => {
    console.warn(`Tool 'live_dangerously' called with params:`, params, `- Implementation pending.`);
    return { result: "Executed live_dangerously (implementation pending)" };
  },
  execute_postgresql: async ({ query }) => {
    console.warn(`Executing raw PostgreSQL via 'execute_postgresql': ${query}`);
    // This is similar to query_data but might have different permissions or context
    const { data, error } = await supabase.rpc('execute_raw_sql', { query: query });
    if (error) throw error;
    return data;
  },
  get_schemas: async () => {
     const { data, error } = await supabase.rpc('get_schemas'); // Assuming an RPC 'get_schemas' exists
     if (error) {
        console.error("Error fetching schemas, attempting fallback query:", error);
        // Fallback or alternative method if RPC doesn't exist
        const { data: queryData, error: queryError } = await supabase
            .from('pg_catalog.pg_namespace')
            .select('nspname')
            .not('nspname', 'in', '("pg_toast","pg_catalog","information_schema")')
            .like('nspname', 'public%'); // Example filter, adjust as needed

        if (queryError) throw queryError;
        return queryData.map(s => s.nspname);
     }
     return data;
  },
  get_tables: async ({ schema = 'public' }) => {
    const { data, error } = await supabase.rpc('get_tables', { schema_name: schema }); // Assuming an RPC 'get_tables' exists
    if (error) {
        console.error(`Error fetching tables for schema ${schema}, attempting fallback query:`, error);
        // Fallback query
        const { data: queryData, error: queryError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', schema);

        if (queryError) throw queryError;
        return queryData.map(t => t.table_name);
    }
    return data;
  }
};

const app = express();
app.use(express.json());

// Basic MCP handshake endpoint
app.get('/', (req, res) => {
  res.json({
    name: "supabase-custom-server",
    version: "1.0.0",
    tools: Object.keys(tools),
    resources: [] // Define any resources if applicable
  });
});


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
    console.error(`Error executing tool ${tool_name}:`, error);
    res.status(500).json({ error: error.message || error.toString() });
  }
});

// Determine port from environment variable or default to 3002
const PORT = process.env.MCP_SUPABASE_PORT || 3002;

app.listen(PORT, () => {
  console.log(`Supabase Custom MCP server running on port ${PORT}`);
});