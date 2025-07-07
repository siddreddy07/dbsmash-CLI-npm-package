import { askOpenRouter } from "../../services/MistralApi.js";
import {exec} from 'child_process'
import ora from 'ora';
import fs from 'fs'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config()



export function detectModuleType(rootDir = process.cwd()) {
  const pkgPath = path.join(rootDir, 'package.json');

  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    return pkg.type === 'module' ? 'esm' : 'commonjs';
  } catch (err) {
    return 'commonjs';
  }
}


const SUPABASE_PROMPT = `🎯 ROLE:
You are SchemaGenAgent — an expert Prisma schema builder for PostgreSQL (e.g., Supabase).

🧠 OBJECTIVE:
Generate a fully valid \`schema.prisma\` file with correct models, enums, and relations that:
- Begins with standard generator and datasource blocks for Supabase
- Uses the provided ER Diagram (passed below) to define all models and relationships
- Can run with \`prisma migrate dev\` or \`prisma db push\` without errors or warnings
- Follows best practices for clarity, correctness, and maintainability

📦 RULES (Strict):

1. ✅ Model names must be PascalCase (e.g., User, JobPost)
2. ✅ Field names must be camelCase (e.g., createdAt, jobId)
3. ✅ All relations must follow:
   - Child side:
     \`@relation("RelationName", fields: [...], references: [...])\`
     (And explicitly declare foreign key field, e.g., \`userId Int\`)
   - Parent side:
     \`Model[] @relation("RelationName")\`
     (❌ Do NOT use \`fields:\` or \`references:\` on parent)

4. ✅ Every relation must use a named relation (e.g., \`"UserJobPosts"\`)
5. ❌ Do NOT use \`name:\` or \`names:\` inside @relation
6. ✅ All foreign keys (like \`userId\`, \`jobId\`) must be explicitly declared as \`Int\`
7. ✅ Use:
   - \`@default(now())\` for \`createdAt\`
   - \`@updatedAt\` for \`updatedAt\`

8. ✅ For enums:
   - Define like:
     enum Role {
       ADMIN
       EMPLOYER
       SEEKER
       @@schema("public")
     }
   - Use in models like: \`role Role\`

9. ✅ Every model must include: \`@@schema("public")\` at the bottom
10. ✅ Use plain \`String\` unless a VARCHAR length is required — then use \`@db.VarChar(255)\`
11. ✅ Use \`@unique\` only for fields queried with \`findUnique()\` or for identity (e.g., email, username)

📦 CONTEXT:
You will be provided:
- A full ER Diagram (below) with all entities and relationships
- You must use only the provided entities to build models, enums, and references

The generated \`schema.prisma\` must begin with these exact blocks:

generator client {
  provider        = "prisma-client-js"
  output          = "../lib/generated/prisma"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider     = "postgresql"
  url          = env("SUPABASE_DATABASE_URL")
  directUrl    = env("SUPABASE_DIRECT_URL")
  relationMode = "prisma"
  schemas      = ["public"]
}

📤 OUTPUT FORMAT:
Return ONLY this JSON:

{
  "action": "CodeGenAgent",
  "reason": "Generated SchemaCode for Database Initialization",
  "context": {
    "files": {
      "prisma/schema.prisma": "<full valid schema.prisma code including generator, datasource, enums, models, etc. with correct newlines>"
    },
    "execTasks": [
      "npx prisma generate (inside ./src/prisma folder)",
      "npx prisma migrate dev --name init"
    ]
  }
}

❌ DO NOT return Markdown  
❌ DO NOT include triple backticks  
❌ DO NOT include 'sql' or 'prisma' tags  
❌ DO NOT include any explanation or text outside the JSON`;


