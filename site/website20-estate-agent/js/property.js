/* One property: property.html?id=pennyroyal-road. Everything on the page comes from that property's entry in
   data.js: the drawing, price, key features, rooms, the material information buyers and tenants need
   (National Trading Standards' Parts A, B and C), an example energy rating, and the viewing request, which
   becomes a WhatsApp message. */
(function () {
  var data = window.Transom;
  var T = window.TransomSite;
  var root = document.querySelector("[data-property]");
  if (!root) {
    return;
  }
  var params = new URLSearchParams(window.location.search);
  var p = T.find(params.get("id") || "");
  var missing = document.querySelector("[data-missing]");

  // Back to the last search, if there was one in this tab.
  var back = document.querySelector("[data-back]");
  var lastSearch = "";
  try {
    lastSearch = window.sessionStorage.getItem("transom-search") || "";
  } catch (e) {
    lastSearch = "";
  }

  if (!p) {
    root.hidden = true;
    missing.hidden = false;
    document.title = "Property not found | Transom & Co (sample website)";
    return;
  }

  var isLet = p.mode === "let";
  if (back) {
    back.href = "properties.html" + (lastSearch && lastSearch.indexOf("mode=" + p.mode) !== -1 ? lastSearch : "?mode=" + p.mode);
    back.querySelector("span").textContent = isLet ? "Back to homes to rent" : "Back to homes for sale";
  }

  function q(sel) {
    return root.querySelector(sel);
  }
  function set(sel, text) {
    var n = q(sel);
    if (n) {
      n.textContent = text;
    }
    return n;
  }

  var pr = T.price(p);
  document.title = p.title + ", " + p.street + " | Transom & Co (sample website)";

  /* ---------- Summary ---------- */

  var slip = q("[data-status]");
  slip.textContent = T.STATUS[p.status];
  slip.className = "status status-" + p.status;
  set("[data-qualifier]", pr.qualifier || "To rent");
  set("[data-price]", pr.main);
  set("[data-price-sub]", pr.sub);
  q("[data-price-sub]").hidden = !pr.sub;
  set("[data-title]", p.title);
  set("[data-address]", T.place(p));
  set("[data-summary]", p.summary);
  set("[data-ref]", "Ref " + p.ref);
  set("[data-when]", isLet ? T.availableLabel(p.availableIn) + " · " + p.furnished : T.listedLabel(p.listed));

  var stats = q("[data-stats]");
  [["bed", T.bedsText(p)], ["bath", p.baths + (p.baths === 1 ? " bathroom" : " bathrooms")], ["sofa", p.receptions ? p.receptions + (p.receptions === 1 ? " reception" : " receptions") : "Open-plan living"], ["area", T.num.format(p.sqft) + " sq ft (" + T.sqm(p.sqft) + " m²)"]].forEach(function (s) {
    var li = T.el("li");
    li.appendChild(T.icon(s[0]));
    li.appendChild(document.createTextNode(s[1]));
    stats.appendChild(li);
  });

  /* ---------- Pictures ---------- */

  var media = q("[data-media]");
  media.insertBefore(window.TransomArt.property(p, { label: "Illustration of the front of " + p.title.toLowerCase() + ", " + p.street + ". On a live listing, the agent's own photos go here." }), media.firstChild);
  var gallery = q("[data-gallery]");
  var shots = p.rooms.slice(0, 4);
  shots.forEach(function (r, i) {
    var li = T.el("li", "shot shot-" + (i % 4));
    li.appendChild(T.icon("camera"));
    li.appendChild(T.el("span", "shot-room", r[0]));
    li.appendChild(T.el("span", "shot-note", "Photo goes here"));
    gallery.appendChild(li);
  });

  /* ---------- Details ---------- */

  var feats = q("[data-features]");
  p.features.forEach(function (f) {
    var li = T.el("li");
    li.appendChild(T.icon("check"));
    li.appendChild(document.createTextNode(f));
    feats.appendChild(li);
  });
  var desc = q("[data-description]");
  p.description.forEach(function (para) {
    desc.appendChild(T.el("p", "", para));
  });
  var rooms = q("[data-rooms]");
  p.rooms.forEach(function (r) {
    var tr = T.el("tr");
    tr.appendChild(T.el("th", "", r[0]));
    tr.lastChild.setAttribute("scope", "row");
    tr.appendChild(T.el("td", "", r[1]));
    rooms.appendChild(tr);
  });
  set("[data-area]", T.num.format(p.sqft) + " sq ft (" + T.sqm(p.sqft) + " m²)");

  /* ---------- Material information ---------- */

  function rows(target, list) {
    var dl = q(target);
    list.forEach(function (row) {
      if (!row) {
        return;
      }
      var div = T.el("div", row[2] ? "mi-row is-key" : "mi-row");
      div.appendChild(T.el("dt", "", row[0]));
      var dd = T.el("dd");
      if (typeof row[1] === "string") {
        dd.textContent = row[1];
      } else {
        dd.appendChild(row[1]);
      }
      div.appendChild(dd);
      dl.appendChild(div);
    });
  }

  function linkText(before, href, label, after) {
    var span = T.el("span", "", before);
    var a = T.el("a", "", label);
    a.href = href;
    span.appendChild(a);
    if (after) {
      span.appendChild(document.createTextNode(after));
    }
    return span;
  }

  var councilTax = "Band " + p.councilTax + " (London Borough of Tower Hamlets)";
  if (isLet) {
    var dep = T.deposit(p.price);
    rows("[data-part-a]", [
      ["Rent", pr.main + " (" + pr.sub + ")", true],
      ["Deposit", T.moneyPence(dep.amount) + ": " + (dep.weeks === 6 ? "six" : "five") + " weeks' rent" + (dep.weeks === 6 ? ", as the rent is over £50,000 a year" : "") + ". Protected in a government-approved scheme.", true],
      ["Holding deposit", T.moneyPence(T.holding(p.price)) + ": one week's rent, to hold the home while we check references. It goes towards your first month's rent."],
      ["Rent in advance", "One month, paid after you sign the tenancy agreement and before you move in."],
      ["Minimum tenancy", "None. Tenancies roll on month to month, and you can leave by giving two months' notice.", true],
      ["Council tax", councilTax, true],
      ["Furnishing", p.furnished],
      ["Available", T.availableLabel(p.availableIn).replace("Available ", "").replace(/^now$/, "Now").replace(/^from /, "From ")],
      ["Tenant fees", linkText("Nothing else to pay. ", "landlords.html#tenant-fees", "What the law allows us to charge", ".")]
    ]);
  } else {
    var lease = p.lease;
    rows("[data-part-a]", [
      ["Price", (pr.qualifier ? pr.qualifier + " " : "") + pr.main, true],
      ["Tenure", p.tenure, true],
      lease ? ["Lease remaining", lease.years + " years", true] : null,
      lease ? ["Ground rent", lease.groundRent, true] : null,
      lease ? ["Service charge", lease.serviceCharge, true] : null,
      ["Council tax", councilTax, true]
    ]);
  }
  var info = p.info;
  rows("[data-part-b]", [
    ["Property type", p.style + (p.type === "flat" ? " (flat)" : p.type === "maisonette" ? " (maisonette)" : " (house)")],
    ["Construction", info.construction],
    ["Rooms", T.bedsText(p) + ", " + (p.receptions ? p.receptions + (p.receptions === 1 ? " reception room" : " reception rooms") : "open-plan living") + ", " + p.baths + (p.baths === 1 ? " bathroom" : " bathrooms")],
    ["Electricity, water, drainage", info.utilities],
    ["Heating", info.heating],
    ["Broadband", info.broadband],
    ["Mobile signal", info.mobile],
    ["Parking", info.parking]
  ]);
  rows("[data-part-c]", [
    ["Building safety", info.safety],
    ["Restrictions", info.restrictions],
    ["Rights and easements", info.rights],
    ["Flood risk", info.flood],
    ["Coastal erosion", "Not affected"],
    ["Planning", info.planning],
    ["Accessibility", info.access],
    ["Coalfield or mining area", "Not affected"]
  ]);

  /* ---------- Energy rating (example graphic) ---------- */

  var BANDS = [["A", 92, "#008054", "#ffffff"], ["B", 81, "#19b459", "#14210f"], ["C", 69, "#8dce46", "#14210f"], ["D", 55, "#ffd500", "#14210f"], ["E", 39, "#fcaa65", "#14210f"], ["F", 21, "#ef8023", "#14210f"], ["G", 1, "#e9153b", "#14210f"]];
  function band(score) {
    for (var i = 0; i < BANDS.length; i++) {
      if (score >= BANDS[i][1]) {
        return i;
      }
    }
    return BANDS.length - 1;
  }

  function epcChart(cur, pot) {
    var NS = "http://www.w3.org/2000/svg";
    function n(tag, attrs, parent, txt) {
      var e = document.createElementNS(NS, tag);
      for (var k in attrs) {
        e.setAttribute(k, attrs[k]);
      }
      if (txt !== undefined) {
        e.textContent = txt;
      }
      parent.appendChild(e);
      return e;
    }
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 400 236");
    svg.setAttribute("class", "epc-chart");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Example energy performance chart: current rating " + BANDS[band(cur)][0] + " (" + cur + "), potential rating " + BANDS[band(pot)][0] + " (" + pot + ").");
    n("rect", { x: 0, y: 0, width: 400, height: 236, rx: 10, fill: "#fffdf9", stroke: "#d9cfbd" }, svg);
    n("text", { x: 14, y: 22, "font-size": 11, "font-weight": 600, fill: "#5e524d", "font-family": "Onest, Arial, sans-serif" }, svg, "Score and rating");
    n("text", { x: 300, y: 22, "font-size": 11, "font-weight": 600, fill: "#5e524d", "text-anchor": "middle", "font-family": "Onest, Arial, sans-serif" }, svg, "Current");
    n("text", { x: 360, y: 22, "font-size": 11, "font-weight": 600, fill: "#5e524d", "text-anchor": "middle", "font-family": "Onest, Arial, sans-serif" }, svg, "Potential");
    n("line", { x1: 270, y1: 8, x2: 270, y2: 228, stroke: "#e3dacb" }, svg);
    n("line", { x1: 330, y1: 8, x2: 330, y2: 228, stroke: "#e3dacb" }, svg);
    var ranges = ["92+", "81-91", "69-80", "55-68", "39-54", "21-38", "1-20"];
    BANDS.forEach(function (b, i) {
      var y = 32 + i * 28;
      var w = 92 + i * 22;
      n("rect", { x: 14, y: y, width: w, height: 24, fill: b[2] }, svg);
      n("text", { x: 20, y: y + 16, "font-size": 10, fill: b[3], "font-family": "Onest, Arial, sans-serif" }, svg, ranges[i]);
      n("text", { x: 14 + w - 8, y: y + 17.5, "font-size": 15, "font-weight": 700, fill: b[3], "text-anchor": "end", "font-family": "Onest, Arial, sans-serif" }, svg, b[0]);
    });
    [[cur, 300], [pot, 360]].forEach(function (c) {
      var i = band(c[0]);
      var y = 32 + i * 28;
      var x = c[1];
      n("polygon", { points: (x - 26) + "," + (y + 12) + " " + (x - 16) + "," + y + " " + (x + 26) + "," + y + " " + (x + 26) + "," + (y + 24) + " " + (x - 16) + "," + (y + 24), fill: BANDS[i][2] }, svg);
      n("text", { x: x + 4, y: y + 17, "font-size": 13, "font-weight": 700, fill: BANDS[i][3], "text-anchor": "middle", "font-family": "Onest, Arial, sans-serif" }, svg, c[0] + " " + BANDS[i][0]);
    });
    return svg;
  }
  var epc = q("[data-epc]");
  epc.insertBefore(epcChart(p.epc[0], p.epc[1]), epc.firstChild);
  set("[data-epc-text]", "Rated " + BANDS[band(p.epc[0])][0] + " (" + p.epc[0] + ") now, and could reach " + BANDS[band(p.epc[1])][0] + " (" + p.epc[1] + ").");

  /* ---------- Similar homes ---------- */

  var similar = document.querySelector("[data-similar]");
  if (similar) {
    var others = data.properties.filter(function (o) {
      return o.id !== p.id && o.mode === p.mode;
    }).sort(function (a, b) {
      var sa = (a.type === p.type ? 0 : 2) + (a.status === "available" ? 0 : 1);
      var sb = (b.type === p.type ? 0 : 2) + (b.status === "available" ? 0 : 1);
      return sa - sb || Math.abs(a.price - p.price) - Math.abs(b.price - p.price);
    }).slice(0, 3);
    others.forEach(function (o) {
      similar.appendChild(T.card(o));
    });
    var more = document.querySelector("[data-similar-more]");
    if (more) {
      more.href = "properties.html?mode=" + p.mode;
      more.querySelector("span").textContent = isLet ? "All homes to rent" : "All homes for sale";
    }
  }

  /* ---------- Viewing request ---------- */

  var dialog = document.getElementById("viewing-dialog");
  var form = dialog.querySelector("form");
  var openers = document.querySelectorAll("[data-open-viewing]");
  var closedToViewings = p.status === "sold-stc" || p.status === "let-agreed";
  var days = T.appointmentDays();

  set("[data-cta-note]", closedToViewings ? (isLet ? "This home is let agreed. Ask us to tell you first when a similar one comes up." : "This home is sold subject to contract. Ask us to tell you first when a similar one comes up.") : p.status === "under-offer" ? "An offer has been accepted, but you can still view and make an offer." : "Viewings Monday to Saturday, including early evenings.");
  openers.forEach(function (b) {
    b.querySelector("span").textContent = closedToViewings ? "Hear about similar homes" : "Book a viewing";
  });

  dialog.querySelector("[data-viewing-title]").textContent = closedToViewings ? "Hear about similar homes" : "Book a viewing";
  var sum = dialog.querySelector("[data-viewing-summary]");
  sum.appendChild(T.el("strong", "", p.title));
  sum.appendChild(T.el("span", "", T.place(p) + " · " + (pr.qualifier ? pr.qualifier + " " : "") + pr.main));
  dialog.querySelector("[data-when-fields]").hidden = closedToViewings;
  dialog.querySelector("[data-sale-fields]").hidden = isLet;
  dialog.querySelector("[data-let-fields]").hidden = !isLet;

  var daySel = form.elements.day;
  days.forEach(function (d) {
    var o = T.el("option", "", d.label);
    o.value = d.iso;
    daySel.appendChild(o);
  });
  var timeBox = dialog.querySelector("[data-times]");
  function fillTimes() {
    var d = days.filter(function (x) {
      return x.iso === daySel.value;
    })[0];
    var keep = form.elements.time ? (form.querySelector('input[name="time"]:checked') || {}).value : "";
    timeBox.textContent = "";
    if (!d) {
      return;
    }
    d.slots.forEach(function (s, i) {
      var id = "time-" + s[0];
      var lab = T.el("label", "choice");
      lab.setAttribute("for", id);
      var input = T.el("input");
      input.type = "radio";
      input.name = "time";
      input.id = id;
      input.value = s[0];
      input.checked = keep ? keep === s[0] : i === 0;
      lab.appendChild(input);
      lab.appendChild(T.el("span", "", s[1]));
      timeBox.appendChild(lab);
    });
    if (!form.querySelector('input[name="time"]:checked')) {
      form.querySelector('input[name="time"]').checked = true;
    }
  }
  daySel.addEventListener("change", fillTimes);
  fillTimes();

  var nameInput = form.elements.name;
  var nameError = document.getElementById("viewing-name-error");
  var lastOpener = null;

  openers.forEach(function (b) {
    b.addEventListener("click", function () {
      lastOpener = b;
      nameError.hidden = true;
      nameInput.removeAttribute("aria-invalid");
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
        nameInput.focus();
      }
    });
  });
  dialog.querySelectorAll("[data-close]").forEach(function (b) {
    b.addEventListener("click", function () {
      dialog.close();
    });
  });
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) {
      dialog.close();
    }
  });
  nameInput.addEventListener("input", function () {
    if (nameInput.value.trim()) {
      nameError.hidden = true;
      nameInput.removeAttribute("aria-invalid");
    }
  });

  function chosenLabel(select) {
    return select.options[select.selectedIndex] ? select.options[select.selectedIndex].text : "";
  }

  function message() {
    var lines = [
      closedToViewings ? "Hi Transom & Co, please tell me when a home like this comes up." : "Hi Transom & Co, I'd like to book a viewing.",
      "",
      "Property: " + p.title + ", " + T.place(p) + " (ref " + p.ref + ")",
      (isLet ? "Rent: " : "Price: ") + (pr.qualifier ? pr.qualifier + " " : "") + pr.main
    ];
    if (!closedToViewings) {
      var d = days.filter(function (x) {
        return x.iso === daySel.value;
      })[0];
      var t = form.querySelector('input[name="time"]:checked');
      lines.push("Day: " + T.fmt.long.format(d.date));
      lines.push("Time: " + (t ? t.nextSibling.textContent : ""));
    }
    lines.push("Name: " + nameInput.value.trim());
    if (isLet) {
      lines.push("Move-in: " + chosenLabel(form.elements.move));
      lines.push("People living there: " + form.elements.people.value);
      var hasNote = !!form.elements.note.value.trim();
      lines.push("Pets: " + (form.querySelector('input[name="pets"]:checked').value === "yes" ? (hasNote ? "Yes (details in the note)" : "Yes") : "None"));
    } else {
      var position = chosenLabel(form.elements.position);
      if (form.elements.aip.checked) {
        position += ", mortgage agreed in principle";
      }
      lines.push("Buying position: " + position);
    }
    var note = form.elements.note.value.trim();
    if (note) {
      lines.push("Note: " + note);
    }
    return lines.join("\n");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!nameInput.value.trim()) {
      nameError.hidden = false;
      nameInput.setAttribute("aria-invalid", "true");
      nameInput.focus();
      return;
    }
    var text = message();
    dialog.close();
    T.send(text, lastOpener);
  });
})();
