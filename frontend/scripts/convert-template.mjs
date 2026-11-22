// ⚠️ REGENERATION WARNING — READ BEFORE RUNNING THIS SCRIPT
//
// This script rebuilds src/components/public/HomeContent.tsx from the original
// Orisa template HTML. The output is a plain markup dump: it does NOT know about
// the CMS wiring in src/lib/cms-render.ts.
//
// If you regenerate HomeContent.tsx:
//   1. Every rule in cms-render.ts matches literal markup (class names, text,
//      attribute values). Any markup the generator changes will silently break
//      that rule — the CMS value will no longer be applied and the page will
//      fall back to the hardcoded text.
//   2. The responsive hero badge markup (sec-1-home-7__proof / __tags) and the
//      brand-logo dark-mode rules live in the generator's REPLACEMENTS list;
//      regenerating from a fresh template will drop them.
//
// Prefer editing HomeContent.tsx and the generator together. After any
// regeneration, diff the output and re-check every cms-render.ts rule.

import fs from "node:fs";

const SRC = process.argv[2];
const OUT = process.argv[3];

let html = fs.readFileSync(SRC, "utf8");

// Extract body inner content
const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
if (!bodyMatch) {
  console.error("No <body> found");
  process.exit(1);
}
let body = bodyMatch[1];

// Remove all <script>...</script> blocks (scripts loaded via ScriptLoader)
body = body.replace(/<script[\s\S]*?<\/script>/gi, "");

