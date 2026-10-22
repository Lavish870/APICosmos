
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LiquidNavbar from "@/components/LiquidNavbar";

const STORAGE_KEY = "apicosmos-saved-apis";

export default function SavedPage() {
    const [savedApis, setSavedApis] = useState([]);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            setSavedApis(Array.isArray(saved) ? saved : []);
        } catch {
            setSavedApis([]);
        }
        setReady(true);
    }, []);

    function removeApi(name) {
        const updated = savedApis.filter((api) => api.name !== name);
        setSavedApis(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    return (
        <div className="min-h-screen bg-(--background) text-(--foreground)">
            <LiquidNavbar />

            <main className="mx-auto w-full max-w-7xl px-5 pb-16 pt-10 sm:px-8 lg:px-12">
                <p className="mb-3 text-xs font-bold tracking-[0.2em] text-(--muted)">
                    YOUR PERSONAL COLLECTION
                </p>

                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    Saved <span className="text-(--accent)">APIs.</span>
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-(--muted) sm:text-base">
                    Keep your favourite APIs in one place and revisit them whenever you need.
                </p>

                {!ready ? (
                    <p className="mt-10 text-sm text-(--muted)">Loading saved APIs...</p>
                ) : savedApis.length === 0 ? (
                    <div className="mt-10 rounded-2xl border border-dashed border-(--border) px-5 py-16 text-center">
                        <div className="text-4xl">♡</div>
                        <h2 className="mt-4 text-xl font-semibold">No saved APIs yet</h2>
                        <p className="mt-2 text-sm text-(--muted)">
                            Explore APIs and save the ones you want to revisit.
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
                        <div className="mb-5 mt-10 flex items-center justify-between">
                            <p className="text-sm text-(--muted)">
                                <span className="font-semibold text-(--foreground)">
                                    {savedApis.length}
                                </span>{" "}
                                saved {savedApis.length === 1 ? "API" : "APIs"}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {savedApis.map((api) => (
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
                                            onClick={() => removeApi(api.name)}
                                            title="Remove from saved APIs"
                                            aria-label={`Remove ${api.name} from saved APIs`}
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-(--accent) bg-(--accent)/10 text-(--accent) transition-all duration-200 hover:scale-105 hover:bg-red-500/10 hover:text-red-500"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-4-6 4z" />
                                            </svg>
                                        </button>

                                    </div>

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
                                            className="text-sm font-semibold text-(--accent) hover:opacity-75"
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
