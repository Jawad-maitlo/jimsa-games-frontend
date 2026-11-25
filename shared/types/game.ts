export type GameId =
  | "red-light-green-light"
  | "glass-bridge"
  | "chess"
  | "ludo"
  | "card-clash"
  | "trust-or-betray"
  | "treasure-hunt";

export type GameCategory =
  | "survival"
  | "strategy"
  | "board"
  | "card"
  | "puzzle"
  | "social";

export interface GameDefinition {
  id: GameId;
  name: string;
  shortName: string;
  category: GameCategory;
  categoryLabel: string;
  description: string;
  rulesSummary: string[];
  minPlayers: number;
  maxPlayers: number;
  featured: boolean;
  isLive: boolean;
  accentFrom: string;
  accentTo: string;
  estimatedMinutes: number;
}

export interface GamePlayerResult {
  userId: string;
  displayName: string;
  score: number;
  rank: number;
  result: "winner" | "runner-up" | "eliminated" | "draw" | "participant";
  xpEarned: number;
  coinsEarned: number;
}

export interface GameFinishedPayload {
  roomId: string;
  gameId: GameId;
  resultId: string;
  rankings: GamePlayerResult[];
  durationSeconds: number;
  reason: string;
}
