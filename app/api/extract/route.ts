import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.url) {
      return NextResponse.json({ error: "No URL" }, { status: 400 });
    }

    const match = body.url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/i
    );

    if (!match) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const videoId = match[1];

    // 🔥 TEMP MOCK (until we fetch real transcript)
    const fakeTranscript = `
    This video talks about discipline, consistency, and long-term thinking.
    Success is built through repeated actions and clarity of purpose.
    `;

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OpenAI key");
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const ai = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Convert the following content into structured insights and thinking nodes. Be sharp, no fluff.",
        },
        {
          role: "user",
          content: fakeTranscript,
        },
      ],
    });

    return NextResponse.json({
      success: true,
      videoId,
      insight: ai.choices[0].message.content,
    });

  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}