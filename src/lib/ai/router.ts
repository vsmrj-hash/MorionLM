import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // ✅ Parse request body safely
    const body = await req.json();

    if (!body || typeof body.url !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid URL" },
        { status: 400 }
      );
    }

    const url = body.url.trim();

    // ✅ Extract YouTube video ID
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    );

    if (!match || !match[1]) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    const videoId = match[1];

    // ✅ Return structured response (clean + extensible)
    return NextResponse.json({
      success: true,
      type: "video",
      platform: "youtube",
      videoId,
      originalUrl: url,
      message: "Extraction successful",
    });

  } catch (err) {
    console.error("EXTRACT ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        error: String(err),
      },
      { status: 500 }
    );
  }
}