"use client";

import { useEffect } from "react";

// Core scripts required for first paint (order matters: jQuery -> plugins).
const CORE_SCRIPTS = [
  "/assets/js/vendors/color-modes.js",
  "/assets/js/vendors/jquery-3.7.1.min.js",
  "/assets/js/vendors/plugin.js",
  "/assets/js/vendors/bootstrap.min.js",
  "/assets/js/vendors/swiper-bundle.min.js",
  "/assets/js/vendors/jquery.carouselTicker.min.js",
  "/assets/js/vendors/jquery.magnific-popup.min.js",
  "/assets/js/vendors/jquery.odometer.min.js",
  "/assets/js/vendors/jquery.appear.js",
  "/assets/js/vendors/jquery.elevatezoom.js",
  "/assets/js/vendors/nice-select.js",
  "/assets/js/vendors/parallax.js",
  "/assets/js/vendors/ripple-2.js",
  "/assets/js/vendors/imagesloaded-pkgd.js",
  "/assets/js/vendors/isotope.pkgd.min.js",
  "/assets/js/vendors/image-hover-effects.js",
  "/assets/js/at-cursor.js",
  "/assets/js/main.js",
];

// Heavy decorative physics scripts: loaded lazily after first paint and skipped
// on small screens / reduced-motion to protect mobile performance.
const PHYSICS_SCRIPTS = [
  "/assets/js/matter.js",
  "/assets/js/throwable.js",
  "/assets/js/vendors/poly-decomp.js",
  "/assets/js/tech-physics.js",
];

function loadScript(src: string): Promise<void> {
  return new Promise<void>((resolve) => {
    const existing = document.querySelector(`script[data-orisa-src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.setAttribute("data-orisa-src", src);
    s.onload = () => resolve();
    s.onerror = () => resolve();
    document.body.appendChild(s);
  });
}

function shouldLoadPhysics() {
  if (typeof window === "undefined") return false;
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const smallScreen = window.matchMedia?.("(max-width: 768px)").matches;
  return !reduceMotion && !smallScreen;
}

export default function ScriptLoader() {
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // Core scripts in order (each depends on the previous).
      for (const src of CORE_SCRIPTS) {
        if (cancelled) return;
        await loadScript(src);
      }

      if (cancelled || !shouldLoadPhysics()) return;

      // Defer decorative physics work until the page is idle.
      const start = () => {
        const schedule =
          (window as unknown as { requestIdleCallback?: (cb: () => void) => void })
            .requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1200));
        schedule(() => {
          void Promise.all(PHYSICS_SCRIPTS.map(loadScript));
        });
      };

      if (document.readyState === "complete") start();
      else window.addEventListener("load", start, { once: true });
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}