"use client";

import { useMapStore } from "@/lib/store";
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from "@/lib/constants";
import { EVENT_TYPES, EVENT_TYPE_ICON_PATHS } from "@/lib/eventTypeIcons";
import type { EventType } from "@/lib/types";

/**
 * Legend + filter: round icon controls (checkbox semantics) to show/hide
 * markers by type. Styled like radio tiles for a compact map overlay.
 */
export function EventTypeFilterLegend() {
  const eventTypeVisible = useMapStore((s) => s.eventTypeVisible);
  const toggleEventTypeVisible = useMapStore((s) => s.toggleEventTypeVisible);
  const selectedEvent = useMapStore((s) => s.selectedEvent);
  const setSelectedEvent = useMapStore((s) => s.setSelectedEvent);

  const handleToggle = (type: EventType) => {
    const nextVisible = !eventTypeVisible[type];
    toggleEventTypeVisible(type);
    if (
      selectedEvent &&
      selectedEvent.type === type &&
      !nextVisible
    ) {
      setSelectedEvent(null);
    }
  };

  return (
    <fieldset className="pointer-events-auto m-0 min-w-0 border-0 p-0">
      <legend className="sr-only">
        Filter traffic events on the map by type
      </legend>
      <div
        className="flex max-w-[min(100vw-7rem,20rem)] flex-wrap items-center gap-2 rounded-2xl border border-zinc-200/90 bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur-sm dark:border-zinc-600/90 dark:bg-zinc-900/95"
        role="group"
        aria-label="Event type filter"
      >
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPES.map((type) => {
            const on = eventTypeVisible[type];
            const label = EVENT_TYPE_LABELS[type] ?? type;
            const color = EVENT_TYPE_COLORS[type] ?? "#6b7280";
            const path = EVENT_TYPE_ICON_PATHS[type];
            return (
              <button
                key={type}
                type="button"
                role="checkbox"
                aria-checked={on}
                title={`${label}: ${on ? "visible" : "hidden"}`}
                onClick={() => handleToggle(type)}
                className={
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900 " +
                  (on
                    ? "scale-100 opacity-100 ring-2 ring-zinc-300 ring-offset-1 dark:ring-zinc-600"
                    : "scale-95 opacity-40 grayscale hover:opacity-60")
                }
                style={{ backgroundColor: color }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width={14}
                  height={14}
                  aria-hidden
                >
                  <path fill="white" d={path} />
                </svg>
              </button>
            );
          })}
        </div>
      </div>
    </fieldset>
  );
}
