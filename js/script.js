(() => {
  const GA_MEASUREMENT_ID = "G-XXXXXXXXXX";
  const html = document.documentElement;
  const prefersReducedMotion =
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  html.classList.add("js");

  const qsa = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  const getPagePath = () => window.location.pathname;

  const getTextContent = (element) =>
    element?.textContent?.replace(/\s+/g, " ").trim() ?? "";

  const ensureAnalytics = () => {
    if (window.gtag) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  };

  const setAnalyticsEnabled = (enabled) => {
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = !enabled;
  };

  let analyticsInitialized = false;
  let analyticsScriptLoading = false;

  const initAnalytics = () => {
    const consent = localStorage.getItem("cookieConsent");
    const hasConsent = consent === "accepted";

    setAnalyticsEnabled(hasConsent);

    if (!hasConsent || analyticsInitialized) return;

    ensureAnalytics();
    analyticsInitialized = true;

    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID);

    if (analyticsScriptLoading) return;

    analyticsScriptLoading = true;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  };

  const track = (eventName, params = {}) => {
    if (localStorage.getItem("cookieConsent") !== "accepted") return;

    initAnalytics();

    if (!window.gtag) return;

    window.gtag("event", eventName, params);
  };

  const getSectionContext = (element) => {
    const section = element.closest("section[id], footer[id]");
    const sectionId = section?.id;

    if (sectionId === "kontakta-oss") return "contact_section";
    if (sectionId === "vanliga-fragor-och-svar") return "faq";
    if (sectionId === "hero") return "hero";
    if (!sectionId) return "unknown";

    return sectionId.replace(/-/g, "_");
  };

  const getSocialPlatform = (link) => {
    const href = link.getAttribute("href") ?? "";

    if (href.includes("linkedin.com")) return "linkedin";
    if (href.includes("facebook.com")) return "facebook";
    if (href.includes("instagram.com")) return "instagram";

    return "unknown";
  };

  const reveal = (element) => {
    element.classList.add("is-revealed");
    element.setAttribute("data-revealed", "true");
  };

  const setStaggerDelays = (container) => {
    const children = Array.from(container.children).filter((child) =>
      child.hasAttribute("data-reveal"),
    );

    const base = Number(container.dataset.staggerBase ?? 220);
    const step = Number(container.dataset.staggerStep ?? 120);

    children.forEach((child, index) => {
      child.style.setProperty("--reveal-delay", `${base + index * step}ms`);
    });
  };

  const showPage = () => {
    qsa("[data-page]").forEach((element) =>
      element.classList.add("is-page-visible"),
    );
  };

  const revealOnLoad = () => {
    qsa('[data-reveal="load"]').forEach(reveal);
  };

  const isInViewNow = (element) => {
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.95 && rect.bottom > 0;
  };

  const setupScrollReveal = () => {
    const scrollElements = qsa('[data-reveal]:not([data-reveal="load"])');

    if (!("IntersectionObserver" in window)) {
      scrollElements.forEach(reveal);
      return;
    }

    const createObserver = (options) =>
      new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target;
          if (element.getAttribute("data-revealed") === "true") {
            observer.unobserve(element);
            return;
          }

          reveal(element);
          observer.unobserve(element);
        });
      }, options);

    const defaultObserver = createObserver({
      threshold: 0.15,
      rootMargin: "0px 0px -10% 0px",
    });

    const footerObserver = createObserver({
      threshold: 0.05,
      rootMargin: "0px 0px 20% 0px",
    });

    scrollElements.forEach((element) => {
      const observer = element.closest("footer")
        ? footerObserver
        : defaultObserver;

      observer.observe(element);

      if (
        isInViewNow(element) &&
        element.getAttribute("data-revealed") !== "true"
      ) {
        reveal(element);
        observer.unobserve(element);
      }
    });
  };

  const startRevealSystem = () => {
    qsa("[data-stagger]").forEach(setStaggerDelays);
    html.classList.add("is-loaded");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        showPage();
        revealOnLoad();
      });
    });
  };

  const initRevealSystem = () => {
    if (prefersReducedMotion) {
      html.classList.add("is-loaded");
      showPage();
      qsa("[data-reveal]").forEach(reveal);
      return;
    }

    setupScrollReveal();
    startRevealSystem();
  };

  const initCookieConsent = () => {
    const cookieBox = document.getElementById("cookie-consent");
    const acceptButton = document.getElementById("accept-cookies");
    const declineButton = document.getElementById("decline-cookies");
    const cookieOverlay = document.getElementById("cookie-overlay");
    const changeConsentButton = document.getElementById(
      "change-cookie-consent",
    );
    const consent = localStorage.getItem("cookieConsent");

    if (!cookieBox || !cookieOverlay) return;

    initAnalytics();

    if (!consent) {
      setTimeout(() => {
        cookieBox.classList.add("visible");
        cookieOverlay.classList.remove("hidden");
        cookieOverlay.classList.add("visible");
        cookieOverlay.classList.remove("hide");
      }, 750);
    } else {
      cookieOverlay.classList.remove("visible");
      cookieOverlay.classList.add("hide");
      cookieOverlay.classList.add("hidden");
    }

    const hideCookieUI = () => {
      cookieBox.classList.remove("visible");
      cookieBox.classList.add("hide");

      cookieOverlay.classList.remove("visible");
      cookieOverlay.classList.add("hide");

      setTimeout(() => {
        cookieBox.style.display = "none";
        cookieOverlay.classList.add("hidden");
      }, 600);
    };

    const handleConsent = (choice) => {
      localStorage.setItem("cookieConsent", choice);
      setAnalyticsEnabled(choice === "accepted");

      if (choice === "accepted") {
        initAnalytics();
      }

      hideCookieUI();
    };

    if (acceptButton) {
      acceptButton.addEventListener("click", () => {
        handleConsent("accepted");
      });
    }

    if (declineButton) {
      declineButton.addEventListener("click", () => {
        handleConsent("declined");
      });
    }

    if (changeConsentButton) {
      changeConsentButton.addEventListener("click", (event) => {
        event.preventDefault();
        localStorage.removeItem("cookieConsent");
        setAnalyticsEnabled(false);

        cookieBox.style.display = "block";
        cookieOverlay.classList.remove("hidden");
        cookieOverlay.classList.remove("hide");
        cookieOverlay.classList.add("visible");

        setTimeout(() => {
          cookieBox.classList.add("visible");
          cookieBox.classList.remove("hide");
        }, 100);
      });
    }
  };

  const initStatusBanner = () => {
    const banner = document.getElementById("status-banner");
    const closeButton = document.getElementById("close-banner");

    if (!banner) return;

    setTimeout(() => {
      banner.classList.add("visible");
    }, 250);

    const hideBanner = () => {
      banner.classList.remove("visible");
      banner.classList.add("hidden");

      banner.addEventListener(
        "transitionend",
        () => {
          banner.remove();
        },
        { once: true },
      );
    };

    if (closeButton) {
      closeButton.addEventListener("click", hideBanner);
    }
  };

  const initSkipToContent = () => {
    const skipLink = document.getElementById("skip-to-content");
    const mainContent = document.getElementById("main-content");

    if (!skipLink || !mainContent) return;

    skipLink.addEventListener("click", (event) => {
      event.preventDefault();
      mainContent.setAttribute("tabindex", "-1");
      mainContent.focus();

      setTimeout(() => {
        mainContent.removeAttribute("tabindex");
      }, 1000);
    });
  };

  const initStickyHeader = () => {
    const header = document.getElementById("header");

    if (!header) return;

    window.addEventListener("scroll", () => {
      if (window.scrollY > 24) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    });
  };

  const initSmoothScroll = () => {
    const stickyHeader = document.getElementById("header");
    const mobileMenu = document.getElementById("mobile-nav");
    const body = document.body;

    qsa('a[href^="#"]:not([href="#"])').forEach((link) => {
      link.addEventListener("click", function (event) {
        const targetId = this.getAttribute("href")?.substring(1);
        if (!targetId) return;

        const targetElement = document.getElementById(targetId);
        if (!targetElement) return;

        event.preventDefault();

        requestAnimationFrame(() => {
          const headerHeight = stickyHeader
            ? stickyHeader.getBoundingClientRect().height
            : 0;
          const offsetPosition =
            targetElement.getBoundingClientRect().top +
            window.pageYOffset -
            headerHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        });

        if (mobileMenu?.classList.contains("open")) {
          mobileMenu.classList.remove("open");
          body.classList.remove("no-scroll");
        }
      });
    });
  };

  const initCopyright = () => {
    const year = new Date().getFullYear();
    const desktopCopyright = document.getElementById("copyright");
    const mobileCopyright = document.getElementById("copyright-mobile");

    if (desktopCopyright) {
      desktopCopyright.textContent = `© JTT Fastighet & Konsult AB ${year}`;
    }

    if (mobileCopyright) {
      mobileCopyright.textContent = `© JTT Konsult & Fastighet AB ${year}`;
    }
  };

  const initCtaTracking = () => {
    qsa("[data-cta-location]").forEach((button) => {
      button.addEventListener("click", () => {
        track("cta_click", {
          cta_name: button.dataset.ctaName ?? "kontakta_oss",
          cta_location: button.dataset.ctaLocation ?? "unknown",
          page_path: getPagePath(),
        });
      });
    });
  };

  const initNavigationTracking = () => {
    const desktopLinks = qsa(".navigation .navigation-link");
    const mobileLinks = qsa(".navigation__mobile .navigation-link");

    desktopLinks.forEach((link) => {
      link.addEventListener("click", () => {
        track("nav_click", {
          link_text: getTextContent(link),
          link_target: link.getAttribute("href") ?? "",
          nav_type: "desktop",
          page_path: getPagePath(),
        });
      });
    });

    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        track("nav_click", {
          link_text: getTextContent(link),
          link_target: link.getAttribute("href") ?? "",
          nav_type: "mobile",
          page_path: getPagePath(),
        });
      });
    });
  };

  const initContactLinkTracking = () => {
    qsa('a[href^="tel:"]').forEach((link) => {
      link.addEventListener("click", () => {
        track("phone_click", {
          phone_number: link.getAttribute("href")?.replace("tel:", "") ?? "",
          click_location: getSectionContext(link),
          page_path: getPagePath(),
        });
      });
    });

    qsa('a[href^="mailto:"]').forEach((link) => {
      link.addEventListener("click", () => {
        track("email_click", {
          email_address:
            link.getAttribute("href")?.replace("mailto:", "") ?? "",
          click_location: getSectionContext(link),
          page_path: getPagePath(),
        });
      });
    });

    qsa('a[href*="google.com/maps"], a[href*="maps/search"]').forEach((link) => {
      link.addEventListener("click", () => {
        track("map_click", {
          location_name: getTextContent(link),
          page_path: getPagePath(),
        });
      });
    });

    qsa('a[href*="linkedin.com"], a[href*="facebook.com"], a[href*="instagram.com"]').forEach((link) => {
      link.addEventListener("click", () => {
        track("social_click", {
          social_platform: getSocialPlatform(link),
          page_path: getPagePath(),
        });
      });
    });
  };

  const initContactSectionViewTracking = () => {
    const contactSection = document.getElementById("kontakta-oss");

    if (!contactSection || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        track("contact_section_view", {
          page_path: getPagePath(),
        });

        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.35,
    });

    observer.observe(contactSection);
  };

  const initScrollDepthTracking = () => {
    const thresholds = [25, 50, 75, 90];
    const trackedDepths = new Set();

    const handleScroll = () => {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (scrollHeight <= 0) return;

      const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);

      thresholds.forEach((threshold) => {
        if (scrollPercent < threshold || trackedDepths.has(threshold)) return;

        trackedDepths.add(threshold);
        track("scroll_depth", {
          percent: threshold,
          page_path: getPagePath(),
        });
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
  };

  const initAccordions = () => {
    const accordions = qsa(".accordion");
    const accordionImages = document.querySelector(".accordion_images");

    const openAccordion = (accordion) => {
      const trigger = accordion.querySelector(".accordion_title");
      const content = accordion.querySelector(".accordion_content");
      if (!trigger || !content) return;

      accordion.classList.add("accordion_active");
      trigger.setAttribute("aria-expanded", "true");
      content.setAttribute("aria-hidden", "false");
      content.style.maxHeight = `${content.scrollHeight}px`;
    };

    const closeAccordion = (accordion) => {
      const trigger = accordion.querySelector(".accordion_title");
      const content = accordion.querySelector(".accordion_content");
      if (!trigger || !content) return;

      accordion.classList.remove("accordion_active");
      trigger.setAttribute("aria-expanded", "false");
      content.setAttribute("aria-hidden", "true");
      content.style.maxHeight = null;
    };

    const activateImages = (index) => {
      if (!accordionImages) return;

      qsa("img", accordionImages).forEach((image, imageIndex) => {
        image.classList.toggle("active", imageIndex === index);
      });
    };

    accordions.forEach((accordion, index) => {
      const trigger = accordion.querySelector(".accordion_title");
      if (!trigger) return;

      trigger.addEventListener("click", () => {
        const isActive = accordion.classList.contains("accordion_active");

        accordions.forEach(closeAccordion);

        if (!isActive) {
          openAccordion(accordion);
          activateImages(index);
          track("service_accordion_open", {
            service_name:
              getTextContent(trigger.querySelector(".accordion_title-text")) ||
              getTextContent(trigger),
            service_index: index + 1,
            page_path: getPagePath(),
          });
        }
      });
    });

    if (accordions.length > 0) {
      openAccordion(accordions[0]);
      activateImages(0);
    }
  };

  const initTextAccordions = () => {
    const accordions = qsa(".text-accordion");

    const openAccordion = (accordion) => {
      const trigger = accordion.querySelector(".text-accordion_title");
      const content = accordion.querySelector(".text-accordion_content");
      if (!trigger || !content) return;

      accordion.classList.add("text-accordion_active");
      trigger.setAttribute("aria-expanded", "true");
      content.setAttribute("aria-hidden", "false");
      content.style.maxHeight = `${content.scrollHeight}px`;
    };

    const closeAccordion = (accordion) => {
      const trigger = accordion.querySelector(".text-accordion_title");
      const content = accordion.querySelector(".text-accordion_content");
      if (!trigger || !content) return;

      accordion.classList.remove("text-accordion_active");
      trigger.setAttribute("aria-expanded", "false");
      content.setAttribute("aria-hidden", "true");
      content.style.maxHeight = null;
    };

    accordions.forEach((accordion, index) => {
      const trigger = accordion.querySelector(".text-accordion_title");
      if (!trigger) return;

      trigger.addEventListener("click", () => {
        const isActive = accordion.classList.contains("text-accordion_active");

        if (isActive) {
          closeAccordion(accordion);
        } else {
          openAccordion(accordion);
          track("faq_open", {
            question:
              getTextContent(
                trigger.querySelector(".text-accordion_title-text"),
              ) || getTextContent(trigger),
            question_index: index + 1,
            page_path: getPagePath(),
          });
        }
      });
    });

    if (accordions.length > 0) {
      openAccordion(accordions[0]);
    }
  };

  const initContactForm = () => {
    const contactForm = document.getElementById("contact-form");

    if (!contactForm) return;

    let hasTrackedFormStart = false;
    const formName = "contact_form";

    const trackFormStart = () => {
      if (hasTrackedFormStart) return;

      hasTrackedFormStart = true;
      track("form_start", {
        form_name: formName,
      });
    };

    contactForm.addEventListener("focusin", trackFormStart);
    contactForm.addEventListener("input", trackFormStart);

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const form = event.currentTarget;
      const status = document.getElementById("form-status");
      const nameField = form.name;
      const phoneField = form.phone;
      const emailField = form.email;
      const messageField = form.message;

      const name = nameField.value.trim();
      const phone = phoneField.value.trim();
      const email = emailField.value.trim();
      const message = messageField.value.trim();

      status.textContent = "";
      status.classList.remove("visible");
      [nameField, phoneField, emailField, messageField].forEach((field) =>
        field.classList.remove("invalid"),
      );

      const nameRegex = /^[A-Za-zÅÄÖåäö\s\-]+$/;
      const phoneRegex = /^[\d+\s\-]+$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!nameRegex.test(name)) {
        track("form_submit_error", {
          form_name: formName,
          error_type: "validation",
        });
        status.textContent =
          "Namnet får endast innehålla bokstäver, bindestreck och mellanslag.";
        nameField.classList.add("invalid");
        status.style.color = "#e84c4c";
        status.classList.add("visible");
        return;
      }

      if (phone && !phoneRegex.test(phone)) {
        track("form_submit_error", {
          form_name: formName,
          error_type: "validation",
        });
        status.textContent =
          "Telefonnumret får endast innehålla siffror, plus och mellanslag.";
        phoneField.classList.add("invalid");
        status.style.color = "#e84c4c";
        status.classList.add("visible");
        return;
      }

      if (!emailRegex.test(email)) {
        track("form_submit_error", {
          form_name: formName,
          error_type: "validation",
        });
        status.textContent =
          "Fyll i en giltig e-postadress enligt exempelformatet namn@domän.se.";
        emailField.classList.add("invalid");
        status.style.color = "#e84c4c";
        status.classList.add("visible");
        return;
      }

      if (message.length < 5) {
        track("form_submit_error", {
          form_name: formName,
          error_type: "validation",
        });
        status.textContent = "Meddelandet måste innehålla minst 5 tecken.";
        messageField.classList.add("invalid");
        status.style.color = "#e84c4c";
        status.classList.add("visible");
        return;
      }

      const data = new FormData(form);
      const action = "https://formspree.io/f/mqaldrgz";

      track("form_submit", {
        form_name: formName,
      });

      try {
        const response = await fetch(action, {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          track("form_submit_success", {
            form_name: formName,
          });
          status.textContent =
            "Tack! Ditt meddelande har skickats, vi återkommer inom 24 timmar.";
          status.style.color = "#3aa66c";
          status.classList.add("visible");
          form.reset();
        } else {
          track("form_submit_error", {
            form_name: formName,
            error_type: "request_failed",
          });
          status.textContent = "Något gick fel. Försök igen.";
          status.style.color = "#e84c4c";
          status.classList.add("visible");
        }
      } catch (error) {
        track("form_submit_error", {
          form_name: formName,
          error_type: "network",
        });
        status.textContent =
          "Kunde inte ansluta till servern. Försök igen om en stund.";
        status.style.color = "#e84c4c";
        status.classList.add("visible");
      }
    });
  };

  const initMobileMenu = () => {
    const toggleButton = document.getElementById("menu-toggle");
    const closeButton = document.getElementById("menu-close");
    const menu = document.getElementById("mobile-nav");
    const body = document.body;

    if (!menu) return;

    const menuItems = qsa(".navigation__mobile .navigation__link-wrapper");

    const setMenuStaggerDelays = () => {
      const base = 120;
      const step = 90;

      menuItems.forEach((item, index) => {
        item.style.setProperty("--stagger-delay", `${base + index * step}ms`);
      });
    };

    const resetMenuItems = () => {
      menuItems.forEach((item) => {
        item.style.removeProperty("--stagger-delay");
      });
    };

    const openMenu = () => {
      setMenuStaggerDelays();
      menu.classList.add("open");
      body.classList.add("no-scroll");
      toggleButton?.setAttribute("aria-expanded", "true");
      track("mobile_menu_open", {
        page_path: getPagePath(),
      });
    };

    const closeMenu = () => {
      menu.classList.remove("open");
      body.classList.remove("no-scroll");
      toggleButton?.setAttribute("aria-expanded", "false");

      // vänta tills stäng-animationen är klar innan vi nollställer inline delays
      window.setTimeout(() => {
        if (!menu.classList.contains("open")) {
          resetMenuItems();
        }
      }, 400);
    };

    if (toggleButton) {
      toggleButton.addEventListener("click", openMenu);
    }

    if (closeButton) {
      closeButton.addEventListener("click", closeMenu);
    }

    qsa(".navigation-link", menu).forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.classList.contains("open")) {
        closeMenu();
      }
    });

    if (prefersReducedMotion) {
      resetMenuItems();
    }
  };

  const initSiteFeatures = () => {
    initAnalytics();
    initCookieConsent();
    initStatusBanner();
    initSkipToContent();
    initStickyHeader();
    initSmoothScroll();
    initCopyright();
    initCtaTracking();
    initNavigationTracking();
    initContactLinkTracking();
    initContactSectionViewTracking();
    initScrollDepthTracking();
    initAccordions();
    initTextAccordions();
    initContactForm();
    initMobileMenu();
  };

  const onReady = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  };

  onReady(() => {
    initRevealSystem();
    initSiteFeatures();
  });
})();
