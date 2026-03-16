"use client";

import { useCallback, useRef, useState, useEffect, type ReactNode } from "react";
import type { BottomSheetSnap } from "@/lib/store";

const COLLAPSED_H = 56;
const HALF_RATIO = 0.45;
const FULL_RATIO = 0.92;

function getSnapHeight(snap: BottomSheetSnap, dragY: number): number {
  if (typeof window === "undefined") return COLLAPSED_H;
  const maxH = window.innerHeight;
  if (snap === "collapsed") return COLLAPSED_H + dragY;
  if (snap === "half") return maxH * HALF_RATIO + dragY;
  return maxH * FULL_RATIO + dragY;
}

interface BottomSheetProps {
  snap: BottomSheetSnap;
  onSnapChange: (snap: BottomSheetSnap) => void;
  children: ReactNode;
  className?: string;
}

export function BottomSheet({
  snap,
  onSnapChange,
  children,
  className = "",
}: BottomSheetProps) {
  const [dragY, setDragY] = useState(0);
  const [height, setHeight] = useState(COLLAPSED_H);
  const startYRef = useRef(0);

  useEffect(() => {
    setHeight(getSnapHeight(snap, dragY));
  }, [snap, dragY]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const dy = e.touches[0].clientY - startYRef.current;
    setDragY(-dy);
  }, []);

  const handleTouchEnd = useCallback(() => {
    const maxH = typeof window !== "undefined" ? window.innerHeight : 400;
    const current = getSnapHeight(snap, dragY);
    setDragY(0);

    if (current < maxH * 0.25) {
      onSnapChange("collapsed");
    } else if (current < maxH * 0.7) {
      onSnapChange("half");
    } else {
      onSnapChange("full");
    }
  }, [snap, dragY, onSnapChange]);

  const cycleSnap = useCallback(() => {
    if (snap === "collapsed") onSnapChange("half");
    else if (snap === "half") onSnapChange("full");
    else onSnapChange("collapsed");
  }, [snap, onSnapChange]);

  const displayHeight = Math.max(COLLAPSED_H, height);

  return (
    <div
      className={
        "absolute inset-x-0 bottom-0 z-30 flex flex-col rounded-t-2xl bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-[height] duration-200 ease-out dark:bg-zinc-900 " +
        className
      }
      style={{ height: `${displayHeight}px` }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <button
        type="button"
        onClick={cycleSnap}
        className="flex w-full justify-center py-3 touch-manipulation"
        aria-label="Toggle sheet"
      >
        <span className="h-1 w-12 rounded-full bg-zinc-300 dark:bg-zinc-600" />
      </button>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6">
        {children}
      </div>
    </div>
  );
}
