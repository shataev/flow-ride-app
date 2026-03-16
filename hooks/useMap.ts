"use client";

import { useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { DANANG_CENTER, DEFAULT_ZOOM } from "@/lib/constants";

export function useMap(containerRef: React.RefObject<HTMLDivElement | null>) {
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const initMap = useCallback(
    (token: string) => {
      if (!containerRef.current || mapRef.current) return null;
      mapboxgl.accessToken = token;
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: DANANG_CENTER,
        zoom: DEFAULT_ZOOM,
      });
      mapRef.current = map;
      return map;
    },
    [containerRef]
  );

  const getMap = useCallback(() => mapRef.current, []);

  const getCenter = useCallback((): { lng: number; lat: number } => {
    const map = mapRef.current;
    if (!map) return { lng: DANANG_CENTER[0], lat: DANANG_CENTER[1] };
    const c = map.getCenter();
    return { lng: c.lng, lat: c.lat };
  }, []);

  const destroy = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  }, []);

  return { initMap, getMap, getCenter, destroy };
}
