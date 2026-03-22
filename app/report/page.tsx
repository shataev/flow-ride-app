import Link from "next/link";

export default function ReportPage() {
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
            <Link href="/about" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              About
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Report an event
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          To report police on the road, open the map and either search for a place in the bar at
          the top or tap directly on the map. A modal will open where you can add an optional
          description.
        </p>
        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-semibold text-zinc-800 dark:text-zinc-200">Steps</h2>
          <ol className="mt-3 list-decimal list-inside space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>Go to the <Link href="/" className="font-medium text-blue-600 dark:text-blue-400">Map</Link>.</li>
            <li>Search for the place or tap on the map at the event location.</li>
            <li>Confirm the location and submit the report (police on the road).</li>
            <li>Optionally add a description and submit.</li>
          </ol>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Open map
          </Link>
        </div>
      </main>
    </div>
  );
}
