"use client";

import React, { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Copy,
  Check,
  Crown,
  Bot,
  Play,
  LogOut,
  Send,
  Users,
  Trophy,
  RotateCcw,
  UserX,
  CheckCircle2,
  Circle,
  WifiOff,
  Volume2,
  VolumeX,
  Music,
} from "lucide-react";
import { GAME_MAP } from "../../shared/constants/games";
import { SOCKET_EVENTS } from "../../shared/events/socketEvents";
import {
  ChatMessagePayload,
  ReactionPayload,
  RoomStatePayload,
} from "../../shared/types/room";
import { GameFinishedPayload } from "../../shared/types/game";
import { useAuth } from "../../components/providers/AuthProvider";
import { getSocket } from "../../lib/socket";
import { soundEngine } from "../../lib/soundEngine";
import { RedLightGreenLightBoard } from "../../components/games/RedLightGreenLightBoard";
import { GlassBridgeBoard } from "../../components/games/GlassBridgeBoard";
import { ChessBoard } from "../../components/games/ChessBoard";
import { LudoBoard } from "../../components/games/LudoBoard";
import { CardClashBoard } from "../../components/games/CardClashBoard";
import { TrustOrBetrayBoard } from "../../components/games/TrustOrBetrayBoard";
import { TreasureHuntBoard } from "../../components/games/TreasureHuntBoard";

const QUICK_REACTIONS = ["🔥", "👏", "😂", "😱", "🏆", "💀", "⚡", "👑"];

