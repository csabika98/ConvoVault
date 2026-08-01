import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useCallback, useMemo, useState } from "react";
import { PanelLeft, UserRound } from "lucide-react";
import History from "./components/History/History";
import Chatbox from "./components/Chatbox/Chatbox";
import Profile from "@/components/Profile/Profile";
import { useSessions } from "@/context/sessions/useSessions";
import SettingsSheet from "@/components/Settings/SettingsSheet";
import ConvoVaultBrand from "@/components/Brand/ConvoVaultBrand";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";

function App() {
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [messagesBySession, setMessagesBySession] = useState({});
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { sessions } = useSessions();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const effectiveSelectedSessionId = useMemo(() => {
    if (sessions.length === 0) return "";
    const selectedExists = sessions.some((session) => session.id === selectedSessionId);
    return selectedExists ? selectedSessionId : sessions[0].id;
  }, [selectedSessionId, sessions]);

  const handleMobileSessionSelect = useCallback((sessionId) => {
    setSelectedSessionId(sessionId);
    setIsHistoryOpen(false);
  }, []);

  const chatbox = (
    <Chatbox
      selectedSessionId={effectiveSelectedSessionId}
      messagesBySession={messagesBySession}
      setMessagesBySession={setMessagesBySession}
    />
  );

  if (!isDesktop) {
    return (
      <div className="flex h-[100dvh] flex-col bg-background text-foreground">
        <header className="flex shrink-0 items-center gap-2 border-b px-3 py-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="shrink-0"
            aria-label="Open history"
            onClick={() => setIsHistoryOpen(true)}
          >
            <PanelLeft />
          </Button>

          <ConvoVaultBrand
            className="mb-0 min-w-0 flex-1 flex-row items-center justify-center gap-2"
            imgClassName="h-8 sm:h-8"
            textClassName="truncate text-base"
            stackable={false}
          />

          <Button
            type="button"
            size="icon"
            variant="outline"
            className="shrink-0"
            aria-label="Open AI profile"
            onClick={() => setIsProfileOpen(true)}
          >
            <UserRound />
          </Button>
          <SettingsSheet triggerClassName="shrink-0" triggerSize="icon" />
        </header>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
          {chatbox}
        </main>

        <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
          <SheetContent side="left" className="gap-0 p-4">
            <SheetHeader className="sr-only">
              <SheetTitle>History</SheetTitle>
              <SheetDescription>Browse and manage your sessions.</SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pt-8">
              <History
                selectedSessionId={effectiveSelectedSessionId}
                onSessionSelect={handleMobileSessionSelect}
              />
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <SheetContent side="right" className="gap-0 p-4">
            <SheetHeader className="sr-only">
              <SheetTitle>AI Profile</SheetTitle>
              <SheetDescription>Configure the AI characters for this session.</SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pt-8">
              <Profile
                selectedSessionId={effectiveSelectedSessionId}
                onSimulationStart={() => setIsProfileOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div className="relative h-[100dvh] bg-background text-foreground">
      <SettingsSheet triggerClassName="absolute right-4 top-4 z-10" />
      <ResizablePanelGroup
        orientation="horizontal"
        className="h-[100dvh] min-w-0 rounded-lg border"
      >
        <ResizablePanel defaultSize={20}>
          <div className="flex h-full min-h-0 min-w-0 flex-col overflow-auto p-6">
            <History
              selectedSessionId={effectiveSelectedSessionId}
              onSessionSelect={setSelectedSessionId}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={60}>
          <div className="flex h-full min-h-0 min-w-0 flex-col p-6">{chatbox}</div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={20}>
          <div className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-auto p-6">
            <Profile selectedSessionId={effectiveSelectedSessionId} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default App
