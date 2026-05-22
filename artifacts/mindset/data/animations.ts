export type AnimType = "balance" | "ripple" | "brain" | "paths" | "cosmos";

// Maps levelId → animation type
export const LEVEL_ANIM: Record<number, AnimType> = {
  // balance — weighing lives, competing values
  2: "balance",   // tramway
  4: "balance",   // violoniste
  5: "balance",   // Heinz
  8: "balance",   // transplantation
  16: "balance",  // ton enfant
  20: "balance",  // voler pour survivre

  // ripple — social spreading, group dynamics
  3: "ripple",    // Singer / enfant qui se noie
  11: "ripple",   // Milgram
  12: "ripple",   // effet du spectateur
  13: "ripple",   // trahison de l'ami
  14: "ripple",   // prisonnier
  19: "ripple",   // 1 million

  // brain — mind, memory, consciousness
  6: "brain",     // machine à bonheur
  7: "brain",     // bateau de Thésée
  9: "brain",     // mémoire effacée
  10: "brain",    // cerveau dans la cuve
  27: "brain",    // libre arbitre
  28: "brain",    // après la mort

  // paths — identity, choices, direction
  1: "paths",     // mère ou père
  15: "paths",    // mensonge bienveillant
  17: "paths",    // argent malhonnête
  18: "paths",    // vengeance
  21: "paths",    // pensées à voix haute
  22: "paths",    // recommencer à zéro
  23: "paths",    // regard des autres
  24: "paths",    // héritage familial
  25: "paths",    // solitude absolue

  // cosmos — existential, universe, eternity
  26: "cosmos",   // fin du monde
  29: "cosmos",   // immortalité
  30: "cosmos",   // dernière question
};
