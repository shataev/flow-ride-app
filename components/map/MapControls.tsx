"use client";

import { useCallback, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useMapContext } from "./MapContext";
import { FloatingButton } from "@/components/ui/FloatingButton";
import {
  DANANG_BOUNDS,
  DANANG_CENTER,
  REGION_MAX_EVENTS_RADIUS_M,
} from "@/lib/constants";
import { useMapStore } from "@/lib/store";
import { useEvents } from "@/hooks/useEvents";

const showAllIcon = (
  <svg
    width={26}
    height={26}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-zinc-800 dark:text-zinc-100"
    aria-hidden
  >
    <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
  </svg>
);

export function MapControls() {
  const { getMap } = useMapContext();
  const [locating, setLocating] = useState(false);
  const [showRegionBusy, setShowRegionBusy] = useState(false);
  const showRegionBusyRef = useRef(false);
  const setUserLocation = useMapStore((s) => s.setUserLocation);
  const { loadEvents } = useEvents();

  const handleLocate = useCallback(() => {
    const map = getMap();
    if (!map) return;
    setLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          map.flyTo({
            center: [pos.coords.longitude, pos.coords.latitude],
            zoom: 15,
            duration: 800,
          });
          setLocating(false);
        },
        () => {
          setUserLocation(null);
          map.flyTo({ center: DANANG_CENTER, zoom: 12, duration: 600 });
          setLocating(false);
        }
      );
    } else {
      setUserLocation(null);
      map.flyTo({ center: DANANG_CENTER, zoom: 12, duration: 600 });
      setLocating(false);
    }
  }, [getMap, setUserLocation]);

  const handleZoomIn = useCallback(() => {
    const map = getMap();
    if (map) map.zoomIn({ duration: 200 });
  }, [getMap]);

  const handleZoomOut = useCallback(() => {
    const map = getMap();
    if (map) map.zoomOut({ duration: 200 });
  }, [getMap]);

  const handleShowAllInRegion = useCallback(async () => {
    const map = getMap();
    if (!map || showRegionBusyRef.current) return;
    showRegionBusyRef.current = true;
    setShowRegionBusy(true);
    try {
      const [lng, lat] = DANANG_CENTER;
      const list = await loadEvents(lat, lng, REGION_MAX_EVENTS_RADIUS_M);
      if (list.length === 0) {
        map.fitBounds(DANANG_BOUNDS, {
          padding: 56,
          duration: 900,
          maxZoom: 12,
        });
        return;
      }
      if (list.length === 1) {
        const e = list[0];
        map.flyTo({
          center: [e.lng, e.lat],
          zoom: 13,
          duration: 800,
        });
        return;
      }
      const bounds = new mapboxgl.LngLatBounds();
      for (const e of list) bounds.extend([e.lng, e.lat]);
      map.fitBounds(bounds, {
        padding: 72,
        duration: 900,
        maxZoom: 14,
      });
    } finally {
      showRegionBusyRef.current = false;
      setShowRegionBusy(false);
    }
  }, [getMap, loadEvents]);

  return (
    <div className="flex flex-col gap-2">
      <FloatingButton
        onClick={handleShowAllInRegion}
        aria-label="Show all events in the region"
        className={showRegionBusy ? "pointer-events-none opacity-70" : ""}
        icon={
          showRegionBusy ? (
            <div
              className="h-6 w-6 shrink-0 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-600 dark:border-zinc-600 dark:border-t-blue-400"
              aria-hidden
            />
          ) : (
            showAllIcon
          )
        }
      />
      <FloatingButton
        onClick={handleLocate}
        aria-label="Center on my location"
        icon={
          locating ? (
            <img
              src="/icons/png/location-1.png"
              alt=""
              aria-hidden
              width={32}
              height={32}
              style={{ imageRendering: "pixelated" }}
              className="h-8 w-8"
            />
          ) : (
            <img
              src="/icons/png/location.png"
              alt=""
              aria-hidden
              width={32}
              height={32}
              style={{ imageRendering: "pixelated" }}
              className="h-8 w-8"
            />
          )
        }
      />
      <div className="flex flex-col overflow-hidden rounded-none border-2 border-zinc-200/90 bg-white shadow-[4px_4px_0px_rgba(0,0,0,0.12)] dark:border-zinc-600/90 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_rgba(0,0,0,0.35)]">
        <button
          type="button"
          onClick={handleZoomIn}
          className="flex h-12 w-12 items-center justify-center hover:bg-zinc-100 active:translate-x-[1px] active:translate-y-[1px] dark:hover:bg-zinc-800"
          aria-label="Zoom in"
        >
          <img
            src="/icons/png/zoom-in.png"
            alt=""
            aria-hidden
            width={32}
            height={32}
            style={{ imageRendering: "pixelated" }}
            className="h-8 w-8"
          />
        </button>
        <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
        <button
          type="button"
          onClick={handleZoomOut}
          className="flex h-12 w-12 items-center justify-center hover:bg-zinc-100 active:translate-x-[1px] active:translate-y-[1px] dark:hover:bg-zinc-800"
          aria-label="Zoom out"
        >
          <img
            src="/icons/png/zoom-out.png"
            alt=""
            aria-hidden
            width={32}
            height={32}
            style={{ imageRendering: "pixelated" }}
            className="h-8 w-8"
          />
        </button>
      </div>
    </div>
  );
}
