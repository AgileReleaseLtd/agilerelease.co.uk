/* Tables drawn from data.js: the price guide and the fees (home page), the payment stages (home page and
   how-we-work.html), the permissions table and the timeline worked out from today (how-we-work.html). */
(function () {
  var data = window.Kember;
  var KD = window.KD;
  var el = KD.el;

  var TYPES = ["extension", "loft", "kitchen", "bathroom", "refurb"];
  var SCALE_MAX = 250000; // the price bars run from £0 to £250,000

  priceTable();
  feeList();
  payBar();
  payTable();
  permissionTable();
  programme();

  // A position on the price scale in steps of 2%, for the ps-N / pe-N classes in style.css.
  function step(n) {
    return Math.max(0, Math.min(100, Math.round((n / SCALE_MAX) * 50) * 2));
  }

  function priceTable() {
    var box = document.querySelector("[data-price-table]");
    if (!box) {
      return;
    }
    box.textContent = "";
    TYPES.forEach(function (key) {
      var type = data.types[key];
      var group = el("section", "price-group");
      group.setAttribute("aria-labelledby", "price-" + key);
      var head = el("div", "price-group-head");
      head.appendChild(KD.icon(type.icon));
      var h = el("h3", "", type.plural);
      h.id = "price-" + key;
      head.appendChild(h);
      var ask = el("a", "", "Ask for a quote");
      ask.href = "quote.html?type=" + key;
      ask.setAttribute("aria-label", "Ask for a quote: " + type.name.toLowerCase());
      head.appendChild(ask);
      group.appendChild(head);

      var rows = el("ul", "price-rows");
      Object.keys(type.guide).forEach(function (k) {
        var g = type.guide[k];
        var row = el("li", "price-row");
        row.appendChild(el("span", "price-name", g.label));
        row.appendChild(el("span", "price-range", KD.range(g)));
        var scale = el("span", "price-scale");
        scale.setAttribute("aria-hidden", "true");
        var lo = step(g.low);
        var hi = Math.max(step(g.high), lo + 2);
        scale.appendChild(el("span", "price-span ps-" + Math.min(lo, 98) + " pe-" + hi));
        row.appendChild(scale);
        rows.appendChild(row);
      });
      group.appendChild(rows);
      group.appendChild(el("p", "price-group-note", type.guideNote + " " + type.weeks.charAt(0).toUpperCase() + type.weeks.slice(1) + "."));
      box.appendChild(group);
    });
    box.appendChild(el("p", "price-scale-note", "The bars put every range on one scale, from £0 to £250,000, with a mark every £50,000."));
  }

  function feeList() {
    var list = document.querySelector("[data-fee-list]");
    if (!list) {
      return;
    }
    data.fees.forEach(function (f) {
      var row = el("div");
      row.append(el("dt", "", f.label), el("dd", "", f.value));
      list.appendChild(row);
    });
  }

  // Home page: the stages as one bar, each part as wide as its share.
  function payBar() {
    var bar = document.querySelector("[data-pay-bar]");
    if (!bar) {
      return;
    }
    data.payments.forEach(function (p, i) {
      var held = i === data.payments.length - 1;
      var seg = el("li", "pay-seg pay-w-" + p.pct + (p.pct === 0 ? " is-zero" : "") + (held ? " is-held" : ""));
      seg.appendChild(el("strong", "", p.pct === 0 ? "£0" : p.pct + "%"));
      seg.appendChild(el("span", "", p.stage));
      bar.appendChild(seg);
    });
  }

  // How-we-work page: the stages as a list, with what each one means.
  function payTable() {
    var list = document.querySelector("[data-pay-table]");
    if (!list) {
      return;
    }
    var total = 0;
    data.payments.forEach(function (p, i) {
      total += p.pct;
      var li = el("li");
      li.appendChild(el("span", "pay-step", i === 0 ? "START" : "STAGE " + i));
      var what = el("span", "pay-what");
      what.append(el("strong", "", p.stage), el("span", "", p.note));
      li.appendChild(what);
      li.appendChild(el("span", "pay-pct", p.pct === 0 ? "£0" : p.pct + "%"));
      var meter = el("span", "pay-meter");
      meter.setAttribute("aria-hidden", "true");
      meter.appendChild(el("i", "pm-" + p.pct));
      li.appendChild(meter);
      list.appendChild(li);
    });
    list.setAttribute("data-total", String(total));
  }

  function permissionTable() {
    var box = document.querySelector("[data-perm-matrix]");
    if (!box) {
      return;
    }
    var words = ["Rarely", "Sometimes", "Often", "Yes"];
    var cols = Object.keys(data.permissionNames);
    var table = el("table", "perm-table");
    var caption = el("caption", "visually-hidden", "Which permissions each kind of project usually needs");
    table.appendChild(caption);
    var thead = el("thead");
    var hr = el("tr");
    var corner = el("th", "", "Project");
    corner.scope = "col";
    hr.appendChild(corner);
    cols.forEach(function (c) {
      var th = el("th", "", data.permissionNames[c]);
      th.scope = "col";
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);
    var tbody = el("tbody");
    TYPES.forEach(function (t) {
      var tr = el("tr");
      var th = el("th", "", data.types[t].name);
      th.scope = "row";
      tr.appendChild(th);
      cols.forEach(function (c) {
        var cell = data.permissions[t][c];
        var td = el("td");
        td.setAttribute("data-label", data.permissionNames[c]);
        var level = el("span", "perm-level");
        var dots = el("span", "lv lv-" + cell[0]);
        dots.setAttribute("aria-hidden", "true");
        dots.append(el("i"), el("i"), el("i"));
        level.append(dots, document.createTextNode(words[cell[0]]));
        td.appendChild(level);
        if (cell[1]) {
          td.appendChild(el("span", "perm-why", cell[1]));
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    box.appendChild(table);
  }

  // The timeline of a typical extension, in weeks from this week, with month names along the top.
  function programme() {
    var box = document.querySelector("[data-programme]");
    if (!box) {
      return;
    }
    var WEEKS = 36;
    var permitsEnd = 14;
    var buildWeeks = 14;
    var buildStart = Math.min(Math.max(permitsEnd, data.leadWeeks), WEEKS - buildWeeks - 1);
    var buildEnd = buildStart + buildWeeks;
    var rows = [
      { label: "Visit and quote", small: "Free", s: 0, e: 2, cls: "is-ours" },
      { label: "Drawings", small: "Plans and structural design", s: 2, e: 6, cls: "is-ours" },
      { label: "Planning or certificate", small: "The council decides, about 8 weeks", s: 6, e: permitsEnd, cls: "is-paper" },
      { label: "Building control, party walls", small: "At the same time", s: 6, e: 12, cls: "is-paper" }
    ];
    if (buildStart > permitsEnd) {
      rows.push({ label: "Waiting for a start date", small: "Steels and glazing ordered", s: permitsEnd, e: buildStart, cls: "is-wait" });
    }
    rows.push({ label: "The build", small: buildWeeks + " weeks on site", s: buildStart, e: buildEnd, cls: "is-build" });
    rows.push({ label: "Sign-off", small: "Certificates and snags", s: buildEnd, e: buildEnd + 1, cls: "is-ours" });

    var today = new Date();
    // Monday of this week is week 0.
    var monday = KD.addDays(today, -((today.getDay() + 6) % 7));
    function weekDate(w) {
      return KD.addDays(monday, w * 7);
    }

    box.textContent = "";
    box.setAttribute("role", "img");
    var corner = el("span", "pg-corner");
    box.appendChild(corner);

    // Month ticks: a new tick in the first week that starts in a new month.
    var ticks = [];
    var last = -1;
    for (var w = 0; w < WEEKS; w++) {
      var m = weekDate(w).getMonth();
      if (m !== last) {
        ticks.push({ w: w, d: weekDate(w) });
        last = m;
      }
    }
    ticks.forEach(function (t, i) {
      var end = i + 1 < ticks.length ? ticks[i + 1].w : WEEKS;
      var tick = el("span", "pg-tick gs-" + t.w + " ge-" + end, end - t.w >= 3 ? KD.fmt.month.format(t.d) : "");
      box.appendChild(tick);
    });

    var spoken = [];
    rows.forEach(function (r) {
      var label = el("span", "pg-label", r.label);
      label.appendChild(el("small", "", r.small));
      box.appendChild(label);
      box.appendChild(el("span", "pg-bar " + r.cls + " gs-" + r.s + " ge-" + r.e));
      spoken.push(r.label + ": " + KD.fmt.dayMonth.format(weekDate(r.s)) + " to " + KD.fmt.dayMonth.format(weekDate(r.e)));
    });
    box.setAttribute("aria-label", "Timeline for a typical extension if you get in touch this week. " + spoken.join(". ") + ".");

    var key = el("ul", "programme-key");
    key.setAttribute("aria-hidden", "true");
    [["is-ours", "Our work"], ["is-paper", "Council and paperwork"], ["is-build", "On site"]].forEach(function (k) {
      var li = el("li");
      li.append(el("i", k[0]), document.createTextNode(k[1]));
      key.appendChild(li);
    });
    box.parentNode.insertBefore(key, box.nextSibling);

    var note = document.querySelector("[data-programme-note]");
    if (note) {
      note.textContent = "So the build could start around " + KD.fmt.monthYear.format(weekDate(buildStart)) +
        " and finish around " + KD.fmt.monthYear.format(weekDate(buildEnd + 1)) + ". A loft or a kitchen is quicker on site, and a lawful development certificate can be quicker than planning.";
    }
  }
})();
