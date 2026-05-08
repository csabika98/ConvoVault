import { useContext } from "react";
import { CharacterContext } from "@/context/characters/CharacterContext";

export function useCharacters() {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error("useCharacters must be used within CharactersProvider");
  }
  return context;
}
