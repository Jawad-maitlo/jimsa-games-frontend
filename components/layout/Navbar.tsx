"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Gamepad2, Moon, Sun, LogOut, Menu, X, Coins, Sparkles } from "lucide-react";
import { useTheme } from "../providers/ThemeProvider";
import { useAuth } from "../providers/AuthProvider";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Games", href: "/lobby" },
  { label: "Tournaments", href: "/tournaments" },
  { label: "Leaderboards", href: "/leaderboard" },
  { label: "Profile", href: "/profile" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-indigo-200/70 dark:border-violet-500/20 bg-white/85 dark:bg-[#080A1A]/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30 group-hover:scale-105 transition-transform">
            <Gamepad2 className="h-5 w-5" />
          </div>
          <div className="leading-none">
            <span className="block text-sm font-black tracking-wider text-slate-900 dark:text-white">
              JIMSA
            </span>
            <span className="block text-xs font-extrabold tracking-widest text-violet-600 dark:text-violet-400">
              GAMES
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-violet-600/12 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark or light theme"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-200 dark:border-violet-500/25 bg-slate-100/80 dark:bg-white/5 text-slate-700 dark:text-amber-300 hover:bg-indigo-100 dark:hover:bg-white/10 transition-colors"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-xl border border-indigo-200 dark:border-violet-500/30 bg-white dark:bg-white/5 px-3 py-1.5 hover:border-violet-500 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-bold text-white">
                  {user.avatarUrl?.slice(0, 2) || user.displayName.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left leading-tight">
                  <div className="text-xs font-bold text-slate-900 dark:text-white max-w-[110px] truncate">
                    {user.displayName}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-violet-600 dark:text-violet-300">
                    <span className="inline-flex items-center gap-0.5">
                      <Sparkles className="h-2.5 w-2.5" /> Lvl {user.level}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-amber-500">
                      <Coins className="h-2.5 w-2.5" /> {user.coins}
                    </span>
                  </div>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 hover:text-rose-500 hover:border-rose-400/50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="btn-secondary !py-2 !px-4 text-xs">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary !py-2 !px-4 text-xs">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-200 dark:border-violet-500/25 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-amber-300"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-200 dark:border-violet-500/25"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-indigo-200/70 dark:border-violet-500/20 bg-white dark:bg-[#0B0E22] px-4 py-4 space-y-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-violet-500/10"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex gap-2">
            {user ? (
              <button onClick={handleLogout} className="btn-secondary w-full text-xs">
                Sign Out ({user.displayName})
              </button>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 text-xs">
                  Sign In
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 text-xs">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
