const axios = require('axios');

const SERVER_URL = 'http://localhost:3003/tool';

async function test() {
  try {
    console.log('--- Deploy Project ---');
    const deployResp = await axios.post(`${SERVER_URL}/deploy_project`, {
      projectId: 'your_project_id_here'
    });
    console.log(deployResp.data);

    const deploymentId = deployResp.data.id || 'your_deployment_id_here';

    console.log('--- Get Deployments ---');
    const listResp = await axios.post(`${SERVER_URL}/get_deployments`, {
      projectId: 'your_project_id_here',
      limit: 5
    });
    console.log(listResp.data);

    console.log('--- Get Deployment Status ---');
    const statusResp = await axios.post(`${SERVER_URL}/get_deployment_status`, {
      deploymentId
    });
    console.log(statusResp.data);

    console.log('--- Set Environment Variables ---');
    const envResp = await axios.post(`${SERVER_URL}/set_environment_variables`, {
      projectId: 'your_project_id_here',
      envVars: [
        {
          key: 'MY_ENV_VAR',
          value: 'my_value',
          target: ['production', 'preview', 'development'],
          type: 'encrypted'
        }
      ]
    });
    console.log(envResp.data);

    console.log('--- Create Preview Deployment ---');
    const previewResp = await axios.post(`${SERVER_URL}/create_preview_deployment`, {
      projectId: 'your_project_id_here'
    });
    console.log(previewResp.data);

  } catch (err) {
    console.error('Error during test:', err.response ? err.response.data : err.message);
  }
}

test();