"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { MapView } from "@/components/map/MapView";
import { MapControls } from "@/components/map/MapControls";
import { useMapContext } from "@/components/map/MapContext";
import { SearchBar } from "@/components/ui/SearchBar";
import { EventPopup } from "@/components/EventPopup";
import { ReportModal } from "@/components/ReportModal";
import {
  suggest,
  retrieve,
  type SearchSuggestion,
} from "@/services/geocoding";
import { useMapStore } from "@/lib/store";
import {
  EVENT_TYPE_ICON_PATHS,
  EVENT_TYPE_ICON_RENDER_SIZE,
} from "@/lib/eventTypeIcons";

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
  const setMapClickPreview = useMapStore((s) => s.setMapClickPreview);

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
      setMapClickPreview(null);
      setSearchPreview({
        lat: retrieved.center.lat,
        lng: retrieved.center.lng,
        placeLabel,
      });
      setQuery("");
      setResults([]);
      setOpen(false);
    },
    [getMap, sessionToken, setSearchPreview, setMapClickPreview]
  );

  return (
    <div className="relative">
      <SearchBar
        value={query}
        onChange={setQuery}
        onFocus={onFocus}
        placeholder="Search for a place…"
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

function PreviewReportActions() {
  const searchPreview = useMapStore((s) => s.searchPreview);
  const mapClickPreview = useMapStore((s) => s.mapClickPreview);
  const setSearchPreview = useMapStore((s) => s.setSearchPreview);
  const setMapClickPreview = useMapStore((s) => s.setMapClickPreview);
  const openReportModal = useMapStore((s) => s.openReportModal);

  const handleConfirm = useCallback(() => {
    if (searchPreview) {
      openReportModal(
        searchPreview.lat,
        searchPreview.lng,
        searchPreview.placeLabel
      );
      setSearchPreview(null);
      return;
    }
    if (mapClickPreview) {
      openReportModal(mapClickPreview.lat, mapClickPreview.lng);
      setMapClickPreview(null);
    }
  }, [
    searchPreview,
    mapClickPreview,
    openReportModal,
    setSearchPreview,
    setMapClickPreview,
  ]);

  const handleCancel = useCallback(() => {
    setSearchPreview(null);
    setMapClickPreview(null);
  }, [setSearchPreview, setMapClickPreview]);

  const policeIconPx = Math.round(EVENT_TYPE_ICON_RENDER_SIZE * 0.65);

  if (!searchPreview && !mapClickPreview) {
    return null;
  }

  return (
    <div className="pointer-events-auto absolute bottom-6 left-0 right-0 z-10 flex justify-center px-4">
      <div className="flex w-full max-w-md flex-col gap-2 sm:max-w-xl sm:flex-row sm:gap-3">
        <button
          type="button"
          onClick={handleConfirm}
          aria-label="Add police at this location"
          className={
            "inline-flex h-12 w-full shrink-0 items-center justify-center gap-1.5 rounded-[2px] border-2 border-zinc-200/90 bg-white px-3 text-sm font-semibold text-zinc-900 shadow-[4px_4px_0px_rgba(0,0,0,0.12)] transition-transform active:scale-[0.98] hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-zinc-600/90 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus:ring-offset-zinc-900 " +
            "ring-4 ring-blue-500 ring-offset-2 ring-offset-white animate-pulse dark:ring-offset-zinc-900 sm:flex-1"
          }
        >
          <span className="whitespace-nowrap">Add police</span>
          <img
            src={EVENT_TYPE_ICON_PATHS.police}
            alt=""
            aria-hidden
            width={policeIconPx}
            height={policeIconPx}
            style={{ imageRendering: "pixelated" }}
            className="shrink-0"
          />
          <span className="whitespace-nowrap">here</span>
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="h-12 w-full shrink-0 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 shadow-sm transition-transform active:scale-[0.98] hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:focus:ring-offset-zinc-900 sm:flex-1"
        >
          Cancel
        </button>
      </div>
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

        {/* After map tap or search pick — Add police here / Cancel */}
        <PreviewReportActions />
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
