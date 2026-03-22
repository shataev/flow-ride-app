"use client";

import { useCallback, useEffect, useState } from "react";
import { useMapStore } from "@/lib/store";
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from "@/lib/constants";
import { formatEventAddedAt } from "@/lib/formatEventDate";
import { deleteEvent } from "@/services/events";

const pixelBtnBase =
  "min-h-12 w-full rounded-[2px] border-2 px-4 font-mono text-base shadow-[4px_4px_0px_rgba(0,0,0,0.12)] transition-transform active:translate-x-[1px] active:translate-y-[1px] active:shadow-[3px_3px_0px_rgba(0,0,0,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 dark:shadow-[4px_4px_0px_rgba(0,0,0,0.35)] dark:active:shadow-[3px_3px_0px_rgba(0,0,0,0.35)]";

export function EventPopup() {
  const selectedEvent = useMapStore((s) => s.selectedEvent);
  const setSelectedEvent = useMapStore((s) => s.setSelectedEvent);
  const removeEvent = useMapStore((s) => s.removeEvent);

  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  useEffect(() => {
    setRemoveError(null);
  }, [selectedEvent?.id]);

  const handleRemove = useCallback(async () => {
    if (!selectedEvent) return;
    setRemoving(true);
    setRemoveError(null);
    try {
      await deleteEvent(selectedEvent.id);
      removeEvent(selectedEvent.id);
      setSelectedEvent(null);
    } catch (err) {
      setRemoveError(
        err instanceof Error ? err.message : "Failed to remove report"
      );
    } finally {
      setRemoving(false);
    }
  }, [selectedEvent, removeEvent, setSelectedEvent]);

  if (!selectedEvent) return null;

  const color = EVENT_TYPE_COLORS[selectedEvent.type] ?? "#6b7280";
  const addedAtLabel = formatEventAddedAt(selectedEvent.createdAt);

  return (
    <div className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-md sm:bottom-6 sm:left-auto sm:right-6">
      <div
        className="rounded-[2px] border-2 border-zinc-200/90 bg-white/95 p-5 shadow-[4px_4px_0px_rgba(0,0,0,0.12)] backdrop-blur dark:border-zinc-600/90 dark:bg-zinc-900/95 dark:shadow-[4px_4px_0px_rgba(0,0,0,0.35)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-popup-title"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span
              id="event-popup-title"
              className="inline-block rounded-[2px] border-2 px-2 py-0.5 font-mono text-xs font-semibold text-white shadow-[2px_2px_0px_rgba(0,0,0,0.2)] dark:shadow-[2px_2px_0px_rgba(0,0,0,0.35)]"
              style={{ backgroundColor: color, borderColor: color }}
            >
              {EVENT_TYPE_LABELS[selectedEvent.type]}
            </span>
            {selectedEvent.description && (
              <p className="mt-2 font-mono text-sm text-zinc-600 dark:text-zinc-400">
                {selectedEvent.description}
              </p>
            )}
            {addedAtLabel && (
              <p className="mt-2 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Added
                </span>
                <span className="text-zinc-500 dark:text-zinc-500"> · </span>
                <time dateTime={selectedEvent.createdAt}>{addedAtLabel}</time>
              </p>
            )}
            <p className="mt-1 font-mono text-xs text-zinc-500 dark:text-zinc-500">
              {selectedEvent.lat.toFixed(5)}, {selectedEvent.lng.toFixed(5)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedEvent(null)}
            className="shrink-0 rounded-[2px] border-2 border-zinc-200/90 bg-white p-1.5 text-zinc-500 shadow-[2px_2px_0px_rgba(0,0,0,0.08)] transition-transform hover:bg-zinc-50 hover:text-zinc-800 active:translate-x-[1px] active:translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 dark:border-zinc-600/90 dark:bg-zinc-900 dark:text-zinc-400 dark:shadow-[2px_2px_0px_rgba(0,0,0,0.25)] dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {removeError && (
          <p className="mt-4 font-mono text-sm text-red-600 dark:text-red-400">
            {removeError}
          </p>
        )}
        <button
          type="button"
          onClick={handleRemove}
          disabled={removing}
          className={
            pixelBtnBase +
            " mt-4 border-red-600 bg-red-50 text-zinc-900 shadow-[4px_4px_0px_rgba(220,38,38,0.35)] hover:bg-red-100 active:shadow-[3px_3px_0px_rgba(220,38,38,0.35)] disabled:pointer-events-none disabled:opacity-50 dark:border-red-400 dark:bg-red-950/40 dark:text-zinc-100 dark:shadow-[4px_4px_0px_rgba(248,113,113,0.35)] dark:hover:bg-red-950/60 dark:active:shadow-[3px_3px_0px_rgba(248,113,113,0.35)]"
          }
        >
          {removing ? "Removing…" : "Not here anymore"}
        </button>
      </div>
    </div>
  );
}
