"use client";
// AUTO-GENERATED from the original Orisa index-7-dark.html template body,
// with all demo data replaced by Arifuzzaman Hredoy's real portfolio data.
// Rendered verbatim via dangerouslySetInnerHTML so the browser parses the
// original markup exactly (identical design + animations).
// Regenerate with: node scripts/convert-template.mjs
//
// Phase 2: CMS-managed values (content blocks + projects) are injected at
// render time by applyCMSContent; the static markup below is the fallback.

import { applyCMSContent, applySiteImages, type Project } from "@/lib/cms-render";

const BODY_HTML = `    <!-- prettier-ignore -->
    <!--search-form-start -->
    <div class="at-search-body-overlay"></div>
    <div class="at-search-form-toggle">
        <div class="container">
            <div class="row mb-60">
                <div class="col-lg-12">
                    <div class="at-search-top d-flex justify-content-between align-items-center">
                        <div class="at-header-logo at-search-logo">
                            <a href="/">
                                <img data-width="30" width="256" height="256" src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/brand-logo.png" alt="Hredoy">
                                <p class="h6 fw-700 fz-24 mb-0">Hredoy</p>
                            </a>
                        </div>
                        <button class="at-search-close">
                            <i class="fa-light fa-xmark"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="row justify-content-center">
                <div class="col-lg-12">
                    <div class="at-search-form">
                        <form action="#">
                            <div class="at-search-form-input">
                                <input type="text" placeholder="Find what you need…" required>
                                <span class="at-search-focus-border"></span>
                                <button class="at-search-form-btn at-btn" type="submit">
                                    <span>
                                        <span class="text-1">Search</span>
                                        <span class="text-2">Search</span>
                                    </span>
                                    <i class="icon-arrow-right">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="12" viewBox="0 0 14 12" fill="none">
                                            <path d="M8.33333 1L13 5.66667M13 5.66667L8.33333 10.3333M13 5.66667H1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="12" viewBox="0 0 14 12" fill="none">
                                            <path d="M8.33333 1L13 5.66667M13 5.66667L8.33333 10.3333M13 5.66667H1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                    </i>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="col-12">
                    <div class="at-categories">
                        <h3 class="at-categories-title">Popular searches</h3>
                                <ul class="at-categories-list">
                                    <li><a href="#" class="at-categories-item">CI/CD</a></li>
                                    <li><a href="#" class="at-categories-item">Kubernetes</a></li>
                                    <li><a href="#" class="at-categories-item">Docker</a></li>
                                    <li><a href="#" class="at-categories-item">Linux</a></li>
                                    <li><a href="#" class="at-categories-item">Cloud</a></li>
                                    <li><a href="#" class="at-categories-item">Automation</a></li>
                                    <li><a href="#" class="at-categories-item">Terraform</a></li>
                                    <li><a href="#" class="at-categories-item">Git</a></li>
                                    <li><a href="#" class="at-categories-item">AWS</a></li>
                                    <li><a href="#" class="at-categories-item">DevOps</a></li>
                                </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- search-form-end -->
    <header class="header-7">
        <!-- header 1 area start -->
        <div class="at-header-area at-header-spacing header-transparent">
            <div class="container">
                <div class="row align-items-center">
                    <div class="col-xl-2 col-6">
                        <div class="at-header-logo">
                            <a href="/">
                                <img data-width="30" class="invert-0" width="256" height="256" src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/brand-logo.png" alt="Hredoy" />
                                <p class="h6 fw-700 fz-24 text-white mb-0">Hredoy</p>
                            </a>
                        </div>
                    </div>
                    <div class="col-xl-10 col-6">
                        <div class="at-header-right gap-3 d-flex justify-content-end align-items-center">
                            <div id="header7Nav" class="at-main-menu menu-light d-inline-flex justify-content-center style-1" aria-label="Primary navigation">
                                <nav class="at-mobile-menu-active">
                                    <ul>
                                        <li><a href="/">Home</a></li>
                                        <li class="has-dropdown">
                                            <a href="#">Skills</a>
                                            <div class="at-submenu submenu at-megamenu">
                                                <div class="row">
                                                    <div class="col-xl-6">
                                                        <div class="at-megamenu-box">
                                                            <div class="at-megamenu-title-wrap">
                                                                <span class="at-megamenu-title">Core DevOps</span>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
                                                                    <path d="M10.0208 3.41421L1.41421 12.0208L0 10.6066L8.60659 2H1.02082V0H12.0208V11H10.0208V3.41421Z" fill="currentColor" />
                                                                </svg>
                                                            </div>
                                                            <ul>
                                                                <li><a href="#skills">01. Linux Administration</a></li>
                                                                <li><a href="#skills">02. Docker &amp; Compose</a></li>
                                                                <li><a href="#skills">03. CI/CD with GitHub Actions</a></li>
                                                                <li><a href="#skills">04. Git &amp; GitHub</a></li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <div class="col-xl-6">
                                                        <div class="at-megamenu-box">
                                                            <div class="at-megamenu-title-wrap">
                                                                <span class="at-megamenu-title">Cloud &amp; Ops</span>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
                                                                    <path d="M10.0208 3.41421L1.41421 12.0208L0 10.6066L8.60659 2H1.02082V0H12.0208V11H10.0208V3.41421Z" fill="currentColor" />
                                                                </svg>
                                                            </div>
                                                            <ul>
                                                                <li><a href="#skills">05. AWS &amp; EC2</a></li>
                                                                <li><a href="#skills">06. Terraform (IaC)</a></li>
                                                                <li><a href="#skills">07. Prometheus &amp; Grafana</a></li>
                                                                <li><a href="#skills">08. DevSecOps with Trivy</a></li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                        <li class="has-dropdown">
                                            <a href="#">Projects</a>
                                            <ul class="at-submenu submenu">
                                                <li><a href="https://github.com/arifuzzaman-hredoy/DevSecOps-Monitoring-Kubernetes-Platform" target="_blank" rel="noopener">DevSecOps &amp; Kubernetes Platform</a></li>
                                                <li><a href="https://github.com/arifuzzaman-hredoy/Automated-CI-CD-Pipeline" target="_blank" rel="noopener">Automated CI/CD Pipeline</a></li>
                                                <li><a href="https://github.com/arifuzzaman-hredoy/AWS-Cloud-Infrastructure-EC2-Deployment" target="_blank" rel="noopener">AWS Cloud Infrastructure</a></li>
                                                <li><a href="https://github.com/arifuzzaman-hredoy/Terraform-Infrastructure-as-Code" target="_blank" rel="noopener">Terraform Infrastructure as Code</a></li>
                                                <li><a href="https://github.com/arifuzzaman-hredoy/Docker-compose-Multi-Tier-Platform" target="_blank" rel="noopener">Docker Compose Multi-Tier Platform</a></li>
                                                <li><a href="https://github.com/arifuzzaman-hredoy/Nginx-Reverse-Proxy-Domain-SSL" target="_blank" rel="noopener">Nginx Reverse Proxy &amp; SSL</a></li>
                                            </ul>
                                        </li>
                                        <li class="has-dropdown">
                                            <a href="#">Links</a>
                                            <ul class="at-submenu submenu">
                                                <li><a href="#about">About Me</a></li>
                                                <li><a href="mailto:arifuzzamanhredoy@gmail.com">Email</a></li>
                                                <li><a href="https://github.com/arifuzzaman-hredoy" target="_blank" rel="noopener">GitHub</a></li>
                                                <li><a href="https://www.linkedin.com/in/arifuzzaman-hredoy/" target="_blank" rel="noopener">LinkedIn</a></li>
                                            </ul>
                                        </li>
                                        <li><a href="#contact">Contact</a></li>
                                    </ul>
                                </nav>
                            </div>
                            <div class="at-main-menu menu-light style-1  gap-3 d-flex justify-content-end align-items-center">
                                <button class="at-header-menu-btn at-hamburger size-40 text-white" type="button" aria-controls="header7Nav" aria-expanded="false" aria-label="Toggle navigation">
                                    <span class="at-hamburger__box" aria-hidden="true">
                                        <span class="at-hamburger__bar"></span>
                                        <span class="at-hamburger__bar"></span>
                                        <span class="at-hamburger__bar"></span>
                                    </span>
                                </button>
                            </div>
                            <div class="at-main-menu menu-light style-1 gap-3 d-flex justify-content-end align-items-center">
                                <button class="at-header-search-btn at-search-click ms-2">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M18.7508 18.5233L13.5538 13.392M13.5538 13.392C14.9604 12.0032 15.7506 10.1196 15.7506 8.15551C15.7506 6.19144 14.9604 4.30782 13.5538 2.91902C12.1472 1.53022 10.2395 0.75 8.25028 0.75C6.26108 0.75 4.35336 1.53022 2.94678 2.91902C1.54021 4.30782 0.75 6.19144 0.75 8.15551C0.75 10.1196 1.54021 12.0032 2.94678 13.392C4.35336 14.7808 6.26108 15.561 8.25028 15.561C10.2395 15.561 12.1472 14.7808 13.5538 13.392Z" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </button>
                                <div class="dark-light-mode">
                                    <label for="switch" class="toggle dark-light-switcher">
                                        <input type="checkbox" class="input" id="switch" />
                                        <span class="icon icon--moon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <path d="M7.51166 0C6.33857 1.09609 5.6053 2.65694 5.6053 4.38904C5.6053 7.70586 8.29416 10.3947 11.611 10.3947C13.3431 10.3947 14.9039 9.66146 16 8.48836C15.7439 12.6798 12.2635 16 8.00757 16C3.58511 16 0 12.4149 0 7.99245C0 3.73655 3.32017 0.256105 7.51166 0Z" fill="white" />
                                            </svg>
                                        </span>
                                        <span class="icon icon--sun">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff" width="28" height="28">
                                                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"></path>
                                            </svg>
                                        </span>
                                    </label>
                                </div>
                                <button class="at-menu-bar at-header-sidebar-btn text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                        <path d="M1 2C1 1.73478 1.10536 1.48043 1.29289 1.29289C1.48043 1.10536 1.73478 1 2 1H6C6.26522 1 6.51957 1.10536 6.70711 1.29289C6.89464 1.48043 7 1.73478 7 2V6C7 6.26522 6.89464 6.51957 6.70711 6.70711C6.51957 6.89464 6.26522 7 6 7H2C1.73478 7 1.48043 6.89464 1.29289 6.70711C1.10536 6.51957 1 6.26522 1 6V2ZM11 2C11 1.73478 11.1054 1.48043 11.2929 1.29289C11.4804 1.10536 11.7348 1 12 1H16C16.2652 1 16.5196 1.10536 16.7071 1.29289C16.8946 1.48043 17 1.73478 17 2V6C17 6.26522 16.8946 6.51957 16.7071 6.70711C16.5196 6.89464 16.2652 7 16 7H12C11.7348 7 11.4804 6.89464 11.2929 6.70711C11.1054 6.51957 11 6.26522 11 6V2ZM1 12C1 11.7348 1.10536 11.4804 1.29289 11.2929C1.48043 11.1054 1.73478 11 2 11H6C6.26522 11 6.51957 11.1054 6.70711 11.2929C6.89464 11.4804 7 11.7348 7 12V16C7 16.2652 6.89464 16.5196 6.70711 16.7071C6.51957 16.8946 6.26522 17 6 17H2C1.73478 17 1.48043 16.8946 1.29289 16.7071C1.10536 16.5196 1 16.2652 1 16V12ZM11 12C11 11.7348 11.1054 11.4804 11.2929 11.2929C11.4804 11.1054 11.7348 11 12 11H16C16.2652 11 16.5196 11.1054 16.7071 11.2929C16.8946 11.4804 17 11.7348 17 12V16C17 16.2652 16.8946 16.5196 16.7071 16.7071C16.5196 16.8946 16.2652 17 16 17H12C11.7348 17 11.4804 16.8946 11.2929 16.7071C11.1054 16.5196 11 16.2652 11 16V12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- header area end -->

        <!-- sticky-menu-area -->
        <button id="header-sticky" class="hamburger-open-btn hamburger-sticky-menu">
            <span>MENU</span>
            <span class="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M4 5C4 4.73478 4.10536 4.48043 4.29289 4.29289C4.48043 4.10536 4.73478 4 5 4H9C9.26522 4 9.51957 4.10536 9.70711 4.29289C9.89464 4.48043 10 4.73478 10 5V9C10 9.26522 9.89464 9.51957 9.70711 9.70711C9.51957 9.89464 9.26522 10 9 10H5C4.73478 10 4.48043 9.89464 4.29289 9.70711C4.10536 9.51957 4 9.26522 4 9V5ZM14 5C14 4.73478 14.1054 4.48043 14.2929 4.29289C14.4804 4.10536 14.7348 4 15 4H19C19.2652 4 19.5196 4.10536 19.7071 4.29289C19.8946 4.48043 20 4.73478 20 5V9C20 9.26522 19.8946 9.51957 19.7071 9.70711C19.5196 9.89464 19.2652 10 19 10H15C14.7348 10 14.4804 9.89464 14.2929 9.70711C14.1054 9.51957 14 9.26522 14 9V5ZM4 15C4 14.7348 4.10536 14.4804 4.29289 14.2929C4.48043 14.1054 4.73478 14 5 14H9C9.26522 14 9.51957 14.1054 9.70711 14.2929C9.89464 14.4804 10 14.7348 10 15V19C10 19.2652 9.89464 19.5196 9.70711 19.7071C9.51957 19.8946 9.26522 20 9 20H5C4.73478 20 4.48043 19.8946 4.29289 19.7071C4.10536 19.5196 4 19.2652 4 19V15ZM14 15C14 14.7348 14.1054 14.4804 14.2929 14.2929C14.4804 14.1054 14.7348 14 15 14H19C19.2652 14 19.5196 14.1054 19.7071 14.2929C19.8946 14.4804 20 14.7348 20 15V19C20 19.2652 19.8946 19.5196 19.7071 19.7071C19.5196 19.8946 19.2652 20 19 20H15C14.7348 20 14.4804 19.8946 14.2929 19.7071C14.1054 19.5196 14 19.2652 14 19V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </span>
        </button>
        <!-- sticky-menu-end -->
    </header>
    <!-- at-offcanvus-area-start -->
    <div class="at-offcanvas-area">
        <div class="at-offcanvas">
            <div class="at-offcanvas-top d-flex align-items-center justify-content-between">
                <div class="at-offcanvas-logo">
                    <a href="/">
                        <img data-width="30" width="256" height="256" src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/brand-logo.png" alt="Hredoy">
                        <p class="h6 fw-700 fz-24 mb-0">Hredoy</p>
                    </a>
                </div>
                <div class="at-offcanvas-close-btn">
                    <button class="close-btn">
                        <svg width="37" height="38" viewBox="0 0 37 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.19141 9.80762L27.5762 28.1924" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M9.19141 28.1924L27.5762 9.80761" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
            <div class="at-offcanvas-content d-none d-xl-block">
                <h3 class="at-offcanvas-title">Hi, I'm Arifuzzaman Hredoy</h3>
                <p class="fz-font-lg">Junior DevOps Engineer passionate about Linux, Cloud Computing, Automation, CI/CD, and Infrastructure as Code. I build practical, automated systems through hands-on projects.</p>
            </div>
            <div class="at-offcanvas-menu d-xl-none pb-50">
                <nav></nav>
            </div>
            <div class="at-offcanvas-gallery d-none d-xl-block">
                <div class="sec-2-home-5__avatars-row d-flex gap-2">
                    <div class="sec-2-home-5__avatar-sm at-offcanvas-gallery-img">
                        <img class="img-cover" src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/offcanvas/avatar-1-linux.svg" alt="Linux" width="103" height="103">
                    </div>
                    <div class="sec-2-home-5__avatar-sm at-offcanvas-gallery-img">
                        <img class="img-cover" src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/offcanvas/avatar-2-docker.svg" alt="Docker" width="103" height="103">
                    </div>
                    <div class="sec-2-home-5__avatar-sm at-offcanvas-gallery-img">
                        <img class="img-cover" src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/offcanvas/avatar-3-aws.svg" alt="AWS" width="103" height="103">
                    </div>
                    <div class="sec-2-home-5__avatar-sm at-offcanvas-gallery-img">
                        <img class="img-cover" src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/offcanvas/avatar-4-github-actions.svg" alt="GitHub Actions" width="103" height="103">
                    </div>
                    <div class="sec-2-home-5__avatar-sm at-offcanvas-gallery-img">
                        <img class="img-cover" src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/offcanvas/avatar-5-terraform.svg" alt="Terraform" width="103" height="103">
                    </div>
                </div>
            </div>
            <div class="at-offcanvas-contact">
                <h4 class="h5 at-offcanvas-title sm">Get in touch</h4>
                <ul>
                    <li><a class="fz-font-lg" href="mailto:arifuzzamanhredoy@gmail.com">arifuzzamanhredoy@gmail.com</a></li>
                    <li><a class="fz-font-lg" href="https://github.com/arifuzzaman-hredoy" target="_blank" rel="noopener">github.com/arifuzzaman-hredoy</a></li>
                    <li><a class="fz-font-lg" href="https://www.linkedin.com/in/arifuzzaman-hredoy/" target="_blank" rel="noopener">linkedin.com/in/arifuzzaman-hredoy</a></li>
                    <li><span class="fz-font-lg">Rangpur, Bangladesh</span></li>
                </ul>
            </div>
            <div class="at-offcanvas-social">
                <p class="fz-font-lg">Find Me Online</p>
                <ul class="at-offcanvas-social__grid">
                    <li>
                        <a href="https://github.com/arifuzzaman-hredoy" class="at-offcanvas-social__link" aria-label="GitHub">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.7.08-.7 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.75.4-1.27.73-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" fill="currentColor"/></svg>
                            <span>GitHub</span>
                        </a>
                    </li>
                    <li>
                        <a href="https://www.linkedin.com/in/arifuzzaman-hredoy/" class="at-offcanvas-social__link" aria-label="LinkedIn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M15.3352 15.339H12.6697V11.1622C12.6697 10.1662 12.6495 8.8845 11.2807 8.8845C9.89102 8.8845 9.67872 9.9683 9.67872 11.0887V15.339H7.01322V6.75H9.57372V7.9207H9.60822C9.96602 7.2457 10.836 6.53325 12.1357 6.53325C14.8365 6.53325 15.336 8.3108 15.336 10.6245L15.3352 15.339ZM4.00275 5.57475C3.14475 5.57475 2.4555 4.88025 2.4555 4.026C2.4555 3.1725 3.1455 2.47875 4.00275 2.47875C4.85775 2.47875 5.55075 3.1725 5.55075 4.026C5.55075 4.88025 4.857 5.57475 4.00275 5.57475ZM5.33925 15.339H2.66625V6.75H5.33925V15.339ZM16.6687 0H1.32825C0.594 0 0 0.5805 0 1.29675V16.7033C0 17.4202 0.594 18 1.32825 18H16.6665C17.4 18 18 17.4202 18 16.7033V1.29675C18 0.5805 17.4 0 16.6665 0H16.6687Z" fill="currentColor"/></svg>
                            <span>LinkedIn</span>
                        </a>
                    </li>
                    <li>
                        <a href="mailto:arifuzzamanhredoy@gmail.com" class="at-offcanvas-social__link" aria-label="Email">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M1.5 5.25A1.5 1.5 0 0 1 3 3.75h18a1.5 1.5 0 0 1 1.5 1.5v13.5A1.5 1.5 0 0 1 21 20.25H3A1.5 1.5 0 0 1 1.5 18.75V5.25zm2.2.5L12 12l8.3-6.25H3.7zM21 7.32l-8.4 6.3a1 1 0 0 1-1.2 0L3 7.32V18.75h18V7.32z" fill="currentColor"/></svg>
                            <span>Email</span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <div class="body-overlay"></div>
    <!-- at-offcanvus-area-end -->

    <!-- offcanvas 2 start -->
    <div class="at-offcanvas-2-area">
        <div class="offcanvas-bg"></div>
        <div class="at-offcanvas-2-wrapper offcanvas-menu">
            <div class="at-offcanvas-2-left">
                <div class="at-header-logo d-flex justify-content-between align-items-center mb-50">
                    <a href="/">
                        <img data-width="30" width="256" height="256" src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/brand-logo.png" alt="Hredoy">
                        <p class="h6 fw-700 fz-24 mb-0">Hredoy</p>
                    </a>
                    <span class="hamburger-close-btn">
                        <svg width="37" height="38" viewBox="0 0 37 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.19141 9.80762L27.5762 28.1924" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M9.19141 28.1924L27.5762 9.80761" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </span>
                </div>
                <div class="at-offcanvas-menu counter-row">
                    <nav></nav>
                </div>
                <div class="at-offcanvas-social">
                    <ul class="at-offcanvas-social__grid">
                        <li>
                            <a href="https://github.com/arifuzzaman-hredoy" class="at-offcanvas-social__link" aria-label="GitHub">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.7.08-.7 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.75.4-1.27.73-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" fill="currentColor"/></svg>
                                <span>GitHub</span>
                            </a>
                        </li>
                        <li>
                            <a href="https://www.linkedin.com/in/arifuzzaman-hredoy/" class="at-offcanvas-social__link" aria-label="LinkedIn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M15.3352 15.339H12.6697V11.1622C12.6697 10.1662 12.6495 8.8845 11.2807 8.8845C9.89102 8.8845 9.67872 9.9683 9.67872 11.0887V15.339H7.01322V6.75H9.57372V7.9207H9.60822C9.96602 7.2457 10.836 6.53325 12.1357 6.53325C14.8365 6.53325 15.336 8.3108 15.336 10.6245L15.3352 15.339ZM4.00275 5.57475C3.14475 5.57475 2.4555 4.88025 2.4555 4.026C2.4555 3.1725 3.1455 2.47875 4.00275 2.47875C4.85775 2.47875 5.55075 3.1725 5.55075 4.026C5.55075 4.88025 4.857 5.57475 4.00275 5.57475ZM5.33925 15.339H2.66625V6.75H5.33925V15.339ZM16.6687 0H1.32825C0.594 0 0 0.5805 0 1.29675V16.7033C0 17.4202 0.594 18 1.32825 18H16.6665C17.4 18 18 17.4202 18 16.7033V1.29675C18 0.5805 17.4 0 16.6665 0H16.6687Z" fill="currentColor"/></svg>
                                <span>LinkedIn</span>
                            </a>
                        </li>
                        <li>
                            <a href="mailto:arifuzzamanhredoy@gmail.com" class="at-offcanvas-social__link" aria-label="Email">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M1.5 5.25A1.5 1.5 0 0 1 3 3.75h18a1.5 1.5 0 0 1 1.5 1.5v13.5A1.5 1.5 0 0 1 21 20.25H3A1.5 1.5 0 0 1 1.5 18.75V5.25zm2.2.5L12 12l8.3-6.25H3.7zM21 7.32l-8.4 6.3a1 1 0 0 1-1.2 0L3 7.32V18.75h18V7.32z" fill="currentColor"/></svg>
                                <span>Email</span>
                            </a>
                        </li>
                    </ul>
                </div>
                <span class="hamburger-close-btn hamburger-mobile-close-btn d-md-none">CLOSE</span>
            </div>
        </div>
    </div>
    <!-- offcanvas 2 end -->
    <div class="px-blur-bottom"></div>
    <!-- Begin magic cursor -->
    <div id="magic-cursor" class="cursor-black-bg">
        <div id="ball"></div>
    </div>
    <!-- End magic cursor -->
    <div id="smooth-wrapper">
        <div id="smooth-content">
            <main>
                <!-- prettier-ignore -->
                <!--Home 7 Section 1 (Hero - Junior DevOps Engineer)-->
                <div class="sec-1-home-7 p-relative z-index-1 overflow-hidden">
                    <!-- Split background: vermilion (left) + maroon (right) -->
                    <div class="sec-1-home-7__bg d-flex">
                        <div class="sec-1-home-7__bg-left"></div>
                        <div class="sec-1-home-7__bg-right"></div>
                    </div>

                    <!-- Decorative 8-point asterisk sitting on the split -->
                    <div class="sec-1-home-7__star d-none d-lg-flex">
                        <img class="at-scroll-rotate" data-rotate-duration="18" data-rotate-sensitivity="0.18" data-rotate-boost="12" src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/star-asterisk.svg" alt="decorative star" />
                    </div>

                    <div class="sec-1-home-7__img-wrap">
                        <div class="anim-zoomin">
                            <img class="sec-1-home-7__img" width="1024" height="1053" src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-13/Home-menu-pic.webp" alt="Arifuzzaman Hredoy" loading="eager" fetchpriority="high" />
                        </div>

                        <!-- Floating glass tech chips (decorative; hidden from AT) -->
                        <span class="hero-float-chip" aria-hidden="true">Linux</span>
                        <span class="hero-float-chip" aria-hidden="true">Docker</span>
                        <span class="hero-float-chip" aria-hidden="true">Kubernetes</span>
                        <span class="hero-float-chip" aria-hidden="true">CI/CD</span>
                        <span class="hero-float-chip" aria-hidden="true">AWS</span>
                    </div>

                    <div class="container-fluid p-relative">
                        <div class="row g-0 align-items-stretch">
                            <!-- LEFT: Hero image + overlays -->
                            <div class="col-lg-6 p-relative sec-1-home-7__left">
                                                        </div>

                            <!-- RIGHT: Copy + CTA -->
                            <div class="col-lg-6 sec-1-home-7__right">
                                <div class="sec-1-home-7__content">
                                    <!-- [BUILD] [GROW] [SCALE] [BOOST] -->
                                    <ul class="sec-1-home-7__brackets list-unstyled d-flex flex-wrap gap-4 mb-30">
                                        <li class="at_fade_anim" data-start="100%" data-delay="0.1">[ BUILD ]</li>
                                        <li class="at_fade_anim" data-start="100%" data-delay="0.2">[ AUTOMATE ]</li>
                                        <li class="at_fade_anim" data-start="100%" data-delay="0.3">[ SCALE ]</li>
                                        <li class="at_fade_anim" data-start="100%" data-delay="0.4">[ DEPLOY ]</li>
                                    </ul>

                                    <!-- Headline with diagonal arrow -->
                                    <div class="sec-1-home-7__headline-wrap p-relative">
                                        <h1 class="sec-1-home-7__headline text-white text-uppercase fw-700 mb-30 at_fade_anim" data-start="100%" data-delay="0.3">
                                            <span class="sec-1-home-7__headline-line">Junior</span>
                                            <span class="sec-1-home-7__headline-line">DevOps</span>
                                            <span class="sec-1-home-7__headline-line">Engineer</span>
                                        </h1>
                                        <span class="sec-1-home-7__headline-arrow-cover d-none d-md-inline-block">
                                            <span class="sec-1-home-7__headline-arrow at_fade_anim" data-start="100%" data-delay="0.6">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="70" height="53" viewBox="0 0 69 53" fill="none">
                                                    <path d="M40.2 0L67.72 25.4267L69 26.7141L67.72 27.6797L40.2 53.1064L38.6 51.4971L64.2 27.6797H-59V25.4267H64.2L38.6 1.60928L40.2 0Z" fill="currentColor" />
                                                </svg>
                                            </span>
                                    </div>

                                    <!-- Description -->
                                    <p class="sec-1-home-7__desc text-white mb-40 at_fade_anim" data-start="100%" data-delay="0.5">
                                        I'm Arifuzzaman Hredoy, a Junior DevOps Engineer passionate about Linux, Cloud Computing, Automation, CI/CD, and Infrastructure as Code. Continuously building practical projects and production-oriented engineering skills.
                                    </p>

                                    <!-- Primary CTA + icon bubble -->
                                    <div class="sec-1-home-7__cta d-flex align-items-center flex-wrap gap-2 mb-60">
                                        <a href="#contact" class="sec-1-home-7__cta-btn at_fade_anim" data-start="100%" data-delay="0.3">
                                            <span>Get In Touch</span>
                                        </a>
                                        <a href="#contact" class="sec-1-home-7__cta-arrow" aria-label="Get In Touch">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 11 11" fill="none">
                                                <path d="M0.21967 9.40717C-0.0732232 9.70006 -0.0732232 10.1749 0.21967 10.4678C0.512563 10.7607 0.987437 10.7607 1.28033 10.4678L0.21967 9.40717ZM10.6875 0.75C10.6875 0.335786 10.3517 2.97145e-09 9.9375 1.50485e-07L3.1875 -2.70983e-07C2.77329 -2.70983e-07 2.4375 0.335786 2.4375 0.75C2.4375 1.16421 2.77329 1.5 3.1875 1.5H9.1875V7.5C9.1875 7.91421 9.52329 8.25 9.9375 8.25C10.3517 8.25 10.6875 7.91421 10.6875 7.5L10.6875 0.75ZM0.75 9.9375L1.28033 10.4678L10.4678 1.28033L9.9375 0.75L9.40717 0.21967L0.21967 9.40717L0.75 9.9375Z" fill="currentColor" />
                                            </svg>
                                        </a>
                                    </div>

                                    <!-- Social proof: caption, then the tech logo badges, then the tag row -->
                                    <div class="sec-1-home-7__meta">
                                        <div class="sec-1-home-7__proof">
                                            <p class="sec-1-home-7__proof-text text-white fw-700 mb-0 at_fade_anim" data-start="100%" data-delay="0.6">
                                                Building reliable infrastructure with <br class="d-none d-xl-inline" />modern DevOps practices
                                            </p>
                                            <div class="sec-1-home-7__avatars">
                                                <span class="sec-1-home-7__avatar at_fade_anim" data-start="100%" data-delay="0.1">
                                                    <span class="sec-1-home-7__badge" tabindex="0" title="Docker">
                                                        <img width="36" height="36" src="/assets/imgs/hero-tools/docker-v3.svg" alt="Docker" loading="eager" decoding="async" />
                                                    </span>
                                                </span>
                                                <span class="sec-1-home-7__avatar at_fade_anim" data-start="100%" data-delay="0.2">
                                                    <span class="sec-1-home-7__badge" tabindex="0" title="Kubernetes">
                                                        <img width="36" height="36" src="/assets/imgs/hero-tools/kubernetes-v3.svg" alt="Kubernetes" loading="eager" decoding="async" />
                                                    </span>
                                                </span>
                                                <span class="sec-1-home-7__avatar at_fade_anim" data-start="100%" data-delay="0.3">
                                                    <span class="sec-1-home-7__badge" tabindex="0" title="AWS">
                                                        <img width="36" height="36" src="/assets/imgs/hero-tools/aws-v3.svg" alt="AWS" loading="eager" decoding="async" />
                                                    </span>
                                                </span>
                                                <span class="sec-1-home-7__avatar at_fade_anim" data-start="100%" data-delay="0.4">
                                                    <span class="sec-1-home-7__badge" tabindex="0" title="Terraform">
                                                        <img width="36" height="36" src="/assets/imgs/hero-tools/terraform-v3.svg" alt="Terraform" loading="eager" decoding="async" />
                                                    </span>
                                                </span>
                                                <span class="sec-1-home-7__avatar at_fade_anim" data-start="100%" data-delay="0.5">
                                                    <span class="sec-1-home-7__badge" tabindex="0" title="Grafana">
                                                        <img width="36" height="36" src="/assets/imgs/hero-tools/grafana-v3.svg" alt="Grafana" loading="eager" decoding="async" />
                                                    </span>
                                                </span>
                                            </div>
                                        </div>

                                        <!-- Tech skill badges -->
                                        <div class="sec-1-home-7__tags">
                                            <a href="#skills" class="sec-1-home-7__tag at_fade_anim" data-start="100%" data-delay="0.1">
                                                <span>Linux</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="10" viewBox="0 0 9 10" fill="none">
                                                    <path d="M5.62494 9.99994L0.562517 10L0.5625 8.75003L4.49994 8.74996L4.5 2.39273L2.27828 4.86124L1.48278 3.97739L5.0625 0L8.64225 3.97739L7.84676 4.86124L5.625 2.3927L5.62494 9.99994Z" fill="currentColor" />
                                                </svg>
                                            </a>
                                            <a href="#skills" class="sec-1-home-7__tag at_fade_anim" data-start="100%" data-delay="0.2">
                                                <span>CI/CD</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="10" viewBox="0 0 9 10" fill="none">
                                                    <path d="M5.62494 9.99994L0.562517 10L0.5625 8.75003L4.49994 8.74996L4.5 2.39273L2.27828 4.86124L1.48278 3.97739L5.0625 0L8.64225 3.97739L7.84676 4.86124L5.625 2.3927L5.62494 9.99994Z" fill="currentColor" />
                                                </svg>
                                            </a>
                                            <a href="#skills" class="sec-1-home-7__tag at_fade_anim" data-start="100%" data-delay="0.3">
                                                <span>Git</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="10" viewBox="0 0 9 10" fill="none">
                                                    <path d="M5.62494 9.99994L0.562517 10L0.5625 8.75003L4.49994 8.74996L4.5 2.39273L2.27828 4.86124L1.48278 3.97739L5.0625 0L8.64225 3.97739L7.84676 4.86124L5.625 2.3927L5.62494 9.99994Z" fill="currentColor" />
                                                </svg>
                                            </a>
                                            <a href="#skills" class="sec-1-home-7__tag at_fade_anim" data-start="100%" data-delay="0.4">
                                                <span>Nginx</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="10" viewBox="0 0 9 10" fill="none">
                                                    <path d="M5.62494 9.99994L0.562517 10L0.5625 8.75003L4.49994 8.74996L4.5 2.39273L2.27828 4.86124L1.48278 3.97739L5.0625 0L8.64225 3.97739L7.84676 4.86124L5.625 2.3927L5.62494 9.99994Z" fill="currentColor" />
                                                </svg>
                                            </a>
                                            <a href="#skills" class="sec-1-home-7__tag at_fade_anim" data-start="100%" data-delay="0.5">
                                                <span>GitHub Actions</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="10" viewBox="0 0 9 10" fill="none">
                                                    <path d="M5.62494 9.99994L0.562517 10L0.5625 8.75003L4.49994 8.74996L4.5 2.39273L2.27828 4.86124L1.48278 3.97739L5.0625 0L8.64225 3.97739L7.84676 4.86124L5.625 2.3927L5.62494 9.99994Z" fill="currentColor" />
                                                </svg>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!--Home 7 Section 2 (We Power the World's Fastest Growing Startups)-->
                <div class="sec-2-home-7 p-relative bg-neutral-0" id="about">
                    <div class="container-2200 px-lg-5 px-3">

                        <!-- Intro row: eyebrow + split heading + rich description -->
                        <div class="sec-2-home-7__intro row g-0 pt-100 pb-60">
                            <div class="col-lg-7 col-12 pe-lg-4">
                                <a href="#about" class="sec-2-home-7__eyebrow d-inline-flex align-items-center gap-2 mb-30 text-uppercase">
                                    <span class="text-scramble" data-scramble-text="About Me">About Me</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none">
                                        <path d="M11.0037 3.41421L2.39712 12.0208L0.98291 10.6066L9.5895 2H2.00373V0H13.0037V11H11.0037V3.41421Z" fill="currentColor" />
                                    </svg>
                                </a>
                                <h2 class="sec-2-home-7__headline mb-0">
                                    <span class="sec-2-home-7__headline-strong reveal-text">Passionate About Building Reliable Infrastructure</span>
                                </h2>
                            </div>
                            <div class="col-lg-5 col-12 mt-4 mt-lg-0 ps-lg-4 d-flex align-items-end">
                                <p class="sec-2-home-7__desc mb-0  reveal-text">
                                    I'm <strong>Arifuzzaman Hredoy</strong>, currently pursuing a Diploma in Engineering in Computer Science &amp; Technology at Rangpur Polytechnic Institute. I'm building practical skills in <strong>Linux, Docker, AWS, Terraform, and CI/CD</strong> through hands-on projects.
                                </p>
                            </div>
                        </div>

                        <!-- Staircase grid: 5 virtual columns, 3 rows -->
                        <div class="sec-2-home-7__grid">

                            <!-- Row 1: image @ col 1, feature @ col 2, stat @ col 4 -->
                            <div class="sec-2-home-7__row">
                                <div class="sec-2-home-7__cell sec-2-home-7__cell--img sec-2-home-7__col-1">
                                    <div class="sec-2-home-7__img-wrap">
                                        <div class="thumb fix anim-zoomin">
                                            <img data-speed=".8" src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/about-linux.svg" alt="Linux terminal showing server commands" width="1000" height="1080" />
                                        </div>
                                    </div>
                                </div>
                                <div class="sec-2-home-7__cell sec-2-home-7__cell--feature sec-2-home-7__col-2">
                                    <div class="ps-4">
                                        <div class="sec-2-home-7__feature-icon mb-3 at_fade_anim">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M40 20V0H20H0V20V40H20L40 20ZM40 20H20V40L0 20L20 0L40 20Z" fill="currentColor" />
                                            </svg>
                                        </div>
                                        <h3 class="sec-2-home-7__feature-title at-char-animation">Linux Administration</h3>
                                        <p class="sec-2-home-7__feature-desc mb-0 at_fade_anim">Managing and securing Linux servers, configuring services, and automating system tasks with Bash scripting.</p>
                                    </div>
                                </div>
                                <div class="sec-2-home-7__cell sec-2-home-7__cell--stat sec-2-home-7__col-4">
                                    <h3 class="sec-2-home-7__stat-value mb-3"><span class="odometer" data-count="20">0</span>+</h3>
                                    <p class="sec-2-home-7__stat-label mb-0 at_fade_anim">DevOps tools and technologies I practice</p>
                                </div>
                            </div>

                            <!-- Row 2: image @ col 2, feature @ col 3, stat @ col 5 -->
                            <div class="sec-2-home-7__row">
                                <div class="sec-2-home-7__cell sec-2-home-7__cell--img sec-2-home-7__col-2">
                                    <div class="sec-2-home-7__img-wrap ms-2">
                                        <div class="thumb fix anim-zoomin">
                                            <img data-speed=".8" src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/about-cloud.svg" alt="Cloud with server stack illustration" width="1000" height="1080" />
                                        </div>
                                    </div>
                                </div>
                                <div class="sec-2-home-7__cell sec-2-home-7__cell--feature sec-2-home-7__col-3">
                                    <div class="ps-4">
                                        <div class="sec-2-home-7__feature-icon mb-3 at_fade_anim">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                                                <path d="M40 12L32 20V8H20L28 0H40V12Z" fill="currentColor" />
                                                <path d="M8 20L20 8L32 20L20 32L8 20Z" fill="currentColor" />
                                                <path d="M8 20L0 28V40H12L20 32L28 40H40V28L32 20V32H20H8V20Z" fill="currentColor" />
                                                <path d="M8 20L0 12V0H12L20 8H8V20Z" fill="currentColor" />
                                            </svg>
                                        </div>
                                        <h3 class="sec-2-home-7__feature-title at-char-animation">Cloud & AWS</h3>
                                        <p class="sec-2-home-7__feat-desc mb-0 at_fade_anim" data-delay="0.1">Deploying and managing cloud infrastructure on AWS, working with EC2, VPC, and IAM.</p>
                                    </div>
                                </div>
                                <div class="sec-2-home-7__cell sec-2-home-7__cell--stat sec-2-home-7__col-5">
                                    <h3 class="sec-2-home-7__stat-value mb-3"><span class="odometer" data-count="13">0</span>+</h3>
                                    <p class="sec-2-home-7__stat-label mb-0 at_fade_anim">Hands-on DevOps projects on GitHub</p>
                                </div>
                            </div>

                            <!-- Row 3: stat @ col 1, image @ col 3, feature @ col 4 -->
                            <div class="sec-2-home-7__row">
                                <div class="sec-2-home-7__cell sec-2-home-7__cell--stat sec-2-home-7__col-1">
                                    <h3 class="sec-2-home-7__stat-value mb-3"><span class="odometer" data-count="1">0</span>+</h3>
                                    <p class="sec-2-home-7__stat-label mb-0 at_fade_anim">Live deployment on AWS EC2</p>
                                </div>
                                <div class="sec-2-home-7__cell sec-2-home-7__cell--img sec-2-home-7__col-3">
                                    <div class="sec-2-home-7__img-wrap ms-2">
                                        <div class="thumb fix anim-zoomin">
                                            <img data-speed=".8" src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/about-cicd.svg" alt="CI/CD pipeline stages illustration" width="1000" height="1080" />
                                        </div>
                                    </div>
                                </div>
                                <div class="sec-2-home-7__cell sec-2-home-7__cell--feature sec-2-home-7__col-4">
                                    <div class="ps-4">
                                        <div class="sec-2-home-7__feature-icon mb-3 at_fade_anim">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M39.5 0.5L26.5 13.5L13.5 0.5L0.5 13.5V39.5L13.5 26.5L26.5 39.5L39.5 26.5V0.5ZM13.5 26.5V13.5H26.5V26.5H13.5Z" fill="currentColor" />
                                            </svg>
                                        </div>
                                        <h3 class="sec-2-home-7__feature-title at-char-animation">CI/CD & Automation</h3>
                                        <p class="sec-2-home-7__feature-desc mb-0 at_fade_anim">Building automated pipelines with GitHub Actions, Docker, and GHCR for continuous integration and delivery.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!--Home 7 Section 3-->
                <div class="home-2-section-8 py-4 ">
                    <div class="swiper about-me-slider-active at-item-anime-area">
                        <div class="swiper-wrapper">
                            <div class="swiper-slide">
                                <div class="about-me-slider-thumb at-item-anime marque">
                                    <img class="w-100 rounded-4" src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-1-linux.svg" alt="Linux server session" width="1600" height="1000">
                                </div>
                            </div>
                            <div class="swiper-slide">
                                <div class="about-me-slider-thumb at-item-anime marque">
                                    <img class="w-100 rounded-4" src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-2-cloud.svg" alt="Cloud infrastructure" width="1600" height="1000">
                                </div>
                            </div>
                            <div class="swiper-slide">
                                <div class="about-me-slider-thumb at-item-anime marque">
                                    <img class="w-100 rounded-4" src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-3-cicd.svg" alt="CI/CD pipeline" width="1600" height="1000">
                                </div>
                            </div>
                            <div class="swiper-slide">
                                <div class="about-me-slider-thumb at-item-anime marque">
                                    <img class="w-100 rounded-4" src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-4-monitoring.svg" alt="Monitoring dashboard chart" width="1600" height="1000">
                                </div>
                            </div>
                            <div class="swiper-slide">
                                <div class="about-me-slider-thumb at-item-anime marque">
                                    <img class="w-100 rounded-4" src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-5-security.svg" alt="Security shield" width="1600" height="1000">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Home 7 Section 4 — Our mission / dual-tone reveal headline / locations -->
                <div class="sec-4-home-7 bg-neutral-50 pt-120 pb-120">
                    <div class="container-2200 px-lg-5 px-3">
                        <div class="row g-4 g-xl-5 align-items-start">
                            <div class="col-xl-3 col-lg-4 col-12">
                                <div class="sec-4-home-7__eyebrow d-inline-flex align-items-center gap-2 mb-4 text-uppercase">
                                    <span class="text-scramble" data-scramble-text="My Mission">My Mission</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none" aria-hidden="true">
                                        <path d="M11.0037 3.41421L2.39712 12.0208L0.98291 10.6066L9.5895 2H2.00373V0H13.0037V11H11.0037V3.41421Z" fill="currentColor" />
                                    </svg>
                                </div>
                                <div class="sec-4-home-7__frame overflow-hidden mt-4 at-hover-parallax" data-parallax-strength="18" data-parallax-scale="1.05">
                                    <img class="sec-4-home-7__img fix anim-zoomin" src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/mission-learning-path.svg" alt="Learning path: Linux, Docker, CI/CD, AWS" width="900" height="1040" loading="lazy" decoding="async" />
                                </div>
                            </div>
                            <div class="col-xl-9 col-lg-8 col-12">
                                <h2 class="sec-4-home-7__title mb-4 mb-lg-5">
                                    <span class="reveal-text sec-4-home-7__title-part sec-4-home-7__title-part--950">Continuously learning and building practical DevOps skills to become a professional DevOps Engineer.</span>
                                </h2>
                                <div class="sec-4-home-7__cta d-inline-flex align-items-stretch mb-60  at_fade_anim">
                                    <a href="#about" class="at-btn sec-4-home-7__cta-btn text-capitalize">
                                        <span>
                                            <span class="text-1">Get In Touch</span>
                                            <span class="text-2">Get In Touch</span>
                                        </span>
                                    </a>
                                    <a href="#about" class="sec-4-home-7__cta-circle d-inline-flex align-items-center justify-content-center text-white" aria-label="Get In Touch">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                            <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                    </a>
                                </div>
                                <div class="sec-4-home-7__locations row g-4 g-lg-5">
                                    <div class="col-lg-6 col-12">
                                        <div class="d-flex gap-4">
                                            <div class="sec-4-home-7__pin flex-shrink-0" aria-hidden="true">
                                                <img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-4-pin-icon.svg" width="40" height="40" alt="" />
                                            </div>
                                            <div class="flex-grow-1 min-w-0">
                                                <h3 class="sec-4-home-7__loc-title h6 mb-3 at-char-animation">Location</h3>
                                                <div class="sec-4-home-7__loc-body at_fade_anim">
                                                    <p class="mb-2">Rangpur, Bangladesh</p>
                                                    <p class="mb-2">Email: <a href="mailto:arifuzzamanhredoy@gmail.com" class="sec-4-home-7__loc-strong">arifuzzamanhredoy@gmail.com</a></p>
                                                    <p class="mb-2">GitHub: <a href="https://github.com/arifuzzaman-hredoy" target="_blank" rel="noopener" class="sec-4-home-7__loc-strong">github.com/arifuzzaman-hredoy</a></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-lg-6 col-12">
                                        <div class="sec-4-home-7__loc-body sec-4-home-7__loc-body--solo ps-lg-4 at_fade_anim">
                                            <p class="mb-2">Diploma in Engineering — Computer Science &amp; Technology</p>
                                            <p class="mb-2">Institute: <span class="sec-4-home-7__loc-strong">Rangpur Polytechnic Institute</span></p>
                                            <p class="mb-2">Semester: <span class="sec-4-home-7__loc-strong">3rd Semester</span></p>
                                            <p class="mb-0">GPA: <span class="sec-4-home-7__loc-strong">3.93</span> (1st) · <span class="sec-4-home-7__loc-strong">3.69</span> (2nd)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Home 7 Section 5 — Specialized services + accordion + throwable logos -->
                <div class="sec-5-home-7 bg-neutral-0 overflow-hidden" id="skills">
                    <div class="container-2200 px-lg-5 px-3 pt-120 pb-80">
                        <div class="row g-4 g-xl-5 align-items-start">
                            <div class="col-xl-4 col-lg-5 col-12">
                                <div class="sec-5-home-7__eyebrow d-inline-flex align-items-center gap-2 mb-4 text-uppercase">
                                    <span class="text-scramble" data-scramble-text="My Skills">My Skills</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none" aria-hidden="true">
                                        <path d="M11.0037 3.41421L2.39712 12.0208L0.98291 10.6066L9.5895 2H2.00373V0H13.0037V11H11.0037V3.41421Z" fill="currentColor" />
                                    </svg>
                                </div>
                                <h2 class="sec-5-home-7__title mb-4 mb-xl-5 reveal-text">Technical Skills &amp; Tools.</h2>
                                <div class="sec-5-home-7__cta d-inline-flex align-items-stretch at_fade_anim">
                                    <a href="#contact" class="at-btn sec-5-home-7__cta-btn text-capitalize">
                                        <span>
                                            <span class="text-1">Get In Touch</span>
                                            <span class="text-2">Get In Touch</span>
                                        </span>
                                    </a>
                                    <a href="#contact" class="sec-5-home-7__cta-circle d-inline-flex align-items-center justify-content-center text-white" aria-label="Get In Touch">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                            <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                            <div class="col-xl-3 col-lg-5 col-12 mx-lg-auto">
                                <div class="sec-5-home-7__photo scroll-move-up">
                                    <div class="fix anim-zoomin">
                                        <img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/skills-linux.svg" alt="Linux" class="w-100 h-100 object-fit-cover" width="900" height="1060" loading="lazy" />
                                    </div>

                                </div>
                            </div>
                            <div class="col-xl-4 col-lg-12 col-12">
                                <div class="accordion accordion-flush sec-5-home-7__accordion" id="accordionSec5Home7">
                                    <div class="accordion-item sec-5-home-7__acc-item scroll-move-up">
                                        <h3 class="accordion-header" id="headingSec5H71">
                                            <button class="accordion-button sec-5-home-7__acc-btn" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSec5H71" aria-expanded="true" aria-controls="collapseSec5H71">
                                                <span class="sec-5-home-7__acc-title">01. Linux Administration</span>
                                                <span class="sec-5-home-7__acc-toggle" aria-hidden="true">
                                                    <svg class="sec-5-home-7__acc-plus" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                        <path d="M6 1V11M1 6H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                                                    </svg>
                                                </span>
                                            </button>
                                        </h3>
                                        <div id="collapseSec5H71" class="accordion-collapse collapse show" data-bs-parent="#accordionSec5Home7">
                                            <div class="accordion-body sec-5-home-7__acc-body">
                                                <p class="sec-5-home-7__acc-text mb-0">Managing and troubleshooting Linux servers, configuring services, and automating system tasks with Bash scripting.</p>
                                                <div class="sec-5-home-7__tags d-flex flex-wrap gap-2 pt-4">
                                                    <span class="sec-5-home-7__tag">Ubuntu</span>
                                                    <span class="sec-5-home-7__tag">Bash</span>
                                                    <span class="sec-5-home-7__tag">Troubleshooting</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="accordion-item sec-5-home-7__acc-item scroll-move-up">
                                        <h3 class="accordion-header" id="headingSec5H72">
                                            <button class="accordion-button sec-5-home-7__acc-btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSec5H72" aria-expanded="false" aria-controls="collapseSec5H72">
                                                <span class="sec-5-home-7__acc-title">02. Containerization</span>
                                                <span class="sec-5-home-7__acc-toggle" aria-hidden="true">
                                                    <svg class="sec-5-home-7__acc-plus" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                        <path d="M6 1V11M1 6H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                                                    </svg>
                                                </span>
                                            </button>
                                        </h3>
                                        <div id="collapseSec5H72" class="accordion-collapse collapse" data-bs-parent="#accordionSec5Home7">
                                            <div class="accordion-body sec-5-home-7__acc-body">
                                                <p class="sec-5-home-7__acc-text mb-0">Building and deploying containerized applications using Docker and Docker Compose for consistent environments.</p>
                                                <div class="sec-5-home-7__tags d-flex flex-wrap gap-2 pt-4">
                                                    <span class="sec-5-home-7__tag">Docker</span>
                                                    <span class="sec-5-home-7__tag">Docker Compose</span>
                                                    <span class="sec-5-home-7__tag">GHCR</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="accordion-item sec-5-home-7__acc-item scroll-move-up">
                                        <h3 class="accordion-header" id="headingSec5H73">
                                            <button class="accordion-button sec-5-home-7__acc-btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSec5H73" aria-expanded="false" aria-controls="collapseSec5H73">
                                                <span class="sec-5-home-7__acc-title">03. CI/CD Pipelines</span>
                                                <span class="sec-5-home-7__acc-toggle" aria-hidden="true">
                                                    <svg class="sec-5-home-7__acc-plus" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                        <path d="M6 1V11M1 6H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                                                    </svg>
                                                </span>
                                            </button>
                                        </h3>
                                        <div id="collapseSec5H73" class="accordion-collapse collapse" data-bs-parent="#accordionSec5Home7">
                                            <div class="accordion-body sec-5-home-7__acc-body">
                                                <p class="sec-5-home-7__acc-text mb-0">Creating automated build and deployment pipelines with GitHub Actions for continuous integration and delivery.</p>
                                                <div class="sec-5-home-7__tags d-flex flex-wrap gap-2 pt-4">
                                                    <span class="sec-5-home-7__tag">GitHub Actions</span>
                                                    <span class="sec-5-home-7__tag">Automation</span>
                                                    <span class="sec-5-home-7__tag">Deployment</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="accordion-item sec-5-home-7__acc-item scroll-move-up">
                                        <h3 class="accordion-header" id="headingSec5H74">
                                            <button class="accordion-button sec-5-home-7__acc-btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSec5H74" aria-expanded="false" aria-controls="collapseSec5H74">
                                                <span class="sec-5-home-7__acc-title">04. Cloud Infrastructure</span>
                                                <span class="sec-5-home-7__acc-toggle" aria-hidden="true">
                                                    <svg class="sec-5-home-7__acc-plus" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                        <path d="M6 1V11M1 6H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                                                    </svg>
                                                </span>
                                            </button>
                                        </h3>
                                        <div id="collapseSec5H74" class="accordion-collapse collapse" data-bs-parent="#accordionSec5Home7">
                                            <div class="accordion-body sec-5-home-7__acc-body">
                                                <p class="sec-5-home-7__acc-text mb-0">Deploying applications on AWS EC2 with Nginx, domain/DNS and SSL/TLS, while learning VPC networking and Terraform.</p>
                                                <div class="sec-5-home-7__tags d-flex flex-wrap gap-2 pt-4">
                                                    <span class="sec-5-home-7__tag">AWS</span>
                                                    <span class="sec-5-home-7__tag">EC2</span>
                                                    <span class="sec-5-home-7__tag">SSL/TLS</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="container-fluid px-0 text-center">
                        <div class="scroll-move-up">
                            <h6 class="mb-4 mb-xl-5 reveal-text">Continuously learning and expanding my DevOps skillset across the modern cloud-native stack.</h6>
                        </div>
                    </div>

                    <div class="container-fluid px-0">
                        <div class="client-capsule-wrapper-box" data-tech-physics="true">
                            <div class="client-capsule-wrapper tech-phys-stage" data-tech-physics-stage></div>
                            <ul class="visually-hidden tech-phys-a11y">
                                <li>Docker</li>
                                <li>Kubernetes</li>
                                <li>Linux</li>
                                <li>AWS</li>
                                <li>Terraform</li>
                                <li>Git</li>
                                <li>Nginx</li>
                                <li>GitHub Actions</li>
                                <li>GitHub</li>
                                <li>Ubuntu</li>
                                <li>Bash</li>
                                <li>Python</li>
                                <li>Go</li>
                                <li>JavaScript</li>
                                <li>PostgreSQL</li>
                                <li>Helm</li>
                                <li>Prometheus</li>
                                <li>Grafana</li>
                                <li>Argo CD</li>
                                <li>Trivy</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <!--Home 7 Section 6 (The Process — Growth Engine)-->
                <div class="sec-6-home-7 p-relative bg-neutral-0">
                    <div class="container-2200 px-lg-5 px-3">

                        <!-- Header row: eyebrow + big title + description -->
                        <div class="sec-6-home-7__header row g-0 pt-100 pb-50">
                            <div class="col-lg-7 col-12">
                                <a href="#skills" class="sec-6-home-7__eyebrow d-inline-flex align-items-center gap-2 mb-3 text-uppercase">
                                    <span class="text-scramble" data-scramble-text="My Journey">My Journey</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none">
                                        <path d="M11.0037 3.41421L2.39712 12.0208L0.98291 10.6066L9.5895 2H2.00373V0H13.0037V11H11.0037V3.41421Z" fill="currentColor" />
                                    </svg>
                                </a>
                                <h2 class="sec-6-home-7__title mb-0 reveal-text">The Process</h2>
                            </div>
                            <div class="col-lg-5 col-12 mt-4 mt-lg-0 d-flex align-items-end justify-content-lg-end">
                                <p class="sec-6-home-7__desc text-lg-end mb-0 at_fade_anim">
                                    How I'm growing into a DevOps Engineer, from fundamentals to hands-on projects.
                                </p>
                            </div>
                        </div>

                        <!-- Waterfall chip labels (staircase pattern) -->
                        <div class="sec-6-home-7__chips d-none d-lg-flex flex-column mb-80">
                            <span class="sec-6-home-7__chip sec-6-home-7__chip--1 at_fade_anim" data-delay="0.1">
                                <span class="sec-6-home-7__chip-text">Learn Fundamentals</span>
                            </span>
                            <span class="sec-6-home-7__chip sec-6-home-7__chip--2 at_fade_anim" data-fade-offset="100" data-delay="0.2">
                                <span class="sec-6-home-7__chip-text">Practice Daily</span>
                            </span>
                            <span class="sec-6-home-7__chip sec-6-home-7__chip--3 at_fade_anim" data-fade-offset="100" data-delay="0.3">
                                <span class="sec-6-home-7__chip-text">Build Projects</span>
                            </span>
                            <span class="sec-6-home-7__chip sec-6-home-7__chip--4 at_fade_anim" data-fade-offset="100" data-delay="0.4">
                                <span class="sec-6-home-7__chip-text">Keep Improving</span>
                            </span>
                        </div>

                        <!-- 4 process cards -->
                        <div class="sec-6-home-7__cards pb-120">
                            <div class="sec-6-home-7__card-wrap at_fade_anim" data-delay="0.1">
                                <div class="sec-6-home-7__card">
                                    <div class="sec-6-home-7__card-body">
                                        <p class="sec-6-home-7__card-num mb-0">[01]</p>
                                        <h3 class="sec-6-home-7__card-title mb-0">Learn Fundamentals</h3>
                                        <p class="sec-6-home-7__card-desc mb-0">
                                            Understanding the fundamentals of Linux, networking, and cloud computing through hands-on practice and coursework.
                                        </p>
                                    </div>
                                    <div class="sec-6-home-7__card-media">
                                        <img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-1-fundamentals.svg" alt="Learn Fundamentals" width="1200" height="900" />
                                    </div>
                                </div>
                            </div>

                            <div class="sec-6-home-7__card-wrap at_fade_anim" data-delay="0.3">
                                <div class="sec-6-home-7__card">
                                    <div class="sec-6-home-7__card-body">
                                        <p class="sec-6-home-7__card-num mb-0">[02]</p>
                                        <h3 class="sec-6-home-7__card-title mb-0">Hands-on Practice</h3>
                                        <p class="sec-6-home-7__card-desc mb-0">
                                            Building practical projects with Docker, CI/CD pipelines, and cloud infrastructure to apply theoretical knowledge.
                                        </p>
                                    </div>
                                    <div class="sec-6-home-7__card-media">
                                        <img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-2-practice.svg" alt="Hands-on Practice" width="1200" height="900" />
                                    </div>
                                </div>
                            </div>

                            <div class="sec-6-home-7__card-wrap at_fade_anim" data-delay="0.5">
                                <div class="sec-6-home-7__card">
                                    <div class="sec-6-home-7__card-body">
                                        <p class="sec-6-home-7__card-num mb-0">[03]</p>
                                        <h3 class="sec-6-home-7__card-title mb-0">Project Development</h3>
                                        <p class="sec-6-home-7__card-desc mb-0">
                                            Creating real-world DevOps projects like automated deployments, infrastructure provisioning, and monitoring solutions.
                                        </p>
                                    </div>
                                    <div class="sec-6-home-7__card-media">
                                        <img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-3-projects.svg" alt="Project Development" width="1200" height="900" />
                                    </div>
                                </div>
                            </div>

                            <div class="sec-6-home-7__card-wrap at_fade_anim" data-delay="0.7">
                                <div class="sec-6-home-7__card">
                                    <div class="sec-6-home-7__card-body">
                                        <p class="sec-6-home-7__card-num mb-0">[04]</p>
                                        <h3 class="sec-6-home-7__card-title mb-0">Continuous Improvement</h3>
                                        <p class="sec-6-home-7__card-desc mb-0">
                                            Refining skills, exploring new tools, and staying updated with the latest DevOps practices and technologies.
                                        </p>
                                    </div>
                                    <div class="sec-6-home-7__card-media">
                                        <img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-4-improvement.svg" alt="Continuous Improvement" width="1200" height="900" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Home 7 Section 7 (CTA — Ready to Build the Future?) -->
                <div class="sec-7-home-7 overflow-hidden py-4">
                    <div class="container-2200 px-lg-5 px-3 py-120">
                        <div class="row align-items-center g-4 g-xxl-5">
                            <!-- Left: Image block -->
                            <div class="col-xxl-5 col-xl-6 col-12">
                                <div class="sec-7-home-7__media">
                                    <div class="fix anim-zoomin">
                                        <img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/cta-connect.svg" alt="Network of DevOps tools connected around Hredoy" width="1500" height="1000" loading="lazy" />
                                    </div>

                                </div>
                            </div>

                            <!-- Right: Content -->
                            <div class="col-xxl-7 col-xl-6 col-12">
                                <div class="sec-7-home-7__content ms-xxl-4">
                                    <div class="sec-7-home-7__eyebrow d-inline-flex align-items-center gap-2 mb-3 text-uppercase">
                                        <span class="text-scramble" data-scramble-text="Looking for my first DevOps role">Looking for my first DevOps role</span>
                                        <img class="sec-7-home-7__eyebrow-icon" src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-7-eyebrow-arrow.svg" alt="" width="14" height="13" />
                                    </div>

                                    <p class="sec-7-home-7__headline mb-4 mb-lg-40 reveal-text">
                                        I'm looking for a junior DevOps or cloud role where I can keep learning and contribute.
                                    </p>

                                    <ul class="sec-7-home-7__features list-unstyled mb-4 mb-lg-60">
                                        <li class="sec-7-home-7__feature at_fade_anim" data-delay="0.1">
                                            <img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-7-plus.svg" alt="" width="18" height="18" aria-hidden="true" />
                                            <span>Practical DevOps skills</span>
                                        </li>
                                        <li class="sec-7-home-7__feature at_fade_anim" data-delay="0.2">
                                            <img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-7-plus.svg" alt="" width="18" height="18" aria-hidden="true" />
                                            <span>Real-world projects</span>
                                        </li>
                                        <li class="sec-7-home-7__feature at_fade_anim" data-delay="0.3">
                                            <img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-7-plus.svg" alt="" width="18" height="18" aria-hidden="true" />
                                            <span>Continuous learning</span>
                                        </li>
                                        <li class="sec-7-home-7__feature at_fade_anim" data-delay="0.4">
                                            <img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-7-plus.svg" alt="" width="18" height="18" aria-hidden="true" />
                                            <span>Hands-on practice</span>
                                        </li>
                                    </ul>

                                    <div class="sec-7-home-7__cta d-inline-flex align-items-stretch at_fade_anim">
                                        <a href="#contact" class="at-btn sec-7-home-7__cta-btn">
                                            <span>
                                                <span class="text-1">Get In Touch</span>
                                                <span class="text-2">Get In Touch</span>
                                            </span>
                                        </a>
                                        <a href="#contact" class="sec-7-home-7__cta-circle" aria-label="Get In Touch">
                                            <img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-7-btn-arrow.svg" alt="" width="24" height="24" aria-hidden="true" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Decorative rotating star -->
                    <div class="sec-7-home-7__star" aria-hidden="true">
                        <img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-7-rotating.svg" alt="" width="100" height="100" />
                    </div>
                </div>
                <!--Home 7 Section 8 (Team — Dedicated Team + Staggered Portrait Grid)-->
                <div class="sec-8-home-7 p-relative bg-neutral-0">
                    <div class="container-2200 px-lg-5 px-3">
                        <div class="row g-0 align-items-start">

                            <!-- LEFT: Eyebrow + huge heading + description + CTA -->
                            <div class="col-xl-5 col-lg-5 col-12 sec-8-home-7__lead">
                                <a href="#about" class="sec-8-home-7__eyebrow d-inline-flex align-items-center gap-2 mb-4 text-uppercase ">
                                    <span class="text-scramble" data-scramble-text="About Me">About Me</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none">
                                        <path d="M11.0037 3.41421L2.39712 12.0208L0.98291 10.6066L9.5895 2H2.00373V0H13.0037V11H11.0037V3.41421Z" fill="currentColor" />
                                    </svg>
                                </a>

                                <h2 class="sec-8-home-7__heading mb-40 reveal-text">
                                    Who I Am
                                </h2>

                                <p class="sec-8-home-7__desc mb-4 reveal-text">
                                    Hello! I'm <strong>Arifuzzaman Hredoy</strong>, an aspiring DevOps Engineer and Computer Science and Technology (CST) student from Bangladesh.
                                </p>
                                <p class="sec-8-home-7__desc mb-40 reveal-text"><strong>"Learn by Building, Grow by Solving, and Improve by Automating."</strong></p>

                                <div class="sec-4-home-7__cta d-inline-flex align-items-stretch mb-60  at_fade_anim">
                                    <a href="#about" class="at-btn sec-4-home-7__cta-btn text-capitalize">
                                        <span>
                                            <span class="text-1">Get In Touch</span>
                                            <span class="text-2">Get In Touch</span>
                                        </span>
                                    </a>
                                    <a href="#about" class="sec-4-home-7__cta-circle d-inline-flex align-items-center justify-content-center text-white" aria-label="Get In Touch">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                            <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            <!-- RIGHT: Staggered 2-column team grid -->
                            <div class="col-xl-7 col-lg-7 col-12 mt-5 mt-lg-0">
                                <div class="sec-8-home-7__grid">

                                    <!-- Column 1 -->
                                    <div class="sec-8-home-7__col">
                                        <a href="#contact" class="sec-8-home-7__card " aria-label="Arifuzzaman Hredoy — Junior DevOps Engineer">
                                            <div class="sec-8-home-7__photo">
                                                <div class="fix anim-zoomin">
                                                    <img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/who-i-am-portrait.jpg" alt="Arifuzzaman Hredoy" width="1122" height="748" />
                                                </div>

                                            </div>
                                            <span class="sec-8-home-7__badge">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" viewBox="0 0 16 15" fill="none">
                                                    <path d="M12.57 3.905L2.74 13.74 1.26 12.26 11.095 2.43 2.29 2.43V0.33L14.42 0.33V12.46H12.32L12.57 3.905Z" fill="currentColor" />
                                                </svg>
                                            </span>
                                            <div class="sec-8-home-7__info">
                                                <h3 class="sec-8-home-7__name mb-0 at_fade_anim">Arifuzzaman <br />Hredoy</h3>
                                                <p class="sec-8-home-7__role mb-0 at_fade_anim" data-delay="0.1">Junior DevOps Engineer</p>
                                            </div>
                                        </a>

                                    </div>

                                    <!-- Column 2 (offset down for staircase effect on desktop) -->
                                    <div class="sec-8-home-7__col sec-8-home-7__col--offset">

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!--Home 7 Section 9 (Marquee — carouselTicker + GSAP scroll-move, same pattern as Home 3 sec-2)-->
                <div class="sec-9-home-7 py-4">
                    <!-- Row 1: ticker left + list scrolls left (GSAP) -->
                    <div class="sec-9-home-7__row">
                        <div class="sec-9-home-7__ticker py-3 changeless carouselTicker carouselTicker-left">
                            <ul class="d-flex align-items-center gap-4 carouselTicker__list scroll-move-left list-unstyled mb-0 sec-9-home-7__list">
                                <li class="sec-9-home-7__item">Linux</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">Docker</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">Kubernetes</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">AWS</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">Terraform</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">CI/CD</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">GitHub Actions</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">Nginx</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">Prometheus</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">Grafana</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">PostgreSQL</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">Linux</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">Docker</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">Kubernetes</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">AWS</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">Terraform</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">CI/CD</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">GitHub Actions</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">Nginx</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">Prometheus</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">Grafana</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">PostgreSQL</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                            </ul>
                        </div>
                    </div>

                    <!-- Row 2: opposite direction -->
                    <div class="sec-9-home-7__row">
                        <div class="sec-9-home-7__ticker py-3 changeless carouselTicker carouselTicker-right">
                            <ul class="d-flex align-items-center gap-4 carouselTicker__list scroll-move-right list-unstyled mb-0 sec-9-home-7__list">
                                <li class="sec-9-home-7__item">Linux</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">Docker</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">Kubernetes</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">AWS</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">Terraform</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">CI/CD</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">GitHub Actions</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">Nginx</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">Prometheus</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">Grafana</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">PostgreSQL</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">Linux</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">Docker</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">Kubernetes</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">AWS</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">Terraform</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">CI/CD</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">GitHub Actions</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">Nginx</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">Prometheus</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">Grafana</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                                <li class="sec-9-home-7__item">PostgreSQL</li>
                                <li class="sec-9-home-7__sep"><img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg" alt="" /></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <!--Home 7 Section 10 (Featured Projects — repurposed from the blog grid)-->
                <div class="sec-10-home-7 bg-neutral-0 pt-120 pb-120" id="projects">
                    <div class="container-2200 px-lg-5 px-3">
                        <div class="row align-items-end mb-50">
                            <div class="col-xl-4 col-lg-4 col-12">
                                <a href="https://github.com/arifuzzaman-hredoy/" target="_blank" rel="noopener" class="sec-10-home-7__eyebrow d-inline-flex align-items-center gap-2 mb-4 text-uppercase">
                                    <span class="text-scramble" data-scramble-text="Projects">Projects</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none">
                                        <path d="M11.0037 3.41421L2.39712 12.0208L0.98291 10.6066L9.5895 2H2.00373V0H13.0037V11H11.0037V3.41421Z" fill="currentColor" />
                                    </svg>
                                </a>
                                <h2 class="sec-10-home-7__title mb-0 reveal-text">Featured <br class="d-none d-sm-inline" />Projects</h2>
                            </div>
                            <div class="col-xl-5 col-lg-6 col-12 mt-4 mt-xl-0">
                                <p class="sec-10-home-7__lead mb-0 reveal-text">
                                    A selection of hands-on DevOps projects covering Linux, Docker, CI/CD, AWS, Terraform, Kubernetes, and DevSecOps.
                                </p>
                            </div>
                            <div class="col-xl-3 col-lg-12 mt-4 mt-lg-4 mt-xl-0 ms-xl-auto text-xl-end">
                                <a href="https://github.com/arifuzzaman-hredoy?tab=repositories" target="_blank" rel="noopener" class="sec-10-home-7__btn-all d-inline-flex align-items-center gap-2 at_fade_anim">
                                    <span>All Projects</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none">
                                        <path d="M11.0037 3.41421L2.39712 12.0208L0.98291 10.6066L9.5895 2H2.00373V0H13.0037V11H11.0037V3.41421Z" fill="currentColor" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div class="row g-3 sec-10-home-7__grid">
                            <div class="blog-card col-lg-3 col-md-6 col-12 mb-30" data-category="">
                                <div class="blog-card__thumb hover-effect-1">
                                    <a href="https://github.com/arifuzzaman-hredoy/DevSecOps-Monitoring-Kubernetes-Platform" target="_blank" rel="noopener" class="blog-card__img-link">
                                        <img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/devsecops-monitoring-kubernetes.svg" class="blog-card__img22" alt="DevSecOps, Monitoring &amp; Kubernetes Platform stack diagram" width="1600" height="1000">
                                    </a>
                                </div>
                                <div class="blog-card__content">
                                    <h2 class=" h6 blog-card__title">
                                        <a href="https://github.com/arifuzzaman-hredoy/DevSecOps-Monitoring-Kubernetes-Platform" target="_blank" rel="noopener" class="blog-card__title-link">DevSecOps, Monitoring & Kubernetes Platform</a>
                                    </h2>
                                    <p class="blog-card__meta">
                                        <span class="blog-card__meta-text">Kubernetes · Prometheus · Grafana · Trivy</span>
                                    </p>
                                </div>
                            </div>

                            <div class="blog-card col-lg-3 col-md-6 col-12 mb-30" data-category="">
                                <div class="blog-card__thumb hover-effect-1">
                                    <a href="https://github.com/arifuzzaman-hredoy/Automated-CI-CD-Pipeline" target="_blank" rel="noopener" class="blog-card__img-link">
                                        <img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/automated-cicd-pipeline.svg" class="blog-card__img22" alt="Automated CI/CD Pipeline flow diagram" width="1600" height="1000">
                                    </a>
                                </div>
                                <div class="blog-card__content">
                                    <h2 class=" h6 blog-card__title">
                                        <a href="https://github.com/arifuzzaman-hredoy/Automated-CI-CD-Pipeline" target="_blank" rel="noopener" class="blog-card__title-link">Automated CI/CD Pipeline</a>
                                    </h2>
                                    <p class="blog-card__meta">
                                        <span class="blog-card__meta-text">GitHub Actions · Docker · GHCR</span>
                                    </p>
                                </div>
                            </div>

                            <div class="blog-card col-lg-3 col-md-6 col-12 mb-30" data-category="">
                                <div class="blog-card__thumb hover-effect-1">
                                    <a href="https://github.com/arifuzzaman-hredoy/AWS-Cloud-Infrastructure-EC2-Deployment" target="_blank" rel="noopener" class="blog-card__img-link">
                                        <img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/aws-cloud-infrastructure-ec2.svg" class="blog-card__img22" alt="AWS VPC and EC2 infrastructure diagram" width="1600" height="1000">
                                    </a>
                                </div>
                                <div class="blog-card__content">
                                    <h2 class=" h6 blog-card__title">
                                        <a href="https://github.com/arifuzzaman-hredoy/AWS-Cloud-Infrastructure-EC2-Deployment" target="_blank" rel="noopener" class="blog-card__title-link">AWS Cloud Infrastructure & EC2 Deployment</a>
                                    </h2>
                                    <p class="blog-card__meta">
                                        <span class="blog-card__meta-text">AWS · EC2 · VPC · IAM</span>
                                    </p>
                                </div>
                            </div>

                            <div class="blog-card col-lg-3 col-md-6 col-12 mb-30" data-category="">
                                <div class="blog-card__thumb hover-effect-1">
                                    <a href="https://github.com/arifuzzaman-hredoy/Terraform-Infrastructure-as-Code" target="_blank" rel="noopener" class="blog-card__img-link">
                                        <img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/terraform-infrastructure-as-code.svg" class="blog-card__img22" alt="Terraform plan and apply flow diagram" width="1600" height="1000">
                                    </a>
                                </div>
                                <div class="blog-card__content">
                                    <h2 class=" h6 blog-card__title">
                                        <a href="https://github.com/arifuzzaman-hredoy/Terraform-Infrastructure-as-Code" target="_blank" rel="noopener" class="blog-card__title-link">Infrastructure as Code with Terraform</a>
                                    </h2>
                                    <p class="blog-card__meta">
                                        <span class="blog-card__meta-text">Terraform · AWS · Modules</span>
                                    </p>
                                </div>
                            </div>

                            <div class="blog-card col-lg-3 col-md-6 col-12 mb-30" data-category="">
                                <div class="blog-card__thumb hover-effect-1">
                                    <a href="https://github.com/arifuzzaman-hredoy/Docker-compose-Multi-Tier-Platform" target="_blank" rel="noopener" class="blog-card__img-link">
                                        <img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/docker-compose-multi-tier.svg" class="blog-card__img22" alt="Docker Compose multi-tier platform diagram" width="1600" height="1000">
                                    </a>
                                </div>
                                <div class="blog-card__content">
                                    <h2 class=" h6 blog-card__title">
                                        <a href="https://github.com/arifuzzaman-hredoy/Docker-compose-Multi-Tier-Platform" target="_blank" rel="noopener" class="blog-card__title-link">Docker Compose Multi-Tier Platform</a>
                                    </h2>
                                    <p class="blog-card__meta">
                                        <span class="blog-card__meta-text">Docker Compose · Nginx · PostgreSQL</span>
                                    </p>
                                </div>
                            </div>

                            <div class="blog-card col-lg-3 col-md-6 col-12 mb-30" data-category="">
                                <div class="blog-card__thumb hover-effect-1">
                                    <a href="https://github.com/arifuzzaman-hredoy/Nginx-Reverse-Proxy-Domain-SSL" target="_blank" rel="noopener" class="blog-card__img-link">
                                        <img src="https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/projects/nginx-reverse-proxy-domain-ssl.svg" class="blog-card__img22" alt="Nginx reverse proxy with DNS and SSL/TLS diagram" width="1600" height="1000">
                                    </a>
                                </div>
                                <div class="blog-card__content">
                                    <h2 class=" h6 blog-card__title">
                                        <a href="https://github.com/arifuzzaman-hredoy/Nginx-Reverse-Proxy-Domain-SSL" target="_blank" rel="noopener" class="blog-card__title-link">Nginx Reverse Proxy, Domain & SSL</a>
                                    </h2>
                                    <p class="blog-card__meta">
                                        <span class="blog-card__meta-text">Nginx · SSL/TLS · DNS</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="sec-10-home-7__all mt-50">
                            <h3 class="h6 mb-3">All 15 Projects</h3>
                            <ul class="list-unstyled d-flex flex-wrap gap-3 mb-0">
                                <li><a href="https://github.com/arifuzzaman-hredoy/Devops-Workflow-And-SDLC-Lab" target="_blank" rel="noopener">01. DevOps Workflow &amp; SDLC Lab</a></li>
                                <li><a href="https://github.com/arifuzzaman-hredoy/Production-Linux-Server-Administration" target="_blank" rel="noopener">02. Production Linux Server Administration</a></li>
                                <li><a href="https://github.com/arifuzzaman-hredoy/DevOps-Network-Engineering-Lab" target="_blank" rel="noopener">03. DevOps Network Engineering Lab</a></li>
                                <li><a href="https://github.com/arifuzzaman-hredoy/Bash-Git-Devops-Automation-Toolkit" target="_blank" rel="noopener">04. Bash &amp; Git DevOps Automation Toolkit</a></li>
                                <li><a href="https://github.com/arifuzzaman-hredoy/Docker-Containerization-Platform" target="_blank" rel="noopener">05. Docker Containerization Platform</a></li>
                                <li><a href="https://github.com/arifuzzaman-hredoy/Docker-compose-Multi-Tier-Platform" target="_blank" rel="noopener">06. Docker Compose Multi-Tier Platform</a></li>
                                <li><a href="https://github.com/arifuzzaman-hredoy/Git-Version-Control-Lab" target="_blank" rel="noopener">07. Git Version Control Lab</a></li>
                                <li><a href="https://github.com/arifuzzaman-hredoy/GitHub-Collaboration-Lab" target="_blank" rel="noopener">08. GitHub Collaboration Lab</a></li>
                                <li><a href="https://github.com/arifuzzaman-hredoy/Nginx-Reverse-Proxy-Domain-SSL" target="_blank" rel="noopener">09. Nginx Reverse Proxy, Domain &amp; SSL</a></li>
                                <li><a href="https://github.com/arifuzzaman-hredoy/Automated-CI-CD-Pipeline" target="_blank" rel="noopener">10. Automated CI/CD Pipeline</a></li>
                                <li><a href="https://github.com/arifuzzaman-hredoy/AWS-Cloud-Infrastructure-EC2-Deployment" target="_blank" rel="noopener">11. AWS Cloud Infrastructure &amp; EC2 Deployment</a></li>
                                <li><a href="https://github.com/arifuzzaman-hredoy/Terraform-Infrastructure-as-Code" target="_blank" rel="noopener">12. Infrastructure as Code with Terraform</a></li>
                                <li><a href="https://github.com/arifuzzaman-hredoy/DevSecOps-Monitoring-Kubernetes-Platform" target="_blank" rel="noopener">13. DevSecOps, Monitoring &amp; Kubernetes Platform</a></li>
                                <li><a href="https://github.com/arifuzzaman-hredoy/DevOps-Module-4-Assignment" target="_blank" rel="noopener">14. Nexora Three-Tier Infrastructure</a></li>
                                <li><a href="https://github.com/arifuzzaman-hredoy/DevOps-Real-World-Project-By-Python" target="_blank" rel="noopener">15. TaskFlow DevOps Platform</a> <a href="https://taskflow.oxytumzone.com/" target="_blank" rel="noopener" style="color:var(--at-theme-primary);font-weight:600">Live</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <!-- Home 7 Section 11 — Get in touch (contact form) -->
                <div class="sec-11-home-7 pt-120 pb-120" id="contact">
                    <div class="container-2200 px-lg-5 px-3">
                        <div class="row align-items-start g-4 g-xl-5">
                            <div class="col-xl-5 col-lg-6 col-12">
                                <div class="sec-11-home-7__eyebrow d-inline-flex align-items-center gap-2 mb-4 text-uppercase">
                                    <span class="text-scramble" data-scramble-text="Contact Me">Contact Me</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none" aria-hidden="true">
                                        <path d="M11.0037 3.41421L2.39712 12.0208L0.98291 10.6066L9.5895 2H2.00373V0H13.0037V11H11.0037V3.41421Z" fill="currentColor" />
                                    </svg>
                                </div>
                                <h2 class="sec-11-home-7__title mb-0 reveal-text">Get in touch</h2>
                            </div>
                            <div class="col-xl-6 col-lg-6 ms-lg-auto">
                                <form class="sec-4-about-form sec-11-home-7__form" action="/contact" method="post">
                                    <input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;top:-9999px;height:0;width:0;opacity:0" />
                                    <div class="sec-4-about-form__field at_fade_anim">
                                        <input type="text" class="sec-4-about-form__input" name="name" placeholder="Your name *" required aria-label="Your name">
                                    </div>
                                    <div class="sec-4-about-form__field at_fade_anim">
                                        <input type="email" class="sec-4-about-form__input" name="email" placeholder="Your email *" required aria-label="Your email">
                                    </div>
                                    <div class="sec-4-about-form__field at_fade_anim">
                                        <input type="text" class="sec-4-about-form__input" name="subject" placeholder="Your subject *" required aria-label="Your subject">
                                    </div>
                                    <div class="sec-4-about-form__field at_fade_anim">
                                        <textarea class="sec-4-about-form__input sec-4-about-form__textarea" name="message" placeholder="Your message *" rows="5" required aria-label="Your message"></textarea>
                                    </div>
                                    <div class="sec-4-about-form__actions at_fade_anim">
                                        <button type="submit" class="sec-4-about-form__btn at-btn at_fade_anim">
                                            <span>
                                                <span class="text-1 text-capitalize">Send Message</span>
                                                <span class="text-2 text-capitalize">Send Message</span>
                                            </span>
                                            <i>
                                                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M0.21967 9.40717C-0.0732232 9.70006 -0.0732232 10.1749 0.21967 10.4678C0.512563 10.7607 0.987437 10.7607 1.28033 10.4678L0.21967 9.40717ZM10.6875 0.75C10.6875 0.335786 10.3517 2.97145e-09 9.9375 1.50485e-07L3.1875 -2.70983e-07C2.77329 -2.70983e-07 2.4375 0.335786 2.4375 0.75C2.4375 1.16421 2.77329 1.5 3.1875 1.5H9.1875V7.5C9.1875 7.91421 9.52329 8.25 9.9375 8.25C10.3517 8.25 10.6875 7.91421 10.6875 7.5L10.6875 0.75ZM0.75 9.9375L1.28033 10.4678L10.4678 1.28033L9.9375 0.75L9.40717 0.21967L0.21967 9.40717L0.75 9.9375Z" fill="currentColor"></path>
                                                </svg>
                                                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M0.21967 9.40717C-0.0732232 9.70006 -0.0732232 10.1749 0.21967 10.4678C0.512563 10.7607 0.987437 10.7607 1.28033 10.4678L0.21967 9.40717ZM10.6875 0.75C10.6875 0.335786 10.3517 2.97145e-09 9.9375 1.50485e-07L3.1875 -2.70983e-07C2.77329 -2.70983e-07 2.4375 0.335786 2.4375 0.75C2.4375 1.16421 2.77329 1.5 3.1875 1.5H9.1875V7.5C9.1875 7.91421 9.52329 8.25 9.9375 8.25C10.3517 8.25 10.6875 7.91421 10.6875 7.5L10.6875 0.75ZM0.75 9.9375L1.28033 10.4678L10.4678 1.28033L9.9375 0.75L9.40717 0.21967L0.21967 9.40717L0.75 9.9375Z" fill="currentColor"></path>
                                                </svg>
                                            </i>
                                        </button>
                                    </div>
                                    <p class="sec-4-about-form__disclaimer at_fade_anim" data-delay="0.1">
                                        Your message goes only to me and is never shared.
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <!-- prettier-ignore -->
            <!-- Footer 7 (Home 7) -->
            <footer class="footer-7 overflow-hidden">
                <div class="container-2200 px-lg-5 px-3">
                    <!-- Top navigation -->
                    <div class="footer-7__top">
                        <nav class="footer-7__nav" aria-label="Footer navigation">
                            <a class="footer-7__nav-link at_fade_anim" data-delay="0.1" href="/" aria-current="page">
                                <span>Home</span>
                                <svg class="footer-7__nav-arrow" xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none" aria-hidden="true">
                                    <path d="M11.0037 3.41421L2.39712 12.0208L0.98291 10.6066L9.5895 2H2.00373V0H13.0037V11H11.0037V3.41421Z" fill="currentColor" />
                                </svg>
                            </a>
                            <a class="footer-7__nav-link at_fade_anim" data-delay="0.2" href="#about">
                                <span>About</span>
                                <svg class="footer-7__nav-arrow" xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none" aria-hidden="true">
                                    <path d="M11.0037 3.41421L2.39712 12.0208L0.98291 10.6066L9.5895 2H2.00373V0H13.0037V11H11.0037V3.41421Z" fill="currentColor" />
                                </svg>
                            </a>
                            <a class="footer-7__nav-link at_fade_anim" data-delay="0.3" href="#skills">
                                <span>Skills</span>
                                <svg class="footer-7__nav-arrow" xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none" aria-hidden="true">
                                    <path d="M11.0037 3.41421L2.39712 12.0208L0.98291 10.6066L9.5895 2H2.00373V0H13.0037V11H11.0037V3.41421Z" fill="currentColor" />
                                </svg>
                            </a>
                            <a class="footer-7__nav-link at_fade_anim" data-delay="0.4" href="#projects">
                                <span>Projects</span>
                                <svg class="footer-7__nav-arrow" xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none" aria-hidden="true">
                                    <path d="M11.0037 3.41421L2.39712 12.0208L0.98291 10.6066L9.5895 2H2.00373V0H13.0037V11H11.0037V3.41421Z" fill="currentColor" />
                                </svg>
                            </a>
                            <a class="footer-7__nav-link at_fade_anim" data-delay="0.5" href="#contact">
                                <span>Contact</span>
                                <svg class="footer-7__nav-arrow" xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none" aria-hidden="true">
                                    <path d="M11.0037 3.41421L2.39712 12.0208L0.98291 10.6066L9.5895 2H2.00373V0H13.0037V11H11.0037V3.41421Z" fill="currentColor" />
                                </svg>
                            </a>
                        </nav>
                    </div>

                    <div class="footer-7__mid">
                        <div class="row g-5">
                            <!-- Socials -->
                            <div class="col-xxl-3 col-lg-4 col-md-6">
                                <div class="alt-footer-social-item">
                                    <ul class="list-unstyled mb-0">
                                        <li class="at_fade_anim" data-delay="0.1">
                                            <a href="https://github.com/arifuzzaman-hredoy" aria-label="GitHub">
                                                <div class="d-flex align-items-center gap-2">
                                                    <div class="icon-social">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.7.08-.7 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.75.4-1.27.73-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" fill="currentColor"/></svg>
                                                    </div>
                                                    GitHub
                                                </div>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true"><path d="M7.60201e-05 6.26559L0 2.03894e-05L1.49997 -4.58971e-07L1.50004 4.87322L9.12873 4.87329L6.16652 2.12355L7.22714 1.139L12 5.56948L7.22713 10L6.16652 9.01545L9.12876 6.26566L7.60201e-05 6.26559Z" fill="currentColor" /></svg>
                                            </a>
                                        </li>
                                        <li class="at_fade_anim" data-delay="0.2">
                                            <a href="https://www.linkedin.com/in/arifuzzaman-hredoy/" aria-label="LinkedIn">
                                                <div class="d-flex align-items-center gap-2">
                                                    <div class="icon-social">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M15.3352 15.339H12.6697V11.1622C12.6697 10.1662 12.6495 8.8845 11.2807 8.8845C9.89102 8.8845 9.67872 9.9683 9.67872 11.0887V15.339H7.01322V6.75H9.57372V7.9207H9.60822C9.96602 7.2457 10.836 6.53325 12.1357 6.53325C14.8365 6.53325 15.336 8.3108 15.336 10.6245L15.3352 15.339ZM4.00275 5.57475C3.14475 5.57475 2.4555 4.88025 2.4555 4.026C2.4555 3.1725 3.1455 2.47875 4.00275 2.47875C4.85775 2.47875 5.55075 3.1725 5.55075 4.026C5.55075 4.88025 4.857 5.57475 4.00275 5.57475ZM5.33925 15.339H2.66625V6.75H5.33925V15.339ZM16.6687 0H1.32825C0.594 0 0 0.5805 0 1.29675V16.7033C0 17.4202 0.594 18 1.32825 18H16.6665C17.4 18 18 17.4202 18 16.7033V1.29675C18 0.5805 17.4 0 16.6665 0H16.6687Z" fill="currentColor"/></svg>
                                                    </div>
                                                    LinkedIn
                                                </div>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true"><path d="M7.60201e-05 6.26559L0 2.03894e-05L1.49997 -4.58971e-07L1.50004 4.87322L9.12873 4.87329L6.16652 2.12355L7.22714 1.139L12 5.56948L7.22713 10L6.16652 9.01545L9.12876 6.26566L7.60201e-05 6.26559Z" fill="currentColor" /></svg>
                                            </a>
                                        </li>
                                        <li class="at_fade_anim" data-delay="0.3">
                                            <a href="mailto:arifuzzamanhredoy@gmail.com" aria-label="Email">
                                                <div class="d-flex align-items-center gap-2">
                                                    <div class="icon-social">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M1.5 5.25A1.5 1.5 0 0 1 3 3.75h18a1.5 1.5 0 0 1 1.5 1.5v13.5A1.5 1.5 0 0 1 21 20.25H3A1.5 1.5 0 0 1 1.5 18.75V5.25zm2.2.5L12 12l8.3-6.25H3.7zM21 7.32l-8.4 6.3a1 1 0 0 1-1.2 0L3 7.32V18.75h18V7.32z" fill="currentColor"/></svg>
                                                    </div>
                                                    Email
                                                </div>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true"><path d="M7.60201e-05 6.26559L0 2.03894e-05L1.49997 -4.58971e-07L1.50004 4.87322L9.12873 4.87329L6.16652 2.12355L7.22714 1.139L12 5.56948L7.22713 10L6.16652 9.01545L9.12876 6.26566L7.60201e-05 6.26559Z" fill="currentColor" /></svg>
                                            </a>
                                        </li>
                                        <li class="at_fade_anim" data-delay="0.4">
                                            <a href="https://www.facebook.com/arifuzzamanhredoy" target="_blank" rel="noopener" aria-label="Facebook">
                                                <div class="d-flex align-items-center gap-2">
                                                    <div class="icon-social">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.7-1.6 1.5V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" fill="currentColor"/></svg>
                                                    </div>
                                                    Facebook
                                                </div>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true"><path d="M7.60201e-05 6.26559L0 2.03894e-05L1.49997 -4.58971e-07L1.50004 4.87322L9.12873 4.87329L6.16652 2.12355L7.22714 1.139L12 5.56948L7.22713 10L6.16652 9.01545L9.12876 6.26566L7.60201e-05 6.26559Z" fill="currentColor" /></svg>
                                            </a>
                                        </li>
                                        <li class="at_fade_anim" data-delay="0.5">
                                            <a href="https://www.instagram.com/hredoy_403x/" target="_blank" rel="noopener" aria-label="Instagram">
                                                <div class="d-flex align-items-center gap-2">
                                                    <div class="icon-social">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.3 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .3-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.3-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.3 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.2A6.6 6.6 0 1 0 18.6 12 6.6 6.6 0 0 0 12 5.4zm0 10.9A4.3 4.3 0 1 1 16.3 12 4.3 4.3 0 0 1 12 16.3zm6.9-11.2a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5z" fill="currentColor"/></svg>
                                                    </div>
                                                    Instagram
                                                </div>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true"><path d="M7.60201e-05 6.26559L0 2.03894e-05L1.49997 -4.58971e-07L1.50004 4.87322L9.12873 4.87329L6.16652 2.12355L7.22714 1.139L12 5.56948L7.22713 10L6.16652 9.01545L9.12876 6.26566L7.60201e-05 6.26559Z" fill="currentColor" /></svg>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <!-- Decorative object -->
                            <div class="col-xxl-3 d-none d-xxl-block pt-4">
                                <div class="row p-relative pt-4">
                                    <div class="pt-4">
                                        <div class="col-4 ms-auto pt-4">
                                            <div class="at-about-svg-wrap">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="57" height="91" viewBox="0 0 57 91" fill="none">
                                                    <path opacity="0.1" d="M0 0L56.4024 33.572V90.336L0 56.46V0Z" fill="#515151" />
                                                </svg>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="113" height="68" viewBox="0 0 113 68" fill="none">
                                                    <path opacity="0.3" d="M0 33.876L56.4024 0L112.805 33.876V34.1294L56.4024 68.0054L0 34.1294V33.876Z" fill="#515151" />
                                                </svg>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="57" height="91" viewBox="0 0 57 91" fill="none">
                                                    <path opacity="0.2" d="M56.4009 0L8.7738e-05 33.5367V90.2413L56.4009 56.4008V0Z" fill="#515151" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <!-- Contact -->
                            <div class="col-xxl-3 col-lg-4 col-md-6">
                                <div class="footer-7__contact">
                                    <p class="footer-7__contact-line mb-1 at_fade_anim" data-delay="0.1"><a href="https://github.com/arifuzzaman-hredoy">github.com/arifuzzaman-hredoy</a></p>
                                    <p class="footer-7__contact-line mb-1 at_fade_anim" data-delay="0.2"><a href="https://www.linkedin.com/in/arifuzzaman-hredoy/">linkedin.com/in/arifuzzaman-hredoy</a></p>
                                    <p class="footer-7__contact-line mb-3 at_fade_anim" data-delay="0.3"><a href="mailto:arifuzzamanhredoy@gmail.com">arifuzzamanhredoy@gmail.com</a></p>
                                    <p class="footer-7__address mb-0 at_fade_anim" data-delay="0.3">Rangpur, Bangladesh</p>
                                    <p class="footer-7__contact-line mb-0 at_fade_anim" data-delay="0.3">Junior DevOps Engineer · Cloud · Linux Admin</p>

                                    <div class="footer-7__hours mt-30 at_fade_anim" data-delay="0.4">
                                        <p class="footer-7__hours-label mb-1">Open to</p>
                                        <p class="footer-7__hours-value mb-0">Remote · Junior &amp; Intern roles · Immediate</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Newsletter -->
                            <div class="col-xxl-3 col-lg-4 col-md-6 ms-xxl-auto">
                                <div class="footer-7__newsletter">
                                    <p class="footer-7__newsletter-title mb-3 at_fade_anim" data-delay="0.1">Get updates on my new projects</p>
                                    <form class="footer-7__form at_fade_anim" data-delay="0.2" action="#" method="post">
                                        <label class="visually-hidden" for="footer7Email">Email</label>
                                        <input id="footer7Email" class="footer-7__input" type="email" name="email" placeholder="Email" required />
                                        <button class="footer-7__submit" type="submit">
                                            <span>
                                                <span class="text-1">Subscribe</span>
                                                <span class="text-2">Subscribe</span>
                                            </span>
                                            <i aria-hidden="true">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none">
                                                    <path d="M11.0037 3.41421L2.39712 12.0208L0.98291 10.6066L9.5895 2H2.00373V0H13.0037V11H11.0037V3.41421Z" fill="currentColor" />
                                                </svg>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none">
                                                    <path d="M11.0037 3.41421L2.39712 12.0208L0.98291 10.6066L9.5895 2H2.00373V0H13.0037V11H11.0037V3.41421Z" fill="currentColor" />
                                                </svg>
                                            </i>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <!-- Big word -->
                        <div class="at_fade_anim text-center" data-delay="0.1">
                            <h2 class="footer-7__word fw-900 mb-0 text-scale-anim" aria-hidden="true">DEVOPS ENGINEER</h2>
                        </div>
                    </div>

                    <!-- Bottom -->
                    <div class="footer-7__bottom" data-delay="0.1" data-start="100%">
                        <div class="footer-7__bottom-inner d-flex flex-wrap gap-3 align-items-center justify-content-between">
                            <span class="footer-7__copy">Arifuzzaman Hredoy © ${new Date().getFullYear()}</span>
                            <ul class="footer-7__policies list-unstyled d-flex flex-wrap gap-3 mb-0">
                                <li><a href="https://github.com/arifuzzaman-hredoy" target="_blank" rel="noopener">GitHub</a></li>
                                <li><a href="https://www.linkedin.com/in/arifuzzaman-hredoy/" target="_blank" rel="noopener">LinkedIn</a></li>
                                <li><a href="mailto:arifuzzamanhredoy@gmail.com">Email</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    </div>
    <!-- prettier-ignore -->
    <!-- back to top start -->
    <div class="back-to-top-wrapper">
        <button id="back_to_top" type="button" class="back-to-top-btn">
            <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 6L6 1L1 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </button>
    </div>
    <!-- back to top end -->
    <!-- Libs JS -->`;

type HomeContentProps = {
  content?: Record<string, string>;
  defaults?: Record<string, string>;
  projects?: Project[];
  images?: Record<string, string>;
  imageAlts?: Record<string, string>;
  identity?: Record<string, string>;
};

export default function HomeContent({
  content,
  defaults,
  projects,
  images,
  imageAlts,
  identity,
}: HomeContentProps) {
  let html = applyCMSContent(BODY_HTML, content ?? {}, defaults ?? {}, projects ?? [], identity ?? {});
  html = applySiteImages(html, images ?? {}, imageAlts ?? {});
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
