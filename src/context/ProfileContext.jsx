import { createContext, useContext, useState } from "react";

const MODES = {
  AI_VS_AI: "AI vs. AI",
  HUMAN_VS_AI: "Human vs. AI",
};

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [mode, setMode] = useState(MODES.HUMAN_VS_AI);

  const setAiVsAi = () => setMode(MODES.AI_VS_AI);
  const setHumanVsAi = () => setMode(MODES.HUMAN_VS_AI);

  return (
    <ProfileContext.Provider
      value={{
        mode,
        isAiVsAi: mode === MODES.AI_VS_AI,
        isHumanVsAi: mode === MODES.HUMAN_VS_AI,
        setAiVsAi,
        setHumanVsAi,
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

export { MODES };