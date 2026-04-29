import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import History from "./components/History/History";


function App() {
  return (
    <>
      <ResizablePanelGroup
        orientation="horizontal"
        className="h-screen w-full rounded-lg border"
      >
        <ResizablePanel defaultSize={20}>
          <div className="flex h-full items-center justify-center p-6">
            {/*<span className="font-semibold">Sidebar</span>*/}
            <History />
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={60}>
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Chatbox</span>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={20}>
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Profile</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  )
}

export default App
