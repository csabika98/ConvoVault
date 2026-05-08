import { createContext, useContext, useState } from "react";

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [modeBySession, setModeBySession] = useState({});

  const getModeForSession = (sessionId) => {
    if (!sessionId) return "ai-vs-human";
    return modeBySession[String(sessionId)] ?? "ai-vs-human";
  };

  const setModeForSession = (sessionId, mode) => {
    if (!sessionId) return;
    const key = String(sessionId);
    setModeBySession((prev) => ({
      ...prev,
      [key]: mode,
    }));
  };

  const setAiVsAiForSession = (sessionId) => {
    setModeForSession(sessionId, "ai-vs-ai");
  };

  const setHumanVsAiForSession = (sessionId) => {
    setModeForSession(sessionId, "ai-vs-human");
  };

  return (
    <ProfileContext.Provider
      value={{
        modeBySession,
        getModeForSession,
        setModeForSession,
        setAiVsAiForSession,
        setHumanVsAiForSession,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return context;
}
