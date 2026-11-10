/* The property illustrations. Each listing in data.js has an "art" entry, and this file draws it as a flat
   front elevation in one house style: brick coursing, sash windows, the house number in the transom light
   over the door, the agent's board, plane trees, double yellow lines and Canary Wharf in the distance.
   On a real agent's site the photos go where these drawings are; the drawings stay useful as thumbnails
   for homes that are not yet photographed.

   Nothing here is loaded from elsewhere: every shape is built with createElementNS and SVG presentation
   attributes (fill, stroke), which the site's Content Security Policy allows. */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var uid = 0;

  var C = {
    sky: { pink: "#f4e3da", sage: "#e5e9d7", cream: "#f3ecdf", blue: "#e0e8e7" },
    far: { pink: "#e8d1c5", sage: "#d4dac1", cream: "#e4d9c5", blue: "#c9d5d4" },
    sun: { pink: "#faefe9", sage: "#f1f3e8", cream: "#faf5ec", blue: "#f0f4f3" },
    brick: {
      stock: ["#d9c49c", "#c4ab7e"], red: ["#b86b4f", "#9d5640"], brown: ["#8f5d47", "#784a37"],
      painted: ["#efe6d5", "#e1d5c0"], light: ["#ddd0b8", "#c9b99c"], dark: ["#6d675f", "#5b564f"],
      sage: ["#c9d2bd", "#b6c0a8"], rose: ["#ecc9bb", "#dcb3a3"], soot: ["#c5ab7d", "#ab9066"]
    },
    stucco: "#f4efe5", stuccoShade: "#e1d9ca", stuccoLine: "#d3c8b5",
    slate: "#5a616b", slateLight: "#6e757e", slateDark: "#474d55", lead: "#7d838a",
    glass: "#3d4850", glassDark: "#323b42", glassShine: "#6b7a82",
    frame: "#f8f5ef", iron: "#272a22", gilt: "#f0d79e", brass: "#d6b064",
    door: { black: "#23251f", olive: "#535e34", pink: "#d48f7c", navy: "#2f3c55", ochre: "#c39234", sage: "#8aa184", oxblood: "#6d2c2c", teal: "#3f6b68" },
    leaf: ["#7b8a4b", "#687740", "#91a05f"], trunk: "#6f5e4a", bark: "#a39477",
    pavement: "#d6cfc1", paveLine: "#c5bcac", kerb: "#b7ac9a", road: "#9d9a8f", yellow: "#e3c24c",
    water: "#9fb3b1", ripple: "#bccbc8", towpath: "#cbbfa8",
    concrete: "#cfc9bc", concreteShade: "#bdb6a7",
    mark: "#b53a52", markFill: "#f2c2b4", ink: "#2a2321", brand: "#3a312e", plaster: "#f7f2ea", board: "#fbf8f1"
  };

  function node(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) {
      if (attrs[k] !== undefined && attrs[k] !== null) {
        n.setAttribute(k, attrs[k]);
      }
    }
    if (parent) {
      parent.appendChild(n);
    }
    return n;
  }
  function rect(p, x, y, w, h, fill, extra) {
    var a = { x: r1(x), y: r1(y), width: r1(Math.max(0, w)), height: r1(Math.max(0, h)), fill: fill };
    for (var k in extra || {}) {
      a[k] = extra[k];
    }
    return node("rect", a, p);
  }
  function poly(p, pts, fill, extra) {
    var a = { points: pts.map(function (q) { return r1(q[0]) + "," + r1(q[1]); }).join(" "), fill: fill };
    for (var k in extra || {}) {
      a[k] = extra[k];
    }
    return node("polygon", a, p);
  }
  function circle(p, cx, cy, r, fill, extra) {
    var a = { cx: r1(cx), cy: r1(cy), r: r1(r), fill: fill };
    for (var k in extra || {}) {
      a[k] = extra[k];
    }
    return node("circle", a, p);
  }
  function path(p, d, attrs) {
    attrs.d = d;
    return node("path", attrs, p);
  }
  function text(p, x, y, str, attrs) {
    var t = node("text", attrs, p);
    t.setAttribute("x", r1(x));
    t.setAttribute("y", r1(y));
    t.textContent = str;
    return t;
  }
  function r1(n) {
    return Math.round(n * 10) / 10;
  }

  /* ---------- Patterns ---------- */

  function brickFill(ctx, name) {
    var key = "brick-" + name;
    if (ctx.fills[key]) {
      return ctx.fills[key];
    }
    var cols = C.brick[name] || C.brick.stock;
    var id = ctx.id + "-" + key;
    var pat = node("pattern", { id: id, width: 22, height: 10, patternUnits: "userSpaceOnUse" }, ctx.defs);
    rect(pat, 0, 0, 22, 10, cols[0]);
    path(pat, "M0 .4H22M0 5.4H22M5.5 .4V5.4M16.5 5.4V10.4", { stroke: cols[1], "stroke-width": 0.9, fill: "none", opacity: 0.75 });
    // A few darker bricks so the wall does not look printed.
    rect(pat, 6, 0.9, 10, 4, cols[1], { opacity: 0.35 });
    ctx.fills[key] = "url(#" + id + ")";
    return ctx.fills[key];
  }

  function rusticFill(ctx) {
    if (ctx.fills.rustic) {
      return ctx.fills.rustic;
    }
    var id = ctx.id + "-rustic";
    var pat = node("pattern", { id: id, width: 40, height: 12, patternUnits: "userSpaceOnUse" }, ctx.defs);
    rect(pat, 0, 0, 40, 12, C.stucco);
    path(pat, "M0 11.5H40", { stroke: C.stuccoLine, "stroke-width": 1, fill: "none" });
    ctx.fills.rustic = "url(#" + id + ")";
    return ctx.fills.rustic;
  }

  /* ---------- Small parts ---------- */

  // A sash window. o.panes: "georgian" (6 over 6), "two" (2 over 2) or none (1 over 1).
  function sash(g, x, y, w, h, o) {
    o = o || {};
    if (o.lintel !== false) {
      rect(g, x - 3, y - 7, w + 6, 7, o.lintelFill || C.stucco);
    }
    rect(g, x, y, w, h, C.frame);
    var gw = w - 6;
    var gh = h / 2 - 4.5;
    rect(g, x + 3, y + 3, gw, gh, C.glass);
    rect(g, x + 3, y + h / 2 + 1.5, gw, gh, C.glassDark);
    poly(g, [[x + 3, y + 3 + gh * 0.55], [x + 3 + gw * 0.45, y + 3], [x + 3 + gw * 0.7, y + 3], [x + 3, y + 3 + gh]], C.glassShine, { opacity: 0.35 });
    if (o.panes === "georgian") {
      [1, 2].forEach(function (i) {
        rect(g, x + 3 + (gw * i) / 3 - 0.8, y + 3, 1.6, h - 6, C.frame);
      });
      rect(g, x + 3, y + 3 + gh / 2 - 0.8, gw, 1.6, C.frame);
      rect(g, x + 3, y + h / 2 + 1.5 + gh / 2 - 0.8, gw, 1.6, C.frame);
    } else if (o.panes === "two") {
      rect(g, x + w / 2 - 0.8, y + 3, 1.6, h - 6, C.frame);
    }
    if (o.sill !== false) {
      rect(g, x - 4, y + h, w + 8, 4, C.stucco);
    }
  }

  // A front door with its surround, the transom light and the house number in gilt.
  function door(g, x, y, w, h, colour, number, o) {
    o = o || {};
    if (o.surround !== false) {
      rect(g, x - 7, y - 27, w + 14, h + 27, C.stucco);
      rect(g, x - 10, y - 31, w + 20, 5, C.stuccoShade);
    }
    rect(g, x, y - 22, w, 18, C.glassDark);
    rect(g, x, y - 5, w, 2, C.frame);
    if (number) {
      text(g, x + w / 2, y - 8.6, number, { "text-anchor": "middle", fill: C.gilt, "font-size": 11, "font-weight": 600, "font-family": "Besley, Georgia, serif" });
    }
    var fill = C.door[colour] || colour || C.door.black;
    rect(g, x, y - 3, w, h + 3, fill);
    // Four panels.
    var pw = (w - 11) / 2;
    [[0, 0.06, 0.44], [1, 0.06, 0.44], [0, 0.56, 0.36], [1, 0.56, 0.36]].forEach(function (p) {
      rect(g, x + 4 + p[0] * (pw + 3), y + h * p[1], pw, h * p[2], "#000", { opacity: 0.13 });
    });
    rect(g, x + w / 2 - 5.5, y + h * 0.52, 11, 2.4, C.brass);
    circle(g, x + w - 6, y + h * 0.47, 1.7, C.brass);
    if (o.steps !== false) {
      rect(g, x - 9, y + h, w + 18, 5, C.stuccoShade);
      rect(g, x - 13, y + h + 5, w + 26, 5, C.stucco);
    }
  }

  // A canted bay window across one ground-floor bay, with its slate cap.
  function bayWindow(g, x, y, w, h) {
    rect(g, x, y, w, h, C.stucco);
    rect(g, x, y + h - 16, w, 16, C.stuccoShade);
    var side = w * 0.18;
    var mid = w - side * 2 - 16;
    rect(g, x + 4, y + 8, side, h - 30, C.glassDark);
    rect(g, x + w - 4 - side, y + 8, side, h - 30, C.glassDark);
    rect(g, x + 8 + side, y + 8, mid, h - 30, C.glass);
    rect(g, x + 4, y + 8 + (h - 30) / 2 - 1, w - 8, 2.4, C.frame);
    poly(g, [[x + 8 + side, y + 8 + (h - 30) * 0.4], [x + 8 + side + mid * 0.5, y + 8], [x + 8 + side + mid * 0.72, y + 8], [x + 8 + side, y + 8 + (h - 30) * 0.62]], C.glassShine, { opacity: 0.3 });
    rect(g, x - 5, y - 4, w + 10, 6, C.stucco);
    poly(g, [[x - 3, y - 4], [x + w + 3, y - 4], [x + w - 8, y - 16], [x + 8, y - 16]], C.slate);
  }

  function chimney(g, x, top, fill, h) {
    h = h || 30;
    rect(g, x - 11, top - h, 22, h + 2, fill);
    rect(g, x - 13, top - h - 4, 26, 5, C.stucco);
    rect(g, x - 8, top - h - 13, 6, 10, "#b8663f");
    rect(g, x + 2, top - h - 11, 6, 8, "#a95b39");
  }

  function railings(g, x1, x2, yTop, yBottom) {
    rect(g, x1, yTop, x2 - x1, 2, C.iron);
    for (var x = x1 + 2; x < x2 - 1; x += 5.5) {
      rect(g, x, yTop - 3, 1.4, yBottom - yTop + 3, C.iron);
    }
  }

  // A low front-garden wall with railings, broken for the gate in front of the door.
  function gardenWall(ctx, g, x1, x2, gap1, gap2, brick) {
    var G = ctx.G;
    [[x1, gap1], [gap2, x2]].forEach(function (seg) {
      if (seg[1] - seg[0] < 2) {
        return;
      }
      rect(g, seg[0], G - 15, seg[1] - seg[0], 15, brickFill(ctx, brick));
      rect(g, seg[0] - 1, G - 18, seg[1] - seg[0] + 2, 4, C.stucco);
      railings(g, seg[0] + 2, seg[1] - 2, G - 36, G - 18);
    });
    rect(g, gap1 - 1, G - 40, 5, 40, C.stuccoShade);
    rect(g, gap2 - 4, G - 40, 5, 40, C.stuccoShade);
  }

  // The agent's board on a post in the front garden, with a slip across it when the home is under offer.
  function agentBoard(ctx, g, x, kind, status) {
    var G = ctx.G;
    rect(g, x - 1.8, G - 98, 3.6, 84, "#efe8da");
    var by = G - 132;
    rect(g, x - 30, by, 60, 40, C.board, { stroke: C.brand, "stroke-width": 1 });
    rect(g, x - 30, by, 60, 11, C.brand);
    text(g, x, by + 8, "TRANSOM & CO", { "text-anchor": "middle", fill: C.plaster, "font-size": 6, "font-weight": 600, "letter-spacing": 0.6, "font-family": "Onest, Arial, sans-serif" });
    text(g, x, by + 29, kind === "let" ? "TO LET" : "FOR SALE", { "text-anchor": "middle", fill: C.brand, "font-size": 10.5, "font-weight": 700, "font-family": "Besley, Georgia, serif" });
    var slip = { "under-offer": "UNDER OFFER", "sold-stc": "SOLD STC", "let-agreed": "LET AGREED" }[status];
    if (slip) {
      var s = node("g", { transform: "rotate(-14 " + x + " " + (by + 24) + ")" }, g);
      rect(s, x - 36, by + 17, 72, 12, "#d9576c");
      text(s, x, by + 26, slip, { "text-anchor": "middle", fill: "#fff", "font-size": 7, "font-weight": 700, "letter-spacing": 0.5, "font-family": "Onest, Arial, sans-serif" });
    }
  }

  // A London plane tree on the pavement.
  function tree(ctx, g, x, scale) {
    var G = ctx.G;
    var s = scale || 1;
    var t = node("g", { transform: "translate(" + x + " " + G + ") scale(" + s + ") translate(" + -x + " " + -G + ")" }, g);
    rect(t, x - 4.5, G - 96, 9, 96, C.trunk);
    path(t, "M" + x + " " + (G - 70) + "l-22 -34M" + x + " " + (G - 80) + "l20 -38", { stroke: C.trunk, "stroke-width": 5, "stroke-linecap": "round", fill: "none" });
    circle(t, x - 2, G - 92, 3, C.bark);
    circle(t, x + 2, G - 60, 2.5, C.bark);
    circle(t, x - 30, G - 122, 30, C.leaf[1]);
    circle(t, x + 26, G - 128, 32, C.leaf[1]);
    circle(t, x - 2, G - 156, 33, C.leaf[0]);
    circle(t, x - 22, G - 146, 22, C.leaf[2], { opacity: 0.85 });
    circle(t, x + 30, G - 104, 20, C.leaf[0]);
    circle(t, x + 14, G - 168, 16, C.leaf[2], { opacity: 0.8 });
    rect(t, x - 12, G - 2, 24, 4, "#8b8270");
  }

  function lamp(ctx, g, x) {
    var G = ctx.G;
    rect(g, x - 1.6, G - 128, 3.2, 128, C.iron);
    rect(g, x - 4, G - 10, 8, 10, C.iron);
    path(g, "M" + x + " " + (G - 126) + "q0 -10 14 -10", { stroke: C.iron, "stroke-width": 2.6, fill: "none" });
    poly(g, [[x + 8, G - 136], [x + 22, G - 136], [x + 19, G - 128], [x + 11, G - 128]], C.iron);
    rect(g, x + 11, G - 128, 8, 3, C.gilt);
  }

  /* ---------- Backdrop and ground ---------- */

  function backdrop(ctx, g, sky, o) {
    var W = ctx.W;
    rect(g, 0, 0, W, ctx.H, C.sky[sky]);
    circle(g, o.sunX || W * 0.17, o.sunY || 58, 30, C.sun[sky]);
    // Canary Wharf: three towers, one with the pyramid roof, and a low line of blocks.
    var far = C.far[sky];
    var cx = o.wharfX !== undefined ? o.wharfX : W * 0.74;
    var top = o.wharfTop || 40;
    rect(g, cx, top, 30, 300, far);
    poly(g, [[cx, top], [cx + 15, top - 15], [cx + 30, top]], far);
    rect(g, cx + 36, top + 26, 26, 300, far);
    rect(g, cx - 28, top + 32, 22, 300, far);
    rect(g, cx + 68, top + 54, 18, 300, far);
    rect(g, cx - 54, top + 70, 20, 300, far);
    rect(g, cx - 20, top + 34, 3, 6, C.sky[sky]);
  }

  function ground(ctx, g, o) {
    var W = ctx.W;
    var G = ctx.G;
    if (o.water) {
      rect(g, 0, G, W, 10, C.towpath);
      rect(g, 0, G + 10, W, 3, C.kerb);
      rect(g, 0, G + 13, W, ctx.H - G - 13, C.water);
      for (var i = 0; i < 9; i++) {
        var rx = (i * 61 + 17) % W;
        rect(g, rx, G + 20 + (i % 3) * 7, 26 + (i % 2) * 14, 2, C.ripple);
      }
      return;
    }
    rect(g, 0, G, W, 16, C.pavement);
    for (var x = 30; x < W; x += 48) {
      rect(g, x, G, 1.2, 16, C.paveLine);
    }
    rect(g, 0, G + 16, W, 4, C.kerb);
    rect(g, 0, G + 20, W, ctx.H - G - 20, C.road);
    rect(g, 0, G + 23, W, 1.8, C.yellow);
    rect(g, 0, G + 27, W, 1.8, C.yellow);
  }

  function narrowboat(ctx, g, x) {
    var G = ctx.G;
    var y = G + 16;
    poly(g, [[x, y], [x + 150, y], [x + 162, y + 6], [x + 150, y + 14], [x + 4, y + 14]], "#2f4a3c");
    rect(g, x + 12, y - 14, 120, 14, "#3d5c4a");
    rect(g, x + 12, y - 16, 120, 3, "#9a3b3b");
    for (var i = 0; i < 6; i++) {
      rect(g, x + 22 + i * 18, y - 10, 8, 6, C.gilt, { opacity: 0.85 });
    }
    rect(g, x, y + 4, 162, 2, "#c9a34a");
  }

  /* ---------- Buildings ---------- */

  // A Victorian terraced house. o: bay, dormer, storeys (2 or 3), brick, door, number, board.
  function terrace(ctx, g, x, w, o) {
    var G = ctx.G;
    var gf = 96;
    var ff = 84;
    var sf = o.storeys === 3 ? 70 : 0;
    var top = G - gf - ff - sf;
    var brick = brickFill(ctx, o.brick || "stock");
    var mirror = !!o.mirror;

    poly(g, [[x, top - 2], [x + w, top - 2], [x + w - 14, top - 32], [x + 14, top - 32]], C.slate);
    rect(g, x + 14, top - 34, w - 28, 3, C.slateDark);
    if (o.dormer) {
      var dx = x + w / 2 - 30;
      rect(g, dx, top - 30, 60, 30, C.lead);
      rect(g, dx - 3, top - 33, 66, 4, C.slateDark);
      sash(g, dx + 10, top - 25, 40, 22, { lintel: false, sill: false });
    }
    rect(g, x, top, w, G - top, brick);
    rect(g, x, top, 1.6, G - top, "#000", { opacity: 0.12 });
    rect(g, x - 1, top - 5, w + 2, 8, C.stucco);
    rect(g, x - 1, top + 3, w + 2, 2, C.stuccoShade);
    chimney(g, x, top - 30, brick);
    chimney(g, x + w, top - 30, brick);

    var doorW = 36;
    var doorH = 72;
    var doorX = mirror ? x + 18 : x + w - doorW - 18;
    var bayX = mirror ? x + w - 14 - 86 : x + 14;
    var leftC = mirror ? doorX + doorW / 2 : bayX + 43;
    var rightC = mirror ? bayX + 43 : doorX + doorW / 2;

    // Upper floors.
    var winW = 38;
    sash(g, leftC - winW / 2, G - gf - ff + 16, winW, 58, { panes: "two" });
    sash(g, rightC - winW / 2, G - gf - ff + 16, winW, 58, { panes: "two" });
    if (sf) {
      sash(g, leftC - 17, top + 14, 34, 44, {});
      sash(g, rightC - 17, top + 14, 34, 44, {});
    }
    rect(g, x, G - gf - 3, w, 4, C.stuccoShade, { opacity: 0.7 });

    // Ground floor.
    if (o.bay) {
      bayWindow(g, bayX, G - gf + 16, 86, gf - 16);
    } else {
      sash(g, (mirror ? rightC : leftC) - 22, G - gf + 18, 44, 62, { panes: "two" });
    }
    door(g, doorX, G - doorH - 10, doorW, doorH, o.door, o.number);

    gardenWall(ctx, g, x + 2, x + w - 2, doorX - 6, doorX + doorW + 6, o.brick === "red" ? "red" : "stock");
    if (o.board) {
      agentBoard(ctx, g, mirror ? x + w - 34 : x + 34, o.board, ctx.status);
    }
    return { top: top, gf: gf, ff: ff, sf: sf, doorX: doorX };
  }

  // A flat-fronted cottage, front door straight onto the pavement.
  function cottage(ctx, g, x, w, o) {
    var G = ctx.G;
    var gf = 76;
    var ff = 64;
    var top = G - gf - ff;
    var brick = brickFill(ctx, o.brick || "painted");
    poly(g, [[x, top - 2], [x + w, top - 2], [x + w - 12, top - 28], [x + 12, top - 28]], C.slate);
    rect(g, x + 12, top - 30, w - 24, 3, C.slateDark);
    rect(g, x, top, w, G - top, brick);
    rect(g, x, top, 1.6, G - top, "#000", { opacity: 0.12 });
    rect(g, x - 1, top - 4, w + 2, 6, C.stucco);
    chimney(g, x, top - 26, brickFill(ctx, "stock"), 24);
    chimney(g, x + w, top - 26, brickFill(ctx, "stock"), 24);
    rect(g, x, G - 12, w, 12, C.stuccoShade);
    sash(g, x + 22, top + 12, 38, 40, { panes: "two" });
    sash(g, x + w - 60, top + 12, 38, 40, { panes: "two" });
    door(g, x + 20, G - 70, 34, 66, o.door, o.number, { steps: false });
    sash(g, x + w - 66, G - 64, 48, 46, { panes: "two" });
    rect(g, x + w - 70, G - 14, 56, 9, "#7a6a53");
    circle(g, x + w - 58, G - 18, 6, C.leaf[0]);
    circle(g, x + w - 46, G - 20, 7, C.leaf[2]);
    circle(g, x + w - 32, G - 18, 6, C.leaf[1]);
    if (o.board) {
      agentBoard(ctx, g, x + w - 42, o.board, ctx.status);
    }
  }

  // A Georgian house: rusticated stucco ground floor, tall first-floor windows, parapet, area railings.
  function georgian(ctx, g, x, w, o) {
    var G = ctx.G;
    var gf = 88;
    var ff = 86;
    var sf = 64;
    var top = G - gf - ff - sf;
    var brick = brickFill(ctx, o.brick || "soot");
    rect(g, x, top - 18, w, G - top + 18, brick);
    rect(g, x, top - 18, 1.6, G - top + 18, "#000", { opacity: 0.12 });
    rect(g, x - 2, top - 22, w + 4, 5, C.stucco);
    chimney(g, x, top - 22, brick, 22);
    chimney(g, x + w, top - 22, brick, 22);
    rect(g, x, G - gf, w, gf, rusticFill(ctx));
    rect(g, x - 1, G - gf - 6, w + 2, 7, C.stucco);
    rect(g, x - 1, G - gf - ff - 2, w + 2, 3, C.stuccoShade);
    var cols = [x + w * 0.18, x + w * 0.5, x + w * 0.82];
    cols.forEach(function (cx) {
      sash(g, cx - 19, G - gf - ff + 6, 38, 74, { panes: "georgian", lintelFill: C.stuccoShade });
      rect(g, cx - 22, G - gf - ff + 70, 44, 2, C.iron);
      for (var i = 0; i < 8; i++) {
        rect(g, cx - 21 + i * 6, G - gf - ff + 70, 1.2, 12, C.iron);
      }
      sash(g, cx - 17, top + 10, 34, 46, { panes: "georgian", lintelFill: C.stuccoShade });
    });
    sash(g, cols[0] - 20, G - gf + 14, 40, 58, { panes: "georgian", lintel: false });
    sash(g, cols[1] - 20, G - gf + 14, 40, 58, { panes: "georgian", lintel: false });
    rect(g, cols[2] - 25, G - gf + 4, 50, gf - 4, C.stucco);
    door(g, cols[2] - 19, G - gf + 30, 38, 58, o.door, o.number, { surround: false, steps: false });
    // Steps over the area, and the area railings either side.
    rect(g, cols[2] - 27, G - 4, 54, 4, C.stuccoShade);
    railings(g, x + 2, cols[2] - 30, G - 26, G);
    railings(g, cols[2] + 30, x + w - 2, G - 26, G);
    rect(g, cols[2] - 30, G - 30, 3, 30, C.iron);
    rect(g, cols[2] + 27, G - 30, 3, 30, C.iron);
  }

  // A converted warehouse by the canal: steel windows, a loading bay up the middle, a painted name.
  function warehouse(ctx, g, o) {
    var G = ctx.G;
    var x = 26;
    var w = ctx.W - 52;
    var fh = 44;
    var floors = 5;
    var top = G - floors * fh;
    var colW = w / 7;
    rect(g, x, top - 30, w, G - top + 30, brickFill(ctx, "red"));
    rect(g, x - 3, top - 34, w + 6, 5, C.stuccoShade);
    text(g, x + w / 2, top - 10, o.sign || "", { "text-anchor": "middle", fill: "#f2e6cf", "font-size": 15, "font-weight": 700, "letter-spacing": 3, opacity: 0.85, "font-family": "Besley, Georgia, serif" });
    for (var f = 0; f < floors; f++) {
      var y = G - (f + 1) * fh;
      rect(g, x, y + fh - 3, w, 3, "#000", { opacity: 0.1 });
      for (var c = 0; c < 7; c++) {
        var wx = x + c * colW + 8;
        var ww = colW - 16;
        if (c === 3) {
          if (f === 0) {
            rect(g, wx - 4, y + 4, ww + 8, fh - 4, "#2c3a33");
            rect(g, wx - 8, y, ww + 16, 5, C.iron);
            continue;
          }
          rect(g, wx, y + 6, ww, fh - 10, "#3c4f45");
          rect(g, wx + ww / 2 - 0.8, y + 6, 1.6, fh - 10, "#2a3831");
          rect(g, wx - 3, y + fh - 14, ww + 6, 2, C.iron);
          for (var b = 0; b < 6; b++) {
            rect(g, wx - 2 + b * ((ww + 4) / 5), y + fh - 14, 1.2, 10, C.iron);
          }
          continue;
        }
        rect(g, wx - 2, y + 4, ww + 4, 4, "#8a4a36");
        rect(g, wx, y + 8, ww, fh - 16, "#2b2e2a");
        for (var py = 0; py < 3; py++) {
          for (var px = 0; px < 3; px++) {
            var pane = rect(g, wx + 2 + px * ((ww - 4) / 3), y + 10 + py * ((fh - 20) / 3), (ww - 4) / 3 - 1.6, (fh - 20) / 3 - 1.6, C.glass);
            if ((px + py + f) % 4 === 0) {
              pane.setAttribute("fill", C.glassShine);
            }
          }
        }
      }
    }
    // The hoist beam over the loading bay.
    rect(g, x + 3 * colW + colW / 2 - 3, top - 44, 6, 16, C.iron);
    rect(g, x + 3 * colW + colW / 2 - 3, top - 44, 34, 5, C.iron);
    path(g, "M" + (x + 3 * colW + colW / 2 + 28) + " " + (top - 39) + "v22", { stroke: C.iron, "stroke-width": 1.2, fill: "none" });
    ctx.cell = function (fl, col) {
      var y0 = G - (fl + 1) * fh;
      return { x: x + col * colW + 2, y: y0 + 2, w: colW * 2 - 4, h: fh - 4 };
    };
  }

  // A recent block of flats: light or dark brick, balconies, a set-back top floor.
  function modern(ctx, g, o) {
    var G = ctx.G;
    var x = 64;
    var w = ctx.W - 128;
    var fh = 34;
    var floors = 6;
    var top = G - floors * fh;
    var dark = o.brick === "dark";
    rect(g, x + 14, top - 26, w - 28, 28, "#8d949a");
    for (var i = 0; i < 9; i++) {
      rect(g, x + 22 + i * ((w - 44) / 9), top - 22, 2, 22, "#7b8288");
    }
    rect(g, x, top, w, G - top, brickFill(ctx, dark ? "dark" : "light"));
    rect(g, x - 3, top - 3, w + 6, 5, dark ? "#3e3b37" : C.stuccoShade);
    var colW = w / 4;
    for (var f = 0; f < floors; f++) {
      var y = G - (f + 1) * fh;
      for (var c = 0; c < 4; c++) {
        var wx = x + c * colW + 10;
        var ww = colW - 20;
        if (f === 0) {
          rect(g, wx - 4, y + 4, ww + 8, fh - 4, c === 1 ? "#2f363b" : C.glass);
          if (c === 1) {
            rect(g, wx + ww / 2 - 9, y + 8, 18, fh - 8, C.glassShine);
          }
          continue;
        }
        rect(g, wx, y + 4, ww, fh - 8, C.glass);
        rect(g, wx + ww * 0.62, y + 4, 1.6, fh - 8, dark ? "#55534d" : C.frame);
        if ((c + f) % 2 === 0) {
          rect(g, wx - 6, y + fh - 13, ww + 12, 11, "#d9e6e5", { opacity: 0.7 });
          rect(g, wx - 6, y + fh - 14, ww + 12, 1.6, C.iron);
          rect(g, wx - 6, y + fh - 3, ww + 12, 2.6, dark ? "#2d2b28" : "#a49a87");
        }
      }
    }
    ctx.cell = function (fl, col) {
      var y0 = G - (fl + 1) * fh;
      return { x: x + col * colW + 2, y: y0 + 1, w: colW - 4, h: fh - 2 };
    };
  }

  // A 1960s deck-access block: concrete walkways, front doors along the deck, a brick stair tower.
  function sixties(ctx, g, o) {
    var G = ctx.G;
    var x = 40;
    var w = ctx.W - 80;
    var fh = 48;
    var floors = 4;
    var top = G - floors * fh;
    var tower = 44;
    rect(g, x, top - 22, tower, G - top + 22, brickFill(ctx, "brown"));
    rect(g, x + tower / 2 - 4, top - 10, 8, G - top - 10, C.glassDark);
    rect(g, x + tower, top, w - tower, G - top, brickFill(ctx, "light"));
    rect(g, x + tower, top - 6, w - tower, 7, C.concrete);
    var unitW = (w - tower) / 5;
    var doors = ["#4f6a8a", "#9a4a3a", "#3f6b48", "#c39234", "#5a4a6d"];
    for (var f = 0; f < floors; f++) {
      var y = G - (f + 1) * fh;
      for (var u = 0; u < 5; u++) {
        var ux = x + tower + u * unitW;
        rect(g, ux + 6, y + 10, 14, f === 0 ? 34 : 28, f === 0 ? "#6b6b62" : doors[(u + f) % 5]);
        rect(g, ux + 24, y + 12, 14, 12, C.glass);
        rect(g, ux + 42, y + 10, unitW - 48, 22, C.glass);
        rect(g, ux + 42 + (unitW - 48) / 2 - 0.8, y + 10, 1.6, 22, C.frame);
      }
      if (f > 0) {
        rect(g, x + tower, y + fh - 10, w - tower, 10, C.concrete);
        rect(g, x + tower, y + fh - 2, w - tower, 2, C.concreteShade);
        rect(g, x + tower, y + 26, w - tower, 2, C.iron);
        for (var p = x + tower + 4; p < x + w - 2; p += 9) {
          rect(g, p, y + 26, 1.2, fh - 36, C.iron);
        }
      }
    }
    ctx.cell = function (fl, unit) {
      var y0 = G - (fl + 1) * fh;
      return { x: x + tower + unit * unitW + 1, y: y0 + 4, w: unitW - 2, h: fh - 8 };
    };
  }

  // A 1930s mansion block: brick with white bands, steel windows, a stair tower over the entrance.
  function mansion(ctx, g, o) {
    var G = ctx.G;
    var x = 56;
    var w = ctx.W - 112;
    var fh = 42;
    var floors = 5;
    var top = G - floors * fh;
    var brick = brickFill(ctx, o.brick || "red");
    rect(g, x, top, w, G - top, brick);
    rect(g, x - 3, top - 6, w + 6, 7, C.stucco);
    var towerX = x + w / 2 - 30;
    rect(g, towerX, top - 24, 60, G - top + 24, brick);
    rect(g, towerX - 3, top - 28, 66, 5, C.stucco);
    rect(g, towerX + 22, top - 14, 16, G - top - 24, C.glass);
    for (var s = 0; s < 9; s++) {
      rect(g, towerX + 22, top - 10 + s * 22, 16, 1.4, C.frame);
    }
    rect(g, towerX + 12, G - 44, 36, 44, "#2c2f2a");
    rect(g, towerX + 6, G - 50, 48, 6, C.stucco);
    var cols = [x + 18, x + 66, x + 114, towerX + 72, towerX + 120, towerX + 168];
    for (var f = 0; f < floors; f++) {
      var y = G - (f + 1) * fh;
      rect(g, x, y + fh - 8, towerX - x, 5, C.stucco);
      rect(g, towerX + 60, y + fh - 8, x + w - towerX - 60, 5, C.stucco);
      cols.forEach(function (cx, ci) {
        if (f === 0 && (ci === 2 || ci === 3)) {
          return;
        }
        rect(g, cx, y + 8, 36, fh - 18, C.frame);
        for (var py = 0; py < 2; py++) {
          for (var px = 0; px < 3; px++) {
            rect(g, cx + 2 + px * 11, y + 10 + py * ((fh - 22) / 2), 9.6, (fh - 22) / 2 - 1.4, py ? C.glassDark : C.glass);
          }
        }
        if (f > 0 && (ci === 0 || ci === 5)) {
          rect(g, cx - 4, y + fh - 14, 44, 2, C.iron);
          for (var b = 0; b < 9; b++) {
            rect(g, cx - 3 + b * 5, y + fh - 14, 1.2, 9, C.iron);
          }
        }
      });
    }
    ctx.cell = function (fl, col) {
      var y0 = G - (fl + 1) * fh;
      return { x: cols[col] - 6, y: y0 + 2, w: 48, h: fh - 6 };
    };
  }

  /* ---------- Marking the flat ---------- */

  function mark(ctx, g, box, label) {
    rect(g, box.x, box.y, box.w, box.h, C.markFill, { opacity: 0.35 });
    rect(g, box.x, box.y, box.w, box.h, "none", { stroke: C.mark, "stroke-width": 2.6, "stroke-dasharray": "7 4", rx: 3 });
    var tw = label.length * 6.3 + 20;
    var lx = Math.min(Math.max(box.x + box.w / 2 - tw / 2, 6), ctx.W - tw - 6);
    var ly = box.y - 30;
    if (ly < 6) {
      ly = box.y + box.h + 8;
    }
    var pill = node("g", {}, g);
    rect(pill, lx, ly, tw, 22, C.markFill, { rx: 11, stroke: C.mark, "stroke-width": 1.4 });
    text(pill, lx + tw / 2, ly + 15, label, { "text-anchor": "middle", fill: C.ink, "font-size": 11.5, "font-weight": 600, "font-family": "Onest, Arial, sans-serif" });
  }

  /* ---------- Public ---------- */

  function mute(ctx, g, x, w, sky) {
    rect(g, x, 0, w, ctx.G, C.sky[sky], { opacity: 0.58 });
  }

  // The illustration for one property. p is the property from data.js.
  function property(p, opts) {
    opts = opts || {};
    var a = p.art || {};
    var sky = C.sky[a.sky] ? a.sky : "cream";
    var ctx = { W: 480, H: 320, G: 282, fills: {}, id: "art" + ++uid, status: p.status };
    var svg = node("svg", { viewBox: "0 0 480 320", role: "img", class: "art", preserveAspectRatio: "xMidYMid slice" });
    svg.setAttribute("aria-label", opts.label || "Illustration of " + p.title.toLowerCase() + ", " + p.street);
    ctx.defs = node("defs", {}, svg);
    var g = node("g", {}, svg);
    var water = a.kind === "warehouse" || (a.kind === "modern");

    backdrop(ctx, g, sky, { wharfX: a.kind === "georgian" ? 380 : a.kind === "cottage" ? 300 : 360, wharfTop: a.kind === "georgian" ? 18 : 44 });

    if (a.kind === "terrace") {
      var hw = 172;
      var hx = (480 - hw) / 2;
      terrace(ctx, g, hx - hw, hw, { bay: a.bay, brick: a.brick, door: "black", number: String(+a.number - 2), mirror: false });
      terrace(ctx, g, hx + hw, hw, { bay: a.bay, brick: a.brick, door: a.door === "teal" ? "olive" : "teal", number: String(+a.number + 2) });
      mute(ctx, g, 0, hx, sky);
      mute(ctx, g, hx + hw, 480 - hx - hw, sky);
      var t = terrace(ctx, g, hx, hw, a);
      if (a.highlight === "upper") {
        mark(ctx, g, { x: hx + 6, y: t.top - (a.dormer ? 34 : 6), w: hw - 12, h: t.ff + t.sf + (a.dormer ? 34 : 6) + 4 }, "This maisonette");
      } else if (a.highlight === "ground") {
        mark(ctx, g, { x: hx + 6, y: ctx.G - t.gf + 2, w: hw - 12, h: t.gf - 4 }, "This flat");
      }
    } else if (a.kind === "cottage") {
      var cw = 156;
      var cx = (480 - cw) / 2;
      cottage(ctx, g, cx - cw, cw, { brick: "sage", door: "navy", number: String(+a.number - 2) });
      cottage(ctx, g, cx + cw, cw, { brick: "rose", door: "olive", number: String(+a.number + 2) });
      mute(ctx, g, 0, cx, sky);
      mute(ctx, g, cx + cw, 480 - cx - cw, sky);
      cottage(ctx, g, cx, cw, a);
    } else if (a.kind === "georgian") {
      var gw = 204;
      var gx = (480 - gw) / 2;
      georgian(ctx, g, gx - gw, gw, { door: "navy", number: String(+a.number - 1) });
      georgian(ctx, g, gx + gw, gw, { door: "black", number: String(+a.number + 1) });
      mute(ctx, g, 0, gx, sky);
      mute(ctx, g, gx + gw, 480 - gx - gw, sky);
      georgian(ctx, g, gx, gw, a);
    } else if (a.kind === "warehouse") {
      warehouse(ctx, g, a);
    } else if (a.kind === "modern") {
      modern(ctx, g, a);
    } else if (a.kind === "sixties") {
      sixties(ctx, g, a);
    } else if (a.kind === "mansion") {
      mansion(ctx, g, a);
    }

    if (ctx.cell && a.highlight) {
      mark(ctx, g, ctx.cell(a.highlight[0], a.highlight[1]), p.beds === 0 ? "This studio" : "This flat");
    }

    if (a.tree === "left" || a.tree === "both") {
      tree(ctx, g, 34, water ? 0.9 : 1);
    }
    if (a.tree === "right" || a.tree === "both") {
      tree(ctx, g, 446, water ? 0.9 : 1);
    }
    ground(ctx, g, { water: water });
    if (a.kind === "warehouse") {
      narrowboat(ctx, g, 250);
    }
    return svg;
  }

  // The home page's street: Cordwain Street, with the office at number 41 in the middle.
  function street() {
    var ctx = { W: 1600, H: 400, G: 352, fills: {}, id: "street" + ++uid, status: "" };
    var svg = node("svg", { viewBox: "0 0 1600 400", class: "street-art", preserveAspectRatio: "xMidYMax slice", "aria-hidden": "true" });
    ctx.defs = node("defs", {}, svg);
    var g = node("g", {}, svg);
    backdrop(ctx, g, "pink", { sunX: 300, sunY: 120, wharfX: 1150, wharfTop: 96 });

    ctx.status = "";
    terrace(ctx, g, -60, 172, { bay: true, brick: "red", door: "ochre", number: "33" });
    terrace(ctx, g, 112, 172, { bay: true, brick: "stock", door: "pink", number: "35", board: "sale" });
    terrace(ctx, g, 284, 172, { storeys: 3, brick: "stock", door: "olive", number: "37", mirror: true });
    ctx.status = "let-agreed";
    terrace(ctx, g, 456, 172, { bay: true, dormer: true, brick: "stock", door: "navy", number: "39", board: "let" });
    ctx.status = "";
    office(ctx, g, 628, 236);
    terrace(ctx, g, 864, 172, { bay: true, brick: "red", door: "black", number: "43", mirror: true });
    cottage(ctx, g, 1036, 156, { brick: "sage", door: "pink", number: "45" });
    ctx.status = "sold-stc";
    cottage(ctx, g, 1192, 156, { brick: "painted", door: "olive", number: "47", board: "sale" });
    ctx.status = "";
    terrace(ctx, g, 1348, 172, { bay: true, brick: "stock", door: "oxblood", number: "49" });
    terrace(ctx, g, 1520, 172, { bay: true, brick: "stock", door: "teal", number: "51", mirror: true });

    tree(ctx, g, 452, 1.12);
    tree(ctx, g, 1530, 1.05);
    lamp(ctx, g, 270);
    lamp(ctx, g, 1030);
    ground(ctx, g, {});
    return svg;
  }

  // The agency's own office: a corner shop with the name on the fascia and particulars in the window.
  function office(ctx, g, x, w) {
    var G = ctx.G;
    var gf = 112;
    var ff = 80;
    var sf = 70;
    var top = G - gf - ff - sf;
    var brick = brickFill(ctx, "red");
    rect(g, x, top - 22, w, G - top + 22, brick);
    rect(g, x - 3, top - 26, w + 6, 6, C.stucco);
    rect(g, x - 2, top, w + 4, 4, C.stuccoShade);
    chimney(g, x + 8, top - 26, brick, 22);
    chimney(g, x + w - 8, top - 26, brick, 22);
    [0.2, 0.5, 0.8].forEach(function (f) {
      sash(g, x + w * f - 20, G - gf - ff + 12, 40, 58, { panes: "two" });
      sash(g, x + w * f - 18, top + 14, 36, 44, {});
    });
    // Shopfront.
    rect(g, x, G - gf, w, gf, C.brand);
    rect(g, x - 4, G - gf - 6, w + 8, 8, C.stucco);
    rect(g, x + 10, G - gf + 4, w - 20, 24, "#2a2321");
    text(g, x + w / 2, G - gf + 21, "TRANSOM & CO", { "text-anchor": "middle", fill: C.plaster, "font-size": 14, "font-weight": 600, "letter-spacing": 2.4, "font-family": "Besley, Georgia, serif" });
    rect(g, x, G - gf, 8, gf, C.stucco);
    rect(g, x + w - 8, G - gf, 8, gf, C.stucco);
    var winX = x + 16;
    var winW = w - 84;
    rect(g, winX, G - 74, winW, 62, C.glass);
    for (var r = 0; r < 2; r++) {
      for (var c = 0; c < 4; c++) {
        var px = winX + 8 + c * ((winW - 16) / 4);
        var py = G - 67 + r * 27;
        rect(g, px, py, (winW - 16) / 4 - 6, 21, C.board);
        poly(g, [[px + 5, py + 13], [px + 11, py + 7], [px + 17, py + 13]], ["#d48f7c", "#535e34", "#c39234", "#8aa184"][(r + c) % 4]);
        rect(g, px + 6, py + 13, 10, 5, ["#d48f7c", "#535e34", "#c39234", "#8aa184"][(r + c) % 4]);
        rect(g, px + 20, py + 7, (winW - 16) / 4 - 32, 2, "#9a9a8c");
        rect(g, px + 20, py + 12, (winW - 16) / 4 - 38, 2, "#c4c0b2");
      }
    }
    rect(g, winX, G - 12, winW, 12, "#2a2321");
    door(g, x + w - 56, G - 62, 36, 58, "pink", "41", { surround: false, steps: false });
  }

  // The office on its own, for the contact section.
  function officeScene() {
    var ctx = { W: 480, H: 380, G: 340, fills: {}, id: "office" + ++uid, status: "" };
    var svg = node("svg", { viewBox: "0 0 480 380", role: "img", class: "art", preserveAspectRatio: "xMidYMid slice" });
    svg.setAttribute("aria-label", "Illustration of the Transom and Co office, a shopfront with the name over the window, at 41 Cordwain Street");
    ctx.defs = node("defs", {}, svg);
    var g = node("g", {}, svg);
    backdrop(ctx, g, "cream", { sunX: 70, sunY: 70, wharfX: 400, wharfTop: 70 });
    terrace(ctx, g, -46, 172, { bay: true, brick: "stock", door: "navy", number: "39", mirror: true });
    terrace(ctx, g, 354, 172, { bay: true, brick: "red", door: "black", number: "43" });
    mute(ctx, g, 0, 126, "cream");
    mute(ctx, g, 354, 126, "cream");
    office(ctx, g, 126, 228);
    lamp(ctx, g, 112);
    tree(ctx, g, 430, 0.95);
    ground(ctx, g, {});
    return svg;
  }

  window.TransomArt = { property: property, street: street, officeScene: officeScene };
})();