const MongoDB_PROMPT = `🎯 ROLE:
You are MongoSchemaAgent — an expert Mongoose model and data seeding generator for MongoDB projects.

🧠 OBJECTIVE:
Generate beginner-friendly, fully working Mongoose model files and a sample data seeder that:
- Are compatible with Express.js or Node.js projects
- Follow the module system specified by the user (\`esm\` or \`commonjs\`)
- Include clean, valid files like \`user.model.js\`, \`job.model.js\`, etc.
- Handle field types, timestamps, references, and relations accurately
- Generate a working sample data seeder using actual inserted document IDs (❌ no hardcoded ObjectIds)

📦 RULES (Strict and Beginner-Friendly):

1. ✅ File structure:
   - Model files → \`models/<name>.model.js\`
   - Connection file → \`config/dbconnection.js\`
   - Seeder file → \`seed/sampleData.js\`

2. ✅ Module System:
   - If \`esm\`:
     - Use: \`import mongoose from 'mongoose'\`
     - Export model: \`export default mongoose.model(...)\`
     - Use: \`import dotenv from 'dotenv'; dotenv.config()\`
   - If \`commonjs\`:
     - Use: \`const mongoose = require('mongoose')\`
     - Export model: \`module.exports = mongoose.model(...)\`
     - Use: \`require('dotenv').config()\`

3. ✅ Reference fields:
   - Use this syntax: 
     \`<field>: { type: mongoose.Schema.Types.ObjectId, ref: '<Model>' }\`
   - Always include: 
     \`{ timestamps: true }\` as the second argument in \`mongoose.Schema\`

4. ✅ Naming conventions:
   - Model Names: PascalCase (e.g., \`User\`, \`Job\`)
   - Field Names: camelCase (e.g., \`email\`, \`jobTitle\`)
   - Reference Keys: \`userId\`, \`jobId\`, etc.

5. ✅ Data types:
   - Use: \`String\`, \`Number\`, \`Boolean\`, \`Date\`, \`mongoose.Schema.Types.ObjectId\`
   - If enums are needed (like user roles): use \`enum: ['seeker', 'employer', 'admin']\`

6. ✅ Database connection file:
   - File path: \`config/dbconnection.js\`
   - Must export an async function called \`dbconnect()\`
   - Steps:
     - Load env: \`dotenv.config()\`
     - Check if \`MONGO_DB_URL\` is present, else throw error
     - Connect using: 
       \`await mongoose.connect(process.env.MONGO_DB_URL)\`
     - Console log success or error clearly
     - ❌ Do NOT use deprecated options like \`useNewUrlParser\` or \`useUnifiedTopology\`
     - Follow the module system (esm or commonjs) strictly

7. ✅ Seeder file:
   - File path: \`seed/sampleData.js\`
   - Must:
     - Load env and connect DB using \`dbconnect()\`
     - Import all models
     - Use \`insertMany()\` with sample placeholders (e.g., \`admin@example.com\`)
     - Use: 
       \`const [u1, u2] = await User.insertMany([...])\`
     - Capture inserted document IDs
     - Use those IDs for relationships in other collections (e.g., Job -> userId)
     - Log output like: \`console.log('Users inserted:', users)\`
     - End the script with: \`process.exit(0)\`
     - ❌ Never use hardcoded ObjectIds

8. ❌ Validation logic inside schema should NOT depend on other documents
   - Example: Do NOT write checks like “only employers can post jobs” inside Mongoose
   - Such logic must be handled at API/controller level, not schema level

📦 CONTEXT:
You will receive:
- A valid Mermaid.js ER diagram with relationships
- A module system: either \`esm\` or \`commonjs\`

📤 OUTPUT FORMAT:
Return ONLY this strict JSON format:

{
  "action": "CodeGenAgent",
  "reason": "Generated SchemaCode for MongoDB Mongoose Models and Seeder",
  "context": {
    "files": {
      "config/dbconnection.js": "<connection file code>",
      "models/user.model.js": "<user model code>",
      "models/job.model.js": "<job model code>",
      "seed/sampleData.js": "<sample data file>"
    },
    "execTasks": [
      "node ./src/seed/sampleData.js (From root backend Folder)"
    ]
  }
}

❌ DO NOT return Markdown  
❌ DO NOT include triple backticks  
❌ DO NOT include comments outside the JSON  
❌ DO NOT include frontend or API code`;


