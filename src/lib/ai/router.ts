import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AiNodeContext {
  type?: string;
  label?: string;
  data?: { type?: string, label?: string };
}

export async function synthesizeContext(nodes: AiNodeContext[], prompt: string) {
  // Extract just the labels/types to save tokens
  const contextData = nodes.map(n => ({ type: n.type || n.data?.type, content: n.label || n.data?.label }));

  // Prioritize OpenAI if key operates
  if (process.env.OPENAI_API_KEY) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are Morion OS, a cognitive operating system. Synthesize the provided context nodes into a single profound insight. Provide a pure observation. No platitudes. Keep it concise (1-2 sentences).' },
        { role: 'user', content: `Nodes context: ${JSON.stringify(contextData)}\n\nQuery: ${prompt}` }
      ]
    });
    return response.choices[0].message.content;
  }
  
  // Fallback to Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1024,
      system: 'You are Morion OS, a cognitive operating system. Synthesize the provided context nodes into a single profound insight. Provide a pure observation. No platitudes. Keep it concise.',
      messages: [
        { role: 'user', content: `Nodes context: ${JSON.stringify(contextData)}\n\nQuery: ${prompt}` }
      ]
    });
    const block = response.content[0];
    return block.type === 'text' ? block.text : 'Insight generated.';
  }

  throw new Error("No AI providers are configured in the environment.");
}
