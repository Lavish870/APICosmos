"use client";

import { useState } from "react";
import Link from "next/link";
import LiquidNavbar from "@/components/LiquidNavbar";

export default function Home() {
  const [search, setSearch] = useState("");

  function handleSearch(event) {
    event.preventDefault();

    const query = search.trim();
    const destination = query
      ? `/explore?search=${encodeURIComponent(query)}`
      : "/explore";

    window.location.href = destination;
  }

  return (
    <div className="min-h-screen overflow-hidden bg-(--background) text-(--foreground)">
      <LiquidNavbar />

      <main className="mx-auto flex min-h-[calc(100svh-100px)] max-w-350 items-center px-5 py-7 sm:px-8 lg:px-12 lg:py-8">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <section className="mx-auto w-full max-w-2xl lg:mx-0">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-3 py-1.5 text-xs font-medium tracking-wide text-(--muted)">
              <span className="h-2 w-2 rounded-full bg-(--accent)" />
              YOUR UNIVERSE OF APIS
            </div>

            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              Find the API.
              <br />
              <span className="text-(--muted)">Build the future.</span>
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-6 text-(--muted) sm:text-base sm:leading-7">
              Discover APIs for your next project, explore useful developer
              tools, and bring your ideas to life.
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-7 flex max-w-xl items-center gap-2 rounded-xl border border-(--border) bg-(--surface) p-2 shadow-sm"
            >
              <svg
                viewBox="0 0 24 24"
                width="21"
                height="21"
                fill="none"
                stroke="var(--muted)"
                strokeWidth="1.8"
                className="ml-2 shrink-0"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m16 16 4 4" />
              </svg>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search APIs..."
                aria-label="Search APIs"
                className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-(--muted)"
              />

              <button
                type="submit"
                className="shrink-0 rounded-lg bg-(--accent) px-3 py-2.5 text-sm font-semibold text-(--accent-foreground) transition hover:opacity-85 sm:px-5"
              >
                Search
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                 href="/explore"
                 className="inline-flex items-center gap-2 rounded-lg border border-(--foreground) bg-(--foreground) px-5 py-3 text-sm font-semibold text-(--background)! transition hover:opacity-85"
                >
                 Explore APIs
                <span aria-hidden="true">→</span>
                </Link>

              <Link
                href="/categories"
                className="rounded-lg border border-(--border) px-5 py-3 text-sm font-semibold transition hover:bg-(--surface-secondary)"
              >
                Browse categories
              </Link>
            </div>
          </section>

          {/* Decorative hero illustration */}
          <div className="relative mx-auto flex w-full max-w-110 items-center justify-center lg:max-w-none">
            <div className="relative aspect-square w-full max-w-97.5">
              <div className="absolute inset-[10%] rounded-full border border-(--border)" />
              <div className="absolute inset-[20%] rounded-full border border-dashed border-(--border)" />
              <div className="absolute inset-[30%] rounded-full border border-(--border)" />

              <div className="absolute inset-[20%] rotate-[-35deg] rounded-[50%] border-2 border-(--accent)" />
              <div className="absolute inset-[20%] rotate-35 rounded-[50%] border border-(--muted)" />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-(--border) bg-(--surface) shadow-xl sm:h-28 sm:w-28">
                  <svg
                    viewBox="0 0 80 80"
                    className="h-16 w-16 sm:h-20 sm:w-20"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle cx="40" cy="40" r="9" fill="var(--accent)" />
                    <ellipse
                      cx="40"
                      cy="40"
                      rx="34"
                      ry="14"
                      stroke="currentColor"
                      strokeWidth="2"
                      transform="rotate(-35 40 40)"
                    />
                    <ellipse
                      cx="40"
                      cy="40"
                      rx="34"
                      ry="14"
                      stroke="currentColor"
                      strokeWidth="2"
                      transform="rotate(35 40 40)"
                    />
                  </svg>
                </div>
              </div>

              <div className="absolute left-[4%] top-[23%] rounded-xl border border-(--border) bg-(--surface) px-3 py-2 shadow-lg">
                <span className="block text-[10px] text-(--muted)">DISCOVER</span>
                <span className="text-xs font-semibold">REST APIs</span>
              </div>

              <div className="absolute right-0 top-[37%] rounded-xl border border-(--border) bg-(--surface) px-3 py-2 shadow-lg">
                <span className="block text-[10px] text-(--muted)">CONNECT</span>
                <span className="text-xs font-semibold">Your next idea</span>
              </div>

              <div className="absolute bottom-[16%] left-[19%] rounded-xl border border-(--border) bg-(--surface) px-3 py-2 shadow-lg">
                <span className="block text-[10px] text-(--muted)">BUILD</span>
                <span className="text-xs font-semibold">Something great</span>
              </div>

              <span className="absolute left-[49%] top-[7%] h-2.5 w-2.5 rounded-full bg-(--accent)" />
              <span className="absolute bottom-[24%] right-[13%] h-2 w-2 rounded-full bg-(--muted)" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
