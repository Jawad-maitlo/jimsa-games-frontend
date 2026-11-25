"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Award, Coins, Sparkles, Trophy, History, Save } from "lucide-react";
import { useAuth } from "../../components/providers/AuthProvider";
import { apiFetch } from "../../lib/api";
import { MatchResultSummary } from "../../shared/types/user";

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const [matches, setMatches] = useState<MatchResultSummary[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName);
    apiFetch<{ matches: MatchResultSummary[] }>("/api/users/me/matches")
      .then((d) => setMatches(d.matches))
      .catch(() => {});
  }, [user]);

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-400">Loading profile...</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-black">Sign In to View Your Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track your XP, level progression, achievements, coins, and match history.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/login" className="btn-secondary">Sign In</Link>
          <Link href="/register" className="btn-primary">Create Account</Link>
        </div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg("");
    try {
      await apiFetch("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({ displayName }),
      });
      await refreshUser();
      setSavedMsg("Profile updated!");
    } catch (err) {
      setSavedMsg(err instanceof Error ? err.message : "Could not update profile");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-8">
      {/* Header Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-2xl font-black text-white shadow-glow-sm">
            {user.avatarUrl?.slice(0, 2) || user.displayName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">{user.displayName}</h1>
              {user.isGuest && (
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-500">
                  Guest Session
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">@{user.username}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs font-bold">
              <span className="inline-flex items-center gap-1 text-violet-500">
                <Sparkles className="h-3.5 w-3.5" /> Level {user.level} ({user.xp.toLocaleString()} XP)
              </span>
              <span className="inline-flex items-center gap-1 text-amber-500">
                <Coins className="h-3.5 w-3.5" /> {user.coins.toLocaleString()} Coins
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-500">
                <Trophy className="h-3.5 w-3.5" /> {user.gamesWon}/{user.gamesPlayed} Wins ({user.winRate}%)
              </span>
            </div>
          </div>
        </div>

        {!user.isGuest && (
          <form onSubmit={handleSave} className="flex items-center gap-2">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="rounded-xl border border-indigo-200 dark:border-violet-500/30 bg-white dark:bg-white/5 px-3 py-2 text-xs outline-none focus:border-violet-500"
            />
            <button type="submit" className="btn-primary !py-2 !px-3.5 text-xs">
              <Save className="h-3.5 w-3.5" /> Save
            </button>
          </form>
        )}
      </div>

      {savedMsg && (
        <div className="text-xs font-bold text-emerald-500">{savedMsg}</div>
      )}

      {/* Achievements */}
      <section className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-extrabold">Unlocked Achievements ({user.achievements.length})</h2>
        </div>
        {user.achievements.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Play and win matches to unlock permanent Arena badges!
          </p>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {user.achievements.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-600 dark:text-amber-300"
              >
                <Trophy className="h-3.5 w-3.5" /> {badge}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Match History */}
      <section className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-violet-500" />
          <h2 className="text-lg font-extrabold">Recent Match History</h2>
        </div>

        {matches.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No completed matches yet. Head to the{" "}
            <Link href="/lobby" className="text-violet-500 font-bold underline">
              Game Lobby
            </Link>{" "}
            to play!
          </p>
        ) : (
          <div className="space-y-2.5">
            {matches.map((m) => {
              const myEntry = m.players.find((p) => p.userId === user.id);
              return (
                <div
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-100/80 dark:bg-white/5 px-4 py-3 text-xs"
                >
                  <div>
                    <span className="font-extrabold text-sm">{m.gameName}</span>
                    <span className="ml-2 text-slate-500">
                      • {m.durationSeconds}s • {m.players.length} players
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-lg px-2.5 py-1 font-bold uppercase ${
                        myEntry?.result === "winner"
                          ? "bg-emerald-500/20 text-emerald-500"
                          : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      Rank #{myEntry?.rank || "-"} ({myEntry?.result || "played"})
                    </span>
                    <span className="font-bold text-violet-500">
                      +{myEntry?.xpEarned || 0} XP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
