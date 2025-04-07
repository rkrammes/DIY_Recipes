const express = require('express');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const tools = {
  create_nextjs_project: async ({ project_name, directory = '.' }) => {
    const projectPath = path.join(directory, project_name);
    execSync(`npx create-next-app@latest ${project_name} --ts`, { cwd: directory, stdio: 'inherit' });
    return { message: `Next.js TypeScript project created at ${projectPath}` };
  },

  create_component: async ({ project_directory, component_name, output_directory = 'components' }) => {
    const dirPath = path.join(project_directory, output_directory);
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    const filePath = path.join(dirPath, `${component_name}.tsx`);
    const content = `import React from 'react';

type ${component_name}Props = {};

const ${component_name}: React.FC<${component_name}Props> = (props) => {
  return <div>${component_name} component</div>;
};

export default ${component_name};
`;
    fs.writeFileSync(filePath, content);
    return { message: `Component ${component_name} created at ${filePath}` };
  },

  create_page: async ({ project_directory, page_name }) => {
    const pagesDir = path.join(project_directory, 'pages');
    if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir, { recursive: true });
    const filePath = path.join(pagesDir, `${page_name}.tsx`);
    const content = `import React from 'react';

const ${page_name} = () => {
  return <div>${page_name} page</div>;
};

export default ${page_name};
`;
    fs.writeFileSync(filePath, content);
    return { message: `Page ${page_name} created at ${filePath}` };
  },

  type_check: async ({ project_directory }) => {
    execSync('npx tsc --noEmit', { cwd: project_directory, stdio: 'inherit' });
    return { message: 'TypeScript type check completed' };
  },

  analyze_types: async ({ code }) => {
    // Basic static analysis using TypeScript compiler API is complex; placeholder response
    return { message: 'Type analysis not implemented. Provide code snippet for future analysis.' };
  }
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
  console.log('Next.js + TypeScript MCP server running on port 3003');
});