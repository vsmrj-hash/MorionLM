import { NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ===== VALIDATION =====
    if (!body?.url || typeof body.url !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid URL" },
        { status: 400 }
      );
    }

    const url = body.url.trim();

    // ===== YOUTUBE ID EXTRACTION =====
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/i
    );

    if (!match) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    const videoId = match[1];

    // ===== TEMP TRANSCRIPT (replace later) =====
    const transcript = `
    This video discusses discipline, consistency, and long-term thinking.
    Success is built through repeated actions and identity shifts over time.
    `;

    // ===== ENV CHECK =====
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OpenAI key");
    }

    // ===== OPENAI INIT =====
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // ===== AI CALL =====
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 🔥 cheap + stable
      messages: [
        {
          role: "system",
          content:
            "Convert the content into sharp insights. No fluff. 2–3 lines max.",
        },
        {
          role: "user",
          content: transcript,
        },
      ],
    });

    const insight =
      response.choices?.[0]?.message?.content || "No insight generated.";

    // ===== RESPONSE =====
    return NextResponse.json({
      success: true,
      videoId,
      insight,
    });

  } catch (err: any) {
    console.error("EXTRACT ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Extraction failed",
      },
      { status: 500 }
    );
  }
}