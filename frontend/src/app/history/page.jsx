
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LiquidNavbar from "@/components/LiquidNavbar";

export default function HistoryPage() {
    const [history, setHistory] = useState([]);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        try {
            const viewed = JSON.parse(
                localStorage.getItem("apicosmos-view-history") || "[]"
            );

            setHistory(Array.isArray(viewed) ? viewed : []);
        } catch {
            setHistory([]);
        }

        setReady(true);
    }, []);

    function clearHistory() {
        localStorage.removeItem("apicosmos-view-history");
        setHistory([]);
    }

    function removeFromHistory(name) {
        const updated = history.filter((api) => api.name !== name);

        setHistory(updated);
        localStorage.setItem(
            "apicosmos-view-history",
            JSON.stringify(updated)
        );
    }

    return (
        <div className="min-h-screen bg-(--background) text-(--foreground)">
            <LiquidNavbar />

            <main className="mx-auto w-full max-w-7xl px-5 pb-16 pt-10 sm:px-8 lg:px-12">
                <p className="mb-3 text-xs font-bold tracking-[0.2em] text-(--muted)">
                    YOUR RECENT ACTIVITY
                </p>

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                            Recently <span className="text-(--accent)">Viewed.</span>
                        </h1>

                        <p className="mt-4 max-w-2xl text-sm leading-7 text-(--muted) sm:text-base">
                            Quickly revisit the APIs you explored recently.
                        </p>
                    </div>

                    {ready && history.length > 0 && (
                        <button
                            type="button"
                            onClick={clearHistory}
                            className="rounded-xl border border-(--border) px-4 py-2.5 text-sm font-medium text-(--muted) transition hover:border-red-400 hover:text-red-500"
                        >
                            Clear history
                        </button>
                    )}
                </div>

                {!ready ? (
                    <p className="mt-10 text-sm text-(--muted)">
                        Loading history...
                    </p>
                ) : history.length === 0 ? (
                    <div className="mt-10 rounded-2xl border border-dashed border-(--border) px-5 py-16 text-center">
                        <div className="text-4xl" aria-hidden="true">◷</div>

                        <h2 className="mt-4 text-xl font-semibold">
                            No viewing history yet
                        </h2>

                        <p className="mt-2 text-sm text-(--muted)">
                            Open an API from Explore and it will appear here automatically.
                        </p>

                        <Link
                            href="/explore"
                            className="mt-6 inline-flex rounded-xl bg-(--accent) px-5 py-3 text-sm font-semibold text-(--accent-foreground)"
                        >
                            Explore APIs →
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className="mb-5 mt-10 text-sm text-(--muted)">
                            {history.length} of 10 recent APIs
                        </p>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {history.map((api, index) => (
                                <div
                                    key={api.name}
                                    className="flex min-h-64 flex-col rounded-2xl border border-(--border) bg-(--surface) p-5 transition hover:border-(--accent)"
                                >
                                    <div className="mb-5 flex items-start justify-between gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-(--border) bg-(--background) text-sm font-bold text-(--accent)">
                                            {api.color || api.name?.slice(0, 2)?.toUpperCase() || "API"}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeFromHistory(api.name)}
                                            title="Remove from history"
                                            aria-label={`Remove ${api.name} from history`}
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-(--border) text-(--muted) transition hover:border-red-400 hover:text-red-500"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M3 6h18" />
                                                <path d="m19 6-1 14H6L5 6" />
                                                <path d="M9 6V4h6v2" />
                                            </svg>
                                        </button>
                                    </div>

                                    <p className="mb-2 text-xs text-(--muted)">
                                        Recently viewed · #{index + 1}
                                    </p>

                                    <h2 className="text-lg font-semibold">{api.name}</h2>

                                    <p className="mt-2 flex-1 text-sm leading-6 text-(--muted)">
                                        {api.description}
                                    </p>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {api.category && (
                                            <span className="rounded-md bg-(--background) px-2.5 py-1 text-xs text-(--muted)">
                                                {api.category}
                                            </span>
                                        )}

                                        {api.auth && (
                                            <span className="rounded-md bg-(--background) px-2.5 py-1 text-xs text-(--muted)">
                                                {api.auth}
                                            </span>
                                        )}

                                        {api.pricing && (
                                            <span className="rounded-md bg-(--background) px-2.5 py-1 text-xs text-(--muted)">
                                                {api.pricing}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-5 border-t border-(--border) pt-4">
                                        <Link
                                            href={`/cards?name=${encodeURIComponent(api.name)}`}
                                            className="text-sm font-semibold text-(--accent) transition hover:opacity-75"
                                        >
                                            View API details ↗
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
