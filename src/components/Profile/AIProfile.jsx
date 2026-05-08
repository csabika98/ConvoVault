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
import { Spinner } from "@/components/ui/spinner";
import { buildCharacterProfilePrompt } from "@/config/systemPrompt";
import { useProfile } from "@/context/useProfile";
import { getAiReply } from "@/services/aiRouting";
import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

function AIProfile() {
  const {
    assistantProfile,
    setAssistantProfile,
    recentPersonNames,
    rememberPersonName,
  } = useProfile();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingPortrait, setIsFetchingPortrait] = useState(false);
  const profile = assistantProfile;

  const hydratePortrait = useCallback(
    async (nextProfile) => {
      setIsFetchingPortrait(true);
      try {
        const avatarUrl = await fetchWikipediaPortraitUrl(nextProfile.wikipediaTitle);
        if (!avatarUrl) return;
        setAssistantProfile((prev) => {
          if (!prev) return prev;
          if (
            prev.name !== nextProfile.name ||
            prev.wikipediaTitle !== nextProfile.wikipediaTitle
          ) {
            return prev;
          }
          return {
            ...prev,
            avatarUrl,
          };
        });
      } finally {
        setIsFetchingPortrait(false);
      }
    },
    [setAssistantProfile]
  );

  const regenerateProfile = useCallback(async () => {
    setIsGenerating(true);
    try {
      const exclusions = Array.from(
        new Set(
          [...recentPersonNames, profile?.name]
            .map((name) => String(name ?? "").trim())
            .filter(Boolean)
        )
      );
      const prompt = buildCharacterProfilePrompt(exclusions);
      const reply = await getAiReply([{ role: "user", content: prompt }], {
        mode: "ai-vs-human",
      });
      let nextProfile = parseCharacterProfile(reply.content);
      if (!nextProfile) return;
      if (containsName(exclusions, nextProfile.name)) {
        const retryPrompt = buildCharacterProfilePrompt([
          ...exclusions,
          nextProfile.name,
        ]);
        const retryReply = await getAiReply(
          [{ role: "user", content: retryPrompt }],
          { mode: "ai-vs-human" }
        );
        const retryProfile = parseCharacterProfile(retryReply.content);
        if (!retryProfile || containsName([...exclusions, nextProfile.name], retryProfile.name)) {
          return;
        }
        nextProfile = retryProfile;
      }
      setAssistantProfile(nextProfile);
      rememberPersonName(nextProfile.name);
      void hydratePortrait(nextProfile);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  }, [
    hydratePortrait,
    profile,
    recentPersonNames,
    rememberPersonName,
    setAssistantProfile,
  ]);

  useEffect(() => {
    if (assistantProfile) return;
    const frame = requestAnimationFrame(() => {
      void regenerateProfile();
    });
    return () => cancelAnimationFrame(frame);
  }, [assistantProfile, regenerateProfile]);

  return (
    <>
      <Empty className="max-w-sm mx-auto p-6">
        <EmptyHeader>
          <EmptyMedia>
            <Avatar className="size-20 ring-1 ring-border">
              <AvatarImage
                src={profile?.avatarUrl}
                alt={profile?.name || "AI Profile"}
              />
              <AvatarFallback>{profile?.avatarEmoji || "✨"}</AvatarFallback>
            </Avatar>
          </EmptyMedia>

          <EmptyTitle>{profile?.name || "Generating profile..."}</EmptyTitle>
          <EmptyDescription>
            {profile?.introduction || "Please wait while we create your AI character."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex flex-col gap-4 text-sm text-muted-foreground">
          {!profile ? (
            <div className="flex items-center justify-center gap-2 rounded-md border border-border/60 bg-muted/30 p-3 text-sm">
              <Spinner />
              <span>{isGenerating ? "Generating profile..." : "Loading profile..."}</span>
            </div>
          ) : (
            <>
              <p>
                <strong>Personality:</strong> {profile.personality}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void regenerateProfile()}
                disabled={isGenerating || isFetchingPortrait}
              >
                <RefreshCw
                  className={`size-3.5 mr-1 ${
                    isGenerating || isFetchingPortrait ? "animate-spin" : ""
                  }`}
                />
                {isGenerating
                  ? "Refreshing..."
                  : isFetchingPortrait
                  ? "Fetching portrait..."
                  : "Regenerate"}
              </Button>
            </>
          )}
        </EmptyContent>
      </Empty>
    </>
  );
}

export default AIProfile;

function parseCharacterProfile(raw) {
  try {
    const parsed = JSON.parse(String(raw ?? ""));
    const name = String(parsed?.name ?? "").trim();
    const introduction = String(parsed?.introduction ?? "").trim();
    const personality = String(parsed?.personality ?? "").trim();
    const wikipediaTitle = String(parsed?.wikipediaTitle ?? "").trim();
    const avatarEmoji = String(parsed?.avatarEmoji ?? "").trim() || "✨";
    if (!name || !introduction || !personality || !wikipediaTitle) return null;
    return {
      name,
      introduction,
      personality,
      wikipediaTitle,
      avatarEmoji,
      avatarUrl: null,
    };
  } catch {
    return null;
  }
}

async function fetchWikipediaPortraitUrl(title) {
  const safeTitle = encodeURIComponent(String(title ?? "").trim());
  if (!safeTitle) return null;
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&piprop=thumbnail&pithumbsize=512&redirects=1&format=json&titles=${safeTitle}&origin=*`;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    const pages = data?.query?.pages;
    if (!pages || typeof pages !== "object") return null;
    for (const page of Object.values(pages)) {
      const source = page?.thumbnail?.source;
      if (typeof source === "string" && source) return source;
    }
    return null;
  } catch {
    return null;
  }
}

function containsName(list, value) {
  const normalizedValue = String(value ?? "").trim().toLowerCase();
  if (!normalizedValue) return false;
  return list.some(
    (item) => String(item ?? "").trim().toLowerCase() === normalizedValue
  );
}
