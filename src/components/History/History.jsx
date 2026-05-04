import SessionCard from "./SessionCard";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

function History() {
  const [sessions, setSessions] = useState([]);

  const addSession = () => {
    const nextId = Math.max(...sessions.map((s) => s.id), 0) + 1;
    setSessions((prev) => [
      ...prev,
      {
        id: nextId,
        title: `Session ${nextId}`,
        description: `Description for session ${nextId}`,
      },
    ]);
  };

  const deleteSession = (idToDelete) => {
    setSessions((prev) => prev.filter((session) => session.id !== idToDelete));
  };

  return (
    <>
      <div className="h-full min-h-0 w-full bg-background p-1">
        <h1 className="mb-4">History</h1>
        <Separator className="mb-6" />
        <div className="flex flex-col gap-4 max-w-6xl mx-auto w-full">
          {sessions.map((session, index) => (
            <SessionCard
              key={session.id}
              title={session.title}
              description={session.description}
              counter={String(index + 1)}
              onDelete={() => deleteSession(session.id)}
            />
          ))}
        </div>
        <Button className="mt-6 rounded-full" onClick={addSession}>
          <Plus />
        </Button>
      </div>
    </>
  )
}

export default History;
