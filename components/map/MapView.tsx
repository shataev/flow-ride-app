"use client";

import { useRef, useEffect, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapContext } from "./MapContext";
import { EventMarkers } from "./EventMarkers";
import { SearchPreviewMarker } from "./SearchPreviewMarker";
import { useMapStore } from "@/lib/store";
import { useEvents } from "@/hooks/useEvents";
import { useMap } from "@/hooks/useMap";

interface MapViewProps {
  mapboxToken: string;
  setLoading?: (v: boolean) => void;
  setError?: (err: string | null) => void;
  children?: React.ReactNode;
}

export function MapView({
  mapboxToken,
  setLoading,
  setError,
  children,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { initMap, getMap, getCenter, destroy } = useMap(containerRef);
  const { loadEvents } = useEvents();

  const events = useMapStore((s) => s.events);
  const setEvents = useMapStore((s) => s.setEvents);
  const openReportModal = useMapStore((s) => s.openReportModal);
  const setSearchPreview = useMapStore((s) => s.setSearchPreview);
  const searchPreview = useMapStore((s) => s.searchPreview);
  const setSelectedEvent = useMapStore((s) => s.setSelectedEvent);
  const setBottomSheetContent = useMapStore((s) => s.setBottomSheetContent);
  const setBottomSheetSnap = useMapStore((s) => s.setBottomSheetSnap);

  const loadEventsAtCenter = useCallback(async () => {
    const map = getMap();
    if (!map) return;
    const { lng, lat } = getCenter();
    setLoading?.(true);
    setError?.(null);
    try {
      await loadEvents(lat, lng);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError?.(e.message);
    } finally {
      setLoading?.(false);
    }
  }, [getMap, getCenter, loadEvents, setLoading, setError]);

  useEffect(() => {
    const map = initMap(mapboxToken);
    if (!map) return;

    const onLoad = () => loadEventsAtCenter();
    const onMoveEnd = () => loadEventsAtCenter();
    const onClick = (e: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      setSearchPreview(null);
      openReportModal(lat, lng);
    };

    map.on("load", onLoad);
    map.on("moveend", onMoveEnd);
    map.on("click", onClick);

    return () => {
      map.off("load", onLoad);
      map.off("moveend", onMoveEnd);
      map.off("click", onClick);
      destroy();
    };
  }, [
    mapboxToken,
    openReportModal,
    setSearchPreview,
    loadEventsAtCenter,
    initMap,
    destroy,
  ]);

  const handleEventClick = useCallback(
    (event: import("@/lib/types").TrafficEvent) => {
      setSearchPreview(null);
      setSelectedEvent(event);
      setBottomSheetContent("event");
      setBottomSheetSnap("half");
    },
    [
      setSearchPreview,
      setSelectedEvent,
      setBottomSheetContent,
      setBottomSheetSnap,
    ]
  );

  return (
    <MapContext.Provider value={{ getMap }}>
      <div className="relative h-full w-full">
        <div ref={containerRef} className="absolute inset-0 h-full w-full" />
        <EventMarkers
          map={getMap()}
          events={events}
          onEventClick={handleEventClick}
        />
        {searchPreview && (
          <SearchPreviewMarker
            map={getMap()}
            lat={searchPreview.lat}
            lng={searchPreview.lng}
          />
        )}
        <div className="pointer-events-none absolute inset-0">
          {children}
        </div>
      </div>
    </MapContext.Provider>
  );
}
