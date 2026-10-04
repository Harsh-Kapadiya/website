import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowDownRight, Clock, Code2, Terminal } from "lucide-react";
import { Link } from "react-router-dom";
import { useContentBlocks } from "@/hooks/useContentBlocks";
import { useTable } from "@/hooks/useTable";
import { imageUrl, safeSplineUrl } from "@/lib/safeUrl";
import { trackEvent } from "@/lib/analytics";
import { Magnetic } from "./interactions/Magnetic";

type TechItem = { id: string; label: string };
const FALLBACK_TECH: TechItem[] = [
  "React",
  "TypeScript",
  "Next.js",
  "Node.js",
  "Tailwind",
].map((label, i) => ({ id: String(i), label }));
const DEFAULT_SPLINE =
  "https://my.spline.design/glassknotvortex-rLUuC5Mcco8xm25vDzEAdS2s/";
const DEFAULT_POSTER = "/img/hero-poster.webp";

// ponytail: the live Spline scene is ~2.2 MB of JS plus a nonstop WebGL loop.
// Phones, tablets, data-saver and reduced-motion visitors get a still poster;
// desktops get the 3D, loaded only after the rest of the page has finished.
const wants3D = () =>
  matchMedia(
    "(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
  ).matches &&
  !(navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    ?.saveData;

export function Hero() {
  const { get } = useContentBlocks("home");
  const { data: tech } = useTable<TechItem>("tech_stack", FALLBACK_TECH);
  // null while pre-rendering at build time: the background is chosen in the browser.
  const [live3D] = useState(() =>
    typeof window === "undefined" ? null : wants3D(),
  );
  const [mount3D, setMount3D] = useState(false);
  const [shown3D, setShown3D] = useState(false);

  useEffect(() => {
    if (!live3D) return;
    const start = () => setMount3D(true);
    if (document.readyState === "complete") return start();
    window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, [live3D]);

  return (
    <section className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden px-6 md:px-12 pb-16 md:pb-20 pt-28">
      <div className="absolute inset-0" aria-hidden>
        {live3D === null ? null : live3D ? (
          mount3D && (
            <iframe
              src={safeSplineUrl(
                get("hero", "spline_url", DEFAULT_SPLINE),
                DEFAULT_SPLINE,
              )}
              title="Decorative interactive 3D scene"
              onLoad={() => setShown3D(true)}
              className={`block w-full h-full border-0 transition-opacity duration-1000 ${shown3D ? "opacity-90" : "opacity-0"}`}
              tabIndex={-1}
            />
          )
        ) : (
          <img
            src={imageUrl(get("hero", "poster_url", DEFAULT_POSTER)) || DEFAULT_POSTER}
            alt=""
            decoding="async"
            className="block w-full h-full object-cover opacity-90"
          />
        )}
      </div>
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_top,#0a0a0a_30%,rgba(10,10,10,0.55)_65%,rgba(10,10,10,0.1)_100%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(10,10,10,0.75)_0%,transparent_60%)]" />

      <div className="relative z-10 max-w-[1400px] w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap items-center gap-3 mb-8 md:mb-12 text-[0.8125rem]"
        >
          <span
            className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
            aria-hidden
          />
          <span className="text-white/60">
            {get(
              "hero",
              "badge_text",
              "Available for freelance & full-time roles",
            )}
          </span>
          <span className="hidden md:inline-flex items-center gap-1.5 ml-2 px-3 py-1 rounded-full border border-white/10 text-white/50 text-xs">
            <Terminal size={11} aria-hidden />
            {get("hero", "badge_pill", "Open to remote")}
          </span>
          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-400/20 text-emerald-300/90 text-xs">
            <Clock size={11} aria-hidden />
            {get("contact", "response_time", "I reply within 24 hours")}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-white leading-[0.92] font-medium tracking-[-0.04em] mb-8 md:mb-10"
          style={{ fontSize: "clamp(3rem, 9vw, 9rem)" }}
        >
          Building fast,
          <br />
          <span className="text-white/30 italic font-light">
            beautiful
          </span>{" "}
          apps
          <br />
          for the web.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8"
        >
          <div className="space-y-5">
            <p className="text-white/60 max-w-sm leading-relaxed text-[0.9375rem]">
              {get(
                "hero",
                "bio",
                "Full-stack web developer specializing in React, TypeScript & Node.js. I turn complex problems into clean, performant products.",
              )}
            </p>
            <ul className="flex flex-wrap gap-2" aria-label="Tech stack">
              {tech.map((t) => (
                <li
                  key={t.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 text-white/50 text-xs"
                >
                  <Code2 size={10} aria-hidden />
                  {t.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Primary CTA. `order-first` on mobile keeps it above the fold on small screens. */}
          <div className="order-first md:order-last flex items-center gap-5 shrink-0">
            <Magnetic strength={0.4}>
              <Link
                to="/contact"
                onClick={() => trackEvent("cta_click", { location: "hero" })}
                className="inline-block px-6 py-3 rounded-full bg-white text-[#0a0a0a] text-sm font-medium hover:bg-white/85 transition-colors"
              >
                {get("hero", "cta_secondary", "Hire me")}
              </Link>
            </Magnetic>
            <Link
              to="/work"
              className="group flex items-center gap-2 text-white hover:text-white/60 transition-colors text-[0.9375rem]"
            >
              {get("hero", "cta_primary", "View my work")}
              <ArrowDownRight
                size={16}
                aria-hidden
                className="group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform"
              />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
