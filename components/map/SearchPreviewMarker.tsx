"use client";

import { useEffect } from "react";
import mapboxglNs, { type Map as MapboxMap } from "mapbox-gl";

interface SearchPreviewMarkerProps {
  map: MapboxMap | null;
  lat: number;
  lng: number;
}

/** Temporary pin after choosing a search result (before Report is confirmed). */
export function SearchPreviewMarker({
  map,
  lat,
  lng,
}: SearchPreviewMarkerProps) {
  useEffect(() => {
    if (!map) return;
    const wrap = document.createElement("div");
    wrap.style.cssText =
      "pointer-events:none;display:flex;width:40px;height:40px;align-items:flex-end;justify-content:center;padding-bottom:2px;";

    const ping = document.createElement("span");
    ping.style.cssText =
      "position:absolute;inset:0;border-radius:4px;background:#60a5fa;opacity:0.75;animation:searchPreviewPing 1.2s cubic-bezier(0,0,0.2,1) infinite;";
    const dot = document.createElement("span");
    dot.style.cssText =
      "position:relative;width:16px;height:16px;border-radius:2px;background:#2563eb;border:2px solid #fff;box-shadow:4px 4px 0 rgb(0 0 0 / 0.12);";

    const inner = document.createElement("span");
    inner.style.cssText =
      "position:relative;display:inline-flex;width:16px;height:16px;align-items:center;justify-content:center;";
    inner.appendChild(ping);
    inner.appendChild(dot);
    wrap.appendChild(inner);

    if (!document.getElementById("search-preview-ping-keyframes")) {
      const style = document.createElement("style");
      style.id = "search-preview-ping-keyframes";
      style.textContent = `@keyframes searchPreviewPing{0%{transform:scale(1);opacity:0.75}75%,100%{transform:scale(2.2);opacity:0}}`;
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
