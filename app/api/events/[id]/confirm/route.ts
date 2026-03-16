import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Event } from "@/models/Event";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
    }

    await connectDB();

    const doc = await Event.findByIdAndUpdate(
      id,
      { $inc: { confirmations: 1 } },
      { new: true }
    )
      .lean()
      .exec();

    if (!doc) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: String(doc._id),
      confirmations: doc.confirmations,
    });
  } catch (err) {
    console.error("POST /api/events/[id]/confirm", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to confirm" },
      { status: 500 }
    );
  }
}
