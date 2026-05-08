import { useRef, useState } from "react";
import { CharacterContext } from "@/context/characters/CharacterContext";
import { fetchWikipediaPortraitUrl } from "@/services/wikipediaPortrait";

const MAX_CHARACTERS = 5;

function deriveInitials(name) {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function CharactersProvider({ children }) {
  const [characters, setCharacters] = useState([]);
  const [simulationRequest, setSimulationRequest] = useState(null);
  const nextCharacterIdRef = useRef(1);
  const nextSimulationRequestIdRef = useRef(1);

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
      prev.map((c) =>
        c.id === id ? { ...c, name: trimmed, initials: deriveInitials(trimmed) } : c
      )
    );
  };

  const startSimulation = async () => {
    const participants = characters
      .map((character) => ({
        id: character.id,
        name: String(character.name ?? "").trim(),
        avatarUrl: character.avatarUrl ?? "",
        initials: character.initials ?? deriveInitials(character.name),
      }))
      .filter((character) => character.name);

    if (participants.length < 2) return null;

    const participantsWithAvatars = await Promise.all(
      participants.map(async (participant) => ({
        ...participant,
        avatarUrl:
          participant.avatarUrl ||
          (await fetchWikipediaPortraitUrl(participant.name)) ||
          "",
      }))
    );

    setCharacters((prev) =>
      prev.map((character) => {
        const participant = participantsWithAvatars.find(
          (item) => item.id === character.id
        );
        if (!participant) return character;
        return {
          ...character,
          avatarUrl: participant.avatarUrl,
          initials: participant.initials,
        };
      })
    );

    const request = {
      id: nextSimulationRequestIdRef.current,
      participants: participantsWithAvatars,
    };
    nextSimulationRequestIdRef.current += 1;
    setSimulationRequest(request);
    return request.id;
  };

  return (
    <CharacterContext.Provider
      value={{
        characters,
        addCharacter,
        deleteCharacter,
        updateCharacterName,
        startSimulation,
        simulationRequest,
        charactersAreFull: characters.length >= MAX_CHARACTERS,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
}
