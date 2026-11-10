/* Home page: the menu (prices from data.js), the team with their working days, and the gallery tiles. */
(function () {
  var D = window.SorrelSteel;
  var C = window.SorrelSteelCore;
  var el = C.el;

  /* ---------- The menu ---------- */

  function renderMenu() {
    var box = document.querySelector("[data-menu]");
    if (!box) {
      return;
    }
    var numerals = ["i.", "ii.", "iii.", "iv.", "v."];
    box.textContent = "";
    D.categories.forEach(function (cat, i) {
      var services = cat.highlights.map(C.service);
      var lows = services.map(function (s) {
        return C.priceRange(s)[0];
      });

      var card = el("article", "menu-card cat-" + cat.id);
      var top = el("div", "menu-card-top");
      top.appendChild(el("span", "menu-index", numerals[i]));
      var badge = el("span", "menu-icon");
      badge.appendChild(C.icon(cat.icon));
      top.appendChild(badge);
      card.appendChild(top);

      card.appendChild(el("h3", "", cat.name));
      card.appendChild(el("p", "menu-blurb", cat.blurb));

      var from = el("p", "menu-from");
      from.appendChild(el("span", "", "From"));
      from.appendChild(el("strong", "", C.money(Math.min.apply(null, lows))));
      card.appendChild(from);

      var list = el("ul", "menu-list");
      services.forEach(function (s) {
        var range = C.priceRange(s);
        var li = el("li");
        li.appendChild(el("span", "", s.name));
        li.appendChild(el("span", "ml-price", range[0] === range[1] ? C.money(range[0]) : "from " + C.money(range[0])));
        list.appendChild(li);
      });
      card.appendChild(list);

      var link = el("a", "link-arrow", cat.name + " prices ");
      link.href = "prices.html#" + cat.id;
      link.appendChild(C.icon("i-arrow", "icon-sm"));
      card.appendChild(link);
      box.appendChild(card);
    });
  }

  /* ---------- The team ---------- */

  function renderTeam() {
    var list = document.querySelector("[data-team]");
    if (!list) {
      return;
    }
    D.team.forEach(function (m) {
      var li = el("li", "member");
      li.appendChild(C.monogram(m));
      var body = el("div", "member-body");
      body.appendChild(el("h3", "member-name", m.name));
      body.appendChild(el("p", "member-role", m.role));
      var tags = el("ul", "member-tags");
      tags.setAttribute("aria-label", "Specialities");
      m.specialities.forEach(function (s) {
        tags.appendChild(el("li", "", s));
      });
      body.appendChild(tags);
      body.appendChild(el("p", "member-bio", m.bio));
      body.appendChild(C.weekStrip(m));
      var link = el("a", "link-arrow", "Book with " + m.name + " ");
      link.href = "book.html?with=" + m.id;
      link.appendChild(C.icon("i-arrow", "icon-sm"));
      body.appendChild(link);
      li.appendChild(body);
      list.appendChild(li);
    });
  }

  /* ---------- Gallery ---------- */

  // A small seeded random number generator, so each tile's pattern is the same on every visit.
  function random(seed) {
    return function () {
      seed |= 0;
      seed = seed + 0x6d2b79f5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function r1(n) {
    return Math.round(n * 10) / 10;
  }

  // A smooth path through points (Catmull-Rom as cubic Béziers).
  function smooth(points) {
    var d = "M" + r1(points[0][0]) + " " + r1(points[0][1]);
    for (var i = 0; i < points.length - 1; i++) {
      var p0 = points[i - 1] || points[i];
      var p1 = points[i];
      var p2 = points[i + 1];
      var p3 = points[i + 2] || p2;
      d += "C" + [
        p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6,
        p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6,
        p2[0], p2[1]
      ].map(r1).join(" ");
    }
    return d;
  }

  var MOTIFS = {
    // Long strands of hair with a soft wave.
    waves: function (w, h, rnd, add) {
      var n = 22;
      var phase = rnd() * 6;
      for (var i = 0; i < n; i++) {
        var x0 = -30 + i * (w + 60) / (n - 1);
        var pts = [];
        for (var y = -20; y <= h + 20; y += 30) {
          pts.push([x0 + 16 * Math.sin(y / 70 + phase + i * 0.22), y]);
        }
        add("path", { d: smooth(pts), "class": i % 3 === 0 ? "gb" : "ga", "stroke-width": r1(1.5 + rnd() * 2.6) });
      }
    },
    // A skin fade: short strokes, dense at the bottom and thinning out towards the top.
    fade: function (w, h, rnd, add) {
      var d = "";
      var rows = Math.ceil(h / 9);
      for (var r = 0; r < rows; r++) {
        var y = h - r * 9;
        var gap = 3.5 + r * r * 0.07;
        var len = Math.max(2, 8 - r * 0.12);
        if (gap > 60) {
          break;
        }
        for (var x = (r % 2) * gap / 2; x < w; x += gap) {
          d += "M" + r1(x + rnd() * 1.5) + " " + r1(y) + "v" + r1(-len);
        }
      }
      add("path", { d: d, "class": "ga", "stroke-width": 1.4 });
      add("path", { d: "M0 " + r1(h * 0.42) + "H" + w, "class": "gb", "stroke-width": 1 });
    },
    // Nested arches, like the line of a blunt bob from behind.
    bob: function (w, h, rnd, add) {
      var top = h * 0.32;
      for (var i = 0; i < 14; i++) {
        var inset = -20 + i * 12;
        var rad = w / 2 - inset;
        if (rad < 8) {
          break;
        }
        add("path", {
          d: "M" + inset + " " + (h + 10) + "V" + r1(top + i * 12) + "A" + rad + " " + rad + " 0 0 1 " + (w - inset) + " " + r1(top + i * 12) + "V" + (h + 10),
          "class": i % 4 === 3 ? "gb" : "ga",
          "stroke-width": i % 4 === 3 ? 3 : 1.4
        });
      }
    },
    // Coils: rows of small loops.
    curls: function (w, h, rnd, add) {
      for (var y = 10, row = 0; y < h + 20; y += 30, row++) {
        for (var x = (row % 2) * 15; x < w + 20; x += 30) {
          var r = 7 + rnd() * 7;
          var a = rnd() * Math.PI * 2;
          add("path", {
            d: "M" + r1(x + r * Math.cos(a)) + " " + r1(y + r * Math.sin(a)) + "A" + r1(r) + " " + r1(r) + " 0 1 1 " + r1(x + r * Math.cos(a + 0.6)) + " " + r1(y + r * Math.sin(a + 0.6)),
            "class": rnd() < 0.3 ? "gb" : "ga",
            "stroke-width": r1(1.4 + rnd() * 1.6)
          });
        }
      }
    },
    // A beard line-up: fine stubble strokes below one crisp razor line.
    lines: function (w, h, rnd, add) {
      var edge = function (x) {
        return h * 0.38 + Math.sin(x / w * Math.PI) * h * 0.16;
      };
      var d = "";
      for (var i = 0; i < 900; i++) {
        var x = rnd() * w;
        var y = edge(x) + 6 + rnd() * (h - edge(x));
        d += "M" + r1(x) + " " + r1(y) + "l" + r1(1 + rnd() * 2) + " " + r1(-4 - rnd() * 4);
      }
      add("path", { d: d, "class": "ga", "stroke-width": 1.3 });
      var pts = [];
      for (var x2 = -10; x2 <= w + 10; x2 += 20) {
        pts.push([x2, edge(x2)]);
      }
      add("path", { d: smooth(pts), "class": "gb", "stroke-width": 3 });
    },
    // A sleek blow-dry: long, smooth, nearly straight lines with a gentle sweep at the ends.
    sleek: function (w, h, rnd, add) {
      var n = 26;
      for (var i = 0; i < n; i++) {
        var x0 = -40 + i * (w + 60) / (n - 1);
        var pts = [];
        for (var t = 0; t <= 1.0001; t += 0.1) {
          var y = -20 + t * (h + 40);
          pts.push([x0 + Math.pow(t, 3) * 46 + Math.sin(t * 3 + i * 0.3) * 3, y]);
        }
        add("path", { d: smooth(pts), "class": i % 4 === 1 ? "gb" : "ga", "stroke-width": i % 4 === 1 ? 2.6 : 1.1 });
      }
    },
    // Hair up: a spiral, like a bun from above.
    swirl: function (w, h, rnd, add) {
      [["ga", 2, 0], ["gb", 1.2, Math.PI]].forEach(function (spec) {
        var pts = [];
        for (var t = 0; t < 34; t += 0.35) {
          var r = 3 + t * 6.2;
          pts.push([w / 2 + r * Math.cos(t + spec[2]), h / 2 + r * Math.sin(t + spec[2])]);
        }
        add("path", { d: smooth(pts), "class": spec[0], "stroke-width": spec[1] });
      });
    }
  };

  function tileArt(tile, index) {
    var NS = "http://www.w3.org/2000/svg";
    var w = 300;
    var h = tile.tall ? 620 : 300;
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "tile-art");
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    var draw = MOTIFS[tile.motif] || MOTIFS.waves;
    draw(w, h, random(index * 7919 + 17), function (tag, attrs) {
      var node = document.createElementNS(NS, tag);
      Object.keys(attrs).forEach(function (k) {
        node.setAttribute(k, attrs[k]);
      });
      svg.appendChild(node);
    });
    return svg;
  }

  function renderGallery() {
    var list = document.querySelector("[data-gallery]");
    if (!list) {
      return;
    }
    var count = document.querySelector("[data-gallery-count]");
    var buttons = document.querySelectorAll("[data-gallery-filters] [data-filter]");

    D.gallery.forEach(function (tile, i) {
      var li = el("li", "tile tile-" + tile.tone + (tile.tall ? " is-tall" : ""));
      li.setAttribute("data-cat", tile.cat);
      var fig = el("figure");
      fig.appendChild(tileArt(tile, i));
      var flag = el("span", "tile-flag");
      flag.appendChild(C.icon("i-camera", "icon-sm"));
      flag.appendChild(el("span", "tile-flag-long", "Salon photo goes here"));
      flag.appendChild(el("span", "tile-flag-short", "Photo goes here"));
      fig.appendChild(flag);
      var cap = el("figcaption");
      cap.appendChild(el("span", "tile-cat", C.category(tile.cat).name));
      cap.appendChild(el("strong", "", tile.title));
      cap.appendChild(el("span", "tile-detail", tile.detail));
      fig.appendChild(cap);
      li.appendChild(fig);
      list.appendChild(li);
    });

    function show(filter) {
      var shown = 0;
      list.querySelectorAll(".tile").forEach(function (li) {
        var on = filter === "all" || li.getAttribute("data-cat") === filter;
        li.hidden = !on;
        shown += on ? 1 : 0;
      });
      buttons.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === filter));
      });
      if (count) {
        count.textContent = filter === "all" ? D.gallery.length + " photo spaces" : "Showing " + shown + " of " + D.gallery.length;
      }
    }

    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        show(b.getAttribute("data-filter"));
      });
    });
    show("all");
  }

  renderMenu();
  renderTeam();
  renderGallery();
})();
