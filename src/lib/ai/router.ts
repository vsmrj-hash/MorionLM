export interface AiNodeContext {
  type?: string;
  label?: string;
  data?: { type?: string; label?: string };
}

export async function synthesizeContext(
  nodes: AiNodeContext[],
  prompt: string
) {
  // Mock synthesis delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const total = nodes.length;
  const labels = nodes.map(n => n.label || n.data?.label || "Untitled").slice(0, 3).join(", ");
  
  return `[MOCK INSIGHT] Analyzed ${total} cognitive nodes including: ${labels}. The underlying pattern suggests a convergence on "${prompt}".`;
}