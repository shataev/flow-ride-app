import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Flow Ride
          </Link>
          <nav className="flex gap-4">
            <Link href="/" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              Map
            </Link>
            <Link href="/report" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              Report
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          About Flow Ride
        </h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          Flow Ride is a geo-based traffic events app for Da Nang. View and report traffic events, 
          build routes, and see events along your route.
        </p>
        <h2 className="mt-8 font-semibold text-zinc-800 dark:text-zinc-200">Features</h2>
        <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          <li>View traffic events on the map (checkpoints, accidents, hazards, roadblocks)</li>
          <li>Report new events by tapping on the map</li>
          <li>Build a route from start to destination</li>
          <li>See events along your route</li>
        </ul>
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-500">
          MVP • Next.js, Mapbox GL JS, TailwindCSS
        </p>
      </main>
    </div>
  );
}
