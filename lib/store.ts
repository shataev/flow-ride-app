import { create } from "zustand";
import type { TrafficEvent } from "@/lib/types";

export type BottomSheetSnap = "collapsed" | "half" | "full";
export type BottomSheetContent =
  | "event"
  | "location-search"
  | "report-hint"
  | null;

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
  bottomSheetSnap: BottomSheetSnap;
  bottomSheetContent: BottomSheetContent;
  setBottomSheetSnap: (snap: BottomSheetSnap) => void;
  setBottomSheetContent: (content: BottomSheetContent) => void;
  /** After search pick: show pin + highlight Report until user confirms. */
  searchPreview: { lat: number; lng: number; placeLabel: string } | null;
  setSearchPreview: (
    preview: { lat: number; lng: number; placeLabel: string } | null
  ) => void;
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
  bottomSheetSnap: "collapsed",
  // by default we subtly hint that reporting events is the primary action
  bottomSheetContent: "report-hint",
  setBottomSheetSnap: (bottomSheetSnap) => set({ bottomSheetSnap }),
  setBottomSheetContent: (bottomSheetContent) => set({ bottomSheetContent }),
  searchPreview: null,
  setSearchPreview: (searchPreview) => set({ searchPreview }),
}));
