"use client";

import { useEffect } from "react";

const SCRIPTS = [
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
  "/assets/js/matter.js",
  "/assets/js/throwable.js",
  "/assets/js/vendors/poly-decomp.js",
  "/assets/js/tech-physics.js",
];

export default function ScriptLoader() {
  useEffect(() => {
    let cancelled = false;

    const loadInOrder = async () => {
      for (const src of SCRIPTS) {
        if (cancelled) return;
        await new Promise<void>((resolve) => {
          // If already loaded (e.g. React strict-mode double effect), skip.
          const existing = document.querySelector(
            `script[data-orisa-src="${src}"]`
          );
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
    };

    loadInOrder();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}