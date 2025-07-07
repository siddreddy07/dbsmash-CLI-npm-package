#!/usr/bin/env node

// Import basic Node.js modules
import fs from 'fs'; 
import path from 'path';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import { createRequire } from 'module'; // For checking if tools are installed
const require = createRequire(import.meta.url)
import inquirer from 'inquirer'; 

import { IntentAI } from '../lib/ai-agents/IntentAgent.js';
import { SchemaAI } from '../lib/ai-agents/SchemaAgent.js';
import { InfraAgent } from '../lib/ai-agents/InfraAgent.js';

const currentDir = process.cwd();

const srcDir = path.join(currentDir, 'src');
const libDir = path.join(srcDir, 'lib');
const envPath = path.join(currentDir, '.env');

if (!fs.existsSync(srcDir)) {
  fs.mkdirSync(srcDir);
  console.log('📁 Created "src" folder');
}
if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir);
  console.log('📁 Created "src/lib" folder');
}

dotenv.config({ path: envPath });

console.log('\n🚀 Welcome to AI Database CLI Tool!');
console.log('💡 Please describe your app (Example: "A blog where users can comment")\n');

const folders = process.env.FOLDERS?.split(',') || [];

folders.forEach((folderName) => {
  const trimmed = folderName.trim();
  const fullPath = path.join(srcDir, trimmed);

  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath);
    console.log(`📁 Created folder: src/${trimmed}`);
  }
});

async function ask(question) {
  const { answer } = await inquirer.prompt([
    { type: 'input', name: 'answer', message: question },
  ]);
  console.log(answer)
  return answer;
}

async function askToEditMermaid() {
  const { choice } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'choice',
      message: '✏️  Do you want to edit or add to the database design?',
      default: false,
    },
  ]);

  return !choice; }

const dbSetupCommands = {
  Supabase: ['npm install prisma --save-dev', 'npm install @prisma/client'],
  MongoDB_Atlas: ['npm install mongoose'],
  Firebase: ['npm install firebase-admin'],
};

function runDBSetupCommands(dbName) {
  const commands = dbSetupCommands[dbName];

  if (!commands) {
    console.log(`❌ No install commands found for ${dbName}`);
    return;
  }

  console.log(`\n🔧 Setting up ${dbName}...`);

  for (const command of commands) {
    const pkgMatch = command.match(/npm install (@?[\w\/-]+)(\s|$)/);
    const pkgName = pkgMatch ? pkgMatch[1] : null;

    if (!pkgName) {
      console.log(`❌ Couldn’t find package name in command: ${command}`);
      continue;
    }

    try {
      require.resolve(pkgName);
      console.log(`✅ ${pkgName} is already installed.`);
      continue;
    } catch {}

    try {
      console.log(`📦 Installing ${pkgName}...`);
      execSync(command, { stdio: 'inherit' });
      console.log(`✅ Installed ${pkgName}`);
    } catch (err) {
      console.log(`❌ Failed to install ${pkgName}. Skipping.`);
    }
  }
}

const dbChoices = process.env.AVAILABLE_DB?.split(',') || [];

async function promptUser(question) {
  const { choice } = await inquirer.prompt([
    { type: 'list', name: 'choice', message: question, choices: dbChoices },
  ]);
  return choice;
}

async function main() {
  try {
    const userInput = await ask('📝 Describe your app:');
    console.log('\n🤖 Generating initial database idea...');

    const intentReply = await IntentAI(userInput);
    const appDescription = intentReply?.context?.description;

    if (!appDescription) {
      console.log('❌ Could not understand your description. Try again.');
      return;
    }

    let schemaReply = await SchemaAI(appDescription);
    if (!schemaReply?.context?.mermaid) {
      console.log('❌ Could not create the schema. Try again.');
      return;
    }

    while (true) {
      const done = await askToEditMermaid();
      if (done) break;

      const editText = await ask('✏️ Enter your changes (like add/remove tables):');
      const combined = `${appDescription}. ${editText}`;

      const updatedIntent = await IntentAI(combined);
      const updatedSchema = await SchemaAI(updatedIntent.context.description);

      if (updatedSchema?.context?.mermaid) {
        schemaReply.context = updatedSchema.context;
      } else {
        console.log('❌ Failed to apply your changes. Try again.');
      }
    }
    const dbChoice = await promptUser('🗃️ Choose your database:');
    console.log(`\n✅ Selected: ${dbChoice}`);
  
    if (dbChoice.toLowerCase().includes('supabase')) {
      runDBSetupCommands('Supabase');
    } else if (dbChoice.toLowerCase().includes('mongo')) {
      runDBSetupCommands('MongoDB_Atlas');
    } else if (dbChoice.toLowerCase().includes('firebase')) {
      runDBSetupCommands('Firebase');
    } else {
      console.log('❌ This database is not supported.');
      return;
    }

    console.log('\n⚙️ Creating files and structure...');
    const infraReply = await InfraAgent(dbChoice, schemaReply.context.mermaid);

    if (infraReply) {
      console.log('\n🎉 All done! Your database code is ready Just use the Executable Tasks to spin off the Db.');
    } else {
      console.log('❌ Something went wrong while setting up the database.');
    }
  } catch (err) {
    console.error('🔥 Error:', err.message);
  } finally {
    console.log('\n👋 Finished. You can now explore your project.');
    process.exit(0);
  }
}

main();
