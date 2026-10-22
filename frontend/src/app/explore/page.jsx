"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import LiquidNavbar from "@/components/LiquidNavbar";
import Link from "next/link";

const categories = [
    "All Categories",
    "AI & Machine Learning",
    "Weather",
    "Finance",
    "Maps & Location",
    "Social Media",
    "Entertainment",
    "Development Tools",
    "Communication",
    "Other",
];

const sampleApis = [
    {
        name: "OpenAI API",
        description: "Build AI-powered applications using language models and intelligent tools.",
        category: "AI & Machine Learning",
        auth: "API Key",
        pricing: "Freemium",
        url: "https://platform.openai.com/docs",
        color: "AI",
    },
    {
        name: "Open-Meteo",
        description: "Get weather forecasts and historical weather data for locations worldwide.",
        category: "Weather",
        auth: "No Auth",
        pricing: "Free",
        url: "https://open-meteo.com/en/docs",
        color: "WE",
    },
    {
        name: "ExchangeRate API",
        description: "Retrieve currency exchange rates for financial applications.",
        category: "Finance",
        auth: "API Key",
        pricing: "Freemium",
        url: "https://www.exchangerate-api.com/",
        color: "FX",
    },
    {
        name: "REST Countries",
        description: "Access country information including population, region, and currencies.",
        category: "Other",
        auth: "No Auth",
        pricing: "Free",
        url: "https://restcountries.com/",
        color: "RC",
    },
    {
        name: "OpenStreetMap",
        description: "Explore open geographic data for mapping and location-based projects.",
        category: "Maps & Location",
        auth: "Varies",
        pricing: "Free",
        url: "https://www.openstreetmap.org/",
        color: "OS",
    },
    {
        name: "JSONPlaceholder",
        description: "Use a fake REST API to practise and test your frontend applications.",
        category: "Development Tools",
        auth: "No Auth",
        pricing: "Free",
        url: "https://jsonplaceholder.typicode.com/",
        color: "JS",
    },
    {
        name: "TMDB API",
        description: "Discover movie, television, and entertainment information.",
        category: "Entertainment",
        auth: "API Key",
        pricing: "Free tier",
        url: "https://developer.themoviedb.org/docs",
        color: "TM",
    },
    {
        name: "Discord API",
        description: "Integrate applications and bots with Discord services.",
        category: "Communication",
        auth: "OAuth / Token",
        pricing: "Free",
        url: "https://discord.com/developers/docs/intro",
        color: "DC",
    },
    {
        name: "GitHub REST API",
        description: "Access repositories, users, issues, and developer activity.",
        category: "Development Tools",
        auth: "Token",
        pricing: "Free tier",
        url: "https://docs.github.com/en/rest",
        color: "GH",
    },
];

