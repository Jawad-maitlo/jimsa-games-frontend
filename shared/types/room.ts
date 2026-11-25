import { GameId } from "./game";

export type RoomStatus =
  | "WAITING"
  | "STARTING"
  | "PLAYING"
  | "PAUSED"
  | "FINISHED"
  | "CANCELLED"
  | "EXPIRED";

export type RoomVisibility = "public" | "private";

export interface RoomPlayer {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  isBot?: boolean;
  disconnectedAt?: number | null;
  joinedAt: number;
}

export interface RoomSettings {
  timeLimitSeconds?: number;
  rounds?: number;
  bridgeLength?: number;
  winMode?: "first" | "ranked";
  exactFinish?: boolean;
}

export interface PublicRoomSummary {
  id: string;
  pin: string;
  gameId: GameId;
  hostId: string;
  hostName: string;
  visibility: RoomVisibility;
  status: RoomStatus;
  playerCount: number;
  maxPlayers: number;
  createdAt: number;
}

export interface RoomStatePayload {
  id: string;
  pin: string;
  gameId: GameId;
  hostId: string;
  visibility: RoomVisibility;
  status: RoomStatus;
  maxPlayers: number;
  minPlayers: number;
  settings: RoomSettings;
  players: RoomPlayer[];
  createdAt: number;
  startedAt?: number;
}

export interface ChatMessagePayload {
  id: string;
  roomId: string;
  userId: string;
  displayName: string;
  text: string;
  timestamp: number;
  system?: boolean;
}

export interface ReactionPayload {
  id: string;
  roomId: string;
  userId: string;
  displayName: string;
  emoji: string;
  timestamp: number;
}
