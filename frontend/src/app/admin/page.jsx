
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import LiquidNavbar from "@/components/LiquidNavbar";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/admin`;

const tabs = [
    { id: "overview", label: "Overview", icon: "▦" },
    { id: "apis", label: "API Management", icon: "⌘" },
    { id: "users", label: "Users", icon: "♙" },
];

const initialStats = {
    totalApis: 0,
    pendingApis: 0,
    approvedApis: 0,
    rejectedApis: 0,
    totalUsers: 0,
    categories: [],
    recentApis: [],
};

const cardStyle =
    "rounded-2xl border border-(--border) bg-(--surface) p-5";

function formatDate(date) {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function StatusBadge({ status }) {
    const styles = {
        pending:
            "bg-amber-500/10 text-amber-600",
        approved:
            "bg-emerald-500/10 text-emerald-600",
        rejected:
            "bg-red-500/10 text-red-600",
    };

    const normalized = (status || "pending").toLowerCase();

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[normalized] || "bg-(--surface-secondary) text-(--muted)"
                }`}
        >
            {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
        </span>
    );
}

function MetricCard({ title, value, icon, description }) {
    return (
        <section className={cardStyle}>
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm text-(--muted)">{title}</p>
                    <p className="mt-3 text-3xl font-extrabold tracking-tight">
                        {value ?? 0}
                    </p>
                </div>

                <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-(--surface-secondary) text-2xl text-(--accent)">
                    {icon}
                </div>
            </div>

            <p className="mt-4 text-xs text-(--muted)">{description}</p>
        </section>
    );
}

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState("overview");
    const [user, setUser] = useState(null);
    const [authState, setAuthState] = useState("checking");
    const [stats, setStats] = useState(initialStats);
    const [apis, setApis] = useState([]);
    const [users, setUsers] = useState([]);
    const [apiFilter, setApiFilter] = useState("pending");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState("");

    const request = useCallback(async (path, options = {}) => {
        const token = localStorage.getItem("apicosmos-token");

        if (!token) {
            throw new Error("Your session has expired. Please log in again.");
        }

        const response = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers: {
                Authorization: `Bearer ${token}`,
                ...(options.body ? { "Content-Type": "application/json" } : {}),
                ...options.headers,
            },
        });

        const result = await response.json().catch(() => ({}));

        if (response.status === 401 || response.status === 403) {
            throw new Error(
                response.status === 403
                    ? "Admin access required. Please sign in with your admin account."
                    : "Your session has expired. Please log in again."
            );
        }

        if (!response.ok || result.success === false) {
            throw new Error(result.message || "The request could not be completed.");
        }

        return result;
    }, []);

    const loadStats = useCallback(async () => {
        const result = await request("/stats");
        setStats({ ...initialStats, ...(result.data || {}) });
    }, [request]);

    const loadApis = useCallback(async (status) => {
        const result = await request(
            `/apis?status=${encodeURIComponent(status)}`
        );

        setApis(Array.isArray(result.data) ? result.data : []);
    }, [request]);

    const loadUsers = useCallback(async () => {
        const result = await request("/users");
        setUsers(Array.isArray(result.data) ? result.data : []);
    }, [request]);

    const refreshCurrentTab = useCallback(async () => {
        setError("");

        try {
            if (activeTab === "overview") {
                await loadStats();
            } else if (activeTab === "apis") {
                await loadApis(apiFilter);
            } else {
                await loadUsers();
            }
        } catch (err) {
            setError(err.message || "Unable to refresh the dashboard.");
        }
    }, [activeTab, apiFilter, loadStats, loadApis, loadUsers]);

    useEffect(() => {
        let cancelled = false;

        async function initialize() {
            try {
                const token = localStorage.getItem("apicosmos-token");
                const savedUser = localStorage.getItem("apicosmos-user");

                if (!token) {
                    if (!cancelled) setAuthState("login");
                    return;
                }

                if (savedUser && !cancelled) {
                    try {
                        setUser(JSON.parse(savedUser));
                    } catch {
                        setUser(null);
                    }
                }

                // The backend decides whether this account is actually an admin.
                const result = await request("/stats");

                if (cancelled) return;

                setStats({ ...initialStats, ...(result.data || {}) });
                setAuthState("admin");
            } catch (err) {
                if (cancelled) return;

                const isAccessError =
                    err.message.toLowerCase().includes("admin access") ||
                    err.message.toLowerCase().includes("session has expired");

                setError(err.message);
                setAuthState(isAccessError ? "denied" : "error");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        initialize();

        return () => {
            cancelled = true;
        };
    }, [request]);

    useEffect(() => {
        if (authState !== "admin") return;

        if (activeTab === "apis") {
            loadApis(apiFilter).catch((err) => setError(err.message));
        } else if (activeTab === "users") {
            loadUsers().catch((err) => setError(err.message));
        }
    }, [activeTab, apiFilter, authState, loadApis, loadUsers]);

    async function changeStatus(apiId, status) {
        const confirmed = window.confirm(
            `Are you sure you want to ${status} this API?`
        );

        if (!confirmed) return;

        setBusyId(apiId);
        setError("");
        setMessage("");

        try {
            await request(`/apis/${apiId}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            });

            setMessage(`API ${status} successfully.`);
            await Promise.all([loadStats(), loadApis(apiFilter)]);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId("");
        }
    }

    async function deleteApi(api) {
        const confirmed = window.confirm(
            `Delete "${api.name}" permanently? This action cannot be undone.`
        );

        if (!confirmed) return;

        setBusyId(api._id);
        setError("");
        setMessage("");

        try {
            await request(`/apis/${api._id}`, { method: "DELETE" });

            setMessage("API deleted successfully.");
            await Promise.all([loadStats(), loadApis(apiFilter)]);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId("");
        }
    }

    if (loading || authState === "checking") {
        return (
            <>
                <LiquidNavbar />
                <main className="grid min-h-screen place-items-center bg-(--background) p-6 text-(--foreground)">
                    <p className="text-(--muted)">Loading admin workspace...</p>
                </main>
            </>
        );
    }

    if (authState !== "admin") {
        return (
            <>
                <LiquidNavbar />
                <main className="grid min-h-screen place-items-center bg-(--background) px-5 py-10 text-(--foreground)">
                    <section className="w-full max-w-md rounded-3xl border border-(--border) bg-(--surface) p-8 text-center">
                        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-(--surface-secondary) text-2xl">
                            🔐
                        </div>

                        <h1 className="mt-5 text-2xl font-bold">
                            {authState === "login"
                                ? "Login required"
                                : authState === "denied"
                                    ? "Admin access required"
                                    : "Could not load admin dashboard"}
                        </h1>

                        <p className="my-4 text-sm leading-6 text-(--muted)">
                            {error ||
                                "Please sign in with an account that has administrator permissions."}
                        </p>

                        <div className="flex flex-wrap justify-center gap-3">
                            <Link
                                href="/signup"
                                className="rounded-xl bg-(--accent) px-5 py-3 font-semibold text-(--accent-foreground)"
                            >
                                Go to Login
                            </Link>

                            <Link
                                href="/dashboard"
                                className="rounded-xl border border-(--border) px-5 py-3 font-semibold"
                            >
                                User Dashboard
                            </Link>

                            {authState === "error" && (
                                <button
                                    onClick={() => window.location.reload()}
                                    className="rounded-xl border border-(--border) px-5 py-3 font-semibold"
                                >
                                    Try Again
                                </button>
                            )}
                        </div>
                    </section>
                </main>
            </>
        );
    }

    const categories = Array.isArray(stats.categories)
        ? stats.categories
        : [];

    const recentApis = Array.isArray(stats.recentApis)
        ? stats.recentApis
        : [];

    return (
        <>
            <LiquidNavbar />

            <main className="min-h-screen bg-(--background) px-4 py-8 text-(--foreground) sm:px-6 md:px-10">
                <div className="mx-auto max-w-7xl">
                    <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                        <div>
                            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-(--accent)">
                                APICosmos / Administration
                            </p>

                            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                                Admin Workspace
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-6 text-(--muted)">
                                Manage API submissions, review community contributions, and
                                keep an eye on your platform.
                            </p>

                            <p className="mt-2 text-sm text-(--muted)">
                                Signed in as {user?.name || user?.email || "Administrator"}
                            </p>
                        </div>

                        <button
                            onClick={refreshCurrentTab}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-(--border) px-5 py-3 text-sm font-semibold transition hover:border-(--accent)"
                        >
                            ↻ Refresh data
                        </button>
                    </header>

                    <nav className="mb-7 flex gap-2 overflow-x-auto rounded-2xl border border-(--border) bg-(--surface) p-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setMessage("");
                                    setError("");
                                }}
                                className={`shrink-0 rounded-xl px-4 py-3 text-sm font-semibold transition sm:px-6 ${activeTab === tab.id
                                        ? "bg-(--accent) text-(--accent-foreground)"
                                        : "text-(--muted) hover:bg-(--surface-secondary) hover:text-(--foreground)"
                                    }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    {error && (
                        <div
                            role="alert"
                            className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600"
                        >
                            {error}
                        </div>
                    )}

                    {message && (
                        <div
                            role="status"
                            className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-600"
                        >
                            {message}
                        </div>
                    )}

                    {activeTab === "overview" && (
                        <div className="space-y-8">
                            <section>
                                <div className="mb-4">
                                    <h2 className="text-xl font-bold">Platform overview</h2>
                                    <p className="mt-1 text-sm text-(--muted)">
                                        Live statistics from your backend.
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    <MetricCard
                                        title="Total APIs"
                                        value={stats.totalApis}
                                        icon="⌘"
                                        description="All API submissions"
                                    />
                                    <MetricCard
                                        title="Pending review"
                                        value={stats.pendingApis}
                                        icon="◷"
                                        description="Waiting for a decision"
                                    />
                                    <MetricCard
                                        title="Approved APIs"
                                        value={stats.approvedApis}
                                        icon="✓"
                                        description="Approved listings"
                                    />
                                    <MetricCard
                                        title="Rejected APIs"
                                        value={stats.rejectedApis}
                                        icon="×"
                                        description="Submissions not approved"
                                    />
                                    <MetricCard
                                        title="Registered users"
                                        value={stats.totalUsers}
                                        icon="♙"
                                        description="Community accounts"
                                    />
                                </div>
                            </section>

                            <section className="grid gap-6 xl:grid-cols-2">
                                <div className={cardStyle}>
                                    <div className="mb-5 flex items-center justify-between gap-3">
                                        <div>
                                            <h2 className="text-lg font-bold">
                                                API categories
                                            </h2>
                                            <p className="mt-1 text-sm text-(--muted)">
                                                Distribution of submitted APIs
                                            </p>
                                        </div>
                                        <span className="text-2xl text-(--accent)">◉</span>
                                    </div>

                                    {categories.length === 0 ? (
                                        <p className="py-8 text-center text-sm text-(--muted)">
                                            No category data available yet.
                                        </p>
                                    ) : (
                                        <div className="space-y-5">
                                            {categories.map((item, index) => {
                                                const name =
                                                    item._id || item.category || "Uncategorized";
                                                const count = Number(item.count || 0);
                                                const total = Math.max(
                                                    Number(stats.totalApis || 0),
                                                    1
                                                );
                                                const percent = Math.min(
                                                    (count / total) * 100,
                                                    100
                                                );

                                                return (
                                                    <div key={`${name}-${index}`}>
                                                        <div className="mb-2 flex justify-between gap-3 text-sm">
                                                            <span className="font-medium">{name}</span>
                                                            <span className="text-(--muted)">
                                                                {count} · {Math.round(percent)}%
                                                            </span>
                                                        </div>
                                                        <div className="h-2 overflow-hidden rounded-full bg-(--surface-secondary)">
                                                            <div
                                                                className="h-full rounded-full bg-(--accent)"
                                                                style={{ width: `${percent}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className={cardStyle}>
                                    <div className="mb-5 flex items-center justify-between gap-3">
                                        <div>
                                            <h2 className="text-lg font-bold">
                                                Recent submissions
                                            </h2>
                                            <p className="mt-1 text-sm text-(--muted)">
                                                The latest API activity
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => setActiveTab("apis")}
                                            className="text-sm font-semibold text-(--accent)"
                                        >
                                            Manage APIs →
                                        </button>
                                    </div>

                                    {recentApis.length === 0 ? (
                                        <p className="py-8 text-center text-sm text-(--muted)">
                                            No submissions to show yet.
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            {recentApis.map((api) => (
                                                <div
                                                    key={api._id}
                                                    className="flex items-start justify-between gap-3 border-b border-(--border) pb-4 last:border-0 last:pb-0"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold">
                                                            {api.name}
                                                        </p>
                                                        <p className="mt-1 text-xs text-(--muted)">
                                                            {api.submittedBy?.name ||
                                                                api.submittedBy?.email ||
                                                                "Unknown submitter"}
                                                            {" · "}
                                                            {formatDate(api.createdAt)}
                                                        </p>
                                                    </div>
                                                    <StatusBadge status={api.status} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className={`${cardStyle} flex flex-col justify-between gap-5 sm:flex-row sm:items-center`}>
                                <div>
                                    <h2 className="text-lg font-bold">
                                        Keep the community moving
                                    </h2>
                                    <p className="mt-2 text-sm text-(--muted)">
                                        Review pending submissions and help useful APIs reach
                                        developers.
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        setApiFilter("pending");
                                        setActiveTab("apis");
                                    }}
                                    className="rounded-xl bg-(--accent) px-5 py-3 text-sm font-bold text-(--accent-foreground)"
                                >
                                    Review pending APIs
                                </button>
                            </section>
                        </div>
                    )}

                    {activeTab === "apis" && (
                        <section className={cardStyle}>
                            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div>
                                    <h2 className="text-xl font-bold">API management</h2>
                                    <p className="mt-1 text-sm text-(--muted)">
                                        Review submissions and manage existing listings.
                                    </p>
                                </div>

                                <select
                                    value={apiFilter}
                                    onChange={(event) => setApiFilter(event.target.value)}
                                    className="rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-sm outline-none focus:border-(--accent)"
                                >
                                    <option value="pending">Pending APIs</option>
                                    <option value="approved">Approved APIs</option>
                                    <option value="rejected">Rejected APIs</option>
                                </select>
                            </div>

                            {apis.length === 0 ? (
                                <div className="rounded-xl bg-(--surface-secondary) px-4 py-12 text-center">
                                    <p className="font-semibold">No APIs found</p>
                                    <p className="mt-2 text-sm text-(--muted)">
                                        There are no {apiFilter} submissions to display.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {apis.map((api) => (
                                        <article
                                            key={api._id}
                                            className="rounded-xl border border-(--border) p-4 sm:p-5"
                                        >
                                            <div className="flex flex-col justify-between gap-4 lg:flex-row">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <h3 className="text-lg font-bold">
                                                            {api.name}
                                                        </h3>
                                                        <StatusBadge status={api.status} />
                                                    </div>

                                                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-(--muted)">
                                                        {api.description || "No description provided."}
                                                    </p>

                                                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                                        <span className="rounded-lg bg-(--surface-secondary) px-3 py-2">
                                                            {api.category || "Uncategorized"}
                                                        </span>
                                                        <span className="rounded-lg bg-(--surface-secondary) px-3 py-2">
                                                            {api.pricing || "Pricing unspecified"}
                                                        </span>
                                                        <span className="rounded-lg bg-(--surface-secondary) px-3 py-2">
                                                            {api.auth || "Auth unspecified"}
                                                        </span>
                                                    </div>

                                                    <p className="mt-4 break-all text-xs text-(--muted)">
                                                        Submitted by:{" "}
                                                        {api.submittedBy?.name ||
                                                            api.submittedBy?.email ||
                                                            "Unknown user"}
                                                        {" · "}
                                                        {formatDate(api.createdAt)}
                                                    </p>

                                                    {api.url && (
                                                        <a
                                                            href={api.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="mt-3 inline-block break-all text-sm font-semibold text-(--accent) underline"
                                                        >
                                                            Open API documentation ↗
                                                        </a>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-start gap-2 lg:w-40 lg:shrink-0 lg:flex-col">
                                                    {apiFilter !== "approved" && (
                                                        <button
                                                            disabled={busyId === api._id}
                                                            onClick={() =>
                                                                changeStatus(api._id, "approved")
                                                            }
                                                            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}

                                                    {apiFilter !== "rejected" && (
                                                        <button
                                                            disabled={busyId === api._id}
                                                            onClick={() =>
                                                                changeStatus(api._id, "rejected")
                                                            }
                                                            className="rounded-lg border border-red-500/40 px-4 py-2.5 text-sm font-semibold text-red-600 disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    )}

                                                    <button
                                                        disabled={busyId === api._id}
                                                        onClick={() => deleteApi(api)}
                                                        className="rounded-lg border border-(--border) px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {activeTab === "users" && (
                        <section className={cardStyle}>
                            <div className="mb-6">
                                <h2 className="text-xl font-bold">Community users</h2>
                                <p className="mt-1 text-sm text-(--muted)">
                                    Registered accounts and their submission activity.
                                </p>
                            </div>

                            {users.length === 0 ? (
                                <div className="rounded-xl bg-(--surface-secondary) px-4 py-12 text-center">
                                    <p className="font-semibold">No users found</p>
                                    <p className="mt-2 text-sm text-(--muted)">
                                        Registered accounts will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[600px] text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-(--border) text-(--muted)">
                                                <th className="px-3 py-4 font-semibold">User</th>
                                                <th className="px-3 py-4 font-semibold">Role</th>
                                                <th className="px-3 py-4 font-semibold">
                                                    Submissions
                                                </th>
                                                <th className="px-3 py-4 font-semibold">
                                                    Joined
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {users.map((person) => (
                                                <tr
                                                    key={person._id}
                                                    className="border-b border-(--border) last:border-0"
                                                >
                                                    <td className="px-3 py-4">
                                                        <p className="font-semibold">
                                                            {person.name || "Unnamed user"}
                                                        </p>
                                                        <p className="mt-1 break-all text-xs text-(--muted)">
                                                            {person.email}
                                                        </p>
                                                    </td>
                                                    <td className="px-3 py-4">
                                                        <span className="rounded-full bg-(--surface-secondary) px-3 py-1 text-xs font-semibold">
                                                            {person.role || "user"}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-4 font-semibold">
                                                        {person.submissionCount ??
                                                            person.apiCount ??
                                                            person.totalSubmissions ??
                                                            0}
                                                    </td>
                                                    <td className="px-3 py-4 text-(--muted)">
                                                        {formatDate(person.createdAt)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    )}

                    <footer className="mt-10 border-t border-(--border) pt-5 text-center text-xs text-(--muted)">
                        APICosmos Admin Workspace · Manage responsibly
                    </footer>
                </div>
            </main>
        </>
    );
}
