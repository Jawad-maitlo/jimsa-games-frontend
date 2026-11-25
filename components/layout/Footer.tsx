"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Gamepad2, ArrowRight } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="mt-20 border-t border-indigo-200/70 dark:border-violet-500/15 bg-white/70 dark:bg-[#060814]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                <Gamepad2 className="h-5 w-5" />
              </div>
              <div className="leading-none">
                <span className="block text-sm font-black tracking-wider">JIMSA</span>
                <span className="block text-xs font-extrabold tracking-widest text-violet-600 dark:text-violet-400">
                  GAMES
                </span>
              </div>
            </div>
            <p className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
              Play. Compete. Conquer.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Games
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><Link href="/lobby?game=red-light-green-light" className="hover:text-violet-500">Red Light, Green Light</Link></li>
              <li><Link href="/lobby?game=glass-bridge" className="hover:text-violet-500">Glass Bridge</Link></li>
              <li><Link href="/lobby?game=chess" className="hover:text-violet-500">Chess</Link></li>
              <li><Link href="/lobby?game=ludo" className="hover:text-violet-500">Ludo</Link></li>
              <li><Link href="/lobby" className="hover:text-violet-500">+ 3 more games</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><Link href="/lobby" className="hover:text-violet-500">Game Lobby</Link></li>
              <li><Link href="/tournaments" className="hover:text-violet-500">Tournaments</Link></li>
              <li><Link href="/leaderboard" className="hover:text-violet-500">Global Leaderboards</Link></li>
              <li><Link href="/profile" className="hover:text-violet-500">Player Profile</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Stay Connected
            </h4>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-xl border border-indigo-200 dark:border-violet-500/25 bg-white dark:bg-white/5 px-3 py-2 text-xs outline-none focus:border-violet-500"
              />
              <button type="submit" className="btn-primary !px-3 !py-2">
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            {subscribed && (
              <p className="mt-2 text-xs text-emerald-500 font-medium">
                Subscribed for tournament drops!
              </p>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-indigo-200/60 dark:border-white/10 pt-6 text-xs text-slate-500 dark:text-slate-400">
          <span>© {new Date().getFullYear()} Jimsa Games. All rights reserved.</span>
          <span className="font-semibold text-violet-600 dark:text-violet-400">
            Play. Compete. Conquer.
          </span>
        </div>
      </div>
    </footer>
  );
}
