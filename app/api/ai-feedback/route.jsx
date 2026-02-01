import { FEEDBACK_PROMPT } from "@/services/Constants";
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

// Simple in-memory rate limiting
const requestTimestamps = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3; // Max 3 requests per minute per IP

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
    const { conversation } = body;

    // Validate input
    if (!conversation) {
      return NextResponse.json(
        { error: "Missing required field: conversation" },
        { status: 400 },
      );
    }

    // Validate conversation is not empty
    let conversationData;
    try {
      conversationData =
        typeof conversation === "string" ? JSON.parse(conversation) : conversation;
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid conversation format" },
        { status: 400 },
      );
    }

    if (!conversationData || Object.keys(conversationData).length === 0) {
      return NextResponse.json(
        { error: "Conversation data is empty" },
        { status: 400 },
      );
    }

    const FINAL_PROMPT = FEEDBACK_PROMPT.replace(
      "{{conversation}}",
      JSON.stringify(conversationData),
    );

    try {
      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: FINAL_PROMPT,
      });

      // Handle different response formats from Gemini
      let responseText = "";
      
      // Try different ways to access the text based on SDK version
      if (result?.text) {
        // Direct text property (most common)
        responseText = result.text;
      } else if (typeof result?.response?.text === "function") {
        // If text is a method
        responseText = result.response.text();
      } else if (result?.response?.text) {
        // If text is a property
        responseText = result.response.text;
      } else if (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        // Nested structure
        responseText = result.response.candidates[0].content.parts[0].text;
      } else if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
        // Alternative nested structure
        responseText = result.candidates[0].content.parts[0].text;
      } else if (typeof result === "string") {
        responseText = result;
      } else {
        // Log the actual structure for debugging
        console.error("Unexpected response format:", JSON.stringify(result, null, 2).substring(0, 1000));
        throw new Error("Unexpected response format from AI model");
      }

      if (!responseText || responseText.trim().length === 0) {
        console.error("Empty response text. Full result:", JSON.stringify(result, null, 2).substring(0, 500));
        throw new Error("Empty response from AI model");
      }

      return NextResponse.json({ content: responseText });
    } catch (genError) {
      console.error("Gemini API Error Details:", {
        message: genError.message,
        stack: genError.stack,
        name: genError.name
      });
      
      // Return a fallback response structure if Gemini fails
      const fallbackResponse = {
        feedback: {
          rating: {
            technicalSkills: 5,
            communication: 5,
            problemSolving: 5,
            experience: 5,
          },
          summary: [
            "Interview completed successfully.",
            "Feedback generation encountered an issue.",
            "Please review the conversation manually.",
          ],
          recommendation: "No",
          recommendationMsg: "Unable to generate automated feedback. Manual review recommended.",
        },
      };
      return NextResponse.json({ 
        content: JSON.stringify(fallbackResponse),
        warning: "Fallback response used due to AI model error"
      });
    }
  } catch (error) {
    console.error("API Route Error:", error);
    const errorMessage = error.message || "Failed to generate feedback";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
