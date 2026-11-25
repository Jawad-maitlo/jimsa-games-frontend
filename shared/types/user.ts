export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  displayName: string;
  avatarUrl: string;
  isGuest?: boolean;
  xp: number;
  level: number;
  coins: number;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  achievements: string[];
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  score: number;
  xp: number;
  level: number;
  gamesWon: number;
  gamesPlayed: number;
  winRate: number;
}

export interface MatchResultSummary {
  id: string;
  roomId: string;
  gameId: string;
  gameName: string;
  players: Array<{
    userId: string;
    displayName: string;
    avatarUrl?: string;
    score: number;
    rank: number;
    result: "winner" | "runner-up" | "eliminated" | "draw" | "participant";
    xpEarned?: number;
    coinsEarned?: number;
  }>;
  startedAt: string;
  finishedAt: string;
  durationSeconds: number;
}
