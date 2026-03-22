"use client";

import { useRef, useEffect, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapContext } from "./MapContext";
import { EventMarkers } from "./EventMarkers";
import { SearchPreviewMarker } from "./SearchPreviewMarker";
import { MapClickPreviewMarker } from "./MapClickPreviewMarker";
import { UserLocationMarker } from "./UserLocationMarker";
import { useMapStore } from "@/lib/store";
import { useEvents } from "@/hooks/useEvents";
import { useMap } from "@/hooks/useMap";
import { MAP_CLICK_PREVIEW_MIN_ZOOM } from "@/lib/constants";

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
  const setSearchPreview = useMapStore((s) => s.setSearchPreview);
  const searchPreview = useMapStore((s) => s.searchPreview);
  const mapClickPreview = useMapStore((s) => s.mapClickPreview);
  const setMapClickPreview = useMapStore((s) => s.setMapClickPreview);
  const setSelectedEvent = useMapStore((s) => s.setSelectedEvent);
  const userLocation = useMapStore((s) => s.userLocation);

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
      const targetZoom = Math.min(
        18,
        Math.max(map.getZoom(), MAP_CLICK_PREVIEW_MIN_ZOOM)
      );
      map.flyTo({
        center: [lng, lat],
        zoom: targetZoom,
        duration: 600,
      });
      setMapClickPreview({ lat, lng });
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
    setSearchPreview,
    setMapClickPreview,
    loadEventsAtCenter,
    initMap,
    destroy,
  ]);

  const handleEventClick = useCallback(
    (event: import("@/lib/types").TrafficEvent) => {
      setSearchPreview(null);
      setMapClickPreview(null);
      setSelectedEvent(event);
    },
    [setSearchPreview, setMapClickPreview, setSelectedEvent]
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
        {userLocation && (
          <UserLocationMarker
            map={getMap()}
            lat={userLocation.lat}
            lng={userLocation.lng}
          />
        )}
        {searchPreview && (
          <SearchPreviewMarker
            map={getMap()}
            lat={searchPreview.lat}
            lng={searchPreview.lng}
          />
        )}
        {mapClickPreview && (
          <MapClickPreviewMarker
            map={getMap()}
            lat={mapClickPreview.lat}
            lng={mapClickPreview.lng}
          />
        )}
        <div className="pointer-events-none absolute inset-0">
          {children}
        </div>
      </div>
    </MapContext.Provider>
  );
}
