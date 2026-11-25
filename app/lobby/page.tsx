"use client";

import React, { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Plus,
  KeyRound,
  Users,
  Lock,
  Globe,
  RefreshCw,
  ArrowRight,
  Clock,
  X,
} from "lucide-react";
import { GAME_CATALOG, GAME_MAP } from "../../shared/constants/games";
import { GameId } from "../../shared/types/game";
import { PublicRoomSummary, RoomStatePayload } from "../../shared/types/room";
import { useAuth } from "../../components/providers/AuthProvider";
import { apiFetch } from "../../lib/api";
import { GameCardArtwork } from "../../components/shared/GameArtwork";

const CATEGORIES = [
  { id: "all", label: "All Games" },
  { id: "survival", label: "Survival" },
  { id: "strategy", label: "Strategy" },
  { id: "board", label: "Board" },
  { id: "card", label: "Card" },
  { id: "social", label: "Social" },
  { id: "puzzle", label: "Puzzle" },
];

function LobbyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, continueAsGuest } = useAuth();

  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [publicRooms, setPublicRooms] = useState<PublicRoomSummary[]>([]);
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Create Room modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<GameId>("red-light-green-light");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [maxPlayers, setMaxPlayers] = useState(8);

  const loadRooms = useCallback(async () => {
    try {
      const data = await apiFetch<{ rooms: PublicRoomSummary[] }>("/api/rooms");
      setPublicRooms(data.rooms);
    } catch {
      // ignore initial offline state
    }
  }, []);

  useEffect(() => {
    void loadRooms();
    const timer = setInterval(loadRooms, 15000);
    return () => clearInterval(timer);
  }, [loadRooms]);

  useEffect(() => {
    const preGame = searchParams.get("game") as GameId | null;
    if (preGame && GAME_MAP[preGame]) {
      setSelectedGameId(preGame);
      setMaxPlayers(GAME_MAP[preGame].maxPlayers);
    }
    if (searchParams.get("create") === "true") {
      setModalOpen(true);
    }
  }, [searchParams]);

  const ensureSession = async () => {
    if (!user) {
      await continueAsGuest();
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await ensureSession();
      const data = await apiFetch<{ room: RoomStatePayload }>("/api/rooms", {
        method: "POST",
        body: JSON.stringify({
          gameId: selectedGameId,
          visibility,
          maxPlayers,
        }),
      });
      setModalOpen(false);
      router.push(`/room?id=${data.room.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create room");
    } finally {
      setBusy(false);
    }
  };

  const handleJoinByPin = async (pinToJoin?: string) => {
    const cleanPin = (pinToJoin || pinInput).trim().toUpperCase();
    if (!cleanPin) return;
    setError("");
    setBusy(true);
    try {
      await ensureSession();
      const data = await apiFetch<{ room: RoomStatePayload }>("/api/rooms/join", {
        method: "POST",
        body: JSON.stringify({ pin: cleanPin }),
      });
      router.push(`/room?id=${data.room.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join room");
    } finally {
      setBusy(false);
    }
  };

  const openCreateModalFor = (gameId: GameId) => {
    setSelectedGameId(gameId);
    setMaxPlayers(GAME_MAP[gameId].maxPlayers);
    setModalOpen(true);
  };

  const filteredGames = GAME_CATALOG.filter((g) => {
    if (category !== "all" && g.category !== category) return false;
    if (
      search.trim() &&
      !g.name.toLowerCase().includes(search.toLowerCase()) &&
      !g.description.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const activeGameDef = GAME_MAP[selectedGameId];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header + Quick Join / Create Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Game Lobby</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pick a multiplayer arena, join an open public room, or enter a 6-character Room PIN.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleJoinByPin();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.toUpperCase())}
                placeholder="Enter Room PIN"
                className="w-40 rounded-xl border border-indigo-200 dark:border-violet-500/30 bg-white dark:bg-white/5 pl-9 pr-3 py-2.5 text-xs font-bold tracking-wider uppercase outline-none focus:border-violet-500"
              />
            </div>
            <button type="submit" disabled={busy || !pinInput.trim()} className="btn-secondary !py-2.5 text-xs">
              Join PIN
            </button>
          </form>

          <button onClick={() => setModalOpen(true)} className="btn-primary !py-2.5 text-xs">
            <Plus className="h-4 w-4" />
            Create Room
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-500">
          {error}
        </div>
      )}

      {/* LIVE PUBLIC ROOMS */}
      <section className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Live Public Rooms ({publicRooms.length})
            </h2>
          </div>
          <button
            onClick={() => void loadRooms()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        {publicRooms.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-3">
            No public rooms waiting right now — click <strong>Create Room</strong> to host the first arena!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {publicRooms.map((room) => {
              const g = GAME_MAP[room.gameId];
              return (
                <div
                  key={room.id}
                  className="flex items-center justify-between rounded-xl border border-indigo-200/70 dark:border-violet-500/25 bg-white/70 dark:bg-white/5 p-3.5"
                >
                  <div>
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {g?.name || room.gameId}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span>Host: {room.hostName}</span>
                      <span>•</span>
                      <span className="font-mono font-bold text-violet-600 dark:text-violet-300">
                        {room.pin}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-white/10 px-2 py-1 text-xs font-bold">
                      <Users className="h-3.5 w-3.5 text-violet-500" />
                      {room.playerCount}/{room.maxPlayers}
                    </span>
                    <button
                      onClick={() => void handleJoinByPin(room.pin)}
                      className="btn-primary !px-3 !py-1.5 text-xs"
                    >
                      Join
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SEARCH & CATEGORY FILTERS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                category === c.id
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
                  : "bg-white dark:bg-white/5 border border-indigo-200/70 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-violet-500/40"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search games..."
            className="w-full rounded-xl border border-indigo-200 dark:border-violet-500/30 bg-white dark:bg-white/5 pl-10 pr-4 py-2 text-xs outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* GAME CATALOG GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            className="glass-card overflow-hidden rounded-2xl flex flex-col hover:border-violet-500/60 transition-all"
          >
            <div className="relative aspect-[16/9] overflow-hidden">
              <GameCardArtwork gameId={game.id} />
              <span className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur px-2.5 py-0.5 text-[10px] font-bold text-white">
                {game.categoryLabel}
              </span>
              {game.isLive && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[10px] font-bold text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  Live
                </span>
              )}
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {game.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {game.description}
                </p>
                <div className="flex items-center gap-4 pt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-violet-500" />
                    {game.minPlayers}–{game.maxPlayers} Players
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-indigo-500" />
                    ~{game.estimatedMinutes} min
                  </span>
                </div>
              </div>

              <button
                onClick={() => openCreateModalFor(game.id)}
                className="btn-primary w-full text-xs"
              >
                Host {game.shortName} Room <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE ROOM MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-violet-500/30 bg-white dark:bg-[#10142C] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Create Multiplayer Room
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5">Select Game</label>
                <select
                  value={selectedGameId}
                  onChange={(e) => {
                    const id = e.target.value as GameId;
                    setSelectedGameId(id);
                    setMaxPlayers(GAME_MAP[id].maxPlayers);
                  }}
                  className="w-full rounded-xl border border-indigo-200 dark:border-violet-500/30 bg-white dark:bg-[#191E3D] px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-violet-500"
                >
                  {GAME_CATALOG.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.minPlayers}–{g.maxPlayers} players)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">Room Visibility</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setVisibility("public")}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold ${
                      visibility === "public"
                        ? "border-violet-500 bg-violet-500/15 text-violet-700 dark:text-violet-300"
                        : "border-slate-200 dark:border-white/10"
                    }`}
                  >
                    <Globe className="h-4 w-4" /> Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibility("private")}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold ${
                      visibility === "private"
                        ? "border-violet-500 bg-violet-500/15 text-violet-700 dark:text-violet-300"
                        : "border-slate-200 dark:border-white/10"
                    }`}
                  >
                    <Lock className="h-4 w-4" /> Private (PIN)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">
                  Max Players: <span className="text-violet-500">{maxPlayers}</span>
                </label>
                <input
                  type="range"
                  min={activeGameDef.minPlayers}
                  max={activeGameDef.maxPlayers}
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  className="w-full accent-violet-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Min {activeGameDef.minPlayers}</span>
                  <span>Max {activeGameDef.maxPlayers}</span>
                </div>
              </div>

              <button type="submit" disabled={busy} className="btn-primary w-full">
                {busy ? "Creating Arena..." : "Launch Waiting Room"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LobbyPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-400">Loading Lobby...</div>}>
      <LobbyContent />
    </Suspense>
  );
}
