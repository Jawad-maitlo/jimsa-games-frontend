"use client";

import React, { useState } from "react";
import { Trophy, Calendar, Users, CheckCircle2 } from "lucide-react";

const TOURNAMENTS = [
  {
    id: "global-championship",
    title: "Global Gaming Championship",
    game: "Multi-Game Arena (Survival + Strategy)",
    date: "Dec 30, 2026",
    players: "5,240",
    prize: "50,000 Coins + Champion Crown",
    status: "Open for Registration",
  },
  {
    id: "glass-bridge-masters",
    title: "Glass Bridge Survival Cup",
    game: "Glass Bridge",
    date: "Jan 12, 2027",
    players: "1,850",
    prize: "15,000 Coins + Glass Survivor Badge",
    status: "Open for Registration",
  },
  {
    id: "chess-blitz-invitational",
    title: "Jimsa Chess Blitz Open",
    game: "Chess",
    date: "Jan 25, 2027",
    players: "920",
    prize: "20,000 Coins + Grandmaster Title",
    status: "Open for Registration",
  },
];

export default function TournamentsPage() {
  const [registered, setRegistered] = useState<string[]>([]);

  const toggleReg = (id: string) => {
    setRegistered((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Tournaments</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Compete in scheduled brackets for exclusive badges and virtual coin prizes.
        </p>
      </div>

      <div className="space-y-4">
        {TOURNAMENTS.map((t) => {
          const isReg = registered.includes(t.id);
          return (
            <div
              key={t.id}
              className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
                  <Trophy className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-violet-500">
                    {t.game}
                  </span>
                  <h2 className="text-lg font-black">{t.title}</h2>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> {t.date}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {t.players} Registered
                    </span>
                    <span className="font-bold text-amber-500">{t.prize}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleReg(t.id)}
                className={isReg ? "btn-secondary text-xs shrink-0" : "btn-primary text-xs shrink-0"}
              >
                {isReg ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Registered
                  </>
                ) : (
                  "Register Now"
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
