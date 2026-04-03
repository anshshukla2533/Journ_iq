import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

async function askGemini(message) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    contents: message,
  });

  return response.text || 'No response generated.';
}

async function askOpenAI(message) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: OPENAI_MODEL,
    input: message,
  });

  return response.output_text || 'No response generated.';
}

export async function chatWithAi(req, res) {
  try {
    const { message } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
    const reply = provider === 'openai'
      ? await askOpenAI(String(message).trim())
      : await askGemini(String(message).trim());

    return res.json({
      success: true,
      provider,
      reply,
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'AI chat failed',
    });
  }
}
