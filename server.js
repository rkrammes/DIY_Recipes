// server.js
const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Securely stored in .env
const OPENAI_CHAT_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4';

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
