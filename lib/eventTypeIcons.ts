import type { EventType } from "@/lib/types";

export const EVENT_TYPES: EventType[] = [
  "checkpoint",
  "accident",
  "hazard",
  "roadblock",
];

export const EVENT_TYPE_ICON_SIZE = 16;
type PixelCoord = readonly [number, number, string];

// Public assets (Next.js serves `public/` at the site root)
export const EVENT_TYPE_ICON_PATHS: Record<EventType, string> = {
  // Icons from `public/icons/png`
  checkpoint: "/icons/png/police.png",
  accident: "/icons/png/fender-bender.png",
  hazard: "/icons/png/hazard-sign.png",
  roadblock: "/icons/png/road-block.png",
};

// How big we render the PNG icon in the UI/markers.
export const EVENT_TYPE_ICON_RENDER_SIZE = 32;

const OUTLINE = "#0b1220";
const WHITE = "#f8fafc";

const POLICE_BLUE = "#2563eb";
const POLICE_BLUE_LIGHT = "#60a5fa";
const POLICE_RED = "#ef4444";
const POLICE_GRAY = "#334155";

const ORANGE = "#f59e0b";
const ORANGE_LIGHT = "#fbbf24";
const ORANGE_DARK = "#c2410c";

const YELLOW = "#facc15";
const AMBER = "#f59e0b";
const AMBER_DARK = "#d97706";

const EMERGENCY_RED = "#ef4444";
const EMERGENCY_BLUE = "#3b82f6";

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

function pointInTriangle(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number
): boolean {
  // Barycentric technique based on sign of areas.
  const sign = (x1: number, y1: number, x2: number, y2: number) =>
    (px - x2) * (y1 - y2) - (x1 - x2) * (py - y2);

  const b1 = sign(ax, ay, bx, by) < 0;
  const b2 = sign(bx, by, cx, cy) < 0;
  const b3 = sign(cx, cy, ax, ay) < 0;

  return (b1 === b2) && (b2 === b3);
}

const warnTriangleOuter = {
  // Pixel-space vertices (using pixel centers, not grid corners)
  apex: { x: 7.5, y: 1.5 },
  left: { x: 2.5, y: 13.5 },
  right: { x: 12.5, y: 13.5 },
};

const warnTriangleInner = {
  apex: { x: 7.5, y: 3.5 },
  left: { x: 4.5, y: 12.5 },
  right: { x: 10.5, y: 12.5 },
};

function neighborOut(
  x: number,
  y: number,
  solid: (nx: number, ny: number) => boolean
): boolean {
  // Outline detection: current is solid and at least one 4-neighbor is empty.
  return (
    !solid(x - 1, y) ||
    !solid(x + 1, y) ||
    !solid(x, y - 1) ||
    !solid(x, y + 1)
  );
}

