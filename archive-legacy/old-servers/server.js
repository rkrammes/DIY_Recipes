
// server.js

import express from 'express';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import 'dotenv/config';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

let supabase;
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  process.exit(1);
}

const app = express();
app.use(bodyParser.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Securely stored in .env
const OPENAI_CHAT_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4';

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.post('/api/ai-suggestion', async (req, res) => {
  console.log('Received request at /api/ai-suggestion');
  try {
    const { recipe, userPrompt } = req.body;
    if (!recipe || !userPrompt) {
      return res.status(400).json({ error: 'Missing recipe or userPrompt in request body' });
    }

    const messages = [
      { role: 'system', content: 'You are a helpful AI that suggests recipe improvements.' },
      {
        role: 'user',
        content: `Here is a recipe in JSON: ${JSON.stringify(recipe, null, 2)}
        User request: ${userPrompt}
        Suggest improvements for this recipe. Return a short summary with suggested changes.`,
      },
    ];
    
    console.log('Requesting OpenAI API with messages:', messages);
    const response = await fetch(OPENAI_CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: messages,
        max_tokens: 300,
        temperature: 0.7,
      })
    });
    
    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      res.json({ suggestion: data.choices[0].message.content.trim() });
    } else {
      console.error('OpenAI API error:', data);
      res.status(500).json({ error: 'No suggestion generated.' });
    }
  } catch (error) {
    console.error('Error fetching AI suggestion:', error);
    res.status(500).json({ error: 'An error occurred while fetching suggestion.' });
  }
});

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set correct MIME types, especially for CSS files
app.use(express.static(__dirname, {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));
app.use('/js', express.static(__dirname + '/js'));
app.use('/styles', express.static(__dirname + '/styles'));
app.use('/public', express.static(__dirname + '/public'));

// Explicitly handle style.css requests to ensure proper MIME type
app.get('/style.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.setHeader('Cache-Control', 'public, max-age=0');
  res.sendFile(__dirname + '/style.css');
});

// Alternative CSS route with a different path to avoid caching issues
app.get('/css/main.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.setHeader('Cache-Control', 'public, max-age=0');
  res.sendFile(__dirname + '/style.css');
});

// Serve retro-terminal.css with proper MIME type
app.get('/styles/retro-terminal.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.setHeader('Cache-Control', 'public, max-age=0');
  res.sendFile(__dirname + '/styles/retro-terminal.css');
});

const PORT = process.env.PORT || 3000; // Define PORT variable

// Serve formula-database.html on the root path with modified content
app.get('/', (req, res) => {
  // Use formula-database.html as the primary interface
  const formulaDbPath = path.join(__dirname, 'formula-database.html');
  const host = req.get('host');
  
  // Check if this is the production domain
  if (host && host.includes('symbolkraft.com')) {
    // For production, use the alternate CSS path and inline critical CSS
    fs.readFile(formulaDbPath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading formula-database.html:', err);
        return res.status(500).send('Error loading page');
      }
      
      // Add inline critical CSS for faster loading
      const modifiedData = data.replace(
        '</head>',
        `<style type="text/css">
        /* Critical CSS styles for initial render */
        :root {
          --terminal-text-primary: #33ff33;
          --terminal-text-secondary: #00a800;
          --terminal-text-accent: #00ff00;
          --terminal-bg-primary: #001100;
          --terminal-bg-secondary: #002200;
        }
        body {
          font-family: 'IBM Plex Mono', monospace;
          background-color: var(--terminal-bg-primary);
          color: var(--terminal-text-primary);
          margin: 0;
          height: 100%;
          width: 100%;
        }
        </style>
        </head>`
      );
      
      res.setHeader('Content-Type', 'text/html');
      res.send(modifiedData);
    });
  } else {
    // For local development, use the formula database
    res.sendFile(formulaDbPath);
  }
});

// Fallback to formula-database.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/formula-database.html');
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
