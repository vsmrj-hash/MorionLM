import OpenAI from "openai";

export interface AiNodeContext {
  type?: string;
  label?: string;
  data?: { type?: string; label?: string };
}

// ✅ ONLY THIS FUNCTION EXISTS HERE
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

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are Morion OS, a cognitive operating system. Synthesize the provided context nodes into a single profound insight. No fluff. 1-2 sharp sentences.",
      },
      {
        role: "user",
        content: `Nodes: ${JSON.stringify(contextData)}\n\nQuery: ${prompt}`,
      },
    ],
  });

  return response.choices[0]?.message?.content || "No insight generated.";
}