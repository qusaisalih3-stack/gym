(function () {
  const body = document.body;
  const header = document.querySelector("#siteHeader");
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector("#navMenu");
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const themeToggle = document.querySelector(".theme-toggle");
  const backToTop = document.querySelector("#backToTop");
  const loader = document.querySelector(".loader");
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const navSectionMap = {
    why: "about",
    bmi: "programs",
    gallery: "programs",
    testimonials: "trainers",
    faq: "contact"
  };
  const revealItems = Array.from(document.querySelectorAll(".reveal"));
  const counters = Array.from(document.querySelectorAll("[data-counter]"));
  const galleryItems = Array.from(document.querySelectorAll(".gallery-item img"));
  const lightbox = document.querySelector("#lightbox");
  const lightboxImage = lightbox ? lightbox.querySelector("img") : null;
  const lightboxClose = lightbox ? lightbox.querySelector(".lightbox__close") : null;

  window.addEventListener("load", () => {
    window.setTimeout(() => loader?.classList.add("hidden"), 350);
  });

  const updateHeader = () => {
    const scrolled = window.scrollY > 20;
    header?.classList.toggle("scrolled", scrolled);
    backToTop?.classList.toggle("visible", window.scrollY > 600);
  };

  navToggle?.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    body.classList.toggle("nav-open", isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navMenu?.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
      body.classList.remove("nav-open");
    });
  });

  themeToggle?.addEventListener("click", () => {
    body.classList.toggle("light-theme");
    const isLight = body.classList.contains("light-theme");
    themeToggle.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  });

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.querySelectorAll(".accordion-item button").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".accordion-item");
      const isActive = item.classList.toggle("active");
      button.setAttribute("aria-expanded", String(isActive));
    });
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  revealItems.forEach((item) => revealObserver.observe(item));

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const counter = entry.target;
      const target = Number(counter.dataset.counter);
      const duration = 1400;
      const start = performance.now();

      const animate = (time) => {
        const progress = Math.min((time - start) / duration, 1);
        const value = Math.floor(progress * target);
        counter.textContent = target > 999 ? value.toLocaleString() : value;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          counter.textContent = target.toLocaleString();
        }
      };

      requestAnimationFrame(animate);
      counterObserver.unobserve(counter);
    });
  }, { threshold: 0.5 });

  counters.forEach((counter) => counterObserver.observe(counter));

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = navSectionMap[entry.target.getAttribute("id")] || entry.target.getAttribute("id");
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
      });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });

  sections.forEach((section) => sectionObserver.observe(section));

  galleryItems.forEach((image) => {
    image.parentElement.addEventListener("click", () => {
      if (!lightbox || !lightboxImage) return;
      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt;
      lightbox.classList.add("open");
      body.classList.add("lightbox-open");
    });
  });

  const closeLightbox = () => {
    lightbox?.classList.remove("open");
    body.classList.remove("lightbox-open");
    if (lightboxImage) {
      lightboxImage.src = "";
    }
  };

  lightboxClose?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLightbox();
    }
  });

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
})();
