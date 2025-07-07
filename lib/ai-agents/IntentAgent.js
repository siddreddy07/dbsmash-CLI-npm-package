
import dotenv from 'dotenv'
import { askOpenRouter } from '../../services/MistralApi.js';
dotenv.config()

import ora from 'ora';


export async function IntentAI(userInput, context = {}) {
  const hasContext = Object.keys(context).length > 0;

  
     const spinner = ora(`Generating Intent for userinput :${userInput}...`).start();

const prompt = `
You are IntentAgent — a database expert AI inside a CLI tool that helps users build backend systems.

🧠 User said:
${userInput}

🎯 Your job:
- Understand the user's message in the context of an ongoing project idea, if provided.
- If the user is describing a new project, extract the full app idea and generate a clear backend description.
- If the user is modifying a previous idea, update only what is necessary:
  - Respect existing structure: do NOT add new entities unless the user clearly requests it.
  - Do NOT remove or rename tables/entities unless the user explicitly says so.
  - Update relationships only when mentioned (e.g., "make product belong to category").

✅ Always write in fluent, professional English like you're documenting the system for a developer teammate.

📦 Your paragraph should:
- Explain what the app does
- Mention key entities (like Users, Orders, etc.)
- Describe relationships (e.g., one-to-many, many-to-many)
- Include user roles if present
- Focus on functionality and data flow — not on listing specific fields

📤 OUTPUT FORMAT — return ONLY valid JSON:

✅ If the project idea is clear (or being refined):
{
  "action": "SchemaAgent",
  "reason": "Updated app description based on user input.",
  "context": {
    "idea": "[short app title]",
    "description": "[natural English paragraph describing entities and relationships, based on previous context and user edits]"
  }
}

⚠️ If the user gave a command like 'add table' but hasn't described their app yet:
{
  "action": "IntentAgent",
  "reason": "Missing project idea. Ask user to describe their app first.",
  "context": {}
}

ℹ️ If the user asked what this CLI tool can do:
{
  "action": "IntentAgent",
  "reason": "User requested help. Provide guidance.",
  "context": {}
}

🛑 STRICT RULES:
- ❌ Never overwrite or regenerate the entire schema if previous context exists and user only made small changes.
- ❌ Never invent new entities or logic the user didn’t mention.
- ✅ Always treat prior context as source-of-truth and only apply the delta.
- ✅ Never return Markdown or code. Only return pure JSON.
`;


const reply = await askOpenRouter(prompt)
spinner.succeed('✅ Intent generated successfully');

  try {
        const cleanReply = reply
  .replace(/^```(json)?/, '')
  .replace(/```$/, '')
  .trim();

    return JSON.parse(cleanReply);
  } catch {
    return {
      action: 'IntentAgent',
      reason: 'Could not parse response. Ask user to explain their project again.',
      context: {}
    };
  }
}
