/*
 * Hero banner layers, in paint order from back to front.
 *
 * Geometry comes from the Figma hero frame (file WL0FU4jQJDwNeM0J331IVa,
 * node 1:14) inside a fixed 1920x680 reference box. Each layer is placed at
 * left/top with an outer size w/h, rotated (and flipped) around its centre,
 * and drawn at innerW/innerH. `crop` cuts one piece out of a sprite sheet:
 * the image is sized and offset in percent of the inner box and clipped.
 *
 * Layers with a `mass` float on scroll (see hero-parallax.js). Layers without
 * one form the static base, matching Figma node 4:2. Every zephyr floats.
 *
 * The large blurred petal cluster uses petal-cluster.png, not the plain
 * sprite: it has the twins of the floating petals removed, so nothing ghosts
 * through when they drift. Keep it that way.
 */
window.HERO_LAYERS = (function () {
  /* Laravel: images are served from public/assets/img/hero (set in home.blade.php),
     converted to WebP with the same aspect ratio as the original PNGs. */
  var IMG = window.HERO_IMG_BASE || "img/";

  /* Masses for the floating pieces, relative to a petal. Light pieces react
     quickly and drift furthest, heavy zephyrs barely move and glide in late.
     Zephyrs and berries are scaled a little by their size. */
  var PETAL = 1;
  var BERRY = 3;
  var ZEPHYR = 10;

  var CRANBERRY_A = { h: 716.85, l: -463.43, t: -345.66, w: 738.01 };
  var CRANBERRY_B = { h: 716.85, l: -208.38, t: -143.33, w: 738.01 };
  var CRANBERRY_ROUND = { h: 938.42, l: -330.67, t: -646.31, w: 893.38 };
  var PETAL_A = { h: 516.23, l: -525.15, t: -145.26, w: 678.7 };
  var PETAL_B = { h: 437.55, l: -495.37, t: -207.06, w: 763.9 };

  return [
    { name: "png-cherry-blossom-petals-falling-background-flower-white 3", left: 658, top: 453, w: 500.1, h: 550.557, rotate: -16.17, blur: 10, opacity: 0.5, innerW: 387, innerH: 461, crop: { h: 276.94, l: -0.09, t: -176.94, w: 494.04 }, src: IMG + "petal-sprite.webp" },
    { name: "png-cherry-blossom-petals-falling-background-flower-white 5", left: 918.33, top: 542.96, w: 191.252, h: 181.048, rotate: 157.68, blur: 15, opacity: 0.5, innerW: 152.018, innerH: 133.308, crop: PETAL_A, src: IMG + "petal-sprite.webp" },
    { name: "png-cherry-blossom-petals-falling-background-flower-white 9", left: 848, top: 125, w: 256.519, h: 227.43, rotate: 96.66, blur: 42, opacity: 0.3, innerW: 201.569, innerH: 234.728, crop: PETAL_B, src: IMG + "petal-sprite.webp" },
    { name: "png-cherry-blossom-petals-falling-background-flower-white 1", left: 974, top: -324, w: 1090, h: 1004, rotate: 0, blur: 5, opacity: 0.7, innerW: 1090, innerH: 1004, crop: { h: 117.23, l: -61.86, t: 0, w: 161.89 }, src: IMG + "petal-cluster.webp" },
    { name: "png-cherry-blossom-petals-falling-background-flower-white 4", left: 151.6, top: -311.07, w: 726.922, h: 697.887, rotate: -143.62, flip: true, blur: 20, opacity: 1, innerW: 578, innerH: 441, crop: { h: 266.89, l: -0.05, t: -166.89, w: 305.3 }, src: IMG + "petal-sprite.webp" },
    { name: "413716237_2982679f-bcc0-4843-9310-d7d991fc355c 4", left: 910, top: -68, w: 330.368, h: 332.421, rotate: -143.91, flip: true, blur: 1.5, opacity: 1, innerW: 232.512, innerH: 241.88, src: IMG + "zephyr-4.webp", mass: ZEPHYR * 0.75 },
    { name: "413716237_2982679f-bcc0-4843-9310-d7d991fc355c 5", left: 1782, top: -138, w: 362.021, h: 335.018, rotate: -57.87, blur: 2, opacity: 1, innerW: 209.937, innerH: 295.649, src: IMG + "zephyr-5.webp", mass: ZEPHYR * 0.8 },
    { name: "png-cherry-blossom-petals-falling-background-flower-white 8", left: 247, top: 531, w: 342.031, h: 347.328, rotate: -140.77, blur: 20, opacity: 0.2, innerW: 226.35, innerH: 263.586, crop: PETAL_B, src: IMG + "petal-sprite.webp" },
    { name: "png-cherry-blossom-petals-falling-background-flower-white 7", left: -13, top: 483, w: 338.118, h: 320.605, rotate: -157.07, blur: 40, opacity: 0.6, innerW: 267.786, innerH: 234.827, crop: PETAL_A, src: IMG + "petal-sprite.webp" },
    { name: "fresh-red-cranberries-with-transparent-background 1", left: 1793, top: 595, w: 69, h: 72, rotate: 0, blur: 3, opacity: 1, innerW: 69, innerH: 72, crop: { h: 716.85, l: -478.23, t: -65.95, w: 738.01 }, src: IMG + "cranberries.webp" },
    { name: "fresh-red-cranberries-with-transparent-background 10", left: 1864.19, top: 462.52, w: 92.613, h: 90.956, rotate: -67.99, blur: 3, opacity: 1, innerW: 69, innerH: 72, crop: { h: 716.85, l: -314.94, t: -64.46, w: 738.01 }, src: IMG + "cranberries.webp" },
    { name: "fresh-red-cranberries-with-transparent-background 2", left: 1682, top: 104, w: 69, h: 72, rotate: 0, blur: 0.75, opacity: 1, innerW: 69, innerH: 72, crop: CRANBERRY_B, src: IMG + "cranberries.webp", mass: BERRY },
    { name: "fresh-red-cranberries-with-transparent-background 13", left: 668, top: 634, w: 98.482, h: 99.06, rotate: -37.16, blur: 8, opacity: 1, innerW: 69, innerH: 72, crop: CRANBERRY_A, src: IMG + "cranberries.webp" },
    { name: "fresh-red-cranberries-with-transparent-background 11", left: -55, top: 30, w: 98.482, h: 99.06, rotate: -37.16, blur: 17.5, opacity: 1, innerW: 69, innerH: 72, crop: CRANBERRY_A, src: IMG + "cranberries.webp" },
    { name: "fresh-red-cranberries-with-transparent-background 12", left: 746, top: 64, w: 61.416, h: 61.662, rotate: -37.16, blur: 3, opacity: 1, innerW: 43.286, innerH: 44.564, crop: CRANBERRY_A, src: IMG + "cranberries.webp" },
    { name: "fresh-red-cranberries-with-transparent-background 5", left: 870.75, top: 434.73, w: 97.508, h: 96.53, rotate: 58.32, blur: 0.75, opacity: 1, innerW: 69, innerH: 72, crop: { h: 716.85, l: -313.18, t: -67.31, w: 738.01 }, src: IMG + "cranberries.webp", mass: BERRY },
    { name: "413716237_2982679f-bcc0-4843-9310-d7d991fc355c 3", left: 1550.64, top: 125.24, w: 383.301, h: 385.683, rotate: -36.09, blur: 0.75, opacity: 1, innerW: 269.766, innerH: 280.635, src: IMG + "zephyr-3.webp", mass: ZEPHYR },
    { name: "413716237_2982679f-bcc0-4843-9310-d7d991fc355c 1", left: 1208, top: 73.98, w: 356.336, h: 371.584, rotate: 37.96, blur: 0, opacity: 1, innerW: 215.354, innerH: 303.277, src: IMG + "zephyr-1.webp", mass: ZEPHYR * 0.9 },
    { name: "413716237_2982679f-bcc0-4843-9310-d7d991fc355c 2", left: 854.46, top: 261.45, w: 427.083, h: 427.099, rotate: 44.84, blur: 0, opacity: 1, innerW: 300, innerH: 304, src: IMG + "zephyr-2.webp", mass: ZEPHYR * 1.2 },
    { name: "png-cherry-blossom-petals-falling-background-flower-white 1", left: 1034, top: 52, w: 248.444, h: 246.424, rotate: -138.56, blur: 1, opacity: 1, innerW: 186.796, innerH: 163.806, crop: PETAL_A, src: IMG + "petal-sprite.webp", mass: PETAL * 0.8 },
    { name: "png-cherry-blossom-petals-falling-background-flower-white 6", left: 1027, top: 482, w: 338.716, h: 321.437, rotate: 23.24, blur: 0, opacity: 1, innerW: 267.786, innerH: 234.827, crop: PETAL_A, src: IMG + "petal-sprite.webp", mass: PETAL * 1.2 },
    { name: "png-cherry-blossom-petals-falling-background-flower-white 2", left: 1444, top: 233, w: 231, h: 269, rotate: 0, blur: 0.75, opacity: 1, innerW: 231, innerH: 269, crop: PETAL_B, src: IMG + "petal-sprite.webp", mass: PETAL },
    { name: "fresh-red-cranberries-with-transparent-background 8", left: 900, top: 250, w: 98.482, h: 99.06, rotate: -37.16, blur: 0.75, opacity: 1, innerW: 69, innerH: 72, crop: CRANBERRY_B, src: IMG + "cranberries.webp", mass: BERRY },
    { name: "fresh-red-cranberries-with-transparent-background 9", left: 1244, top: 162, w: 98.482, h: 99.06, rotate: -37.16, blur: 0.75, opacity: 1, innerW: 69, innerH: 72, crop: CRANBERRY_A, src: IMG + "cranberries.webp", mass: BERRY },
    { name: "fresh-red-cranberries-with-transparent-background 3", left: 1454, top: 407, w: 57, h: 55, rotate: 0, blur: 1, opacity: 1, innerW: 57, innerH: 55, crop: CRANBERRY_ROUND, radius: 21, src: IMG + "cranberries.webp", mass: BERRY * 0.8 },
    { name: "fresh-red-cranberries-with-transparent-background 4", left: 821, top: 17, w: 57, h: 55, rotate: 0, blur: 3, opacity: 1, innerW: 57, innerH: 55, crop: CRANBERRY_ROUND, radius: 21, src: IMG + "cranberries.webp" },
    { name: "fresh-red-cranberries-with-transparent-background 7", left: 1577.57, top: -33.92, w: 73.861, h: 74.836, rotate: 65.15, blur: 4, opacity: 1, innerW: 57, innerH: 55, crop: CRANBERRY_ROUND, radius: 21, src: IMG + "cranberries.webp" },
    { name: "fresh-red-cranberries-with-transparent-background 6", left: 478, top: 491, w: 75.274, h: 76.107, rotate: 62.11, blur: 5, opacity: 1, innerW: 57, innerH: 55, crop: CRANBERRY_ROUND, radius: 21, src: IMG + "cranberries.webp" },
    { name: "413716237_2982679f-bcc0-4843-9310-d7d991fc355c 6", left: 1459, top: 470, w: 432.663, h: 397.692, rotate: 121.05, flip: true, blur: 1.5, opacity: 1, innerW: 251.217, innerH: 353.781, src: IMG + "zephyr-6.webp", mass: ZEPHYR * 1.2 },
  ];
})();
