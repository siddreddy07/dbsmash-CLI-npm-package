
import fs from 'fs';
import path from 'path';
import { callGeminiModel } from '../../services/GeminiApi.js';
import ora from 'ora';

const cwd = process.cwd();

export async function SchemaAI(userInput,context) {

  
       const spinner = ora(`Generating Schema for userinput :${userInput}...`).start();

  const prompt = `
You are SchemaAgent — a CLI-based database ERD expert.

🧠 USER INPUT:
"""
${userInput}
"""

🎯 OBJECTIVE:
Generate a valid Mermaid ER diagram with proper formatting.

✅ STRICT FORMAT:
- Use 'erDiagram' to begin
- Each table must have:
  - At least 2 fields
  - SQL-like types: int, varchar(100), text, boolean, timestamp
  - Format: TableName {\n  field type PK/FK\n  ...}
- Place relationships *after* all tables
  - Format: TableA ||--o{ TableB : label

📤 RETURN ONLY THIS JSON:
\`\`\`json
{
  "action": "InfraAgent",
  "reason": "Generated Mermaid ER diagram from user input.",
  "context": {
    "mermaid": "Valid Mermaid ER diagram with actual newlines, no escaping."
  }
}
\`\`\`
`;

  try {
    const reply = await callGeminiModel(prompt);

    
    spinner.succeed('✅ Schema generated successfully');

    const cleaned = reply
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/, '')
      .trim();

    const parsed = JSON.parse(cleaned);
    const rawMermaid = parsed?.context?.mermaid;

    if (!rawMermaid) throw new Error("No mermaid field found in response");

    const mermaidPath = path.join(cwd, './src/schemas', 'mermaid.mmd');
    fs.mkdirSync(path.dirname(mermaidPath), { recursive: true });
    fs.writeFileSync(mermaidPath, rawMermaid.trim() + '\n', 'utf8');

    console.log("✅ Mermaid ER diagram saved at:", mermaidPath);
    return parsed;

  } catch (err) {
    console.error("❌ Failed to generate schema:", err.message);
    return {
      action: "CodeGenAgent",
      reason: "Failed to parse or save diagram",
      context: {}
    };
  }
}
