"use client";

import React, { useEffect, useState } from "react";
import { Trophy, Medal } from "lucide-react";
import { GAME_CATALOG } from "../../shared/constants/games";
import { LeaderboardEntry } from "../../shared/types/user";
import { apiFetch } from "../../lib/api";

export default function LeaderboardPage() {
  const [selectedTab, setSelectedTab] = useState<string>("global");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const endpoint =
      selectedTab === "global"
        ? "/api/leaderboards/global?limit=25"
        : `/api/leaderboards/${selectedTab}?limit=25`;
    apiFetch<{ leaderboard: LeaderboardEntry[] }>(endpoint)
      .then((d) => setEntries(d.leaderboard))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [selectedTab]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
          <Trophy className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Leaderboards</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Verified server-side rankings across Jimsa Games.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedTab("global")}
          className={`rounded-xl px-4 py-2 text-xs font-bold ${
            selectedTab === "global"
              ? "bg-violet-600 text-white"
              : "glass-card text-slate-600 dark:text-slate-300"
          }`}
        >
          Global XP
        </button>
        {GAME_CATALOG.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedTab(g.id)}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold ${
              selectedTab === g.id
                ? "bg-violet-600 text-white"
                : "glass-card text-slate-600 dark:text-slate-300"
            }`}
          >
            {g.shortName}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-indigo-200/70 dark:border-white/10 bg-slate-100/70 dark:bg-white/5 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Rank</th>
                <th className="px-5 py-3.5">Player</th>
                <th className="px-5 py-3.5">Level</th>
                <th className="px-5 py-3.5">Wins / Played</th>
                <th className="px-5 py-3.5">Win Rate</th>
                <th className="px-5 py-3.5 text-right">Score / XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-xs text-slate-400">
                    Loading rankings...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-xs text-slate-400">
                    No ranked matches recorded yet.
                  </td>
                </tr>
              ) : (
                entries.map((e) => (
                  <tr key={e.userId} className="hover:bg-violet-500/5 transition-colors">
                    <td className="px-5 py-3.5 font-black">
                      {e.rank <= 3 ? (
                        <span className="inline-flex items-center gap-1 text-amber-500">
                          <Medal className="h-4 w-4" /> #{e.rank}
                        </span>
                      ) : (
                        `#${e.rank}`
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-bold text-white">
                          {e.avatarUrl?.slice(0, 2) || e.displayName.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold">{e.displayName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-semibold">Lvl {e.level}</td>
                    <td className="px-5 py-3.5 text-xs">
                      {e.gamesWon} / {e.gamesPlayed}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-bold text-emerald-500">
                      {e.winRate}%
                    </td>
                    <td className="px-5 py-3.5 text-right font-black text-violet-600 dark:text-violet-300">
                      {e.score.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
