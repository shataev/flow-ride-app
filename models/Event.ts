import mongoose, { Schema, model, models } from "mongoose";

const EVENT_TYPES = ["police"] as const;
export type EventTypeDoc = (typeof EVENT_TYPES)[number];

const EXPIRY_HOURS = 3;

const eventSchema = new Schema(
  {
    city: { type: String, required: true },
    type: { type: String, required: true, enum: EVENT_TYPES },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (v: number[]) =>
            Array.isArray(v) && v.length === 2 && v.every(Number.isFinite),
          message: "location.coordinates must be [lng, lat]",
        },
      },
    },
    confirmations: { type: Number, default: 0 },
    rejections: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

eventSchema.index({ location: "2dsphere" });
eventSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export function getExpiresAt(): Date {
  const d = new Date();
  d.setHours(d.getHours() + EXPIRY_HOURS);
  return d;
}

// Next.js keeps modules in memory; `model()` is only applied the first time `Event` is
// registered. After changing `enum` (e.g. to `police`), a stale schema would still reject
// new values until the process restarts. Drop the cached model so the current schema wins.
if (models.Event) {
  mongoose.deleteModel("Event");
}

export const Event = model("Event", eventSchema);
