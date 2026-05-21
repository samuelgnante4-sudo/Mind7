import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export const THEME_COLORS = [
  { name: "Cosmos", value: "#9f7aea" },
  { name: "Ocean", value: "#4fd1c5" },
  { name: "Ciel", value: "#63b3ed" },
  { name: "Flamme", value: "#f6ad55" },
  { name: "Pluie", value: "#e05c7a" },
  { name: "Forêt", value: "#68d391" },
  { name: "Soleil", value: "#ecc94b" },
  { name: "Sang", value: "#fc8181" },
];

const STORAGE_KEY = "@mind7_theme_color";
const DEFAULT_COLOR = THEME_COLORS[0].value;

interface ThemeContextType {
  primaryColor: string;
  setPrimaryColor: (color: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  primaryColor: DEFAULT_COLOR,
  setPrimaryColor: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [primaryColor, setPrimaryColorState] = useState(DEFAULT_COLOR);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved) setPrimaryColorState(saved);
    });
  }, []);

  const setPrimaryColor = useCallback(async (color: string) => {
    setPrimaryColorState(color);
    await AsyncStorage.setItem(STORAGE_KEY, color);
  }, []);

  return (
    <ThemeContext.Provider value={{ primaryColor, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
