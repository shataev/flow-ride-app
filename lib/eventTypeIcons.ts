import type { EventType } from "@/lib/types";

export const EVENT_TYPES: EventType[] = ["police"];

export const EVENT_TYPE_ICON_SIZE = 16;
type PixelCoord = readonly [number, number, string];

// Public assets (Next.js serves `public/` at the site root)
export const EVENT_TYPE_ICON_PATHS: Record<EventType, string> = {
  police: "/icons/png/police.png",
};

// How big we render the PNG icon in the UI/markers.
export const EVENT_TYPE_ICON_RENDER_SIZE = 32;

const WHITE = "#f8fafc";

const POLICE_BLUE = "#2563eb";
const POLICE_BLUE_LIGHT = "#60a5fa";

function buildColoredPixels(
  pick: (x: number, y: number) => string | null
): PixelCoord[] {
  const pixels: PixelCoord[] = [];
  for (let y = 0; y < EVENT_TYPE_ICON_SIZE; y++) {
    for (let x = 0; x < EVENT_TYPE_ICON_SIZE; x++) {
      const color = pick(x, y);
      if (color) pixels.push([x, y, color]);
    }
  }
  return pixels;
}

export const EVENT_TYPE_ICON_PIXELS: Record<EventType, PixelCoord[]> = {
  police: buildColoredPixels((x, y) => {
    const inOuter = x >= 3 && x <= 12 && y >= 2 && y <= 13;
    if (!inOuter) return null;

    const inInner = x >= 4 && x <= 11 && y >= 3 && y <= 12;
    const base = inInner ? POLICE_BLUE : POLICE_BLUE_LIGHT;

    const inShield =
      (y === 4 && (x === 7 || x === 8)) ||
      (y >= 5 && y <= 9 && x >= 6 && x <= 9) ||
      (y === 10 && (x === 7 || x === 8)) ||
      (y === 11 && (x === 7 || x === 8));

    if (!inShield) return base;

    const inMark =
      (x === 7 || x === 8) && (y === 7 || y === 8 || y === 6);
    return inMark ? WHITE : WHITE;
  }),
};
