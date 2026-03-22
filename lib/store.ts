import { create } from "zustand";
import type { EventType, TrafficEvent } from "@/lib/types";

const defaultEventTypeVisible: Record<EventType, boolean> = {
  checkpoint: true,
  accident: true,
  hazard: true,
  roadblock: true,
};

interface MapStore {
  events: TrafficEvent[];
  setEvents: (events: TrafficEvent[]) => void;
  addEvent: (event: TrafficEvent) => void;
  selectedEvent: TrafficEvent | null;
  setSelectedEvent: (event: TrafficEvent | null) => void;
  reportModalOpen: boolean;
  reportCoords: { lat: number; lng: number } | null;
  /** Human-readable place name from search (optional). */
  reportPlaceLabel: string | null;
  openReportModal: (
    lat: number,
    lng: number,
    placeLabel?: string | null
  ) => void;
  closeReportModal: () => void;
  /** Toggle visibility of markers by event type (legend / filter). */
  eventTypeVisible: Record<EventType, boolean>;
  toggleEventTypeVisible: (type: EventType) => void;
  /** After search pick: show pin + highlight Report until user confirms. */
  searchPreview: { lat: number; lng: number; placeLabel: string } | null;
  setSearchPreview: (
    preview: { lat: number; lng: number; placeLabel: string } | null
  ) => void;

  /** Last known user location (for a map marker). */
  userLocation: { lat: number; lng: number } | null;
  setUserLocation: (loc: { lat: number; lng: number } | null) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  events: [],
  setEvents: (events) => set({ events }),
  addEvent: (event) => set((s) => ({ events: [...s.events, event] })),
  selectedEvent: null,
  setSelectedEvent: (selectedEvent) => set({ selectedEvent }),
  reportModalOpen: false,
  reportCoords: null,
  reportPlaceLabel: null,
  openReportModal: (lat, lng, placeLabel = null) =>
    set({
      reportModalOpen: true,
      reportCoords: { lat, lng },
      reportPlaceLabel: placeLabel ?? null,
    }),
  closeReportModal: () =>
    set({
      reportModalOpen: false,
      reportCoords: null,
      reportPlaceLabel: null,
    }),
  eventTypeVisible: { ...defaultEventTypeVisible },
  toggleEventTypeVisible: (type) =>
    set((s) => ({
      eventTypeVisible: {
        ...s.eventTypeVisible,
        [type]: !s.eventTypeVisible[type],
      },
    })),
  searchPreview: null,
  setSearchPreview: (searchPreview) => set({ searchPreview }),

  userLocation: null,
  setUserLocation: (userLocation) => set({ userLocation }),
}));
