// Danang, Vietnam
export const DANANG_CENTER: [number, number] = [108.2022, 16.0544];
export const DEFAULT_ZOOM = 12;
/** Min zoom after tapping the map to place a report pin (won’t zoom out if already closer). */
export const MAP_CLICK_PREVIEW_MIN_ZOOM = 15;
export const EVENTS_RADIUS_M = 5000;
export const CITY = "danang";

export const EVENT_TYPE_COLORS: Record<string, string> = {
  // Colors used for marker borders (icons are self-colored).
  checkpoint: "#2563eb", // police
  accident: "#facc15", // accident sign
  hazard: "#facc15", // warning sign
  roadblock: "#f97316", // road works sign
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
  checkpoint: "Police checkpoint",
  accident: "Accident ahead",
  hazard: "Warning",
  roadblock: "Road works",
};
