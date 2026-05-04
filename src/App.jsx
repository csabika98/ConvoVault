import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import History from "./components/History/History";
import Chatbox from "./components/Chatbox/Chatbox";


function App() {
  return (
    <>
      <ResizablePanelGroup
        orientation="horizontal"
        className="min-w-0 rounded-lg border"
      >
        <ResizablePanel defaultSize={20}>
          <div className="flex h-full min-h-0 min-w-0 flex-col overflow-auto p-6">
            {/*<span className="font-semibold">Sidebar</span>*/}
            <History />
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={60}>
          <div className="flex h-full min-h-0 min-w-0 flex-col p-6">
            <Chatbox />
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={20}>
          <div className="flex h-full min-h-0 min-w-0 flex-col items-center justify-center p-6">
            <span className="font-semibold">Profile</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  )
}

export default App
