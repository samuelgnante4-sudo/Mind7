export type LevelType = "sequence" | "quiz" | "memory" | "reflection" | "pattern";
export type Category = "histoire" | "corps" | "science" | "philosophie" | "nature";

interface BaseLevel {
  id: number;
  type: LevelType;
  category: Category;
  title: string;
}

export interface SequenceLevel extends BaseLevel {
  type: "sequence";
  buttons: 4 | 6;
  length: number;
}

export interface QuizLevel extends BaseLevel {
  type: "quiz";
  question: string;
  options: string[];
  correct: number;
  fact: string;
}

export interface MemoryLevel extends BaseLevel {
  type: "memory";
  pairs: [string, string][];
}

export interface ReflectionLevel extends BaseLevel {
  type: "reflection";
  scenario: string;
  options: string[];
  insight: string;
  psychology: {
    concept: string;
    explanation: string;
    stats?: { label: string; pct: number }[];
  };
  hasTimer?: boolean;
}

export interface PatternLevel extends BaseLevel {
  type: "pattern";
  prompt: string;
  sequence: string[];
  options: string[];
  correct: number;
  explanation: string;
}

export type Level =
  | SequenceLevel
  | QuizLevel
  | MemoryLevel
  | ReflectionLevel
  | PatternLevel;

