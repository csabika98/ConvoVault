const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";

export async function getAiReply(conversation) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing VITE_OPENROUTER_API_KEY in your environment.");
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: conversation,
      reasoning: { enabled: true },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `OpenRouter request failed (${response.status})`);
  }

  const data = await response.json();
  const message = data?.choices?.[0]?.message;
  return {
    content: message?.content?.trim() || "I could not generate a response.",
    reasoningDetails: message?.reasoning_details,
  };
}
