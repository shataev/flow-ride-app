const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;
const DIRECTIONS_BASE = "https://api.mapbox.com/directions/v5/mapbox/driving";

export interface RouteResult {
  distance: number;
  duration: number;
  geometry: [number, number][];
}

export async function getRoute(
  from: [number, number],
  to: [number, number]
): Promise<RouteResult> {
  if (!MAPBOX_TOKEN) {
    throw new Error("MAPBOX_TOKEN is not configured");
  }
  const coords = `${from[0]},${from[1]};${to[0]},${to[1]}`;
  const url = new URL(`${DIRECTIONS_BASE}/${coords}`);
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("overview", "full");
  url.searchParams.set("access_token", MAPBOX_TOKEN);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Mapbox Directions error: ${res.status}`);
  }

  const data = (await res.json()) as {
    routes?: Array<{
      distance: number;
      duration: number;
      geometry?: { type: string; coordinates: [number, number][] };
    }>;
    code?: string;
    message?: string;
  };

  if (data.code && data.code !== "Ok") {
    throw new Error(data.message ?? "No route found");
  }

  const route = data.routes?.[0];
  if (!route) {
    throw new Error("No route found");
  }

  const coordinates =
    route.geometry?.type === "LineString" ? route.geometry.coordinates : [];

  return {
    distance: route.distance,
    duration: route.duration,
    geometry: coordinates,
  };
}
