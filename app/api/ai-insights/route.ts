import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

interface VideoAnalysis {
  emotionalTone: string;
  bodyLanguage: string;
  speechPattern: string;
  credibilityScore: number;
  keyMoments: string[];
  demographicInsights: string;
  engagementLevel: string;
}

interface DetailedInsights {
  painPoint: string;
  bestFeature: string;
  sentiment: {
    overall: string;
    positive: number;
    negative: number;
    neutral: number;
  };
  themes: {
    usability: string;
    performance: string;
    support: string;
    pricing: string;
  };
  userSegments: {
    beginners: string[];
    advanced: string[];
    business: string[];
  };
  improvements: string[];
  competitiveAdvantages: string[];
  videoAnalysis?: VideoAnalysis;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const testimonials = formData.get('testimonials') as string;
    const formTitle = formData.get('formTitle') as string;
    const videoFile = formData.get('video') as File | null;
    let orgBusiness = formData.get('orgBusiness')

    if(!orgBusiness || orgBusiness==""){
      orgBusiness = "no specific business given"
    }

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

    let videoAnalysisPrompt = "";
    let videoPart = null;

    // Handle video analysis if video is provided
    if (videoFile) {
      const videoBuffer = await videoFile.arrayBuffer();
      const videoBase64 = Buffer.from(videoBuffer).toString('base64');
      
      videoPart = {
        //@ts-expect-error: Some error is their
        inlineData: {
          data: videoBase64,
          mimeType: videoFile.type
        }
      };

      videoAnalysisPrompt = `
      
      Additionally, analyze the provided video testimonial and include a "videoAnalysis" object with:
      - emotionalTone: Overall emotional state and authenticity
      - bodyLanguage: Posture, gestures, and non-verbal cues
      - speechPattern: Pace, clarity, enthusiasm level
      - credibilityScore: 1-10 rating of authenticity
      - keyMoments: Important timestamps or highlights
      - demographicInsights: Age group, profession, usage context
      - engagementLevel: How engaged/passionate the speaker appears
      `;
    }

    const parts = [
      {
        text: `
You are an expert product analyst and UX researcher. Analyze these testimonials for "${formTitle}" and a "${orgBusiness}" business and return valid JSON with detailed insights.

Return this exact JSON structure:
{
  "painPoint": "Primary challenge or frustration users consistently mention",
  "bestFeature": "Most praised feature or capability",
  "sentiment": {
    "overall": "positive/negative/mixed",
    "positive": 85,
    "negative": 10,
    "neutral": 5
  },
  "themes": {
    "usability": "Insights about ease of use and user experience",
    "performance": "Speed, reliability, and technical performance feedback",
    "support": "Customer service and documentation quality",
    "pricing": "Value perception and cost-related feedback"
  },
  "userSegments": {
    "beginners": ["specific feedback from new users"],
    "advanced": ["feedback from experienced users"],
    "business": ["enterprise or business-focused insights"]
  },
  "improvements": ["specific suggestions for enhancement"],
  "competitiveAdvantages": ["unique strengths vs competitors"]${videoAnalysisPrompt ? ',\n  "videoAnalysis": {\n    "emotionalTone": "...",\n    "bodyLanguage": "...",\n    "speechPattern": "...",\n    "credibilityScore": 8,\n    "keyMoments": ["..."],\n    "demographicInsights": "...",\n    "engagementLevel": "..."\n  }' : ''}
}

Testimonials: ${testimonials}
        `.trim(),
      },
    ];

    if (videoPart) {
      parts.push(videoPart);
    }

    const resp = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: [
        {
          role: "user",
          parts,
        },
      ],
    });

    // @ts-expect-error: The Google GenAI SDK response type may not accurately define the structure
    const text = resp.candidates[0].content?.parts?.[0]?.text || "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    const insights: DetailedInsights = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!insights.painPoint || !insights.bestFeature) {
      return NextResponse.json(
        { error: "Invalid structure - missing required fields", response: insights },
        { status: 500 }
      );
    }

    const testimonialCount = testimonials.split(" | ").length;
    const avgSentiment = insights.sentiment ? 
      (insights.sentiment.positive - insights.sentiment.negative) / 100 : 0;

    return NextResponse.json({
      ...insights,
      metadata: {
        analyzedCount: testimonialCount,
        hasVideoAnalysis: !!videoFile,
        videoFileName: videoFile?.name || null,
        avgSentimentScore: avgSentiment,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - Date.now(), // You can implement actual timing
      },
    });

  } catch (err) {
    console.error("Error:", err);
    
    // @ts-expect-error: Error type handling
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
    
    if (msg.includes("file size") || msg.includes("video")) {
      return NextResponse.json(
        { error: "Video file too large or unsupported format" },
        { status: 413 }
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
    features: [
      "Text testimonial analysis",
      "Video testimonial analysis",
      "Detailed sentiment analysis",
      "User segmentation",
      "Competitive insights",
      "Improvement suggestions"
    ],
    supportedVideoFormats: ["mp4", "mov", "avi", "webm"],
    maxVideoSize: "50MB",
    timestamp: new Date().toISOString(),
  });
}