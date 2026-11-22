"use client";

import { useEffect } from "react";

const CORE_SCRIPTS = [
  "/assets/js/vendors/color-modes.js",
  "/assets/js/vendors/jquery-3.7.1.min.js",
  // plugin.js already bundles GSAP 3.11.4, ScrollTrigger, ScrollSmoother, ScrollToPlugin, and SplitText.
  "/assets/js/vendors/plugin.js",
  "/assets/js/vendors/bootstrap.min.js",
  "/assets/js/vendors/swiper-bundle.min.js",
  "/assets/js/vendors/jquery.carouselTicker.min.js",
  "/assets/js/vendors/jquery.odometer.min.js",
  "/assets/js/vendors/jquery.appear.js",
  "/assets/js/vendors/parallax.js",
  "/assets/js/vendors/imagesloaded-pkgd.js",
  "/assets/js/at-cursor.js",
  "/assets/js/main.js",
];

const DEFERRED_PHYSICS_SCRIPTS = [
  "/assets/js/matter.js",
  "/assets/js/throwable.js",
  "/assets/js/vendors/poly-decomp.js",
  "/assets/js/tech-physics.js",
];

function appendScripts(list: string[]) {
  for (const src of list) {
    if (document.querySelector(`script[data-orisa-src="${src}"]`)) {
      continue;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.setAttribute("data-orisa-src", src);
    document.body.appendChild(s);
  }
}

export default function ScriptLoader() {
  useEffect(() => {
    appendScripts(CORE_SCRIPTS);

    // Defer Matter.js physics simulation until the browser is idle so initial
    // paint and hero interactions are not blocked.
    const scheduleIdle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 120));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const id = scheduleIdle(() => appendScripts(DEFERRED_PHYSICS_SCRIPTS));

    return () => {
      cancelIdle(id as number);
    };
  }, []);

  return null;
}
