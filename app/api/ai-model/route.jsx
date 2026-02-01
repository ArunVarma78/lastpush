import { QUESTIONS_PROMPT } from "@/services/Constants";
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

// Simple in-memory rate limiting (for production, use Redis or similar)
const requestTimestamps = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5; // Max 5 requests per minute per IP

function getRateLimitKey(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip") || "unknown";
  return ip;
}

function checkRateLimit(req) {
  const key = getRateLimitKey(req);
  const now = Date.now();
  const timestamps = requestTimestamps.get(key) || [];
  
  // Remove timestamps outside the window
  const validTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW);
  
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  validTimestamps.push(now);
  requestTimestamps.set(key, validTimestamps);
  return true;
}

export async function POST(req) {
  try {
    // Rate limiting check
    if (!checkRateLimit(req)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429 },
      );
    }

    // Validate API key
    if (!genAI) {
      return NextResponse.json(
        { error: "AI service is not configured" },
        { status: 500 },
      );
    }

    const body = await req.json();
    const { jobPosition, jobDescription, duration, type } = body;

    // Validate input
    if (!jobPosition || !jobDescription || !duration || !type) {
      return NextResponse.json(
        { error: "Missing required fields: jobPosition, jobDescription, duration, type" },
        { status: 400 },
      );
    }

    // Sanitize input
    const sanitizedJobPosition = String(jobPosition).trim().slice(0, 200);
    const sanitizedJobDescription = String(jobDescription).trim().slice(0, 5000);
    const sanitizedDuration = String(duration).trim();
    const sanitizedType = Array.isArray(type) ? type.join(", ") : String(type).trim();

    const FINAL_PROMPT = QUESTIONS_PROMPT.replace("{{jobTitle}}", sanitizedJobPosition)
      .replace("{{jobDescription}}", sanitizedJobDescription)
      .replace("{{duration}}", sanitizedDuration)
      .replace("{{type}}", sanitizedType);

    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: FINAL_PROMPT,
    });

    if (!result?.text) {
      throw new Error("Empty response from AI model");
    }

    const responseText = result.text;
    return NextResponse.json({ content: responseText });
  } catch (error) {
    console.error("API Route Error:", error);
    const errorMessage =
      error.message || "Failed to generate interview questions";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
