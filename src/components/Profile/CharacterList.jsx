import { useState } from "react";
import CharacterCard from "./CharacterCard";
import { Button } from "@/components/ui/button";
import { Plus, Shuffle } from "lucide-react";
import { useCharacters } from "@/context/characters/useCharacters";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

function CharacterList({ onSimulationStart }) {
  const {
    characters,
    addCharacter,
    deleteCharacter,
    updateCharacterName,
    randomizeCharacters,
    startSimulation,
    charactersAreFull,
  } = useCharacters();
  const [selectedId, setSelectedId] = useState(null);
  const [discussionLength, setDiscussionLength] = useState("normal");
  const [declareTopic, setDeclareTopic] = useState(false);
  const [topicExplanation, setTopicExplanation] = useState("");
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [isStartingSimulation, setIsStartingSimulation] = useState(false);

  const handleSelect = (charId) => {
    setSelectedId(charId);
  };

  const handleAddCharacter = () => {
    if (charactersAreFull) return;

    const newId = addCharacter({
      name: `Character ${characters.length + 1}`,
    });
    if (newId != null) {
      setSelectedId(newId);
    }
  };

  const handleDelete = (charId) => {
    deleteCharacter(charId);
    if (selectedId === charId) {
      setSelectedId(null);
    }
  };

  const handleNameChange = (charId, newName) => {
    updateCharacterName(charId, newName);
  };

  const handleRandomizeCharacters = async () => {
    setIsRandomizing(true);
    try {
      const nextCharacters = await randomizeCharacters();
      setSelectedId(nextCharacters[0]?.id ?? null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsRandomizing(false);
    }
  };

  const handleStartSimulation = async () => {
    setIsStartingSimulation(true);
    try {
      await startSimulation({
        durationMs: getDiscussionDurationMs(discussionLength),
        topic: declareTopic ? topicExplanation : "",
      });
      onSimulationStart?.();
    } finally {
      setIsStartingSimulation(false);
    }
  };

  const canStartSimulation =
    characters.filter((character) => String(character.name ?? "").trim()).length >= 2;

  return (
    <>
      <div className="flex w-full min-w-0 flex-col gap-2 p-2">
        {characters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            selected={selectedId === character.id}
            onSelect={() => handleSelect(character.id)}
            onDelete={() => handleDelete(character.id)}
            onNameChange={(newName) => handleNameChange(character.id, newName)}
          />
        ))}
      </div>
      <div className="mb-6 flex flex-wrap justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => void handleRandomizeCharacters()}
          disabled={isRandomizing || isStartingSimulation}
        >
          <Shuffle data-icon="inline-start" />
          {isRandomizing ? "Randomizing..." : "Randomize"}
        </Button>
        <Button
          size={charactersAreFull ? "" : "icon-sm"}
          variant="secondary"
          className="rounded-full"
          onClick={handleAddCharacter}
          disabled={charactersAreFull || isRandomizing || isStartingSimulation}
        >
          {charactersAreFull ? "Max 5 characters" : <Plus />}
        </Button>
      </div>
      
      <div className="mx-auto mt-6 flex w-full max-w-lg flex-col gap-8 px-2">
        <form
          className="flex flex-col gap-8"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="flex flex-col gap-4">
            <Label className="text-foreground">Discussion Length</Label>
            <ToggleGroup
              variant="outline"
              type="single"
              className="w-full [&_[data-slot='toggle-group-item']]:flex-1"
              value={discussionLength}
              onValueChange={(value) => {
                if (value) setDiscussionLength(value);
              }}
            >
              <ToggleGroupItem value="short" aria-label="Short discussion">
                Short
              </ToggleGroupItem>
              <ToggleGroupItem value="normal" aria-label="Normal discussion">
                Normal
              </ToggleGroupItem>
              <ToggleGroupItem value="long" aria-label="Long discussion">
                Long
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="declare-topic-switch" className="text-foreground">
                Declare Topic
              </Label>
              <Switch
                id="declare-topic-switch"
                checked={declareTopic}
                onCheckedChange={(checked) => {
                  setDeclareTopic(Boolean(checked));
                  if (!checked) setTopicExplanation("");
                }}
              />
            </div>
            {declareTopic ? (
              <Textarea
                id="declare-topic-text"
                value={topicExplanation}
                onChange={(e) => setTopicExplanation(e.target.value)}
                placeholder="Explain the topic you wish the characters to chat about"
                rows={4}
              />
            ) : null}
          </div>
        </form>
        <div className="flex justify-center pb-4">
          <Button
            onClick={() => void handleStartSimulation()}
            disabled={!canStartSimulation || isRandomizing || isStartingSimulation}
          >
            {isStartingSimulation ? "Starting..." : "Start simulation"}
          </Button>
        </div>
      </div>
    </>
  );
}

function getDiscussionDurationMs(length) {
  if (length === "short") return 30_000;
  if (length === "long") return 120_000;
  return 60_000;
}

export default CharacterList;
