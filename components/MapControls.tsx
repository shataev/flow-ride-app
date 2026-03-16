"use client";

import Link from "next/link";
import { useMapStore } from "@/lib/store";
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from "@/lib/constants";

interface MapControlsProps {
  onBuildRoute: () => void;
  routeLoading?: boolean;
}

export function MapControls({ onBuildRoute, routeLoading }: MapControlsProps) {
  const routeMode = useMapStore((s) => s.routeMode);
  const startPoint = useMapStore((s) => s.startPoint);
  const endPoint = useMapStore((s) => s.endPoint);
  const setRouteMode = useMapStore((s) => s.setRouteMode);
  const resetRoute = useMapStore((s) => s.resetRoute);

  const isBuildingRoute = routeMode !== "idle" || startPoint || endPoint;

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
        <div className="flex flex-wrap gap-2">
          {(["checkpoint", "accident", "hazard", "roadblock"] as const).map(
            (t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs text-zinc-700 dark:text-zinc-300"
                style={{
                  backgroundColor: `${EVENT_TYPE_COLORS[t]}20`,
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: EVENT_TYPE_COLORS[t] }}
                />
                {EVENT_TYPE_LABELS[t]}
              </span>
            )
          )}
        </div>
      </div>

      <div className="rounded-xl bg-white/95 p-3 shadow-md backdrop-blur dark:bg-zinc-900/95">
        <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Route
        </p>
        {!isBuildingRoute ? (
          <button
            type="button"
            onClick={() => setRouteMode("start")}
            className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Build route
          </button>
        ) : (
          <div className="space-y-2">
            {routeMode === "start" && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Tap map for start point
              </p>
            )}
            {routeMode === "end" && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Tap map for destination
              </p>
            )}
            {startPoint && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Start: {startPoint.lat.toFixed(4)}, {startPoint.lng.toFixed(4)}
              </p>
            )}
            {endPoint && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                End: {endPoint.lat.toFixed(4)}, {endPoint.lng.toFixed(4)}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetRoute}
                className="flex-1 rounded-lg border border-zinc-300 px-2 py-1.5 text-xs font-medium dark:border-zinc-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onBuildRoute}
                disabled={!startPoint || !endPoint || routeLoading}
                className="flex-1 rounded-lg bg-blue-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {routeLoading ? "Loading…" : "Get route"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
