/* The postcode district checker (home page and Areas page): is a district in our home patch, across
   London, outer London, or a longer move? Works from the district list in postcodes.js. */
(function () {
  var D = window.HT;
  var E = window.HTEstimate;
  var S = window.HTSite;

  function milesText(m) {
    if (m < 0.5) {
      return "under half a mile";
    }
    return (m < 10 ? Math.round(m * 10) / 10 : Math.round(m)) + (m === 1 ? " mile" : " miles");
  }

  // Fills box with what we'd charge to come to this district. Returns the ring id, or "" if unknown.
  function describe(box, value) {
    box.textContent = "";
    var raw = String(value || "").trim();
    var card = S.el("div", "result-card");
    if (!raw) {
      card.classList.add("is-unknown");
      card.appendChild(S.el("p", "", "Type the first part of a postcode, like N4 or SE15."));
      box.appendChild(card);
      return "";
    }
    var place = E.lookup(raw);
    if (!place) {
      card.classList.add("is-unknown");
      card.appendChild(S.el("h4", "", "We couldn't find “" + raw.toUpperCase().slice(0, 12) + "”"));
      card.appendChild(S.el("p", "", "Check it's the first part of a UK postcode, like N4, SE15 or BN1. Or message us the full address and we'll tell you."));
      box.appendChild(card);
      return "";
    }
    var r = E.ringFor(place);
    var ring = r.ring;
    if (ring.id === "far") {
      card.classList.add("is-far");
    }
    var dot = S.el("span", "result-dot");
    dot.appendChild(S.icon(ring.id === "far" ? "i-route" : "i-pin"));
    card.appendChild(dot);
    var titles = {
      home: place.code + " is in our home patch",
      london: place.code + ": yes, across London",
      outer: place.code + ": yes, outer London",
      far: place.code + ": yes, as a longer move"
    };
    card.appendChild(S.el("h4", "", titles[ring.id]));
    var distance = place.code === D.base ? "That's where our yard is." : "About " + milesText(r.miles) + " from our yard as the crow flies" + (r.miles >= 2 ? ", or roughly " + milesText(Math.round(E.roadMiles(r.miles))) + " by road" : "") + ".";
    if (place.how === "area") {
      distance = "We go by the middle of the " + place.area + " postcode area, so this is rough: about " + milesText(r.miles) + " from our yard as the crow flies.";
    }
    card.appendChild(S.el("p", "", distance + " " + ring.blurb));
    var link = S.el("a", "text-link", "Get an estimate from " + place.code + " ");
    link.href = "quote.html?from=" + encodeURIComponent(place.code);
    link.appendChild(S.icon("i-arrow"));
    var p = S.el("p");
    p.appendChild(link);
    card.appendChild(p);
    box.appendChild(card);
    return ring.id;
  }

  /* ---------- The dot map ---------- */

  // Every postcode district near London as a dot, in miles east and south of our yard (National Grid
  // positions from postcodes.js), coloured by the travel ring it falls in. Not a map of roads.
  var NS = "http://www.w3.org/2000/svg";
  var VIEW = { x: -19, y: -14, w: 38, h: 28 };
  var P = window.HTPostcodes;

  function svgEl(tag, attrs, cls) {
    var node = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) {
      node.setAttribute(k, attrs[k]);
    });
    if (cls) {
      node.setAttribute("class", cls);
    }
    return node;
  }

  // Miles east and south of the yard, then a gentle fish-eye so crowded central London spreads out.
  function fish(miles) {
    return miles > 0 ? 17 * Math.pow(miles / 17, 0.62) : 0;
  }

  function project(place) {
    var b = E.base();
    var x = (place.e - b.e) / 1.609344;
    var y = -(place.n - b.n) / 1.609344;
    var r = Math.sqrt(x * x + y * y);
    var f = r ? fish(r) / r : 1;
    return { x: x * f, y: y * f };
  }

  function drawMap(svg) {
    svg.setAttribute("viewBox", [VIEW.x, VIEW.y, VIEW.w, VIEW.h].join(" "));
    svg.textContent = "";
    var title = svgEl("title");
    title.textContent = "Postcode districts around our yard in " + D.base + ", shaded by travel fee";
    svg.appendChild(title);
    var rings = svgEl("g", {}, "dm-rings");
    D.rings.forEach(function (r) {
      if (r.upTo === Infinity) {
        return;
      }
      var rr = fish(r.upTo);
      rings.appendChild(svgEl("circle", { cx: 0, cy: 0, r: rr.toFixed(2) }, "dm-ring dm-ring-" + r.id));
      var a = Math.PI / 4;
      var label = svgEl("text", { x: (rr * Math.cos(a) + 0.4).toFixed(2), y: (-rr * Math.sin(a) - 0.3).toFixed(2) }, "dm-ring-label");
      label.textContent = String(r.upTo).replace(".5", "\u00bd") + " mi";
      rings.appendChild(label);
    });
    svg.appendChild(rings);
    var dots = svgEl("g", {}, "dm-dots");
    // Central London's split districts (EC1A, EC1M ...) become one dot each (EC1), or they pile up.
    var points = {};
    Object.keys(P.districts).forEach(function (code) {
      var key = code.replace(/^([A-Z]+\d+)[A-Z]$/, "$1");
      var d = P.districts[code];
      var pt = points[key] || (points[key] = [0, 0, 0]);
      pt[0] += d[0];
      pt[1] += d[1];
      pt[2] += 1;
    });
    Object.keys(points).forEach(function (code) {
      var d = { e: points[code][0] / points[code][2], n: points[code][1] / points[code][2] };
      var pt = project(d);
      if (pt.x < VIEW.x || pt.x > VIEW.x + VIEW.w || pt.y < VIEW.y || pt.y > VIEW.y + VIEW.h) {
        return;
      }
      var ring = E.ringFor(d).ring.id;
      dots.appendChild(svgEl("circle", { cx: pt.x.toFixed(2), cy: pt.y.toFixed(2), r: 0.34 }, "dm-dot dm-" + ring));
    });
    svg.appendChild(dots);
    svg.appendChild(svgEl("g", {}, "dm-route"));
    var yard = svgEl("g", {}, "dm-yard");
    yard.appendChild(svgEl("circle", { cx: 0, cy: 0, r: 1.05 }));
    var yl = svgEl("text", { x: 0, y: 2.75 }, "dm-yard-label");
    yl.textContent = D.base;
    yard.appendChild(yl);
    svg.appendChild(yard);
    var north = svgEl("text", { x: VIEW.x + 1, y: VIEW.y + 1.9 }, "dm-north");
    north.textContent = "N \u2191";
    svg.appendChild(north);
  }

  // A dashed route from the yard to the district, or an arrow off the edge for longer moves.
  function showRoute(svg, place) {
    var g = svg.querySelector(".dm-route");
    if (!g) {
      return;
    }
    g.textContent = "";
    if (!place) {
      return;
    }
    var pt = project(place);
    var inside = pt.x > VIEW.x + 1 && pt.x < VIEW.x + VIEW.w - 1 && pt.y > VIEW.y + 1 && pt.y < VIEW.y + VIEW.h - 1;
    var end = pt;
    if (!inside) {
      // Pull the end back to the edge of the picture, along the same direction.
      var t = Math.min((VIEW.w / 2 - 1.5) / Math.abs(pt.x || 1e-6), (VIEW.h / 2 - 1.5) / Math.abs(pt.y || 1e-6));
      end = { x: pt.x * t, y: pt.y * t };
    }
    var mx = end.x / 2;
    var my = end.y / 2;
    var cx = mx - end.y * 0.18;
    var cy = my + end.x * 0.18;
    var d = "M0 0Q" + cx.toFixed(2) + " " + cy.toFixed(2) + " " + end.x.toFixed(2) + " " + end.y.toFixed(2);
    g.appendChild(svgEl("path", { d: d }, "dm-path"));
    g.appendChild(svgEl("circle", { cx: end.x.toFixed(2), cy: end.y.toFixed(2), r: inside ? 0.95 : 0.75 }, "dm-target" + (inside ? "" : " is-off")));
    var right = end.x < VIEW.x + VIEW.w - 8;
    var label = svgEl("text", { x: (end.x + (right ? 1.5 : -1.5)).toFixed(2), y: (end.y + 0.45).toFixed(2), "text-anchor": right ? "start" : "end" }, "dm-target-label");
    label.textContent = place.code + (inside ? "" : ", " + Math.round(E.straightMiles(E.base(), place)) + " mi");
    g.appendChild(label);
  }

  document.querySelectorAll("[data-checker]").forEach(function (form) {
    var input = form.querySelector("input");
    var box = form.querySelector("[data-checker-result]");
    var scope = form.closest("[data-checker-scope]") || document;
    var map = scope.querySelector("[data-dotmap]");
    if (map) {
      drawMap(map);
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      describe(box, input.value);
      if (map) {
        showRoute(map, E.lookup(input.value));
      }
    });
  });

  window.HTChecker = { describe: describe, drawMap: drawMap, showRoute: showRoute };
})();
