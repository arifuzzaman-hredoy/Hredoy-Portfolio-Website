# 06 - Responsive Analysis

## Implementation evidence

The page uses Bootstrap 5 grid classes and responsive display/spacing
utilities, supplemented by custom Home 07 rules in `assets/css/main.css`.
Common breakpoints in the CSS include 576px, 768px, 992px, 1,200px and
1,400px, with additional custom max-width rules at 574.98px and larger
screen rules at 1,401px/1,441px. The HTML hides/shows some controls and
decorations with `d-none`, `d-lg-*`, `d-xl-*` and `d-xxl-*`.

This is a source review, not a visual browser test across actual devices.

## Desktop

- Hero content uses a half-width image/content split (`col-lg-6`).
- Home 07 sections use a wide custom `.container-2200` layout; the hero is
  full-bleed.
- The About feature collage, process chips, offset team cards, decorative
  stars, partner physics, cursor and scroll animations emphasize larger
  viewports.
- Mega-menu navigation is intended for desktop; the HTML also contains
  off-canvas structures.
- Very large headline/font utilities and large `container-2200` max width
  rules are present, including font sizes above 100px in global styles.

**Potential desktop concerns:** large animated media and global CSS/JS are
heavy; a wide custom container and oversized display type need review at
standard laptop widths, not just very wide screens. With pointer-specific
effects, provide equivalent static/keyboard interactions.

## Tablet

- Bootstrap `col-lg-*` sections remain full-width until the large breakpoint;
  other `col-md-*` grid items can become two columns from medium widths.
- The Header's inline menu behavior is keyed by the Home 07 class and
  responsive visibility; mega-menu content is extensive.
- Main CSS has tablet font, spacing, and card adjustments at 768-991px and
  992-1199px.
- Some decorative elements are hidden or changed at medium widths.

**Potential tablet concerns:** the custom staircase layouts (feature/stat
grid and team grid) should be checked for vertical order, collisions and
readability at tablet widths. Bootstrap's source declarations suggest
responsiveness but do not prove every custom absolute/staggered position has
been visually tested.

## Mobile

- Grid columns typically fall back to `col-12`; the Hero image/content and
  mission section stack.
- The header's compact menu and off-canvas controls provide a mobile
  navigation path.
- Process waterfall chips are explicitly `d-none d-lg-flex`, so they are not
  displayed on smaller screens; the process cards remain.
- Some large arrow/decorative elements are hidden at small widths; global
  CSS reduces heading sizes and disables some `.scroll-move-up` behavior
  below 992px.
- Lazy loading is used on several later-section images, but not consistently
  across every image.

**Potential mobile concerns:**

- `overflow-hidden` is used on multiple sections while decorative objects
  and animation transforms extend beyond their boxes; verify no content or
  keyboard focus indicator is clipped.
- The Home 07 mobile menu clones a large desktop mega-menu hierarchy; its
  usability, keyboard focus, escape-to-close behavior, and screen-reader
  state should be verified.
- The two separate off-canvas/menu patterns and duplicate social/contact
  markup increase the chance of inconsistent mobile behavior.
- Motion-heavy text and cursor interactions need reduced-motion and
  touch-friendly behavior; the CSS `prefers-reduced-motion` rule does not
  guarantee that all JS animation paths are disabled.
- Required phone entry in the contact form may be unnecessary friction for
  prospective contacts, but changing that is a content/product decision.

## Overall responsiveness assessment

There is a substantial responsive foundation, mostly Bootstrap grid behavior
plus many targeted CSS media rules. It is not possible to certify the actual
visual outcome without browser/device validation. Before adapting the template,
check at representative phone, tablet, laptop and wide desktop dimensions and
confirm focus, reduced motion, menu behavior, image cropping and overflow.

## Evidence

- Responsive grid and visibility classes:
  `template-source/index-7-dark.html`, especially lines 565-700, 1,092-1,259,
  and 1,260-1,385.
- Breakpoint rules: `template-source/assets/css/main.css`, including near
  lines 436-1,081 and 2,340-2,550.
- Motion preference and mobile animation paths:
  `template-source/assets/css/main.css` around line 3,106 and
  `template-source/assets/js/main.js` around lines 2,590-2,650.
