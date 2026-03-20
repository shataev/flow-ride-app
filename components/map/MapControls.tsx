"use client";

import { useCallback, useState } from "react";
import { useMapContext } from "./MapContext";
import { FloatingButton } from "@/components/ui/FloatingButton";
import { DANANG_CENTER } from "@/lib/constants";
import { useMapStore } from "@/lib/store";

export function MapControls() {
  const { getMap } = useMapContext();
  const [locating, setLocating] = useState(false);
  const setUserLocation = useMapStore((s) => s.setUserLocation);

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

  return (
    <div className="flex flex-col gap-2">
      <FloatingButton
        onClick={handleLocate}
        aria-label="Center on my location"
        icon={
          locating ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
          ) : (
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
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          )
        }
      />
      <div className="flex flex-col overflow-hidden rounded-full bg-white shadow-lg dark:bg-zinc-900">
        <button
          type="button"
          onClick={handleZoomIn}
          className="flex h-12 w-12 items-center justify-center text-zinc-700 hover:bg-zinc-100 active:scale-95 dark:text-zinc-200 dark:hover:bg-zinc-800"
          aria-label="Zoom in"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </button>
        <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
        <button
          type="button"
          onClick={handleZoomOut}
          className="flex h-12 w-12 items-center justify-center text-zinc-700 hover:bg-zinc-100 active:scale-95 dark:text-zinc-200 dark:hover:bg-zinc-800"
          aria-label="Zoom out"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13H5v-2h14v2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
