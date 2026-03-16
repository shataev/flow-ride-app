"use client";

import type { ReactNode } from "react";

interface FloatingButtonProps {
  onClick: () => void;
  icon: ReactNode;
  "aria-label": string;
  className?: string;
}

export function FloatingButton({
  onClick,
  icon,
  "aria-label": ariaLabel,
  className = "",
}: FloatingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-zinc-800 shadow-lg transition-transform active:scale-95 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 " +
        className
      }
    >
      {icon}
    </button>
  );
}
