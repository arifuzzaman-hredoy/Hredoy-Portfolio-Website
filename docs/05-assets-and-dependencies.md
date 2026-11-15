# 05 - Assets and Dependencies

## Homepage-loaded CSS

The Home 07 `<head>` (HTML lines 14-25) loads these nine local stylesheets in
order:

1. `assets/css/vendors/carouselTicker.css`
2. `assets/css/vendors/bootstrap.min.css` (Bootstrap 5.3.8, per stylesheet header)
3. `assets/css/vendors/swiper-bundle.min.css`
4. `assets/css/vendors/nice-select.css`
5. `assets/css/vendors/font-awesome-pro.css`
6. `assets/css/vendors/magnific-popup.css`
7. `assets/css/vendors/odometer.css`
8. `assets/css/vendors/spacing.css`
9. `assets/css/main.css`

The page does not load `sticky-cards.css`; that file's own header says it is
only loaded for Home 15.

## Homepage-loaded JavaScript

The footer loads the following local scripts in order (HTML lines
1,864-1,883):

1. `assets/js/vendors/color-modes.js`
2. `assets/js/vendors/jquery-3.7.1.min.js`
3. `assets/js/vendors/plugin.js` (GSAP bundle/plugins)
4. `assets/js/vendors/bootstrap.min.js`
5. `assets/js/vendors/swiper-bundle.min.js`
6. `assets/js/vendors/jquery.carouselTicker.min.js`
7. `assets/js/vendors/jquery.magnific-popup.min.js`
8. `assets/js/vendors/jquery.odometer.min.js`
9. `assets/js/vendors/jquery.appear.js`
10. `assets/js/vendors/jquery.elevatezoom.js`
11. `assets/js/vendors/nice-select.js`
12. `assets/js/vendors/parallax.js`
13. `assets/js/vendors/ripple-2.js`
14. `assets/js/vendors/imagesloaded-pkgd.js`
15. `assets/js/vendors/isotope.pkgd.min.js`
16. `assets/js/vendors/image-hover-effects.js`
17. `assets/js/at-cursor.js`
18. `assets/js/main.js`
19. `assets/js/matter.js`
20. `assets/js/throwable.js`

Not every loaded library is clearly needed by Home 07; some support other
pages/components in the larger theme. For example, Isotope, ElevateZoom,
Magnific Popup and Nice Select are generic site dependencies but do not have a
clearly visible core Home 07 use in the page markup.

## Homepage images and icons

Local page-specific assets used by Home 07 include:

- Hero: `assets/imgs/pages/home-7/hero-vr.webp`,
  `star-asterisk.svg`, `avatar-1.webp` through `avatar-5.webp`.
- Section 2: `sec2-img-1.webp` through `sec2-img-3.webp`.
- Section 3 image slider: shared `assets/imgs/pages/img-45.webp` through
  `img-49.webp`.
- Section 4-7: `sec-4-helmet.webp`, `sec-4-pin-icon.svg`,
  `sec-5-founder.webp`, `step-1.webp` through `step-4.webp`,
  `sec-7-photo.webp` and CTA/decoration SVGs.
- Team/blog/marquee: four `team-*.webp` images, four `insight-*.webp` images,
  and `marquee-star.svg`.
- Header/footer: `assets/imgs/template/logo/favicon.svg`,
  `favicon-dark.svg`, five shared `avatar-10.webp` through `avatar-14.webp`,
  and partner logo assets `logo-brand-01.webp` through `logo-brand-10.webp`
  (with some logos repeated in the markup).
- Many icons and arrows are inline SVG in the HTML rather than external files.

## Fonts and dependency caveats

`assets/css/main.css` requests DM Sans from Google Fonts. The URL declaration
appears to include an unmatched double quote in the URL string, so the remote
font request may fail; no local DM Sans fallback is included beyond generic
`sans-serif`.

The Font Awesome stylesheet references local `fa-duotone-900` and
`fa-thin-100` font files and `fa-v4compatibility` font files, which are absent
from the supplied `assets/fonts/` directory. Available font binaries are only
`fa-brands-400`, `fa-light-300`, `fa-regular-400` and `fa-solid-900`, each in
TTF and WOFF2. A missing unused face may not show on this homepage, but a glyph
using those styles may fall back or render incorrectly.

`plugin.js` headers identify GSAP with ScrollSmoother and additional plugins.
Its headers reference the GSAP standard license; confirm the applicable
template/vendor license permits the intended deployment and asset use.

## Reference verification

The HTML's relative `src` and `href` values were checked against this package.
All direct local stylesheet, JavaScript, and image targets referenced by the
homepage resolve. The absent local references are HTML demo/navigation
destinations (73 unique missing HTML destinations), because only the selected
homepage file is present. No external URL is hardcoded in the HTML resource
tags; the Google Fonts import in `main.css` is the detected external CSS
resource.

The broader vendor CSS scan also found missing Font Awesome font files as
described above. A data-URI SVG is not a missing file.

## Evidence

- Resource tags: `template-source/index-7-dark.html`, lines 14-25 and
  1,864-1,883.
- Home 07 asset paths: same file, lines 565-1,850.
- Font declarations and external Google Fonts import:
  `template-source/assets/css/main.css`, near lines 16 and 1,094-1,096.
- Font Awesome URL definitions: `template-source/assets/css/vendors/font-awesome-pro.css`.
- Available fonts: `template-source/assets/fonts/`.
