"use client";

import { useEffect } from "react";
import {
  certificateAssetUrl,
  certificateVerifyUrl,
  certificateStatusText,
  escapeAttr,
  escapeText,
  formatCertificateDate,
  renderCertificateCards,
  renderCertificatePagination,
  type Certificate,
  type CertificatePage,
} from "@/lib/certificates-render";

type SectionState = {
  page: CertificatePage;
  categories: string[];
  certificates: Certificate[];
  loading: boolean;
  controller: AbortController | null;
  request: number;
};

const DEBOUNCE_MS = 250;

function readState(data: string | null, perPage: number): SectionState {
  let page: CertificatePage = {
    certificates: [],
    count: 0,
    total: 0,
    page: 1,
    per_page: perPage,
    total_pages: 0,
  };
  let categories: string[] = [];
  if (data) {
    try {
      const parsed = JSON.parse(data) as Partial<CertificatePage> & { categories?: string[] };
      page = { ...page, ...parsed, certificates: parsed.certificates ?? [] };
      categories = parsed.categories ?? [];
    } catch {
      // A corrupt embed keeps the server-rendered cards; filtering still works.
    }
  }
  return {
    page,
    categories,
    certificates: page.certificates,
    loading: false,
    controller: null,
    request: 0,
  };
}

function fact(label: string, value: string): string {
  return `<div class="cert-modal__fact"><dt>${escapeText(label)}</dt><dd>${escapeText(value)}</dd></div>`;
}

function modalMedia(cert: Certificate): string {
  const image = certificateAssetUrl(cert.image_path, "");
  const pdf = certificateAssetUrl(cert.pdf_path, "");
  const parts: string[] = [];
  if (image) {
    parts.push(
      `<img class="cert-modal__image" src="${escapeAttr(image)}" alt="${escapeAttr(cert.title)} certificate" loading="lazy" decoding="async">`,
    );
  }
  if (pdf) {
    parts.push(
      `<iframe class="cert-modal__pdf" src="${escapeAttr(pdf)}" title="${escapeAttr(cert.title)} certificate PDF" loading="lazy"></iframe>`,
    );
  }
  if (parts.length === 0) {
    parts.push('<p class="cert-modal__media-empty mb-0">No preview image or document was uploaded for this certificate.</p>');
  }
  return parts.join("");
}

function modalActions(cert: Certificate): string {
  const actions: string[] = [];
  const verify = certificateVerifyUrl(cert.credential_url);
  if (verify) {
    actions.push(
      `<a class="cert-modal__button" href="${escapeAttr(verify)}" target="_blank" rel="noopener noreferrer">Verify credential</a>`,
    );
  }
  const pdf = certificateAssetUrl(cert.pdf_path, "");
  if (pdf) {
    actions.push(
      `<a class="cert-modal__button cert-modal__button--ghost" href="${escapeAttr(pdf)}" target="_blank" rel="noopener noreferrer" download>Download PDF</a>`,
    );
  }
  actions.push(
    '<button type="button" class="cert-modal__button cert-modal__button--ghost" data-cert-fullscreen>Fullscreen</button>',
  );
  return actions.join("");
}

