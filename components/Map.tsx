"use client";

import { useRef, useEffect, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { EventMarker } from "./EventMarker";
import { useMapStore } from "@/lib/store";
import { useEvents } from "@/hooks/useEvents";
import { useMap } from "@/hooks/useMap";
import { getViewportEventsRadiusM } from "@/lib/mapGeo";

interface MapProps {
  mapboxToken: string;
  onEventsLoad?: () => void;
  onEventsError?: (err: Error) => void;
  loading?: boolean;
  setLoading?: (v: boolean) => void;
  setError?: (err: string | null) => void;
}

export function Map({
  mapboxToken,
  onEventsLoad,
  onEventsError,
  loading = false,
  setLoading,
  setError,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { initMap, getMap, getCenter, destroy } = useMap(containerRef);
  const { loadEvents } = useEvents();

  const events = useMapStore((s) => s.events);
  const setEvents = useMapStore((s) => s.setEvents);
  const openReportModal = useMapStore((s) => s.openReportModal);
  const setSelectedEvent = useMapStore((s) => s.setSelectedEvent);

  const loadEventsAtCenter = useCallback(async () => {
    const map = getMap();
    if (!map) return;
    const { lng, lat } = getCenter();
    const radius = getViewportEventsRadiusM(map);
    setLoading?.(true);
    setError?.(null);
    try {
      await loadEvents(lat, lng, radius);
      onEventsLoad?.();
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      onEventsError?.(e);
      setError?.(e.message);
    } finally {
      setLoading?.(false);
    }
  }, [getMap, getCenter, loadEvents, onEventsLoad, onEventsError, setLoading, setError]);

  useEffect(() => {
    const map = initMap(mapboxToken);
    if (!map) return;

    const onLoad = () => loadEventsAtCenter();
    const onMoveEnd = () => loadEventsAtCenter();
    const onClick = (e: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
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
  }, [mapboxToken, openReportModal, loadEventsAtCenter, initMap, destroy]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {getMap() &&
        events.map((event) => (
          <EventMarker
            key={event.id}
            event={event}
            map={getMap()}
            onClick={(ev) => setSelectedEvent(ev)}
          />
        ))}
    </div>
  );
}
