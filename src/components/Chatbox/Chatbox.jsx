import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSessions } from "@/context/sessions/useSessions";
import { useCharacters } from "@/context/characters/useCharacters";
import { useProfile } from "@/context/profile/useProfile";
import { getAiReply } from "@/services/aiRouting";
import { Spinner } from "@/components/ui/spinner";
import { SendIcon } from "lucide-react";
import Message, { AssistantAvatar } from "@/components/Chatbox/Message";

function Chatbox({ selectedSessionId }) {
  const { sessions } = useSessions();
  const { simulationRequest } = useCharacters();
  const {
    assistantProfile,
    isGeneratingProfile,
    userAvatarUrl,
    getModeForSession,
    setAiVsAiForSession,
    setHumanVsAiForSession,
  } = useProfile();

  const [message, setMessage] = useState("");
  const [messagesBySession, setMessagesBySession] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const inFlightRef = useRef(false);
  const handledSimulationRequestIdRef = useRef(null);
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
  const loadingAssistantAvatar =
    activeMode === "ai-vs-ai" && simulationRequest?.participants?.[0]
      ? createSimulationAvatarSnapshot(
          simulationRequest.participants[0].name,
          simulationRequest.participants
        )
      : assistantProfile;

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

  async function runSimulation(request, sessionKey) {
    const participants = Array.isArray(request?.participants)
      ? request.participants.filter((participant) =>
          String(participant?.name ?? "").trim()
        )
      : [];
    if (participants.length < 2 || inFlightRef.current) return;

    const startedAt = Date.now();
    const maxDurationMs = 60_000;
    const maxTurns = 12;
    const conversation = [];

    inFlightRef.current = true;
    setIsLoading(true);
    setIsSimulationRunning(true);

    try {
      for (let turn = 0; turn < maxTurns; turn += 1) {
        if (Date.now() - startedAt >= maxDurationMs) break;
        if (!sessionIdsRef.current.has(sessionKey)) return;

        const instruction =
          turn === 0
            ? "Start the AI-vs-AI simulation. Pick the first speaker and open with a concrete, conversational message."
            : "Continue the AI-vs-AI simulation with the next natural chat message.";

        const ai = await getAiReply(
          [...conversation, { role: "user", content: instruction }],
          {
            mode: "ai-vs-ai",
            simulationCharacters: participants,
          }
        );
        if (!sessionIdsRef.current.has(sessionKey)) return;

        const nextMessage = parseSimulationMessage(ai.content, participants, turn);
        const assistantAvatar = createSimulationAvatarSnapshot(
          nextMessage.speaker,
          participants
        );
        const content = nextMessage.message;

        setMessagesBySession((prev) => ({
          ...prev,
          [sessionKey]: [
            ...(prev[sessionKey] ?? []),
            {
              id: crypto.randomUUID(),
              content,
              role: "assistant",
              assistantAvatar,
              reasoningDetails: turn === 0 ? ai.reasoningDetails : undefined,
            },
          ],
        }));

        conversation.push({
          role: "assistant",
          content: `${nextMessage.speaker}: ${nextMessage.message}`,
        });

        if (turn < maxTurns - 1 && Date.now() - startedAt < maxDurationMs) {
          await wait(2_500);
        }
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      setMessagesBySession((prev) => ({
        ...prev,
        [sessionKey]: [
          ...(prev[sessionKey] ?? []),
          {
            id: crypto.randomUUID(),
            content: `AI simulation failed: ${detail}`,
            role: "assistant",
          },
        ],
      }));
      console.error(error);
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
      setIsSimulationRunning(false);
    }
  }

  useEffect(() => {
    if (!simulationRequest) return;
    if (handledSimulationRequestIdRef.current === simulationRequest.id) return;
    if (!hasSelectedSession || activeMode !== "ai-vs-ai") return;

    handledSimulationRequestIdRef.current = simulationRequest.id;
    const timeout = setTimeout(() => {
      void runSimulation(simulationRequest, selectedSessionKey);
    }, 0);
    return () => clearTimeout(timeout);
  }, [activeMode, hasSelectedSession, selectedSessionKey, simulationRequest]);

  async function handleSend() {
    const text = message.trim();
    if (
      !text ||
      !hasSelectedSession ||
      activeMode === "ai-vs-ai" ||
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
      for (const [index, chunk] of assistantChunks.entries()) {
        setMessagesBySession((prev) => ({
          ...prev,
          [currentSessionKey]: [
            ...(prev[currentSessionKey] ?? []),
            {
              id: crypto.randomUUID(),
              content: chunk,
              role: "assistant",
              assistantAvatar,
              reasoningDetails: index === 0 ? ai.reasoningDetails : undefined,
            },
          ],
        }));
        if (index < assistantChunks.length - 1) {
          await wait(650);
          if (!sessionIdsRef.current.has(currentSessionKey)) return;
        }
      }
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
          isLoading ? (
            <div className="flex items-center gap-2">
              <AssistantAvatar profile={loadingAssistantAvatar} />
              <Button variant="outline" disabled>
                <Spinner data-icon="inline-start" />
                {isSimulationRunning ? "Simulating" : "Thinking"}
              </Button>
            </div>
          ) : (
            "No messages yet."
          )
        ) : (
          <div className="flex min-h-full flex-col justify-end gap-3">
            {activeMessages.map((item) => (
              <Message
                key={item.id}
                role={item.role}
                content={item.content}
                assistantAvatar={item.assistantAvatar}
                userAvatarUrl={userAvatarUrl}
              />
            ))}
            {isLoading ? (
              <div className="flex items-center gap-2">
                <AssistantAvatar profile={loadingAssistantAvatar} />
                <Button variant="outline" disabled>
                  <Spinner data-icon="inline-start" />
                  {isSimulationRunning ? "Simulating" : "Thinking"}
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
              ? activeMode === "ai-vs-ai"
                ? "Start the simulation from AI Profile..."
                : "Type a message..."
              : "Select a valid session first..."
          }
          disabled={
            !hasSelectedSession ||
            activeMode === "ai-vs-ai" ||
            !hasAssistantProfile ||
            isGeneratingProfile ||
            isLoading
          }
          rows={6}
          className="h-20 min-h-10 max-h-72 min-w-[320px] flex-1 resize rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground disabled:opacity-80 dark:disabled:opacity-95"
        />
        <Button
          size="icon"
          type="button"
          onClick={() => void handleSend()}
          disabled={
            !hasSelectedSession ||
            activeMode === "ai-vs-ai" ||
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

function createSimulationAvatarSnapshot(speaker, participants) {
  const participant = participants.find(
    (item) =>
      String(item?.name ?? "").trim().toLowerCase() ===
      String(speaker ?? "").trim().toLowerCase()
  );

  return {
    name: participant?.name || speaker,
    avatarUrl: participant?.avatarUrl || "",
    avatarEmoji: participant?.initials || deriveInitials(speaker),
  };
}

function parseSimulationMessage(raw, participants, turnIndex) {
  const fallbackSpeaker = participants[turnIndex % participants.length]?.name;
  const fallback = {
    speaker: fallbackSpeaker || "AI",
    message: String(raw ?? "").trim() || "I am ready to continue.",
  };

  try {
    const parsed = JSON.parse(String(raw ?? ""));
    const speaker = String(parsed?.speaker ?? "").trim();
    const message = String(parsed?.message ?? "").trim();
    if (isSimulationParticipant(speaker, participants) && message) {
      return { speaker, message };
    }
  } catch {
    // Fall through to plain-text parsing.
  }

  const text = String(raw ?? "").trim();
  const separatorIndex = text.indexOf(":");
  if (separatorIndex > 0) {
    const speaker = text.slice(0, separatorIndex).trim();
    const message = text.slice(separatorIndex + 1).trim();
    if (isSimulationParticipant(speaker, participants) && message) {
      return { speaker, message };
    }
  }

  return fallback;
}

function isSimulationParticipant(speaker, participants) {
  const normalized = String(speaker ?? "").trim().toLowerCase();
  if (!normalized) return false;
  return participants.some(
    (participant) =>
      String(participant?.name ?? "").trim().toLowerCase() === normalized
  );
}

function deriveInitials(name) {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "AI";
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
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