export default function CertificatesController() {
  useEffect(() => {
    const root = document.getElementById("certificates");
    if (!root) return;

    const grid = root.querySelector<HTMLElement>("#cert-grid");
    const status = root.querySelector<HTMLElement>("#cert-status");
    const pagination = root.querySelector<HTMLElement>("#cert-pagination");
    const dataScript = root.querySelector<HTMLScriptElement>("#certificates-data");
    const search = root.querySelector<HTMLInputElement>("#cert-search");
    const category = root.querySelector<HTMLSelectElement>("#cert-category");
    const sort = root.querySelector<HTMLSelectElement>("#cert-sort");
    const dialog = root.querySelector<HTMLDialogElement>("#certificate-modal");
    if (!grid || !status || !pagination || !search || !category || !sort || !dialog) return;

    const perPage = (() => {
      if (!dataScript) return 9;
      try {
        const parsed = JSON.parse(dataScript.textContent ?? "") as Partial<CertificatePage>;
        return parsed.per_page && parsed.per_page > 0 ? parsed.per_page : 9;
      } catch {
        return 9;
      }
    })();

    const state = readState(dataScript?.textContent ?? null, perPage);
    let debounce = 0;
    let modalIndex = 0;
    let trigger: HTMLElement | null = null;

    const setStatus = (text: string, withRetry = false) => {
      status.textContent = text;
      if (!withRetry) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cert-status__retry";
      button.dataset.certRetry = "";
      button.textContent = "Retry";
      status.append(" ", button);
    };

    const store = () => {
      if (!dataScript) return;
      dataScript.textContent = JSON.stringify({
        page: state.page.page,
        per_page: state.page.per_page,
        total: state.page.total,
        total_pages: state.page.total_pages,
        certificates: state.certificates,
        categories: state.categories,
      }).replace(/</g, "\\u003c");
    };

    const paint = () => {
      grid.innerHTML = renderCertificateCards(state.certificates);
      pagination.innerHTML = renderCertificatePagination(state.page);
      if (state.page.total === 0) {
        grid.innerHTML =
          '<p class="cert-empty mb-0">No certificates match your filters. Try another search or category.</p>';
      }
      setStatus(certificateStatusText(state.page));
      store();
    };

    const load = async (page: number) => {
      if (state.controller) state.controller.abort();
      state.controller = new AbortController();
      const request = ++state.request;
      state.loading = true;
      grid.setAttribute("aria-busy", "true");
      setStatus("Loading certificates…");

      const params = new URLSearchParams();
      if (search.value.trim()) params.set("search", search.value.trim());
      if (category.value) params.set("category", category.value);
      params.set("sort", sort.value || "order");
      params.set("page", String(page));
      params.set("per_page", String(state.page.per_page || perPage));

      try {
        const response = await fetch(`/api/v1/certificates?${params.toString()}`, {
          headers: { Accept: "application/json" },
          signal: state.controller.signal,
        });
        if (!response.ok) throw new Error(`certificates request failed with ${response.status}`);
        const payload = (await response.json()) as Partial<CertificatePage>;
        if (request !== state.request) return;
        state.page = {
          certificates: payload.certificates ?? [],
          count: payload.count ?? 0,
          total: payload.total ?? 0,
          page: payload.page ?? page,
          per_page: payload.per_page ?? state.page.per_page,
          total_pages: payload.total_pages ?? 0,
        };
        state.certificates = state.page.certificates;
        state.loading = false;
        paint();
      } catch (error) {
        if ((error as Error).name === "AbortError" || request !== state.request) return;
        state.loading = false;
        setStatus("Could not load certificates. Check your connection and try again.", true);
      } finally {
        grid.setAttribute("aria-busy", "false");
      }
    };

    const clearFilters = () => {
      search.value = "";
      category.value = "";
      sort.value = "order";
      load(1);
    };

    const onSearch = () => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(() => load(1), DEBOUNCE_MS);
    };

    const onCategoryChange = () => void load(1);
    const onSortChange = () => void load(1);

    const setModalContent = () => {
      const cert = state.certificates[modalIndex];
      if (!cert) return;
      const meta = root.querySelector<HTMLElement>("#cert-modal-meta");
      const title = root.querySelector<HTMLElement>("#cert-modal-title");
      const media = root.querySelector<HTMLElement>("#cert-modal-media");
      const facts = root.querySelector<HTMLElement>("#cert-modal-facts");
      const description = root.querySelector<HTMLElement>("#cert-modal-description");
      const skills = root.querySelector<HTMLElement>("#cert-modal-skills");
      const actions = root.querySelector<HTMLElement>("#cert-modal-actions");
      const count = root.querySelector<HTMLElement>("#cert-modal-count");
      if (!meta || !title || !media || !facts || !description || !skills || !actions || !count) return;

      meta.textContent = [cert.issuer, cert.category].filter(Boolean).join(" · ");
      title.textContent = cert.title;
      media.innerHTML = modalMedia(cert);

      const rows: string[] = [];
      if (cert.course_name) rows.push(fact("Course", cert.course_name));
      const issued = formatCertificateDate(cert.issue_date);
      if (issued) rows.push(fact("Issued", issued));
      const expires = cert.expiry_date ? formatCertificateDate(cert.expiry_date) : "";
      if (expires) rows.push(fact(cert.expired ? "Expired" : "Valid until", expires));
      if (cert.credential_id) rows.push(fact("Credential ID", cert.credential_id));
      facts.innerHTML = rows.join("");

      description.textContent = cert.description ?? "";
      description.hidden = !cert.description;
      skills.innerHTML = (cert.skills ?? [])
        .map((skill) => `<li class="cert-modal__skill">${escapeText(skill)}</li>`)
        .join("");
      skills.hidden = (cert.skills ?? []).length === 0;
      actions.innerHTML = modalActions(cert);
      count.textContent = `${modalIndex + 1} of ${state.certificates.length}`;
      dialog.classList.toggle("has-pdf", Boolean(certificateAssetUrl(cert.pdf_path, "")) && !certificateAssetUrl(cert.image_path, ""));
    };

    const moveModal = (step: number) => {
      const next = modalIndex + step;
      if (next < 0 || next >= state.certificates.length) return;
      modalIndex = next;
      setModalContent();
    };

    const openModal = (id: string, element: HTMLElement | null) => {
      const index = state.certificates.findIndex((cert) => cert.id === id);
      if (index === -1) return;
      modalIndex = index;
      trigger = element;
      setModalContent();
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    };

    const closeModal = () => {
      if (dialog.open && typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
      trigger?.focus();
      trigger = null;
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const openButton = target.closest<HTMLElement>("[data-cert-open]");
      if (openButton?.dataset.certOpen) {
        openModal(openButton.dataset.certOpen, openButton);
        return;
      }
      if (target.closest("[data-cert-close]")) {
        closeModal();
        return;
      }
      if (target.closest("[data-cert-prev]")) {
        moveModal(-1);
        return;
      }
      if (target.closest("[data-cert-next]")) {
        moveModal(1);
        return;
      }
      if (target.closest("[data-cert-fullscreen]")) {
        const panel = dialog.querySelector<HTMLElement>(".cert-modal__panel");
        if (!panel) return;
        if (document.fullscreenElement) {
          void document.exitFullscreen();
        } else {
          void panel.requestFullscreen?.();
        }
        return;
      }
      if (target.closest("[data-cert-retry]")) {
        void load(state.page.page || 1);
        return;
      }
      if (target.closest("[data-cert-clear]")) {
        clearFilters();
        return;
      }
      const pageButton = target.closest<HTMLElement>("[data-cert-page]");
      if (pageButton?.dataset.certPage) {
        const next = Number(pageButton.dataset.certPage);
        if (Number.isFinite(next) && next >= 1 && next !== state.page.page) {
          void load(next);
        }
      }
    };

    const onKeydown = (event: KeyboardEvent) => {
      if (!dialog.open || event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const active = document.activeElement;
      if (active instanceof HTMLInputElement || active instanceof HTMLSelectElement || active instanceof HTMLTextAreaElement) return;
      if (event.key === "ArrowLeft") moveModal(-1);
      else moveModal(1);
    };

    const onBackdrop = (event: MouseEvent) => {
      if (event.target === dialog) closeModal();
    };

    const onImageError = (event: Event) => {
      const image = event.target as HTMLElement | null;
      if (!dialog.contains(image) && image instanceof HTMLImageElement && image.classList.contains("blog-card__img22")) {
        image.replaceWith(Object.assign(document.createElement("span"), {
          className: "cert-card__noimg",
          textContent: "Certificate",
        }));
      }
    };

    search.addEventListener("input", onSearch);
    category.addEventListener("change", onCategoryChange);
    sort.addEventListener("change", onSortChange);
    root.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeydown);
    dialog.addEventListener("click", onBackdrop);
    grid.addEventListener("error", onImageError, true);

    return () => {
      window.clearTimeout(debounce);
      state.controller?.abort();
      search.removeEventListener("input", onSearch);
      category.removeEventListener("change", onCategoryChange);
      sort.removeEventListener("change", onSortChange);
      root.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeydown);
      dialog.removeEventListener("click", onBackdrop);
      grid.removeEventListener("error", onImageError, true);
    };
  }, []);

  return null;
}
