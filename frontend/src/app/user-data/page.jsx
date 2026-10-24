
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import LiquidNavbar from "@/components/LiquidNavbar";

const pageDetails = {
    uploaded: {
        title: "APIs Uploaded",
        description: "All APIs you have submitted.",
    },
    pending: {
        title: "Pending Reviews",
        description: "Your APIs waiting for review.",
    },
    approved: {
        title: "Approved APIs",
        description: "Your approved and published APIs.",
    },
    saved: {
        title: "Saved APIs",
        description: "Your bookmarked APIs.",
    },
};

export default function UserDataPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const type = searchParams.get("type") || "uploaded";
    const details = pageDetails[type] || pageDetails.uploaded;

    const [apis, setApis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadApis() {
            setLoading(true);
            setError("");

            try {
                if (type === "saved") {
                    if (active) setApis([]);
                    return;
                }

                const token = localStorage.getItem("apicosmos-token");

                if (!token) {
                    throw new Error("Please log in to view your APIs.");
                }

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/apis/mine`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Could not load your APIs.");
                }

                const allApis = Array.isArray(result.data) ? result.data : [];

                const filteredApis =
                    type === "pending"
                        ? allApis.filter(
                            (api) => api.status?.toLowerCase() === "pending"
                        )
                        : type === "approved"
                            ? allApis.filter(
                                (api) => api.status?.toLowerCase() === "approved"
                            )
                            : allApis;

                if (active) setApis(filteredApis);
            } catch (err) {
                if (active) setError(err.message || "Something went wrong.");
            } finally {
                if (active) setLoading(false);
            }
        }

        loadApis();

        return () => {
            active = false;
        };
    }, [type]);

    return (
        <>
            <LiquidNavbar />

            <main className="min-h-screen bg-(--background) px-5 py-10 text-(--foreground) md:px-10">
                <div className="mx-auto max-w-6xl">
                    <Link
                        href="/dashboard"
                        className="mb-6 inline-flex text-sm font-semibold text-(--accent) hover:underline"
                    >
                        ← Back to Dashboard
                    </Link>

                    <div className="mb-8">
                        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-(--accent)">
                            APICosmos / Workspace
                        </p>

                        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                            {details.title}
                        </h1>

                        <p className="mt-3 text-(--muted)">
                            {details.description}
                        </p>

                        {!loading && !error && type !== "saved" && (
                            <p className="mt-3 text-sm text-(--muted)">
                                {apis.length} {apis.length === 1 ? "API" : "APIs"} found
                            </p>
                        )}
                    </div>

                    {loading ? (
                        <div className="rounded-2xl border border-(--border) bg-(--surface) p-10 text-center">
                            Loading your APIs...
                        </div>
                    ) : error ? (
                        <div className="rounded-2xl border border-red-500/30 bg-(--surface) p-8 text-center">
                            <p className="font-semibold">{error}</p>
                            <button
                                onClick={() => router.refresh()}
                                className="mt-4 rounded-xl border border-(--border) px-5 py-2 font-semibold hover:border-(--accent)"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : type === "saved" ? (
                        <div className="rounded-2xl border border-(--border) bg-(--surface) p-10 text-center">
                            <h2 className="text-xl font-bold">Saved APIs are not connected yet</h2>
                            <p className="mt-3 text-(--muted)">
                                We will show your bookmarked APIs here after connecting the save feature.
                            </p>
                            <Link
                                href="/explore"
                                className="mt-5 inline-flex rounded-xl bg-(--accent) px-5 py-3 font-bold text-(--accent-foreground)"
                            >
                                Explore APIs
                            </Link>
                        </div>
                    ) : apis.length === 0 ? (
                        <div className="rounded-2xl border border-(--border) bg-(--surface) p-10 text-center">
                            <h2 className="text-xl font-bold">No APIs found</h2>
                            <p className="mt-3 text-(--muted)">
                                APIs matching this category will appear here.
                            </p>
                            <Link
                                href="/submit"
                                className="mt-5 inline-flex rounded-xl bg-(--accent) px-5 py-3 font-bold text-(--accent-foreground)"
                            >
                                Submit an API
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-5 md:grid-cols-2">
                            {apis.map((api) => (
                                <article
                                    key={api._id}
                                    className="rounded-2xl border border-(--border) bg-(--surface) p-6 transition hover:border-(--accent)"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <h2 className="text-xl font-bold">
                                            {api.name}
                                        </h2>

                                        <span className="shrink-0 rounded-full border border-(--border) px-3 py-1 text-xs font-semibold capitalize">
                                            {api.status || "pending"}
                                        </span>
                                    </div>

                                    <p className="mt-3 leading-6 text-(--muted)">
                                        {api.description}
                                    </p>

                                    <div className="mt-5 flex flex-wrap gap-2 text-xs">
                                        {api.category && (
                                            <span className="rounded-lg bg-(--surface-secondary) px-3 py-2">
                                                {api.category}
                                            </span>
                                        )}
                                        {api.auth && (
                                            <span className="rounded-lg bg-(--surface-secondary) px-3 py-2">
                                                Auth: {api.auth}
                                            </span>
                                        )}
                                        {api.pricing && (
                                            <span className="rounded-lg bg-(--surface-secondary) px-3 py-2">
                                                {api.pricing}
                                            </span>
                                        )}
                                    </div>

                                    {api.url && (
                                        <a
                                            href={api.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-6 inline-flex rounded-xl bg-(--accent) px-5 py-3 text-sm font-bold text-(--accent-foreground) hover:opacity-85"
                                        >
                                            Visit API ↗
                                        </a>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
