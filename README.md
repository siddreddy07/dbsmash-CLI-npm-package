# ⚡️ DbSmash

[![NPM Version](https://img.shields.io/npm/v/dbsmash)](https://www.npmjs.com/package/dbsmash)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green)](https://nodejs.org/)

**DbSmash** is an AI-powered CLI tool that transforms your app ideas into database schemas, models, relationships, and seeders for:

- **MongoDB (Mongoose)**
- **Firebase Firestore**
- **Supabase (via Prisma ORM)**

Describe your app in plain English, select a database, and DbSmash generates production-ready code in seconds.

## 🚀 Features

- 🔍 AI agent converts natural language prompts into schemas
- 🧩 Supports MongoDB (Mongoose), Firestore (Node.js), and Supabase (Prisma)
- 📄 Auto-generates models, seeders, and DB config files
- 🧠 Generates ER diagrams
- 🧪 Automates backend database setup

**[Checkout Website](https://dbsmash.netlify.app/)**  <--->  **[npm package](https://www.npmjs.com/package/dbsmash)**

## 📦 Installation

```bash
npm i dbsmash
```

> Requires **Node.js v18+**

## ⚙️ Environment Setup

Create a `.env` file in your project root with the necessary credentials:

```env
# Required for Firebase Firestore

FIREBASE_CREDENTIALS="../../keys.json (download from firestore and save it as keys.json inside the backend root folder)"

# Optional: MongoDB URI
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Optional: Prisma/Supabase

  Go to dashboard -> project -> projectname -> settings -> api-keys -> Click on connect on the top left
  (Inside Connection String)
SUPABASE_DATABASE_URL= Transaction pooler url
SUPABASE_DIRECT_URL= Session pooler url

# AI API Key (Gemini & OpenRouter)
GEMINI_API_KEY=your-key-here

OPEN_ROUTER_MISTRAL=your-key-here
// mistralai/mistral-small-3.2-24b-instruct:free
```

> ⚠️ **Important**: Back up your existing `.env` file before running `dbsmash`, as it may overwrite it.

## 🧑‍💻 CLI Usage

### 1. Start (Inside Backend Folder)

```bash
dbsmash
```

### 2. Provide a Prompt

Describe your app in plain English, e.g.:

```plaintext
I want an e-commerce app with users, products, and orders
```

### 3. Select a Database

Choose a database from the prompted list (MongoDB, Firestore, or Supabase).

### 4. Code Generation

DbSmash will:
- Necessary packages will be installed Automatically
- Generate schema, models, and seeders
- Create database configuration files

**Generated Files**:

```plaintext
/models/
  user.model.js
  product.model.js
  order.model.js

/config/
  dbconnection.js

/seed/
  seedUsers.js
  seedProducts.js
```

### 5. Database Initialization

After code generation, DbSmash will prompt you with database-specific commands to spin up the database. Examples:

**Supabase**:

```bash
npx prisma migrate dev
npx prisma studio
```

**MongoDB**:

```bash
node ./src/seed/sampleData.js
```

**Firebase Firestore**:

```bash
node ./src/firestore/schema.js
```

## 🧱 Project Structure

```plaintext
dbsmash/
├── lib/ai-agents/       # AI prompt parsing logic
├── models/              # Generated MongoDB or Prisma models
├── config/              # DB connection files
├── seed/                # Sample data for testing
├── server/              # Express + socket.io backend
└── index.js             # CLI entry point
```

## 🛠 Tech Stack

- 🧠 Gemini / OpenRouter (AI agent)
- 🗃 MongoDB / Firestore / Supabase
- ⚙️ Node.js
- 🧰 Prisma ORM

## 🧪 Example CLI Output

```bash
Prompt: "I want a blog app with users and posts"
→ Generating schema...
✔ users.model.js created
✔ posts.model.js created
✔ dbconnection.js created
✔ ER diagram ready
```

## 📌 Roadmap

- [x] MongoDB & Firestore support
- [x] CLI for instant schema creation
- [ ] PostgreSQL + GraphQL support
- [ ] VS Code extension
- [ ] GitHub Copilot-style schema preview

## 🤝 Contributing

Pull requests and ideas are welcome! Create an issue or open a discussion to suggest features.

## 👨‍💻 Author

Built with ❤️ by **[N Siddharth Reddy](mailto:siddharthreddy627@gmail.com)**  
Backend Developer | Node.js | MongoDB | Prisma | AI Tools

## 📄 License

This project is licensed under the **[MIT License](https://opensource.org/licenses/MIT)**.
