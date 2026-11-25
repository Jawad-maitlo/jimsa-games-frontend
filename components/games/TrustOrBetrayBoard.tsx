"use client";

import React from "react";
import { Handshake, Sword, Timer, CheckCircle2 } from "lucide-react";

interface Props {
  state: any;
  myUserId: string;
  onAction: (action: any) => void;
}

export function TrustOrBetrayBoard({ state, myUserId, onAction }: Props) {
  const canDecide = state.phase === "DECIDE" && !state.myChoice && !state.finished;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="glass-card rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-black uppercase text-violet-500">
            Round {state.round} of {state.totalRounds} • {state.phase}
          </span>
          <p className="text-sm font-bold mt-0.5">{state.lastEvent}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-xl bg-violet-500/15 px-3 py-1.5 text-xs font-bold text-violet-500">
          <Timer className="h-4 w-4" /> {state.remainingSeconds}s
        </span>
      </div>

      {/* Decision Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          disabled={!canDecide}
          onClick={() => onAction({ type: "decide", choice: "COOPERATE" })}
          className={`rounded-3xl border-2 p-6 text-left transition-all ${
            state.myChoice === "COOPERATE"
              ? "border-emerald-400 bg-emerald-500/20 ring-4 ring-emerald-500/20"
              : "border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20"
          } disabled:opacity-70`}
        >
          <Handshake className="h-10 w-10 text-emerald-400 mb-3" />
          <h3 className="text-xl font-black text-emerald-500">COOPERATE</h3>
          <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
            Mutual Cooperation awards <strong>+3 pts</strong> each. Vulnerable to betrayal (0 pts).
          </p>
        </button>

        <button
          disabled={!canDecide}
          onClick={() => onAction({ type: "decide", choice: "BETRAY" })}
          className={`rounded-3xl border-2 p-6 text-left transition-all ${
            state.myChoice === "BETRAY"
              ? "border-rose-400 bg-rose-500/20 ring-4 ring-rose-500/20"
              : "border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20"
          } disabled:opacity-70`}
        >
          <Sword className="h-10 w-10 text-rose-400 mb-3" />
          <h3 className="text-xl font-black text-rose-500">BETRAY</h3>
          <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
            Steal <strong>+5 pts</strong> against a cooperator. Mutual betrayal yields only <strong>+1 pt</strong>.
          </p>
        </button>
      </div>

      {/* Live Standings */}
      <div className="glass-card rounded-2xl p-4 space-y-2">
        <h4 className="text-xs font-extrabold uppercase text-slate-500">Players & Lock-in Status</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(state.players || []).map((p: any) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl bg-slate-100 dark:bg-white/5 px-3.5 py-2.5 text-xs">
              <span className="font-bold">
                {p.displayName} {p.id === myUserId && "(You)"}
              </span>
              <div className="flex items-center gap-3">
                {state.phase === "DECIDE" && p.hasDecided && (
                  <span className="inline-flex items-center gap-1 text-emerald-500 font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Locked
                  </span>
                )}
                <span className="font-black text-violet-500">{p.score} pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Round Reveal History */}
      {(state.history || []).length > 0 && (
        <div className="glass-card rounded-2xl p-4 space-y-2">
          <h4 className="text-xs font-extrabold uppercase text-slate-500">Revealed Rounds</h4>
          <div className="space-y-2">
            {[...state.history].reverse().map((h: any) => (
              <div key={h.round} className="rounded-xl bg-slate-100/80 dark:bg-white/5 p-3 text-xs space-y-1">
                <div className="font-black text-violet-500">Round {h.round}</div>
                <div className="flex flex-wrap gap-2">
                  {(state.players || []).map((p: any) => (
                    <span key={p.id} className="rounded-lg bg-black/10 dark:bg-white/10 px-2.5 py-1">
                      {p.displayName}: <strong>{h.choices[p.id]}</strong> (+{h.deltas[p.id]})
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
