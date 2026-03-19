"use client";

import { useState } from "react";
import { reportEvent } from "@/services/events";
import { useMapStore } from "@/lib/store";
import type { EventType } from "@/lib/types";
import { EVENT_TYPE_LABELS } from "@/lib/constants";

const EVENT_TYPES: EventType[] = ["checkpoint", "accident", "hazard", "roadblock"];

export function ReportModal() {
  const [type, setType] = useState<EventType>("hazard");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportModalOpen = useMapStore((s) => s.reportModalOpen);
  const reportCoords = useMapStore((s) => s.reportCoords);
  const reportPlaceLabel = useMapStore((s) => s.reportPlaceLabel);
  const closeReportModal = useMapStore((s) => s.closeReportModal);
  const addEvent = useMapStore((s) => s.addEvent);

  if (!reportModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportCoords) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await reportEvent({
        type,
        lat: reportCoords.lat,
        lng: reportCoords.lng,
        description: description.trim() || undefined,
      });
      addEvent(created);
      closeReportModal();
      setDescription("");
      setType("hazard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeReportModal}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Report event
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {reportPlaceLabel ? (
            <>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {reportPlaceLabel}
              </span>
              <span className="mt-1 block text-xs text-zinc-400">
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
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Event type
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {EVENT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    type === t
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  }`}
                >
                  {EVENT_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="desc" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Description (optional)
            </label>
            <textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Brief description..."
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={closeReportModal}
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
