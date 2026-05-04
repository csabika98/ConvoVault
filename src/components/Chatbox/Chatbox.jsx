import { useState } from "react";
import { Button } from "@/components/ui/button";

function Chatbox() {
  const [message, setMessage] = useState("");

  function handleSend() {
    const text = message.trim();
    if (!text) return;
    setMessage("");
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      <div className="min-h-0 flex-1 overflow-auto rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
        Messages will appear here.
      </div>
      <div className="mt-4 flex min-w-0 shrink-0 items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="h-8 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        <Button type="button" onClick={handleSend}>
          Send
        </Button>
      </div>
    </div>
  );
}

export default Chatbox;
