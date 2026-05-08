import { createContext } from "react";

export const initialThemeState = {
  theme: "system",
  setTheme: () => null,
};

export const ThemeProviderContext = createContext(initialThemeState);
