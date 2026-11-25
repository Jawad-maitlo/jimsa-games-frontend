"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Play,
  Users,
  Gamepad2,
  Trophy,
  Globe,
  ArrowRight,
  Calendar,
  Crown,
  Sparkles,
} from "lucide-react";
import { GAME_CATALOG } from "../shared/constants/games";
import { LeaderboardEntry } from "../shared/types/user";
import { apiFetch } from "../lib/api";
import { GameCardArtwork, HeroArenaArtwork } from "../components/shared/GameArtwork";

export default function HomePage() {
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);
  const [liveCount, setLiveCount] = useState<{ activeRooms: number; activePlayers: number } | null>(null);

  useEffect(() => {
    apiFetch<{ leaderboard: LeaderboardEntry[] }>("/api/leaderboards/global?limit=3")
      .then((d) => setTopPlayers(d.leaderboard))
      .catch(() => {});

    apiFetch<{ activeRooms: number; activePlayers: number }>("/api/health")
      .then((d) => setLiveCount({ activeRooms: d.activeRooms, activePlayers: d.activePlayers }))
      .catch(() => {});
  }, []);

  const featuredGames = GAME_CATALOG.filter((g) => g.featured);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-200/70 dark:border-violet-500/25 bg-gradient-to-br from-white via-indigo-50/70 to-violet-100/70 dark:from-[#0C0F24] dark:via-[#141336] dark:to-[#1E103C] p-6 sm:p-10 lg:p-12 shadow-xl shadow-indigo-500/5 dark:shadow-violet-950/50">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-6 z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1 text-xs font-bold text-violet-700 dark:text-violet-300">
              <Sparkles className="h-3.5 w-3.5" />
              Real-Time Browser Multiplayer Arena
              {liveCount && (
                <span className="ml-1 inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  • {liveCount.activeRooms} Live Room{liveCount.activeRooms === 1 ? "" : "s"}
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-slate-900 dark:text-white">
              Your Arena.
              <br />
              Your Rules.
              <br />
              <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                Your Victory.
              </span>
            </h1>

            <p className="max-w-lg text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Challenge friends, create instant PIN-protected rooms, and compete across
              survival challenges, classic boards, card battles, and strategy games directly in your browser.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/lobby" className="btn-primary !px-6 !py-3 text-sm">
                <Play className="h-4 w-4 fill-current" />
                Explore Games
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/lobby?create=true" className="btn-secondary !px-6 !py-3 text-sm">
                <Users className="h-4 w-4" />
                Create a Room
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-2xl border border-violet-500/30 shadow-2xl shadow-violet-900/30 aspect-[16/10]">
              <HeroArenaArtwork />
            </div>
          </div>
        </div>
      </section>

      {/* METRICS STRIP */}
      <section className="glass-card rounded-2xl px-6 py-5 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Users, value: "250K+", label: "Players Worldwide", color: "text-violet-500" },
          { icon: Gamepad2, value: "7 Engines", label: "Live Multiplayer Games", color: "text-indigo-500" },
          { icon: Trophy, value: "50+", label: "Seasonal Tournaments", color: "text-amber-500" },
          { icon: Globe, value: "150+", label: "Countries Connected", color: "text-cyan-500" },
        ].map((m) => (
          <div key={m.label} className="flex items-center gap-3.5">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 ${m.color}`}>
              <m.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                {m.value}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{m.label}</div>
            </div>
          </div>
        ))}
      </section>

      {/* FEATURED GAMES GRID */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-6 w-1.5 rounded-full bg-violet-600" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Featured Games
            </h2>
          </div>
          <Link
            href="/lobby"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-violet-600 dark:text-violet-400 hover:underline"
          >
            View All Games <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredGames.map((game) => (
            <div
              key={game.id}
              className="group glass-card overflow-hidden rounded-2xl flex flex-col hover:border-violet-500/60 hover:-translate-y-1 transition-all duration-200"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <GameCardArtwork gameId={game.id} />
                {game.isLive && (
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    Live
                  </span>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1 justify-between gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {game.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {game.categoryLabel} • {game.minPlayers}–{game.maxPlayers} players
                  </p>
                </div>
                <Link href={`/lobby?create=true&game=${game.id}`} className="btn-play-emerald">
                  Play Now <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* UPCOMING TOURNAMENTS & TOP PLAYERS */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upcoming Tournaments */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="h-6 w-1.5 rounded-full bg-violet-600" />
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Upcoming Tournaments
              </h2>
            </div>
            <Link
              href="/tournaments"
              className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-amber-500/5 via-transparent to-violet-600/10">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/30 border border-amber-400/40 text-amber-500 shadow-inner">
              <Trophy className="h-14 w-14" />
            </div>
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Global Gaming Championship
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                The ultimate multi-game test of reflexes, memory, and strategy!
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-violet-500" /> Dec 30, 2026
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-indigo-500" /> 5K+ Players
                </span>
                <span className="inline-flex items-center gap-1.5 text-amber-500">
                  <Trophy className="h-3.5 w-3.5" /> 50,000 Coins
                </span>
              </div>
              <div className="pt-1 flex flex-wrap justify-center sm:justify-start items-center gap-3">
                <Link href="/tournaments" className="btn-primary !py-2 !px-5 text-xs">
                  Register Now <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <span className="rounded-xl bg-slate-100 dark:bg-white/5 px-3 py-2 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Starts in 12d 08h 24m
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Players */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="h-6 w-1.5 rounded-full bg-violet-600" />
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Top Players
              </h2>
            </div>
            <Link
              href="/leaderboard"
              className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1"
            >
              View Leaderboard <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="glass-card rounded-2xl p-4 space-y-3">
            {(topPlayers.length > 0
              ? topPlayers
              : [
                  { rank: 1, userId: "s1", displayName: "GameMaster101", avatarUrl: "GM", xp: 125430 },
                  { rank: 2, userId: "s2", displayName: "ProPlayerX", avatarUrl: "PX", xp: 112750 },
                  { rank: 3, userId: "s3", displayName: "Legendary7", avatarUrl: "L7", xp: 98210 },
                ]
            ).map((p) => {
              const badgeColor =
                p.rank === 1
                  ? "bg-amber-400 text-slate-950"
                  : p.rank === 2
                    ? "bg-slate-300 text-slate-900"
                    : "bg-amber-700 text-white";
              return (
                <div
                  key={p.userId}
                  className="flex items-center justify-between rounded-xl bg-slate-100/80 dark:bg-white/5 px-3.5 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${badgeColor}`}>
                      {p.rank}
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-bold text-white">
                      {p.avatarUrl?.slice(0, 2) || p.displayName.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {p.displayName}
                    </span>
                  </div>
                  <span className="text-sm font-black text-violet-600 dark:text-violet-300">
                    {p.xp.toLocaleString()} XP
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA BANNER */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-700 via-indigo-700 to-purple-800 px-6 py-8 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-white shadow-glow">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Crown className="h-8 w-8 text-amber-300" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black">Join Jimsa Games Today!</h3>
            <p className="mt-1 text-xs sm:text-sm text-indigo-100">
              Create your account, unlock achievements, climb global leaderboards, and play with friends.
            </p>
          </div>
        </div>
        <Link
          href="/register"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-violet-700 shadow-lg hover:bg-indigo-50 transition-colors"
        >
          Sign Up Free <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
