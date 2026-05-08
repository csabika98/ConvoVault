import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

function AIProfile() {
  const [name, setName] = useState('John Doe');
  const [introduction, SetIntroduction] = useState('Your friendly AI for coding and problem‑solving.');
  const [personality, setPersonality] = useState('Curious, pragmatic, and helpful. Enjoys explaining complex things simply and writing clean, readable code. Always tries to ask clarifying questions before jumping to solutions.');
 
  return (
    <>
      <h1>Human vs. AI</h1>
      <h3>from: AIProile.jsx</h3>
      <Empty className="max-w-sm mx-auto p-6">
        <EmptyHeader>
          <EmptyMedia>
            <Avatar className="size-20 ring-1 ring-border">
              <AvatarImage src="https://github.com/shadcn.png" alt="Assistant" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
          </EmptyMedia>

          <EmptyTitle>{name}</EmptyTitle>
          <EmptyDescription>{introduction}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex flex-col gap-4 text-sm text-muted-foreground">
          <p>
            <strong>Personality:</strong> {personality}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // TODO: Regenerate new AI profile
              console.log("Regenerate clicked");
            }}
          >
            <RefreshCw className="size-3.5 mr-1" />
            Regenerate
          </Button>
        </EmptyContent>
      </Empty>
    </>
  )
}

export default AIProfile;
