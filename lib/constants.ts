// Danang, Vietnam
export const DANANG_CENTER: [number, number] = [108.2022, 16.0544];
/** SW / NE corners — fallback when there are no events to fit. */
export const DANANG_BOUNDS: [[number, number], [number, number]] = [
  [108.08, 15.92],
  [108.38, 16.2],
];
/** Max radius supported by GET /api/events (meters). */
export const REGION_MAX_EVENTS_RADIUS_M = 50_000;
export const DEFAULT_ZOOM = 12;
/** Min zoom after tapping the map to place a report pin (won’t zoom out if already closer). */
export const MAP_CLICK_PREVIEW_MIN_ZOOM = 15;
export const EVENTS_RADIUS_M = 5000;
export const CITY = "danang";

export const EVENT_TYPE_COLORS: Record<string, string> = {
  police: "#ff0000b3",
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
  police: "Police on the road",
};
