import { GoogleGenAI } from "@google/genai";

const apiKey = process.env["GEMINI_API_KEY"];

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY must be set. Did you forget to add the secret?",
  );
}

export const gemini = new GoogleGenAI({ apiKey });

export const GEMINI_MODEL = "gemini-2.5-flash";
