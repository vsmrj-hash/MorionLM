import { NextResponse } from "next/server";
import { synthesizeContext } from "@/lib/ai/router";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body || !Array.isArray(body.nodes)) {
      return NextResponse.json(
        { error: "Invalid nodes input" },
        { status: 400 }
      );
    }

    const prompt =
      body.prompt || "Find meaningful connections between these thoughts.";

    const result = await synthesizeContext(body.nodes, prompt);

    return NextResponse.json({
      success: true,
      insight: result,
    });
  } catch (err) {
    console.error("SYNTHESIS ERROR:", err);

    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}