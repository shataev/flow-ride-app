"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { TrafficEvent } from "@/lib/types";
import { EVENT_TYPE_COLORS } from "@/lib/constants";
import {
  EVENT_TYPE_ICON_PATHS,
  EVENT_TYPE_ICON_RENDER_SIZE,
} from "@/lib/eventTypeIcons";

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
      "flex h-12 w-12 items-center justify-center rounded-[2px] border-2 border-zinc-900/70 bg-transparent shadow-[4px_4px_0px_rgba(0,0,0,0.25)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer p-0";
    const color = EVENT_TYPE_COLORS[event.type] ?? "#6b7280";
    el.style.borderColor = color;
    el.setAttribute("aria-label", "Police on the road");

    const img = document.createElement("img");
    img.src = EVENT_TYPE_ICON_PATHS[event.type];
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    img.width = EVENT_TYPE_ICON_RENDER_SIZE;
    img.height = EVENT_TYPE_ICON_RENDER_SIZE;
    img.style.imageRendering = "pixelated";
    img.style.width = `${Math.round(EVENT_TYPE_ICON_RENDER_SIZE)}px`;
    img.style.height = `${Math.round(EVENT_TYPE_ICON_RENDER_SIZE)}px`;
    el.appendChild(img);
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
