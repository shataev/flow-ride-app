"use client";

import { DANANG_CENTER } from "@/lib/constants";

/** Suggestion from Search Box API /suggest (no coordinates until /retrieve). */
export interface SearchSuggestion {
  mapbox_id: string;
  name: string;
  address?: string;
  full_address?: string;
  place_formatted?: string;
}

/** Result after /retrieve: suggestion + coordinates for map. */
export interface GeocodingFeature {
  id: string;
  name: string;
  address?: string;
  center: { lng: number; lat: number };
}

function getToken(): string {
  return (
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN ??
    (typeof process !== "undefined" && process.env?.MAPBOX_TOKEN) ??
    ""
  );
}

/**
 * Search Box API suggest: autocomplete suggestions (no coordinates).
 * Use same sessionToken for the whole search session; call retrieve() when user selects.
 * @see https://docs.mapbox.com/api/search/search-box/#get-suggested-results
 */
export async function suggest(
  query: string,
  sessionToken: string
): Promise<SearchSuggestion[]> {
  const token = getToken();
  if (!token || query.trim().length < 2) return [];

  const url = new URL(
    "https://api.mapbox.com/search/searchbox/v1/suggest"
  );
  url.searchParams.set("q", query.trim());
  url.searchParams.set("access_token", token);
  url.searchParams.set("session_token", sessionToken);
  url.searchParams.set("language", "en");
  url.searchParams.set("limit", "5");
  url.searchParams.set("types", "address,place,poi");
  url.searchParams.set("country", "vn");
  url.searchParams.set(
    "proximity",
    `${DANANG_CENTER[0]},${DANANG_CENTER[1]}`
  );

  const res = await fetch(url.toString());
  if (!res.ok) return [];

  const data = (await res.json()) as { suggestions?: unknown[] };
  const list = data.suggestions ?? [];
  if (!Array.isArray(list)) return [];

  return list.map((s: Record<string, unknown>) => ({
    mapbox_id: String(s.mapbox_id ?? ""),
    name: String(s.name ?? ""),
    address: s.address != null ? String(s.address) : undefined,
    full_address:
      s.full_address != null ? String(s.full_address) : undefined,
    place_formatted:
      s.place_formatted != null ? String(s.place_formatted) : undefined,
  }));
}

/**
 * Search Box API retrieve: get coordinates for a suggestion by mapbox_id.
 * @see https://docs.mapbox.com/api/search/search-box/#retrieve-a-suggested-feature
 */
export async function retrieve(
  mapboxId: string,
  sessionToken: string
): Promise<GeocodingFeature | null> {
  const token = getToken();
  if (!token || !mapboxId) return null;

  const idEnc = encodeURIComponent(mapboxId);
  const url = new URL(
    `https://api.mapbox.com/search/searchbox/v1/retrieve/${idEnc}`
  );
  url.searchParams.set("access_token", token);
  url.searchParams.set("session_token", sessionToken);
  url.searchParams.set("language", "en");

  const res = await fetch(url.toString());
  if (!res.ok) return null;

  const data = (await res.json()) as {
    features?: Array<{
      geometry?: { coordinates?: [number, number] };
      properties?: {
        name?: string;
        full_address?: string;
        place_formatted?: string;
        coordinates?: { longitude?: number; latitude?: number };
      };
    }>;
  };
  const feature = data.features?.[0];
  if (!feature?.geometry?.coordinates && !feature?.properties?.coordinates) {
    return null;
  }

  const coords = feature.geometry?.coordinates ?? [
    feature.properties!.coordinates!.longitude ?? 0,
    feature.properties!.coordinates!.latitude ?? 0,
  ];
  const lng = coords[0];
  const lat = coords[1];
  const name =
    feature.properties?.name ?? "";
  const address =
    feature.properties?.full_address ??
    feature.properties?.place_formatted;

  return {
    id: mapboxId,
    name,
    address,
    center: { lng, lat },
  };
}

/**
 * Legacy: single-call search using Geocoding API (kept for compatibility).
 * Prefer suggest() + retrieve() for better POI coverage (e.g. Star Hotel).
 */
export async function searchPlaces(query: string): Promise<GeocodingFeature[]> {
  const token = getToken();
  if (!token || query.trim().length < 3) return [];

  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query.trim()
    )}.json`
  );
  url.searchParams.set("access_token", token);
  url.searchParams.set("limit", "5");
  url.searchParams.set("language", "en");
  url.searchParams.set("country", "vn");
  url.searchParams.set(
    "proximity",
    `${DANANG_CENTER[0]},${DANANG_CENTER[1]}`
  );
  url.searchParams.set("types", "place,poi,address");

  const res = await fetch(url.toString());
  if (!res.ok) return [];

  const data = (await res.json()) as { features?: unknown[] };
  const list = data.features ?? [];
  if (!Array.isArray(list)) return [];

  return list.map((f: Record<string, unknown>) => {
    const center = (f.center as [number, number] | undefined) ?? [0, 0];
    return {
      id: String(f.id ?? ""),
      name: (f.text ?? f.place_name ?? query) as string,
      address: (f.place_name as string) ?? undefined,
      center: { lng: center[0], lat: center[1] },
    };
  });
}
