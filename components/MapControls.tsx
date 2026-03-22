"use client";

import Link from "next/link";
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from "@/lib/constants";

export function MapControls() {
  return (
    <div className="absolute left-3 top-3 right-3 z-10 flex flex-col gap-2 sm:left-auto sm:right-4 sm:top-4 sm:max-w-[200px]">
      <nav className="flex items-center gap-2">
        <Link
          href="/"
          className="rounded-xl bg-white/95 px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-md backdrop-blur dark:bg-zinc-900/95 dark:text-zinc-100"
        >
          Map
        </Link>
        <Link
          href="/report"
          className="rounded-xl bg-white/95 px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-md backdrop-blur dark:bg-zinc-900/95 dark:text-zinc-100"
        >
          Report
        </Link>
        <Link
          href="/about"
          className="rounded-xl bg-white/95 px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-md backdrop-blur dark:bg-zinc-900/95 dark:text-zinc-100"
        >
          About
        </Link>
      </nav>

      <div className="rounded-xl bg-white/95 p-3 shadow-md backdrop-blur dark:bg-zinc-900/95">
        <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Legend
        </p>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs text-zinc-700 dark:text-zinc-300"
          style={{
            backgroundColor: `${EVENT_TYPE_COLORS.police}20`,
          }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: EVENT_TYPE_COLORS.police }}
          />
          {EVENT_TYPE_LABELS.police}
        </span>
      </div>

      <div className="rounded-xl bg-white/95 p-3 shadow-md backdrop-blur dark:bg-zinc-900/95">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Use the search bar to find a place, then submit a traffic report for
          that location.
        </p>
      </div>
    </div>
  );
}
