"use client";

import type mapboxgl from "mapbox-gl";
import type { TrafficEvent } from "@/lib/types";
import { EventMarker } from "@/components/EventMarker";

interface EventMarkersProps {
  map: mapboxgl.Map | null;
  events: TrafficEvent[];
  onEventClick: (event: TrafficEvent) => void;
}

export function EventMarkers({
  map,
  events,
  onEventClick,
}: EventMarkersProps) {
  return (
    <>
      {map &&
        events.map((event) => (
          <EventMarker
            key={event.id}
            event={event}
            map={map}
            onClick={onEventClick}
          />
        ))}
    </>
  );
}
