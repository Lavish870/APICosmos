"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./LiquidNavbar.css";

const navItems = [
    {
        label: "Home",
        href: "/",
        icon: (
            <>
                <path d="m3 10 9-7 9 7" />
                <path d="M5 9v12h14V9M9 21v-7h6v7" />
            </>
        ),
    },
    {
        label: "Explore",
        href: "/explore",
        icon: (
            <>
                <circle cx="11" cy="11" r="7" />
                <path d="m16 16 4 4" />
            </>
        ),
    },
    {
        label: "Categories",
        href: "/categories",
        icon: (
            <>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
            </>
        ),
    },
];

function Icon({ children, size = 19 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

function ThemeToggle({ theme, onChange }) {
    const isDark = theme === "dark";

    return (
        <div className="theme-control">
            <button
                type="button"
                className={`liquid-theme-toggle ${isDark ? "is-dark" : ""}`}
                onClick={() => onChange(isDark ? "light" : "dark")}
                aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
                title={`Switch to ${isDark ? "light" : "dark"} theme`}
            >
                <span className="theme-toggle-glow" />

                <span className="theme-toggle-icon sun-icon">
                    <Icon size={17}>
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
                    </Icon>
                </span>

                <span className="theme-toggle-icon moon-icon">
                    <Icon size={17}>
                        <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z" />
                    </Icon>
                </span>

                <span className="theme-toggle-knob" />
            </button>

            <select
                className="theme-mode-select"
                value={theme}
                onChange={(event) => onChange(event.target.value)}
                aria-label="Theme preference"
                title="Theme preference"
            >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
            </select>
        </div>
    );
}

export default function LiquidNavbar() {
    const pathname = usePathname();
    const [theme, setTheme] = useState("system");
    const [menuOpen, setMenuOpen] = useState(false);
    const navRef = useRef(null);
    const pillRef = useRef(null);
    const buttonRefs = useRef([]);

    useEffect(() => {
        const savedTheme = localStorage.getItem("apicosmos-theme") || "system";

        setTheme(savedTheme);
        applyTheme(savedTheme);

        const media = window.matchMedia("(prefers-color-scheme: dark)");

        function handleSystemTheme() {
            if ((localStorage.getItem("apicosmos-theme") || "system") === "system") {
                applyTheme("system");
            }
        }

        media.addEventListener("change", handleSystemTheme);

        return () => {
            media.removeEventListener("change", handleSystemTheme);
        };
    }, []);

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        function updatePill() {
            const activePath = pathname === "/cards" ? "/explore" : pathname;

            const index = navItems.findIndex(
                (item) => item.href === activePath
            );

            const button = buttonRefs.current[index];
            const pill = pillRef.current;

            if (!button || !pill) return;

            pill.style.width = `${button.offsetWidth}px`;
            pill.style.transform = `translateX(${button.offsetLeft}px)`;
        }

        updatePill();

        window.addEventListener("resize", updatePill);

        return () => window.removeEventListener("resize", updatePill);
    }, [pathname]);

    function applyTheme(selectedTheme) {
        const dark =
            selectedTheme === "dark" ||
            (selectedTheme === "system" &&
                window.matchMedia("(prefers-color-scheme: dark)").matches);

        document.documentElement.classList.toggle("dark", dark);
        document.documentElement.dataset.theme = dark ? "dark" : "light";
    }

    function changeTheme(selectedTheme) {
        setTheme(selectedTheme);
        localStorage.setItem("apicosmos-theme", selectedTheme);
        applyTheme(selectedTheme);
    }

    function moveGlare(event) {
        if (!navRef.current) return;

        const rect = navRef.current.getBoundingClientRect();

        navRef.current.style.setProperty(
            "--mouse-x",
            `${event.clientX - rect.left}px`
        );

        navRef.current.style.setProperty(
            "--mouse-y",
            `${event.clientY - rect.top}px`
        );

        navRef.current.classList.add("glare-active");
    }

    function resetGlare() {
        if (!navRef.current) return;

        navRef.current.classList.remove("glare-active");
        navRef.current.style.setProperty("--mouse-x", "-200px");
        navRef.current.style.setProperty("--mouse-y", "-200px");
    }


    function closeMenu() {
        setMenuOpen(false);
    }

    return (
        <header className="apicosmos-header">
            <Link href="/" className="apicosmos-brand" aria-label="APICosmos home">
                <span className="brand-symbol">
                    <Icon size={25}>
                        <circle cx="12" cy="12" r="3" />
                        <ellipse
                            cx="12"
                            cy="12"
                            rx="10"
                            ry="4"
                            transform="rotate(-35 12 12)"
                        />
                        <ellipse
                            cx="12"
                            cy="12"
                            rx="10"
                            ry="4"
                            transform="rotate(35 12 12)"
                        />
                    </Icon>
                </span>

                <span>
                    API<span className="brand-accent">Cosmos</span>
                </span>
            </Link>

            <nav
                ref={navRef}
                className="liquid-nav"
                onMouseMove={moveGlare}
                onMouseLeave={resetGlare}
                aria-label="Main navigation"
            >
                <div className="liquid-glare" />

                <div className="liquid-nav-items">
                    <span ref={pillRef} className="active-pill" />

                    {navItems.map((item, index) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            ref={(element) => {
                                buttonRefs.current[index] = element;
                            }}
                            className={`liquid-nav-link ${pathname === item.href ? "active" : ""
                                }`}
                        >
                            <Icon>{item.icon}</Icon>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>

                <span className="liquid-divider" />

                <ThemeToggle theme={theme} onChange={changeTheme} />

                <button
                    type="button"
                    className="liquid-menu-trigger"
                    aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    <Icon>
                        {menuOpen ? (
                            <path d="M6 6l12 12M18 6 6 18" />
                        ) : (
                            <path d="M4 7h16M4 12h16M4 17h16" />
                        )}
                    </Icon>
                </button>

                <div className={`liquid-dropdown ${menuOpen ? "open" : ""}`}>
                    <p className="dropdown-heading">NAVIGATE</p>

                    <Link href="/explore" onClick={closeMenu}>
                        Explore APIs <span>↗</span>
                    </Link>

                    <Link href="/categories" onClick={closeMenu}>
                        Categories <span>↗</span>
                    </Link>

                    <Link href="/submit" onClick={closeMenu}>
                        Submit an API <span>↗</span>
                    </Link>

                    <Link href="/dashboard" onClick={closeMenu}>
                        Dashboard <span>↗</span>
                    </Link>

                    <Link href="/login" onClick={closeMenu}>
                        Log in <span>↗</span>
                    </Link>

                    <Link href="/signup" onClick={closeMenu}>
                        Create account <span>↗</span>
                    </Link>

                    <div className="dropdown-theme">
                        <span>Appearance</span>
                        <ThemeToggle theme={theme} onChange={changeTheme} />
                    </div>
                </div>
            </nav>

            <Link href="/signup" className="navbar-signup">
                Sign up <span aria-hidden="true">↗</span>
            </Link>
        </header>
    );
}