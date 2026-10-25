// Torņu ielas saldumi — site scripts (no libraries)

/* Testing aid: open any page with ?motion=on to see the animations even when
   the computer asks to reduce motion (remembered for this tab; ?motion=off resets). */
try {
  const motion = new URLSearchParams(location.search).get("motion");
  if (motion) sessionStorage.setItem("force-motion", motion === "on" ? "1" : "");
  if (sessionStorage.getItem("force-motion")) document.documentElement.classList.add("force-motion");
} catch (e) {
  // storage can be blocked (private mode) — then the normal behaviour stays
}

document.addEventListener("DOMContentLoaded", () => {
  initLockedLinks();
  initMobileMenu();
  initHeroParallax();
  initProductFilter();
  initLightbox();
  initContactForm();
  initVideos();
});

/* ---------- Demo: inactive links to closed pages ---------- */
// <body data-locked-pages="products,glazes,contact"> comes from config/site.php.
// Links to those pages stay visible but cannot be clicked or focused.
function initLockedLinks() {
  const locked = (document.body.dataset.lockedPages || "").split(",").filter(Boolean);
  if (!locked.length) return;
  document.querySelectorAll("a[href]").forEach((link) => {
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;
    const page = url.pathname.split("/").filter(Boolean)[1]; // /lv/products -> products
    if (!locked.includes(page)) return;
    link.removeAttribute("href");
    link.setAttribute("aria-disabled", "true");
    link.classList.add("is-locked");
  });
}

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
  const toggle = document.querySelector("[data-menu-open]");
  const close = document.querySelector("[data-menu-close]");
  const menu = document.getElementById("mobile-nav");
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    menu.classList.toggle("is-open", open);
    document.body.classList.toggle("is-locked", open);
    toggle.setAttribute("aria-expanded", String(open));
    if (open) close?.focus();
    else toggle.focus();
  };

  toggle.addEventListener("click", () => setOpen(true));
  close?.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) setOpen(false);
  });
}

/* ---------- Hero parallax (designer's package, see hero-parallax.js) ---------- */
function initHeroParallax() {
  const el = document.getElementById("hero-decor");
  if (!el || !window.HeroParallax || !window.HERO_LAYERS) return;
  // ?motion=on shows the motion even when the computer asks to reduce motion
  const force = document.documentElement.classList.contains("force-motion");
  HeroParallax.mount(el, window.HERO_LAYERS, force ? { reducedMotion: false } : undefined);
}

/* ---------- Product filter ---------- */
function initProductFilter() {
  const buttons = document.querySelectorAll("[data-filter]");
  const cards = document.querySelectorAll("[data-category]");
  const counter = document.querySelector("[data-product-count]");
  if (!buttons.length) return;

  const apply = (filter) => {
    let visible = 0;
    cards.forEach((card) => {
      const show = filter === "all" || card.dataset.category === filter;
      card.hidden = !show;
      if (show) visible++;
    });
    buttons.forEach((btn) => btn.setAttribute("aria-pressed", String(btn.dataset.filter === filter)));
    if (counter) counter.textContent = visible;
  };

  buttons.forEach((btn) => btn.addEventListener("click", () => {
    apply(btn.dataset.filter);
    history.replaceState(null, "", btn.dataset.filter === "all" ? location.pathname : `#${btn.dataset.filter}`);
  }));

  // apply the filter from the link, e.g. /lv/products#marmelade
  const fromHash = location.hash.slice(1);
  const exists = [...buttons].some((b) => b.dataset.filter === fromHash);
  apply(exists ? fromHash : "all");
}

/* ---------- Gallery (lightbox) ---------- */
function initLightbox() {
  const dialog = document.getElementById("lightbox");
  if (!dialog) return;
  const img = dialog.querySelector(".lightbox__img");
  const title = dialog.querySelector(".lightbox__title");
  const count = dialog.querySelector(".lightbox__count");
  let images = [];
  let index = 0;

  const show = (i) => {
    index = (i + images.length) % images.length;
    img.src = images[index];
    count.textContent = images.length > 1 ? `${index + 1} / ${images.length}` : "";
    dialog.querySelectorAll(".lightbox__btn--prev, .lightbox__btn--next")
      .forEach((b) => (b.hidden = images.length < 2));
  };

  document.querySelectorAll("[data-gallery]").forEach((card) => {
    const open = () => {
      images = card.dataset.gallery.split(",");
      img.alt = card.dataset.title;
      title.textContent = card.dataset.title;
      show(0);
      dialog.showModal();
    };
    card.addEventListener("click", open);
    // the card also opens from the keyboard (Enter / Space)
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });

  dialog.querySelector("[data-prev]").addEventListener("click", () => show(index - 1));
  dialog.querySelector("[data-next]").addEventListener("click", () => show(index + 1));
  dialog.querySelector("[data-close]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });
}

/* ---------- Contact form: submits to Laravel (POST /mail → FeedbackController) ---------- */
function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;
  const status = form.querySelector("[data-form-status]");
  const button = form.querySelector("button[type=submit]");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    button.disabled = true;
    try {
      // FormData also includes the hidden _token field (Laravel CSRF protection)
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error("send failed");
      setStatus("ok", form.dataset.msgOk);
      form.reset();
    } catch {
      setStatus("error", form.dataset.msgError);
    } finally {
      button.disabled = false;
    }
  });

  function setStatus(type, text) {
    status.hidden = false;
    status.className = `form__status form__status--${type}`;
    status.textContent = text;
  }
}

/* ---------- YouTube video ---------- */
// The player is loaded only after a click: the page stays fast and YouTube
// gets no data from visitors who never press play.
// When the video ends, the poster comes back, so YouTube's "more videos"
// screen is never shown (rel=0 alone only limits it to the same channel).
function initVideos() {
  document.querySelectorAll("[data-youtube]").forEach((box) => {
    const button = box.querySelector(".video__play");
    const poster = [...box.childNodes];
    button.addEventListener("click", () => {
      const iframe = document.createElement("iframe");
      const params = new URLSearchParams({ autoplay: 1, rel: 0, enablejsapi: 1, origin: location.origin });
      iframe.src = `https://www.youtube-nocookie.com/embed/${box.dataset.youtube}?${params}`;
      iframe.title = box.dataset.title || "";
      iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      iframe.allowFullscreen = true;

      // Ask the player to send its events (player state 0 = ended)
      iframe.addEventListener("load", () => {
        iframe.contentWindow.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*");
      });
      const onMessage = (e) => {
        if (e.source !== iframe.contentWindow) return;
        let data;
        try { data = JSON.parse(e.data); } catch { return; }
        const state = data.event === "onStateChange" ? data.info : data.info?.playerState;
        if (state === 0) {
          window.removeEventListener("message", onMessage);
          box.replaceChildren(...poster); // back to the poster and play button
          button.focus();
        }
      };
      window.addEventListener("message", onMessage);

      box.replaceChildren(iframe);
    });
  });
}
