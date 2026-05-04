import { useEffect, useMemo, useRef, useState } from "react";
import * as AvatarPrimitive from "radix-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function Chatbox({ selectedSessionId }) {
  const [message, setMessage] = useState("");
  const [messagesBySession, setMessagesBySession] = useState({});
  const messagesContainerRef = useRef(null);

  const activeMessages = useMemo(() => {
    if (!selectedSessionId) return [];
    return messagesBySession[selectedSessionId] ?? [];
  }, [messagesBySession, selectedSessionId]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [activeMessages.length, selectedSessionId]);

  function handleSend() {
    const text = message.trim();
    if (!text || !selectedSessionId) return;

    setMessagesBySession((prev) => ({
      ...prev,
      [selectedSessionId]: [
        ...(prev[selectedSessionId] ?? []),
        { id: crypto.randomUUID(), content: text, role: "user" },
      ],
    }));
    setMessage("");
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      <div
        ref={messagesContainerRef}
        className="min-h-0 flex-1 overflow-auto rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground"
      >
        {!selectedSessionId ? (
          "Select a session from History to view messages."
        ) : activeMessages.length === 0 ? (
          `No messages yet for ${selectedSessionId}.`
        ) : (
          <div className="flex min-h-full flex-col gap-2">
            {activeMessages.map((item) => (
              <div key={item.id} className="ml-auto flex max-w-[85%] items-end gap-2">
                <Card className="w-fit bg-muted">
                  <CardContent className="px-3 py-2 text-right text-foreground">
                    {item.content}
                  </CardContent>
                </Card>
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
              </div>
            ))}
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
              handleSend();
            }
          }}
          placeholder={
            selectedSessionId
              ? `Type a message for ${selectedSessionId}...`
              : "Select a session first..."
          }
          disabled={!selectedSessionId}
          rows={6}
          className="min-h-32 max-h-72 min-w-[320px] flex-1 resize rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <Button type="button" onClick={handleSend} disabled={!selectedSessionId}>
          Send
        </Button>
      </div>
    </div>
  );
}

export default Chatbox;
