"use client";

import { useEffect } from "react";

const SCRIPTS = [
  "/assets/js/vendors/color-modes.js",
  "/assets/js/vendors/jquery-3.7.1.min.js",
  // plugin.js already bundles GSAP 3.11.4, ScrollTrigger, ScrollSmoother, ScrollToPlugin, and SplitText.
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
  "/assets/js/matter.js",
  "/assets/js/throwable.js",
  "/assets/js/vendors/poly-decomp.js",
  "/assets/js/tech-physics.js",
];

export default function ScriptLoader() {
  useEffect(() => {
    // Setting async = false on dynamically inserted scripts lets the browser
    // fetch all scripts in parallel while executing them in strict array order.
    for (const src of SCRIPTS) {
      if (document.querySelector(`script[data-orisa-src="${src}"]`)) {
        continue;
      }
      const s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.setAttribute("data-orisa-src", src);
      document.body.appendChild(s);
    }
  }, []);

  return null;
}