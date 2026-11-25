"use client";

import React, { useState } from "react";
import { Layers, RotateCw, RotateCcw } from "lucide-react";

interface Props {
  state: any;
  myUserId: string;
  onAction: (action: any) => void;
}

const CARD_BG: Record<string, string> = {
  red: "from-rose-500 to-red-700 border-rose-300",
  blue: "from-sky-500 to-blue-700 border-sky-300",
  green: "from-emerald-500 to-green-700 border-emerald-300",
  yellow: "from-amber-400 to-orange-500 border-amber-200 text-slate-950",
  wild: "from-violet-600 via-fuchsia-600 to-indigo-700 border-violet-300",
};

export function CardClashBoard({ state, myUserId, onAction }: Props) {
  const [wildCardId, setWildCardId] = useState<string | null>(null);
  const top = state.topCard;

  const handleCardClick = (card: any) => {
    if (!state.isMyTurn || state.finished) return;
    if (card.color === "wild") {
      setWildCardId(card.id);
      return;
    }
    onAction({ type: "play", cardId: card.id });
  };

  const confirmWild = (color: "red" | "blue" | "green" | "yellow") => {
    if (!wildCardId) return;
    onAction({ type: "play", cardId: wildCardId, chosenColor: color });
    setWildCardId(null);
  };

  return (
    <div className="space-y-6">
      {/* Opponents Bar (only card counts, never hands!) */}
      <div className="flex flex-wrap gap-3">
        {(state.players || []).map((p: any) => (
          <div
            key={p.id}
            className={`rounded-2xl border px-4 py-2.5 text-xs flex items-center gap-3 ${
              p.id === state.currentTurnPlayerId
                ? "border-violet-500 bg-violet-500/15 ring-2 ring-violet-500/30"
                : "glass-card"
            }`}
          >
            <div className="font-extrabold">
              {p.displayName} {p.id === myUserId && "(You)"}
            </div>
            <span className="rounded-lg bg-slate-200 dark:bg-white/10 px-2 py-0.5 font-black">
              {p.cardCount} cards
            </span>
          </div>
        ))}
      </div>

      {/* Center Table */}
      <div className="glass-card rounded-3xl p-6 flex flex-col items-center gap-5">
        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
            {state.direction === 1 ? <RotateCw className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
            {state.direction === 1 ? "Clockwise" : "Counter-Clockwise"}
          </span>
          <span className="uppercase">
            Active Color:{" "}
            <strong className="px-2 py-0.5 rounded bg-black/20 text-white">
              {state.activeColor}
            </strong>
          </span>
        </div>

        <p className="text-xs sm:text-sm font-semibold text-center">{state.lastEvent}</p>

        <div className="flex items-center justify-center gap-8">
          {/* Draw Pile */}
          <button
            disabled={!state.isMyTurn || state.finished}
            onClick={() => onAction({ type: "draw" })}
            className="h-36 w-24 rounded-2xl border-2 border-violet-400/50 bg-gradient-to-br from-slate-800 to-indigo-950 text-white flex flex-col items-center justify-center gap-2 shadow-xl hover:scale-105 transition-transform disabled:opacity-50"
          >
            <Layers className="h-7 w-7 text-violet-300" />
            <span className="text-xs font-black">DRAW</span>
            <span className="text-[10px] text-slate-300">{state.deckCount} left</span>
          </button>

          {/* Top Discard */}
          {top && (
            <div
              className={`h-36 w-24 rounded-2xl border-2 bg-gradient-to-br ${CARD_BG[top.color]} text-white flex flex-col items-center justify-center shadow-2xl`}
            >
              <span className="text-2xl font-black">{top.value}</span>
              <span className="text-[10px] uppercase font-bold mt-1 opacity-90">
                {top.color}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Wild Color Picker */}
      {wildCardId && (
        <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center justify-center gap-3 border-violet-500">
          <span className="text-xs font-bold">Choose Wild Color:</span>
          {(["red", "blue", "green", "yellow"] as const).map((c) => (
            <button
              key={c}
              onClick={() => confirmWild(c)}
              className={`rounded-xl px-4 py-2 text-xs font-black uppercase text-white bg-gradient-to-r ${CARD_BG[c]}`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* My Private Hand */}
      <div className="space-y-2">
        <div className="text-xs font-extrabold uppercase tracking-wider text-violet-500">
          Your Private Hand ({state.myHand?.length || 0}) {state.isMyTurn ? "— Click a card to play!" : ""}
        </div>
        <div className="flex flex-wrap gap-2.5">
          {(state.myHand || []).map((card: any) => (
            <button
              key={card.id}
              disabled={!state.isMyTurn || state.finished}
              onClick={() => handleCardClick(card)}
              className={`h-28 w-20 rounded-xl border-2 bg-gradient-to-br ${CARD_BG[card.color]} text-white flex flex-col items-center justify-center shadow-md hover:-translate-y-2 transition-transform disabled:opacity-60 disabled:hover:translate-y-0`}
            >
              <span className="text-lg font-black">{card.value}</span>
              <span className="text-[9px] uppercase font-bold opacity-90">{card.color}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