export const LEVELS: Level[] = [
  // ── CHAPITRE 1 : L'ÉVEIL ──────────────────────────────────────────────────
  {
    id: 1,
    type: "reflection",
    category: "philosophie",
    title: "La mère ou le père",
    scenario:
      "Un accident. Tu ne peux sauver qu'une seule personne. C'est ta mère ou ton père. Tu choisis qui ?",
    options: ["Ma mère", "Mon père", "Je ne peux pas choisir"],
    insight:
      "La majorité des gens choisissent leur mère — non par logique, mais par instinct. Ce choix n'est pas rationnel. Il est neurologique.",
    psychology: {
      concept: "Théorie de l'Attachement",
      explanation:
        "John Bowlby a démontré que le premier lien de sécurité d'un enfant — souvent la mère — crée une empreinte neurologique permanente. Sous pression extrême, le cerveau ne raisonne pas : il revient à ce premier ancrage. Ce n'est pas un manque d'amour pour l'autre. C'est la trace que laisse la survie.",
      stats: [
        { label: "Choisissent leur mère", pct: 68 },
        { label: "Choisissent leur père", pct: 18 },
        { label: "Refusent de choisir", pct: 14 },
      ],
    },
    hasTimer: true,
  },
  {
    id: 2,
    type: "quiz",
    category: "corps",
    title: "L'architecture intérieure",
    question: "Combien d'os possède un adulte humain ?",
    options: ["206", "300", "175", "250"],
    correct: 0,
    fact: "Un bébé naît avec environ 270 os. Certains fusionnent avec l'âge pour arriver à 206 chez l'adulte.",
  },
  {
    id: 3,
    type: "sequence",
    category: "science",
    title: "La mémoire des machines",
    buttons: 4,
    length: 3,
  },
  {
    id: 4,
    type: "pattern",
    category: "science",
    title: "La suite de Fibonacci",
    prompt: "1 · 1 · 2 · 3 · 5 · 8 · ?",
    sequence: ["1", "1", "2", "3", "5", "8", "?"],
    options: ["11", "13", "15", "12"],
    correct: 1,
    explanation:
      "13. Chaque nombre est la somme des deux précédents. Cette suite apparaît dans la nature : coquillages, fleurs, galaxies.",
  },
  {
    id: 5,
    type: "quiz",
    category: "histoire",
    title: "Le tournant de l'Histoire",
    question: "En quelle année la Révolution Française a-t-elle commencé ?",
    options: ["1789", "1776", "1804", "1815"],
    correct: 0,
    fact: "Le 14 juillet 1789, la prise de la Bastille marqua le début d'une révolution qui changea le monde entier.",
  },

  // ── CHAPITRE 2 : LE CORPS ─────────────────────────────────────────────────
  {
    id: 6,
    type: "memory",
    category: "corps",
    title: "Organes & fonctions",
    pairs: [
      ["Foie", "Détoxification"],
      ["Rein", "Filtration"],
      ["Poumon", "Respiration"],
      ["Pancréas", "Insuline"],
    ],
  },
  {
    id: 7,
    type: "reflection",
    category: "philosophie",
    title: "Le tramway",
    scenario:
      "Un tramway sans frein fonce vers 5 personnes attachées. Tu peux appuyer sur un levier pour le dévier — mais il tuera alors 1 personne innocente sur l'autre voie. Tu appuies ?",
    options: ["Oui, j'appuie", "Non, je n'interviens pas", "Je ne sais pas"],
    insight:
      "La plupart des gens appuient. Mais si on leur demande de pousser physiquement quelqu'un sur la voie pour sauver 5 personnes... ils refusent. Même résultat, même logique — mais ressenti totalement différent.",
    psychology: {
      concept: "Le Problème du Tramway",
      explanation:
        "Philosophe Judith Jarvis Thomson (1976). Tuer par action directe active notre amygdale — la zone de peur et de dégoût. Tuer via un levier active le cortex préfrontal (calcul logique). Notre cerveau traite 'pousser quelqu'un' et 'appuyer sur un bouton' comme deux actes moralement différents, même si le résultat est identique. C'est ce qu'on appelle l'aversion à l'action directe.",
      stats: [
        { label: "Appuient sur le levier", pct: 85 },
        { label: "Refusent d'intervenir", pct: 9 },
        { label: "Hésitent", pct: 6 },
      ],
    },
    hasTimer: true,
  },
  {
    id: 8,
    type: "quiz",
    category: "corps",
    title: "Le muscle oublié",
    question: "Quel est le plus grand muscle du corps humain ?",
    options: ["Grand fessier", "Quadriceps", "Grand dorsal", "Biceps"],
    correct: 0,
    fact: "Le grand fessier (fesse) est le plus grand et puissant muscle. Il nous permet de courir, monter des escaliers et rester debout.",
  },
  {
    id: 9,
    type: "sequence",
    category: "science",
    title: "Rythme et mémoire",
    buttons: 4,
    length: 4,
  },
  {
    id: 10,
    type: "pattern",
    category: "science",
    title: "Les carrés parfaits",
    prompt: "1 · 4 · 9 · 16 · 25 · ?",
    sequence: ["1", "4", "9", "16", "25", "?"],
    options: ["30", "36", "32", "40"],
    correct: 1,
    explanation:
      "36. Ce sont les carrés : 1²=1, 2²=4, 3²=9... 6²=36. Les grecs anciens les dessinaient littéralement en carrés de pierres.",
  },

  // ── CHAPITRE 3 : LE TEMPS ─────────────────────────────────────────────────
  {
    id: 11,
    type: "quiz",
    category: "corps",
    title: "L'organe de la pensée",
    question: "Quelle proportion du cerveau humain utilisons-nous ?",
    options: ["100%", "10%", "50%", "30%"],
    correct: 0,
    fact: "Le mythe du '10%' est faux. L'IRM montre que nous utilisons pratiquement toutes les zones du cerveau, même en dormant.",
  },
  {
    id: 12,
    type: "memory",
    category: "histoire",
    title: "Inventeurs & inventions",
    pairs: [
      ["Fleming", "Pénicilline"],
      ["Tesla", "Courant alternatif"],
      ["Gutenberg", "Imprimerie"],
      ["Darwin", "Évolution"],
    ],
  },
  {
    id: 13,
    type: "reflection",
    category: "philosophie",
    title: "La trahison de l'ami",
    scenario:
      "Ton meilleur ami a renversé quelqu'un en voiture. La victime est à l'hôpital mais stable. Personne n'a vu. Ton ami te supplie de te taire. Tu fais quoi ?",
    options: ["Je me tais pour lui", "Je le force à se dénoncer", "J'appelle moi-même la police", "Je ne sais pas"],
    insight:
      "Ce dilemme active simultanément deux systèmes moraux opposés dans ton cerveau. L'un te dit que la loyauté est sacrée. L'autre que la justice prime. La plupart des gens mentent — et souffrent de l'avoir fait.",
    psychology: {
      concept: "Dissonance Cognitive",
      explanation:
        "Leon Festinger (1957). Quand deux valeurs que tu portes entrent en conflit — ici, loyauté vs justice — ton cerveau ressent une douleur réelle, similaire à une douleur physique (prouvé par IRM). Pour réduire cette tension, tu choisiras l'option qui protège le mieux ton image de toi-même. Les gens loyaux choisissent la loyauté. Les gens 'justes' choisissent la justice. Les deux se croient moralement supérieurs.",
      stats: [
        { label: "Se taisent pour l'ami", pct: 44 },
        { label: "Forcent l'ami à se dénoncer", pct: 31 },
        { label: "Appellent eux-mêmes la police", pct: 17 },
        { label: "Ne savent pas", pct: 8 },
      ],
    },
    hasTimer: false,
  },
  {
    id: 14,
    type: "quiz",
    category: "nature",
    title: "Les poumons de la Terre",
    question: "Combien d'années peut vivre un séquoia géant ?",
    options: ["500 ans", "1 000 ans", "3 000 ans", "10 000 ans"],
    correct: 2,
    fact: "Certains séquoias ont plus de 3 200 ans. Ils ont vu l'essor et la chute d'empires entiers sans bouger.",
  },
  {
    id: 15,
    type: "sequence",
    category: "science",
    title: "Concentration",
    buttons: 4,
    length: 5,
  },

  // ── CHAPITRE 4 : LA MATIÈRE ───────────────────────────────────────────────
  {
    id: 16,
    type: "pattern",
    category: "science",
    title: "Les puissances de 2",
    prompt: "1 · 2 · 4 · 8 · 16 · ?",
    sequence: ["1", "2", "4", "8", "16", "?"],
    options: ["24", "30", "32", "20"],
    correct: 2,
    explanation:
      "32. Chaque terme est doublé. Un seul grain de riz doublé 64 fois représente plus que toute la production mondiale.",
  },
  {
    id: 17,
    type: "quiz",
    category: "science",
    title: "La vitesse de la lumière",
    question: "À quelle vitesse voyage la lumière dans le vide ?",
    options: ["300 000 km/s", "150 000 km/s", "1 000 000 km/s", "30 000 km/s"],
    correct: 0,
    fact: "299 792 km/s. La lumière du Soleil met 8 minutes pour nous atteindre. Des étoiles que tu vois sont mortes depuis des millénaires.",
  },
  {
    id: 18,
    type: "memory",
    category: "science",
    title: "Éléments chimiques",
    pairs: [
      ["Or", "Au"],
      ["Fer", "Fe"],
      ["Sodium", "Na"],
      ["Plomb", "Pb"],
    ],
  },
  {
    id: 19,
    type: "reflection",
    category: "philosophie",
    title: "Ton enfant ou 10 inconnus",
    scenario:
      "Une catastrophe. Tu peux sauver ton enfant (ou la personne que tu aimes le plus au monde) — ou 10 inconnus. Un seul choix. Tu fais quoi ?",
    options: ["Je sauve mon enfant / ma personne", "Je sauve les 10 inconnus", "Je ne peux pas répondre à ça"],
    insight:
      "Presque tout le monde sauve son enfant. Et presque tout le monde ressent de la honte d'avoir répondu si vite. Pourtant, c'est biologiquement inévitable — et les philosophes le savent depuis toujours.",
    psychology: {
      concept: "Biais de la Victime Identifiable",
      explanation:
        "Psychologue Paul Slovic. Notre cerveau n'est pas conçu pour ressentir les statistiques. '10 morts inconnus' active moins d'émotion qu'un seul visage familier. L'évolution t'a programmé pour protéger tes gènes et tes liens — pas pour être utilitariste. Ce biais explique aussi pourquoi on donne plus pour sauver un enfant avec une photo que pour sauver des milliers sans nom.",
      stats: [
        { label: "Sauvent leur proche", pct: 91 },
        { label: "Sauvent les 10 inconnus", pct: 5 },
        { label: "Refusent de répondre", pct: 4 },
      ],
    },
    hasTimer: true,
  },
  {
    id: 20,
    type: "quiz",
    category: "histoire",
    title: "L'Égypte ancienne",
    question: "Combien de pyramides existent en Égypte ?",
    options: ["3", "23", "118", "7"],
    correct: 2,
    fact: "Il existe environ 118 pyramides en Égypte. Gizeh est la plus célèbre, mais les pharaons en ont construit pendant 2 000 ans.",
  },

  // ── CHAPITRE 5 : L'IDENTITÉ ───────────────────────────────────────────────
  {
    id: 21,
    type: "sequence",
    category: "science",
    title: "6 dimensions",
    buttons: 6,
    length: 4,
  },
  {
    id: 22,
    type: "pattern",
    category: "science",
    title: "La suite des triangulaires",
    prompt: "1 · 3 · 6 · 10 · 15 · ?",
    sequence: ["1", "3", "6", "10", "15", "?"],
    options: ["18", "19", "21", "20"],
    correct: 2,
    explanation:
      "21. On ajoute 2, puis 3, puis 4... Ce sont les nombres triangulaires. Disposés en triangle, ils forment des pyramides parfaites.",
  },
  {
    id: 23,
    type: "quiz",
    category: "corps",
    title: "Le moteur du corps",
    question: "Combien de fois le cœur bat-il en moyenne par jour ?",
    options: ["60 000", "100 000", "50 000", "200 000"],
    correct: 1,
    fact: "Environ 100 000 fois par jour, 35 millions par an. En une vie, il bat plus de 2,5 milliards de fois sans jamais s'arrêter.",
  },
  {
    id: 24,
    type: "memory",
    category: "philosophie",
    title: "Philosophes & idées",
    pairs: [
      ["Descartes", "Je pense donc je suis"],
      ["Nietzsche", "Dieu est mort"],
      ["Platon", "La caverne"],
      ["Sartre", "L'existence précède l'essence"],
    ],
  },
  {
    id: 25,
    type: "reflection",
    category: "philosophie",
    title: "1 million contre une vie",
    scenario:
      "On t'offre 1 million d'euros maintenant. En échange, quelque part dans le monde, une personne que tu ne connaîtras jamais souffrira chaque jour du reste de sa vie. Tu acceptes ?",
    options: ["Oui, j'accepte", "Non, je refuse", "J'ai besoin d'y réfléchir"],
    insight:
      "La plupart des gens refusent... quand la question est posée directement. Mais dans la vie réelle, des milliers de nos choix quotidiens font exactement ça — et on ne pose pas la question.",
    psychology: {
      concept: "Éloignement Psychologique",
      explanation:
        "Chercheur Yaacov Trope. Plus une personne, un événement ou une conséquence est éloignée de nous — dans le temps, l'espace ou la relation — moins notre cerveau y attache de poids moral. Un ouvrier qui souffre dans une usine à 8 000 km pour fabriquer ton téléphone active dix fois moins d'empathie qu'un voisin qui souffre devant toi. Ce n'est pas de la méchanceté — c'est la limite de notre architecture mentale.",
      stats: [
        { label: "Refusent le million", pct: 62 },
        { label: "Acceptent le million", pct: 27 },
        { label: "Hésitent", pct: 11 },
      ],
    },
    hasTimer: false,
  },

  // ── CHAPITRE 6 : L'UNIVERS ────────────────────────────────────────────────
  {
    id: 26,
    type: "quiz",
    category: "science",
    title: "Le système solaire",
    question: "Quelle planète possède le plus de lunes connues ?",
    options: ["Jupiter", "Saturne", "Uranus", "Neptune"],
    correct: 1,
    fact: "Saturne a 145 lunes confirmées (2023), dépassant Jupiter. Sa plus grande lune, Titan, possède une atmosphère dense.",
  },
  {
    id: 27,
    type: "sequence",
    category: "science",
    title: "L'ordre dans le chaos",
    buttons: 6,
    length: 5,
  },
  {
    id: 28,
    type: "pattern",
    category: "science",
    title: "Suite mystère",
    prompt: "3 · 6 · 11 · 18 · 27 · ?",
    sequence: ["3", "6", "11", "18", "27", "?"],
    options: ["36", "38", "40", "35"],
    correct: 1,
    explanation:
      "38. On ajoute 3, 5, 7, 9, 11... des nombres impairs croissants. La différence entre les différences est constante : 2.",
  },
  {
    id: 29,
    type: "reflection",
    category: "philosophie",
    title: "Voler pour survivre",
    scenario:
      "Tu es sans argent depuis 3 jours. Tes enfants n'ont pas mangé. Tu passes devant une épicerie. Le gérant te tourne le dos. Tu voleras de la nourriture ?",
    options: ["Oui, je vole", "Non, je ne vole pas", "Je demande d'abord"],
    insight:
      "La majorité répond 'oui' — et ensuite ressent une culpabilité immédiate d'avoir dit oui. Ce double mouvement est exactement ce que les chercheurs observent : notre morale n'est pas absolue. Elle est contextuelle.",
    psychology: {
      concept: "Relativisme Moral & Hiérarchie des Besoins",
      explanation:
        "Abraham Maslow (1943) + études de Lawrence Kohlberg. Notre système moral a des niveaux. La survie prime la propriété — biologiquement, instinctivement. Mais la honte sociale (être perçu comme voleur) active un contre-signal puissant. Les personnes qui refusent de voler malgré la faim extrême ne sont pas 'plus morales' : elles donnent plus de poids à l'identité sociale qu'à la survie physique. Les deux sont des réponses humaines valides.",
      stats: [
        { label: "Voleraient pour survivre", pct: 74 },
        { label: "Ne voleraient pas", pct: 14 },
        { label: "Demanderaient d'abord", pct: 12 },
      ],
    },
    hasTimer: false,
  },
  {
    id: 30,
    type: "reflection",
    category: "philosophie",
    title: "La machine à bonheur",
    scenario:
      "On te propose de brancher ton cerveau à une machine. À l'intérieur : une vie parfaite, du bonheur constant, des souvenirs magnifiques. Tout est faux — mais tu ne le sauras jamais. Tu entres ?",
    options: ["Oui, j'entre", "Non, je reste dans la réalité", "Je ne suis pas sûr"],
    insight:
      "La majorité dit non. Mais pourquoi ? Si le bonheur est identique, si la douleur est absente... qu'est-ce qu'on protège en refusant ? Ce que tu réponds révèle ce que tu values vraiment dans une vie.",
    psychology: {
      concept: "Argument de la Machine à Expériences",
      explanation:
        "Philosophe Robert Nozick (1974). Cet argument montre que les humains ne veulent pas seulement du bonheur — ils veulent que ce bonheur soit réel. On valorise l'authenticité, le lien véritable, le fait d'agir sur le monde plutôt que de le simuler. Ceux qui refusent la machine croient à un sens objectif de la vie. Ceux qui acceptent croient que la conscience subjective est tout ce qui compte. Ni l'un ni l'autre n'a tort.",
      stats: [
        { label: "Refusent la machine", pct: 78 },
        { label: "Entrent dans la machine", pct: 14 },
        { label: "Hésitent", pct: 8 },
      ],
    },
    hasTimer: false,
  },
];

export const CATEGORY_COLORS: Record<Category, string> = {
  histoire: "#d4a017",
  corps: "#e05c7a",
  science: "#4fd1c5",
  philosophie: "#9f7aea",
  nature: "#68d391",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  histoire: "HISTOIRE",
  corps: "CORPS HUMAIN",
  science: "SCIENCE",
  philosophie: "PHILOSOPHIE",
  nature: "NATURE",
};

export const CHAPTERS = [
  { id: 1, title: "L'Éveil", levels: [1, 2, 3, 4, 5] },
  { id: 2, title: "Le Corps", levels: [6, 7, 8, 9, 10] },
  { id: 3, title: "Le Temps", levels: [11, 12, 13, 14, 15] },
  { id: 4, title: "La Matière", levels: [16, 17, 18, 19, 20] },
  { id: 5, title: "L'Identité", levels: [21, 22, 23, 24, 25] },
  { id: 6, title: "L'Univers", levels: [26, 27, 28, 29, 30] },
];
