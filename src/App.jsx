import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useState } from "react";
import History from "./components/History/History";
import Chatbox from "./components/Chatbox/Chatbox";
import Profile from "@/components/Profile/Profile";

function App() {
  const [selectedSessionId, setSelectedSessionId] = useState("");

  return (
    <>
      <ResizablePanelGroup
        orientation="horizontal"
        className="h-[100dvh] min-w-0 rounded-lg border"
      >
        <ResizablePanel defaultSize={20}>
          <div className="flex h-full min-h-0 min-w-0 flex-col overflow-auto p-6">
            {/*<span className="font-semibold">Sidebar</span>*/}
            <History
              selectedSessionId={selectedSessionId}
              onSessionSelect={setSelectedSessionId}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={60}>
          <div className="flex h-full min-h-0 min-w-0 flex-col p-6">
            <Chatbox selectedSessionId={selectedSessionId} />
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={20}>
          <div className="flex h-full min-h-0 min-w-0 flex-col items-center p-6">
            <Profile selectedSessionId={selectedSessionId} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  )
}

export default App
