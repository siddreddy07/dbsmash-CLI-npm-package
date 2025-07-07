import fs from 'fs';
import path from 'path';

const root = process.env.INIT_CWD || process.cwd();

const envPath = path.join(root, '.env');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(
    envPath,
    `FOLDERS=models,schemas
AVAILABLE_DB=MongoDB Atlas,Supabase - Prisma ORM,Firebase - Firestore
GEMINI_API_KEY=
OPEN_ROUTER_MISTRAL=
MONGO_DB_URL=
FIREBASE_CREDENTIALS=file path must be inside the root as {inside backend/ root filepath/name.json}
SUPABASE_DATABASE_URL=
SUPABASE_DIRECT_URL=
`
  );
  console.log('✅ .env file created at root');
}
