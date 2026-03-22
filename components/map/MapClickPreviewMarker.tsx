"use client";

import { useEffect } from "react";
import mapboxglNs, { type Map as MapboxMap } from "mapbox-gl";

interface MapClickPreviewMarkerProps {
  map: MapboxMap | null;
  lat: number;
  lng: number;
}

/** Map pin after clicking the map (confirm action is in the bottom-right FAB). */
export function MapClickPreviewMarker({
  map,
  lat,
  lng,
}: MapClickPreviewMarkerProps) {
  useEffect(() => {
    if (!map) return;

    const wrap = document.createElement("div");
    wrap.style.cssText =
      "pointer-events:auto;display:flex;align-items:flex-end;justify-content:center;width:40px;height:40px;padding-bottom:2px;";
    wrap.addEventListener("click", (e) => e.stopPropagation());

    const ping = document.createElement("span");
    ping.style.cssText =
      "position:absolute;inset:0;border-radius:4px;background:#60a5fa;opacity:0.75;animation:mapClickPreviewPing 1.2s cubic-bezier(0,0,0.2,1) infinite;";
    const dot = document.createElement("span");
    dot.style.cssText =
      "position:relative;width:16px;height:16px;border-radius:2px;background:#2563eb;border:2px solid #fff;box-shadow:4px 4px 0 rgb(0 0 0 / 0.12);";

    const inner = document.createElement("span");
    inner.style.cssText =
      "position:relative;display:inline-flex;width:16px;height:16px;align-items:center;justify-content:center;";
    inner.appendChild(ping);
    inner.appendChild(dot);
    wrap.appendChild(inner);

    if (!document.getElementById("map-click-preview-ping-keyframes")) {
      const style = document.createElement("style");
      style.id = "map-click-preview-ping-keyframes";
      style.textContent = `@keyframes mapClickPreviewPing{0%{transform:scale(1);opacity:0.75}75%,100%{transform:scale(2.2);opacity:0}}`;
      document.head.appendChild(style);
    }

    const marker = new mapboxglNs.Marker({ element: wrap, anchor: "bottom" })
      .setLngLat([lng, lat])
      .addTo(map);
    return () => {
      marker.remove();
    };
  }, [map, lat, lng]);

  return null;
}
