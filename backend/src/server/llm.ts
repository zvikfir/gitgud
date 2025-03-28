import express from 'express';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

let openai: OpenAI | null = null;
try {
  if (process.env.GITGUD_OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.GITGUD_OPENAI_API_KEY,
    });
  }
} catch (error) {
  console.warn('Failed to initialize OpenAI client:', error);
}

const router = express.Router();

router.get('/status', (req, res) => {
  res.json({ available: !!openai });
});

router.post('/transform', async (req, res) => {
  if (!openai) {
    return res.status(503).json({ error: 'LLM service not available' });
  }

  try {
    const { templateId, payload } = req.body;
    
    // Read templates
    const systemTemplatePath = path.join(__dirname, '../prompts/system.json');
    const templatePath = path.join(__dirname, '../prompts', `${templateId}.json`);
    
    const systemTemplate = JSON.parse(fs.readFileSync(systemTemplatePath, 'utf8'));
    const specificTemplate = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    
    // Compile specific template with payload
    const userTemplate = Handlebars.compile(specificTemplate.prompt);
    const userPrompt = userTemplate(payload);

    // Prepare messages array with example if available
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: systemTemplate.prompt }
    ];

    if (specificTemplate.example) {
      messages.push(
        { role: "user", content: userTemplate(specificTemplate.example.input) },
        { role: "assistant", content: JSON.stringify(specificTemplate.example.output, null, 2) }
      );
    }

    // Add current request
    messages.push({ role: "user", content: userPrompt });

    console.log('LLM System:', systemTemplate.prompt);
    console.log('LLM User:', userPrompt);

    const completion = await openai.chat.completions.create({
      model: specificTemplate.model || systemTemplate.model || "gpt-4",
      messages,
      temperature: specificTemplate.temperature || systemTemplate.temperature || 0.7,
    });

    if (!completion.choices[0].message) {
      throw new Error('No response from OpenAI');
    }

    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error('LLM Error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Failed to process LLM request' });
  }
});

export default () => router;