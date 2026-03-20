// Danang, Vietnam
export const DANANG_CENTER: [number, number] = [108.2022, 16.0544];
export const DEFAULT_ZOOM = 12;
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