// ------------------------------------------------------------------
// DATA REPLACEMENTS — swap Orisa demo content for Hredoy's real data
// Order matters: most specific first.
// Each entry: [find, replace] — literal string replace (all occurrences).
// ------------------------------------------------------------------
const REPLACEMENTS = [
  // ---- Brand / header ----
  ['alt="Orisa"', 'alt="Hredoy"'],
  ['>Orisa</p>', '>Hredoy</p>'],
  ['class="invert-0" src="assets/imgs/template/logo/favicon-dark.svg"', 'class="invert-0" src="/assets/imgs/template/logo/favicon-dark.svg"'],
  ['src="assets/imgs/template/logo/favicon.svg" alt="Orisa"', 'src="/assets/imgs/template/logo/favicon.svg" alt="Hredoy"'],

  // ---- Hero coords (element removed from hero; kept as no-op guard) ----
  ['data-scramble-text="27.1127&deg; S, 109.3497&deg; W">27.1127&deg; S, 109.3497&deg; W', ''],

  // ---- Hero tag chips ----
  // One tag per technology that has no logo badge of its own, so nothing in the
  // hero row is shown twice. Keep this list in sync with div.sec-1-home-7__tags.
  ['<span>MVP Launch</span>', '<span>Linux</span>'],
  ['<span>Product Design</span>', '<span>CI/CD</span>'],
  ['<span>Scalable Tech</span>', '<span>Git</span>'],
  ['<span>Growth Strategy</span>', '<span>Nginx</span>'],
  ['<span>UI/UX Excellence</span>', '<span>GitHub Actions</span>'],

  // ---- Hero brackets ----
  ['<li class="at_fade_anim" data-start="100%" data-delay="0.2">[ GROW ]</li>', '<li class="at_fade_anim" data-start="100%" data-delay="0.2">[ AUTOMATE ]</li>'],
  ['<li class="at_fade_anim" data-start="100%" data-delay="0.4">[ BOOST ]</li>', '<li class="at_fade_anim" data-start="100%" data-delay="0.4">[ DEPLOY ]</li>'],

  // ---- Hero headline ----
  ['Advancing Startup Innovation', 'Junior DevOps Engineer'],

  // ---- Hero description ----
  ['From MVP launch to global scaling, we provide the strategic design and high-performance technology startups need to dominate their market. Our team delivers products that matter.',
    "I'm Arifuzzaman Hredoy, a Junior DevOps Engineer passionate about Linux, Cloud Computing, Automation, CI/CD, and Infrastructure as Code. Continuously building practical projects and production-oriented engineering skills."],

  // ---- Hero CTA ----
  ['<span>Start Your Journey</span>', '<span>Get In Touch</span>'],
  ['aria-label="Start Your Journey"', 'aria-label="Get In Touch"'],

  // ---- Hero social proof ----
  ['500+ Ventures scaled with <br class="d-none d-xl-inline" />Orisa global expertise',
    'Building reliable infrastructure with <br class="d-none d-xl-inline" />modern DevOps practices'],
  ['alt="Client 1"', 'alt="Linux"'],
  ['alt="Client 2"', 'alt="Docker"'],
  ['alt="Client 3"', 'alt="Kubernetes"'],
  ['alt="Client 4"', 'alt="AWS"'],
  ['alt="Client 5"', 'alt="Terraform"'],

  // ---- Section 2: About ----
  ['data-scramble-text="About Us">About Us', 'data-scramble-text="About Me">About Me'],
  ['We Power the World&rsquo;s Fastest Growing Startups', 'Passionate About Building Reliable Infrastructure'],
  ['<strong>Orisa</strong> is more than a design agency; we are a strategic partner for founders who dare to disrupt. We <strong>combine rapid</strong> prototyping with world-class engineering to <strong>turn bold</strong> visions into market-leading digital products.',
    "I'm <strong>Arifuzzaman Hredoy</strong>, currently pursuing a Diploma in Engineering in Computer Science & Technology at Rangpur Polytechnic Institute. I'm building practical skills in <strong>Linux, Docker, Kubernetes, AWS, and CI/CD</strong> through hands-on projects."],

  // ---- Section 2: Features ----
  ['Velocity First', 'Linux Administration'],
  ['In the startup world, speed is life. We&rsquo;ve optimized our workflow to deliver high-fidelity MVPs in weeks, not months, without sacrificing quality.',
    'Managing and securing Linux servers, configuring services, and automating system tasks with Bash scripting.'],
  ['Product Thinking', 'Cloud & AWS'],
  ['We don&rsquo;t just build features; we build solutions. Our process focuses on user needs, business goals, and product-market fit from day one.',
    'Deploying and managing cloud infrastructure on AWS, working with EC2, S3, VPC, and other core services.'],
  ['Scalable Core', 'CI/CD & Automation'],
  ['We architect systems that grow with you. Our tech stack is designed to handle your first 1,000 users and your first 1,000,000 just as smoothly.',
    'Building automated pipelines with GitHub Actions, Docker, and Kubernetes for continuous integration and deployment.'],

  // ---- Section 2: Stats ----
  ['<span class="odometer" data-count="168">0</span>+', '<span class="odometer" data-count="12">0</span>+'],
  ['Countries where our partners have expanded globally', 'Core DevOps technologies I work with'],
  ['<span class="odometer" data-count="50">0</span>k+', '<span class="odometer" data-count="8">0</span>+'],
  ['Projects Carefully Crafted', 'Hands-on DevOps project areas'],
  ['<span class="odometer" data-count="98">0</span>%', '<span class="odometer" data-count="3">0</span>+'],
  ['Client retention and post-launch growth support.', 'Semesters completed in my Diploma'],

  // ---- Section 2: image alts ----
  ['src="assets/imgs/pages/home-7/sec2-img-1.webp" alt="orisa"', 'src="/assets/imgs/pages/home-7/sec2-img-1.webp" alt="Linux terminal"'],
  ['src="assets/imgs/pages/home-7/sec2-img-2.webp" alt="orisa"', 'src="/assets/imgs/pages/home-7/sec2-img-2.webp" alt="Cloud infrastructure"'],
  ['src="assets/imgs/pages/home-7/sec2-img-3.webp" alt="orisa"', 'src="/assets/imgs/pages/home-7/sec2-img-3.webp" alt="CI/CD pipeline"'],

  // ---- Section 4: Mission ----
  ['data-scramble-text="Our mission">Our mission', 'data-scramble-text="My Mission">My Mission'],
  ['More than an agency, we act as your startup partner, delivering intelligent, user focused solutions that drive growth and impact.',
    'Continuously learning and building practical DevOps skills to become a professional DevOps Engineer.'],
  ['<span class="text-1">Join our Team</span>', "<span class=\"text-1\">Let's Connect</span>"],
  ['<span class="text-2">Join our Team</span>', "<span class=\"text-2\">Let's Connect</span>"],
  ['aria-label="Join our Team"', 'aria-label="Let\'s Connect"'],
  ['src="assets/imgs/pages/home-7/sec-4-helmet.webp" alt="orisa"', 'src="/assets/imgs/pages/home-7/sec-4-helmet.webp" alt="DevOps"'],
  ['>We are here</h3>', '>Location</h3>'],
  ['205 North Michigan Avenue, Suite 810<br />Chicago, 60601, USA', 'Rangpur, Bangladesh'],
  ['<a href="tel:+11234567890" class="sec-4-home-7__loc-strong">(123) 456-7890</a>', '<a href="mailto:arifuzzamanhredoy@gmail.com" class="sec-4-home-7__loc-strong">arifuzzamanhredoy@gmail.com</a>'],
  ['Phone:\n                                                        <a href="mailto:arifuzzamanhredoy@gmail.com"', 'Email:\n                                                        <a href="mailto:arifuzzamanhredoy@gmail.com"'],
  ['<p class="mb-0">\n                                                        Email:\n                                                        <a href="mailto:hello@orisa.com" class="sec-4-home-7__loc-strong">hello@orisa.com</a>',
    '<p class="mb-0">\n                                                        GitHub:\n                                                        <a href="https://github.com/arifuzzaman-hredoy" class="sec-4-home-7__loc-strong">github.com/arifuzzaman-hredoy</a>'],
  ['245 Fifth Avenue, Suite 1800<br />New York, NY 10016, USA', 'Diploma in Engineering'],
  ['<a href="tel:+12125557398" class="sec-4-home-7__loc-strong">(212) 555-7398</a>', '<a href="https://github.com/arifuzzaman-hredoy" class="sec-4-home-7__loc-strong">Computer Science & Technology</a>'],
  ['<a href="mailto:sale@orisa.com" class="sec-4-home-7__loc-strong">sale@orisa.com</a>', '<a href="https://github.com/arifuzzaman-hredoy" class="sec-4-home-7__loc-strong">Rangpur Polytechnic Institute</a>'],

  // ---- Section 5: Services -> Skills ----
  ['data-scramble-text="Specialized services">Specialized services', 'data-scramble-text="My Skills">My Skills'],
  ['We Build Products That Founders Dream Of.', 'Building Skills for the Future of DevOps.'],
  ['<span class="text-1">Get a free quote</span>', '<span class="text-1">Get In Touch</span>'],
  ['<span class="text-2">Get a free quote</span>', '<span class="text-2">Get In Touch</span>'],
  ['aria-label="Get a free quote"', 'aria-label="Get In Touch"'],
  ['src="assets/imgs/pages/home-7/sec-5-founder.webp" alt="Founder working at a desk"', 'src="/assets/imgs/pages/home-7/sec-5-founder.webp" alt="DevOps Engineer"'],
  ['>01. MVP Development</span>', '>01. Linux Administration</span>'],
  ['Go from idea to a high-fidelity, functional product in record time. We focus on the core features that prove your concept and win over early adopters.',
    'Managing and securing Linux servers, configuring services, and automating system tasks with Bash scripting.'],
  ['<span class="sec-5-home-7__tag">Prototyping</span>', '<span class="sec-5-home-7__tag">Ubuntu</span>'],
  ['<span class="sec-5-home-7__tag">Fast-track Dev</span>', '<span class="sec-5-home-7__tag">Bash</span>'],
  ['<span class="sec-5-home-7__tag">User Validation</span>', '<span class="sec-5-home-7__tag">Server Security</span>'],
  ['>02. Product Design</span>', '>02. Containerization</span>'],
  ['We craft intuitive interfaces and immersive user experiences that make your startup feel premium and established from day one.',
    'Building and deploying containerized applications using Docker and Docker Compose for consistent environments.'],
  ['<span class="sec-5-home-7__tag">UI/UX Design</span>', '<span class="sec-5-home-7__tag">Docker</span>'],
  ['<span class="sec-5-home-7__tag">Design Systems</span>', '<span class="sec-5-home-7__tag">Docker Compose</span>'],
  ['<span class="sec-5-home-7__tag">Visual Storytelling</span>', '<span class="sec-5-home-7__tag">Container Registry</span>'],
  ['>03. Scalable Engineering</span>', '>03. CI/CD Pipelines</span>'],
  ['Modern tech stacks built for growth. We architect clean, secure, and high-performance systems that handle traffic spikes without a blink.',
    'Creating automated build and deployment pipelines with GitHub Actions for continuous integration and delivery.'],
  ['<span class="sec-5-home-7__tag">Next.js</span>', '<span class="sec-5-home-7__tag">GitHub Actions</span>'],
  ['<span class="sec-5-home-7__tag">Cloud Architecture</span>', '<span class="sec-5-home-7__tag">Automation</span>'],
  ['<span class="sec-5-home-7__tag">API Integration</span>', '<span class="sec-5-home-7__tag">Deployment</span>'],
  ['>04. Growth &amp; Strategy</span>', '>04. Cloud Infrastructure</span>'],
  ['Launching is just the start. We provide the data-driven insights and technical optimizations needed to scale your user base and retain them.',
    'Deploying and managing cloud infrastructure on AWS, working with EC2, S3, VPC, and other core services.'],
  ['<span class="sec-5-home-7__tag">Performance Opt</span>', '<span class="sec-5-home-7__tag">AWS</span>'],
  ['<span class="sec-5-home-7__tag">A/B Testing</span>', '<span class="sec-5-home-7__tag">EC2</span>'],
  ['<span class="sec-5-home-7__tag">Scalability Audit</span>', '<span class="sec-5-home-7__tag">S3</span>'],
  ['Collaborating with the world’s most ambitious companies to redefine what’s possible.',
    'Continuously learning and expanding my DevOps skillset across the modern cloud-native stack.'],

  // ---- Section 6: Process -> My Journey ----
  ['data-scramble-text="The Growth Engine">The Growth Engine', 'data-scramble-text="My Journey">My Journey'],
  ['Honest strategies for ambitious founders. How we take your vision from a bold concept to a market-ready digital product.',
    'My systematic approach to becoming a DevOps Engineer, from fundamentals to advanced practices.'],
  ['<span class="sec-6-home-7__chip-text">Discovery &amp; MVP Strategy</span>', '<span class="sec-6-home-7__chip-text">Learn Fundamentals</span>'],
  ['<span class="sec-6-home-7__chip-text">Rapid Prototyping</span>', '<span class="sec-6-home-7__chip-text">Practice Daily</span>'],
  ['<span class="sec-6-home-7__chip-text">Agile Development</span>', '<span class="sec-6-home-7__chip-text">Build Projects</span>'],
  ['<span class="sec-6-home-7__chip-text">Launch &amp; Scale</span>', '<span class="sec-6-home-7__chip-text">Keep Improving</span>'],
  ['>Discovery &amp; MVP Strategy</h3>', '>Learn Fundamentals</h3>'],
  ['Defining product-market fit by identifying core features that deliver maximum user value with minimum time-to-market.',
    'Understanding the fundamentals of Linux, networking, and cloud computing through hands-on practice and coursework.'],
  ['alt="Discovery &amp; MVP Strategy"', 'alt="Learn Fundamentals"'],
  ['>Rapid Prototyping</h3>', '>Hands-on Practice</h3>'],
  ['Transforming strategy into interactive prototypes to validate your vision before moving into full-scale engineering.',
    'Building practical projects with Docker, CI/CD pipelines, and cloud infrastructure to apply theoretical knowledge.'],
  ['alt="Rapid Prototyping"', 'alt="Hands-on Practice"'],
  ['>Agile Development</h3>', '>Project Development</h3>'],
  ['Building a scalable, high-performance core using modern tech stacks that founders and investors can lean on.',
    'Creating real-world DevOps projects like automated deployments, infrastructure provisioning, and monitoring solutions.'],
  ['alt="Agile Development"', 'alt="Project Development"'],
  ['>Launch &amp; Scale</h3>', '>Continuous Improvement</h3>'],
  ['Deploying, refining, and architecting the technical support needed to grow from your first user to your first million.',
    'Refining skills, exploring new tools, and staying updated with the latest DevOps practices and technologies.'],
  ['alt="Launch &amp; Scale"', 'alt="Continuous Improvement"'],

  // ---- Section 7: CTA ----
  ['data-scramble-text="Ready to Build the Future ?">Ready to Build the Future ?', 'data-scramble-text="Ready to Build the Future ?">Ready to Build the Future ?'],
  ['Stop dreaming, start executing. Whether you\'re at the &quot;napkin sketch&quot; stage or ready to scale, we&rsquo;re here to ignite your journey.',
    "Let's work together to build reliable, scalable infrastructure for your next project."],
  ['<span>Research insights summary</span>', '<span>Practical DevOps skills</span>'],
  ['<span>Clear problem statements</span>', '<span>Real-world projects</span>'],
  ['<span>Opportunity mapping</span>', '<span>Continuous learning</span>'],
  ['<span>Prioritized initiatives</span>', '<span>Production mindset</span>'],
  ['<span class="text-1">Launch Your Project</span>', '<span class="text-1">Start Your Journey</span>'],
  ['<span class="text-2">Launch Your Project</span>', '<span class="text-2">Start Your Journey</span>'],
  ['aria-label="Launch Your Project"', 'aria-label="Start Your Journey"'],
  ['src="assets/imgs/pages/home-7/sec-7-photo.webp" alt="orisa"', 'src="/assets/imgs/pages/home-7/sec-7-photo.webp" alt="DevOps"'],

  // ---- Section 8: Team -> About Me ----
  ['data-scramble-text="Meet Our Team">Meet Our Team', 'data-scramble-text="About Me">About Me'],
  ['>Dedicated Team\n                                </h2>', '>Arifuzzaman Hredoy\n                                </h2>'],
  ['Creative experts designing meaningful digital experiences that help ambitious brands grow faster and lead their markets.',
    'Junior DevOps Engineer passionate about Linux, Cloud Computing, Automation, CI/CD, and Infrastructure as Code. Continuously building practical projects and developing production-oriented engineering skills.'],
  ['aria-label="Darrell Steward — UI/UX Designer"', 'aria-label="Arifuzzaman Hredoy — Junior DevOps Engineer"'],
  ['<h3 class="sec-8-home-7__name mb-0 at_fade_anim">Darrell <br />Steward</h3>', '<h3 class="sec-8-home-7__name mb-0 at_fade_anim">Arifuzzaman <br />Hredoy</h3>'],
  ['<p class="sec-8-home-7__role mb-0 at_fade_anim" data-delay="0.1">UI/UX Designer</p>', '<p class="sec-8-home-7__role mb-0 at_fade_anim" data-delay="0.1">Junior DevOps Engineer</p>'],
  ['src="assets/imgs/pages/home-7/team-1-darrell.webp" alt="Darrell Steward"', 'src="/assets/imgs/pages/home-7/team-1-darrell.webp" alt="Arifuzzaman Hredoy"'],

  // ---- Section 10: Blog ----
  ['data-scramble-text="Inside Startup">Inside Startup', 'data-scramble-text="Blog">Blog'],
  ['>Insights for <br class="d-none d-sm-inline" />Founders</h2>', '>Latest <br class="d-none d-sm-inline" />Insights</h2>'],
  ['Explore expert perspectives on product scaling, venture capital, and the engineering behind the world&rsquo;s most successful digital products.',
    'Sharing my learning journey and technical insights on DevOps, cloud computing, and automation.'],
  ['<span>All insights</span>', '<span>All Posts</span>'],
  ['The MVP Roadmap: How to Ship Faster Without Losing Quality', "Getting Started with Docker: A Beginner's Guide"],
  ['Scalable Architecture: Building Systems That Grow with Your Users', 'Understanding CI/CD Pipelines with GitHub Actions'],
  ['Fundraising Design: Crafting Pitch Decks That Close Seed Rounds', 'Linux Server Administration Essentials'],
  ['Product-Market Fit: Why User Validation is Your Strongest Asset', 'Infrastructure as Code with Terraform'],
  ['<a href="team-details.html" class="blog-card__author">Olivia</a>', '<a href="team-details.html" class="blog-card__author">Hredoy</a>'],
  ['<a href="team-details.html" class="blog-card__author">Daniel</a>', '<a href="team-details.html" class="blog-card__author">Hredoy</a>'],
  ['<a href="team-details.html" class="blog-card__author">Emma</a>', '<a href="team-details.html" class="blog-card__author">Hredoy</a>'],
  ['<a href="team-details.html" class="blog-card__author">Lucas</a>', '<a href="team-details.html" class="blog-card__author">Hredoy</a>'],
  ['alt="orisa"', 'alt="DevOps"'],

  // ---- Section 11: Contact ----
  ['data-scramble-text="Contact us">Contact us', 'data-scramble-text="Contact Me">Contact Me'],

  // ---- IMAGE REPLACEMENTS (old webp -> new devops jpg; filename-only so
  //      it matches with or without a leading slash) ----
  ['home-7/hero-vr.webp', 'home-7/hero.jpg'],
  ['home-7/sec2-img-1.webp', 'home-7/linux.jpg'],
  ['home-7/sec2-img-2.webp', 'home-7/cloud.jpg'],
  ['home-7/sec2-img-3.webp', 'home-7/cicd.jpg'],
  ['home-7/sec-4-helmet.webp', 'home-7/devops.jpg'],
  ['home-7/sec-5-founder.webp', 'home-7/engineer.jpg'],
  ['home-7/sec-7-photo.webp', 'home-7/security.jpg'],
  ['home-7/team-1-darrell.webp', 'home-7/team-1.jpg'],
  ['home-7/step-1.webp', 'home-7/step-1.jpg'],
  ['home-7/step-2.webp', 'home-7/step-2.jpg'],
  ['home-7/step-3.webp', 'home-7/step-3.jpg'],
  ['home-7/step-4.webp', 'home-7/step-4.jpg'],
  ['home-7/avatar-1.webp', 'home-7/avatar-1.jpg'],
  ['home-7/avatar-2.webp', 'home-7/avatar-2.jpg'],
  ['home-7/avatar-3.webp', 'home-7/avatar-3.jpg'],
  ['home-7/avatar-4.webp', 'home-7/avatar-4.jpg'],
  ['home-7/avatar-5.webp', 'home-7/avatar-5.jpg'],
  ['home-7/insight-1-retro.webp', 'home-7/blog-docker.jpg'],
  ['home-7/insight-2-office.webp', 'home-7/blog-cicd.jpg'],
  ['home-7/insight-3-fabric.webp', 'home-7/blog-linux.jpg'],
  ['home-7/insight-4-conference.webp', 'home-7/blog-terraform.jpg'],
  ['pages/img-45.webp', 'pages/img-45.jpg'],
  ['pages/img-46.webp', 'pages/img-46.jpg'],
  ['pages/img-47.webp', 'pages/img-47.jpg'],
  ['pages/img-48.webp', 'pages/img-48.jpg'],
  ['pages/img-49.webp', 'pages/img-49.jpg'],

  // ---- Footer ----
  ['<span>Works</span>', '<span>Skills</span>'],
  ['mailto:hello@aleric.com', 'mailto:arifuzzamanhredoy@gmail.com'],
  ['hello@orisa.com', 'arifuzzamanhredoy@gmail.com'],
  ['hello@aleric.com', 'arifuzzamanhredoy@gmail.com'],
  ['<a href="tel:+12125557398">+212 - 555-7398</a>', '<a href="https://github.com/arifuzzaman-hredoy">github.com/arifuzzaman-hredoy</a>'],
  ['<a href="mailto:hello@orisa.com">hello@orisa.com</a>', '<a href="mailto:arifuzzamanhredoy@gmail.com">arifuzzamanhredoy@gmail.com</a>'],
  ['245 Fifth Avenue, Suite 1800<br />New York, NY 10016, USA', 'Rangpur, Bangladesh'],
  ['<p class="footer-7__hours-label mb-1">Mo - Sa</p>', '<p class="footer-7__hours-label mb-1">Open to</p>'],
  ['<p class="footer-7__hours-value mb-0">9am - 5pm</p>', '<p class="footer-7__hours-value mb-0">Remote & On-site</p>'],
  ['Sign up for<br />our monthly newsletter', 'Let\'s build something<br />amazing together'],
  ['<span class="text-1">Subscribe Now</span>', '<span class="text-1">Get In Touch</span>'],
  ['<span class="text-2">Subscribe Now</span>', '<span class="text-2">Get In Touch</span>'],
  ['>ELEVATE STARTUPS</h2>', '>DEVOPS ENGINEER</h2>'],
  ['>Orisa © 2026</span>', '>Arifuzzaman Hredoy © 2026</span>'],

  // ---- Footer socials -> GitHub / LinkedIn / Email ----
  ['aria-label="Twitter"', 'aria-label="GitHub"'],
  ['>\n                                                    Twitter\n                                                </div>', '>\n                                                    GitHub\n                                                </div>'],
  ['aria-label="Facebook"', 'aria-label="LinkedIn"'],
  ['>\n                                                    Facebook\n                                                </div>', '>\n                                                    LinkedIn\n                                                </div>'],
  ['aria-label="Instagram"', 'aria-label="Email"'],
  ['>\n                                                    Instagram\n                                                </div>', '>\n                                                    Email\n                                                </div>'],
  ['aria-label="Youtube"', 'aria-label="GitHub"'],
  ['>\n                                                    Youtube\n                                                </div>', '>\n                                                    GitHub\n                                                </div>'],
];

