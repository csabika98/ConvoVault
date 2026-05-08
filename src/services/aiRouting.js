import {
  buildAiVsAiSystemPrompt,
  SYSTEM_PROMPT_AI_VS_HUMAN,
  SYSTEM_PROMPT_AI_VS_HUMAN_PERSONA_SECTION,
} from "@/config/systemPrompt.js";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

export async function getAiReply(conversation, options = {}) {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("Missing VITE_DEEPSEEK_API_KEY in your environment.");
  }

  const model = import.meta.env.VITE_DEEPSEEK_MODEL || "deepseek-v4-pro";
  if (!model) {
    throw new Error("Missing model configuration. Set VITE_DEEPSEEK_MODEL in your environment.");
  }

  const response = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: withSystemPrompt(conversation, options),
      thinking: { type: "enabled" },
    }),
  });

  if (!response.ok) {
    let errorMessage = `Deepseek request failed (${response.status})`;
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
  const systemPrompt =
    mode === "ai-vs-ai"
      ? buildAiVsAiSystemPrompt(options?.simulationCharacters)
      : buildAiVsHumanSystemPrompt(options?.assistantProfile);

  return [
    { role: "system", content: systemPrompt },
    ...safe,
  ];
}

function buildAiVsHumanSystemPrompt(profile) {
  if (!profile) return SYSTEM_PROMPT_AI_VS_HUMAN;

  const name = String(profile?.name ?? "").trim();
  const introduction = String(profile?.introduction ?? "").trim();
  const personality = String(profile?.personality ?? "").trim();
  if (!name || !introduction || !personality) return SYSTEM_PROMPT_AI_VS_HUMAN;

  return [
    SYSTEM_PROMPT_AI_VS_HUMAN,
    "",
    applyPersonaTemplate(SYSTEM_PROMPT_AI_VS_HUMAN_PERSONA_SECTION, {
      name,
      introduction,
      personality,
    }),
  ].join("\n");
}

function applyPersonaTemplate(template, values) {
  return Object.entries(values).reduce((result, [key, value]) => {
    const token = `{{${key}}}`;
    return result.split(token).join(value);
  }, String(template ?? ""));
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
