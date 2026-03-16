"use client";

import { useMapStore } from "@/lib/store";
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from "@/lib/constants";

export function EventPopup() {
  const selectedEvent = useMapStore((s) => s.selectedEvent);
  const setSelectedEvent = useMapStore((s) => s.setSelectedEvent);

  if (!selectedEvent) return null;

  const color = EVENT_TYPE_COLORS[selectedEvent.type] ?? "#6b7280";

  return (
    <div className="fixed inset-x-4 bottom-20 z-40 mx-auto max-w-md sm:bottom-6 sm:left-auto sm:right-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: color }}
            >
              {EVENT_TYPE_LABELS[selectedEvent.type]}
            </span>
            {selectedEvent.description && (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {selectedEvent.description}
              </p>
            )}
            <p className="mt-1 text-xs text-zinc-400">
              {selectedEvent.lat.toFixed(5)}, {selectedEvent.lng.toFixed(5)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedEvent(null)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
