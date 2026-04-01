import OpenAI from 'openai';

export interface AiNodeContext {
  type?: string;
  label?: string;
  data?: { type?: string; label?: string };
}

export async function synthesizeContext(
  nodes: AiNodeContext[],
  prompt: string
) {
  const contextData = nodes.map((n) => ({
    type: n.type || n.data?.type,
    content: n.label || n.data?.label,
  }));

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  // ✅ Initialize ONLY inside function (critical fix)
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'You are Morion OS, a cognitive operating system. Synthesize the provided context nodes into a single profound insight. Provide a pure observation. No platitudes. Keep it concise (1-2 sentences).',
      },
      {
        role: 'user',
        content: `Nodes context: ${JSON.stringify(
          contextData
        )}\n\nQuery: ${prompt}`,
      },
    ],
  });

  return response.choices[0].message.content;
}