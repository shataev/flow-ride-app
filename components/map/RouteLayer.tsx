"use client";

import { useEffect, useRef } from "react";
import type mapboxgl from "mapbox-gl";

const ROUTE_LAYER_ID = "route-layer";
const ROUTE_SOURCE_ID = "route-source";

interface RouteLayerProps {
  map: mapboxgl.Map | null;
  coordinates: [number, number][] | null;
}

export function RouteLayer({ map, coordinates }: RouteLayerProps) {
  const addedRef = useRef(false);

  useEffect(() => {
    if (!map || !coordinates || coordinates.length < 2) {
      if (map && addedRef.current) {
        if (map.getLayer(ROUTE_LAYER_ID)) map.removeLayer(ROUTE_LAYER_ID);
        if (map.getSource(ROUTE_SOURCE_ID)) map.removeSource(ROUTE_SOURCE_ID);
        addedRef.current = false;
      }
      return;
    }

    const geojson = {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates,
      },
    };

    if (map.getSource(ROUTE_SOURCE_ID)) {
      (map.getSource(ROUTE_SOURCE_ID) as mapboxgl.GeoJSONSource).setData(
        geojson
      );
    } else {
      map.addSource(ROUTE_SOURCE_ID, {
        type: "geojson",
        data: geojson,
      });
      map.addLayer({
        id: ROUTE_LAYER_ID,
        type: "line",
        source: ROUTE_SOURCE_ID,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#2563eb",
          "line-width": 5,
        },
      });
      addedRef.current = true;
    }

    return () => {
      if (map.getLayer(ROUTE_LAYER_ID)) map.removeLayer(ROUTE_LAYER_ID);
      if (map.getSource(ROUTE_SOURCE_ID)) map.removeSource(ROUTE_SOURCE_ID);
      addedRef.current = false;
    };
  }, [map, coordinates]);

  return null;
}
