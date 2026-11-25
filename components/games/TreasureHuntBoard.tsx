"use client";

import React, { useState } from "react";
import { Compass, Lightbulb, Send, Timer } from "lucide-react";

interface Props {
  state: any;
  myUserId: string;
  onAction: (action: any) => void;
}

export function TreasureHuntBoard({ state, myUserId, onAction }: Props) {
  const [answer, setAnswer] = useState("");
  const stage = state.currentStage;

  const submitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    onAction({ type: "answer", answer: answer.trim() });
    setAnswer("");
  };

  return (
    <div className="space-y-5">
      <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Compass className="h-5 w-5 text-amber-500" />
          <span>{state.lastEvent}</span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-xl bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-500">
          <Timer className="h-4 w-4" /> {state.remainingSeconds}s
        </span>
      </div>

      {/* Active Chamber Clue */}
      {stage ? (
        <div className="glass-card rounded-3xl p-6 space-y-4 border-amber-500/30">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-black text-amber-500">
              Chamber {stage.index + 1} of {state.totalStages}: {stage.chamberName}
            </span>
            <span className="text-xs font-bold text-violet-500">+{stage.basePoints} base pts</span>
          </div>

          <p className="text-lg sm:text-xl font-bold leading-relaxed">{stage.clue}</p>

          {stage.hint ? (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-2.5 text-xs font-semibold text-amber-600 dark:text-amber-300">
              Hint: {stage.hint}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onAction({ type: "hint" })}
              className="btn-secondary !py-1.5 !px-3 text-xs"
            >
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Reveal Hint (-30 pts)
            </button>
          )}

          <form onSubmit={submitAnswer} className="flex gap-2.5 pt-2">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer to unlock the next chamber..."
              className="flex-1 rounded-xl border border-indigo-200 dark:border-violet-500/30 bg-white dark:bg-white/5 px-4 py-3 text-sm outline-none focus:border-violet-500"
            />
            <button type="submit" className="btn-primary !px-6">
              <Send className="h-4 w-4" /> Unlock
            </button>
          </form>
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-8 text-center font-bold text-emerald-500">
          All chambers unlocked!
        </div>
      )}

      {/* Expedition Progress */}
      <div className="glass-card rounded-2xl p-4 space-y-2.5">
        <h4 className="text-xs font-extrabold uppercase text-slate-500">Explorer Race</h4>
        {(state.players || []).map((p: any) => (
          <div key={p.id} className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span>
                {p.displayName} {p.id === myUserId && "(You)"}
              </span>
              <span>
                Chamber {p.stageIndex}/{state.totalStages} • {p.score} pts
              </span>
            </div>
            <div className="h-3 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 transition-all"
                style={{ width: `${(p.stageIndex / state.totalStages) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
