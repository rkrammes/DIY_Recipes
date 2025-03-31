// server.js

import express from 'express';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import 'dotenv/config';
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

app.use(express.static(__dirname)); // Serve static files from the current directory

const PORT = process.env.PORT || 3001; // Define PORT variable

app.use(express.static('public')); // Serve static files from the 'public' directory

// Serve index.html on the root path
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
