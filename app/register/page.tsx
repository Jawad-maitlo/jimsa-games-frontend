"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { useAuth } from "../../components/providers/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register({ username, email, password, displayName: displayName || username });
      router.push("/lobby");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="glass-card rounded-3xl p-7 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Create Your Player Account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Start with 250 bonus coins, unlock achievements, and compete globally.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5">Username</label>
            <input
              type="text"
              required
              minLength={3}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="pro_gamer_99"
              className="w-full rounded-xl border border-indigo-200 dark:border-violet-500/30 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Pro Gamer"
              className="w-full rounded-xl border border-indigo-200 dark:border-violet-500/30 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-indigo-200 dark:border-violet-500/30 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">Password (6+ characters)</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-indigo-200 dark:border-violet-500/30 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm outline-none focus:border-violet-500"
            />
          </div>

          <button type="submit" disabled={busy} className="btn-primary w-full">
            <UserPlus className="h-4 w-4" />
            {busy ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-violet-600 dark:text-violet-400 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
