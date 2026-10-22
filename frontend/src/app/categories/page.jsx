import Link from "next/link";
import LiquidNavbar from "@/components/LiquidNavbar";

const categories = [
  {
    name: "AI & Machine Learning",
    description: "Build intelligent applications with AI models and ML tools.",
    icon: "✳",
    count: "AI APIs",
  },
  {
    name: "Weather",
    description: "Access forecasts, current conditions, and climate data.",
    icon: "☀",
    count: "Weather APIs",
  },
  {
    name: "Finance",
    description: "Explore market data, currencies, and financial services.",
    icon: "↗",
    count: "Finance APIs",
  },
  {
    name: "Maps & Location",
    description: "Add maps, geocoding, and location features to your apps.",
    icon: "⌖",
    count: "Location APIs",
  },
  {
    name: "Social Media",
    description: "Connect applications with social platforms and content.",
    icon: "◎",
    count: "Social APIs",
  },
  {
    name: "Entertainment",
    description: "Discover APIs for movies, music, games, and media.",
    icon: "▷",
    count: "Media APIs",
  },
  {
    name: "Development Tools",
    description: "Find utilities that make development faster and easier.",
    icon: "</>",
    count: "Developer APIs",
  },
  {
    name: "Communication",
    description: "Integrate messaging, email, and communication services.",
    icon: "⌁",
    count: "Communication APIs",
  },
  {
    name: "Other",
    description: "Explore APIs that don't fit into a specific category.",
    icon: "✳",
    count: "More APIs",
  },
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-(--background) text-(--foreground)">
      <LiquidNavbar />

      <main className="mx-auto w-full max-w-7xl px-5 pb-16 pt-10 sm:px-8 lg:px-12">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-(--muted)">
            EXPLORE THE UNIVERSE
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Browse <span className="text-(--accent)">Categories.</span>
          </h1>

          <p className="mt-4 text-sm leading-7 text-(--muted) sm:text-base">
            Find the right APIs for your next idea. Explore categories and
            discover tools to bring your projects to life.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              href={`/explore?category=${encodeURIComponent(category.name)}`}
              className="group rounded-2xl border border-(--border) bg-(--surface) p-6 transition duration-200 hover:-translate-y-1 hover:border-(--accent) hover:shadow-lg"
            >
              <div className="mb-7 flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-(--border) bg-(--background) text-lg font-semibold text-(--accent)">
                  {category.icon}
                </span>

                <span className="text-xs text-(--muted)">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <h2 className="text-lg font-semibold tracking-tight transition-colors group-hover:text-(--accent)">
                {category.name}
              </h2>

              <p className="mt-2 min-h-12 text-sm leading-6 text-(--muted)">
                {category.description}
              </p>

              <div className="mt-6 flex items-center justify-between border-t border-(--border) pt-4">
                <span className="text-xs text-(--muted)">
                  {category.count}
                </span>

                <span className="text-lg transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
