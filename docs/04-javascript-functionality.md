# 04 - JavaScript Functionality

## Loading and local/third-party split

All scripts used by the selected page are loaded from `template-source/assets/js/`.
No HTML script tag points to a remote JavaScript CDN. The code is therefore
locally bundled, although many files are third-party libraries and remain
subject to their respective licenses. `main.js` is the template initializer;
`plugin.js` bundles GSAP and plugins. The page also imports a Google-hosted
font through CSS, which is an external network dependency but not JavaScript.

## Implemented interactions

| Feature | Evidence and implementation |
|---|---|
| Header dropdown/mega-menu | HTML provides desktop dropdowns and mega-menu structures. Main CSS controls their presentation. |
| Mobile navigation | `main.js` clones `.at-mobile-menu-active > ul` into off-canvas nav markup and wires nested submenu toggling. The Home 07 hamburger toggles an `is-menu-open` class and updates `aria-expanded`. |
| Alternate off-canvas | A separate `.at-offcanvas-2-area` is toggled by `.hamburger-open-btn` / `.hamburger-close-btn`. Generic sidebar handlers also exist in `main.js`; not all are unique to this page. |
| Search overlay | `.at-search-click` adds `active` to the search form and overlay; close button or overlay removes it. Search form `action="#"` does not query a backend/index. |
| Theme | `color-modes.js` sets Bootstrap `data-bs-theme` and writes `localStorage.theme` if a `.dark-light-switcher` is present. Home 07 has no such switcher; its root HTML hardcodes `dark`. |
| Accordion | Bootstrap Collapse handles the four service items via `data-bs-toggle="collapse"` and `data-bs-parent`. |
| Image carousel | Home 07 Section 3 uses Swiper markup and the main script initializes the about-me slider. Vendor: `swiper-bundle.min.js`. |
| Metrics | Odometer plus jQuery Appear animates visible counters in Section 2. The numbers are embedded demo values. |
| Marquee | CarouselTicker initializes `.carouselTicker-left` and `.carouselTicker-right`; GSAP scroll movement is also applied to page elements. |
| Scroll and text effects | `main.js` uses GSAP/ScrollTrigger/ScrollSmoother for scroll smoothing, reveal text, fade animations, scroll movement, zoom, character animation, text-scramble and rotation. `plugin.js` includes the GSAP plugins. |
| Parallax and cursor | The page includes `at-hover-parallax`, `at-scroll-rotate` and `at-magic-cursor` elements; `main.js`, `at-cursor.js`, `parallax.js`, and GSAP handle the corresponding effects. |
| Throwable partner marks | HTML `data-t-throwable-*` attributes are used by local `matter.js` and `throwable.js` for the logo field. |
| Hover/image effects | Local image-hover-effects script and CSS/GSAP classes provide hover and zoom behaviors; some initialization in `main.js` targets other demos and may be inert on Home 07. |
| Contact/newsletter forms | Inputs have native required/type validation only. There is no form submission handler, configured endpoint, or backend service in the inspected package. |
| Preloader | `main.js` contains a preloader section, but the initialization code is commented out. The selected HTML has no page-loader element in the visible page structure. |
| Footer year | `main.js` sets `#year` to the current year if the element exists; this is a generic utility rather than a section interaction. |

## Behavior not provided by the markup/code

- No client-side portfolio/content database, search index, or API integration.
- No working contact submission, newsletter subscription, or success/error
  state; both forms target `#`.
- No page-specific testimonial slider.
- No dark/light switch control on the selected page.
- There is no implemented super-admin login or route.
- No web analytics integration or external form processor is referenced.

## Runtime and integration cautions

`main.js` is a large multi-demo initializer, not a Home 07-only module. It
contains generic handlers and many selectors for other pages. It calls plugins
conditionally in several places, but future extraction/tree-shaking should be
careful not to remove effects required by this page. Some controls use
`href="#"` or `action="#"`, so they may jump/reload rather than produce the
promised operation.

The theme script runs before jQuery and the other libraries. A saved preference
can be written by a switcher, but a page-level explicit `data-bs-theme="dark"`
has higher startup precedence. The color-mode logic must be reconciled with
the future preference UX, rather than assuming it currently toggles this page.

## Evidence

- Script tags and load order: `template-source/index-7-dark.html`, lines
  1,864-1,883.
- Main initialization index and handlers: `template-source/assets/js/main.js`,
  lines 1-365 and feature blocks later in the file.
- Theme behavior: `template-source/assets/js/vendors/color-modes.js`.
- Bootstrap accordion/search/contact markup:
  `template-source/index-7-dark.html`, lines 26-96, 915-1,091 and 1,593-1,643.
