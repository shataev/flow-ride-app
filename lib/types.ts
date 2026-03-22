export type EventType = "police";

export interface TrafficEvent {
  id: string;
  type: EventType;
  lat: number;
  lng: number;
  description?: string;
  createdAt?: string;
}

export interface RouteRequest {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
}

export interface RouteResponse {
  coordinates: [number, number][];
  distance?: number;
  duration?: number;
}

export interface ReportEventPayload {
  type: EventType;
  lat: number;
  lng: number;
  description?: string;
}
