"use client";

import { useEffect } from "react";

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
  document.querySelectorAll(".at-search-form-toggle.active, .at-search-body-overlay.active").forEach((el) =>
    el.classList.remove("active"),
  );
}

function findSearchTarget(rawQuery: string): string {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return "#";

  const keywordSections: Array<[RegExp, string]> = [
    [/\b(contact|email|hire|message|reach)\b/i, "#contact"],
    [/\b(cert|certificate|certificates|credential)\b/i, "#certificates"],
    [/\b(project|projects|portfolio|terraform|ansible|nginx|prometheus|grafana)\b/i, "#projects"],
    [/\b(skill|skills|linux|docker|kubernetes|k8s|ci\/cd|cloud|aws|automation|git|devops)\b/i, "#skills"],
    [/\b(about|bio|mission|experience|who)\b/i, "#about"],
  ];

  for (const [pattern, selector] of keywordSections) {
    if (pattern.test(q) && document.querySelector(selector)) {
      return selector;
    }
  }

  const sections = Array.from(document.querySelectorAll<HTMLElement>("main section, main [id]"));
  const matched = sections.find((el) => el.id && (el.textContent ?? "").toLowerCase().includes(q));
  return matched ? `#${matched.id}` : "#skills";
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

// Unhandled ".html" links are legacy template URLs; they fall back to the
// owner's email, which comes from site_settings via the server component.
export default function SiteInteractions({ contactEmail }: { contactEmail: string }) {
  useEffect(() => {
    const header = document.querySelector(".header-7");
    if (header) {
      header.classList.add("nav-ready", "nav-settled");
    }

    const params = new URLSearchParams(window.location.search);
    const sent = params.get("sent") === "1";
    const error = params.get("error") === "1";
    const form = document.querySelector<HTMLFormElement>(".sec-11-home-7__form");
    let statusEl: HTMLParagraphElement | null = null;

    if (form && (sent || error)) {
      form.querySelector(".contact-form-status")?.remove();
      statusEl = document.createElement("p");
      statusEl.className = `contact-form-status ${sent ? "contact-form-status--sent" : "contact-form-status--error"}`;
      statusEl.setAttribute("role", error ? "alert" : "status");
      statusEl.textContent = sent
        ? "Thank you! Your message has been sent."
        : `Could not send your message right now. Please try again or email ${contactEmail}.`;
      const disclaimer = form.querySelector(".sec-4-about-form__disclaimer");
      if (disclaimer) {
        form.insertBefore(statusEl, disclaimer);
      } else {
        form.appendChild(statusEl);
      }
    }

    function handleSearchSubmit(event: Event) {
      const formEl = (event.target as Element | null)?.closest?.(".at-search-form form");
      if (!formEl) return;
      event.preventDefault();
      const input = formEl.querySelector<HTMLInputElement>("input");
      const target = findSearchTarget(input?.value ?? "");
      closeOverlays();
      scrollToTarget(target);
    }

    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const searchTag = (event.target as Element | null)?.closest?.(".at-categories-item");
      if (searchTag) {
        event.preventDefault();
        const target = findSearchTarget(searchTag.textContent ?? "");
        closeOverlays();
        scrollToTarget(target);
        return;
      }

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

      window.location.href = `mailto:${contactEmail}`;
    }

    document.addEventListener("click", handleClick);
    document.addEventListener("submit", handleSearchSubmit);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("submit", handleSearchSubmit);
      statusEl?.remove();
    };
  }, [contactEmail]);

  return null;
}