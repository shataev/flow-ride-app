import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Event, getExpiresAt } from "@/models/Event";

const EVENT_TYPES = ["checkpoint", "accident", "hazard", "roadblock"] as const;

function isValidCoord(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= -180 && n <= 180;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = Number(searchParams.get("lat"));
    const lng = Number(searchParams.get("lng"));
    const radius = Math.min(
      Math.max(Number(searchParams.get("radius")) || 5000, 100),
      50000
    );
    const city = searchParams.get("city") ?? "danang";

    if (!isValidCoord(lng) || !isValidCoord(lat)) {
      return NextResponse.json(
        { error: "Valid lat and lng query parameters are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const events = await Event.find({
      city,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: radius,
        },
      },
    })
      .lean()
      .exec();

    const list = events.map((e) => ({
      id: String(e._id),
      type: e.type,
      lat: (e.location as { coordinates: [number, number] }).coordinates[1],
      lng: (e.location as { coordinates: [number, number] }).coordinates[0],
      confirmations: e.confirmations,
      rejections: e.rejections,
      createdAt: e.createdAt,
    }));

    return NextResponse.json(list);
  } catch (err) {
    console.error("GET /api/events", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { city = "danang", type, lat, lng } = body;

    if (!EVENT_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "type must be one of: checkpoint, accident, hazard, roadblock" },
        { status: 400 }
      );
    }

    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      return NextResponse.json(
        { error: "lat and lng must be numbers" },
        { status: 400 }
      );
    }
    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      return NextResponse.json(
        { error: "Invalid coordinates" },
        { status: 400 }
      );
    }

    await connectDB();

    const doc = await Event.create({
      city: String(city),
      type,
      location: {
        type: "Point",
        coordinates: [lngNum, latNum],
      },
      confirmations: 0,
      rejections: 0,
      expiresAt: getExpiresAt(),
    });

    return NextResponse.json({
      id: String(doc._id),
      type: doc.type,
      lat: doc.location.coordinates[1],
      lng: doc.location.coordinates[0],
      createdAt: doc.createdAt,
    });
  } catch (err) {
    console.error("POST /api/events", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create event" },
      { status: 500 }
    );
  }
}
