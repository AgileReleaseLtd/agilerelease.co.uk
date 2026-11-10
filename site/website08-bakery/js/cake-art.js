/* Cake drawings: flat, outlined SVG cakes on a stand, built from a few options. The gallery tiles, the
   order form's live preview and the home page all use them. They are pictures only (aria-hidden); the
   text next to each one says what it shows.

   CrumbArt.svg(opts) returns SVG markup. opts:
     tiers 1-3, size "6in" | "8in" | "10in" (one tier), frosting (a key of FROSTING), drip (a key of DRIP),
     sprinkles true | "gold" | "all", candles (how many), numbers ("30", gold number candles),
     rosettes "rose" | "daisy", beads, kisses, stripes, naked, berries, flowers, lace, cupcakes,
     wording (true: leave room for the words, set later with CrumbArt.setWording), seed,
     fit: "zoom" (crop to the cake, keeping the 400 by 330 shape, for tiles) or "height" (trim the empty
     space above the cake but keep the scale, so a 6 inch cake still looks smaller than a 10 inch one). */
(function () {
  var INK = "#2b0d1e";
  var FROSTING = {
    cream: ["#fff3dc", "#f1d9b0"],
    white: ["#fffdf8", "#ece2d6"],
    cocoa: ["#7a4330", "#5c2e20"],
    lemon: ["#fdeaa4", "#f1d06a"],
    pistachio: ["#d6eab8", "#b2d08b"],
    pink: ["#ffc6d2", "#f59db2"],
    sky: ["#cfe7f6", "#a6cfe9"],
    butter: ["#ffe28f", "#f4c75a"]
  };
  var DRIP = { raspberry: "#d3245c", chocolate: "#4a2318", white: "#fffaf2", caramel: "#cf8a3c" };
  var SPRINKLES = {
    mixed: ["#ff7aa2", "#ffd15c", "#7cc4ef", "#9ccf6e", "#ffffff"],
    gold: ["#e8b33c", "#fff4cc", "#e8b33c"],
    all: ["#ff5d8f", "#ffc93c", "#4fb3e8", "#7bc96f", "#b48cf0", "#ff9f5a"]
  };
  var CANDLE = ["#ff8fab", "#7cc4ef", "#ffd15c", "#a5d67f", "#c9a8f5"];
  var SPONGE = "#f2c98a";
  var CX = 200;
  var BASE = 330; // where the cake sits on the stand

  function r(n) {
    return Math.round(n * 10) / 10;
  }

  // Small, repeatable random numbers, so a cake looks the same every time it is drawn.
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // The tiers, bottom first: { w, h, top, base, ry }.
  function layout(opts) {
    var tiers = opts.tiers || 1;
    var sizes;
    if (tiers === 3) {
      sizes = [[270, 82], [205, 78], [145, 74]];
    } else if (tiers === 2) {
      sizes = [[244, 104], [172, 98]];
    } else {
      var w = { "6in": 196, "8in": 236, "10in": 272 }[opts.size] || 236;
      sizes = [[w, 132]];
    }
    var out = [];
    var base = BASE;
    sizes.forEach(function (s) {
      var ry = s[0] * 0.115;
      var top = base - s[1];
      out.push({ w: s[0], h: s[1], top: top, base: base, ry: ry, left: CX - s[0] / 2, right: CX + s[0] / 2 });
      base = top + ry * 0.35;
    });
    return out;
  }

  // y on the front (lower) half of an ellipse centred at (CX, cy), for a given x.
  function frontY(t, cy, x, inset) {
    var a = t.w / 2 - (inset || 0);
    var dx = Math.min(1, Math.abs(x - CX) / a);
    return cy + t.ry * Math.sqrt(1 - dx * dx);
  }

  function stand() {
    return '<g class="cake-stand">' +
      '<path d="M162 352 Q170 338 172 338 H228 Q230 338 238 352 Z" fill="#fff" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<ellipse cx="200" cy="360" rx="64" ry="11" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
      '<path d="M32 330 v6 A168 17 0 0 0 368 336 v-6" fill="#f4e9ec" stroke="' + INK + '" stroke-width="3"/>' +
      '<ellipse cx="200" cy="330" rx="168" ry="17" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
      '</g>';
  }

  function tierBody(t, opts, i) {
    var f = FROSTING[opts.frosting] || FROSTING.cream;
    var body = "M" + r(t.left) + " " + r(t.top) + " V" + r(t.base) + " A" + r(t.w / 2) + " " + r(t.ry) + " 0 0 0 " + r(t.right) + " " + r(t.base) + " V" + r(t.top) + " Z";
    var s = "";
    if (opts.naked) {
      s += '<path d="' + body + '" fill="' + SPONGE + '"/>';
      for (var k = 1; k <= 3; k++) {
        var y = t.top + (t.h * k) / 4 + t.ry * 0.5;
        s += '<path d="M' + r(t.left + 2) + " " + r(y) + " A" + r(t.w / 2) + " " + r(t.ry) + " 0 0 0 " + r(t.right - 2) + " " + r(y) + '" fill="none" stroke="#fff3df" stroke-width="7"/>';
      }
      // The thin scraped coat: pale streaks over the sponge.
      s += '<path d="' + body + '" fill="' + f[0] + '" opacity="0.45"/>';
      s += '<rect x="' + r(t.left + t.w * 0.12) + '" y="' + r(t.top + 8) + '" width="' + r(t.w * 0.08) + '" height="' + r(t.h - 4) + '" rx="4" fill="#fffaf0" opacity="0.6"/>';
      s += '<rect x="' + r(t.left + t.w * 0.55) + '" y="' + r(t.top + 14) + '" width="' + r(t.w * 0.12) + '" height="' + r(t.h - 10) + '" rx="4" fill="#fffaf0" opacity="0.45"/>';
    } else {
      s += '<path d="' + body + '" fill="' + f[0] + '"/>';
      if (opts.stripes) {
        var bands = ["#ff8fab", "#ffd15c", "#a5d67f", "#7cc4ef", "#c9a8f5"];
        bands.forEach(function (c, j) {
          var yy = t.top + t.ry + 12 + j * ((t.h - t.ry - 30) / (bands.length - 1));
          s += '<path d="M' + r(t.left + 1.5) + " " + r(yy) + " A" + r(t.w / 2) + " " + r(t.ry) + " 0 0 0 " + r(t.right - 1.5) + " " + r(yy) + '" fill="none" stroke="' + c + '" stroke-width="9"/>';
        });
      }
    }
    // Shade on the right, light on the left.
    var x1 = CX + t.w * 0.3;
    var yTop = frontY(t, t.top, x1);
    var yBot = frontY(t, t.base, x1);
    s += '<path d="M' + r(x1) + " " + r(yTop) + " V" + r(yBot) + " A" + r(t.w / 2) + " " + r(t.ry) + " 0 0 0 " + r(t.right) + " " + r(t.base) + " V" + r(t.top) + " A" + r(t.w / 2) + " " + r(t.ry) + " 0 0 1 " + r(x1) + " " + r(yTop) + ' Z" fill="' + (opts.naked ? "#000" : f[1]) + '" opacity="' + (opts.naked ? 0.08 : 0.75) + '"/>';
    s += '<rect x="' + r(t.left + t.w * 0.07) + '" y="' + r(t.top + t.ry + 10) + '" width="7" height="' + r(Math.max(10, t.h - t.ry - 26)) + '" rx="3.5" fill="#fff" opacity="0.55"/>';
    s += '<path d="' + body + '" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>';
    // The top.
    s += '<ellipse cx="' + CX + '" cy="' + r(t.top) + '" rx="' + r(t.w / 2) + '" ry="' + r(t.ry) + '" fill="' + (opts.naked ? "#fff6e6" : lighten(f[0])) + '" stroke="' + INK + '" stroke-width="3"/>';
    if (opts.lace) {
      s += lace(t);
    }
    if (opts.topBeads && !opts.drip) {
      s += topBeads(t, opts);
    }
    if (opts.beads) {
      s += beads(t, opts);
    }
    return s;
  }

  function lighten(hex) {
    var n = parseInt(hex.slice(1), 16);
    var rr = Math.min(255, (n >> 16) + 14);
    var gg = Math.min(255, ((n >> 8) & 255) + 14);
    var bb = Math.min(255, (n & 255) + 14);
    return "#" + ((1 << 24) + (rr << 16) + (gg << 8) + bb).toString(16).slice(1);
  }

  // A row of piped pearls along the bottom edge of a tier.
  function beads(t, opts) {
    var f = FROSTING[opts.frosting] || FROSTING.cream;
    var fill = opts.naked ? "#fff6e6" : lighten(f[0]);
    var s = "";
    var step = 13;
    var n = Math.floor((t.w - 10) / step);
    var start = CX - (n * step) / 2;
    for (var i = 0; i <= n; i++) {
      var x = start + i * step;
      var y = frontY(t, t.base, x, 4) - 3;
      s += '<circle cx="' + r(x) + '" cy="' + r(y) + '" r="5.5" fill="' + fill + '" stroke="' + INK + '" stroke-width="2"/>';
    }
    return s;
  }

  // A piped border along the front of the top edge.
  function topBeads(t, opts) {
    var f = FROSTING[opts.frosting] || FROSTING.cream;
    var s = "";
    var n = Math.max(9, Math.round(t.w / 13));
    for (var i = 0; i < n; i++) {
      var th = Math.PI * (i + 0.5) / n;
      var x = CX - Math.cos(th) * (t.w / 2 - 4);
      var y = t.top + Math.sin(th) * (t.ry - 1);
      s += '<circle cx="' + r(x) + '" cy="' + r(y) + '" r="4.6" fill="' + lighten(f[0]) + '" stroke="' + INK + '" stroke-width="1.8"/>';
    }
    return s;
  }

  // Piped swags across the front of a tier.
  function lace(t) {
    var s = "";
    var n = Math.max(4, Math.round(t.w / 46));
    var step = (t.w - 16) / n;
    var pts = [];
    for (var i = 0; i <= n; i++) {
      var x = t.left + 8 + i * step;
      pts.push([x, frontY(t, t.top, x, 8) + 12]);
    }
    var d = "M" + r(pts[0][0]) + " " + r(pts[0][1]);
    for (var j = 1; j < pts.length; j++) {
      var mx = (pts[j - 1][0] + pts[j][0]) / 2;
      var my = Math.max(pts[j - 1][1], pts[j][1]) + 16;
      d += " Q" + r(mx) + " " + r(my) + " " + r(pts[j][0]) + " " + r(pts[j][1]);
    }
    s += '<path d="' + d + '" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>';
    s += '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round" opacity="0.45"/>';
    pts.forEach(function (p) {
      s += '<circle cx="' + r(p[0]) + '" cy="' + r(p[1]) + '" r="4.5" fill="#fff" stroke="' + INK + '" stroke-width="2"/>';
    });
    return s;
  }

  // Ganache poured over the top, running down the sides in drips of different lengths.
  function drip(t, colour, rand) {
    var c = DRIP[colour] || DRIP.raspberry;
    var a = t.w / 2;
    var pts = [];
    var x = t.left;
    var d = "M" + r(t.left) + " " + r(t.top);
    var step = 4;
    var nextDrip = t.left + 10 + rand() * 12;
    while (x < t.right) {
      if (x >= nextDrip && x + 22 < t.right) {
        var dw = 11 + rand() * 6;
        var len = 14 + rand() * (t.h * 0.42);
        var y0 = frontY(t, t.top, x) + 7;
        var y1 = frontY(t, t.top, x + dw) + 7;
        var bottom = Math.max(y0, y1) + len;
        d += " L" + r(x) + " " + r(y0);
        d += " C" + r(x + 1) + " " + r(y0 + 6) + " " + r(x + 1) + " " + r(bottom - dw / 2) + " " + r(x + 1) + " " + r(bottom - dw / 2);
        d += " A" + r(dw / 2 - 1) + " " + r(dw / 2 - 1) + " 0 0 0 " + r(x + dw - 1) + " " + r(bottom - dw / 2);
        d += " C" + r(x + dw - 1) + " " + r(bottom - dw / 2) + " " + r(x + dw - 1) + " " + r(y1 + 6) + " " + r(x + dw) + " " + r(y1);
        x += dw;
        nextDrip = x + 8 + rand() * 18;
        continue;
      }
      var yy = frontY(t, t.top, x) + 7 + Math.sin(x / 9) * 1.2;
      d += " L" + r(x) + " " + r(yy);
      x += step;
    }
    d += " L" + r(t.right) + " " + r(t.top) + " A" + r(a) + " " + r(t.ry) + " 0 0 0 " + r(t.left) + " " + r(t.top) + " Z";
    var shine = colour === "white" ? "#fff" : "#fff";
    return '<path d="' + d + '" fill="' + c + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M' + r(CX - a * 0.55) + " " + r(t.top - t.ry * 0.25) + " Q" + r(CX - a * 0.2) + " " + r(t.top - t.ry * 0.55) + " " + r(CX + a * 0.15) + " " + r(t.top - t.ry * 0.5) + '" fill="none" stroke="' + shine + '" stroke-width="4" stroke-linecap="round" opacity="' + (colour === "white" ? 0.9 : 0.35) + '"/>';
  }

  function sprinkles(t, kind, rand, onSides) {
    var colours = SPRINKLES[kind === true ? "mixed" : kind] || SPRINKLES.mixed;
    var s = "";
    var n = kind === "all" ? 34 : 22;
    for (var i = 0; i < n; i++) {
      var ang = rand() * Math.PI * 2;
      var rad = Math.sqrt(rand()) * 0.85;
      var x = CX + Math.cos(ang) * (t.w / 2) * rad;
      var y = t.top + Math.sin(ang) * t.ry * rad;
      s += '<rect x="' + r(x - 1.6) + '" y="' + r(y - 4.5) + '" width="3.2" height="9" rx="1.6" fill="' + colours[i % colours.length] + '" transform="rotate(' + Math.round(rand() * 180) + " " + r(x) + " " + r(y) + ')"/>';
    }
    if (onSides) {
      for (var j = 0; j < 46; j++) {
        var sx = t.left + 10 + rand() * (t.w - 20);
        var sy = frontY(t, t.top, sx) + 16 + rand() * (t.h - 30);
        s += '<rect x="' + r(sx - 1.6) + '" y="' + r(sy - 4.5) + '" width="3.2" height="9" rx="1.6" fill="' + colours[j % colours.length] + '" transform="rotate(' + Math.round(rand() * 180) + " " + r(sx) + " " + r(sy) + ')"/>';
      }
    }
    return s;
  }

  // Points along the front rim of a tier's top, back to front.
  function rimPoints(t, count, inset) {
    var pts = [];
    for (var i = 0; i < count; i++) {
      var th = Math.PI * (i + 0.5) / count;
      pts.push([CX - Math.cos(th) * (t.w / 2 - inset), t.top + Math.sin(th) * (t.ry - inset * 0.25)]);
    }
    return pts;
  }

  function rose(x, y, size) {
    return '<circle cx="' + r(x) + '" cy="' + r(y) + '" r="' + size + '" fill="#ff9fb5" stroke="' + INK + '" stroke-width="2.4"/>' +
      '<path d="M' + r(x - size * 0.45) + " " + r(y + size * 0.1) + " A" + r(size * 0.45) + " " + r(size * 0.45) + " 0 1 1 " + r(x + size * 0.15) + " " + r(y + size * 0.45) + " M" + r(x - size * 0.05) + " " + r(y - size * 0.05) + " A" + r(size * 0.18) + " " + r(size * 0.18) + " 0 1 1 " + r(x + size * 0.2) + " " + r(y + size * 0.1) + '" fill="none" stroke="#d3245c" stroke-width="2" stroke-linecap="round"/>';
  }

  function daisy(x, y, size, centre) {
    var s = "";
    for (var i = 0; i < 6; i++) {
      var a = (Math.PI * 2 * i) / 6;
      var px = x + Math.cos(a) * size * 0.62;
      var py = y + Math.sin(a) * size * 0.62;
      s += '<circle cx="' + r(px) + '" cy="' + r(py) + '" r="' + r(size * 0.48) + '" fill="#fff" stroke="' + INK + '" stroke-width="2"/>';
    }
    return s + '<circle cx="' + r(x) + '" cy="' + r(y) + '" r="' + r(size * 0.42) + '" fill="' + (centre || "#ffc93c") + '" stroke="' + INK + '" stroke-width="2"/>';
  }

  function leaf(x, y, angle, len) {
    return '<ellipse cx="' + r(x) + '" cy="' + r(y) + '" rx="' + r(len) + '" ry="' + r(len * 0.42) + '" fill="#7fb36a" stroke="' + INK + '" stroke-width="2" transform="rotate(' + angle + " " + r(x) + " " + r(y) + ')"/>';
  }

  function rosettes(t, kind) {
    var count = Math.max(5, Math.round(t.w / 30));
    var s = "";
    rimPoints(t, count, 14).forEach(function (p, i) {
      if (i % 2 === 0) {
        s += leaf(p[0] + 9, p[1] + 2, 25, 8);
      }
      s += kind === "daisy" ? daisy(p[0], p[1] - 2, 11) : rose(p[0], p[1] - 2, 11);
    });
    return s;
  }

  function flowers(t, rand) {
    var s = "";
    var bx = CX + t.w * 0.18;
    var by = t.top - 2;
    s += leaf(bx - 26, by + 2, -30, 13) + leaf(bx + 28, by + 4, 30, 12) + leaf(bx + 4, by - 16, -75, 11);
    var cols = ["#ff9fb5", "#fff", "#ffd15c", "#f6b8cf"];
    [[bx - 14, by - 4, 15], [bx + 14, by - 8, 13], [bx + 2, by + 8, 12], [bx - 34, by + 10, 9], [bx + 34, by + 10, 9]].forEach(function (f, i) {
      s += daisy(f[0], f[1], f[2], i === 1 ? "#d3245c" : "#ffc93c").replace(/#fff"/g, cols[i % cols.length] + '"');
    });
    // A few flowers cascading down the side of the tier.
    var sx = t.left + t.w * 0.2;
    s += leaf(sx + 12, t.top + t.h * 0.45, 40, 10) + daisy(sx, t.top + t.h * 0.4, 9, "#ffc93c");
    void rand;
    return s;
  }

  function berries(t, rand) {
    var s = "";
    var pts = [];
    for (var i = 0; i < 16; i++) {
      var ang = rand() * Math.PI * 2;
      var rad = Math.sqrt(rand()) * 0.6;
      pts.push([CX + Math.cos(ang) * (t.w / 2) * rad, t.top + Math.sin(ang) * t.ry * rad - 4]);
    }
    pts.sort(function (a, b) {
      return a[1] - b[1];
    });
    pts.forEach(function (p, i) {
      if (i % 3 === 0) {
        s += '<circle cx="' + r(p[0]) + '" cy="' + r(p[1]) + '" r="6.5" fill="#46508f" stroke="' + INK + '" stroke-width="2"/><circle cx="' + r(p[0] - 2) + '" cy="' + r(p[1] - 2) + '" r="1.6" fill="#fff" opacity="0.6"/>';
      } else {
        s += '<circle cx="' + r(p[0]) + '" cy="' + r(p[1]) + '" r="7.5" fill="#d3245c" stroke="' + INK + '" stroke-width="2"/><circle cx="' + r(p[0] - 2.5) + '" cy="' + r(p[1] - 1.5) + '" r="1.3" fill="#ffd0dc"/><circle cx="' + r(p[0] + 2) + '" cy="' + r(p[1] + 2) + '" r="1.3" fill="#ffd0dc"/>';
      }
    });
    s += leaf(CX + 18, t.top - 10, -20, 9) + leaf(CX - 4, t.top - 14, 35, 8);
    return s;
  }

  function kisses(t) {
    var s = "";
    rimPoints(t, 7, 16).forEach(function (p, i) {
      var x = p[0];
      var y = p[1] + 2;
      var c = i % 2 ? "#fff" : "#ffc6d2";
      s += '<path d="M' + r(x - 11) + " " + r(y) + " Q" + r(x - 12) + " " + r(y - 12) + " " + r(x) + " " + r(y - 24) + " Q" + r(x + 12) + " " + r(y - 12) + " " + r(x + 11) + " " + r(y) + ' Z" fill="' + c + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M' + r(x - 5) + " " + r(y - 3) + " Q" + r(x - 2) + " " + r(y - 14) + " " + r(x + 1) + " " + r(y - 20) + '" fill="none" stroke="#d3245c" stroke-width="2" stroke-linecap="round" opacity="0.6"/>';
    });
    return s;
  }

  function candles(t, n, rand) {
    var s = "";
    n = Math.min(n, 9);
    var span = Math.min(t.w * 0.62, n * 22);
    for (var i = 0; i < n; i++) {
      var x = CX - span / 2 + (n === 1 ? span / 2 : (span * i) / (n - 1));
      var y = t.top + (i % 2 ? -t.ry * 0.28 : t.ry * 0.18) + (rand() - 0.5) * 3;
      var hgt = 34;
      var c = CANDLE[i % CANDLE.length];
      s += '<g class="cake-candle">' +
        '<circle class="cake-glow" cx="' + r(x) + '" cy="' + r(y - hgt - 11) + '" r="13" fill="#ffd15c" opacity="0.35"/>' +
        '<rect x="' + r(x - 4) + '" y="' + r(y - hgt) + '" width="8" height="' + hgt + '" rx="2" fill="' + c + '" stroke="' + INK + '" stroke-width="2"/>' +
        '<path d="M' + r(x - 4) + " " + r(y - hgt + 10) + " l8 -5 M" + r(x - 4) + " " + r(y - hgt + 21) + " l8 -5 M" + r(x - 4) + " " + r(y - hgt + 32) + ' l8 -5" stroke="#fff" stroke-width="2.4"/>' +
        '<path d="M' + r(x) + " " + r(y - hgt) + " v-5" + '" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>' +
        '<path class="cake-flame" d="M' + r(x) + " " + r(y - hgt - 25) + " C" + r(x + 7.5) + " " + r(y - hgt - 15) + " " + r(x + 6.5) + " " + r(y - hgt - 5) + " " + r(x) + " " + r(y - hgt - 4.5) + " C" + r(x - 6.5) + " " + r(y - hgt - 5) + " " + r(x - 7.5) + " " + r(y - hgt - 15) + " " + r(x) + " " + r(y - hgt - 25) + ' Z" fill="#ffc93c" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
        "</g>";
    }
    return s;
  }

  function numberCandles(t, digits) {
    var y = t.top + t.ry * 0.3;
    return '<text class="cake-numbers" x="' + CX + '" y="' + r(y) + '" text-anchor="middle" font-size="54" fill="#f1b532" stroke="' + INK + '" stroke-width="3.5" paint-order="stroke" stroke-linejoin="round">' + digits + "</text>";
  }

  function cupcake(x, base, frosting) {
    return '<g class="cake-cupcake">' +
      '<path d="M' + (x - 22) + " " + (base - 30) + " L" + (x - 16) + " " + base + " H" + (x + 16) + " L" + (x + 22) + " " + (base - 30) + ' Z" fill="#ff8fab" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<path d="M' + (x - 9) + " " + (base - 28) + " L" + (x - 7) + " " + (base - 2) + " M" + x + " " + (base - 28) + " V" + (base - 2) + " M" + (x + 9) + " " + (base - 28) + " L" + (x + 7) + " " + (base - 2) + '" stroke="' + INK + '" stroke-width="1.6" opacity="0.4"/>' +
      '<path d="M' + (x - 25) + " " + (base - 30) + " Q" + (x - 27) + " " + (base - 44) + " " + (x - 12) + " " + (base - 46) + " Q" + (x - 6) + " " + (base - 62) + " " + x + " " + (base - 64) + " Q" + (x + 8) + " " + (base - 60) + " " + (x + 12) + " " + (base - 46) + " Q" + (x + 27) + " " + (base - 44) + " " + (x + 25) + " " + (base - 30) + ' Z" fill="' + frosting + '" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<circle cx="' + x + '" cy="' + (base - 66) + '" r="5" fill="#d3245c" stroke="' + INK + '" stroke-width="2"/>' +
      "</g>";
  }

  // The part of the drawing to show: "x y width height".
  function viewBox(opts, top) {
    if (!opts.fit) {
      return "0 50 400 330";
    }
    var headroom = opts.candles ? 64 : opts.numbers ? 50 : opts.flowers ? 34 : opts.kisses ? 28 : opts.berries ? 22 : opts.rosettes ? 16 : 6;
    var y0 = Math.max(0, top.top - top.ry - headroom - 12);
    if (opts.fit === "height") {
      return "0 " + r(y0) + " 400 " + r(380 - y0);
    }
    var h = 380 - y0;
    var w = (h * 400) / 330;
    var minW = opts.cupcakes ? 400 : 352;
    if (w < minW) {
      w = minW;
      h = (w * 330) / 400;
    }
    if (w > 400) {
      return "0 50 400 330";
    }
    return r(200 - w / 2) + " " + r(380 - h) + " " + r(w) + " " + r(h);
  }

  function svg(opts) {
    opts = opts || {};
    var rand = rng(opts.seed || 7);
    var tiers = layout(opts);
    var top = tiers[tiers.length - 1];
    var s = '<svg class="cake-art" viewBox="' + viewBox(opts, top) + '" aria-hidden="true" focusable="false">';
    s += '<ellipse cx="200" cy="372" rx="120" ry="6" fill="' + INK + '" opacity="0.12"/>';
    s += stand();
    tiers.forEach(function (t, i) {
      s += '<g class="cake-tier">' + tierBody(t, opts, i);
      if (opts.drip && i === tiers.length - 1) {
        s += drip(t, opts.drip, rand);
      }
      s += "</g>";
    });
    if (opts.sprinkles) {
      s += sprinkles(top, opts.sprinkles, rand, opts.sprinkles === "all" && !opts.drip);
    }
    if (opts.berries) {
      s += berries(top, rand);
    }
    if (opts.rosettes) {
      s += rosettes(top, opts.rosettes);
    }
    if (opts.kisses) {
      s += kisses(top);
    }
    if (opts.flowers) {
      s += flowers(top, rand);
    }
    if (opts.numbers) {
      s += numberCandles(top, String(opts.numbers).replace(/[^0-9]/g, "").slice(0, 3));
    }
    if (opts.candles) {
      s += candles(top, opts.candles, rand);
    }
    if (opts.wording) {
      // The words go on the front of the bottom tier; setWording fills them in.
      var b = tiers[0];
      var dark = opts.frosting === "cocoa";
      var y = frontY(b, b.top, CX) + (b.base - b.top) / 2 + 2;
      if (opts.drip && tiers.length === 1) {
        y = b.top + b.ry + b.h * 0.6;
      } else if (opts.lace || opts.stripes) {
        y += 12;
      }
      s += '<text class="cake-wording" x="' + CX + '" y="' + r(y) + '" text-anchor="middle" dominant-baseline="middle" font-size="24" data-max="' + r(b.w - 44) + '" fill="' + (dark ? "#fff3dc" : "#c4164e") + '"></text>';
    }
    if (opts.cupcakes) {
      s += cupcake(40, 378, "#fff3dc") + cupcake(360, 378, "#ffc6d2");
    }
    return s + "</svg>";
  }

  // Put words on a drawn cake: one line, or two when long, shrunk to fit the front of the bottom tier.
  function setWording(svgEl, words) {
    var text = svgEl && svgEl.querySelector(".cake-wording");
    if (!text) {
      return;
    }
    words = (words || "").replace(/\s+/g, " ").trim();
    var lines = [words];
    if (words.length > 16 && words.indexOf(" ") !== -1) {
      // Break at the space nearest the middle.
      var mid = words.length / 2;
      var best = -1;
      for (var i = 0; i < words.length; i++) {
        if (words[i] === " " && (best === -1 || Math.abs(i - mid) < Math.abs(best - mid))) {
          best = i;
        }
      }
      lines = [words.slice(0, best), words.slice(best + 1)];
    }
    var longest = Math.max.apply(null, lines.map(function (l) {
      return l.length;
    }));
    var size = longest > 18 ? 14 : longest > 14 ? 16 : longest > 10 ? 18 : 22;
    text.setAttribute("font-size", String(size));
    text.textContent = "";
    var max = +text.getAttribute("data-max") || 180;
    lines.forEach(function (line, n) {
      var span = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      span.setAttribute("x", text.getAttribute("x"));
      span.setAttribute("dy", lines.length === 1 ? "0" : n === 0 ? "-0.6em" : "1.2em");
      span.textContent = line;
      text.appendChild(span);
      if (line && typeof span.getComputedTextLength === "function" && span.getComputedTextLength() > max) {
        span.setAttribute("textLength", String(max));
        span.setAttribute("lengthAdjust", "spacingAndGlyphs");
      }
    });
  }

  window.CrumbArt = { svg: svg, setWording: setWording, FROSTING: FROSTING };
})();
