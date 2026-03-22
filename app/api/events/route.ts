import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Event, getExpiresAt } from "@/models/Event";
import { normalizeEventDescription } from "@/lib/eventDescription";

const EVENT_TYPES = ["police"] as const;
/** Legacy DB values still returned as `police` in the API. */
const LEGACY_POLICE_TYPES = ["checkpoint"] as const;

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
      type: { $in: [...EVENT_TYPES, ...LEGACY_POLICE_TYPES] },
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

    const list = events.map((e) => {
      const loc = e.location as unknown as { coordinates: [number, number] };
      return {
      id: String(e._id),
      type:
        LEGACY_POLICE_TYPES.includes(
          e.type as (typeof LEGACY_POLICE_TYPES)[number]
        )
          ? "police"
          : e.type,
      lat: loc.coordinates[1],
      lng: loc.coordinates[0],
      ...(typeof e.description === "string" && e.description.length > 0
        ? { description: e.description }
        : {}),
      confirmations: e.confirmations,
      rejections: e.rejections,
      createdAt: e.createdAt,
    };
    });

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
    const { city = "danang", type, lat, lng, description: rawDescription } =
      body;
    const description = normalizeEventDescription(rawDescription);

    if (!EVENT_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "type must be: police" },
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
      ...(description !== undefined ? { description } : {}),
      confirmations: 0,
      rejections: 0,
      expiresAt: getExpiresAt(),
    });

    const coords = doc.location!.coordinates;
    return NextResponse.json({
      id: String(doc._id),
      type: doc.type,
      lat: coords[1],
      lng: coords[0],
      ...(doc.description ? { description: doc.description } : {}),
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
