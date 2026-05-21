import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { LEVELS } from "@/data/levels";

// ── Profile tiers ──────────────────────────────────────────────────────────

export interface PsychProfile {
  id: string;
  label: string;
  emoji: string;
  accent: string;
  bg: string;
  range: [number, number]; // [min, max] average score
  tagline: string;
  description: string;
  percentile: string; // approx % of population
}

export const PSYCH_PROFILES: PsychProfile[] = [
  {
    id: "psychopathe",
    label: "Psychopathe subclinique",
    emoji: "🕳️",
    accent: "#fc4a4a",
    bg: "#2d0000",
    range: [-3, -1.8],
    tagline: "Froid. Calculateur. Sans remords.",
    description:
      "Tu prends tes décisions sans laisser l'émotion interférer. L'efficacité prime sur tout. Tu appartiens à environ 1% de la population.",
    percentile: "1%",
  },
  {
    id: "stratege",
    label: "Stratège froid",
    emoji: "🧊",
    accent: "#63b3ed",
    bg: "#0a1a2d",
    range: [-1.8, -0.8],
    tagline: "Tu optimises. Le résultat prime sur tout.",
    description:
      "Tu analyses avant de ressentir. Rationnel et efficace, tu vois les autres comme des variables dans ton équation.",
    percentile: "12%",
  },
  {
    id: "pragmatique",
    label: "Pragmatique",
    emoji: "⚖️",
    accent: "#ecc94b",
    bg: "#1a1500",
    range: [-0.8, -0.2],
    tagline: "Ni froid, ni naïf. Tu calcules.",
    description:
      "Tu peixes le pour et le contre. Ni cynique, ni idéaliste. Tu cherches la solution raisonnable, pas la plus belle.",
    percentile: "22%",
  },
  {
    id: "equilibre",
    label: "Équilibré",
    emoji: "🌓",
    accent: "#9f7aea",
    bg: "#0d0d1a",
    range: [-0.2, 0.2],
    tagline: "Entre cœur et raison, tu navigues.",
    description:
      "Tu oscilles entre logique et empathie selon le contexte. Comme la majorité des gens — et c'est rare d'en être conscient.",
    percentile: "30%",
  },
  {
    id: "empathique",
    label: "Empathique",
    emoji: "🤝",
    accent: "#68d391",
    bg: "#001a0a",
    range: [0.2, 0.8],
    tagline: "Tu ressens avant de décider.",
    description:
      "Les autres comptent vraiment. Tu te mets à leur place avant d'agir. Parfois au détriment de la logique.",
    percentile: "20%",
  },
  {
    id: "humaniste",
    label: "Humaniste",
    emoji: "❤️",
    accent: "#e05c7a",
    bg: "#1a0008",
    range: [0.8, 1.8],
    tagline: "Tu te bats pour les autres.",
    description:
      "Tu mets les autres avant toi-même, même quand ça te coûte quelque chose. Une position rare et exigeante.",
    percentile: "12%",
  },
  {
    id: "altruiste",
    label: "Altruiste pur",
    emoji: "🕊️",
    accent: "#38b2ac",
    bg: "#001a1a",
    range: [1.8, 3],
    tagline: "Ta vie n'est pas plus précieuse que celle des autres.",
    description:
      "Tu sacrifierais tout pour les autres. Philosophiquement cohérent — humainement rare. Moins de 3% de la population.",
    percentile: "3%",
  },
];

export function getProfile(avgScore: number): PsychProfile {
  for (const p of PSYCH_PROFILES) {
    if (avgScore >= p.range[0] && avgScore < p.range[1]) return p;
  }
  // clamp edges
  if (avgScore < PSYCH_PROFILES[0].range[0]) return PSYCH_PROFILES[0];
  return PSYCH_PROFILES[PSYCH_PROFILES.length - 1];
}

export function getProfilePosition(avgScore: number): number {
  // Returns 0–1 position on the spectrum
  const min = -2.5;
  const max = 2.5;
  return Math.max(0, Math.min(1, (avgScore - min) / (max - min)));
}

// ── State ──────────────────────────────────────────────────────────────────

interface GameState {
  currentLevelId: number;
  completedLevels: number[];
  choiceScores: number[]; // score of each choice made (one per completed level)
}

interface GameContextType extends GameState {
  completeLevel: (levelId: number, choiceScore: number) => Promise<void>;
  resetProgress: () => Promise<void>;
  isLevelCompleted: (levelId: number) => boolean;
  isLevelUnlocked: (levelId: number) => boolean;
  profileScore: number | null; // null = not enough data yet
  profile: PsychProfile | null;
  profilePosition: number; // 0–1 for spectrum
}

const STORAGE_KEY = "@mind7_progress_v4";

const defaultState: GameState = {
  currentLevelId: 1,
  completedLevels: [],
  choiceScores: [],
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
          // ignore
        }
      }
    });
  }, []);

  const completeLevel = useCallback(async (levelId: number, choiceScore: number) => {
    setState((prev) => {
      const alreadyDone = prev.completedLevels.includes(levelId);
      const completedLevels = alreadyDone
        ? prev.completedLevels
        : [...prev.completedLevels, levelId];
      const choiceScores = alreadyDone
        ? prev.choiceScores
        : [...prev.choiceScores, choiceScore];

      const nextId = levelId + 1;
      const currentLevelId = nextId <= LEVELS.length ? nextId : prev.currentLevelId;

      const updated: GameState = { ...prev, completedLevels, choiceScores, currentLevelId };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetProgress = useCallback(async () => {
    setState(defaultState);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
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

  const profileScore = useMemo(() => {
    if (state.choiceScores.length < 1) return null;
    const sum = state.choiceScores.reduce((a, b) => a + b, 0);
    return sum / state.choiceScores.length;
  }, [state.choiceScores]);

  const profile = useMemo(
    () => (profileScore !== null ? getProfile(profileScore) : null),
    [profileScore]
  );

  const profilePosition = useMemo(
    () => (profileScore !== null ? getProfilePosition(profileScore) : 0.5),
    [profileScore]
  );

  return (
    <GameContext.Provider
      value={{
        ...state,
        completeLevel,
        resetProgress,
        isLevelCompleted,
        isLevelUnlocked,
        profileScore,
        profile,
        profilePosition,
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
