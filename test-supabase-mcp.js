const axios = require('axios');

const MCP_SERVER_URL = 'http://localhost:3002/tool';

async function callTool(tool_name, params) {
  try {
    const response = await axios.post(`${MCP_SERVER_URL}/${tool_name}`, params);
    console.log(`Response from ${tool_name}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error calling ${tool_name}:`, error.response ? error.response.data : error.message);
  }
}

async function runTests() {
  console.log('--- Testing authentication ---');
  const auth = await callTool('authenticate', {
    email: 'testuser@example.com',
    password: 'password123'
  });

  console.log('--- Testing get_user ---');
  if (auth && auth.user) {
    await callTool('get_user', { user_id: auth.user.id });
  }

  console.log('--- Testing create_record ---');
  const created = await callTool('create_record', {
    table: 'test_table',
    record: { name: 'Test Item', description: 'Created via MCP' }
  });

  let recordId;
  if (created && created.length > 0) {
    recordId = created[0].id;
  }

  console.log('--- Testing query_data ---');
  await callTool('query_data', {
    sql: 'SELECT * FROM test_table'
  });

  console.log('--- Testing update_record ---');
  if (recordId) {
    await callTool('update_record', {
      table: 'test_table',
      record_id: recordId,
      updates: { description: 'Updated description' }
    });
  }

  console.log('--- Testing delete_record ---');
  if (recordId) {
    await callTool('delete_record', {
      table: 'test_table',
      record_id: recordId
    });
  }
}

runTests();