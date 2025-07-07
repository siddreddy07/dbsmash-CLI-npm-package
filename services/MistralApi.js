import OpenAI from 'openai';

import dotenv from 'dotenv'

dotenv.config()

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPEN_ROUTER_MISTRAL,
});

export async function askOpenRouter(prompt) {

  try {
    const completion = await openai.chat.completions.create({
      model: "mistralai/mistral-small-3.2-24b-instruct:free",
      messages: [
        {
          role: "user",
          content:prompt
        }
      ],
    });


    return completion.choices[0]?.message?.content ?? null;
  } catch (err) {
    console.error("❌ OpenRouter error:", err.message);
    return null;
  }
}
