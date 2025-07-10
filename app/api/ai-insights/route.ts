import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY, // your Gemini Developer API key
  // or for Vertex AI:
  // vertexai: true,
  // project: process.env.GCP_PROJECT,
  // location: process.env.GCP_LOCATION,
});

export async function POST(request: NextRequest) {
  try {
    const { testimonials, formTitle } = await request.json();

    if (!testimonials?.trim()) {
      return NextResponse.json(
        { error: "No testimonials provided" },
        { status: 400 }
      );
    }
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const resp = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
You are an expert product analyst. Analyze these testimonials for "${formTitle}" and return valid JSON:

{
  "painPoint": "...",
  "bestFeature": "..."
}

Testimonials:
${testimonials}
          `,
            },
          ],
        },
      ],
    });

    //@ts-ignore
    const text = resp.candidates[0].content?.parts?.[0]?.text || "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");

    const insights = JSON.parse(jsonMatch[0]);
    if (!insights.painPoint || !insights.bestFeature) {
      return NextResponse.json(
        { error: "Invalid structure", response: insights },
        { status: 500 }
      );
    }

    return NextResponse.json({
      painPoint: insights.painPoint,
      bestFeature: insights.bestFeature,
      analyzedCount: testimonials.split(" | ").length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Error:", err);
    const msg = err.message || "";
    if (msg.includes("Invalid API key")) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 500 });
    }
    if (msg.includes("quota")) {
      return NextResponse.json(
        { error: "API quota exceeded" },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "Failed to generate insights", details: msg },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "AI Insights API is running",
    model: "gemini-2.5-pro",
    timestamp: new Date().toISOString(),
  });
}
