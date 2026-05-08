import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useMemo, useState } from "react";
import History from "./components/History/History";
import Chatbox from "./components/Chatbox/Chatbox";
import Profile from "@/components/Profile/Profile";
import { useSessions } from "@/context/sessions/useSessions";
import SettingsSheet from "@/components/Settings/SettingsSheet";

function App() {
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const { sessions } = useSessions();
  const effectiveSelectedSessionId = useMemo(() => {
    if (sessions.length === 0) return "";
    const selectedExists = sessions.some((session) => session.id === selectedSessionId);
    return selectedExists ? selectedSessionId : sessions[0].id;
  }, [selectedSessionId, sessions]);

  return (
    <div className="relative h-[100dvh] bg-background text-foreground">
      <SettingsSheet />
      <ResizablePanelGroup
        orientation="horizontal"
        className="h-[100dvh] min-w-0 rounded-lg border"
      >
        <ResizablePanel defaultSize={20}>
          <div className="flex h-full min-h-0 min-w-0 flex-col overflow-auto p-6">
            {/*<span className="font-semibold">Sidebar</span>*/}
            <History
              selectedSessionId={effectiveSelectedSessionId}
              onSessionSelect={setSelectedSessionId}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={60}>
          <div className="flex h-full min-h-0 min-w-0 flex-col p-6">
            <Chatbox selectedSessionId={effectiveSelectedSessionId} />
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={20}>
          <div className="flex h-full min-h-0 min-w-0 flex-col items-center p-6">
            <Profile selectedSessionId={effectiveSelectedSessionId} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default App
