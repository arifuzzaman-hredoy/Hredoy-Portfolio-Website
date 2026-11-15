# 03 - Design System

## Theme and palette

The selected HTML sets Bootstrap's `data-bs-theme="dark"` on `<html>`. Main
CSS defines neutral design tokens in `:root` (near line 1,094):

| Token | Value | Role |
|---|---|---|
| `--at-theme-primary` | `#F0460E` | Orange/vermilion accent |
| `--at-neutral-dark-0` | `#0C0C0C` | Deep dark surface |
| `--at-neutral-dark-50` | `#141414` | Dark surface |
| `--at-neutral-dark-100` | `#212121` | Elevated dark surface |
| `--at-neutral-0` | `#FEFEFE` | Light/white surface |
| `--at-neutral-50` | `#F2F2F2` | Light gray surface |
| `--at-neutral-100` | `#DFDFDF` | Light border/surface |
| `--at-neutral-500` | `#585959` | Mid-gray |
| `--at-neutral-900` | `#1D1D1D` | Dark text |
| `--at-common-white` | `#FFFFFF` | White |
| `--at-common-black` | `#1E1E1E` | Near-black |
| `--at-common-bubbles` | `#E1EEB7` | Lime accent |

The Hero section specifically uses a vermilion/maroon split background. Across
the page, the design alternates dark areas with very light neutral sections;
it is not a single uninterrupted dark canvas. CSS also declares a purple/cyan
gradient token, but that is not evidence that the gradient is a defining Home
07 color.

## Typography

- Body and headings use **DM Sans**, configured as both `--at-ff-body` and
  `--at-ff-heading`.
- `main.css` imports DM Sans from Google Fonts; the font is not stored under
  `assets/fonts/`. The import appears to have an unmatched double quote at the
  end of the URL in the CSS declaration and should be checked in a browser.
- Font Awesome 6 Pro is used for icon glyphs. The package has Brands, Light,
  Regular and Solid font files in TTF and WOFF2.
- Base body font is 16px with 1.2 line-height; the token body size is 14px.
  Headings use a heavy weight and tight negative tracking. Base heading sizes
  are h1 70px, h2 60px, h3 52px, h4 38px, h5 26px, and h6 20px; at widths
  above 1,400px these scale to 84/72/64/48/34/24px. Tablet and phone CSS
  reduces heading sizes.
- Additional font-size tokens include 12, 16, 20, 22, 28, 32 and 124px.
  Display headings use larger one-off styles (up to 290px in general rules).

## Layout and spacing

- Bootstrap 5 grid/container utilities are used extensively. The page also
  uses a custom `.container-2200` width rule (styles begin near line 1,654)
  and full-width `.container-fluid` for the Hero.
- Common section padding classes include `pt-100`, `pt-120`, `pb-80`,
  `pb-120`, and utility gaps/margins. `assets/css/vendors/spacing.css`
  provides additional spacing helpers.
- Bootstrap gutter spacing is adjusted by responsive rules, with common
  column gutters around 30px below very wide layouts.
- The Hero uses a two-column `col-lg-6` split. Elsewhere, rows switch from
  multi-column layouts to full-width columns via Bootstrap responsive classes.

## Components and effects

- **Buttons:** branded `.at-btn` variants and section-specific split text,
  arrow/circle affordances and hover states.
- **Cards:** asymmetrical/staggered layout; image-overflow cropping; team,
  process, article and accordion styles. The homepage contains no
  conventional uniformly bordered card system.
- **Radius:** design uses a mix of small 8-16px corners, large pill radii,
  and circular avatars/buttons; radius is component-specific rather than one
  global value.
- **Shadows:** no single global shadow token is defined in the inspected
  theme variables; shadows appear on selected components rather than serving
  as the principal surface treatment.
- **Motion:** GSAP-powered text reveals, fades, image zoom, parallax, rotation,
  text-scramble, marquee/ticker and scroll movement. CSS transitions are
  widely used for hover and state changes. Main CSS includes a
  `prefers-reduced-motion` rule for at least some animations (near line
  3,106), but that alone does not establish that every GSAP animation honors
  the preference.
- **Hover:** text/arrow movement, image zoom/parallax and colored/expanded
  controls are present. Several interactions depend on pointer movement and
  should have a touch-accessible equivalent when preserved.

## Responsive breakpoints

Main CSS contains rules at the common Bootstrap widths: 576px, 768px, 992px,
1,200px and 1,400px, plus custom thresholds at 574.98px, 1,401px and
1,441px. The Header's desktop nav uses `d-xl-*`/`d-none` breakpoint utilities.
See [06-responsive-analysis.md](./06-responsive-analysis.md) for practical
implications for the homepage.

## Theme switch readiness

The CSS and Bootstrap use dark/light-aware token concepts, and
`assets/js/vendors/color-modes.js` can set `data-bs-theme` and persist a
selection. However, the page hardcodes dark mode in the HTML and has no
`.dark-light-switcher` in the homepage markup. Therefore the selected page
does not currently expose a working dark/light UI. In addition, the script
prefers an explicit `data-bs-theme` attribute over saved storage on load, so
the hardcoded `dark` wins after reload unless the app changes the HTML
attribute.

## Evidence

- Design tokens and base typography: `template-source/assets/css/main.css`,
  around lines 1,094-1,275.
- Container width and responsive utility rules: same file, around lines
  1,646-1,654 and 2,340-2,550.
- Selected-theme attribute: `template-source/index-7-dark.html`, line 2.
- Variable/dark-mode helper: `template-source/assets/js/vendors/color-modes.js`.
