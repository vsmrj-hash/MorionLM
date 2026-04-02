import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // 🔥 TEMP: Extract video ID (YouTube only for now)
    const videoIdMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    );

    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    // 🔥 BASIC RESPONSE (replace later with transcript API)
    return NextResponse.json({
      type: "video",
      title: "YouTube Video",
      videoId,
      message: "Extraction working (basic)",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Extraction failed" },
      { status: 500 }
    );
  }
}