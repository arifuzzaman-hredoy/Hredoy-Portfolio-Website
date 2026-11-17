"use client";

import { useEffect } from "react";

const CONTACT_EMAIL = "arifuzzamanhredoy@gmail.com";

const ROUTES: Array<{ pattern: RegExp; target: string }> = [
  { pattern: /^index(?:-.*)?(?:-dark)?\.html$/, target: "#" },
  { pattern: /^about(?:-.*)?\.html$/, target: ".sec-2-home-7" },
  { pattern: /^services(?:-.*)?\.html$/, target: ".sec-5-home-7" },
  { pattern: /^portfolio(?:-.*)?\.html$/, target: ".sec-6-home-7" },
  { pattern: /^(?:archive|blog)(?:-.*)?\.html$/, target: ".sec-10-home-7" },
  { pattern: /^contact(?:-.*)?\.html$/, target: ".sec-11-home-7" },
  { pattern: /^team(?:-.*)?\.html$/, target: ".sec-2-home-7" },
];

type ScrollSmootherLike = {
  scrollTo: (target: number | string | Element, smooth?: boolean) => void;
};

function closeOverlays() {
  document.querySelectorAll(".at-offcanvas.opened").forEach((el) => el.classList.remove("opened"));
  document.querySelectorAll(".body-overlay.apply").forEach((el) => el.classList.remove("apply"));
  document.querySelectorAll(".header-7.is-menu-open").forEach((el) => el.classList.remove("is-menu-open"));
}

function scrollToTarget(target: string) {
  const smoother = (window as unknown as { ScrollSmoother?: { get?: () => ScrollSmootherLike | null } }).ScrollSmoother?.get?.();

  if (smoother) {
    smoother.scrollTo(target === "#" ? 0 : target, true);
    return;
  }

  if (target === "#") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const el = document.querySelector(target);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function SiteInteractions() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.("a");
      const href = anchor?.getAttribute("href");
      if (!href) return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (!/\.html$/i.test(url.pathname)) return;

      event.preventDefault();
      closeOverlays();

      const path = url.pathname.replace(/^\//, "");
      const route = ROUTES.find((r) => r.pattern.test(path));

      if (route) {
        scrollToTarget(route.target);
        return;
      }

      window.location.href = `mailto:${CONTACT_EMAIL}`;
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}