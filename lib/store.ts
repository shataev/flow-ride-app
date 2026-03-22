import { create } from "zustand";
import type { TrafficEvent } from "@/lib/types";

interface MapStore {
  events: TrafficEvent[];
  setEvents: (events: TrafficEvent[]) => void;
  addEvent: (event: TrafficEvent) => void;
  removeEvent: (id: string) => void;
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
  /** After search pick: show pin + Add police here / Cancel until confirmed. */
  searchPreview: { lat: number; lng: number; placeLabel: string } | null;
  setSearchPreview: (
    preview: { lat: number; lng: number; placeLabel: string } | null
  ) => void;

  /** After map click: zoom + pin with Add Event until confirmed or replaced. */
  mapClickPreview: { lat: number; lng: number } | null;
  setMapClickPreview: (preview: { lat: number; lng: number } | null) => void;

  /** Last known user location (for a map marker). */
  userLocation: { lat: number; lng: number } | null;
  setUserLocation: (loc: { lat: number; lng: number } | null) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  events: [],
  setEvents: (events) => set({ events }),
  addEvent: (event) => set((s) => ({ events: [...s.events, event] })),
  removeEvent: (id) =>
    set((s) => ({
      events: s.events.filter((e) => e.id !== id),
      selectedEvent: s.selectedEvent?.id === id ? null : s.selectedEvent,
    })),
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
  searchPreview: null,
  setSearchPreview: (searchPreview) => set({ searchPreview }),

  mapClickPreview: null,
  setMapClickPreview: (mapClickPreview) => set({ mapClickPreview }),

  userLocation: null,
  setUserLocation: (userLocation) => set({ userLocation }),
}));
