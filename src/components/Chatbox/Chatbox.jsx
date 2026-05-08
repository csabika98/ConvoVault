import { useEffect, useMemo, useRef, useState } from "react";
import * as AvatarPrimitive from "radix-ui";
import { Button } from "@/components/ui/button";
import { useSessions } from "@/context/useSessions";
import { useProfile } from "@/context/useProfile";
import { getAiReply } from "@/services/aiRouting";
import { Spinner } from "@/components/ui/spinner";
import { SendIcon } from "lucide-react";

function Chatbox({ selectedSessionId }) {
  const { sessions } = useSessions();
  const {
    assistantProfile,
    getModeForSession,
    setAiVsAiForSession,
    setHumanVsAiForSession,
  } = useProfile();

  const [message, setMessage] = useState("");
  const [messagesBySession, setMessagesBySession] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const inFlightRef = useRef(false);
  const messagesContainerRef = useRef(null);

  const sessionIds = useMemo(
    () => new Set(sessions.map((session) => String(session.id))),
    [sessions]
  );

  const sessionIdsRef = useRef(sessionIds);
  const selectedSessionKey = selectedSessionId ? String(selectedSessionId) : "";
  const hasSelectedSession = Boolean(
    selectedSessionKey && sessionIds.has(selectedSessionKey)
  );
  const activeMode = getModeForSession(selectedSessionKey);

  const activeMessages = useMemo(() => {
    if (!hasSelectedSession) return [];
    return messagesBySession[selectedSessionKey] ?? [];
  }, [messagesBySession, selectedSessionKey, hasSelectedSession]);

  useEffect(() => {
    sessionIdsRef.current = sessionIds;
  }, [sessionIds]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const frame = requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
    return () => cancelAnimationFrame(frame);
  }, [activeMessages.length, selectedSessionId]);

  async function handleSend() {
    const text = message.trim();
    if (!text || !hasSelectedSession || inFlightRef.current) return;

    const currentSessionKey = selectedSessionKey;
    const userMessage = { id: crypto.randomUUID(), content: text, role: "user" };

    setMessagesBySession((prev) => ({
      ...prev,
      [currentSessionKey]: [...(prev[currentSessionKey] ?? []), userMessage],
    }));
    setMessage("");

    inFlightRef.current = true;
    setIsLoading(true);
    try {
      const baseConversation = [
        ...(messagesBySession[currentSessionKey] ?? []).map((item) => ({
          role: item.role,
          content: item.content,
        })),
        { role: "user", content: text },
      ];

      const ai = await getAiReply(baseConversation, {
        mode: activeMode,
        assistantProfile,
      });
      if (!sessionIdsRef.current.has(currentSessionKey)) return;

      const assistantChunks = splitIntoChatBubbles(ai.content, 2);
      setMessagesBySession((prev) => ({
        ...prev,
        [currentSessionKey]: [
          ...(prev[currentSessionKey] ?? []),
          ...assistantChunks.map((chunk) => ({
            id: crypto.randomUUID(),
            content: chunk,
            role: "assistant",
            reasoningDetails: ai.reasoningDetails,
          })),
        ],
      }));
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      setMessagesBySession((prev) => ({
        ...prev,
        [currentSessionKey]: [
          ...(prev[currentSessionKey] ?? []),
          {
            id: crypto.randomUUID(),
            content: `AI request failed: ${detail}`,
            role: "assistant",
          },
        ],
      }));
      console.error(error);
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      {hasSelectedSession ? (
        <div className="mb-3 flex items-center justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant={activeMode === "ai-vs-human" ? "default" : "outline"}
            onClick={() => setHumanVsAiForSession(selectedSessionKey)}
            disabled={isLoading}
          >
            AI vs Human
          </Button>
          <Button
            type="button"
            size="sm"
            variant={activeMode === "ai-vs-ai" ? "default" : "outline"}
            onClick={() => setAiVsAiForSession(selectedSessionKey)}
            disabled={isLoading}
          >
            AI vs AI
          </Button>
        </div>
      ) : null}

      <div
        ref={messagesContainerRef}
        className="min-h-0 flex-1 overflow-auto rounded-md p-4 text-sm text-muted-foreground scroll-smooth"
      >
        {!selectedSessionId ? (
          "Select a session from History to view messages."
        ) : !hasSelectedSession ? (
          "This session was removed. Select another session."
        ) : activeMessages.length === 0 ? (
          `No messages yet for ${selectedSessionId}.`
        ) : (
          <div className="flex min-h-full flex-col justify-end gap-3">
            {activeMessages.map((item) => (
              <div
                key={item.id}
                className={`flex max-w-[85%] items-end gap-2 ${
                  item.role === "user" ? "ml-auto" : ""
                }`}
              >
                {item.role === "assistant" ? (
                  <AvatarPrimitive.Avatar.Root className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                    <AvatarPrimitive.Avatar.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                      AI
                    </AvatarPrimitive.Avatar.Fallback>
                  </AvatarPrimitive.Avatar.Root>
                ) : null}
                <div className="rounded-xl bg-muted p-3 text-sm text-gray-900">
                  {item.content}
                </div>
                {item.role === "user" ? (
                  <AvatarPrimitive.Avatar.Root className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                    <AvatarPrimitive.Avatar.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      HU
                    </AvatarPrimitive.Avatar.Fallback>
                  </AvatarPrimitive.Avatar.Root>
                ) : null}
              </div>
            ))}
            {isLoading ? (
              <div className="flex items-center gap-2">
                <AvatarPrimitive.Avatar.Root className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                  <AvatarPrimitive.Avatar.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                    AI
                  </AvatarPrimitive.Avatar.Fallback>
                </AvatarPrimitive.Avatar.Root>
                <Button variant="outline" disabled>
                  <Spinner data-icon="inline-start" />
                  Thinking
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="mt-4 flex min-w-0 shrink-0 items-end gap-2">
        <textarea
          value={hasSelectedSession ? message : ""}
          onChange={(e) => {
            if (hasSelectedSession) setMessage(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          placeholder={
            hasSelectedSession
              ? `Type a message for #${selectedSessionId}...`
              : "Select a valid session first..."
          }
          disabled={!hasSelectedSession || isLoading}
          rows={6}
          className="h-20 min-h-10 max-h-72 min-w-[320px] flex-1 resize rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <Button
          size="icon"
          type="button"
          onClick={() => void handleSend()}
          disabled={!hasSelectedSession || isLoading}
        >
          {isLoading ? <Spinner /> : <SendIcon />}
        </Button>
      </div>
    </div>
  );
}

function splitIntoChatBubbles(text, maxSentencesPerBubble) {
  const raw = String(text ?? "").trim();
  if (!raw) return [];

  const paragraphs = raw
    .split(/\n{2,}/g)
    .map((p) => p.trim())
    .filter(Boolean);

  const bubbles = [];
  for (const p of paragraphs) {
    const normalized = p.replace(/\s+/g, " ").trim();
    const sentences = normalized.split(/(?<=[.!?])\s+/g).filter(Boolean);

    if (sentences.length <= maxSentencesPerBubble) {
      bubbles.push(normalized);
      continue;
    }

    for (let i = 0; i < sentences.length; i += maxSentencesPerBubble) {
      const chunk = sentences.slice(i, i + maxSentencesPerBubble).join(" ").trim();
      if (chunk) bubbles.push(chunk);
    }
  }

  return bubbles.length > 0 ? bubbles : [raw];
}

export default Chatbox;
