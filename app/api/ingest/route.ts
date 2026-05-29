import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { url, text } = await req.json();

  let rawContent = text || '';

  if (url && !text) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'MorionLM/1.0 (knowledge ingestion bot)' },
        signal: AbortSignal.timeout(8000),
      });
      const html = await res.text();
      rawContent = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 6000);
    } catch {
      return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 400 });
    }
  }

  if (!rawContent) {
    return NextResponse.json({ error: 'No content to ingest' }, { status: 400 });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `Extract and structure the key knowledge from this content into a node for a second-brain graph.

Source: ${url || 'pasted text'}

Content:
${rawContent.slice(0, 4000)}

Return ONLY valid JSON, no markdown fences:
{
  "title": "concise descriptive title (max 70 chars)",
  "summary": "2-3 sentence synthesis of the core ideas",
  "tags": ["tag1", "tag2", "tag3"],
  "keyPoints": ["key point 1", "key point 2", "key point 3"]
}`,
      }],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response');

    const cleaned = content.text.replace(/```json\n?|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json({ ...parsed, sourceUrl: url });
  } catch (error) {
    console.error('Ingest error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ingestion failed' },
      { status: 500 }
    );
  }
}