function RoomPageContent() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("id");
  const router = useRouter();
  const { user, loading, continueAsGuest, refreshUser } = useAuth();

  const [room, setRoom] = useState<RoomStatePayload | null>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [finished, setFinished] = useState<GameFinishedPayload | null>(null);
  const [messages, setMessages] = useState<ChatMessagePayload[]>([]);
  const [reactions, setReactions] = useState<ReactionPayload[]>([]);
  const [chatText, setChatText] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [muted, setMuted] = useState(false);
  const [musicMuted, setMusicMuted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMuted(soundEngine.isMuted());
    setMusicMuted(soundEngine.isMusicMuted());
    return () => soundEngine.stopBgm();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void continueAsGuest();
    }
  }, [loading, user, continueAsGuest]);

  useEffect(() => {
    if (!user || !roomId) return;
    const socket = getSocket();

    const joinNow = () => {
      setSocketConnected(true);
      socket.emit(
        SOCKET_EVENTS.ROOM_JOIN,
        { roomId },
        (ack: { ok: boolean; error?: string; room?: RoomStatePayload }) => {
          if (!ack?.ok) {
            setError(ack?.error || "Unable to join room");
          } else if (ack.room) {
            setRoom(ack.room);
            setError("");
          }
        }
      );
    };

    const onRoomState = (payload: RoomStatePayload) => {
      setRoom(payload);
      if (payload.status === "WAITING") {
        soundEngine.stopBgm();
        setGameState(null);
        setFinished(null);
      }
    };
    const onGameState = (payload: any) => setGameState(payload);
    const onGameFinished = (payload: GameFinishedPayload) => {
      setFinished(payload);
      soundEngine.stopBgm();
      const myRank = payload.rankings.find((r) => r.userId === user.id);
      if (myRank && (myRank.rank === 1 || myRank.result === "winner")) {
        soundEngine.playVictoryFanfare();
      } else {
        soundEngine.playDefeatTone();
      }
      void refreshUser();
    };
    const onRoomError = (payload: { message: string }) => {
      setError(payload.message);
      setTimeout(() => setError(""), 4500);
    };
    const onChat = (msg: ChatMessagePayload) => {
      setMessages((prev) => [...prev.slice(-50), msg]);
    };
    const onReaction = (r: ReactionPayload) => {
      setReactions((prev) => [...prev.slice(-6), r]);
      setTimeout(() => {
        setReactions((prev) => prev.filter((item) => item.id !== r.id));
      }, 2800);
    };
    const onDisconnect = () => setSocketConnected(false);

    socket.on("connect", joinNow);
    socket.on("disconnect", onDisconnect);
    socket.on(SOCKET_EVENTS.ROOM_STATE, onRoomState);
    socket.on(SOCKET_EVENTS.GAME_STATE, onGameState);
    socket.on(SOCKET_EVENTS.GAME_FINISHED, onGameFinished);
    socket.on(SOCKET_EVENTS.ROOM_ERROR, onRoomError);
    socket.on(SOCKET_EVENTS.CHAT_NEW_MESSAGE, onChat);
    socket.on(SOCKET_EVENTS.REACTION_RECEIVED, onReaction);

    if (socket.connected) joinNow();

    return () => {
      socket.off("connect", joinNow);
      socket.off("disconnect", onDisconnect);
      socket.off(SOCKET_EVENTS.ROOM_STATE, onRoomState);
      socket.off(SOCKET_EVENTS.GAME_STATE, onGameState);
      socket.off(SOCKET_EVENTS.GAME_FINISHED, onGameFinished);
      socket.off(SOCKET_EVENTS.ROOM_ERROR, onRoomError);
      socket.off(SOCKET_EVENTS.CHAT_NEW_MESSAGE, onChat);
      socket.off(SOCKET_EVENTS.REACTION_RECEIVED, onReaction);
    };
  }, [user, roomId, refreshUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user || !room) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-4">
        {error ? (
          <>
            <p className="text-sm font-bold text-rose-500">{error}</p>
            <Link href="/lobby" className="btn-primary">
              Return to Game Lobby
            </Link>
          </>
        ) : (
          <p className="text-sm text-slate-400">Connecting to multiplayer room...</p>
        )}
      </div>
    );
  }

  const socket = getSocket();
  const gameDef = GAME_MAP[room.gameId];
  const isHost = room.hostId === user.id;
  const meInRoom = room.players.find((p) => p.id === user.id);

  const sendAction = (action: any) => {
    soundEngine.unlock();
    socket.emit(SOCKET_EVENTS.GAME_ACTION, { roomId: room.id, action });
  };

  const handleToggleSound = () => {
    const nextMuted = soundEngine.toggleMute();
    setMuted(nextMuted);
    if (!nextMuted) {
      soundEngine.unlock();
      soundEngine.playGlassStep();
    }
  };

  const handleToggleMusic = () => {
    soundEngine.unlock();
    setMusicMuted(soundEngine.toggleMusic());
  };

  const handleCopyPin = () => {
    navigator.clipboard.writeText(room.pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleLeave = () => {
    soundEngine.stopBgm();
    socket.emit(SOCKET_EVENTS.ROOM_LEAVE, { roomId: room.id });
    router.push("/lobby");
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    socket.emit(SOCKET_EVENTS.CHAT_MESSAGE, { roomId: room.id, text: chatText.trim() });
    setChatText("");
  };

  const renderGameBoard = () => {
    if (!gameState) return null;
    switch (room.gameId) {
      case "red-light-green-light":
        return <RedLightGreenLightBoard state={gameState} myUserId={user.id} onAction={sendAction} />;
      case "glass-bridge":
        return <GlassBridgeBoard state={gameState} myUserId={user.id} onAction={sendAction} />;
      case "chess":
        return <ChessBoard state={gameState} myUserId={user.id} onAction={sendAction} />;
      case "ludo":
        return <LudoBoard state={gameState} myUserId={user.id} onAction={sendAction} />;
      case "card-clash":
        return <CardClashBoard state={gameState} myUserId={user.id} onAction={sendAction} />;
      case "trust-or-betray":
        return <TrustOrBetrayBoard state={gameState} myUserId={user.id} onAction={sendAction} />;
      case "treasure-hunt":
        return <TreasureHuntBoard state={gameState} myUserId={user.id} onAction={sendAction} />;
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-5">
      {/* Top Room Header */}
      <div className="glass-card rounded-2xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black">{gameDef?.name || room.gameId}</h1>
              <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase text-violet-600 dark:text-violet-300">
                {room.status}
              </span>
              {!socketConnected && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500">
                  <WifiOff className="h-3.5 w-3.5" /> Reconnecting...
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {room.players.length}/{room.maxPlayers} players • {room.visibility} room
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleToggleMusic}
            title={musicMuted ? "Enable Background Music" : "Mute Background Music"}
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-violet-500/35 bg-white/80 dark:bg-white/5 px-3 py-2 text-xs font-bold hover:border-violet-500 transition-colors"
          >
            <Music className={`h-4 w-4 ${musicMuted ? "text-slate-400" : "text-pink-500"}`} />
            {musicMuted ? "Music Off" : "Music On"}
          </button>

          <button
            onClick={handleToggleSound}
            title={muted ? "Unmute Audio" : "Mute All Audio"}
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-violet-500/35 bg-white/80 dark:bg-white/5 px-3 py-2 text-xs font-bold hover:border-violet-500 transition-colors"
          >
            {muted ? (
              <>
                <VolumeX className="h-4 w-4 text-rose-500" /> Muted
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 text-emerald-500" /> SFX On
              </>
            )}
          </button>

          <button
            onClick={handleCopyPin}
            className="inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/10 px-3.5 py-2 text-xs font-mono font-black text-violet-600 dark:text-violet-300 hover:bg-violet-500/20"
          >
            PIN: {room.pin}
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>

          <button onClick={handleLeave} className="btn-secondary !py-2 !px-3.5 text-xs text-rose-500">
            <LogOut className="h-3.5 w-3.5" /> Leave
          </button>
        </div>
      </div>

      {reactions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {reactions.map((r) => (
            <span
              key={r.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-violet-600/20 border border-violet-500/30 px-3 py-1 text-xs font-bold animate-bounce"
            >
              <span className="text-base">{r.emoji}</span> {r.displayName}
            </span>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-500">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-5">
          {room.status === "FINISHED" && finished && (
            <div className="glass-card rounded-3xl p-6 sm:p-8 border-2 border-amber-400/50 space-y-6 bg-gradient-to-b from-amber-500/10 to-transparent">
              <div className="text-center space-y-2">
                <Trophy className="h-12 w-12 text-amber-400 mx-auto" />
                <h2 className="text-2xl sm:text-3xl font-black">Match Complete!</h2>
                <p className="text-sm text-slate-500 dark:text-slate-300">{finished.reason}</p>
              </div>

              <div className="space-y-2.5">
                {finished.rankings.map((r) => (
                  <div
                    key={r.userId}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm ${
                      r.rank === 1
                        ? "bg-amber-400/20 border border-amber-400/50"
                        : "bg-slate-100/80 dark:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-black text-lg w-7">#{r.rank}</span>
                      <div>
                        <div className="font-extrabold">{r.displayName}</div>
                        <div className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400">
                          {r.result}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-violet-500">{r.score} pts</div>
                      <div className="text-[11px] font-bold text-emerald-500">
                        +{r.xpEarned} XP • +{r.coinsEarned} Coins
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {isHost && (
                  <button
                    onClick={() => {
                      soundEngine.unlock();
                      socket.emit(SOCKET_EVENTS.ROOM_REMATCH, { roomId: room.id });
                    }}
                    className="btn-primary"
                  >
                    <RotateCcw className="h-4 w-4" /> Play Again
                  </button>
                )}
                <Link href="/lobby" className="btn-secondary">
                  Back to Lobby
                </Link>
              </div>
            </div>
          )}

          {room.status === "WAITING" && (
            <div className="glass-card rounded-3xl p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black">Waiting Room</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Share PIN <strong className="font-mono text-violet-500">{room.pin}</strong> with friends — or add a Practice Bot to start immediately.
                  </p>
                </div>

                {isHost && room.players.length < room.maxPlayers && (
                  <button
                    onClick={() => {
                      soundEngine.unlock();
                      socket.emit(SOCKET_EVENTS.ROOM_ADD_BOT, { roomId: room.id });
                    }}
                    className="btn-secondary !py-2 !px-3.5 text-xs"
                  >
                    <Bot className="h-4 w-4 text-violet-500" /> + Add Bot
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {room.players.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-2xl border border-indigo-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-xs font-black text-white">
                        {p.avatarUrl?.slice(0, 2) || p.displayName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-extrabold flex items-center gap-1.5">
                          {p.displayName}
                          {p.isHost && <Crown className="h-3.5 w-3.5 text-amber-400" />}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {!p.isConnected ? "Reconnecting..." : p.isBot ? "AI Bot" : "Online"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {p.isReady ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-500">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-200 dark:bg-white/10 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                          <Circle className="h-3 w-3" /> Waiting
                        </span>
                      )}

                      {isHost && p.id !== user.id && (
                        <button
                          title="Remove player"
                          onClick={() =>
                            socket.emit(SOCKET_EVENTS.ROOM_KICK, {
                              roomId: room.id,
                              targetUserId: p.id,
                            })
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {gameDef && (
                <div className="rounded-2xl bg-slate-100/80 dark:bg-white/5 p-4 space-y-1.5">
                  <div className="text-xs font-extrabold uppercase text-violet-500">How to Play</div>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    {gameDef.rulesSummary.map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {!isHost && meInRoom && (
                  <button
                    onClick={() => {
                      soundEngine.unlock();
                      socket.emit(SOCKET_EVENTS.ROOM_READY, {
                        roomId: room.id,
                        isReady: !meInRoom.isReady,
                      });
                    }}
                    className={meInRoom.isReady ? "btn-secondary" : "btn-primary"}
                  >
                    {meInRoom.isReady ? "Cancel Ready" : "Mark Ready"}
                  </button>
                )}

                {isHost && (
                  <button
                    onClick={() => {
                      soundEngine.unlock();
                      socket.emit(SOCKET_EVENTS.ROOM_START, { roomId: room.id });
                    }}
                    className="btn-primary !px-8 !py-3.5 text-sm ml-auto"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    Start Match ({room.players.length}/{room.minPlayers}+ players)
                  </button>
                )}
              </div>
            </div>
          )}

          {(room.status === "PLAYING" || room.status === "FINISHED") && renderGameBoard()}
        </div>

        {/* Right Sidebar: Live Chat & Quick Reactions */}
        <div className="lg:col-span-4 glass-card rounded-3xl p-4 flex flex-col h-[540px]">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-200/50 dark:border-white/10">
            <span className="text-sm font-extrabold inline-flex items-center gap-2">
              <Users className="h-4 w-4 text-violet-500" /> Room Chat
            </span>
            <span className="text-[11px] text-slate-400">{room.players.length} in room</span>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-2.5 text-xs">
            {messages.length === 0 ? (
              <p className="text-center text-slate-400 py-8">
                Say hello or send a quick reaction!
              </p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-xl px-3 py-2 ${
                    m.userId === user.id
                      ? "bg-violet-600/20 ml-6"
                      : "bg-slate-100 dark:bg-white/5 mr-6"
                  }`}
                >
                  <div className="font-bold text-[11px] text-violet-600 dark:text-violet-300">
                    {m.displayName}
                  </div>
                  <div className="mt-0.5 break-words">{m.text}</div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="flex flex-wrap gap-1.5 py-2 border-t border-indigo-200/40 dark:border-white/10">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() =>
                  socket.emit(SOCKET_EVENTS.REACTION_SEND, { roomId: room.id, emoji })
                }
                className="rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-violet-500/20 px-2 py-1 text-sm transition-transform active:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="flex gap-2 pt-2">
            <input
              type="text"
              maxLength={240}
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-xl border border-indigo-200 dark:border-violet-500/30 bg-white dark:bg-white/5 px-3 py-2 text-xs outline-none focus:border-violet-500"
            />
            <button type="submit" className="btn-primary !px-3.5 !py-2">
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RoomPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-400">Loading room...</div>}>
      <RoomPageContent />
    </Suspense>
  );
}
