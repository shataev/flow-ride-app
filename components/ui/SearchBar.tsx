"use client";

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value = "",
  onChange,
  onFocus,
  onBlur,
  placeholder = "Where to?",
  className = "",
}: SearchBarProps) {
  return (
    <div
      className={
        "flex items-center gap-3 rounded-[2px] border-2 border-zinc-200/90 bg-white/95 px-4 py-3 shadow-[4px_4px_0px_rgba(0,0,0,0.12)] backdrop-blur dark:border-zinc-600/90 dark:bg-zinc-900/95 dark:shadow-[4px_4px_0px_rgba(0,0,0,0.35)] " +
        className
      }
    >
      <img
        src="/icons/png/search-globe.png"
        alt=""
        aria-hidden
        width={32}
        height={32}
        style={{ imageRendering: "pixelated" }}
        className="h-8 w-8"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent font-mono text-base text-zinc-900 placeholder-zinc-400 outline-none dark:text-zinc-100 dark:placeholder-zinc-500"
        aria-label="Search destination"
      />
    </div>
  );
}
