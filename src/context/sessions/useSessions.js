import { useContext } from "react";
import { SessionContext } from "@/context/sessions/SessionContext";

export function useSessions() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessions must be used within SessionsProvider");
  }
  return context;
}
