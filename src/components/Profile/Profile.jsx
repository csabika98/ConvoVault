import AIProfile from "@/components/Profile/AIProfile";
import CharacterList from "@/components/Profile/CharacterList";
import { useProfile } from "@/context/ProfileContext";

function Profile({ selectedSessionId }) {
  const { getModeForSession } = useProfile();
  const activeMode = getModeForSession(selectedSessionId);

  return (
    <div>
      <div className="text-sm text-muted-foreground mb-2">
        {activeMode === "ai-vs-ai" ? <CharacterList /> : null}
        {activeMode === "ai-vs-human" ? <AIProfile /> : null}
      </div>
    </div>
  );
}

export default Profile;