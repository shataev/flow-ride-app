"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { TrafficEvent, EventType } from "@/lib/types";
import { EVENT_TYPE_COLORS } from "@/lib/constants";

const EVENT_ICONS: Record<
  EventType,
  string
> = {
  checkpoint:
    "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z",
  accident:
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  hazard:
    "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  roadblock:
    "M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-6 14H6l6-6 6 6h-6z",
};

interface EventMarkerProps {
  event: TrafficEvent;
  map: mapboxgl.Map | null;
  onClick?: (event: TrafficEvent) => void;
}

export function EventMarker({ event, map, onClick }: EventMarkerProps) {
  const mapboxMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;

  useEffect(() => {
    if (!map) return;
    const el = document.createElement("button");
    el.type = "button";
    el.className =
      "flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-md transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer";
    el.style.backgroundColor = EVENT_TYPE_COLORS[event.type] ?? "#6b7280";
    el.setAttribute("aria-label", `${event.type} event`);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "white");
    path.setAttribute("d", EVENT_ICONS[event.type] ?? EVENT_ICONS.hazard);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "14");
    svg.setAttribute("height", "14");
    svg.appendChild(path);
    el.appendChild(svg);
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      onClickRef.current?.(event);
    });

    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat([event.lng, event.lat])
      .addTo(map);

    mapboxMarkerRef.current = marker;
    return () => {
      marker.remove();
      mapboxMarkerRef.current = null;
    };
  }, [map, event]);

  return null;
}
