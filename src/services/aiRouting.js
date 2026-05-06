import { SYSTEM_PROMPT_AI_VS_AI, SYSTEM_PROMPT_AI_VS_HUMAN } from "@/config/system_prompt";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function getAiReply(conversation, options = {}) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing VITE_OPENROUTER_API_KEY in your environment.");
  }

  const model =
    import.meta.env.VITE_OPENROUTER_MODEL || import.meta.env.VITE_OPENROUTER_MODEL_DEFAULT;
  if (!model) {
    throw new Error(
      "Missing model configuration. Set VITE_OPENROUTER_MODEL or VITE_OPENROUTER_MODEL_DEFAULT in your environment."
    );
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: withSystemPrompt(conversation, options),
      reasoning: { enabled: true },
    }),
  });

  if (!response.ok) {
    let errorMessage = `OpenRouter request failed (${response.status})`;
    try {
      const errorBody = await response.json();
      const apiMessage = errorBody?.error?.message || errorBody?.message;
      if (apiMessage) errorMessage = `${apiMessage} (status ${response.status})`;
    } catch {
      const errorText = await response.text().catch(() => "");
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  const message = data?.choices?.[0]?.message;
  const text = normalizeContent(message?.content);
  return {
    content: text || "I could not generate a response.",
    reasoningDetails: message?.reasoning_details,
  };
}

function withSystemPrompt(conversation, options) {
  const safe = Array.isArray(conversation) ? conversation : [];
  const hasSystem = safe.some((m) => m && typeof m === "object" && m.role === "system");
  if (hasSystem) return safe;

  const mode = options?.mode === "ai-vs-ai" ? "ai-vs-ai" : "ai-vs-human";
  const systemPrompt = mode === "ai-vs-ai" ? SYSTEM_PROMPT_AI_VS_AI : SYSTEM_PROMPT_AI_VS_HUMAN;

  return [
    { role: "system", content: systemPrompt },
    ...safe,
  ];
}

function normalizeContent(content) {
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => {
      if (typeof part === "string") return part;
      if (part && typeof part === "object" && typeof part.text === "string") return part.text;
      return "";
    })
    .join("")
    .trim();
}
