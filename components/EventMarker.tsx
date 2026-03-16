"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { TrafficEvent } from "@/lib/types";
import { EVENT_TYPE_COLORS } from "@/lib/constants";

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
    el.className = "h-6 w-6 rounded-full border-2 border-white shadow-md transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer";
    el.style.backgroundColor = EVENT_TYPE_COLORS[event.type] ?? "#6b7280";
    el.setAttribute("aria-label", `${event.type} event`);
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
