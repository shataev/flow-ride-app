import { create } from "zustand";
import type { TrafficEvent } from "@/lib/types";

export type BottomSheetSnap = "collapsed" | "half" | "full";
export type BottomSheetContent =
  | "route"
  | "event"
  | "search"
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
  openReportModal: (lat: number, lng: number) => void;
  closeReportModal: () => void;
  routeMode: "idle" | "start" | "end";
  startPoint: { lat: number; lng: number } | null;
  endPoint: { lat: number; lng: number } | null;
  setRouteMode: (mode: "idle" | "start" | "end") => void;
  setStartPoint: (point: { lat: number; lng: number } | null) => void;
  setEndPoint: (point: { lat: number; lng: number } | null) => void;
  routeCoordinates: [number, number][] | null;
  routeDistance: number | null;
  routeDuration: number | null;
  setRouteCoordinates: (coords: [number, number][] | null) => void;
  setRouteDetails: (distance: number | null, duration: number | null) => void;
  resetRoute: () => void;
  bottomSheetSnap: BottomSheetSnap;
  bottomSheetContent: BottomSheetContent;
  setBottomSheetSnap: (snap: BottomSheetSnap) => void;
  setBottomSheetContent: (content: BottomSheetContent) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  events: [],
  setEvents: (events) => set({ events }),
  addEvent: (event) => set((s) => ({ events: [...s.events, event] })),
  selectedEvent: null,
  setSelectedEvent: (selectedEvent) => set({ selectedEvent }),
  reportModalOpen: false,
  reportCoords: null,
  openReportModal: (lat, lng) =>
    set({ reportModalOpen: true, reportCoords: { lat, lng } }),
  closeReportModal: () =>
    set({ reportModalOpen: false, reportCoords: null }),
  routeMode: "idle",
  startPoint: null,
  endPoint: null,
  setRouteMode: (routeMode) => set({ routeMode }),
  setStartPoint: (startPoint) => set({ startPoint }),
  setEndPoint: (endPoint) => set({ endPoint }),
  routeCoordinates: null,
  routeDistance: null,
  routeDuration: null,
  setRouteCoordinates: (routeCoordinates) => set({ routeCoordinates }),
  setRouteDetails: (routeDistance, routeDuration) =>
    set({ routeDistance, routeDuration }),
  resetRoute: () =>
    set({
      routeMode: "idle",
      startPoint: null,
      endPoint: null,
      routeCoordinates: null,
      routeDistance: null,
      routeDuration: null,
    }),
  bottomSheetSnap: "collapsed",
  // by default we subtly hint that reporting events is the primary action
  bottomSheetContent: "report-hint",
  setBottomSheetSnap: (bottomSheetSnap) => set({ bottomSheetSnap }),
  setBottomSheetContent: (bottomSheetContent) => set({ bottomSheetContent }),
}));
