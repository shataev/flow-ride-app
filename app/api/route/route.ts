import { NextRequest, NextResponse } from "next/server";
import { getRoute } from "@/lib/mapbox";

function isCoordPair(a: unknown): a is [number, number] {
  return (
    Array.isArray(a) &&
    a.length === 2 &&
    Number.isFinite(a[0]) &&
    Number.isFinite(a[1])
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let from: [number, number] | undefined = body.from;
    let to: [number, number] | undefined = body.to;

    if (!isCoordPair(from) && body.start && body.end) {
      from = [body.start.lng, body.start.lat];
      to = [body.end.lng, body.end.lat];
    }

    if (!isCoordPair(from) || !isCoordPair(to)) {
      return NextResponse.json(
        { error: "Body must include from and to as [lng, lat] arrays" },
        { status: 400 }
      );
    }

    const result = await getRoute(from, to);

    return NextResponse.json({
      distance: result.distance,
      duration: result.duration,
      geometry: result.geometry,
      coordinates: result.geometry,
    });
  } catch (err) {
    console.error("POST /api/route", err);
    const message = err instanceof Error ? err.message : "Route request failed";
    const status = message.includes("MAPBOX") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
