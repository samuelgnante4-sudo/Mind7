export interface LevelQuote {
  text: string;
  author: string;
  year: string;
}

// One quote per level (indexed by levelId 1–30)
export const LEVEL_QUOTES: Record<number, LevelQuote> = {
  1: {
    text: "Le premier lien d'amour structure tous les autres.",
    author: "John Bowlby",
    year: "1969",
  },
  2: {
    text: "Le plus grand bonheur du plus grand nombre est le fondement de la morale.",
    author: "Jeremy Bentham",
    year: "1789",
  },
  3: {
    text: "Si tu peux empêcher quelque chose de mauvais sans rien sacrifier d'équivalent, tu dois le faire.",
    author: "Peter Singer",
    year: "1972",
  },
  4: {
    text: "Le droit à la vie ne donne pas le droit d'utiliser le corps d'autrui sans consentement.",
    author: "Judith Jarvis Thomson",
    year: "1971",
  },
  5: {
    text: "Agis de telle sorte que tu traites l'humanité toujours comme une fin, jamais simplement comme un moyen.",
    author: "Emmanuel Kant",
    year: "1785",
  },
  6: {
    text: "Ce qui compte, c'est la façon dont les choses semblent de l'intérieur.",
    author: "Robert Nozick",
    year: "1974",
  },
  7: {
    text: "On ne se baigne jamais deux fois dans le même fleuve.",
    author: "Héraclite",
    year: "~500 av. J.-C.",
  },
  8: {
    text: "Il y a des choses qu'un homme de bien ne peut pas faire, quelles que soient les conséquences.",
    author: "Bernard Williams",
    year: "1973",
  },
  9: {
    text: "La mémoire n'est pas un enregistrement — c'est une reconstruction permanente.",
    author: "Elizabeth Loftus",
    year: "1974",
  },
  10: {
    text: "Je pense, donc je suis.",
    author: "René Descartes",
    year: "1637",
  },
  11: {
    text: "La banalité du mal réside dans l'obéissance, pas dans la haine.",
    author: "Hannah Arendt",
    year: "1963",
  },
  12: {
    text: "La passivité de l'homme bon est l'ennemi le plus puissant du bien.",
    author: "Edmund Burke",
    year: "1770",
  },
  13: {
    text: "Deux valeurs peuvent entrer en conflit sans que l'une soit fausse.",
    author: "Isaiah Berlin",
    year: "1958",
  },
  14: {
    text: "La coopération est rationnelle — mais seulement si l'autre coopère aussi.",
    author: "Robert Axelrod",
    year: "1984",
  },
  15: {
    text: "Un mensonge dit par amour vaut-il mieux qu'une vérité dite par cruauté ?",
    author: "Fyodor Dostoevski",
    year: "1880",
  },
  16: {
    text: "Les statistiques sont des êtres humains dont on a retiré les larmes.",
    author: "Paul Brodeur",
    year: "1985",
  },
  17: {
    text: "Il est impossible de toucher ce qui est impur sans s'en salir un peu.",
    author: "Marc Aurèle",
    year: "~170",
  },
  18: {
    text: "Avant de te lancer dans la vengeance, creuse deux tombes.",
    author: "Confucius",
    year: "~500 av. J.-C.",
  },
  19: {
    text: "La distance psychologique rend les autres invisibles.",
    author: "Yaacov Trope",
    year: "2010",
  },
  20: {
    text: "La nécessité n'a pas de loi.",
    author: "Publilius Syrus",
    year: "~50 av. J.-C.",
  },
  21: {
    text: "Nous jouons tous un rôle. La question est : le savons-nous ?",
    author: "Erving Goffman",
    year: "1959",
  },
  22: {
    text: "L'identité n'est pas une chose — c'est une histoire.",
    author: "Derek Parfit",
    year: "1984",
  },
  23: {
    text: "L'enfer, c'est les autres.",
    author: "Jean-Paul Sartre",
    year: "1944",
  },
  24: {
    text: "On n'hérite pas de la terre de ses ancêtres, on l'emprunte à ses enfants.",
    author: "Antoine de Saint-Exupéry",
    year: "~1943",
  },
  25: {
    text: "Tout le malheur des hommes vient d'une seule chose : ne savoir pas demeurer en repos dans une chambre.",
    author: "Blaise Pascal",
    year: "1670",
  },
  26: {
    text: "L'amour particulier n'est pas simplement une réaction à une valeur générale.",
    author: "Bernard Williams",
    year: "1976",
  },
  27: {
    text: "Le cerveau décide avant que vous sachiez que vous avez décidé.",
    author: "Benjamin Libet",
    year: "1983",
  },
  28: {
    text: "Quand la mort est là, je ne suis plus là. Quand je suis là, la mort n'est pas là.",
    author: "Épicure",
    year: "~300 av. J.-C.",
  },
  29: {
    text: "L'immortalité vous priverait de tout ce qui donne de l'urgence à vos désirs.",
    author: "Bernard Williams",
    year: "1973",
  },
  30: {
    text: "Nous regrettons moins ce que nous avons fait que ce que nous n'avons pas osé faire.",
    author: "Daniel Kahneman",
    year: "2011",
  },
};

// Fallback quotes if level has been completed
export const GENERAL_QUOTES: LevelQuote[] = [
  { text: "Connais-toi toi-même.", author: "Socrate", year: "~400 av. J.-C." },
  { text: "L'homme est la mesure de toutes choses.", author: "Protagoras", year: "~450 av. J.-C." },
  { text: "Nous sommes ce que nous faisons répétitivement.", author: "Aristote", year: "~350 av. J.-C." },
  { text: "La vie non examinée ne vaut pas la peine d'être vécue.", author: "Socrate", year: "399 av. J.-C." },
];
