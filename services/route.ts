import type { RouteRequest, RouteResponse } from "@/lib/types";
import { getApiBaseUrl } from "@/lib/env";

export async function fetchRoute(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
): Promise<RouteResponse> {
  const base = getApiBaseUrl() || (typeof window !== "undefined" ? window.location.origin : "");
  const res = await fetch(`${base}/api/route`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ start, end } satisfies RouteRequest),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const e = err as { error?: string; message?: string };
    throw new Error(e.error ?? e.message ?? `Failed to get route: ${res.status}`);
  }
  return res.json();
}