export const EVENT_TYPE_ICON_PIXELS: Record<EventType, PixelCoord[]> = {
  // checkpoint => police/checkpoint sign (blue square + badge)
  checkpoint: buildColoredPixels((x, y) => {
    const inOuter = x >= 3 && x <= 12 && y >= 2 && y <= 13;
    if (!inOuter) return null;

    const inInner = x >= 4 && x <= 11 && y >= 3 && y <= 12;
    const base = inInner ? POLICE_BLUE : POLICE_BLUE_LIGHT;

    // Badge (simplified shield)
    const inShield =
      (y === 4 && (x === 7 || x === 8)) ||
      (y >= 5 && y <= 9 && x >= 6 && x <= 9) ||
      (y === 10 && (x === 7 || x === 8)) ||
      (y === 11 && (x === 7 || x === 8));

    if (!inShield) return base;

    // Emblem: cross/diamond-ish mark
    const inMark =
      (x === 7 || x === 8) && (y === 7 || y === 8 || y === 6);
    return inMark ? WHITE : WHITE;
  }),

  // hazard => warning triangle (exclamation)
  hazard: buildColoredPixels((x, y) => {
    const inOuter = pointInTriangle(
      x + 0.5,
      y + 0.5,
      warnTriangleOuter.apex.x,
      warnTriangleOuter.apex.y,
      warnTriangleOuter.left.x,
      warnTriangleOuter.left.y,
      warnTriangleOuter.right.x,
      warnTriangleOuter.right.y
    );
    if (!inOuter) return null;

    const inInner = pointInTriangle(
      x + 0.5,
      y + 0.5,
      warnTriangleInner.apex.x,
      warnTriangleInner.apex.y,
      warnTriangleInner.left.x,
      warnTriangleInner.left.y,
      warnTriangleInner.right.x,
      warnTriangleInner.right.y
    );

    if (!inInner) return POLICE_RED; // red border

    const isDot = (x === 7 || x === 8) && y === 5;
    const isLine = (x === 7 || x === 8) && y >= 6 && y <= 10;
    if (isDot || isLine) return OUTLINE;

    // interior fill
    return y <= 7 ? YELLOW : AMBER;
  }),

  // roadblock => road works sign (triangle + worker silhouette)
  roadblock: buildColoredPixels((x, y) => {
    const inOuter = pointInTriangle(
      x + 0.5,
      y + 0.5,
      warnTriangleOuter.apex.x,
      warnTriangleOuter.apex.y,
      warnTriangleOuter.left.x,
      warnTriangleOuter.left.y,
      warnTriangleOuter.right.x,
      warnTriangleOuter.right.y
    );
    if (!inOuter) return null;

    const inInner = pointInTriangle(
      x + 0.5,
      y + 0.5,
      warnTriangleInner.apex.x,
      warnTriangleInner.apex.y,
      warnTriangleInner.left.x,
      warnTriangleInner.left.y,
      warnTriangleInner.right.x,
      warnTriangleInner.right.y
    );

    if (!inInner) return POLICE_RED; // red border

    // Worker (simplified): hard hat + body + arms.
    const inHat = (x === 7 || x === 8) && (y === 7 || y === 8);
    const inHead = (x === 7 || x === 8) && y === 9;
    const inBody = x >= 7 && x <= 8 && y >= 10 && y <= 12;
    const inArms = (y === 10 && (x === 6 || x === 9)) || (y === 11 && (x === 6 || x === 9));
    const inBoots = (y === 13 && (x === 6 || x === 7 || x === 8 || x === 9));

    const inWorker = inHat || inHead || inBody || inArms || inBoots;
    if (inWorker) return OUTLINE;

    // Optional tools: short diagonal bars.
    const inTool = (x === 6 && y === 12) || (x === 9 && y === 12);
    if (inTool) return WHITE;

    // orange background like road works
    return y <= 9 ? ORANGE_LIGHT : ORANGE_DARK;
  }),

  // accident => accident ahead sign (triangle + collision pictogram)
  accident: buildColoredPixels((x, y) => {
    const inOuter = pointInTriangle(
      x + 0.5,
      y + 0.5,
      warnTriangleOuter.apex.x,
      warnTriangleOuter.apex.y,
      warnTriangleOuter.left.x,
      warnTriangleOuter.left.y,
      warnTriangleOuter.right.x,
      warnTriangleOuter.right.y
    );
    if (!inOuter) return null;

    const inInner = pointInTriangle(
      x + 0.5,
      y + 0.5,
      warnTriangleInner.apex.x,
      warnTriangleInner.apex.y,
      warnTriangleInner.left.x,
      warnTriangleInner.left.y,
      warnTriangleInner.right.x,
      warnTriangleInner.right.y
    );

    if (!inInner) return POLICE_RED; // red border

    // Two "cars" (simple rectangles) + X crack.
    const leftCar =
      x >= 5 &&
      x <= 7 &&
      y >= 8 &&
      y <= 11;
    const rightCar =
      x >= 9 &&
      x <= 11 &&
      y >= 8 &&
      y <= 11;
    const window =
      (y === 9 || y === 10) && ((x === 6) || (x === 10));

    const wheelLeft = y === 11 && (x === 5 || x === 7);
    const wheelRight = y === 11 && (x === 9 || x === 11);

    const inCars = leftCar || rightCar;
    const inCrack =
      ((x === 6 && y === 10) ||
        (x === 7 && y === 9) ||
        (x === 9 && y === 10) ||
        (x === 10 && y === 9) ||
        (x === 7 && y === 10) ||
        (x === 9 && y === 9));

    if (window) return WHITE;
    if (wheelLeft || wheelRight) return OUTLINE;
    if (inCrack) return OUTLINE;
    if (inCars) return OUTLINE;

    return y <= 8 ? YELLOW : AMBER;
  }),
};
