"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Sparkles } from "lucide-react";
import { useAuth } from "../../components/providers/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login, continueAsGuest } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [guestName, setGuestName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(identifier, password);
      router.push("/lobby");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  };

  const handleGuest = async () => {
    setError("");
    setBusy(true);
    try {
      await continueAsGuest(guestName || undefined);
      router.push("/lobby");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Guest session failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="glass-card rounded-3xl p-7 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Welcome Back</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to enter the arena and track your XP & leaderboards.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5">Username or Email</label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="player123 or player@example.com"
              className="w-full rounded-xl border border-indigo-200 dark:border-violet-500/30 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-indigo-200 dark:border-violet-500/30 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm outline-none focus:border-violet-500"
            />
          </div>

          <button type="submit" disabled={busy} className="btn-primary w-full">
            <LogIn className="h-4 w-4" />
            {busy ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-slate-200 dark:border-white/10" />
          <span className="mx-3 text-[11px] font-bold uppercase text-slate-400">Or Quick Play</span>
          <div className="flex-grow border-t border-slate-200 dark:border-white/10" />
        </div>

        <div className="space-y-2.5">
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Optional guest nickname (e.g. SpeedRunner)"
            className="w-full rounded-xl border border-indigo-200 dark:border-violet-500/30 bg-white dark:bg-white/5 px-3.5 py-2 text-xs outline-none focus:border-violet-500"
          />
          <button
            type="button"
            disabled={busy}
            onClick={handleGuest}
            className="btn-secondary w-full text-xs"
          >
            <Sparkles className="h-4 w-4 text-violet-500" />
            Continue as Guest
          </button>
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          New to Jimsa Games?{" "}
          <Link href="/register" className="font-bold text-violet-600 dark:text-violet-400 hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
