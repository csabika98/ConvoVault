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
import {
  buildCharacterProfilePrompt,
  buildNamedCharacterProfilePrompt,
} from "@/config/systemPrompt";
import { useProfile } from "@/context/profile/useProfile";
import { getAiReply } from "@/services/aiRouting";
import { fetchWikipediaPortraitUrl } from "@/services/wikipediaPortrait";
import { Input } from "@/components/ui/input";
import { Check, Edit3, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

function AIProfile() {
  const {
    assistantProfile,
    setAssistantProfile,
    isGeneratingProfile,
    setIsGeneratingProfile,
    recentPersonNames,
    rememberPersonName,
  } = useProfile();
  const [isFetchingPortrait, setIsFetchingPortrait] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const nameInputRef = useRef(null);
  const profileGenerationRef = useRef(false);
  const profile = assistantProfile;

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

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
    if (profileGenerationRef.current) return;
    profileGenerationRef.current = true;
    setIsGeneratingProfile(true);
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
      profileGenerationRef.current = false;
      setIsGeneratingProfile(false);
    }
  }, [
    hydratePortrait,
    setIsGeneratingProfile,
    profile,
    recentPersonNames,
    rememberPersonName,
    setAssistantProfile,
  ]);

  const regenerateProfileForRequestedName = useCallback(
    async (requestedName) => {
      const trimmed = String(requestedName ?? "").trim();
      if (!trimmed) return;

      const prompt = buildNamedCharacterProfilePrompt(trimmed);
      if (!prompt) return;

      if (profileGenerationRef.current) return;
      profileGenerationRef.current = true;
      setIsGeneratingProfile(true);
      try {
        let nextProfile = null;
        const maxAttempts = 4;
        for (let i = 0; i < maxAttempts; i += 1) {
          const reply = await getAiReply([{ role: "user", content: prompt }], {
            mode: "ai-vs-human",
          });
          const candidate = parseCharacterProfile(reply.content);
          if (candidate) {
            nextProfile = candidate;
            break;
          }
        }
        if (!nextProfile) return;
        setAssistantProfile(nextProfile);
        rememberPersonName(nextProfile.name);
        void hydratePortrait(nextProfile);
      } catch (error) {
        console.error(error);
      } finally {
        profileGenerationRef.current = false;
        setIsGeneratingProfile(false);
      }
    },
    [
      hydratePortrait,
      rememberPersonName,
      setAssistantProfile,
      setIsGeneratingProfile,
    ]
  );

  const handleNameEditToggle = () => {
    const busy = isGeneratingProfile || isFetchingPortrait;
    if (busy) return;

    if (isEditingName) {
      const trimmed = editName.trim();
      if (!trimmed) {
        setEditName(profile?.name ?? "");
        setIsEditingName(false);
        return;
      }
      setIsEditingName(false);
      void regenerateProfileForRequestedName(trimmed);
      return;
    }

    setEditName(profile?.name ?? "");
    setIsEditingName(true);
  };

  useEffect(() => {
    if (assistantProfile || isGeneratingProfile) return;
    const frame = requestAnimationFrame(() => {
      void regenerateProfile();
    });
    return () => cancelAnimationFrame(frame);
  }, [assistantProfile, isGeneratingProfile, regenerateProfile]);

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

          {!profile ? (
            <EmptyTitle>Generating profile...</EmptyTitle>
          ) : isEditingName ? (
            <EmptyTitle className="flex w-full min-w-0 max-w-sm flex-wrap items-center justify-center gap-2">
              <Input
                ref={nameInputRef}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-9 min-w-0 flex-1 text-center text-base md:text-sm"
                disabled={isGeneratingProfile || isFetchingPortrait}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleNameEditToggle();
                  }
                  if (e.key === "Escape") {
                    setIsEditingName(false);
                    setEditName(profile.name);
                  }
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 w-9 shrink-0 p-0"
                disabled={isGeneratingProfile || isFetchingPortrait}
                onClick={handleNameEditToggle}
              >
                <Check className="size-4" />
                <span className="sr-only">Confirm name</span>
              </Button>
            </EmptyTitle>
          ) : (
            <EmptyTitle className="flex w-full min-w-0 max-w-sm flex-wrap items-center justify-center gap-2">
              <span className="min-w-0 truncate">{profile.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 w-9 shrink-0 p-0"
                disabled={isGeneratingProfile || isFetchingPortrait}
                onClick={handleNameEditToggle}
              >
                <Edit3 className="size-4" />
                <span className="sr-only">Edit name</span>
              </Button>
            </EmptyTitle>
          )}
          <EmptyDescription>
            {profile?.introduction || "Please wait while we create your AI character."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex flex-col gap-4 text-sm text-muted-foreground">
          {!profile ? (
            <div className="flex items-center justify-center gap-2 rounded-md border border-border/60 bg-muted/30 p-3 text-sm">
              <Spinner />
              <span>{isGeneratingProfile ? "Generating profile..." : "Loading profile..."}</span>
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
                disabled={isGeneratingProfile || isFetchingPortrait}
              >
                <RefreshCw
                  className={`size-3.5 mr-1 ${
                    isGeneratingProfile || isFetchingPortrait ? "animate-spin" : ""
                  }`}
                />
                {isGeneratingProfile
                  ? "Refreshing..."
                  : isFetchingPortrait
                  ? "Fetching portrait..."
                  : "Randomize"}
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

function containsName(list, value) {
  const normalizedValue = String(value ?? "").trim().toLowerCase();
  if (!normalizedValue) return false;
  return list.some(
    (item) => String(item ?? "").trim().toLowerCase() === normalizedValue
  );
}
