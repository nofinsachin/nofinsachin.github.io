/* ============================================================
   Tabs, theme toggle, and scroll-reveal.
   No dependencies — plain vanilla JS, GitHub Pages friendly.
   ============================================================ */

/* ---- Icons ---- */
const SUN =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const MOON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

/* ---- Theme toggle ---- */
const root = document.documentElement;
const toggle = document.getElementById("theme-toggle");
const icon = document.getElementById("theme-icon");
const label = document.getElementById("theme-label");

function currentTheme() {
  return root.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function renderToggle() {
  const isDark = currentTheme() === "dark";
  // In dark mode we offer to switch to light (sun), and vice versa.
  icon.innerHTML = isDark ? SUN : MOON;
  label.textContent = isDark ? "Light" : "Dark";
}

function setTheme(theme) {
  if (theme === "light") {
    root.setAttribute("data-theme", "light");
  } else {
    root.removeAttribute("data-theme");
  }
  try {
    localStorage.setItem("theme", theme);
  } catch (e) {}
  renderToggle();
}

renderToggle();

toggle.addEventListener("click", () => {
  setTheme(currentTheme() === "dark" ? "light" : "dark");
});

/* ---- Scroll reveal ---- */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: "-40px" }
);

function observeVisible(panel) {
  // Reset + observe reveal elements inside the active panel so the
  // animation plays each time a tab is opened.
  panel.querySelectorAll(".reveal").forEach((el, i) => {
    el.classList.remove("is-visible");
    el.style.transitionDelay = `${Math.min(i * 60, 300)}ms`;
    observer.observe(el);
  });
}

/* ---- Tabs ---- */
const buttons = document.querySelectorAll(".tab-btn");
const panels = document.querySelectorAll(".tab-panel");

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    buttons.forEach((b) => b.classList.remove("active"));
    panels.forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");

    const panel = document.getElementById(btn.dataset.tab);
    panel.classList.add("active");
    observeVisible(panel);
  });
});

/* Reveal the initially-active panel on load. */
observeVisible(document.querySelector(".tab-panel.active"));
