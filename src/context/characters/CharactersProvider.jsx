import { useRef, useState } from "react";
import { CharacterContext } from "@/context/characters/CharacterContext";

const MAX_CHARACTERS = 5;

function deriveInitials(name) {
  const t = String(name ?? "").trim();
  if (!t) return "?";
  return t.charAt(0).toUpperCase();
}

export function CharactersProvider({ children }) {
  const [characters, setCharacters] = useState([]);
  const nextCharacterIdRef = useRef(1);

  const addCharacter = (partial = {}) => {
    if (characters.length >= MAX_CHARACTERS) return null;

    const nextId = nextCharacterIdRef.current;
    nextCharacterIdRef.current += 1;

    const name =
      partial.name?.trim() ||
      `Character ${characters.length + 1}`;
    const initials =
      partial.initials?.trim() || deriveInitials(name);

    setCharacters((prev) => [
      ...prev,
      {
        id: nextId,
        name,
        avatarUrl: partial.avatarUrl ?? "",
        initials,
      },
    ]);

    return nextId;
  };

  const deleteCharacter = (idToDelete) => {
    setCharacters((prev) => prev.filter((c) => c.id !== idToDelete));
  };

  const updateCharacterName = (id, newName) => {
    const trimmed = String(newName ?? "").trim();
    if (!trimmed) return;

    setCharacters((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: trimmed } : c))
    );
  };

  return (
    <CharacterContext.Provider
      value={{
        characters,
        addCharacter,
        deleteCharacter,
        updateCharacterName,
        charactersAreFull: characters.length >= MAX_CHARACTERS,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
}
