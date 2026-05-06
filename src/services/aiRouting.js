const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-120b:free";

export async function getAiReply(conversation) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing VITE_OPENROUTER_API_KEY in your environment.");
  }

  const model = import.meta.env.VITE_OPENROUTER_MODEL || DEFAULT_MODEL;

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: conversation,
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