for (const [find, repl] of REPLACEMENTS) {
  if (body.includes(find)) {
    body = body.split(find).join(repl);
  }
}

// Remove the 3 extra (fake) team cards — keep only Hredoy. Hredoy is solo.
// Card 2 (Amelia), Card 3 (Esther), Card 4 (Jacob) each are <a ... team-details ...>...</a> blocks.
// Remove anchor cards that still reference the fake members.
body = body.replace(/\s*<a href="team-details\.html" class="sec-8-home-7__card[^"]*" aria-label="Amelia Courtney[\s\S]*?<\/a>/g, "");
body = body.replace(/\s*<a href="team-details\.html" class="sec-8-home-7__card[^"]*" aria-label="Esther Howard[\s\S]*?<\/a>/g, "");
body = body.replace(/\s*<a href="team-details\.html" class="sec-8-home-7__card[^"]*" aria-label="Jacob Jones[\s\S]*?<\/a>/g, "");
// Remove the now-empty offset column wrapper (col--offset) to keep layout clean
body = body.replace(/\s*<div class="sec-8-home-7__col sec-8-home-7__col--offset">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g, "");

// Fix all remaining asset paths: assets/ -> /assets/
body = body.replace(/(src|href|poster)="assets\//g, '$1="/assets/');
body = body.replace(/data-background="assets\//g, 'data-background="/assets/');

// Trim
body = body.replace(/^\s*\n/, "").replace(/\s*$/, "");

// Embed as a template literal, escaping backticks, ${ and backslashes.
const escaped = body
  .replace(/\\/g, "\\\\")
  .replace(/`/g, "\\`")
  .replace(/\$\{/g, "\\${");

const component = `"use client";
// AUTO-GENERATED from the original Orisa index-7-dark.html template body,
// with all demo data replaced by Arifuzzaman Hredoy's real portfolio data.
// Rendered verbatim via dangerouslySetInnerHTML so the browser parses the
// original markup exactly (identical design + animations).
// Regenerate with: node scripts/convert-template.mjs
//
// Phase 2: CMS-managed values (content blocks + projects + owner identity) are
// injected at render time by applyCMSContent; the static markup below is the
// fallback. Phase 3: CMS-managed image URLs and alt text are injected by
// applySiteImages, and the repeatable homepage lists (nav dropdowns, hero pills,
// skills, process, marquee, CTA, footer) by applyContentItems. The Certificates
// section is inserted between Featured Projects and Contact by
// insertCertificatesSection.
//
// Regenerating this file drops the extra props below (defaults, imageAlts,
// identity, lists, certificatesHTML) because the generator has no way to know
// about them. Re-add them after regenerating, or the CMS silently stops
// applying.

import {
  applyCMSContent,
  applyContentItems,
  applySiteImages,
  type ContentGroups,
  type Project,
} from "@/lib/cms-render";
import { insertCertificatesSection } from "@/lib/certificates-render";

const BODY_HTML = \`${escaped}\`;

type HomeContentProps = {
  content?: Record<string, string>;
  defaults?: Record<string, string>;
  projects?: Project[];
  lists?: ContentGroups;
  images?: Record<string, string>;
  imageAlts?: Record<string, string>;
  mobileImages?: Record<string, string>;
  identity?: Record<string, string>;
  certificatesHTML?: string;
};

export default function HomeContent({
  content,
  defaults,
  projects,
  lists,
  images,
  imageAlts,
  mobileImages,
  identity,
  certificatesHTML,
}: HomeContentProps) {
  let html = applyCMSContent(BODY_HTML, content ?? {}, defaults ?? {}, projects ?? [], identity ?? {});
  html = applyContentItems(html, lists ?? {});
  html = applySiteImages(html, images ?? {}, imageAlts ?? {}, mobileImages ?? {});
  html = insertCertificatesSection(html, certificatesHTML ?? "");
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
`;

fs.writeFileSync(OUT, component, "utf8");
console.log("Wrote", OUT, "(" + component.length + " bytes)");
console.log("Applied", REPLACEMENTS.length, "replacement rules");