function ExploreContent() {
    const searchParams = useSearchParams();
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All Categories");
    const [apis, setApis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [savedApis, setSavedApis] = useState([]);
    const [savedReady, setSavedReady] = useState(false);

    useEffect(() => {
        try {
            const saved = JSON.parse(
                localStorage.getItem("apicosmos-saved-apis") || "[]"
            );

            setSavedApis(Array.isArray(saved) ? saved : []);
        } catch {
            setSavedApis([]);
        }

        setSavedReady(true);
    }, []);

    function toggleSavedApi(api) {
        const alreadySaved = savedApis.some(
            (item) => item.name === api.name
        );

        const updated = alreadySaved
            ? savedApis.filter((item) => item.name !== api.name)
            : [...savedApis, api];

        setSavedApis(updated);
        localStorage.setItem(
            "apicosmos-saved-apis",
            JSON.stringify(updated)
        );
    }

    useEffect(() => {
        async function fetchApis() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch("http://localhost:5000/api/apis");

                if (!response.ok) {
                    throw new Error("Failed to fetch APIs");
                }

                const result = await response.json();

                setApis(result.data);
            } catch (err) {
                console.error("Error fetching APIs:", err);
                setError("APIs load nahi ho paayi. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        fetchApis();
    }, []);

    useEffect(() => {
        setSearch(searchParams.get("search") || "");

        const requestedCategory = searchParams.get("category");

        if (requestedCategory && categories.includes(requestedCategory)) {
            setCategory(requestedCategory);
        } else {
            setCategory("All Categories");
        }
    }, [searchParams]);

    const filteredApis = useMemo(() => {
        const query = search.trim().toLowerCase();

        return apis.filter((api) => {
            const matchesSearch =
                api.name.toLowerCase().includes(query) ||
                api.description.toLowerCase().includes(query) ||
                api.category.toLowerCase().includes(query);

            const matchesCategory =
                category === "All Categories" || api.category === category;

            return matchesSearch && matchesCategory;
        });
    }, [apis, search, category]);

    return (
        <div className="min-h-screen bg-(--background) text-(--foreground)">
            <LiquidNavbar />

            <main className="mx-auto w-full max-w-7xl px-5 pb-16 pt-10 sm:px-8 lg:px-12">
                <div className="mb-9">
                    <p className="mb-3 text-xs font-bold tracking-[0.2em] text-(--muted)">
                        YOUR API DISCOVERY HUB
                    </p>

                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                        Explore <span className="text-(--accent)">APIs.</span>
                    </h1>

                    <p className="mt-4 max-w-2xl text-sm leading-7 text-(--muted) sm:text-base">
                        Discover useful APIs for your next project. Search, filter, and
                        find the right tools for your ideas.
                    </p>
                </div>

                <div className="mb-8 flex flex-col gap-4 md:flex-row">
                    <div className="flex flex-1 items-center gap-3 rounded-xl border border-(--border) bg-(--surface) px-4 py-3">
                        <span className="text-lg text-(--muted)" aria-hidden="true">
                            ⌕
                        </span>

                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search APIs by name or keyword..."
                            aria-label="Search APIs"
                            className="w-full bg-transparent text-sm outline-none placeholder:text-(--muted)"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="text-xs text-(--muted) hover:text-(--foreground)"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <select
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        aria-label="Filter APIs by category"
                        className="rounded-xl border border-(--border) bg-(--surface) px-4 py-3 text-sm text-(--foreground) outline-none focus:border-(--accent)"
                    >
                        {categories.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-5 flex items-center justify-between gap-3">
                    <p className="text-sm text-(--muted)">
                        <span className="font-semibold text-(--foreground)">
                            {filteredApis.length}
                        </span>{" "}
                        {filteredApis.length === 1 ? "API" : "APIs"} found
                    </p>

                    {(search || category !== "All Categories") && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch("");
                                setCategory("All Categories");
                            }}
                            className="text-sm font-medium text-(--accent) hover:opacity-75"
                        >
                            Reset filters
                        </button>
                    )}
                </div>


                {loading ? (
                    <div className="rounded-2xl border border-(--border) bg-(--surface) px-5 py-16 text-center">
                        <p className="text-sm text-(--muted)">
                            Loading APIs...
                        </p>
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-(--border) bg-(--surface) px-5 py-16 text-center">
                        <h2 className="text-lg font-semibold">
                            Could not load APIs
                        </h2>

                        <p className="mt-2 text-sm text-(--muted)">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="mt-5 rounded-lg bg-(--accent) px-4 py-2.5 text-sm font-semibold text-(--accent-foreground)"
                        >
                            Try again
                        </button>
                    </div>
                ) : filteredApis.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

                        {filteredApis.map((api) => {
                            const isSaved = savedApis.some(
                                (item) => item.name === api.name
                            );

                            return (
                                <div
                                    key={api.name}
                                    className="flex min-h-64 flex-col rounded-2xl border border-(--border) bg-(--surface) p-5 transition duration-200 hover:-translate-y-1 hover:border-(--accent)"
                                >
                                    <div className="mb-5 flex items-start justify-between gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-(--border) bg-(--background) text-sm font-bold text-(--accent)">
                                            {api.color}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="rounded-full border border-(--border) px-3 py-1 text-xs text-(--muted)">
                                                {api.pricing}
                                            </span>

                                            <button
                                                type="button"
                                                disabled={!savedReady}
                                                onClick={() => toggleSavedApi(api)}
                                                aria-label={isSaved ? "Remove saved API" : "Save API"}
                                                title={isSaved ? "Remove from saved APIs" : "Save API"}
                                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${isSaved
                                                        ? "border-(--accent) bg-(--accent)/10 text-(--accent)"
                                                        : "border-(--border) bg-(--background) text-(--muted) hover:border-(--accent) hover:text-(--accent)"
                                                    }`}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="18"
                                                    height="18"
                                                    viewBox="0 0 24 24"
                                                    fill={isSaved ? "currentColor" : "none"}
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-4-6 4z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/cards?name=${encodeURIComponent(api.name)}`}
                                        className="flex flex-1 flex-col"
                                    >
                                        <h2 className="text-lg font-semibold">
                                            {api.name}
                                        </h2>

                                        <p className="mt-2 flex-1 text-sm leading-6 text-(--muted)">
                                            {api.description}
                                        </p>

                                        <div className="mt-5 flex flex-wrap gap-2">
                                            <span className="rounded-md bg-(--background) px-2.5 py-1 text-xs text-(--muted)">
                                                {api.category}
                                            </span>

                                            <span className="rounded-md bg-(--background) px-2.5 py-1 text-xs text-(--muted)">
                                                {api.auth}
                                            </span>
                                        </div>

                                        <div className="mt-5 border-t border-(--border) pt-4">
                                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-(--accent)">
                                                View documentation <span aria-hidden="true">↗</span>
                                            </span>
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}

                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-(--border) px-5 py-16 text-center">
                        <h2 className="text-lg font-semibold">
                            No APIs found
                        </h2>

                        <p className="mt-2 text-sm text-(--muted)">
                            Try another keyword or choose a different category.
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                setSearch("");
                                setCategory("All Categories");
                            }}
                            className="mt-5 rounded-lg bg-(--accent) px-4 py-2.5 text-sm font-semibold text-(--accent-foreground)"
                        >
                            Clear filters
                        </button>
                    </div>
                )}

            </main>
        </div>
    );
}

export default function ExplorePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    Loading Explore...
                </div>
            }
        >
            <ExploreContent />
        </Suspense>
    );
}
