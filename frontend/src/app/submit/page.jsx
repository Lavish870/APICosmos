
"use client";

import { useState } from "react";
import Link from "next/link";
import LiquidNavbar from "@/components/LiquidNavbar";

const initialForm = {
  name: "",
  description: "",
  category: "",
  auth: "",
  pricing: "",
  url: "",
};

const categories = [
  "AI & Machine Learning",
  "Weather",
  "Finance",
  "News",
  "Maps & Location",
  "Social",
  "Entertainment",
  "Development",
  "Education",
  "Other",
];

const fieldClass =
  "w-full rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-sm text-(--foreground) outline-none transition placeholder:text-(--muted) focus:border-(--accent)";

const labelClass =
  "mb-2 block text-sm font-semibold text-(--foreground)";

export default function SubmitPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    const token = localStorage.getItem("apicosmos-token");

    if (!token) {
      setMessage("Please log in before submitting your API.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/apis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Could not submit the API.");
      }

      setMessage(
        "Your API has been submitted successfully and is awaiting admin review."
      );
      setMessageType("success");
      setForm(initialForm);
    } catch (error) {
      setMessage(
        error.message || "Something went wrong. Please try again."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <LiquidNavbar />

      <main className="min-h-screen bg-(--background) px-5 py-10 text-(--foreground) md:px-10">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/dashboard"
            className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-(--muted) transition hover:text-(--accent)"
          >
            <span>←</span> Back to Dashboard
          </Link>

          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-(--accent)">
              APICosmos / Community
            </p>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Submit Your API
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-(--muted)">
              Have a useful API to share? Add its details below and contribute
              to the APICosmos developer community.
            </p>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[1fr_280px]">
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-(--border) bg-(--surface) p-5 md:p-8"
            >
              <div className="mb-7 border-b border-(--border) pb-5">
                <h2 className="text-xl font-bold">API Information</h2>
                <p className="mt-2 text-sm text-(--muted)">
                  Fields marked with * are required.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className={labelClass}>
                    API Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={fieldClass}
                    placeholder="e.g. OpenWeather API"
                    required
                    maxLength={100}
                  />
                </div>

                <div>
                  <label htmlFor="description" className={labelClass}>
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className={`${fieldClass} min-h-32 resize-y`}
                    placeholder="Describe what the API does and how developers can use it..."
                    required
                    maxLength={2000}
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="category" className={labelClass}>
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className={fieldClass}
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="auth" className={labelClass}>
                      Authentication *
                    </label>
                    <select
                      id="auth"
                      name="auth"
                      value={form.auth}
                      onChange={handleChange}
                      className={fieldClass}
                      required
                    >
                      <option value="">Select authentication</option>
                      <option value="None">None</option>
                      <option value="API Key">API Key</option>
                      <option value="OAuth">OAuth</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="pricing" className={labelClass}>
                    Pricing *
                  </label>
                  <select
                    id="pricing"
                    name="pricing"
                    value={form.pricing}
                    onChange={handleChange}
                    className={fieldClass}
                    required
                  >
                    <option value="">Select pricing</option>
                    <option value="Free">Free</option>
                    <option value="Freemium">Freemium</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="url" className={labelClass}>
                    API Website / Documentation URL *
                  </label>
                  <input
                    id="url"
                    name="url"
                    type="url"
                    value={form.url}
                    onChange={handleChange}
                    className={fieldClass}
                    placeholder="https://example.com/docs"
                    required
                    maxLength={2048}
                  />
                  <p className="mt-2 text-xs text-(--muted)">
                    Enter the public website or documentation link for the API.
                  </p>
                </div>
              </div>

              {message && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`mt-6 rounded-xl border p-4 text-sm ${messageType === "success"
                      ? "border-green-500/40 bg-green-500/10 text-green-600"
                      : "border-red-500/40 bg-red-500/10 text-red-500"
                    }`}
                >
                  {message}

                  {messageType === "error" &&
                    message.toLowerCase().includes("log in") && (
                      <Link
                        href="/login"
                        className="ml-2 font-semibold underline"
                      >
                        Login
                      </Link>
                    )}
                </div>
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-(--border) pt-6 sm:flex-row sm:justify-end">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-xl border border-(--border) px-5 py-3 text-sm font-semibold transition hover:border-(--accent)"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--accent) px-6 py-3 text-sm font-bold text-(--accent-foreground) transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Submitting..." : "Submit for Review →"}
                </button>
              </div>
            </form>

            <aside className="space-y-5">
              <section className="rounded-2xl border border-(--border) bg-(--surface) p-5">
                <div className="mb-4 grid size-12 place-items-center rounded-xl bg-(--surface-secondary) text-2xl text-(--accent)">
                  ↗
                </div>
                <h2 className="font-bold">Submission Guidelines</h2>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-(--muted)">
                  <li>• Provide an accurate API name and description.</li>
                  <li>• Choose the correct category and pricing.</li>
                  <li>• Add a valid public documentation URL.</li>
                  <li>• Submit only APIs you are allowed to share.</li>
                </ul>
              </section>

              <section className="rounded-2xl border border-(--border) bg-(--surface) p-5">
                <div className="mb-3 text-2xl text-(--accent)">◷</div>
                <h2 className="font-bold">What happens next?</h2>
                <p className="mt-2 text-sm leading-6 text-(--muted)">
                  Your submission will enter the pending review queue. Once an
                  admin reviews it, its status can be updated.
                </p>
              </section>
            </aside>
          </div>

          <p className="mt-8 text-center text-xs text-(--muted)">
            APICosmos · Share APIs. Build Together.
          </p>
        </div>
      </main>
    </>
  );
}
