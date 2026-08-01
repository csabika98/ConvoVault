import AIProfile from "@/components/Profile/AIProfile";
import CharacterList from "@/components/Profile/CharacterList";
import { useProfile } from "@/context/profile/useProfile";
import { Separator } from "@/components/ui/separator";

function Profile({ selectedSessionId, onSimulationStart }) {
  const { getModeForSession } = useProfile();
  const activeMode = getModeForSession(selectedSessionId);

  return (
    <div className="h-full min-h-0 w-full bg-background p-1">
      <h1 className="mb-4">AI Profile</h1>
      <Separator className="mb-6" />
      <div className="mb-2 text-sm text-muted-foreground">
        {activeMode === "ai-vs-ai" ? (
          <CharacterList onSimulationStart={onSimulationStart} />
        ) : null}
        {activeMode === "ai-vs-human" ? <AIProfile /> : null}
      </div>
    </div>
  );
}

export default Profile;
