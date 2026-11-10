/* Areas: the postcode checkers (hero card and Areas section), the travel bands, the map of the patch and
   the list of districts. Everything comes from data.js. A checked district is remembered on this device
   so the call bar can show its arrival time. */
(function () {
  var D = window.Nightjar;
  var C = window.NightjarCore;
  var SVG = "http://www.w3.org/2000/svg";

  var forms = document.querySelectorAll("[data-area-form]");
  if (!forms.length) {
    return;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== undefined) {
      node.textContent = text;
    }
    return node;
  }

  function svg(tag, attrs, text) {
    var node = document.createElementNS(SVG, tag);
    Object.keys(attrs || {}).forEach(function (k) {
      node.setAttribute(k, attrs[k]);
    });
    if (text !== undefined) {
      node.textContent = text;
    }
    return node;
  }

  function travelText(band) {
    return band.travel ? "+" + C.money(band.travel) : "No charge";
  }

  function minutes(range) {
    return range[0] + " to " + range[1] + " min";
  }

  /* ---------- Results ---------- */

  // The short result in the hero card: one sentence.
  function shortResult(out, outcome) {
    out.textContent = "";
    if (outcome.error) {
      out.appendChild(el("span", "is-bad", outcome.error));
      return;
    }
    var a = outcome.area;
    if (!a) {
      out.appendChild(el("strong", "", "We don't cover " + outcome.code + "."));
      out.appendChild(document.createTextNode(" It's too far for us to reach you quickly. Please call a locksmith closer to you."));
      return;
    }
    var rate = C.rateAt();
    out.appendChild(el("strong", "", a.code + ", " + a.places + ": "));
    out.appendChild(document.createTextNode("usually " + C.arrivalText(C.arrival(a.bandKey, rate)) + " right now. " + a.band.name + ", " + (a.band.travel ? C.money(a.band.travel) + " travel charge." : "no travel charge.")));
  }

  // The full result in the Areas section: arrival, travel and today's lock-out price.
  function detailResult(out, outcome) {
    out.textContent = "";
    out.classList.remove("is-covered", "is-outside");
    if (outcome.error) {
      out.appendChild(el("p", "is-bad", outcome.error));
      return;
    }
    var a = outcome.area;
    if (!a) {
      out.classList.add("is-outside");
      var head = el("div", "result-head");
      head.appendChild(el("span", "result-code", outcome.code));
      head.appendChild(el("span", "result-places", "Outside our area"));
      out.appendChild(head);
      out.appendChild(el("p", "", "We'd rather tell you now than keep you waiting: it's too far for us to reach you quickly at a fair price. Look for a locksmith close to you, ask for a total price on the phone, and check them against our list of warning signs."));
      var actions = el("div", "result-actions");
      var guide = el("a", "btn btn-outline btn-sm", "What to check before you agree");
      guide.href = "locked-out.html#checks";
      actions.appendChild(guide);
      out.appendChild(actions);
      return;
    }
    out.classList.add("is-covered");
    var rate = C.rateAt();
    var head2 = el("div", "result-head");
    head2.appendChild(el("span", "result-code", a.code));
    head2.appendChild(el("span", "result-places", a.places));
    out.appendChild(head2);

    var grid = el("dl", "result-grid");
    [
      ["Arrival right now", minutes(C.arrival(a.bandKey, rate))],
      ["Travel (" + a.band.name.toLowerCase() + ")", travelText(a.band)],
      ["Lock-out entry now", C.money(C.quote("lockout", rate, 1, a.bandKey).total)]
    ].forEach(function (row) {
      var box = el("div");
      box.appendChild(el("dt", "", row[0]));
      box.appendChild(el("dd", "", row[1]));
      grid.appendChild(box);
    });
    out.appendChild(grid);

    var other = rate === "night" ? "day" : "night";
    out.appendChild(el("p", "result-note", D.rates[rate].long + " now. " + (other === "night" ? "At night (10pm to 7am), allow " : "In the day, it's usually ") + minutes(C.arrival(a.bandKey, other)) + ". On the phone we give you a real time, not a guess."));

    var actions2 = el("div", "result-actions");
    var call = el("a", "btn btn-go btn-sm");
    call.href = "tel:" + D.phoneLink;
    call.setAttribute("data-contact", "phone");
    call.innerHTML = '<svg class="icon"><use href="#i-phone"/></svg>';
    call.appendChild(document.createTextNode(" Call " + D.phone));
    var quote = el("a", "btn btn-outline btn-sm", "Book non-urgent work");
    quote.href = "prices.html?area=" + encodeURIComponent(a.code) + "#quote";
    actions2.append(call, quote);
    out.appendChild(actions2);
  }

  function check(value) {
    var parsed = C.parsePostcode(value);
    if (parsed.error === "empty") {
      return { error: "Type your postcode first, for example RM11." };
    }
    if (parsed.error) {
      return { error: "That doesn't look like a postcode. Try the first part, like RM11 or IG1." };
    }
    return { code: parsed.outward, area: C.area(parsed.outward) };
  }

  function run(form, value, opts) {
    opts = opts || {};
    var input = form.querySelector("input[name=postcode]");
    var out = form.querySelector("[data-area-result]");
    var outcome = check(value);
    if (outcome.error) {
      input.setAttribute("aria-invalid", "true");
    } else {
      input.removeAttribute("aria-invalid");
    }
    if (out.hasAttribute("data-area-detail")) {
      detailResult(out, outcome);
    } else {
      shortResult(out, outcome);
    }
    if (outcome.area && !opts.quiet) {
      C.saveArea(outcome.area.code);
    }
    markPicked(outcome.area ? outcome.area.code : "");
    return outcome;
  }

  forms.forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      run(form, form.querySelector("input[name=postcode]").value);
    });
  });

  /* ---------- Bands ---------- */

  function renderBands() {
    var box = document.querySelector("[data-bands]");
    if (!box) {
      return;
    }
    box.textContent = "";
    Object.keys(D.bands).forEach(function (k) {
      var b = D.bands[k];
      var row = el("div", "band-row band-" + k.toLowerCase());
      var key = el("span", "band-key", k);
      key.setAttribute("aria-hidden", "true");
      var name = el("div", "band-name", b.name);
      name.appendChild(el("small", "", "Usually " + minutes(b.arrive.day) + " in the day, " + minutes(b.arrive.night) + " at night"));
      row.append(key, name, el("span", "band-travel", b.travel ? "+" + C.money(b.travel) + " travel" : "No travel charge"));
      box.appendChild(row);
    });
  }

  /* ---------- Map ---------- */

  // Kilometres east and north of the shop, to SVG units (north at the top).
  var KM = 30;
  var X0 = 12;
  var Y0 = 7.5;
  function px(at) {
    return [(at[0] + X0) * KM, (Y0 - at[1]) * KM];
  }

  // Labels sit to the right of their dot, except where they would run into a neighbour.
  var PLACE = { RM7: "below", CM13: "below" };

  function renderMap() {
    var box = document.querySelector("[data-map]");
    if (!box) {
      return;
    }
    var map = svg("svg", { viewBox: "0 0 630 450", role: "img", "aria-labelledby": "map-title" });
    map.appendChild(svg("title", { id: "map-title" }, "Map of the postcode districts we cover around our shop in Hornchurch, coloured by travel band. The same districts are listed below the map."));

    var shop = px([0, 0]);
    map.appendChild(svg("path", { class: "map-thames", d: "M0 423C40 416 70 410 110 407S200 398 230 418 300 452 330 466" }));
    map.appendChild(svg("text", { class: "map-small", x: 96, y: 436 }, "River Thames"));
    map.appendChild(svg("circle", { class: "map-ring map-ring-a", cx: shop[0], cy: shop[1], r: 3.6 * KM }));
    [5, 10].forEach(function (km) {
      map.appendChild(svg("circle", { class: "map-ring " + (km === 5 ? "map-ring-b" : "map-ring-c"), cx: shop[0], cy: shop[1], r: km * KM }));
    });
    var ang = -58 * Math.PI / 180;
    map.appendChild(svg("text", { class: "map-ring-label", x: shop[0] + 5 * KM * Math.cos(ang) + 6, y: shop[1] - 5 * KM * Math.sin(ang) + 4 }, "5 KM"));
    ang = -36 * Math.PI / 180;
    map.appendChild(svg("text", { class: "map-ring-label", x: shop[0] + 10 * KM * Math.cos(ang) - 34, y: shop[1] - 10 * KM * Math.sin(ang) - 6 }, "10 KM"));

    Object.keys(D.districts).forEach(function (code) {
      var d = D.districts[code];
      var p = px(d.at);
      var g = svg("g", { class: "map-district", "data-map-code": code });
      g.appendChild(svg("circle", { class: "map-dot map-dot-" + d.band.toLowerCase(), cx: p[0], cy: p[1], r: 6 }));
      var place = PLACE[code];
      var at = place === "below" ? { x: p[0], y: p[1] + 21, "text-anchor": "middle" } : place === "left" ? { x: p[0] - 10, y: p[1] + 4.5, "text-anchor": "end" } : { x: p[0] + 10, y: p[1] + 4.5, "text-anchor": "start" };
      at.class = "map-label";
      g.appendChild(svg("text", at, code));
      map.appendChild(g);
    });

    // The shop: a keyhole.
    var s = svg("g", { class: "map-shop-mark" });
    s.appendChild(svg("circle", { class: "map-shop", cx: shop[0], cy: shop[1], r: 12 }));
    s.appendChild(svg("path", { class: "map-shop-hole", d: "M" + shop[0] + " " + (shop[1] - 6) + "a3.5 3.5 0 0 0-1.7 6.6L" + (shop[0] - 2.6) + " " + (shop[1] + 6) + "h5.2l-0.9-5.4A3.5 3.5 0 0 0 " + shop[0] + " " + (shop[1] - 6) + "Z" }));
    map.appendChild(s);
    map.appendChild(svg("text", { class: "map-shop-label", x: shop[0] - 17, y: shop[1] + 5, "text-anchor": "end" }, "Our shop"));

    // North arrow and scale.
    map.appendChild(svg("path", { class: "map-scale", d: "M22 46V18M14 28l8-10 8 10", fill: "none" }));
    map.appendChild(svg("text", { class: "map-small", x: 16, y: 62 }, "N"));
    map.appendChild(svg("path", { class: "map-scale", d: "M548 430h60M548 425v10M608 425v10", fill: "none" }));
    map.appendChild(svg("text", { class: "map-small", x: 562, y: 419 }, "2 km"));

    box.textContent = "";
    box.appendChild(map);
  }

  /* ---------- District list ---------- */

  function renderLists() {
    var box = document.querySelector("[data-district-lists]");
    if (!box) {
      return;
    }
    var detailForm = document.querySelector("[data-area-detail]");
    detailForm = detailForm ? detailForm.closest("form") : null;
    Object.keys(D.bands).forEach(function (k) {
      var group = el("div", "district-group");
      var h = el("h3");
      var dot = el("i", "band-dot-" + k.toLowerCase());
      dot.setAttribute("aria-hidden", "true");
      h.append(dot, document.createTextNode(D.bands[k].name + (D.bands[k].travel ? ", +" + C.money(D.bands[k].travel) + " travel" : ", no travel charge")));
      group.appendChild(h);
      var list = el("ul", "district-chips");
      Object.keys(D.districts).forEach(function (code) {
        var d = D.districts[code];
        if (d.band !== k) {
          return;
        }
        var li = el("li");
        var b = el("button", "chip");
        b.type = "button";
        b.setAttribute("data-code", code);
        b.setAttribute("aria-pressed", "false");
        b.appendChild(el("b", "", code));
        b.appendChild(document.createTextNode(" " + d.places));
        b.addEventListener("click", function () {
          if (!detailForm) {
            return;
          }
          detailForm.querySelector("input[name=postcode]").value = code;
          run(detailForm, code);
          var result = detailForm.querySelector("[data-area-result]");
          if (window.matchMedia("(max-width: 1020px)").matches) {
            result.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
          }
        });
        li.appendChild(b);
        list.appendChild(li);
      });
      group.appendChild(list);
      box.appendChild(group);
    });
  }

  function markPicked(code) {
    document.querySelectorAll("[data-code]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-code") === code));
    });
    document.querySelectorAll("[data-map-code]").forEach(function (g) {
      g.classList.toggle("is-picked", g.getAttribute("data-map-code") === code);
    });
  }

  renderBands();
  renderMap();
  renderLists();

  // A district checked before (on this device) is filled in again.
  var saved = C.savedArea();
  if (saved) {
    forms.forEach(function (form) {
      form.querySelector("input[name=postcode]").value = saved;
      run(form, saved, { quiet: true });
    });
  }
})();
