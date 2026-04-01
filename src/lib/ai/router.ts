import { NextResponse } from 'next/server';
import { synthesizeContext } from '@/lib/ai/router';

// 🔥 Force runtime behavior (prevents build-time execution issues)
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nodes, prompt } = body;

    // Basic validation
    if (!nodes || !Array.isArray(nodes)) {
      return NextResponse.json(
        { error: 'Invalid nodes context provided' },
        { status: 400 }
      );
    }

    const insight = await synthesizeContext(
      nodes,
      prompt || 'Find connections between these thoughts.'
    );

    return NextResponse.json({ insight });
  } catch (error: unknown) {
    console.error('Synthesis error:', error);

    const message =
      error instanceof Error ? error.message : 'Failed to synthesize';

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}