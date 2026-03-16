"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { MapControls } from "@/components/MapControls";
import { ReportModal } from "@/components/ReportModal";
import { EventPopup } from "@/components/EventPopup";
import { fetchRoute } from "@/services/route";
import { fetchEvents } from "@/services/events";
import { useMapStore } from "@/lib/store";
import { EVENTS_RADIUS_M, CITY } from "@/lib/constants";

const Map = dynamic(() => import("@/components/Map").then((m) => ({ default: m.Map })), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-900">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Loading map…</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const startPoint = useMapStore((s) => s.startPoint);
  const endPoint = useMapStore((s) => s.endPoint);
  const setRouteCoordinates = useMapStore((s) => s.setRouteCoordinates);
  const setEvents = useMapStore((s) => s.setEvents);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

  const handleBuildRoute = useCallback(async () => {
    if (!startPoint || !endPoint) return;
    setRouteLoading(true);
    try {
      const res = await fetchRoute(startPoint, endPoint);
      setRouteCoordinates(res.coordinates ?? []);
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
  }, [startPoint, endPoint, setRouteCoordinates, setEvents]);

  if (!mapboxToken) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
          Flow Ride
        </h1>
        <p className="max-w-sm text-center text-sm text-zinc-600 dark:text-zinc-400">
          Add <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-700">NEXT_PUBLIC_MAPBOX_TOKEN</code> to{" "}
          <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-700">.env.local</code> to load the map.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <Map
        mapboxToken={mapboxToken}
        loading={mapLoading}
        setLoading={setMapLoading}
        setError={setMapError}
      />
      {mapLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-100/80 dark:bg-zinc-900/80">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Loading map…</p>
          </div>
        </div>
      )}
      {mapError && (
        <div className="absolute bottom-20 left-4 right-4 z-20 rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
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
      <MapControls onBuildRoute={handleBuildRoute} routeLoading={routeLoading} />
      <ReportModal />
      <EventPopup />
    </div>
  );
}
