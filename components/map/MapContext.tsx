"use client";

import { createContext, useContext } from "react";
import type mapboxgl from "mapbox-gl";

interface MapContextValue {
  getMap: () => mapboxgl.Map | null;
}

const MapContext = createContext<MapContextValue | null>(null);

export function useMapContext(): MapContextValue {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error("useMapContext must be used within MapView");
  return ctx;
}

export { MapContext };
