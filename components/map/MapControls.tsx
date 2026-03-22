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
