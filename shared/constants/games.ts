import { GameDefinition, GameId } from "../types/game";

export const GAME_CATALOG: GameDefinition[] = [
  {
    id: "red-light-green-light",
    name: "Red Light, Green Light",
    shortName: "Red Light",
    category: "survival",
    categoryLabel: "Survival",
    description:
      "Sprint toward the finish line during Green Light and freeze instantly when Red Light triggers. One slip eliminates you.",
    rulesSummary: [
      "Move forward only during GREEN LIGHT phases.",
      "Any movement submitted during RED LIGHT causes immediate elimination.",
      "First player to reach 100% progress wins — or highest surviving progress when time runs out.",
    ],
    minPlayers: 2,
    maxPlayers: 30,
    featured: true,
    isLive: true,
    accentFrom: "#EF4444",
    accentTo: "#7C3AED",
    estimatedMinutes: 3,
  },
  {
    id: "glass-bridge",
    name: "Glass Bridge",
    shortName: "Glass Bridge",
    category: "survival",
    categoryLabel: "Survival",
    description:
      "Cross a suspended neon bridge of tempered and fragile glass tiles. Remember every revealed tile and survive to the end.",
    rulesSummary: [
      "The server secretly generates one safe tile (Left or Right) per row.",
      "Players take turns stepping onto the next row.",
      "Stepping on tempered glass advances you and reveals it; fragile glass eliminates you.",
    ],
    minPlayers: 2,
    maxPlayers: 20,
    featured: true,
    isLive: true,
    accentFrom: "#3B82F6",
    accentTo: "#8B5CF6",
    estimatedMinutes: 5,
  },
  {
    id: "chess",
    name: "Chess",
    shortName: "Chess",
    category: "strategy",
    categoryLabel: "Strategy",
    description:
      "Classic 1v1 strategic mastery with full server-validated FIDE rules, castling, en passant, promotion, and checkmate detection.",
    rulesSummary: [
      "White moves first; server validates every move legally.",
      "Supports castling, pawn promotion, check, checkmate, and draw detection.",
      "Checkmate or opponent resignation wins the match.",
    ],
    minPlayers: 2,
    maxPlayers: 2,
    featured: true,
    isLive: false,
    accentFrom: "#F59E0B",
    accentTo: "#6366F1",
    estimatedMinutes: 15,
  },
  {
    id: "ludo",
    name: "Ludo",
    shortName: "Ludo",
    category: "board",
    categoryLabel: "Board",
    description:
      "Roll the server-verified die, race four tokens around the board, capture rivals, and bring all tokens safely home.",
    rulesSummary: [
      "Roll a 6 to deploy a token from your yard onto the board.",
      "Landing on an opponent outside safe star tiles sends them back to base.",
      "Rolling a 6 or capturing an opponent grants a bonus roll. First to bring all 4 tokens home wins.",
    ],
    minPlayers: 2,
    maxPlayers: 4,
    featured: true,
    isLive: false,
    accentFrom: "#10B981",
    accentTo: "#3B82F6",
    estimatedMinutes: 12,
  },
  {
    id: "card-clash",
    name: "Card Clash",
    shortName: "Card Clash",
    category: "card",
    categoryLabel: "Card",
    description:
      "Fast-paced color-and-number card shedding with Skip, Reverse, Draw +2, Wild, and Wild +4 action cards.",
    rulesSummary: [
      "Match the top discard card by color or symbol, or play a Wild card.",
      "Your hand is strictly private — opponents only see your remaining card count.",
      "First player to empty their hand wins the match.",
    ],
    minPlayers: 2,
    maxPlayers: 10,
    featured: false,
    isLive: true,
    accentFrom: "#EC4899",
    accentTo: "#8B5CF6",
    estimatedMinutes: 8,
  },
  {
    id: "trust-or-betray",
    name: "Trust or Betray",
    shortName: "Trust / Betray",
    category: "social",
    categoryLabel: "Social Deduction",
    description:
      "A high-stakes psychological game of alliances and deception. Cooperate for mutual gain or betray to steal the pot.",
    rulesSummary: [
      "Each round, privately choose COOPERATE or BETRAY before the timer expires.",
      "Both Cooperate: +3 pts each. Betray vs Cooperate: +5 / 0. Both Betray: +1 pt each.",
      "Highest cumulative score across all rounds wins.",
    ],
    minPlayers: 2,
    maxPlayers: 12,
    featured: false,
    isLive: false,
    accentFrom: "#F97316",
    accentTo: "#7C3AED",
    estimatedMinutes: 6,
  },
  {
    id: "treasure-hunt",
    name: "Treasure Hunt",
    shortName: "Treasure Hunt",
    category: "puzzle",
    categoryLabel: "Puzzle",
    description:
      "Decode multi-stage clues and server-validated riddles faster than your rivals to unlock the final vault.",
    rulesSummary: [
      "Solve each riddle stage to unlock the next chamber.",
      "Request hints if stuck (reduces stage bonus slightly).",
      "First player to unlock all stages — or highest score when time ends — claims the treasure.",
    ],
    minPlayers: 2,
    maxPlayers: 20,
    featured: false,
    isLive: false,
    accentFrom: "#EAB308",
    accentTo: "#10B981",
    estimatedMinutes: 7,
  },
];

export const GAME_MAP: Record<GameId, GameDefinition> = GAME_CATALOG.reduce(
  (acc, g) => {
    acc[g.id] = g;
    return acc;
  },
  {} as Record<GameId, GameDefinition>
);
