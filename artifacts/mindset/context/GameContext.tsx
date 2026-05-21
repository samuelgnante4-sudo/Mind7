import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface GameState {
  level: number;
  bestLevel: number;
  totalGamesPlayed: number;
}

interface GameContextType extends GameState {
  saveProgress: (level: number) => Promise<void>;
  resetGame: () => void;
  incrementGamesPlayed: () => Promise<void>;
}

const STORAGE_KEY = "@mindset_progress";

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>({
    level: 1,
    bestLevel: 1,
    totalGamesPlayed: 0,
  });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const saved = JSON.parse(raw) as Partial<GameState>;
          setState((prev) => ({ ...prev, ...saved }));
        } catch {
          // ignore parse errors
        }
      }
    });
  }, []);

  const saveProgress = useCallback(async (newLevel: number) => {
    setState((prev) => {
      const updated: GameState = {
        ...prev,
        level: newLevel,
        bestLevel: Math.max(prev.bestLevel, newLevel),
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const incrementGamesPlayed = useCallback(async () => {
    setState((prev) => {
      const updated: GameState = {
        ...prev,
        totalGamesPlayed: prev.totalGamesPlayed + 1,
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetGame = useCallback(() => {
    setState((prev) => ({ ...prev, level: 1 }));
  }, []);

  return (
    <GameContext.Provider
      value={{ ...state, saveProgress, resetGame, incrementGamesPlayed }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
