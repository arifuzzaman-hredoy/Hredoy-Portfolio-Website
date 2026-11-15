# 02 - Homepage Section Analysis

## Page identity

`template-source/index-7-dark.html` declares `lang="en"`,
`data-bs-theme="dark"`, the title **“Orisa - Advancing Startup Innovation”**
and a generic Orisa agency description. This is the Startup Agency demo, not
yet a personal DevOps portfolio. Homepage content, sample contacts, locations,
team names, articles, partner marks and metrics are demo data.

## Header and navigation

The page begins with a search overlay and then a transparent `header-7`
(HTML lines 26-365). The brand is an Orisa wordmark paired with
`assets/imgs/template/logo/favicon-dark.svg`. The desktop navigation has
Home, Page, Portfolio and blog/shop-oriented dropdowns with many destinations
that are absent from this package. A header search control and a separate
hamburger/off-canvas structure are present. The mobile menu button has
`aria-controls="header7Nav"` and `aria-expanded`; the off-canvas markup has a
second menu structure and sample contact/social information.

The `index-7-dark.html` footer link is labelled Home but links to `index-7.html`
(the light demo name), while the selected dark file is `index-7-dark.html`.
This is a destination mismatch to resolve when routes are implemented.

## Main content, in document order

The `<main>` block (lines 563-1,644) contains eleven sections:

1. **Hero - Advancing Startup Innovation** (`sec-1-home-7`, lines 565-700):
   split vermilion/maroon background, oversized “Advancing Startup
   Innovation” heading, VR image, startup copy, service tag links, CTA,
   coordinates, avatar stack and social-proof number. Decorative star and
   staggered/fade effects are included.
2. **We Power the World's Fastest Growing Startups** (`sec-2-home-7`,
   lines 701-810): agency/about copy, a staggered collage, three feature
   statements (Velocity First, Product Thinking, Scalable Core) and three
   animated metrics (168+, 50k+, 98%). These are static sample content, not
   portfolio skills.
3. **Image carousel** (`home-2-section-8`, lines 811-842): five-slide Swiper
   image strip; it has no heading or descriptive copy in the markup.
4. **Our mission / locations** (`sec-4-home-7`, lines 843-914): large
   mission statement, image, CTA, and two Chicago/New York contact/location
   blocks with phone/email links.
5. **Specialized services** (`sec-5-home-7`, lines 915-1,091): service
   headline, founder image, four-item Bootstrap accordion for MVP Development,
   Product Design, Scalable Engineering and Growth & Strategy; followed by a
   partner-logo field animated as throwable objects.
6. **The Process** (`sec-6-home-7`, lines 1,092-1,193): four process cards:
   Discovery & MVP Strategy, Rapid Prototyping, Agile Development, and Launch
   & Scale. The desktop additionally shows a staggered waterfall of chips.
7. **Ready to Build the Future? CTA** (`sec-7-home-7`, lines 1,194-1,259):
   image, short pitch, four feature bullets and a contact-page CTA.
8. **Dedicated Team** (`sec-8-home-7`, lines 1,260-1,385): explanatory copy
   and four staggered team cards with demo names/roles (Darrell Steward,
   Amelia Courtney, Esther Howard and Jacob Jones).
9. **Marquee** (`sec-9-home-7`, lines 1,386-1,491): two opposing ticker rows
   repeating marketing/product terms. This is not a projects/portfolio grid.
10. **Insights for Founders** (`sec-10-home-7`, lines 1,492-1,592): four
    article cards with demo authors, dates, images and links to blog pages.
11. **Get in touch** (`sec-11-home-7`, lines 1,593-1,643): name, email,
    required phone and message fields; the form posts to `#` and has no
    server endpoint.

## Footer

`footer-7` (lines 1,646-1,850) includes Home/About/Works/Blog/Contact links,
five social links, sample phone/email/address and hours, an email newsletter
form, and oversized “ELEVATE STARTUPS” text. Newsletter submission also points
to `#`. Footer contact links and social `href="#"` values are template
placeholders.

## Requested portfolio concepts not present

- **Skills:** no dedicated DevOps skills/technology section.
- **Projects/portfolio:** no project case-study portfolio grid; the marquee
  and agency process cards are not project evidence.
- **Professional experience:** no work-history/timeline section.
- **Testimonials:** no section labelled or structured as testimonials. The
  avatar stack and metrics in the hero/about copy are social-proof styling,
  not attributed testimonial content.

## Evidence

Section comments and identifiers are in `template-source/index-7-dark.html`,
lines 565, 701, 811, 843, 915, 1,092, 1,194, 1,260, 1,386, 1,492, 1,593 and
1,646. The rest of each section follows its corresponding comment.
