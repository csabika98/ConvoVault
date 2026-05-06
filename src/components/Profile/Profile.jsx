import { Button } from "@/components/ui/button"
import AIProfile from "@/components/Profile/AIProfile";
import CharacterList from "@/components/Profile/CharacterList";
import { useProfile } from "@/context/ProfileContext";

function Profile() {
  const { isAiVsAi, isHumanVsAi, setHumanVsAi } = useProfile();

  return (
    <div>
      <Button onClick={setHumanVsAi}>setHumanVsAi</Button>
      <div className="text-sm text-muted-foreground mb-2">
        { isAiVsAi ? <CharacterList /> : null }
        { isHumanVsAi ? <AIProfile /> : null }
      </div>
    </div>
  )
}

export default Profile;