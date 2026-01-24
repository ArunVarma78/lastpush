import { FEEDBACK_PROMPT } from "@/services/Constants";
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req) {
  const { conversation } = await req.json();
  const FINAL_PROMPT = FEEDBACK_PROMPT.replace(
    "{{conversation}}",
    JSON.stringify(conversation),
  );

  try {
    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: FINAL_PROMPT,
    });

    const responseText = result.text;
    return NextResponse.json({ content: responseText });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 },
    );
  }
}
