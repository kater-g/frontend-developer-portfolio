class App {
  constructor() {
    this.menuToggle = document.querySelector(".menu__toggle");
    this.menu = document.querySelector(".menu");
    this.header = document.querySelector(".header");

    this.init();
  }

  init() {
    this.setupMenu();
    this.setupTextAnimations();
    this.setupScrollAnimations();
    this.setupCounters();
    this.setupFormSubmission();
    this.setupSmartHeader();
  }

  setupCounters() {
    const counters = document.querySelectorAll("[data-count]");
    if (counters.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          this.animateCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.5 },
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  animateCounter(element) {
    const target = parseInt(element.dataset.count, 10);
    const duration = 1500;
    const startTime = performance.now();

    const step = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(eased * target);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }

  setupSmartHeader() {
    if (!this.header) return;

    let ticking = false;

    this.updateHeaderState = () => {
      ticking = false;
      const headerHeight = this.header.offsetHeight;
      const darkSelectors = [".hero", ".page-hero"];
      const darkSections = document.querySelectorAll(darkSelectors.join(","));

      let isOnDarkSection = false;

      darkSections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= headerHeight && rect.bottom >= headerHeight) {
          isOnDarkSection = true;
        }
      });

      if (this.menu && this.menu.classList.contains("menu--active")) {
        this.header.classList.add("header--menu-open");
        this.header.classList.remove("header--scrolled");
        return;
      }

      if (isOnDarkSection) {
        this.header.classList.remove("header--scrolled");
      } else {
        this.header.classList.add("header--scrolled");
      }
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(this.updateHeaderState);
          ticking = true;
        }
      },
      { passive: true },
    );

    this.updateHeaderState();
  }

  setupMenu() {
    if (!this.menuToggle || !this.menu) return;

    this.menuToggle.addEventListener("click", () => {
      const isOpen = this.menu.classList.contains("menu--active");
      if (isOpen) {
        this.closeMenu();
      } else {
        this.openMenu();
      }
    });

    document.querySelectorAll(".menu__link").forEach((link) => {
      link.addEventListener("click", () => {
        this.closeMenu();
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.menu.classList.contains("menu--active")) {
        this.closeMenu();
        this.menuToggle.focus();
      }
    });
  }

  openMenu() {
    this.scrollY = window.scrollY;
    document.body.style.top = `-${this.scrollY}px`;

    this.menu.classList.add("menu--active");
    this.menuToggle.classList.add("menu__toggle--active");
    this.header.classList.add("header--menu-open");
    this.menuToggle.setAttribute("aria-expanded", "true");

    document.documentElement.classList.add("body--locked");

    this.restartMenuAnimations();
    this.trapFocus();
  }

  closeMenu() {
    this.menu.classList.remove("menu--active");
    this.menuToggle.classList.remove("menu__toggle--active");
    this.header.classList.remove("header--menu-open");
    this.menuToggle.setAttribute("aria-expanded", "false");

    document.documentElement.classList.remove("body--locked");
    document.body.style.top = "";
    window.scrollTo({ top: this.scrollY, behavior: "instant" });

    this.updateHeaderState?.();
    this.menu.removeEventListener("keydown", this.trapHandler);
  }

  restartMenuAnimations() {
    const items = this.menu.querySelectorAll(".menu__item");
    const contact = this.menu.querySelector(".menu__contact");

    items.forEach((item) => {
      item.style.animation = "none";
      item.offsetHeight;
      item.style.animation = "";
    });

    if (contact) {
      contact.style.animation = "none";
      contact.offsetHeight;
      contact.style.animation = "";
    }
  }

  trapFocus() {
    const focusable = this.menu.querySelectorAll(
      "a[href], button:not([disabled])",
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    this.trapHandler = (e) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    this.menu.addEventListener("keydown", this.trapHandler);
    first.focus();
  }

  setupTextAnimations() {
    const titleLines = document.querySelectorAll(
      ".hero__title-line, .page-hero__title-line",
    );
    const subtitles = document.querySelectorAll(
      ".hero__title-subtitle, .page-hero__subtitle",
    );

    titleLines.forEach((el) => this.animateText(el, 0.05));
    subtitles.forEach((el) => this.animateText(el, 0.05, 0.8));
  }

  animateText(element, delayStep = 0.05, startDelay = 0) {
    if (!element || element.dataset.animated === "true") return;

    const text = element.textContent;
    element.innerHTML = "";
    element.dataset.animated = "true";

    [...text].forEach((char, index) => {
      const span = document.createElement("span");
      span.textContent = char === " " ? "\u00A0" : char;
      span.style.animationDelay = `${startDelay + index * delayStep}s`;
      element.appendChild(span);
    });
  }

  setupScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("animate-in");

          const sectionHeader = entry.target.querySelector(".section-header");
          if (sectionHeader) {
            sectionHeader.classList.add("animate-in");
          }

          if (entry.target.classList.contains("skills")) {
            entry.target
              .querySelectorAll(".skills__item")
              .forEach((item, index) => {
                setTimeout(() => item.classList.add("animate-in"), index * 50);
              });
          }

          if (entry.target.classList.contains("about-timeline")) {
            entry.target
              .querySelectorAll(".about-timeline__item")
              .forEach((item, index) => {
                setTimeout(() => item.classList.add("animate-in"), index * 150);
              });
          }

          if (entry.target.classList.contains("about-hobbies")) {
            entry.target
              .querySelectorAll(".about-hobby")
              .forEach((item, index) => {
                setTimeout(() => item.classList.add("animate-in"), index * 100);
              });
          }

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    const sectionSelectors = [
      ".about",
      ".about-content",
      ".about-timeline",
      ".about-hobbies",
      ".about-quote",
      ".skills",
      ".projects-preview",
      ".projects-full",
      ".contact",
    ].join(",");

    document.querySelectorAll(sectionSelectors).forEach((section) => {
      observer.observe(section);
    });

    document.querySelectorAll(".project-card").forEach((project, index) => {
      project.style.transitionDelay = `${index * 0.05}s`;
      observer.observe(project);
    });
  }

  setupFormSubmission() {
    const form = document.querySelector(".form");
    if (!form) return;

    this.form = form;
    this.submitButton = form.querySelector(".form__submit");
    this.fields = Array.from(form.querySelectorAll("[data-validate]"));
    this.fieldStates = new Map();

    this.fields.forEach((field) => {
      this.fieldStates.set(field.name, false);
    });

    this.fields.forEach((field) => {
      field.addEventListener("blur", () => {
        this.validateField(field);
        this.updateFormState();
      });

      field.addEventListener("input", () => {
        if (field.dataset.touched === "true") {
          this.validateField(field);
          this.updateFormState();
        }
      });

      field.addEventListener("focus", () => {
        if (!field.dataset.touched) {
          field.dataset.touched = "true";
        }
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      let allValid = true;
      this.fields.forEach((field) => {
        field.dataset.touched = "true";
        const isValid = this.validateField(field);
        if (!isValid) allValid = false;
      });

      if (!allValid) {
        this.updateFormState();
        const firstInvalid = this.fields.find(
          (f) => this.fieldStates.get(f.name) === false,
        );
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const formData = new FormData(form);
      console.log("Form submitted:", Object.fromEntries(formData));

      this.showNotification("Сообщение успешно отправлено!");
      form.reset();

      this.fields.forEach((field) => {
        field.dataset.touched = "";
        const errorEl = document.getElementById(`${field.id}-error`);
        if (errorEl) errorEl.textContent = "";
        field
          .closest(".form__field")
          ?.classList.remove("form__field--error", "form__field--valid");
        field.setAttribute("aria-invalid", "false");
      });
      this.fields.forEach((field) => this.fieldStates.set(field.name, false));
      this.updateFormState();
    });
  }

  validateField(field) {
    const type = field.dataset.validate;
    const value = field.value.trim();
    const fieldWrapper = field.closest(".form__field");
    const errorEl = document.getElementById(`${field.id}-error`);

    let isValid = true;
    let errorMessage = "";

    switch (type) {
      case "name":
        const nameResult = this.validateName(value);
        isValid = nameResult.valid;
        errorMessage = nameResult.message;
        break;

      case "email":
        const emailResult = this.validateEmail(value);
        isValid = emailResult.valid;
        errorMessage = emailResult.message;
        break;

      case "subject":
        const subjectResult = this.validateTextLength(value, 3, 100, "Тема");
        isValid = subjectResult.valid;
        errorMessage = subjectResult.message;
        break;

      case "message":
        const messageResult = this.validateTextLength(
          value,
          10,
          1000,
          "Сообщение",
        );
        isValid = messageResult.valid;
        errorMessage = messageResult.message;
        break;
    }

    this.fieldStates.set(field.name, isValid);

    if (field.dataset.touched === "true") {
      fieldWrapper.classList.toggle("form__field--error", !isValid);
      fieldWrapper.classList.toggle("form__field--valid", isValid);
      field.setAttribute("aria-invalid", !isValid ? "true" : "false");
      if (errorEl) errorEl.textContent = errorMessage;
    }

    return isValid;
  }

  validateName(value) {
    if (!value) {
      return { valid: false, message: "Пожалуйста, введите ваше имя" };
    }

    if (value.length < 2) {
      return {
        valid: false,
        message: "Имя должно содержать минимум 2 символа",
      };
    }

    if (value.length > 50) {
      return { valid: false, message: "Имя не может быть длиннее 50 символов" };
    }

    const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s\-']+$/;
    if (!nameRegex.test(value)) {
      return {
        valid: false,
        message: "Имя может содержать только буквы, пробелы и дефисы",
      };
    }

    if (/\s{2,}/.test(value)) {
      return { valid: false, message: "Не допускаются двойные пробелы" };
    }

    return { valid: true, message: "" };
  }

  validateEmail(value) {
    if (!value) {
      return { valid: false, message: "Пожалуйста, введите email" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(value)) {
      return { valid: false, message: "Некорректный формат email" };
    }

    return { valid: true, message: "" };
  }

  validateTextLength(value, min, max, fieldName) {
    if (!value) {
      return { valid: false, message: `Пожалуйста, заполните поле` };
    }

    if (value.length < min) {
      return {
        valid: false,
        message: `${fieldName}: минимум ${min} символов (сейчас ${value.length})`,
      };
    }

    if (value.length > max) {
      return {
        valid: false,
        message: `${fieldName}: максимум ${max} символов (сейчас ${value.length})`,
      };
    }

    return { valid: true, message: "" };
  }

  updateFormState() {
    const allValid = Array.from(this.fieldStates.values()).every(Boolean);
    this.submitButton.disabled = !allValid;
  }

  showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    notification.setAttribute("role", "alert");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--color-black, #000);
      color: var(--color-white, #fff);
      padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
      border-radius: 4px;
      z-index: 1000;
      transform: translateX(120%);
      transition: transform 0.3s ease;
    `;

    document.body.appendChild(notification);

    requestAnimationFrame(() => {
      notification.style.transform = "translateX(0)";
    });

    setTimeout(() => {
      notification.style.transform = "translateX(120%)";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new App();
});
