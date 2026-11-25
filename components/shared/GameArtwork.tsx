"use client";

import React from "react";
import { GameId } from "../../shared/types/game";

export function HeroArenaArtwork() {
  return (
    <svg
      viewBox="0 0 640 420"
      className="w-full h-full object-cover select-none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Jimsa Games Cyber Arena Artwork"
    >
      <defs>
        <linearGradient id="heroSky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1E1B4B" />
          <stop offset="50%" stopColor="#4C1D95" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="neonBeam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#A855F7" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#EC4899" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="cloakGrad" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#E11D48" />
          <stop offset="55%" stopColor="#9F1239" />
          <stop offset="100%" stopColor="#3B0764" />
        </linearGradient>
        <linearGradient id="goldCrown" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <filter id="neonGlow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="640" height="420" rx="24" fill="url(#heroSky)" />

      {/* Perspective neon grid floor */}
      <g opacity="0.28" stroke="#818CF8" strokeWidth="1.2">
        <line x1="0" y1="300" x2="640" y2="300" />
        <line x1="0" y1="330" x2="640" y2="330" />
        <line x1="0" y1="365" x2="640" y2="365" />
        <line x1="0" y1="405" x2="640" y2="405" />
        <line x1="320" y1="260" x2="40" y2="420" />
        <line x1="320" y1="260" x2="170" y2="420" />
        <line x1="320" y1="260" x2="320" y2="420" />
        <line x1="320" y1="260" x2="470" y2="420" />
        <line x1="320" y1="260" x2="600" y2="420" />
      </g>

      {/* Neon Arena Arches */}
      <path d="M40 310 L130 140 L260 140 L340 310" fill="none" stroke="url(#neonBeam)" strokeWidth="4" opacity="0.55" filter="url(#neonGlow)" />
      <path d="M370 320 L450 165 L575 165 L635 320" fill="none" stroke="#38BDF8" strokeWidth="3" opacity="0.45" />

      {/* Floating Victory Crown */}
      <g transform="translate(495, 78) rotate(8)" filter="url(#neonGlow)">
        <path d="M0 44 L8 10 L28 28 L44 4 L60 28 L80 10 L88 44 Z" fill="url(#goldCrown)" stroke="#FEF08A" strokeWidth="2" />
        <rect x="4" y="46" width="80" height="8" rx="4" fill="#F59E0B" />
      </g>

      {/* Original Jimsa Arena Champion Silhouette (Futuristic Cyber Visor) */}
      <g transform="translate(215, 42)">
        {/* Aura */}
        <ellipse cx="140" cy="180" rx="125" ry="145" fill="#7C3AED" opacity="0.22" />
        {/* Hood & Armored Jacket */}
        <path
          d="M52 378 L72 225 C78 190 95 168 140 168 C185 168 202 190 208 225 L228 378 Z"
          fill="url(#cloakGrad)"
          stroke="#FB7185"
          strokeOpacity="0.4"
          strokeWidth="2"
        />
        <path
          d="M84 195 C72 130 85 52 140 48 C195 52 208 130 196 195 C175 215 105 215 84 195 Z"
          fill="url(#cloakGrad)"
        />
        {/* Helmet / Cyber Visor */}
        <ellipse cx="140" cy="126" rx="42" ry="52" fill="#0B0F1F" stroke="#A855F7" strokeWidth="2.5" />
        {/* Original Jimsa Diamond-Bolt Emblem on Visor */}
        <polygon
          points="140,94 166,126 140,158 114,126"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="4"
          filter="url(#neonGlow)"
        />
        <polygon points="140,108 152,126 140,144 128,126" fill="#C084FC" opacity="0.9" />
        {/* Jacket Neon Trim */}
        <line x1="140" y1="210" x2="140" y2="378" stroke="#F43F5E" strokeWidth="3" opacity="0.7" />
        <path d="M98 250 L125 268 L125 315" fill="none" stroke="#38BDF8" strokeWidth="2" opacity="0.55" />
        <path d="M182 250 L155 268 L155 315" fill="none" stroke="#38BDF8" strokeWidth="2" opacity="0.55" />
      </g>

      {/* Sparks */}
      <circle cx="95" cy="90" r="3" fill="#FDE047" />
      <circle cx="565" cy="210" r="2.5" fill="#38BDF8" />
      <circle cx="155" cy="240" r="2.5" fill="#F472B6" />
      <circle cx="430" cy="65" r="2" fill="#C084FC" />
    </svg>
  );
}

export function GameCardArtwork({ gameId }: { gameId: GameId }) {
  switch (gameId) {
    case "red-light-green-light":
      return (
        <svg viewBox="0 0 320 180" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="rlglBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7F1D1D" />
              <stop offset="55%" stopColor="#3B0764" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>
          <rect width="320" height="180" fill="url(#rlglBg)" />
          <line x1="0" y1="145" x2="320" y2="145" stroke="#EF4444" strokeWidth="3" strokeDasharray="8 6" />
          <rect x="130" y="22" width="60" height="106" rx="16" fill="#0F172A" stroke="#F43F5E" strokeWidth="2.5" />
          <circle cx="160" cy="52" r="16" fill="#EF4444" />
          <circle cx="160" cy="96" r="16" fill="#10B981" />
          <circle cx="65" cy="135" r="10" fill="#F43F5E" opacity="0.9" />
          <circle cx="105" cy="135" r="10" fill="#38BDF8" opacity="0.9" />
          <circle cx="245" cy="135" r="10" fill="#A855F7" opacity="0.9" />
        </svg>
      );
    case "glass-bridge":
      return (
        <svg viewBox="0 0 320 180" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="gbBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1E1B4B" />
              <stop offset="55%" stopColor="#312E81" />
              <stop offset="100%" stopColor="#090D1F" />
            </linearGradient>
          </defs>
          <rect width="320" height="180" fill="url(#gbBg)" />
          {/* Perspective glass panels */}
          <polygon points="105,175 152,175 155,130 118,130" fill="#38BDF8" fillOpacity="0.35" stroke="#7DD3FC" strokeWidth="2" />
          <polygon points="168,175 215,175 202,130 165,130" fill="#EC4899" fillOpacity="0.28" stroke="#F472B6" strokeWidth="2" />
          <polygon points="122,122 156,122 158,86 132,86" fill="#10B981" fillOpacity="0.4" stroke="#34D399" strokeWidth="2" />
          <polygon points="164,122 198,122 188,86 162,86" fill="#38BDF8" fillOpacity="0.2" stroke="#818CF8" strokeWidth="2" />
          <polygon points="135,78 158,78 159,52 142,52" fill="#818CF8" fillOpacity="0.3" stroke="#C4B5FD" strokeWidth="1.5" />
          <polygon points="162,78 185,78 178,52 161,52" fill="#10B981" fillOpacity="0.45" stroke="#6EE7B7" strokeWidth="1.5" />
          <circle cx="160" cy="24" r="14" fill="#A855F7" opacity="0.6" />
        </svg>
      );
    case "chess":
      return (
        <svg viewBox="0 0 320 180" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="chBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1C1917" />
              <stop offset="50%" stopColor="#451A03" />
              <stop offset="100%" stopColor="#1E1B4B" />
            </linearGradient>
          </defs>
          <rect width="320" height="180" fill="url(#chBg)" />
          <g opacity="0.3">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((c) => (
              <rect key={c} x={c * 40} y={c % 2 === 0 ? 110 : 145} width="40" height="35" fill="#FDE68A" />
            ))}
          </g>
          <text x="95" y="120" fontSize="82" fill="#FEF3C7">♔</text>
          <text x="170" y="128" fontSize="78" fill="#A855F7">♞</text>
        </svg>
      );
    case "ludo":
      return (
        <svg viewBox="0 0 320 180" className="w-full h-full object-cover">
          <rect width="320" height="180" fill="#0F172A" />
          <rect x="24" y="16" width="128" height="68" rx="12" fill="#EF4444" opacity="0.85" />
          <rect x="168" y="16" width="128" height="68" rx="12" fill="#10B981" opacity="0.85" />
          <rect x="24" y="96" width="128" height="68" rx="12" fill="#3B82F6" opacity="0.85" />
          <rect x="168" y="96" width="128" height="68" rx="12" fill="#F59E0B" opacity="0.85" />
          <rect x="132" y="62" width="56" height="56" rx="12" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="4" />
          <circle cx="147" cy="77" r="4.5" fill="#1E1B4B" />
          <circle cx="173" cy="77" r="4.5" fill="#1E1B4B" />
          <circle cx="160" cy="90" r="4.5" fill="#1E1B4B" />
          <circle cx="147" cy="103" r="4.5" fill="#1E1B4B" />
          <circle cx="173" cy="103" r="4.5" fill="#1E1B4B" />
        </svg>
      );
    case "card-clash":
      return (
        <svg viewBox="0 0 320 180" className="w-full h-full object-cover">
          <rect width="320" height="180" fill="#1E1038" />
          <g transform="rotate(-14 115 95)">
            <rect x="70" y="34" width="76" height="112" rx="12" fill="#EF4444" stroke="#FFF" strokeWidth="3" />
            <text x="95" y="104" fontSize="40" fontWeight="bold" fill="#FFF">+2</text>
          </g>
          <g transform="rotate(8 195 95)">
            <rect x="150" y="28" width="76" height="112" rx="12" fill="#3B82F6" stroke="#FFF" strokeWidth="3" />
            <text x="176" y="100" fontSize="42" fontWeight="bold" fill="#FFF">7</text>
          </g>
        </svg>
      );
    case "trust-or-betray":
      return (
        <svg viewBox="0 0 320 180" className="w-full h-full object-cover">
          <rect width="320" height="180" fill="#1B102E" />
          <rect x="34" y="34" width="114" height="112" rx="16" fill="#10B981" fillOpacity="0.2" stroke="#10B981" strokeWidth="2.5" />
          <rect x="172" y="34" width="114" height="112" rx="16" fill="#EF4444" fillOpacity="0.2" stroke="#EF4444" strokeWidth="2.5" />
          <text x="64" y="102" fontSize="42">🤝</text>
          <text x="204" y="102" fontSize="42">🗡️</text>
        </svg>
      );
    case "treasure-hunt":
    default:
      return (
        <svg viewBox="0 0 320 180" className="w-full h-full object-cover">
          <rect width="320" height="180" fill="#16211F" />
          <circle cx="160" cy="90" r="56" fill="#F59E0B" fillOpacity="0.18" stroke="#FBBF24" strokeWidth="2.5" strokeDasharray="6 6" />
          <text x="132" y="106" fontSize="54">🧭</text>
        </svg>
      );
  }
}
