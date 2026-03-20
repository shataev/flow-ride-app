"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { TrafficEvent } from "@/lib/types";
import { EVENT_TYPE_COLORS } from "@/lib/constants";
import { EVENT_TYPE_ICON_PATHS } from "@/lib/eventTypeIcons";

interface EventMarkerProps {
  event: TrafficEvent;
  map: mapboxgl.Map | null;
  onClick?: (event: TrafficEvent) => void;
}

export function EventMarker({ event, map, onClick }: EventMarkerProps) {
  const mapboxMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const onClickRef = useRef(onClick);

  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

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
    path.setAttribute(
      "d",
      EVENT_TYPE_ICON_PATHS[event.type] ?? EVENT_TYPE_ICON_PATHS.hazard
    );
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
