const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const main = document.querySelector("#main");
const loader = document.querySelector("#loader");
const loaderBar = document.querySelector("#loader-bar");
const loaderPct = document.querySelector("#loader-pct");
const menuBtn = document.querySelector("#menu-toggle");
const menu = document.querySelector("#menu");
const year = document.querySelector("#year");
const liveTime = document.querySelector("#live-time");
const cursor = document.querySelector("#cursor");
const cursorDot = document.querySelector("#cursor-dot");

if (year) year.textContent = new Date().getFullYear();

function tickClock() {
  if (!liveTime) return;
  liveTime.textContent = new Date().toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
  });
}
tickClock();
setInterval(tickClock, 1000);

function closeMenu() {
  menu?.classList.remove("is-open");
  menuBtn?.classList.remove("is-open");
  menuBtn?.setAttribute("aria-expanded", "false");
}

menuBtn?.addEventListener("click", () => {
  const open = menu.classList.toggle("is-open");
  menuBtn.classList.toggle("is-open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  if (open && window.gsap) {
    gsap.fromTo(
      "#menu a",
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.07, duration: 0.45, ease: "power3.out" }
    );
  }
});
menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

if (!reduced && window.gsap && cursor && cursorDot && window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("mousemove", (event) => {
    gsap.to(cursor, { x: event.clientX, y: event.clientY, duration: 0.35, ease: "power3.out" });
    gsap.to(cursorDot, { x: event.clientX, y: event.clientY, duration: 0.12, ease: "power3.out" });
  });
  document.querySelectorAll("a, button").forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("is-on"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("is-on"));
  });
}

let loco;

function bindScrollTrigger(scroller) {
  if (!window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  if (loco) {
    loco.on("scroll", ScrollTrigger.update);
    ScrollTrigger.scrollerProxy(main, {
      scrollTop(value) {
        return arguments.length ? loco.scrollTo(value, 0, 0) : loco.scroll.instance.scroll.y;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
      pinType: main.style.transform ? "transform" : "fixed",
    });
    ScrollTrigger.addEventListener("refresh", () => loco.update());
  }

  const triggerBase = scroller ? { scroller } : {};

  gsap.utils.toArray(".grid .feat, .about__left, .about__right, .awards > div, .org__co, .contact > *").forEach((el, i) => {
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 0.75,
      delay: (i % 3) * 0.06,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        ...triggerBase,
      },
    });
  });

  gsap.utils.toArray(".mast").forEach((el) => {
    gsap.fromTo(
      el,
      { yPercent: 18 },
      {
        yPercent: -12,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          ...triggerBase,
        },
      }
    );
  });

  const stamp = document.querySelector(".stamp");
  if (stamp) {
    gsap.to(stamp, {
      rotate: 12,
      ease: "none",
      scrollTrigger: {
        trigger: stamp,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        ...triggerBase,
      },
    });
  }

  document.querySelectorAll("[data-count]").forEach((el) => {
    const end = Number(el.getAttribute("data-count"));
    const obj = { n: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      ...triggerBase,
      onEnter: () => {
        gsap.to(obj, {
          n: end,
          duration: 1.3,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = String(Math.round(obj.n));
          },
        });
      },
    });
  });

  ScrollTrigger.refresh();
}

function startPageMotion() {
  if (reduced || !window.gsap) return;

  gsap.from(".nav", { y: -30, opacity: 0, duration: 0.6, ease: "power3.out" });
  gsap.from(".strip .feat, .strip__mid", {
    y: 36,
    opacity: 0,
    stagger: 0.12,
    duration: 0.8,
    ease: "power3.out",
  });
  gsap.from(".mast", { y: 40, opacity: 0, duration: 0.9, delay: 0.2, ease: "power3.out" });

  if (window.LocomotiveScroll && main) {
    loco = new LocomotiveScroll({
      el: main,
      smooth: true,
      multiplier: 0.9,
      smartphone: { smooth: false },
      tablet: { smooth: false },
    });
    bindScrollTrigger("#main");
  } else {
    bindScrollTrigger();
  }
}

function hideLoader() {
  document.body.classList.remove("is-loading");
  if (!loader) {
    startPageMotion();
    return;
  }
  if (reduced || !window.gsap) {
    loader.style.display = "none";
    startPageMotion();
    return;
  }
  gsap.to(loader, {
    yPercent: -100,
    duration: 0.85,
    ease: "power4.inOut",
    onComplete: () => {
      loader.classList.add("is-gone");
      loader.style.display = "none";
      startPageMotion();
    },
  });
}

function runLoader() {
  if (!loader || reduced || !window.gsap) {
    hideLoader();
    return;
  }

  const progress = { n: 0 };
  gsap.to(progress, {
    n: 100,
    duration: 1.6,
    ease: "power2.inOut",
    onUpdate: () => {
      const value = Math.round(progress.n);
      if (loaderPct) loaderPct.textContent = `${value}%`;
      if (loaderBar) loaderBar.style.width = `${value}%`;
    },
    onComplete: hideLoader,
  });
}

if (document.readyState === "complete") {
  runLoader();
} else {
  window.addEventListener("load", runLoader);
}

window.setTimeout(() => {
  if (document.body.classList.contains("is-loading")) hideLoader();
}, 4000);
