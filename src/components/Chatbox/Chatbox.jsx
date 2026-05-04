import { useEffect, useMemo, useRef, useState } from "react";
import * as AvatarPrimitive from "radix-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSessions } from "@/context/SessionsContext";
import { getAiReply } from "@/services/aiRouting";
import { Spinner } from "@/components/ui/spinner"

function Chatbox({ selectedSessionId }) {
  const { sessions } = useSessions();
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
  const hasSelectedSession = Boolean(selectedSessionKey && sessionIds.has(selectedSessionKey));

  const activeMessages = useMemo(() => {
    if (!hasSelectedSession) return [];
    return messagesBySession[selectedSessionKey] ?? [];
  }, [messagesBySession, selectedSessionKey, hasSelectedSession]);

  useEffect(() => {
    sessionIdsRef.current = sessionIds;
  }, [sessionIds]);

  useEffect(() => {
    setMessagesBySession((prev) => {
      const next = {};
      let changed = false;

      for (const [sessionId, messages] of Object.entries(prev)) {
        if (sessionIds.has(sessionId)) {
          next[sessionId] = messages;
        } else {
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [sessionIds]);

  useEffect(() => {
    if (!hasSelectedSession) {
      setMessage("");
    }
  }, [hasSelectedSession]);

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

      const ai = await getAiReply(baseConversation);
      if (!sessionIdsRef.current.has(currentSessionKey)) return;
      setMessagesBySession((prev) => ({
        ...prev,
        [currentSessionKey]: [
          ...(prev[currentSessionKey] ?? []),
          {
            id: crypto.randomUUID(),
            content: ai.content,
            role: "assistant",
            reasoningDetails: ai.reasoningDetails,
          },
        ],
      }));
    } catch (error) {
      setMessagesBySession((prev) => ({
        ...prev,
        [currentSessionKey]: [
          ...(prev[currentSessionKey] ?? []),
          {
            id: crypto.randomUUID(),
            content: "AI request failed. Check your OpenRouter key/config.",
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
      <div
        ref={messagesContainerRef}
        className="min-h-0 flex-1 overflow-auto rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground"
      >
        {!selectedSessionId ? (
          "Select a session from History to view messages."
        ) : !hasSelectedSession ? (
          "This session was removed. Select another session."
        ) : activeMessages.length === 0 ? (
          `No messages yet for ${selectedSessionId}.`
        ) : (
          <div className="flex min-h-full flex-col justify-end gap-2">
            {activeMessages.map((item) => (
              <div
                key={item.id}
                className={`flex max-w-[85%] items-end gap-2 ${
                  item.role === "user" ? "ml-auto" : ""
                }`}
              >
                {item.role === "assistant" ? (
                  <AvatarPrimitive.Avatar.Root className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
                    <AvatarPrimitive.Avatar.Image
                      className="aspect-square h-full w-full"
                      src=""
                      alt="Assistant avatar"
                    />
                    <AvatarPrimitive.Avatar.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                      AI
                    </AvatarPrimitive.Avatar.Fallback>
                  </AvatarPrimitive.Avatar.Root>
                ) : null}
                <Card className={`w-fit ${item.role === "user" ? "bg-muted" : "bg-card"}`}>
                  <CardContent className={`px-3 py-2 text-foreground ${item.role === "user" ? "text-right" : "text-left"}`}>
                    {item.content}
                  </CardContent>
                </Card>
                {item.role === "user" ? (
                  <AvatarPrimitive.Avatar.Root className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
                    <AvatarPrimitive.Avatar.Image
                      className="aspect-square h-full w-full"
                      src=""
                      alt="Human avatar"
                    />
                    <AvatarPrimitive.Avatar.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      HU
                    </AvatarPrimitive.Avatar.Fallback>
                  </AvatarPrimitive.Avatar.Root>
                ) : null}
              </div>
            ))}
            {isLoading ? (
              <div className="flex items-end gap-2">
                <AvatarPrimitive.Avatar.Root className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
                  <AvatarPrimitive.Avatar.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                    AI
                  </AvatarPrimitive.Avatar.Fallback>
                </AvatarPrimitive.Avatar.Root>
                <Button variant="outline" disabled>
                  <Spinner data-icon="inline-start" />
                  Generating
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>
      <div className="mt-4 flex min-w-0 shrink-0 items-end gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          placeholder={
            hasSelectedSession
              ? `Type a message for ${selectedSessionId}...`
              : "Select a valid session first..."
          }
          disabled={!hasSelectedSession || isLoading}
          rows={6}
          className="min-h-32 max-h-72 min-w-[320px] flex-1 resize rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <Button type="button" onClick={() => void handleSend()} disabled={!hasSelectedSession || isLoading}>
          {isLoading ? "..." : "Send"}
        </Button>
      </div>
    </div>
  );
}

export default Chatbox;
