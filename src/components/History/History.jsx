import SessionCard from "./SessionCard";
import { Separator } from "@/components/ui/separator";

const MOCK_SESSIONS = [
  {
    sessionId: "session-1",
    title: "Card Title",
    description: "This is the card description.",
  },
  {
    sessionId: "session-2",
    title: "Card Title",
    description: "This is the card description.",
  },
];

function History({ selectedSessionId, onSessionSelect }) {

  return (
    <>
      <div className="h-full min-h-0 w-full bg-background p-1">
        <h1 className="mb-4">History</h1>
        <Separator className="mb-6" />
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
            {MOCK_SESSIONS.map((session, index) => (
              <SessionCard
                key={session.sessionId}
                counter={String(index + 1)}
                sessionId={session.sessionId}
                title={session.title}
                description={session.description}
                isActive={selectedSessionId === session.sessionId}
                onSelect={onSessionSelect}
              />
            ))}
          </div>
      </div>
    </>
  )
}

export default History;
