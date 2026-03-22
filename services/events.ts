import type { TrafficEvent, ReportEventPayload } from "@/lib/types";
import { getApiBaseUrl } from "@/lib/env";

export async function fetchEvents(
  lat: number,
  lng: number,
  radius = 5000,
  city = "danang"
): Promise<TrafficEvent[]> {
  const base = getApiBaseUrl() || (typeof window !== "undefined" ? window.location.origin : "");
  const url = new URL(`${base}/api/events`);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lng", String(lng));
  url.searchParams.set("radius", String(radius));
  url.searchParams.set("city", city);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Failed to fetch events: ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : data.events ?? [];
}

export async function reportEvent(payload: ReportEventPayload): Promise<TrafficEvent> {
  const base = getApiBaseUrl() || (typeof window !== "undefined" ? window.location.origin : "");
  const res = await fetch(`${base}/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? (err as { message?: string }).message ?? `Failed to report event: ${res.status}`);
  }
  return res.json();
}

export async function deleteEvent(id: string): Promise<void> {
  const base =
    getApiBaseUrl() ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const res = await fetch(`${base}/api/events/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ??
        `Failed to delete event: ${res.status}`
    );
  }
}
