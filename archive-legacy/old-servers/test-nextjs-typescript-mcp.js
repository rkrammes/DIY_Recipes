const axios = require('axios');

const SERVER_URL = 'http://localhost:3003/tool';

async function test() {
  try {
    console.log('Testing create_nextjs_project...');
    await axios.post(`${SERVER_URL}/create_nextjs_project`, {
      project_name: 'my-nextjs-app',
      directory: '.'
    });

    console.log('Testing create_component...');
    await axios.post(`${SERVER_URL}/create_component`, {
      project_directory: './my-nextjs-app',
      component_name: 'SampleComponent',
      output_directory: 'components'
    });

    console.log('Testing create_page...');
    await axios.post(`${SERVER_URL}/create_page`, {
      project_directory: './my-nextjs-app',
      page_name: 'sample-page'
    });

    console.log('Testing type_check...');
    await axios.post(`${SERVER_URL}/type_check`, {
      project_directory: './my-nextjs-app'
    });

    console.log('Testing analyze_types...');
    const analyzeResponse = await axios.post(`${SERVER_URL}/analyze_types`, {
      code: 'type User = { id: number; name: string };'
    });
    console.log('Analyze types response:', analyzeResponse.data);

    console.log('All tests completed.');
  } catch (error) {
    console.error('Test failed:', error.response ? error.response.data : error.message);
  }
}

test();