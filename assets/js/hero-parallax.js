/*
 * Hero parallax: floating zephyrs, berries and petals for the hero banner.
 *
 *   HeroParallax.mount(element, HERO_LAYERS)
 *
 * builds every layer inside `element` (an empty, absolutely positioned box
 * covering the hero) and starts the scroll motion. No dependencies.
 *
 * Motion model
 *   Each floating layer has a `mass` (a petal is 1). On scroll it rises past
 *   the page, drifts a little sideways, sways and tilts, all scaled by its
 *   lightness (mass ^ -0.4). Light petals react at once and move furthest,
 *   heavy zephyrs barely move and glide in late. Every layer keeps its own
 *   eased copy of the scroll position, so pieces settle one after another.
 *   Layers without a mass never move.
 *
 * The loop runs only while something is still settling, writes transforms
 * only (compositor friendly), stops once the hero has scrolled out of view
 * and is skipped entirely under prefers-reduced-motion.
 */
(function () {
  "use strict";

  /* Motion of a piece with mass 1 (a petal). Travel, tilt and responsiveness
     shrink with mass^0.4, so a zephyr (mass 10) rises about 40% as far as a
     petal and takes over twice as long to settle. Sideways drift shrinks more
     gently so heavy pieces still shift a little, and the leaf-like sway is
     mostly felt on petals. */
  var DEFAULTS = {
    /** Reference box the Figma positions were measured in */
    width: 1920,
    height: 680,
    /** Pixels a piece rises past the page per pixel scrolled */
    travel: 0.06,
    /** Sideways drift per pixel scrolled, to a side picked per piece */
    drift: 0.025,
    /** Side to side sway amplitude in px, and pixels of scroll per radian */
    sway: 5,
    swayWave: 170,
    /** Degrees of tilt per pixel scrolled */
    tilt: 0.0025,
    /** Share of the remaining distance closed per 60 fps frame */
    ease: 0.12,
    /** Per-piece variation, so pieces of equal mass still part ways */
    jitter: 0.12,
  };

  /** Stable 0..1 value per layer, so the motion is the same on every visit */
  function seeded(i, salt) {
    var x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  function px(n) {
    return n + "px";
  }

  function buildLayer(d) {
    var layer = document.createElement("div");
    layer.className = "hp-layer";
    layer.style.left = px(d.left);
    layer.style.top = px(d.top);
    layer.style.width = px(d.w);
    layer.style.height = px(d.h);
    if (d.mass) layer.style.willChange = "transform";

    var turn = document.createElement("div");
    turn.className = "hp-turn";
    turn.style.transform = "rotate(" + d.rotate + "deg)" + (d.flip ? " scaleY(-1)" : "");

    var piece = document.createElement("div");
    piece.className = "hp-piece";
    piece.style.width = px(d.innerW);
    piece.style.height = px(d.innerH);
    if (d.blur) piece.style.filter = "blur(" + d.blur + "px)";

    var img = document.createElement("img");
    img.alt = "";
    img.decoding = "async";
    img.src = d.src;

    if (d.crop) {
      // One piece cut out of a sprite sheet: oversized image, clipped box
      var crop = document.createElement("div");
      crop.className = "hp-crop";
      crop.style.opacity = d.opacity;
      if (d.radius) crop.style.borderRadius = px(d.radius);
      img.style.width = d.crop.w + "%";
      img.style.height = d.crop.h + "%";
      img.style.left = d.crop.l + "%";
      img.style.top = d.crop.t + "%";
      crop.appendChild(img);
      piece.appendChild(crop);
    } else {
      img.className = "hp-full";
      img.style.opacity = d.opacity;
      piece.appendChild(img);
    }

    turn.appendChild(piece);
    layer.appendChild(turn);
    return layer;
  }

  function mount(root, layers, options) {
    var o = {};
    var k;
    for (k in DEFAULTS) o[k] = DEFAULTS[k];
    for (k in options || {}) o[k] = options[k];

    var box = document.createElement("div");
    box.className = "hp-box";
    box.style.width = px(o.width);
    box.style.height = px(o.height);

    var floats = [];
    layers.forEach(function (d, i) {
      var el = buildLayer(d);
      box.appendChild(el);
      if (!d.mass) return;
      var light = Math.pow(d.mass, -0.4);
      var vary = function (salt) {
        return 1 + o.jitter * (seeded(i, salt) * 2 - 1);
      };
      floats.push({
        el: el,
        travel: o.travel * light * vary(1),
        ease: Math.min(o.ease * light * vary(2), 1),
        drift: o.drift * Math.sqrt(light) * (seeded(i, 3) < 0.5 ? -1 : 1),
        sway: o.sway * light * light,
        phase: seeded(i, 4) * Math.PI * 2,
        // Tilt keeps turning the way the piece already leans
        tilt: o.tilt * light * (Math.sign(d.rotate) || 1),
        // This layer's own eased copy of the scroll position
        y: 0,
      });
    });
    root.appendChild(box);

    // Laravel: options.reducedMotion lets the site's ?motion=on test switch override
    // the system setting. Without it the behaviour is exactly the original.
    var reduced = options && options.reducedMotion != null
      ? options.reducedMotion
      : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !floats.length) return { destroy: function () {} };

    // Past the bottom of the hero nothing is visible, so stop the drift there
    var limit = 0;
    var frame = 0;
    var last = 0;

    function measure() {
      limit = root.getBoundingClientRect().bottom + window.scrollY;
    }
    function target() {
      return Math.min(Math.max(window.scrollY, 0), limit);
    }
    function paint(l) {
      // Sway starts from zero so the resting layout matches the design
      var x = l.y * l.drift + l.sway * (Math.sin(l.y / o.swayWave + l.phase) - Math.sin(l.phase));
      l.el.style.transform =
        "translate3d(" + x.toFixed(2) + "px, " + (-l.y * l.travel).toFixed(2) + "px, 0) " +
        "rotate(" + (l.y * l.tilt).toFixed(3) + "deg)";
    }
    function tick(now) {
      var goal = target();
      var frames = Math.min(now - last, 100) / (1000 / 60);
      last = now;
      var moving = false;
      for (var i = 0; i < floats.length; i++) {
        var l = floats[i];
        l.y += (goal - l.y) * (1 - Math.pow(1 - l.ease, frames));
        if (Math.abs(goal - l.y) < 0.05) l.y = goal;
        else moving = true;
        paint(l);
      }
      frame = moving ? window.requestAnimationFrame(tick) : 0;
    }
    function wake() {
      if (frame) return;
      last = performance.now();
      frame = window.requestAnimationFrame(tick);
    }
    function onResize() {
      measure();
      wake();
    }

    measure();
    var start = target();
    floats.forEach(function (l) {
      l.y = start;
      paint(l);
    });
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", onResize);

    return {
      destroy: function () {
        window.removeEventListener("scroll", wake);
        window.removeEventListener("resize", onResize);
        if (frame) window.cancelAnimationFrame(frame);
        root.removeChild(box);
      },
    };
  }

  window.HeroParallax = { mount: mount, defaults: DEFAULTS };
})();
