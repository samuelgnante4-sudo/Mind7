import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { LEVELS } from "@/data/levels";

interface GameState {
  currentLevelId: number;
  completedLevels: number[];
  totalScore: number;
}

interface GameContextType extends GameState {
  completeLevel: (levelId: number) => Promise<void>;
  resetProgress: () => Promise<void>;
  isLevelCompleted: (levelId: number) => boolean;
  isLevelUnlocked: (levelId: number) => boolean;
}

const STORAGE_KEY = "@mind7_progress_v2";

const defaultState: GameState = {
  currentLevelId: 1,
  completedLevels: [],
  totalScore: 0,
};

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(defaultState);

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

  const completeLevel = useCallback(async (levelId: number) => {
    setState((prev) => {
      const completedLevels = prev.completedLevels.includes(levelId)
        ? prev.completedLevels
        : [...prev.completedLevels, levelId];

      const nextId = levelId + 1;
      const currentLevelId =
        nextId <= LEVELS.length ? nextId : prev.currentLevelId;

      const updated: GameState = {
        ...prev,
        completedLevels,
        currentLevelId,
        totalScore: prev.totalScore + 100,
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetProgress = useCallback(async () => {
    const fresh = defaultState;
    setState(fresh);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  }, []);

  const isLevelCompleted = useCallback(
    (levelId: number) => state.completedLevels.includes(levelId),
    [state.completedLevels]
  );

  const isLevelUnlocked = useCallback(
    (levelId: number) => {
      if (levelId === 1) return true;
      return state.completedLevels.includes(levelId - 1);
    },
    [state.completedLevels]
  );

  return (
    <GameContext.Provider
      value={{
        ...state,
        completeLevel,
        resetProgress,
        isLevelCompleted,
        isLevelUnlocked,
      }}
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
