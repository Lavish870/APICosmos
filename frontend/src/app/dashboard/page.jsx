
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LiquidNavbar from "@/components/LiquidNavbar";

const dashboardCards = [
    {
        title: "APIs Uploaded",
        description: "All APIs you have submitted",
        icon: "↗",
        href: "/user-data?type=uploaded",
        label: "View Uploaded APIs",
    },
    {
        title: "Pending Reviews",
        description: "Submissions awaiting review",
        icon: "◷",
        href: "/user-data?type=pending",
        label: "View Pending APIs",
    },
    {
        title: "Approved APIs",
        description: "Your published API listings",
        icon: "✓",
        href: "/user-data?type=approved",
        label: "View Approved APIs",
    },
    {
        title: "Saved APIs",
        description: "APIs you want to revisit",
        icon: "♡",
        href: "/user-data?type=saved",
        label: "View Saved APIs",
    },
];

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        uploaded: 0,
        pending: 0,
        approved: 0,
        saved: 0,
    });

    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function loadDashboard() {
            try {
                const savedUser = localStorage.getItem("apicosmos-user");
                const token = localStorage.getItem("apicosmos-token");

                if (savedUser && isMounted) {
                    setUser(JSON.parse(savedUser));
                }

                if (!token) {
                    if (isMounted) {
                        setStatsError("Please log in again to load your statistics.");
                    }
                    return;
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
                    throw new Error(result.message || "Could not load API statistics.");
                }

                const apis = Array.isArray(result.data) ? result.data : [];

                if (isMounted) {
                    setStats((previous) => ({
                        ...previous,
                        uploaded: apis.length,
                        pending: apis.filter(
                            (api) => api.status?.toLowerCase() === "pending"
                        ).length,
                        approved: apis.filter(
                            (api) => api.status?.toLowerCase() === "approved"
                        ).length,
                    }));
                }
            } catch (error) {
                console.error("Dashboard loading error:", error);

                if (isMounted) {
                    setStatsError(error.message || "Failed to load statistics.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                    setStatsLoading(false);
                }
            }
        }

        loadDashboard();

        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) {
        return (
            <>
                <LiquidNavbar />
                <main className="min-h-screen bg-(--background) text-(--foreground) p-8">
                    Loading dashboard...
                </main>
            </>
        );
    }

    if (!user) {
        return (
            <>
                <LiquidNavbar />
                <main className="flex min-h-screen items-center justify-center bg-(--background) px-5 text-(--foreground)">
                    <section className="w-full max-w-md rounded-3xl border border-(--border) bg-(--surface) p-8 text-center">
                        <h1 className="text-2xl font-bold">Login required</h1>
                        <p className="my-4 text-(--muted)">
                            Sign in to access your personal dashboard.
                        </p>
                        <Link
                            href="/signup"
                            className="inline-flex rounded-xl bg-(--accent) px-6 py-3 font-bold text-(--accent-foreground)"
                        >
                            Sign in / Create account
                        </Link>
                    </section>
                </main>
            </>
        );
    }

    const initial = (user.name || user.email || "U")
        .charAt(0)
        .toUpperCase();

    return (
        <>
            <LiquidNavbar />

            <main className="min-h-screen bg-(--background) px-5 py-10 text-(--foreground) md:px-10">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                        <div>
                            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-(--accent)">
                                APICosmos / Workspace
                            </p>
                            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                                My Dashboard
                            </h1>
                            <p className="mt-3 text-(--muted)">
                                Welcome back, {user.name || "Developer"}.
                                Here is your API workspace.
                            </p>
                        </div>

                        <Link
                            href="/submit"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--accent) px-5 py-3 font-bold text-(--accent-foreground) transition hover:opacity-85"
                        >
                            <span className="text-xl">+</span>
                            Add Your API
                        </Link>
                    </div>

                    <section className="mb-8 rounded-3xl border border-(--border) bg-(--surface) p-6 md:p-8">
                        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                            <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-(--accent) text-2xl font-extrabold text-(--accent-foreground)">
                                {initial}
                            </div>

                            <div className="min-w-0 flex-1">
                                <h2 className="text-xl font-bold">
                                    {user.name || "Developer"}
                                </h2>
                                <p className="mt-1 break-all text-sm text-(--muted)">
                                    {user.email}
                                </p>
                                <p className="mt-3 text-sm text-(--muted)">
                                    Your personal overview of API submissions and saved
                                    resources.
                                </p>
                            </div>

                            <Link
                                href="/profile"
                                className="rounded-xl border border-(--border) px-4 py-2.5 text-sm font-semibold transition hover:border-(--accent)"
                            >
                                View Profile ↗
                            </Link>
                        </div>
                    </section>

                    <div className="mb-5">
                        <h2 className="text-xl font-bold">Your overview</h2>
                        <p className="mt-1 text-sm text-(--muted)">
                            Your activity statistics will appear here once connected
                            to the API database.
                        </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {dashboardCards.map((card) => (
                            <section
                                key={card.title}
                                className="group rounded-2xl border border-(--border) bg-(--surface) p-5 transition duration-200 hover:-translate-y-1 hover:border-(--accent)"
                            >
                                <div className="mb-5 flex items-center justify-between">
                                    <div className="grid size-12 place-items-center rounded-xl bg-(--surface-secondary) text-2xl font-bold text-(--accent)">
                                        {card.icon}
                                    </div>
                                    <span className="text-xs text-(--muted)">LIVE DATA</span>
                                    <p className="mt-4 text-4xl font-extrabold tracking-tight">
                                        {statsLoading
                                            ? "..."
                                            : card.title === "APIs Uploaded"
                                                ? stats.uploaded
                                                : card.title === "Pending Reviews"
                                                    ? stats.pending
                                                    : card.title === "Approved APIs"
                                                        ? stats.approved
                                                        : stats.saved}
                                    </p>
                                </div>

                                <h3 className="font-bold">{card.title}</h3>
                                <p className="mt-2 min-h-10 text-sm leading-6 text-(--muted)">
                                    {card.description}
                                </p>

                                <div className="mt-5 border-t border-(--border) pt-4">
                                    <Link
                                        href={card.href}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-(--border) px-4 py-3 text-sm font-semibold transition hover:border-(--accent) hover:bg-(--accent) hover:text-(--accent-foreground)"
                                    >
                                        {card.label}
                                        <span>→</span>
                                    </Link>
                                </div>
                            </section>
                        ))}
                    </div>

                    <section className="mt-8 rounded-2xl border border-(--border) bg-(--surface) p-6 md:p-8">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h2 className="text-lg font-bold">Ready to contribute?</h2>
                                <p className="mt-2 text-sm text-(--muted)">
                                    Share a useful API with the APICosmos community.
                                </p>
                            </div>

                            <Link
                                href="/submit"
                                className="inline-flex items-center justify-center rounded-xl border border-(--accent) px-5 py-3 text-sm font-bold transition hover:bg-(--accent) hover:text-(--accent-foreground)"
                            >
                                Submit an API ↗
                            </Link>
                        </div>
                    </section>

                    <p className="mt-8 text-center text-xs text-(--muted)">
                        APICosmos Dashboard · Your developer workspace
                    </p>
                </div>
            </main>
        </>
    );
}
