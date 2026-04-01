import { NextResponse } from 'next/server';
import { synthesizeContext } from '@/lib/ai/router';

export async function POST(req: Request) {
  try {
    const { nodes, prompt } = await req.json();
    
    if (!nodes || !Array.isArray(nodes)) {
      return NextResponse.json({ error: 'Invalid nodes context provided' }, { status: 400 });
    }

    const insight = await synthesizeContext(nodes, prompt || 'Find connections between these thoughts.');

    return NextResponse.json({ insight });
  } catch (error: unknown) {
    console.error('Synthesis error:', error);
    const message = error instanceof Error ? error.message : 'Failed to synthesize';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
