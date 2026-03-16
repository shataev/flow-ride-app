"use client";

import type { TrafficEvent } from "@/lib/types";
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from "@/lib/constants";

interface EventCardProps {
  event: TrafficEvent;
  onClose: () => void;
  onReportOnRoute?: () => void;
}

export function EventCard({
  event,
  onClose,
  onReportOnRoute,
}: EventCardProps) {
  const color = EVENT_TYPE_COLORS[event.type] ?? "#6b7280";

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <span
            className="inline-block rounded-full px-3 py-1 text-sm font-medium text-white"
            style={{ backgroundColor: color }}
          >
            {EVENT_TYPE_LABELS[event.type]}
          </span>
          {event.description && (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {event.description}
            </p>
          )}
          <p className="mt-1 text-xs text-zinc-400">
            {event.lat.toFixed(5)}, {event.lng.toFixed(5)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
          aria-label="Close"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      {onReportOnRoute && (
        <button
          type="button"
          onClick={onReportOnRoute}
          className="mt-3 w-full rounded-xl bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 active:scale-[0.98]"
        >
          Report event on route
        </button>
      )}
    </div>
  );
}
