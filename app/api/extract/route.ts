import { NextResponse } from "next/server";

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

    return NextResponse.json({
      success: true,
      videoId: match[1],
    });

  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}