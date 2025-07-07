import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("❌ GEMINI_API_KEY not found in .env");

const genAI = new GoogleGenerativeAI(apiKey);

export async function callGeminiModel(prompt) {

  console.log('Google',prompt)
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error("❌ Gemini API error:", err.message);
    throw err;
  }
}
