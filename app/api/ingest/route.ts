import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured. Add it in Vercel → Settings → Environment Variables.' },
      { status: 500 }
    );
  }

  const { url, text } = await req.json();
  const client = new Anthropic({ apiKey });

  let rawContent = text || '';
  let fetchedTitle = '';

  if (url && !text) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timer);

      if (!res.ok) {
        return NextResponse.json(
          { error: `Site returned ${res.status}. Try switching to \"Paste Text\" mode and copy-pasting the article content.` },
          { status: 400 }
        );
      }

      const html = await res.text();

      const titleMatch = html.match(/<title[^>]*>([^<]{1,120})<\/title>/i);
      fetchedTitle = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : '';

      const metaDescMatch =
        html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{1,300})["']/i) ||
        html.match(/<meta[^>]+content=["']([^"']{1,300})["'][^>]+name=["']description["']/i) ||
        html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']{1,300})["']/i) ||
        html.match(/<meta[^>]+content=["']([^"']{1,300})["'][^>]+property=["']og:description["']/i);
      const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : '';

      rawContent = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '')
        .replace(/<footer[\s\S]*?<\/footer>/gi, '')
        .replace(/<header[\s\S]*?<\/header>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();

      if (metaDesc) rawContent = `${metaDesc}\n\n${rawContent}`;
      rawContent = rawContent.slice(0, 6000);
    } catch (err: unknown) {
      const isAbort =
        err instanceof Error && (err.name === 'AbortError' || err.message.toLowerCase().includes('abort'));
      return NextResponse.json(
        {
          error: isAbort
            ? 'URL fetch timed out (10s). Switch to \"Paste Text\" mode and paste the article directly.'
            : 'Could not fetch that URL — the site may block bots. Switch to \"Paste Text\" mode and paste the content instead.',
        },
        { status: 400 }
      );
    }
  }

  if (!rawContent || rawContent.trim().length < 10) {
    return NextResponse.json(
      { error: 'No content to process. Paste some text or try a different URL.' },
      { status: 400 }
    );
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [
        {
          role: 'user',
          content: `You are a knowledge extraction assistant for a second-brain app. Extract the key knowledge from this content and return it as a structured graph node.

Source: ${url || 'pasted text'}${fetchedTitle ? `\nPage title: ${fetchedTitle}` : ''}

Content:
${rawContent.slice(0, 4000)}

Respond with ONLY valid JSON — no markdown fences, no explanation outside the JSON:
{
  "title": "clear descriptive title under 70 characters",
  "summary": "2-3 sentences capturing the core ideas and why they matter",
  "tags": ["relevant", "topic", "tags"],
  "keyPoints": ["specific key insight 1", "specific key insight 2", "specific key insight 3"]
}`,
        },
      ],
    });

    const block = message.content[0];
    if (block.type !== 'text') throw new Error('Unexpected AI response type');

    const cleaned = block.text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      title: (parsed.title as string) || fetchedTitle || 'Untitled Source',
      summary: (parsed.summary as string) || '',
      tags: Array.isArray(parsed.tags) ? (parsed.tags as string[]) : [],
      keyPoints: Array.isArray(parsed.keyPoints) ? (parsed.keyPoints as string[]) : [],
      sourceUrl: url || null,
    });
  } catch (err) {
    console.error('Ingest AI error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'AI extraction failed' },
      { status: 500 }
    );
  }
}