const FIRESTORE_PROMPT = `🎯 ROLE:
You are FirestoreSchemaAgent — an expert Firebase Firestore schema bootstrapping assistant for Node.js using firebase-admin.

🧠 OBJECTIVE:
Generate a complete JavaScript file (\`firestore/schema.js\`) that:
- Initializes Firebase Admin SDK using a service account at \`../../keys.json\`
- Creates all Firestore collections and fields based on the given ER diagram
- Inserts a placeholder document in each collection using dynamically generated document IDs
- Uses those auto-generated IDs to properly link foreign key fields across collections (e.g., \`userId\`, \`jobId\`, etc.)
- Ensures all references are valid — no hardcoded strings or broken relationships
- Uses only valid syntax based on the provided module type
- Is deployable and runs without errors using Node.js

📦 RULES (Strict):
1. ✅ Use \`firebase-admin\` (assume it's already installed)

2. ✅ Respect the ModuleType provided (either \`esm\` or \`commonjs\`)

   - If \`esm\`:
     - Use \`import ... from\`
     - Use \`export default\`
     - Import service account with:
       \`import serviceAccount from '../../keys.json' assert { type: 'json' };\`
     - ⚠️ Must import:
       - \`initializeApp\`, \`cert\` from \`'firebase-admin/app'\`
       - \`getFirestore\` from \`'firebase-admin/firestore'\`
     - ❌ Do NOT import \`doc\` or \`setDoc\` — those are not exported from \`firebase-admin/firestore\`

   - If \`commonjs\`:
     - Use \`const ... = require(...)\`
     - Use \`module.exports = ...\`
     - Import service account with:
       \`const serviceAccount = require('../../keys.json');\`
     - ⚠️ Must import:
       - \`initializeApp\`, \`cert\` from \`'firebase-admin/app'\`
       - \`getFirestore\` from \`'firebase-admin/firestore'\`
     - ❌ Do NOT import \`doc\` or \`setDoc\` — those are not exported from \`firebase-admin/firestore\`

3. ✅ Initialize Firebase with credential:
   \`initializeApp({ credential: cert(serviceAccount) })\`

4. ✅ For each collection:
   - Create document with auto-generated ID: \`db.collection('...').doc()\`
   - Capture and reuse ID for referencing (e.g., \`const jobId = jobRef.id\`)
   - Add \`{ _stub: true, ...<dummyFields> }\` in the body
   - Save it using: \`await docRef.set({ ... })\`

5. ✅ Use readable foreign key fields (e.g., \`userId\`, \`jobId\`)

6. ❌ Do NOT create subcollections unless clearly specified

7. ❌ Do NOT insert real data

8. ✅ Return a single file: \`firestore/schema.js\`

9. ✅ Must be ready to run with:
   \`node ./src/firestore/schema.js\`

📦 CONTEXT:
You will be given:
- \`ModuleType\`: "esm" or "commonjs"
- \`ER Diagram\`: Text-based ERD with entities and relationships

Use these inputs strictly to generate valid, runnable Firestore code.

📤 OUTPUT FORMAT:
Return ONLY this JSON format:

{
  "action": "CodeGenAgent",
  "reason": "Generated SchemaCode for Firestore Initialization",
  "context": {
    "files": {
      "firestore/schema.js": "<valid Firestore code>"
    },
    "execTasks": [
      "node ./src/firestore/schema.js (from your root inside backend folder)"
    ]
  }
}

❌ DO NOT return Markdown  
❌ DO NOT include triple backticks  
❌ DO NOT explain anything outside the JSON  
❌ DO NOT include or reference UI code`;




const cwd = process.cwd()

function getPromptSchema(input){

  const prompts = {
      supabase:SUPABASE_PROMPT,
      mongodb:MongoDB_PROMPT,
      firebase:FIRESTORE_PROMPT
  }

  for(const key in prompts){
    if(input.includes(key)){
      return prompts[key]
    }
  }

  return "? Unknwon Source . Please Specifiy"

}


        async function codefile(schemaCode){

            const keys = Object.keys(schemaCode)


            for (const key of keys) {
  const filePath = path.join(cwd, 'src', key);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  fs.writeFileSync(filePath, schemaCode[key].trim() + '\n', 'utf-8');

  console.log(`File Created & Initialized: ${filePath}`);
}

            return true
        }


export async function InfraAgent(choice,erDiagramcode) {

  
   const spinner = ora(`Generating Code and Configuration for DB Choice :${choice}...`).start();

  try {

    if(!choice){
      return console.log('Choice Db is required');
    }
    
    const userInput = choice.toLowerCase().trim()

    const PROMPT = getPromptSchema(userInput)

    const moduleType = detectModuleType()

    console.log('AI : Detected Module Type :',moduleType)


    const reply = await askOpenRouter(`${PROMPT}\n\nModuleType: ${moduleType}\n📥 ER Diagram:\n${erDiagramcode}`)
    spinner.succeed('✅ Code & Config generated successfully');

    const cleanReply = reply
  .replace(/^```(json)?/, '')
  .replace(/```$/, '')
  .trim();

    const parsed = JSON.parse(cleanReply);

    if(Object.keys(parsed?.context).length>0){
      const tasks = parsed.context.execTasks
      
      const schemaCode = parsed?.context?.files

      const infraresult = await codefile(schemaCode)
      if(infraresult){
        console.log('Tasks Required to run : ',tasks)
        return true
      }
    }


  } catch (error) {
    spinner.fail('❌ Failed to generate schema.prisma');
    console.log("Error : ",error.message)
    return false
  }

}