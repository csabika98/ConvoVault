import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSessions } from "@/context/sessions/useSessions";
import { useProfile } from "@/context/profile/useProfile";
import { getAiReply } from "@/services/aiRouting";
import { Spinner } from "@/components/ui/spinner";
import { SendIcon } from "lucide-react";
import Message, { AssistantAvatar } from "@/components/Chatbox/Message";

function Chatbox({ selectedSessionId }) {
  const { sessions } = useSessions();
  const {
    assistantProfile,
    isGeneratingProfile,
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
  const hasAssistantProfile = Boolean(assistantProfile);
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
    if (
      !text ||
      !hasSelectedSession ||
      !hasAssistantProfile ||
      isGeneratingProfile ||
      inFlightRef.current
    ) {
      return;
    }

    const currentSessionKey = selectedSessionKey;
    const userMessage = { id: crypto.randomUUID(), content: text, role: "user" };

    setMessagesBySession((prev) => ({
      ...prev,
      [currentSessionKey]: [...(prev[currentSessionKey] ?? []), userMessage],
    }));
    setMessage("");

    inFlightRef.current = true;
    setIsLoading(true);
    const assistantAvatar = createAssistantAvatarSnapshot(assistantProfile);
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
            assistantAvatar,
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
            assistantAvatar,
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
            disabled={isLoading || isGeneratingProfile}
          >
            AI vs Human
          </Button>
          <Button
            type="button"
            size="sm"
            variant={activeMode === "ai-vs-ai" ? "default" : "outline"}
            onClick={() => setAiVsAiForSession(selectedSessionKey)}
            disabled={isLoading || isGeneratingProfile}
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
          "No messages yet."
        ) : (
          <div className="flex min-h-full flex-col justify-end gap-3">
            {activeMessages.map((item) => (
              <Message
                key={item.id}
                role={item.role}
                content={item.content}
                assistantAvatar={item.assistantAvatar}
              />
            ))}
            {isLoading ? (
              <div className="flex items-center gap-2">
                <AssistantAvatar profile={assistantProfile} />
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
              ? "Type a message..."
              : "Select a valid session first..."
          }
          disabled={
            !hasSelectedSession ||
            !hasAssistantProfile ||
            isGeneratingProfile ||
            isLoading
          }
          rows={6}
          className="h-20 min-h-10 max-h-72 min-w-[320px] flex-1 resize rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <Button
          size="icon"
          type="button"
          onClick={() => void handleSend()}
          disabled={
            !hasSelectedSession ||
            !hasAssistantProfile ||
            isGeneratingProfile ||
            isLoading
          }
        >
          {isLoading ? <Spinner /> : <SendIcon />}
        </Button>
      </div>
    </div>
  );
}

function createAssistantAvatarSnapshot(profile) {
  if (!profile) return null;

  return {
    name: profile.name,
    avatarUrl: profile.avatarUrl,
    avatarEmoji: profile.avatarEmoji,
  };
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
