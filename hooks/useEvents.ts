"use client";

import { useCallback } from "react";
import { fetchEvents } from "@/services/events";
import { useMapStore } from "@/lib/store";
import { EVENTS_RADIUS_M, CITY } from "@/lib/constants";

export function useEvents() {
  const setEvents = useMapStore((s) => s.setEvents);

  const loadEvents = useCallback(
    async (lat: number, lng: number, radius = EVENTS_RADIUS_M) => {
      const events = await fetchEvents(lat, lng, radius, CITY);
      setEvents(events);
      return events;
    },
    [setEvents]
  );

  return { loadEvents };
}
