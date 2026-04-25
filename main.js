const body = document.body;
const nav = document.querySelector(".site-nav");
const menuToggle = document.getElementById("menu-toggle");
const menuPanel = document.getElementById("menu-panel");
const hero = document.getElementById("hero");
const heroCopy = document.getElementById("hero-copy");
const heroStage = document.getElementById("hero-stage");
const heroVideos = document.querySelectorAll(".hero-media__video, .hero-stage__video");
const heroRevealItems = document.querySelectorAll(".hero .reveal");
const revealItems = document.querySelectorAll(".reveal");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function primeHero() {
  body.classList.add("is-loaded");
  heroRevealItems.forEach((item) => item.classList.add("is-visible"));
  ensureHeroPlayback();
  updateHeroMotion();
}

function updateScrolledState() {
  nav.classList.toggle("is-scrolled", window.scrollY > 12);
}

function closeMenu() {
  body.classList.remove("menu-open");
  menuToggle?.classList.remove("is-open");
  menuPanel?.classList.remove("is-open");
  menuToggle?.setAttribute("aria-expanded", "false");
}

function ensureHeroPlayback() {
  heroVideos.forEach((video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const playAttempt = video.play();
    if (playAttempt?.catch) {
      playAttempt.catch(() => {});
    }
  });
}

function updateHeroMotion() {
  if (!hero || prefersReducedMotion.matches) {
    return;
  }

  const rect = hero.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const progress = Math.min(Math.max((0 - rect.top) / Math.max(rect.height - viewportHeight * 0.25, 1), 0), 1);

  hero.style.setProperty("--hero-progress", progress.toFixed(4));
  hero.style.setProperty("--hero-copy-shift", `${progress * -42}px`);
  hero.style.setProperty("--hero-stage-shift", `${progress * 32}px`);

  if (heroCopy) {
    heroCopy.style.opacity = String(1 - progress * 0.16);
  }
}

primeHero();
window.addEventListener("load", primeHero);

updateScrolledState();
updateHeroMotion();
ensureHeroPlayback();

window.addEventListener("scroll", () => {
  updateScrolledState();
  updateHeroMotion();
}, { passive: true });

window.addEventListener("resize", updateHeroMotion);

if (menuToggle && menuPanel) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuPanel.classList.toggle("is-open");
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    body.classList.toggle("menu-open", isOpen);
  });

  menuPanel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

if (!prefersReducedMotion.matches && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if (heroStage && !prefersReducedMotion.matches) {
  const frame = heroStage.querySelector(".hero-stage__frame");

  heroStage.addEventListener("pointermove", (event) => {
    const bounds = heroStage.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 20;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 20;

    frame.style.setProperty("--tilt-x", `${x}px`);
    frame.style.setProperty("--tilt-y", `${y}px`);
  });

  heroStage.addEventListener("pointerleave", () => {
    frame.style.setProperty("--tilt-x", "0px");
    frame.style.setProperty("--tilt-y", "0px");
  });
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    ensureHeroPlayback();
  }
});
