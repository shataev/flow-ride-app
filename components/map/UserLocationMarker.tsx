"use client";

import { useEffect } from "react";
import mapboxglNs, { type Map as MapboxMap } from "mapbox-gl";

interface UserLocationMarkerProps {
  map: MapboxMap | null;
  lat: number;
  lng: number;
}

/** Marker for the user's last known location. */
export function UserLocationMarker({
  map,
  lat,
  lng,
}: UserLocationMarkerProps) {
  useEffect(() => {
    if (!map) return;

    const wrap = document.createElement("div");
    wrap.style.cssText =
      "pointer-events:none;display:flex;width:44px;height:44px;align-items:flex-end;justify-content:center;padding-bottom:2px;";

    const ping = document.createElement("span");
    ping.style.cssText =
      "position:absolute;inset:0;border-radius:9999px;background:#60a5fa;opacity:0.75;animation:userLocationPing 1.2s cubic-bezier(0,0,0.2,1) infinite;";

    const dot = document.createElement("span");
    dot.style.cssText =
      "position:relative;width:18px;height:18px;border-radius:9999px;background:#2563eb;border:2px solid #fff;box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.15),0 0 0 3px rgb(96 165 250 / 0.5);";

    const inner = document.createElement("span");
    inner.style.cssText =
      "position:relative;display:inline-flex;width:18px;height:18px;align-items:center;justify-content:center;";
    inner.appendChild(ping);
    inner.appendChild(dot);
    wrap.appendChild(inner);

    if (!document.getElementById("user-location-ping-keyframes")) {
      const style = document.createElement("style");
      style.id = "user-location-ping-keyframes";
      style.textContent = `@keyframes userLocationPing{0%{transform:scale(1);opacity:0.75}75%,100%{transform:scale(2.2);opacity:0}}`;
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

