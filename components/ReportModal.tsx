"use client";

import { useState } from "react";
import { reportEvent } from "@/services/events";
import { useMapStore } from "@/lib/store";
import { EVENT_DESCRIPTION_MAX_LENGTH } from "@/lib/eventDescription";
import {
  EVENT_TYPE_ICON_PATHS,
  EVENT_TYPE_ICON_RENDER_SIZE,
} from "@/lib/eventTypeIcons";

const pixelBtnBase =
  "min-h-12 flex-1 rounded-[2px] border-2 px-4 font-mono text-base shadow-[4px_4px_0px_rgba(0,0,0,0.12)] transition-transform active:translate-x-[1px] active:translate-y-[1px] active:shadow-[3px_3px_0px_rgba(0,0,0,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 dark:shadow-[4px_4px_0px_rgba(0,0,0,0.35)] dark:active:shadow-[3px_3px_0px_rgba(0,0,0,0.35)]";

export function ReportModal() {
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportModalOpen = useMapStore((s) => s.reportModalOpen);
  const reportCoords = useMapStore((s) => s.reportCoords);
  const reportPlaceLabel = useMapStore((s) => s.reportPlaceLabel);
  const closeReportModal = useMapStore((s) => s.closeReportModal);
  const addEvent = useMapStore((s) => s.addEvent);

  if (!reportModalOpen) return null;

  const reportTitleIconH = Math.round(EVENT_TYPE_ICON_RENDER_SIZE * 0.65);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportCoords) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await reportEvent({
        type: "police",
        lat: reportCoords.lat,
        lng: reportCoords.lng,
        description:
          description.trim().slice(0, EVENT_DESCRIPTION_MAX_LENGTH) ||
          undefined,
      });
      addEvent(created);
      closeReportModal();
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeReportModal}
        aria-hidden
      />
      <div
        className="relative z-10 w-full max-w-md rounded-[2px] border-2 border-zinc-200/90 bg-white/95 p-5 shadow-[4px_4px_0px_rgba(0,0,0,0.12)] backdrop-blur dark:border-zinc-600/90 dark:bg-zinc-900/95 dark:shadow-[4px_4px_0px_rgba(0,0,0,0.35)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
      >
        <h2
          id="report-modal-title"
          className="flex flex-wrap items-center gap-1.5 font-mono text-base font-semibold text-zinc-900 dark:text-zinc-100"
          aria-label="Report police on the road"
        >
          <span>Report</span>
          <img
            src={EVENT_TYPE_ICON_PATHS.police}
            alt=""
            aria-hidden
            width={27}
            height={reportTitleIconH}
            style={{
              imageRendering: "pixelated",
              transform: "translateY(-3px)",
            }}
            className="shrink-0"
          />
          <span>on the road</span>
        </h2>
        <p className="mt-1 font-mono text-sm text-zinc-600 dark:text-zinc-400">
          {reportPlaceLabel ? (
            <>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                {reportPlaceLabel}
              </span>
              <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-500">
                {reportCoords?.lat.toFixed(5)}, {reportCoords?.lng.toFixed(5)}
              </span>
            </>
          ) : (
            <>
              Location: {reportCoords?.lat.toFixed(5)},{" "}
              {reportCoords?.lng.toFixed(5)}
            </>
          )}
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="desc"
              className="block font-mono text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
              Description (optional, max {EVENT_DESCRIPTION_MAX_LENGTH}{" "}
              characters)
            </label>
            <textarea
              id="desc"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value.slice(0, EVENT_DESCRIPTION_MAX_LENGTH)
                )
              }
              maxLength={EVENT_DESCRIPTION_MAX_LENGTH}
              rows={2}
              className="mt-1.5 w-full rounded-[2px] border-2 border-zinc-200/90 bg-white px-3 py-2 font-mono text-base text-zinc-900 shadow-[2px_2px_0px_rgba(0,0,0,0.08)] placeholder-zinc-400 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:shadow-[2px_2px_0px_rgba(0,0,0,0.25)]"
              placeholder="Brief description..."
            />
            <p className="mt-1 font-mono text-xs text-zinc-500 dark:text-zinc-500">
              {description.length}/{EVENT_DESCRIPTION_MAX_LENGTH}
            </p>
          </div>
          {error && (
            <p className="font-mono text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={closeReportModal}
              className={
                pixelBtnBase +
                " border-zinc-200/90 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-600/90 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              }
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={
                pixelBtnBase +
                " border-blue-600 bg-blue-50 text-zinc-900 shadow-[4px_4px_0px_rgba(37,99,235,0.35)] hover:bg-blue-100 active:shadow-[3px_3px_0px_rgba(37,99,235,0.35)] dark:border-blue-400 dark:bg-blue-950/50 dark:text-zinc-100 dark:shadow-[4px_4px_0px_rgba(59,130,246,0.35)] dark:hover:bg-blue-950/70 dark:active:shadow-[3px_3px_0px_rgba(59,130,246,0.35)]"
              }
            >
              {submitting ? "Sending…" : "Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
