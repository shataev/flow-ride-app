import type { Map } from "mapbox-gl";
import { EVENTS_RADIUS_M } from "@/lib/constants";

/** Earth radius in meters (mean). */
const R_EARTH_M = 6_371_000;

function haversineDistanceM(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return 2 * R_EARTH_M * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * Radius for /api/events $near so the circle covers the visible map (center → NE corner),
 * clamped to API limits. Keeps event list in sync after fitBounds / zoom changes.
 */
export function getViewportEventsRadiusM(map: Map): number {
  const bounds = map.getBounds();
  if (!bounds) return EVENTS_RADIUS_M;
  const center = map.getCenter();
  const ne = bounds.getNorthEast();
  const dist = haversineDistanceM(center.lat, center.lng, ne.lat, ne.lng);
  const padded = Math.ceil(dist * 1.25);
  return Math.min(50_000, Math.max(500, padded));
}
