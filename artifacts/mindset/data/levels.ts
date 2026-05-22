// 1. Types de base exportés
export type LevelType = "reflection";
export type Category = "philosophie" | "psychologie" | "morale" | "identite" | "societe" | "existentiel";

// 2. Interfaces exportées
export interface BaseLevel {
  id: number;
  type: LevelType;
  category: Category;
  title: string;
}

export interface ReflectionLevel extends BaseLevel {
  type: "reflection";
  scenario: string;
  options: string[];
  optionScores: number[];
  insight: string;
  psychology: {
    concept: string;
    explanation: string;
    known: "célèbre" | "méconnu";
    stats?: { label: string; pct: number }[];
  };
  hasTimer?: boolean;
  speechText?: string;
}

// Ajout des interfaces pour les autres types potentiels de jeux que ton code réclame
export interface MemoryLevel extends BaseLevel { type: "memory" }
export interface PatternLevel extends BaseLevel { type: "pattern" }
export interface QuizLevel extends BaseLevel { type: "quiz" }
export interface SequenceLevel extends BaseLevel { type: "sequence" }

// 3. Union type exporté
export type Level = ReflectionLevel | MemoryLevel | PatternLevel | QuizLevel | SequenceLevel;

// 4. Données exportées
export const LEVELS: Level[] = [
  // ... (Garde tout ton contenu actuel ici, de l'id 1 à 30)
];

// 5. Constantes exportées
export const CATEGORY_COLORS: Record<Category, string> = {
  philosophie: "#9f7aea",
  psychologie: "#63b3ed",
  morale: "#f6ad55",
  identite: "#e05c7a",
  societe: "#4fd1c5",
  existentiel: "#68d391",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  philosophie: "PHILOSOPHIE",
  psychologie: "PSYCHOLOGIE",
  morale: "MORALE",
  identite: "IDENTITÉ",
  societe: "SOCIÉTÉ",
  existentiel: "EXISTENTIEL",
};

export const CHAPTERS = [
  { id: 1, title: "Les Grands Dilemmes", levels: [1, 2, 3, 4, 5] },
  { id: 2, title: "Corps & Esprit", levels: [6, 7, 8, 9, 10] },
  { id: 3, title: "La Société", levels: [11, 12, 13, 14, 15] },
  { id: 4, title: "La Morale", levels: [16, 17, 18, 19, 20] },
  { id: 5, title: "L'Identité", levels: [21, 22, 23, 24, 25] },
  { id: 6, title: "L'Univers", levels: [26, 27, 28, 29, 30] },
];
