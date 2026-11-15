# 01 - Template Structure

## Scope and method

This report inventories the supplied `template-source/` package and treats
`index-7-dark.html` as the selected Orisa Home 07 dark demo. The package was
inspected by file listing and by reading the homepage's resource references.
No template files were modified.

## Package inventory

The package contains **817 files**:

| Type | Count |
|---|---:|
| HTML | 1 |
| CSS | 10 |
| JavaScript | 31 |
| Source maps (`.map`) | 3 |
| SVG | 73 |
| WebP | 654 |
| JPG | 25 |
| PNG | 6 |
| GIF | 2 |
| TTF | 4 |
| WOFF2 | 4 |
| MP4 | 1 |
| MOV | 1 |
| WebM | 2 |

### Directory tree and contents

```text
template-source/
  index-7-dark.html
  assets/
    css/                         3 files
      main.css
      main.css.map
      sticky-cards.css
      vendors/                   9 files
    fonts/                       8 files (Font Awesome TTF/WOFF2)
    imgs/
      icons/                     28 files
      pages/                     243 files
        cursor-trail/             8 files
        home-6/                  26 files
        home-7/                  44 files
        home-8/                  56 files
        home-9/                  57 files
        home-10/                 32 files
        home-11/                 20 files
        home-12/                 30 files
        home-13/                 49 files
        home-14/                 37 files
        home-15/                 34 files
        portfolio-cinema/         5 files
        portfolio-curtain/        5 files
        portfolio-split/          5 files
        portfolio-stack/          5 files
        portfolio-zstack/         5 files
        product/                 27 files
        slideshow/                5 files
      template/
        avatar/                  21 files
        logo/                    20 files
      video/                      2 files
    js/
      top-level scripts/         14 files
      vendors/                   18 files
```

The package is a single-page excerpt from a larger multi-demo template, not the
complete Orisa HTML site: only `index-7-dark.html` is present at the HTML root.
The images and scripts for several other home demos and portfolio styles are
also included.

## HTML, CSS, JavaScript and media

- **HTML:** `index-7-dark.html` is 1,886 lines and contains the Home 07 layout,
  search overlay, two off-canvas structures, header, eleven main sections and
  footer.
- **Stylesheets:** `assets/css/main.css` (about 896 KB), its 2.3 MB source map,
  `assets/css/sticky-cards.css`, and nine vendor stylesheets under
  `assets/css/vendors/`. The `sticky-cards.css` header explicitly says it is
  for Home 15, not this homepage.
- **Scripts:** 14 top-level scripts plus 18 vendor scripts. The Home 07 HTML
  loads `main.js`, cursor/matter/throwable scripts and a number of vendor
  scripts (listed in [05-assets-and-dependencies.md](./05-assets-and-dependencies.md)).
- **Images:** WebP is the dominant image format. `assets/imgs/pages/home-7/`
  contains 44 section-specific images and SVGs; other folders supply shared
  logos/icons and media for other demos.
- **Fonts:** eight Font Awesome Pro font files exist under `assets/fonts/`:
  Brands, Light, Regular and Solid, each in TTF and WOFF2. DM Sans is requested
  from Google Fonts in CSS rather than provided as a local font file.
- **Other media:** two GIFs, one MOV, one MP4 and two WebM files are included;
  they are not all dependencies of the selected homepage.

## Vendor and external dependency footprint

The package has no `package.json`, lockfile, build manifest, backend framework,
or dependency installer metadata. Dependencies are directly bundled locally,
including Bootstrap, jQuery, Swiper, Magnific Popup, Odometer, Nice Select,
CarouselTicker, Isotope, and a combined GSAP/plugin file. The primary external
resource is the DM Sans Google Fonts CSS import in `assets/css/main.css`.

The bundled `assets/js/vendors/plugin.js` identifies GSAP and plugins including
ScrollSmoother, ScrollTrigger, SplitText, Flip and TextPlugin in its headers.
The Font Awesome stylesheet expects additional font variants not present in
the supplied font directory; see [05-assets-and-dependencies.md](./05-assets-and-dependencies.md).

## Files and destinations not supplied

The header mega-menus and footer link to many demo pages (for example
`index.html`, `about-1.html`, `services-1.html`, `team.html` and
`contact-1.html`), but those HTML files are not in this package. The asset
check found no missing local image, stylesheet or script target referenced by
this homepage; the absent targets are HTML navigation destinations.

## Evidence

- Homepage document and resource declarations: `template-source/index-7-dark.html`,
  lines 1-25 and 1,864-1,883.
- Homepage section sequence: same file, lines 565-1,850.
- Script/CSS inventory: `template-source/assets/css/`,
  `template-source/assets/js/` and `template-source/assets/fonts/`.
