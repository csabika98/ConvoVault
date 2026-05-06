import SessionCard from "./SessionCard";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSessions } from "@/context/SessionsContext";

function History({ selectedSessionId, onSessionSelect }) {
  const { sessions, addSession, deleteSession, sessionsAreFull } = useSessions();

  const handleAddSession = () => {
    if (sessionsAreFull) return;

    const newSessionId = addSession({
      title: `Session ${sessions.length + 1}`,
    });

    onSessionSelect(newSessionId);
  };

  const handleDeleteSession = (idToDelete) => {
    deleteSession(idToDelete);
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
              sessionId={session.id}
              isActive={selectedSessionId === session.id}
              onSelect={onSessionSelect}
              onDelete={() => handleDeleteSession(session.id)}
            />
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            size={sessionsAreFull ? "" : "icon-sm" }
            variant="secondary"
            className="rounded-full"
            onClick={handleAddSession}
            disabled={sessionsAreFull}
          >
            { sessionsAreFull ? "Max 5 sessions" : <Plus /> }
          </Button>
        </div>
      </div>
    </>
  )
}

export default History;
