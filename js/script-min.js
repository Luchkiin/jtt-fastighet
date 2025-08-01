document.addEventListener("DOMContentLoaded", function () {
  // Cookie consent popup
  const cookieBox = document.getElementById("cookie-consent");
  const acceptBtn = document.getElementById("accept-cookies");
  const declineBtn = document.getElementById("decline-cookies");

  const consent = localStorage.getItem("cookieConsent");

  if (!consent) {
    setTimeout(() => {
      cookieBox.classList.add("visible");
    }, 750); //r
  }

  const handleConsent = (choice) => {
    localStorage.setItem("cookieConsent", choice);

    cookieBox.classList.remove("visible");
    cookieBox.classList.add("hide");

    setTimeout(() => {
      cookieBox.style.display = "none";
    }, 600);
  };

  acceptBtn.addEventListener("click", () => {
    handleConsent("accepted");
  });

  declineBtn.addEventListener("click", () => {
    handleConsent("declined");
  });

// Change consenst

  const changeConsentLink = document.getElementById("change-cookie-consent");

  if (changeConsentLink) {
    changeConsentLink.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("cookieConsent"); // Tar bort val
      const cookieBox = document.getElementById("cookie-consent");
      if (cookieBox) {
        cookieBox.style.display = "block";
        setTimeout(() => {
          cookieBox.classList.add("visible");
          cookieBox.classList.remove("hide");
        }, 100);
      }
    });
  }

  // Status banner
  const banner = document.getElementById("status-banner");
  const closeBannerBtn = document.getElementById("close-banner");
  if (!banner) return;

  // Visa bannern
  setTimeout(() => {
    banner.classList.add("visible");
  }, 250);

  // Stäng-funktion
  function hideBanner() {
    banner.classList.remove("visible");
    banner.classList.add("hidden");

    banner.addEventListener(
      "transitionend",
      () => {
        banner.remove();
      },
      { once: true }
    );
  }

  // Klick på "X"-knappen
  if (closeBannerBtn) {
    closeBannerBtn.addEventListener("click", hideBanner);
  }

  // Sticky header
  const header = document.getElementById("header");

  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 24) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    });
  }

  const stickyHeader = document.getElementById("header");
  const mobileMenu = document.getElementById("mobile-nav");
  const bodyMenu = document.body;

  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((link) => {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href").substring(1);
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      e.preventDefault();

      requestAnimationFrame(() => {
        const headerHeight = stickyHeader.getBoundingClientRect().height;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      });

      // 4. Stäng mobilmenyn om den är öppen
      if (mobileMenu.classList.contains("open")) {
        mobileMenu.classList.remove("open");
        bodyMenu.classList.remove("no-scroll");
      }
    });
  });

  // Copyright text
  const year = new Date().getFullYear();
  document.getElementById(
    "copyright"
  ).textContent = `© JTT Konsult & Fastighet AB ${year}`;

  const yearMobile = new Date().getFullYear();
  document.getElementById(
    "copyright-mobile"
  ).textContent = `© JTT Konsult & Fastighet AB ${yearMobile}`;

  // Accordion med bilder
  const accordions = document.querySelectorAll(".accordion");
  const accordionImages = document.querySelector(".accordion_images");

  const openAccordion = (accordion) => {
    const content = accordion.querySelector(".accordion_content");
    if (!content) return;
    accordion.classList.add("accordion_active");
    content.style.maxHeight = content.scrollHeight + "px";
  };

  const closeAccordion = (accordion) => {
    const content = accordion.querySelector(".accordion_content");
    if (!content) return;
    accordion.classList.remove("accordion_active");
    content.style.maxHeight = null;
  };

  const activateImages = (index) => {
    if (!accordionImages) return;
    const images = accordionImages.querySelectorAll("img");
    images.forEach((img, i) => {
      img.classList.toggle("active", i === index);
    });
  };

  accordions.forEach((accordion, index) => {
    const intro = accordion.querySelector(".accordion_title");
    const content = accordion.querySelector(".accordion_content");

    if (!intro || !content) return;

    intro.onclick = () => {
      const isActive = content.style.maxHeight;
      accordions.forEach((accordion) => closeAccordion(accordion));
      if (!isActive) {
        openAccordion(accordion);
        activateImages(index);
      }
    };
  });

  if (accordions.length > 0) {
    openAccordion(accordions[0]);
    activateImages(0);
  }

  // Accordion med text
  const textAccordions = document.querySelectorAll(".text-accordion");

  const openTextAccordion = (accordion) => {
    const content = accordion.querySelector(".text-accordion_content");
    if (!content) return;
    accordion.classList.add("text-accordion_active");
    content.style.maxHeight = content.scrollHeight + "px";
  };

  const closeTextAccordion = (accordion) => {
    const content = accordion.querySelector(".text-accordion_content");
    if (!content) return;
    accordion.classList.remove("text-accordion_active");
    content.style.maxHeight = null;
  };

  textAccordions.forEach((accordion) => {
    const content = accordion.querySelector(".text-accordion_content");
    if (!content) return;

    accordion.onclick = (e) => {
      if (e.target.closest(".text-accordion_content")) return;
      const isActive = accordion.classList.contains("text-accordion_active");
      if (isActive) {
        closeTextAccordion(accordion);
      } else {
        openTextAccordion(accordion);
      }
    };
  });

  if (textAccordions.length > 0) {
    openTextAccordion(textAccordions[0]);
  }

  // Mobile menu
  const toggleBtn = document.getElementById("menu-toggle");
  const closeBtn = document.getElementById("menu-close");
  const menu = document.getElementById("mobile-nav");
  const body = document.body;

  function openMenu() {
    menu.classList.add("open");
    body.classList.add("no-scroll");
  }

  function closeMenu() {
    menu.classList.remove("open");
    body.classList.remove("no-scroll");
  }

  toggleBtn.addEventListener("click", openMenu);
  closeBtn.addEventListener("click", closeMenu);

  document.querySelectorAll(".navigation-link").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
});
