import { createContext, useContext, useState } from "react";

const SessionsContext = createContext(null);

export function SessionsProvider({ children }) {
  const [sessions, setSessions] = useState([]);

  const addSession = (newSession) => {
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
      value={{ sessions, addSession, deleteSession }}
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