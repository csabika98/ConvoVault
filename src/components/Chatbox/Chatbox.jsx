import { useState } from "react";
import { Button } from "@/components/ui/button";

function Chatbox({ selectedSessionId }) {
  const [message, setMessage] = useState("");

  function handleSend() {
    const text = message.trim();
    if (!text) return;
    setMessage("");
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      <div className="min-h-0 flex-1 overflow-auto rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
        {selectedSessionId
          ? `Messages for ${selectedSessionId} will appear here.`
          : "Select a session from History to view messages."}
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
