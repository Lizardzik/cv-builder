import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

async function quickTest() {
  console.log("Wysyłam proste zapytanie do Gemini 3.8 Flash...");
  const start = Date.now();

  try {
    const res = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: "Odpowiedz jednym słowem: Działa",
    });

    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`Odpowiedź w ${elapsed}s:`, res.text);
  } catch (error: any) {
    console.error("Błąd API:");
    console.error("Status HTTP:", error.status);
    console.error("Wiadomość:", error.message);
  }
}

quickTest();