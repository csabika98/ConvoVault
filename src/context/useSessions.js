import { useContext } from "react";
import { SessionContext } from "@/context/sessionContext.js";

export function useSessions() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessions must be used within SessionsProvider");
  }
  return context;
}
