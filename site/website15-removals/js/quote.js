/* The quote calculator. Builds its choices from data.js, keeps the move in the address bar (so it can be
   shared, and handed to the booking page), and redraws the estimate on every change. */
(function () {
  var D = window.HT;
  var E = window.HTEstimate;
  var S = window.HTSite;

  var form = document.querySelector("[data-quote]");
  if (!form) {
    return;
  }
  var el = S.el;

  // The move from the address bar: a shared link, "Change" on the booking page, or the home page.
  var input = E.fromParams(S.params());

  /* ---------- Building the form from data.js ---------- */

  function radio(name, value, checked, id) {
    var r = el("input");
    r.type = "radio";
    r.name = name;
    r.value = value;
    r.id = id || name + "-" + value;
    r.checked = !!checked;
    return r;
  }

  function sizeHint(key) {
    var size = D.sizes[key];
    var lo = size.hours;
    var hi = size.hours * D.fullness.full.mult + 1;
    return D.vans[size.van].name.replace(" with tail lift", "") + ", " + size.crew + " movers, " + Math.round(lo) + " to " + Math.round(hi) + " hours";
  }

  var sizeBox = form.querySelector("[data-sizes]");
  D.sizeOrder.forEach(function (key) {
    var size = D.sizes[key];
    var r = radio("size", key, input.size === key);
    var label = el("label", "choice");
    label.htmlFor = r.id;
    label.appendChild(S.icon(key.indexOf("office") === 0 ? "i-desk" : key === "studio" || key === "bed1" ? "i-flat" : "i-house", "choice-icon"));
    var text = el("span", "choice-text");
    text.append(el("strong", "", size.name), el("small", "", sizeHint(key)));
    label.appendChild(text);
    sizeBox.append(r, label);
  });

  var fullBox = form.querySelector("[data-fullness]");
  Object.keys(D.fullness).forEach(function (key) {
    var r = radio("fullness", key, input.fullness === key);
    var label = el("label", "pill", D.fullness[key].name.split(":")[0]);
    label.htmlFor = r.id;
    var more = D.fullness[key].name.split(": ")[1];
    if (more) {
      label.appendChild(el("small", "", more));
    }
    fullBox.append(r, label);
  });

  function stepper(prefix, id, name, value, detail) {
    var row = el("div", "stepper-row");
    var label = el("label", "stepper-label", name);
    label.htmlFor = prefix + "-" + id;
    if (detail) {
      label.appendChild(el("small", "", detail));
    }
    var box = el("div", "stepper");
    var minus = el("button", "stepper-btn");
    minus.type = "button";
    minus.setAttribute("data-step", "-1");
    minus.setAttribute("aria-label", "One fewer: " + name);
    minus.appendChild(S.icon("i-minus"));
    var field = el("input", "stepper-input");
    field.type = "number";
    field.inputMode = "numeric";
    field.min = "0";
    field.max = "99";
    field.id = prefix + "-" + id;
    field.name = prefix + "-" + id;
    field.value = String(value || 0);
    field.setAttribute("data-key", id);
    var plus = el("button", "stepper-btn");
    plus.type = "button";
    plus.setAttribute("data-step", "1");
    plus.setAttribute("aria-label", "One more: " + name);
    plus.appendChild(S.icon("i-plus"));
    box.append(minus, field, plus);
    row.append(label, box);
    if (+value > 0) {
      row.classList.add("has-value");
    }
    return row;
  }

  var itemBox = form.querySelector("[data-items]");
  D.itemGroups.forEach(function (g, gi) {
    var group = el("details", "item-group");
    group.open = gi === 0 || g.items.some(function (it) {
      return input.items[it.id];
    });
    var summary = el("summary", "", g.name);
    summary.appendChild(el("span", "item-group-count"));
    group.appendChild(summary);
    var list = el("div", "stepper-list");
    g.items.forEach(function (it) {
      list.appendChild(stepper("item", it.id, it.name, input.items[it.id], it.heavy ? "Two-person lift" : ""));
    });
    group.appendChild(list);
    itemBox.appendChild(group);
  });

  var bandBox = form.querySelector("[data-bands]");
  D.bands.forEach(function (b, i) {
    var r = radio("band", b.id, input.band ? input.band === b.id : i === 1);
    var label = el("label", "pill", b.name);
    label.htmlFor = r.id;
    label.appendChild(el("small", "", b.detail));
    bandBox.append(r, label);
  });

  form.querySelectorAll("[data-floors]").forEach(function (sel) {
    var end = sel.name.indexOf("pickup") === 0 ? input.pickup : input.dropoff;
    D.floors.forEach(function (f) {
      var o = el("option", "", f.name);
      o.value = String(f.id);
      o.selected = f.id === end.floor;
      sel.appendChild(o);
    });
  });

  form.querySelectorAll("[data-parking]").forEach(function (sel) {
    var end = sel.name.indexOf("pickup") === 0 ? input.pickup : input.dropoff;
    D.parking.forEach(function (p) {
      var o = el("option", "", p.name);
      o.value = p.id;
      o.selected = p.id === end.parking;
      sel.appendChild(o);
    });
  });
  form.elements.pickupLift.checked = input.pickup.lift;
  form.elements.dropoffLift.checked = input.dropoff.lift;

  var dayBox = form.querySelector("[data-days]");
  [1, 2, 3, 4, 5, 6, 0, "any"].forEach(function (k) {
    var r = radio("day", String(k), String(input.day) === String(k));
    var label = el("label", "day-pill");
    label.htmlFor = r.id;
    if (k === "any") {
      label.append(el("span", "day-name", "Not sure"), el("small", "", "yet"));
    } else {
      var day = D.days[k];
      var name = el("span", "day-name");
      name.appendChild(el("span", "", day.name.slice(0, 3)));
      name.appendChild(el("span", "visually-hidden", day.name.slice(3)));
      var pct = Math.round((day.mult - 1) * 100);
      label.append(name, el("small", "", pct ? "+" + pct + "%" : "standard"));
      if (pct) {
        label.classList.add("is-premium");
      }
    }
    dayBox.append(r, label);
  });

  var packBox = form.querySelector("[data-packing]");
  Object.keys(D.packing).forEach(function (key) {
    var r = radio("packing", key, input.packing === key);
    var label = el("label", "pack-card");
    label.htmlFor = r.id;
    var top = el("span", "pack-top");
    top.append(el("strong", "", D.packing[key].name), el("span", "pack-price"));
    label.append(top, el("small", "", D.packing[key].blurb));
    packBox.append(r, label);
  });

  var disBox = form.querySelector("[data-dismantle]");
  D.dismantle.forEach(function (d) {
    disBox.appendChild(stepper("dis", d.id, d.name, input.dismantle[d.id], "£" + d.price + " each"));
  });
  var spBox = form.querySelector("[data-specials]");
  D.specials.forEach(function (sp) {
    spBox.appendChild(stepper("sp", sp.id, sp.name, input.specials[sp.id], "£" + sp.price + " each"));
  });

  form.elements.from.value = input.from;
  form.elements.to.value = input.to;
  form.elements.useBand.checked = input.distanceMode === "band";
  var modeRadio = form.querySelector('input[name="mode"][value="' + input.mode + '"]');
  if (modeRadio) {
    modeRadio.checked = true;
  }

  /* ---------- Reading the form ---------- */

  function value(name) {
    var checked = form.querySelector('input[name="' + name + '"]:checked');
    return checked ? checked.value : "";
  }

  function counts(prefix) {
    var out = {};
    form.querySelectorAll('input[name^="' + prefix + '-"]').forEach(function (f) {
      var n = Math.max(0, Math.min(99, Math.floor(+f.value || 0)));
      if (n) {
        out[f.getAttribute("data-key")] = n;
      }
    });
    return out;
  }

  function read() {
    return {
      mode: value("mode") || "rooms",
      size: value("size") || "bed1",
      fullness: value("fullness") || "average",
      items: counts("item"),
      from: form.elements.from.value.trim(),
      to: form.elements.to.value.trim(),
      distanceMode: form.elements.useBand.checked ? "band" : "postcodes",
      band: value("band"),
      pickup: { floor: +form.elements.pickupFloor.value, lift: form.elements.pickupLift.checked, parking: form.elements.pickupParking.value },
      dropoff: { floor: +form.elements.dropoffFloor.value, lift: form.elements.dropoffLift.checked, parking: form.elements.dropoffParking.value },
      day: value("day") || "any",
      packing: value("packing") || "none",
      dismantle: counts("dis"),
      specials: counts("sp")
    };
  }

  /* ---------- Drawing the estimate ---------- */

  var out = {
    route: document.querySelector("[data-est-route]"),
    range: document.querySelector("[data-est-range]"),
    sub: document.querySelector("[data-est-sub]"),
    facts: document.querySelector("[data-est-facts]"),
    breakdown: document.querySelector("[data-est-breakdown]"),
    lines: document.querySelector("[data-est-lines]"),
    notes: document.querySelector("[data-est-notes]"),
    book: document.querySelector("[data-book-link]"),
    bar: document.querySelector("[data-est-bar]"),
    barRange: document.querySelector("[data-est-bar-range]"),
    distance: form.querySelector("[data-distance]"),
    itemTotal: form.querySelector("[data-item-total]")
  };
  var last = null;

  function placeNote(name, inputValue) {
    var note = form.querySelector('[data-place="' + name + '"]');
    var field = form.elements[name];
    note.textContent = "";
    note.className = "field-note";
    field.removeAttribute("aria-invalid");
    if (!inputValue) {
      return null;
    }
    var place = E.lookup(inputValue);
    if (!place) {
      note.textContent = "We can't find that district. Try the first part of the postcode, like N7, or pick a distance band.";
      note.classList.add("is-error");
      field.setAttribute("aria-invalid", "true");
      return null;
    }
    note.appendChild(S.icon("i-pin"));
    note.append(" " + E.placeLine(place));
    note.classList.add("is-ok");
    return place;
  }

  function fact(iconId, text) {
    var li = el("li");
    li.append(S.icon(iconId), el("span", "", text));
    return li;
  }

  function updatePackingPrices(state) {
    var table = state.mode === "items" ? D.packingPrices.items : D.packingPrices[state.size];
    packBox.querySelectorAll(".pack-card").forEach(function (label) {
      var key = document.getElementById(label.htmlFor).value;
      var priceNode = label.querySelector(".pack-price");
      var radioNode = document.getElementById(label.htmlFor);
      var available = key === "none" || (table && table[key]);
      radioNode.disabled = !available;
      label.classList.toggle("is-off", !available);
      priceNode.textContent = key === "none" ? "£0" : available ? "£" + table[key] : "Homes only";
    });
    var checked = packBox.querySelector("input:checked");
    if (checked && checked.disabled) {
      packBox.querySelector('input[value="none"]').checked = true;
    }
  }

  function update() {
    var state = read();
    var items = form.querySelector('[data-panel="items"]');
    var rooms = form.querySelector('[data-panel="rooms"]');
    items.hidden = state.mode !== "items";
    rooms.hidden = state.mode === "items";
    updatePackingPrices(state);
    state = read();

    form.querySelectorAll(".stepper-row").forEach(function (row) {
      var f = row.querySelector("input");
      row.classList.toggle("has-value", +f.value > 0);
    });
    itemBox.querySelectorAll(".item-group").forEach(function (g) {
      var n = 0;
      g.querySelectorAll("input").forEach(function (f) {
        n += Math.max(0, +f.value || 0);
      });
      g.querySelector(".item-group-count").textContent = n ? String(n) : "";
    });

    var useBand = state.distanceMode === "band";
    form.querySelector("[data-bands-box]").hidden = !useBand;
    var fromPlace = placeNote("from", state.from);
    var toPlace = placeNote("to", state.to);

    var r = E.estimate(state);
    last = { state: state, result: r };

    // Keep the move in the address bar.
    if (window.history.replaceState) {
      var url = new URL(window.location.href);
      url.search = E.toParams(state).toString();
      window.history.replaceState(null, "", url);
    }
    out.book.href = "book.html?" + E.toParams(state).toString();

    if (state.mode === "items") {
      var load = r.ok ? r.load : null;
      out.itemTotal.textContent = load ? load.label + ", about " + (Math.round(load.volume * 10) / 10) + " cubic metres: " + D.vans[load.van].name.toLowerCase() + " and " + load.crew + (load.crew === 1 ? " mover." : " movers.") : "Nothing added yet.";
    }

    if (!useBand && fromPlace && toPlace) {
      out.distance.hidden = false;
      var miles = E.roadMiles(E.straightMiles(fromPlace, toPlace));
      out.distance.textContent = "";
      out.distance.appendChild(S.icon("i-route"));
      var span = el("span");
      span.append(el("strong", "", "About " + Math.max(1, Math.round(miles)) + (Math.round(miles) <= 1 ? " mile" : " miles") + " by road"), " from " + fromPlace.code + " to " + toPlace.code + ". An estimate from postcode districts.");
      out.distance.appendChild(span);
    } else {
      out.distance.hidden = true;
    }

    out.facts.textContent = "";
    out.lines.textContent = "";
    out.notes.textContent = "";
    if (!r.ok) {
      var why = {
        items: "Add at least one item and your price appears here.",
        size: "Pick the size of your move.",
        from: state.from ? "We can't find the pickup district. Check it, or pick a distance band." : "Add the pickup postcode, or pick a distance band.",
        to: state.to ? "We can't find the drop-off district. Check it, or pick a distance band." : "Add the drop-off postcode, or pick a distance band.",
        band: "Pick a distance band."
      };
      out.range.textContent = "£— to £—";
      out.sub.textContent = why[r.problem] || "Fill in the size and both postcodes.";
      out.route.textContent = useBand ? "Distance band" : (state.from ? E.outward(state.from) || state.from : "A") + " → " + (state.to ? E.outward(state.to) || state.to : "B");
      out.facts.hidden = true;
      out.breakdown.hidden = true;
      out.book.classList.add("is-waiting");
      out.barRange.textContent = "£—";
      return;
    }
    out.book.classList.remove("is-waiting");
    out.route.textContent = r.route.source === "band" ? r.route.band.name + ", " + r.route.band.detail : r.route.from.code + " → " + r.route.to.code + ", about " + Math.max(1, Math.round(r.route.miles)) + " miles";
    out.range.textContent = E.money(r.low) + " to " + E.money(r.high);
    out.barRange.textContent = E.money(r.low) + " to " + E.money(r.high);
    out.sub.textContent = "Most likely about " + E.money(r.total) + (r.day.name ? ", on a " + r.day.name : ", on a weekday") + ".";
    out.facts.hidden = false;
    out.facts.append(
      fact(r.load.van === "lorry" || r.load.van === "fleet" ? "i-lorry" : "i-van", r.van.name.replace(" with tail lift", "")),
      fact("i-people", r.crew + (r.crew === 1 ? " mover" : " movers")),
      fact("i-clock", E.hoursShort(r.hours))
    );
    out.breakdown.hidden = false;
    r.lines.forEach(function (line) {
      var tr = el("tr");
      var th = el("th", "", line[0]);
      th.scope = "row";
      if (line[2]) {
        th.appendChild(el("small", "", line[2]));
      }
      var td = el("td", "num", line[1] === null ? "" : line[1] === 0 ? "Free" : E.money(line[1]));
      tr.append(th, td);
      if (line[1] === null) {
        tr.className = "is-info";
      }
      out.lines.appendChild(tr);
    });
    var tr = el("tr", "is-total");
    var th = el("th", "", "Best guess");
    th.scope = "row";
    tr.append(th, el("td", "num", E.money(r.total)));
    out.lines.appendChild(tr);
    r.notes.forEach(function (n) {
      out.notes.appendChild(el("li", "", n));
    });
    if (state.packing === "full" && state.mode === "rooms" && ["bed2", "bed3", "bed4", "bed5", "office2"].indexOf(state.size) >= 0) {
      out.notes.appendChild(el("li", "", "Full packing for a home this size is done the day before the move."));
    }
  }

  /* ---------- Events ---------- */

  form.addEventListener("input", update);
  form.addEventListener("change", update);
  form.addEventListener("submit", function (event) {
    event.preventDefault();
  });

  form.addEventListener("click", function (event) {
    var b = event.target.closest("[data-step]");
    if (!b) {
      return;
    }
    var field = b.parentNode.querySelector("input");
    field.value = String(Math.max(0, Math.min(99, (Math.floor(+field.value) || 0) + +b.getAttribute("data-step"))));
    update();
  });

  // Typing a full postcode is fine: show just the district once they leave the field.
  ["from", "to"].forEach(function (name) {
    form.elements[name].addEventListener("blur", function () {
      var code = E.outward(form.elements[name].value);
      if (code && E.lookup(code)) {
        form.elements[name].value = code;
      }
    });
  });

  function message() {
    var lines = ["Hi " + D.name + ", I've done an online estimate. Could you confirm the price?", ""];
    lines = lines.concat(E.describe(last.state, last.result));
    lines.push("", "I'm happy to do a quick video call.");
    return lines.join("\n");
  }

  // Nothing to send yet: take them to whatever is missing.
  function ready() {
    if (last && last.result.ok) {
      return true;
    }
    var p = last ? last.result.problem : "";
    var target = p === "from" ? form.elements.from : p === "to" ? form.elements.to : p === "items" ? itemBox.querySelector("input") : p === "band" ? bandBox.querySelector("input") : null;
    if (target) {
      target.focus();
    }
    return false;
  }

  document.querySelector("[data-send]").addEventListener("click", function () {
    if (!ready()) {
      return;
    }
    S.sendWhatsApp(message(), "estimate");
  });

  document.querySelector("[data-email]").addEventListener("click", function (event) {
    event.preventDefault();
    if (!ready()) {
      return;
    }
    if (D.sample && typeof HTMLDialogElement === "function") {
      S.showDialog("Your email is ready", "On the real website, this opens a new email to " + D.name + " with your estimate written out:", message());
      return;
    }
    window.location.href = S.emailLink("Estimate for my move", message());
  });

  out.book.addEventListener("click", function (event) {
    if (!ready()) {
      event.preventDefault();
    }
  });

  // On a phone the estimate sits below the form; a slim bar keeps the price in view until it does.
  var card = document.getElementById("estimate");
  if (out.bar && "IntersectionObserver" in window) {
    out.bar.hidden = false;
    new IntersectionObserver(function (entries) {
      out.bar.classList.toggle("is-hidden", entries[0].isIntersecting);
    }, { threshold: 0.05 }).observe(card);
  }

  update();
})();
