import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import AIProfile from "@/components/Profile/AIProfile";
import CharacterList from "@/components/Profile/CharacterList";

function Profile() {

  return (
    <>
      <Tabs defaultValue="HUMAN_VS_AI">
      <TabsList>
        <TabsTrigger value="HUMAN_VS_AI">Human vs. AI</TabsTrigger>
        <TabsTrigger value="AI_VS_AI">AI vs. AI</TabsTrigger>
      </TabsList>
      <TabsContent value="HUMAN_VS_AI">
        <AIProfile />
      </TabsContent>
      <TabsContent value="AI_VS_AI">
        <CharacterList />
      </TabsContent>
    </Tabs>
    </>
  )
}

export default Profile;