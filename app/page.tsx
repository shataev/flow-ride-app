"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { MapView } from "@/components/map/MapView";
import { MapControls } from "@/components/map/MapControls";
import { useMapContext } from "@/components/map/MapContext";
import { EventTypeFilterLegend } from "@/components/map/EventTypeFilterLegend";
import { SearchBar } from "@/components/ui/SearchBar";
import { FloatingButton } from "@/components/ui/FloatingButton";
import { EventPopup } from "@/components/EventPopup";
import { ReportModal } from "@/components/ReportModal";
import {
  suggest,
  retrieve,
  type SearchSuggestion,
} from "@/services/geocoding";
import { useMapStore } from "@/lib/store";

const MapViewDynamic = dynamic(
  () => import("@/components/map/MapView").then((m) => ({ default: m.MapView })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-900">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Loading map…
          </p>
        </div>
      </div>
    ),
  }
);

function uuidv4(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function SearchBarOverlay() {
  const { getMap } = useMapContext();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [sessionToken] = useState(() => uuidv4());

  const setSearchPreview = useMapStore((s) => s.setSearchPreview);

  const onFocus = useCallback(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }
    let active = true;
    setSearching(true);
    const handle = setTimeout(async () => {
      try {
        const r = await suggest(query, sessionToken);
        if (active) setResults(r);
      } finally {
        if (active) setSearching(false);
      }
    }, 300);
    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [query, sessionToken]);

  const handleSelect = useCallback(
    async (suggestion: SearchSuggestion) => {
      const retrieved = await retrieve(suggestion.mapbox_id, sessionToken);
      if (!retrieved) return;
      const map = getMap();
      if (map) {
        map.flyTo({
          center: [retrieved.center.lng, retrieved.center.lat],
          zoom: 14,
          duration: 800,
        });
      }
      const addr =
        suggestion.full_address ??
        suggestion.place_formatted ??
        suggestion.address ??
        "";
      const placeLabel = addr
        ? `${suggestion.name}${addr !== suggestion.name ? ` — ${addr}` : ""}`
        : suggestion.name;
      setSearchPreview({
        lat: retrieved.center.lat,
        lng: retrieved.center.lng,
        placeLabel,
      });
      setQuery("");
      setResults([]);
      setOpen(false);
    },
    [getMap, sessionToken, setSearchPreview]
  );

  return (
    <div className="relative">
      <SearchBar
        value={query}
        onChange={setQuery}
        onFocus={onFocus}
        placeholder="Search place to report event…"
      />
      {open && (results.length > 0 || searching) && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-2xl bg-white py-1 shadow-xl ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-700">
          {searching && (
            <div className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
              Searching…
            </div>
          )}
          {results.map((r) => (
            <button
              key={r.mapbox_id}
              type="button"
              onClick={() => handleSelect(r)}
              className="flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left hover:bg-zinc-50 active:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {r.name}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {r.full_address ?? r.place_formatted ?? r.address ?? ""}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ReportFAB() {
  const { getMap } = useMapContext();
  const searchPreview = useMapStore((s) => s.searchPreview);
  const setSearchPreview = useMapStore((s) => s.setSearchPreview);
  const openReportModal = useMapStore((s) => s.openReportModal);

  const handleReportClick = useCallback(() => {
    if (searchPreview) {
      openReportModal(
        searchPreview.lat,
        searchPreview.lng,
        searchPreview.placeLabel
      );
      setSearchPreview(null);
      return;
    }
    const map = getMap();
    if (map) {
      const c = map.getCenter();
      openReportModal(c.lat, c.lng);
    }
  }, [searchPreview, openReportModal, setSearchPreview, getMap]);

  return (
    <div className="pointer-events-auto absolute bottom-6 right-4 z-10">
      <FloatingButton
        onClick={handleReportClick}
        aria-label="Report event"
        highlight={!!searchPreview}
        icon={
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        }
      />
    </div>
  );
}

export default function MapPage() {
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

  if (!mapboxToken) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
          Flow Ride
        </h1>
        <p className="max-w-sm text-center text-sm text-zinc-600 dark:text-zinc-400">
          Add{" "}
          <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-700">
            NEXT_PUBLIC_MAPBOX_TOKEN
          </code>{" "}
          to{" "}
          <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-700">
            .env.local
          </code>{" "}
          to load the map.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <MapViewDynamic
        mapboxToken={mapboxToken}
        setLoading={setMapLoading}
        setError={setMapError}
      >
        {/* Top: search bar */}
        <div className="pointer-events-auto absolute left-4 right-4 top-4 z-10 sm:left-6 sm:right-auto sm:max-w-md">
          <SearchBarOverlay />
        </div>

        {/* Right: locate + zoom */}
        <div className="pointer-events-auto absolute right-4 top-24 z-10">
          <MapControls />
        </div>

        {/* Bottom-left: event type legend / filter */}
        <div className="pointer-events-auto absolute bottom-6 left-4 z-10 max-w-[calc(100vw-5.5rem)]">
          <EventTypeFilterLegend />
        </div>

        {/* Bottom-right: report */}
        <ReportFAB />
      </MapViewDynamic>

      {mapLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-100/80 dark:bg-zinc-900/80">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              Loading map…
            </p>
          </div>
        </div>
      )}
      {mapError && (
        <div className="absolute bottom-24 left-4 right-4 z-20 rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 sm:bottom-6">
          {mapError}
          <button
            type="button"
            onClick={() => setMapError(null)}
            className="ml-2 font-medium underline"
          >
            Dismiss
          </button>
        </div>
      )}
      <EventPopup />
      <ReportModal />
    </div>
  );
}
