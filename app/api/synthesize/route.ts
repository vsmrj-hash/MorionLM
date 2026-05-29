import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

interface NodeInput {
  label: string;
  type: string;
  content?: string;
  tags?: string[];
}

const MODE_PROMPTS: Record<string, (ctx: string, query: string) => string> = {
  ask: (ctx, q) => `Question: "${q || 'What patterns emerge from these thoughts?'}"

Knowledge nodes:
${ctx}

Answer using these nodes as your knowledge base. Cite specific nodes as [Node 1], [Node 2], etc. Be direct and insight-dense.`,

  patterns: (ctx) => `Analyze these nodes and surface cognitive/behavioral patterns the user can't see themselves.

Nodes:
${ctx}

Be specific and brutally honest. Surface contradictions, feedback loops, and blind spots. Ground every claim in the actual nodes.`,

  study_guide: (ctx) => `Generate a structured study guide from these knowledge nodes.

Nodes:
${ctx}

Format:
## Core Concepts
## Key Relationships
## What to Explore Deeper
## Open Questions

Ground everything in the actual nodes.`,

  faq: (ctx) => `Generate 8-10 sharp Q&A pairs that capture the essence of these knowledge nodes.

Nodes:
${ctx}

Make the questions non-obvious — things someone should ask but probably wouldn't.`,

  connections: (ctx) => `Map the deep connections between these nodes. Find non-obvious bridges, opposites, and emergent ideas.

Nodes:
${ctx}

Output a structured relationship map. Use **bold** for key connection types.`,

  podcast: (ctx) => `Write a 400-word podcast dialogue between two hosts exploring these ideas.
Host A asks sharp questions. Host B synthesizes answers from the nodes.

Nodes:
${ctx}`,
};

export async function POST(req: NextRequest) {
  const { nodes, query, mode = 'ask' } = await req.json();

  if (!nodes || nodes.length === 0) {
    return NextResponse.json({ error: 'No nodes provided' }, { status: 400 });
  }

  const nodeContext = (nodes as NodeInput[])
    .map((n, i) =>
      `[Node ${i + 1}] (${n.type || 'thought'}) ${n.label}${
        n.content && n.content !== n.label ? '\n  ' + n.content : ''
      }${
        n.tags?.length ? '\n  Tags: ' + n.tags.join(', ') : ''
      }`
    )
    .join('\n\n');

  const promptFn = MODE_PROMPTS[mode] ?? MODE_PROMPTS.ask;
  const userPrompt = promptFn(nodeContext, query);

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system:
        'You are the cognitive core of MorionLM — a personal second brain that fuses Obsidian\'s knowledge graph with NotebookLM\'s AI synthesis. Help users see what they can\'t see in their own thinking. Be sharp, cite sources, use markdown formatting.',
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 });
    }

    return NextResponse.json({ result: content.text, mode, nodeCount: nodes.length });
  } catch (error) {
    console.error('Synthesis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Synthesis failed' },
      { status: 500 }
    );
  }
}
