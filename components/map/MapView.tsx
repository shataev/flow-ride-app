"use client";

import { useRef, useEffect, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapContext } from "./MapContext";
import { RouteLayer } from "./RouteLayer";
import { EventMarkers } from "./EventMarkers";
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
  const setSelectedEvent = useMapStore((s) => s.setSelectedEvent);
  const setBottomSheetContent = useMapStore((s) => s.setBottomSheetContent);
  const setBottomSheetSnap = useMapStore((s) => s.setBottomSheetSnap);
  const routeMode = useMapStore((s) => s.routeMode);
  const setRouteMode = useMapStore((s) => s.setRouteMode);
  const startPoint = useMapStore((s) => s.startPoint);
  const setStartPoint = useMapStore((s) => s.setStartPoint);
  const setEndPoint = useMapStore((s) => s.setEndPoint);
  const routeCoordinates = useMapStore((s) => s.routeCoordinates);

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
      const mode = useMapStore.getState().routeMode;
      if (mode === "start") {
        setStartPoint({ lat, lng });
        setRouteMode("end");
        return;
      }
      if (mode === "end") {
        setEndPoint({ lat, lng });
        setRouteMode("idle");
        return;
      }
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
    setStartPoint,
    setEndPoint,
    setRouteMode,
    loadEventsAtCenter,
    initMap,
    destroy,
  ]);

  const handleEventClick = useCallback(
    (event: import("@/lib/types").TrafficEvent) => {
      setSelectedEvent(event);
      setBottomSheetContent("event");
      setBottomSheetSnap("half");
    },
    [setSelectedEvent, setBottomSheetContent, setBottomSheetSnap]
  );

  return (
    <MapContext.Provider value={{ getMap }}>
      <div className="relative h-full w-full">
        <div ref={containerRef} className="absolute inset-0 h-full w-full" />
        <RouteLayer map={getMap()} coordinates={routeCoordinates} />
        <EventMarkers
          map={getMap()}
          events={events}
          onEventClick={handleEventClick}
        />
        <div className="pointer-events-none absolute inset-0">
          {children}
        </div>
      </div>
    </MapContext.Provider>
  );
}
