import { useState } from "react";
import { ProfileContext } from "@/context/profile/ProfileContext";

const USER_AVATAR_STORAGE_KEY = "convovault-user-avatar";

export function ProfileProvider({ children }) {
  const [modeBySession, setModeBySession] = useState({});
  const [assistantProfile, setAssistantProfile] = useState(null);
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);
  const [userAvatarUrl, setUserAvatarUrlState] = useState(
    () => localStorage.getItem(USER_AVATAR_STORAGE_KEY) || ""
  );
  const [recentPersonNames, setRecentPersonNames] = useState([]);

  const setUserAvatarUrl = (avatarUrl) => {
    const nextAvatarUrl = String(avatarUrl ?? "");
    if (nextAvatarUrl) {
      localStorage.setItem(USER_AVATAR_STORAGE_KEY, nextAvatarUrl);
    } else {
      localStorage.removeItem(USER_AVATAR_STORAGE_KEY);
    }
    setUserAvatarUrlState(nextAvatarUrl);
  };

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

  const rememberPersonName = (name) => {
    const normalized = String(name ?? "").trim();
    if (!normalized) return;
    setRecentPersonNames((prev) => {
      const deduped = prev.filter(
        (item) => item.toLowerCase() !== normalized.toLowerCase()
      );
      return [normalized, ...deduped].slice(0, 8);
    });
  };

  return (
    <ProfileContext.Provider
      value={{
        modeBySession,
        assistantProfile,
        setAssistantProfile,
        isGeneratingProfile,
        setIsGeneratingProfile,
        userAvatarUrl,
        setUserAvatarUrl,
        recentPersonNames,
        rememberPersonName,
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
