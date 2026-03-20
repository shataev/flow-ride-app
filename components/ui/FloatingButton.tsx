"use client";

import type { ReactNode } from "react";

interface FloatingButtonProps {
  onClick: () => void;
  icon: ReactNode;
  "aria-label": string;
  className?: string;
  /** Draw attention (e.g. after search picked a place). */
  highlight?: boolean;
}

export function FloatingButton({
  onClick,
  icon,
  "aria-label": ariaLabel,
  className = "",
  highlight = false,
}: FloatingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-[2px] border-2 border-zinc-200/90 bg-white text-zinc-800 shadow-[4px_4px_0px_rgba(0,0,0,0.12)] transition-transform active:scale-95 hover:bg-zinc-50 dark:border-zinc-600/90 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 " +
        (highlight
          ? "ring-4 ring-blue-500 ring-offset-2 ring-offset-white animate-pulse dark:ring-offset-zinc-900 "
          : "") +
        className
      }
    >
      {icon}
    </button>
  );
}
