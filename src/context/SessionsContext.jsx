import { createContext, useContext, useState } from "react";

const MAX_SESSIONS = 5;

const SessionsContext = createContext(null);

export function SessionsProvider({ children }) {
  const [sessions, setSessions] = useState([{ id: 1, title: "Session 1" }]);

  const addSession = (newSession) => {
    if (sessions.length >= MAX_SESSIONS) return null;

    const nextId =
      sessions.length > 0
        ? Math.max(...sessions.map((s) => s.id)) + 1
        : 1;

    setSessions((prev) => [
      ...prev,
      { id: nextId, ...newSession },
    ]);

    return nextId;
  };

  const deleteSession = (idToDelete) => {
    setSessions((prev) => prev.filter((s) => s.id !== idToDelete));
  };

  return (
    <SessionsContext.Provider
      value={{ sessions, addSession, deleteSession, sessionsAreFull: sessions.length >= MAX_SESSIONS }}
    >
      {children}
    </SessionsContext.Provider>
  );
}

export function useSessions() {
  const context = useContext(SessionsContext);
  if (!context) {
    throw new Error(
      "useSessions must be used within SessionsProvider"
    );
  }
  return context;
}
