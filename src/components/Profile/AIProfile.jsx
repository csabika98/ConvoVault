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
import { useProfile } from "@/context/profile/useProfile";
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
      const attemptedNames = [...exclusions];
      let nextProfile = null;
      const maxAttempts = 4;

      for (let i = 0; i < maxAttempts; i += 1) {
        const prompt = buildCharacterProfilePrompt(attemptedNames);
        const reply = await getAiReply([{ role: "user", content: prompt }], {
          mode: "ai-vs-human",
        });
        const candidate = parseCharacterProfile(reply.content);
        if (!candidate) continue;
        if (containsName(attemptedNames, candidate.name)) {
          attemptedNames.push(candidate.name);
          continue;
        }
        nextProfile = candidate;
        break;
      }
      if (!nextProfile) return;
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
  const rawTitle = String(title ?? "").trim();
  const safeTitle = encodeURIComponent(rawTitle);
  if (!safeTitle) return null;

  try {
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${safeTitle}`;
    const summaryResponse = await fetch(summaryUrl);
    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json();
      const fromSummary =
        summaryData?.thumbnail?.source || summaryData?.originalimage?.source;
      if (typeof fromSummary === "string" && fromSummary) return fromSummary;
    }

    const pageImageUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&piprop=thumbnail&pithumbsize=512&redirects=1&format=json&titles=${safeTitle}&origin=*`;
    const response = await fetch(pageImageUrl);
    if (response.ok) {
      const data = await response.json();
      const pages = data?.query?.pages;
      if (pages && typeof pages === "object") {
        for (const page of Object.values(pages)) {
          const source = page?.thumbnail?.source;
          if (typeof source === "string" && source) return source;
        }
      }
    }

    return buildGeneratedAvatarUrl(rawTitle);
  } catch {
    return buildGeneratedAvatarUrl(rawTitle);
  }
}

function containsName(list, value) {
  const normalizedValue = String(value ?? "").trim().toLowerCase();
  if (!normalizedValue) return false;
  return list.some(
    (item) => String(item ?? "").trim().toLowerCase() === normalizedValue
  );
}

function buildGeneratedAvatarUrl(seed) {
  const safeSeed = encodeURIComponent(String(seed ?? "").trim() || "famous-person");
  return `https://api.dicebear.com/9.x/personas/svg?seed=${safeSeed}&backgroundType=gradientLinear`;
}
