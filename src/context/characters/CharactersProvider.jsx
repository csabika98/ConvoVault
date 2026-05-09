import { useRef, useState } from "react";
import { CharacterContext } from "@/context/characters/CharacterContext";
import { fetchWikipediaPortraitUrl } from "@/services/wikipediaPortrait";
import { getAiReply } from "@/services/aiRouting";
import { buildRandomCharactersPrompt } from "@/config/systemPrompt";

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

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

  const randomizeCharacters = async () => {
    const count = randomInteger(2, MAX_CHARACTERS);
    const names = await generateRandomCharacterNames(count);
    if (names.length < 2) return characters;

    const nextCharacters = await Promise.all(
      names.map(async (name, index) => ({
        id: nextCharacterIdRef.current + index,
        name,
        avatarUrl: (await fetchWikipediaPortraitUrl(name)) || "",
        initials: deriveInitials(name),
      }))
    );

    nextCharacterIdRef.current += count;
    setCharacters(nextCharacters);
    return nextCharacters;
  };

  const startSimulation = async (options = {}) => {
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
      durationMs: Number(options.durationMs) || 60_000,
      topic: String(options.topic ?? "").trim(),
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
        randomizeCharacters,
        startSimulation,
        simulationRequest,
        charactersAreFull: characters.length >= MAX_CHARACTERS,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
}

async function generateRandomCharacterNames(count) {
  const response = await getAiReply(buildRandomCharactersPrompt(count));

  try {
    const parsed = JSON.parse(response.content);
    const names = Array.isArray(parsed?.characters)
      ? parsed.characters
          .map((name) => String(name ?? "").trim())
          .filter(Boolean)
      : [];

    return [...new Set(names)].slice(0, count);
  } catch {
    return [];
  }
}
