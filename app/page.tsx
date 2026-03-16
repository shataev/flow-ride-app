"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { MapView } from "@/components/map/MapView";
import { MapControls } from "@/components/map/MapControls";
import { useMapContext } from "@/components/map/MapContext";
import { SearchBar } from "@/components/ui/SearchBar";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { FloatingButton } from "@/components/ui/FloatingButton";
import { EventCard } from "@/components/ui/EventCard";
import { ReportModal } from "@/components/ReportModal";
import { fetchRoute } from "@/services/route";
import { fetchEvents } from "@/services/events";
import {
  suggest,
  retrieve,
  type SearchSuggestion,
} from "@/services/geocoding";
import { useMapStore } from "@/lib/store";
import { EVENTS_RADIUS_M, CITY } from "@/lib/constants";

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

function formatDistance(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${Math.round(m)} m`;
}

function formatDuration(s: number): string {
  const min = Math.round(s / 60);
  if (min >= 60) return `${Math.floor(min / 60)} h ${min % 60} min`;
  return `${min} min`;
}

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

  const setStartPoint = useMapStore((s) => s.setStartPoint);
  const setEndPoint = useMapStore((s) => s.setEndPoint);
  const setRouteMode = useMapStore((s) => s.setRouteMode);
  const setBottomSheetContent = useMapStore((s) => s.setBottomSheetContent);
  const setBottomSheetSnap = useMapStore((s) => s.setBottomSheetSnap);

  const onFocus = useCallback(() => {
    const map = getMap();
    if (map) {
      const c = map.getCenter();
      setStartPoint({ lat: c.lat, lng: c.lng });
    }
    setRouteMode("end");
    setOpen(true);
    setBottomSheetContent("search");
    setBottomSheetSnap("half");
  }, [
    getMap,
    setStartPoint,
    setRouteMode,
    setBottomSheetContent,
    setBottomSheetSnap,
  ]);

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
      setEndPoint({
        lat: retrieved.center.lat,
        lng: retrieved.center.lng,
      });
      setRouteMode("idle");
      setBottomSheetContent("search");
      setBottomSheetSnap("half");
      setOpen(false);
    },
    [getMap, sessionToken, setEndPoint, setRouteMode, setBottomSheetContent, setBottomSheetSnap]
  );

  return (
    <div className="relative">
      <SearchBar
        value={query}
        onChange={setQuery}
        onFocus={onFocus}
        placeholder="Where to?"
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

function SearchRoutePanel({
  routeMode,
  endPoint,
  onChangeStart,
}: {
  routeMode: "idle" | "start" | "end";
  endPoint: { lat: number; lng: number } | null;
  onChangeStart: () => void;
}) {
  return (
    <div className="space-y-3 py-2">
      {routeMode === "start" ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Tap on the map to set start point.
        </p>
      ) : (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Tap on the map to set your destination.
          </p>
          <button
            type="button"
            onClick={onChangeStart}
            className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Change start point
          </button>
        </>
      )}
      {endPoint && routeMode === "idle" && (
        <p className="text-xs text-zinc-500">Destination set. Building route…</p>
      )}
    </div>
  );
}

function RoutePanel() {
  const { getMap } = useMapContext();
  const routeDistance = useMapStore((s) => s.routeDistance);
  const routeDuration = useMapStore((s) => s.routeDuration);
  const openReportModal = useMapStore((s) => s.openReportModal);
  const resetRoute = useMapStore((s) => s.resetRoute);
  const setBottomSheetContent = useMapStore((s) => s.setBottomSheetContent);
  const setBottomSheetSnap = useMapStore((s) => s.setBottomSheetSnap);

  const handleReportOnRoute = useCallback(() => {
    const map = getMap();
    if (map) {
      const c = map.getCenter();
      openReportModal(c.lat, c.lng);
    }
    setBottomSheetSnap("collapsed");
  }, [getMap, openReportModal, setBottomSheetSnap]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Route
      </h3>
      <div className="flex gap-4 rounded-xl bg-zinc-100 p-4 dark:bg-zinc-800/50">
        {routeDistance != null && (
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Distance</p>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {formatDistance(routeDistance)}
            </p>
          </div>
        )}
        {routeDuration != null && (
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Duration</p>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {formatDuration(routeDuration)}
            </p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          className="w-full rounded-xl bg-blue-600 py-3.5 text-base font-medium text-white hover:bg-blue-700 active:scale-[0.98]"
        >
          Start navigation
        </button>
        <button
          type="button"
          onClick={handleReportOnRoute}
          className="w-full rounded-xl border border-zinc-300 py-3.5 text-base font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Report event on route
        </button>
        <button
          type="button"
          onClick={() => {
            resetRoute();
            setBottomSheetContent(null);
            setBottomSheetSnap("collapsed");
          }}
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400"
        >
          Clear route
        </button>
      </div>
    </div>
  );
}

export default function MapPage() {
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const startPoint = useMapStore((s) => s.startPoint);
  const endPoint = useMapStore((s) => s.endPoint);
  const routeCoordinates = useMapStore((s) => s.routeCoordinates);
  const routeDistance = useMapStore((s) => s.routeDistance);
  const routeDuration = useMapStore((s) => s.routeDuration);
  const setRouteCoordinates = useMapStore((s) => s.setRouteCoordinates);
  const setRouteDetails = useMapStore((s) => s.setRouteDetails);
  const setEvents = useMapStore((s) => s.setEvents);
  const setRouteMode = useMapStore((s) => s.setRouteMode);
  const setBottomSheetContent = useMapStore((s) => s.setBottomSheetContent);
  const bottomSheetSnap = useMapStore((s) => s.bottomSheetSnap);
  const bottomSheetContent = useMapStore((s) => s.bottomSheetContent);
  const selectedEvent = useMapStore((s) => s.selectedEvent);
  const setSelectedEvent = useMapStore((s) => s.setSelectedEvent);
  const openReportModal = useMapStore((s) => s.openReportModal);
  const resetRoute = useMapStore((s) => s.resetRoute);
  const setBottomSheetSnap = useMapStore((s) => s.setBottomSheetSnap);
  const routeMode = useMapStore((s) => s.routeMode);
  const setEndPoint = useMapStore((s) => s.setEndPoint);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

  const handleBuildRoute = useCallback(async () => {
    if (!startPoint || !endPoint) return;
    setRouteLoading(true);
    setMapError(null);
    try {
      const res = await fetchRoute(startPoint, endPoint);
      setRouteCoordinates(res.coordinates ?? []);
      setRouteDetails(
        res.distance ?? null,
        res.duration ?? null
      );
      setBottomSheetContent("route");
      setBottomSheetSnap("half");
      if (res.coordinates?.length) {
        const mid = res.coordinates[Math.floor(res.coordinates.length / 2)];
        const events = await fetchEvents(mid[1], mid[0], EVENTS_RADIUS_M, CITY);
        setEvents(events);
      }
    } catch {
      setMapError("Could not load route. Check backend.");
    } finally {
      setRouteLoading(false);
    }
  }, [
    startPoint,
    endPoint,
    setRouteCoordinates,
    setRouteDetails,
    setEvents,
    setBottomSheetContent,
    setBottomSheetSnap,
  ]);

  useEffect(() => {
    if (
      startPoint &&
      endPoint &&
      routeCoordinates === null &&
      !routeLoading
    ) {
      handleBuildRoute();
    }
  }, [startPoint, endPoint, routeCoordinates, routeLoading, handleBuildRoute]);

  const handleReportClick = useCallback(() => {
    setBottomSheetContent("report-hint");
    setBottomSheetSnap("half");
  }, [setBottomSheetContent, setBottomSheetSnap]);

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

  const bottomSheetChildren =
    bottomSheetContent === "event" && selectedEvent ? (
      <EventCard
        event={selectedEvent}
        onClose={() => {
          setSelectedEvent(null);
          setBottomSheetContent(null);
          setBottomSheetSnap("collapsed");
        }}
        onReportOnRoute={() => {
          openReportModal(selectedEvent.lat, selectedEvent.lng);
          setBottomSheetSnap("collapsed");
        }}
      />
    ) : bottomSheetContent === "route" && routeCoordinates?.length ? (
      <RoutePanel />
    ) : bottomSheetContent === "search" ? (
      <SearchRoutePanel
        routeMode={routeMode}
        endPoint={endPoint}
        onChangeStart={() => {
          setRouteMode("start");
          setEndPoint(null);
          setRouteCoordinates(null);
          setRouteDetails(null, null);
        }}
      />
    ) : bottomSheetContent === "report-hint" ? (
      <div className="space-y-3 py-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Report events
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Tap anywhere on the map to add a traffic event and help other riders.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex flex-1 items-center justify-center rounded-full bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
            Tap map → choose type → send
          </span>
        </div>
      </div>
    ) : null;

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

        {/* Bottom-right: report */}
        <div className="pointer-events-auto absolute bottom-24 right-4 z-10 sm:bottom-28">
          <FloatingButton
            onClick={handleReportClick}
            aria-label="Report event"
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

        {/* Bottom: sheet */}
        <BottomSheet
          snap={bottomSheetSnap}
          onSnapChange={setBottomSheetSnap}
          className="pointer-events-auto pb-safe"
        >
          {bottomSheetChildren}
        </BottomSheet>
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
        <div className="absolute bottom-24 left-4 right-4 z-20 rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
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
      <ReportModal />
    </div>
  );
}