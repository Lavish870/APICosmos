
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LiquidNavbar from "@/components/LiquidNavbar";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("apicosmos-user");

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Unable to load profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <>
        <LiquidNavbar />
        <main className="min-h-screen bg-(--background) text-(--foreground) p-8">
          Loading profile...
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <LiquidNavbar />
        <main className="min-h-screen bg-(--background) text-(--foreground) flex flex-col items-center justify-center px-5 text-center">
          <div className="rounded-2xl border border-(--border) bg-(--surface) p-8 max-w-md w-full">
            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-(--surface-secondary) text-3xl">
              👤
            </div>
            <h1 className="text-2xl font-bold mb-2">
              Login required
            </h1>
            <p className="text-(--muted) mb-6">
              Please log in to view your APICosmos profile.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-(--accent) px-6 py-3 font-semibold text-(--accent-foreground)"
            >
              Sign in / Create account
            </Link>
          </div>
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

      <main className="min-h-screen bg-(--background) text-(--foreground) px-5 py-10 md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-(--accent)">
              APICosmos / Account
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              My Profile
            </h1>
            <p className="mt-3 text-(--muted)">
              Manage your account and explore your developer space.
            </p>
          </div>

          <section className="overflow-hidden rounded-3xl border border-(--border) bg-(--surface)">
            <div className="h-2 bg-(--accent)" />

            <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:p-9">
              <div className="grid size-24 shrink-0 place-items-center rounded-3xl bg-(--accent) text-4xl font-extrabold text-(--accent-foreground) shadow-lg">
                {initial}
              </div>

              <div className="min-w-0 flex-1">
                <p className="mb-2 text-sm text-(--muted)">
                  APICosmos member
                </p>
                <h2 className="break-words text-2xl font-bold md:text-3xl">
                  {user.name || "Developer"}
                </h2>
                <p className="mt-2 break-all text-(--muted)">
                  {user.email}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface-secondary) px-3 py-1.5 text-xs font-semibold">
                  <span className="size-2 rounded-full bg-(--accent)" />
                  Account active
                </div>
              </div>

              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--accent) px-5 py-3 text-sm font-bold text-(--accent-foreground) transition hover:opacity-85"
              >
                My Dashboard <span>↗</span>
              </Link>
            </div>
          </section>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <section className="rounded-2xl border border-(--border) bg-(--surface) p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-(--surface-secondary) text-xl">
                  👤
                </div>
                <div>
                  <h3 className="font-bold">Personal information</h3>
                  <p className="text-sm text-(--muted)">
                    Your account details
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-(--muted)">
                    Full name
                  </p>
                  <p className="break-words font-medium">
                    {user.name || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-(--muted)">
                    Email address
                  </p>
                  <p className="break-all font-medium">
                    {user.email || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-(--muted)">
                    Account ID
                  </p>
                  <p className="break-all font-mono text-sm text-(--muted)">
                    {user.id || user._id || "Unavailable"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-(--border) bg-(--surface) p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-(--surface-secondary) text-xl">
                  🚀
                </div>
                <div>
                  <h3 className="font-bold">Your workspace</h3>
                  <p className="text-sm text-(--muted)">
                    Shortcuts for your account
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/dashboard"
                  className="flex items-center justify-between rounded-xl border border-(--border) p-4 transition hover:border-(--accent)"
                >
                  <span className="font-medium">My Dashboard</span>
                  <span className="text-(--accent)">↗</span>
                </Link>

                <Link
                  href="/saved"
                  className="flex items-center justify-between rounded-xl border border-(--border) p-4 transition hover:border-(--accent)"
                >
                  <span className="font-medium">Saved APIs</span>
                  <span className="text-(--accent)">↗</span>
                </Link>

                <Link
                  href="/history"
                  className="flex items-center justify-between rounded-xl border border-(--border) p-4 transition hover:border-(--accent)"
                >
                  <span className="font-medium">Recently viewed</span>
                  <span className="text-(--accent)">↗</span>
                </Link>
              </div>
            </section>
          </div>

          <p className="mt-6 text-center text-sm text-(--muted)">
            More profile settings will be available as your workspace grows.
          </p>
        </div>
      </main>
    </>
  );
}
