import { useState } from "react";
import CharacterCard from "./CharacterCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCharacters } from "@/context/characters/useCharacters";

function CharacterList() {
  const {
    characters,
    addCharacter,
    deleteCharacter,
    updateCharacterName,
    startSimulation,
    charactersAreFull,
  } = useCharacters();
  const [selectedId, setSelectedId] = useState(null);

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

  const handleStartSimulation = () => {
    void startSimulation();
  };

  const canStartSimulation =
    characters.filter((character) => String(character.name ?? "").trim()).length >= 2;

  return (
    <>
      <div className="flex w-full min-w-0 flex-col gap-1 p-2">
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
      <div className="mt-6 flex justify-end">
        <Button
          size={charactersAreFull ? "" : "icon-sm"}
          variant="secondary"
          className="rounded-full"
          onClick={handleAddCharacter}
          disabled={charactersAreFull}
        >
          {charactersAreFull ? "Max 5 characters" : <Plus />}
        </Button>
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={handleStartSimulation} disabled={!canStartSimulation}>
          Start simulation
        </Button>
      </div>
    </>
  );
}

export default CharacterList;
