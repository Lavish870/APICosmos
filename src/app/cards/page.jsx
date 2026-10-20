
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import LiquidNavbar from "@/components/LiquidNavbar";

export default function CardsPage() {
  const searchParams = useSearchParams();
  const [api, setApi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const apiName = searchParams.get("name");

    if (!apiName) {
      setApi(null);
      setError("Please select an API from Explore.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchApi() {
      try {
        setLoading(true);
        setError("");
        setApi(null);

        const response = await fetch(
          `http://localhost:5000/api/apis/name/${encodeURIComponent(apiName)}`
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch API details.");
        }

        if (!cancelled) {
          setApi(result.data);
        }
      } catch (err) {
        console.error("Error fetching API details:", err);

        if (!cancelled) {
          setApi(null);
          setError("API details load nahi ho paayi. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchApi();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground)">
      <LiquidNavbar />

      <main className="mx-auto w-full max-w-5xl px-5 pb-16 pt-10 sm:px-8 lg:px-12">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-sm text-(--muted) transition hover:text-(--accent)"
        >
          <span aria-hidden="true">←</span> Back to Explore
        </Link>

        {loading ? (
          <div className="mt-8 rounded-2xl border border-(--border) bg-(--surface) px-5 py-16 text-center">
            <p className="text-sm text-(--muted)">
              Loading API details...
            </p>
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-(--border) bg-(--surface) px-5 py-16 text-center">
            <h1 className="text-2xl font-bold">Unable to load API</h1>

            <p className="mt-3 text-sm leading-6 text-(--muted)">
              {error}
            </p>

            <Link
              href="/explore"
              className="mt-6 inline-flex rounded-lg bg-(--accent) px-5 py-3 text-sm font-semibold text-(--accent-foreground)"
            >
              Back to Explore
            </Link>
          </div>
        ) : api ? (
          <div className="mt-8 rounded-2xl border border-(--border) bg-(--surface) p-6 sm:p-9">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="mb-3 text-xs font-bold tracking-[0.2em] text-(--muted)">
                  API DETAILS
                </p>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {api.name}
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-(--muted) sm:text-base">
                  {api.description}
                </p>
              </div>

              <span className="rounded-full border border-(--border) px-4 py-2 text-sm text-(--accent)">
                {api.pricing}
              </span>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-(--border) bg-(--background) p-4">
                <p className="text-xs text-(--muted)">Category</p>
                <p className="mt-2 font-semibold">{api.category}</p>
              </div>

              <div className="rounded-xl border border-(--border) bg-(--background) p-4">
                <p className="text-xs text-(--muted)">Authentication</p>
                <p className="mt-2 font-semibold">{api.auth}</p>
              </div>

              <div className="rounded-xl border border-(--border) bg-(--background) p-4">
                <p className="text-xs text-(--muted)">Pricing model</p>
                <p className="mt-2 font-semibold">{api.pricing}</p>
              </div>

              <div className="rounded-xl border border-(--border) bg-(--background) p-4">
                <p className="text-xs text-(--muted)">Official website</p>

                {api.website ? (
                  <a
                    href={api.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block break-all font-semibold text-(--accent) hover:opacity-75"
                  >
                    Visit website ↗
                  </a>
                ) : (
                  <p className="mt-2 text-sm text-(--muted)">
                    Website not available
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {api.url && (
                <a
                  href={api.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-(--accent) px-5 py-3 text-sm font-semibold text-(--accent-foreground) transition hover:opacity-85"
                >
                  Read Documentation ↗
                </a>
              )}

              <Link
                href="/explore"
                className="rounded-lg border border-(--border) px-5 py-3 text-sm font-semibold transition hover:bg-(--surface-secondary)"
              >
                Explore more APIs
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-(--border) bg-(--surface) px-5 py-16 text-center">
            <h1 className="text-2xl font-bold">API not found</h1>

            <p className="mt-3 text-sm leading-6 text-(--muted)">
              This API could not be found. Explore the available APIs and try again.
            </p>

            <Link
              href="/explore"
              className="mt-6 inline-flex rounded-lg bg-(--accent) px-5 py-3 text-sm font-semibold text-(--accent-foreground)"
            >
              Explore APIs
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
