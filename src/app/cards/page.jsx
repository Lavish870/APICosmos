
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

  const isSaved = savedApis.some(
    (item) => item.name === api?.name
  );

  function toggleSavedApi() {
    if (!api) return;

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
          throw new Error(
            result.message || "Failed to fetch API details."
          );
        }

        if (!cancelled) {
          setApi(result.data);

          try {
            const history = JSON.parse(
              localStorage.getItem("apicosmos-view-history") || "[]"
            );

            const previousHistory = Array.isArray(history) ? history : [];

            const updatedHistory = [
              result.data,
              ...previousHistory.filter(
                (item) => item.name !== result.data.name
              ),
            ].slice(0, 10);

            localStorage.setItem(
              "apicosmos-view-history",
              JSON.stringify(updatedHistory)
            );
          } catch (historyError) {
            console.error("Could not save viewing history:", historyError);
          }
        }
      } catch (err) {
        console.error("Error fetching API details:", err);

        if (!cancelled) {
          setApi(null);
          setError(
            "API details load nahi ho paayi. Please try again."
          );
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
            <h1 className="text-2xl font-bold">
              Unable to load API
            </h1>

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
            {/* API heading and actions */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
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

              {/* Pricing and bookmark stay together on the right */}
              <div className="flex shrink-0 items-center gap-2">
                <span className="whitespace-nowrap rounded-full border border-(--border) px-3 py-2 text-xs text-(--accent) sm:px-4 sm:text-sm">
                  {api.pricing}
                </span>

                <button
                  type="button"
                  disabled={!savedReady}
                  onClick={toggleSavedApi}
                  title={isSaved ? "Remove from saved APIs" : "Save API"}
                  aria-label={isSaved ? "Unsave API" : "Save API"}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-200 sm:h-11 sm:w-11 ${isSaved
                    ? "border-(--accent) bg-(--accent)/10 text-(--accent)"
                    : "border-(--border) bg-(--background) text-(--muted) hover:border-(--accent) hover:text-(--accent)"
                    } disabled:opacity-50`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
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
