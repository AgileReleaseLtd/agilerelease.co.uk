/* The packages page: a tab for each kind of client (what is included, the fee for each turnover band and
   the add-ons), and the package finder, which turns four answers into a fee statement. Everything comes
   from data.js. Nothing is sent anywhere. */
(function () {
  var data = window.Quarterday;
  var D = window.QuarterdayDates;
  var UI = window.QuarterdayUI;
  var el = UI.el;

  var tabsBox = document.querySelector("[data-pkg-tabs]");
  var panelsBox = document.querySelector("[data-pkg-panels]");
  var form = document.querySelector("[data-finder]");
  if (!tabsBox || !panelsBox || !form) {
    return;
  }

  var TYPES = ["sole", "landlord", "ltd", "books"];
  var TYPE_ICONS = { sole: "i-person", landlord: "i-key", both: "i-plus", ltd: "i-building", books: "i-book" };
  // Each band's range, for words like "under £30,000" and "£90,000 and over".
  var RANGE = { "u20": [0, 20000], "20-30": [20000, 30000], "30-50": [30000, 50000], "50-90": [50000, 90000], "90-250": [90000, 250000], "250": [250000, null] };
  var FEE_NOTES = {
    sole: "From £30,000 the fee includes Making Tax Digital, which applies from 6 April 2027 if your qualifying income was over £30,000 in 2025 to 2026.",
    landlord: "Up to three properties. Each property after that is £8 a month. Rent means your share, before expenses.",
    ltd: "Payroll for directors is included. Payroll for staff and VAT returns are add-ons.",
    books: "Turnover is a guide to how many transactions you have. Year-end accounts and tax returns are not included."
  };

  function bandLabel(id) {
    for (var i = 0; i < data.bands.length; i++) {
      if (data.bands[i].id === id) {
        return data.bands[i].label;
      }
    }
    return "";
  }

  function money(n) {
    return UI.money0.format(n);
  }

  // "Under £30,000", "£30,000 and over" or "Every size", for the bands a tier covers.
  function tierRange(pkg, tierKey) {
    var bands = data.bands.map(function (b) {
      return b.id;
    }).filter(function (id) {
      return pkg.tiers[id] === tierKey;
    });
    if (bands.length === data.bands.length) {
      return "Every size";
    }
    var first = RANGE[bands[0]];
    var last = RANGE[bands[bands.length - 1]];
    if (first[0] === 0) {
      return "Under " + money(last[1]);
    }
    if (last[1] === null) {
      return money(first[0]) + " and over";
    }
    return money(first[0]) + " to " + money(last[1]);
  }

  /* ---------- Panels ---------- */

  function addonItem(key) {
    var a = data.addons[key];
    var li = el("li", "addon");
    li.appendChild(el("span", "addon-name", a.name));
    var price = el("span", "addon-price");
    var num = el("span", "num", (a.from ? "from " : "") + money(a.amount));
    price.appendChild(num);
    price.appendChild(el("small", "", a.oneOff ? "one-off" : a.perUnit ? "a month each" : "a month"));
    li.appendChild(price);
    if (a.note) {
      li.appendChild(el("p", "addon-note", a.note));
    }
    return li;
  }

  function renderPanel(type) {
    var pkg = data.packages[type];
    var panel = el("div", "pkg-panel");
    panel.id = "panel-" + type;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", "tab-" + type);
    panel.tabIndex = 0;

    var intro = el("div", "pkg-intro");
    intro.appendChild(el("h2", "h3", pkg.name));
    intro.appendChild(el("p", "", pkg.who));
    panel.appendChild(intro);

    var grid = el("div", "pkg-grid");
    var tiers = el("div", "tiers");
    Object.keys(pkg.tierInfo).forEach(function (key) {
      var info = pkg.tierInfo[key];
      var block = el("div", "tier");
      var h = el("h3", "tier-name", info.name);
      h.appendChild(el("span", "tier-badge", tierRange(pkg, key)));
      block.appendChild(h);
      var ul = el("ul", "ticks");
      info.includes.forEach(function (text, i) {
        ul.appendChild(el("li", i === 0 && /^Everything in/.test(text) ? "is-inherit" : "", text));
      });
      block.appendChild(ul);
      tiers.appendChild(block);
    });
    grid.appendChild(tiers);

    var card = el("div", "fee-card");
    var head = el("div", "fee-card-head");
    head.appendChild(el("h3", "", "Your monthly fee"));
    head.appendChild(el("p", "", "Plus VAT"));
    card.appendChild(head);

    var table = el("table", "fee-table");
    table.appendChild(el("caption", "visually-hidden", "Monthly fee for " + pkg.name.toLowerCase() + " by " + pkg.turnoverWord.toLowerCase()));
    var thead = el("thead");
    var hr = el("tr");
    [pkg.turnoverWord, "Package", "A month"].forEach(function (t, i) {
      var th = el("th", i === 2 ? "fee-amount" : i === 1 ? "fee-tier" : "", t);
      th.scope = "col";
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);
    var tbody = el("tbody");
    data.bands.forEach(function (b) {
      var tr = el("tr", pkg.tiers[b.id] === "mtd" ? "is-mtd" : "");
      tr.setAttribute("data-band", b.id);
      var th = el("th", "", b.label);
      th.scope = "row";
      tr.appendChild(th);
      tr.appendChild(el("td", "fee-tier", pkg.tierInfo[pkg.tiers[b.id]].name));
      var td = el("td", "fee-amount");
      td.appendChild(el("span", "num", money(pkg.fees[b.id])));
      tr.appendChild(td);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    card.appendChild(table);
    card.appendChild(el("p", "fee-note", FEE_NOTES[type]));
    grid.appendChild(card);
    panel.appendChild(grid);

    var addons = el("div", "addons");
    addons.appendChild(el("h3", "", "Add when you need them"));
    var list = el("ul", "addon-list");
    pkg.addons.forEach(function (key) {
      list.appendChild(addonItem(key));
    });
    addons.appendChild(list);
    panel.appendChild(addons);
    return panel;
  }

  panelsBox.textContent = "";
  TYPES.forEach(function (type, i) {
    var panel = renderPanel(type);
    panel.hidden = i !== 0;
    panelsBox.appendChild(panel);
  });

  /* ---------- Tabs ---------- */

  var tabs = Array.prototype.slice.call(tabsBox.querySelectorAll('[role="tab"]'));

  function selectTab(type, opts) {
    opts = opts || {};
    tabs.forEach(function (tab) {
      var on = tab.getAttribute("data-type") === type;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && opts.focus) {
        tab.focus();
      }
    });
    TYPES.forEach(function (t) {
      document.getElementById("panel-" + t).hidden = t !== type;
    });
    if (opts.hash && window.history.replaceState) {
      window.history.replaceState(null, "", "#" + type);
    }
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () {
      selectTab(tab.getAttribute("data-type"), { hash: true });
    });
    tab.addEventListener("keydown", function (event) {
      var next = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        next = tabs[(i + 1) % tabs.length];
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        next = tabs[(i - 1 + tabs.length) % tabs.length];
      } else if (event.key === "Home") {
        next = tabs[0];
      } else if (event.key === "End") {
        next = tabs[tabs.length - 1];
      }
      if (next) {
        event.preventDefault();
        selectTab(next.getAttribute("data-type"), { focus: true, hash: true });
      }
    });
  });

  // packages.html#landlord opens that tab and scrolls to it.
  function fromHash() {
    var type = window.location.hash.slice(1);
    if (TYPES.indexOf(type) > -1) {
      selectTab(type);
      tabsBox.scrollIntoView({ block: "start" });
    }
  }
  fromHash();
  window.addEventListener("hashchange", fromHash);

  /* ---------- Finder ---------- */

  var statementFor = document.querySelector("[data-statement-for]");
  var statementBody = document.querySelector("[data-statement-body]");
  var bandLegend = form.querySelector("[data-band-legend]");
  var bandHint = form.querySelector("[data-band-hint]");

  var BAND_WORDS = {
    sole: ["Turnover a year, before expenses", "Roughly is fine. Use last year's figure, or your best guess if you are new."],
    landlord: ["Rent received a year, your share", "Before expenses. If you own a property jointly, count only your share."],
    both: ["Turnover and rent together, a year", "Add your sales and your share of rent, before expenses. This is close to what HMRC calls qualifying income."],
    ltd: ["Company turnover a year", "The company's sales, before expenses."],
    books: ["Turnover a year", "We use it as a guide to how many transactions you have each month."]
  };

  function choice(name, value, label, opts) {
    opts = opts || {};
    var wrap = el("label", "choice");
    var input = el("input");
    input.type = "radio";
    input.name = name;
    input.value = value;
    var span = el("span");
    if (opts.icon) {
      span.appendChild(UI.icon(opts.icon));
    }
    var text = el("span", "", label);
    if (opts.sub) {
      text.appendChild(el("span", "choice-sub", opts.sub));
    }
    span.appendChild(text);
    wrap.append(input, span);
    return wrap;
  }

  function fill(name, items) {
    var box = form.querySelector('[data-choices="' + name + '"]');
    items.forEach(function (it) {
      box.appendChild(choice(name, it.value, it.label, it));
    });
  }

  fill("type", data.finder.types.map(function (t) {
    return { value: t.id, label: t.label, icon: TYPE_ICONS[t.id] };
  }));
  fill("band", data.bands.map(function (b) {
    return { value: b.id, label: b.label };
  }));
  fill("vat", data.finder.vat.map(function (v) {
    return { value: v.id, label: v.label };
  }));
  fill("staff", data.finder.staff.map(function (s) {
    return { value: s.id, label: s.label };
  }));

  function value(name) {
    var checked = form.querySelector('input[name="' + name + '"]:checked');
    return checked ? checked.value : "";
  }

  function staffInfo(id) {
    return data.finder.staff.filter(function (s) {
      return s.id === id;
    })[0];
  }

  // What Making Tax Digital means for a turnover band, from the thresholds in data.js.
  function mtdNote(band, type) {
    var phases = data.mtd.phases; // [£50k from 2026, £30k from 2027, £20k from 2028]
    var low = RANGE[band][0];
    var start = function (ph) {
      return D.fmt.full.format(D.parseIso(ph.starts));
    };
    var lead = type === "both" ? "Your turnover and rent count together. " : "";
    if (low >= phases[0].threshold) {
      return lead + "If your qualifying income was over " + money(phases[0].threshold) + " in " + phases[0].taxYear + ", you should already be in Making Tax Digital. If not, it starts on " + start(phases[1]) + " for income over " + money(phases[1].threshold) + " in " + phases[1].taxYear + ". This package includes it.";
    }
    if (low >= phases[1].threshold) {
      return lead + "Making Tax Digital starts for you on " + start(phases[1]) + " if your qualifying income was over " + money(phases[1].threshold) + " in " + phases[1].taxYear + ". This package includes it, and we get you ready now.";
    }
    if (low >= phases[2].threshold) {
      return lead + "Making Tax Digital starts on " + start(phases[2]) + " if your qualifying income is over " + money(phases[2].threshold) + " in " + phases[2].taxYear + ". We check every year and move you across when it applies.";
    }
    return lead + "Under " + money(phases[2].threshold) + ", the Making Tax Digital thresholds announced so far do not apply to you. We check again every year.";
  }

  function line(name, sub, amount, opts) {
    opts = opts || {};
    var li = el("li", "st-line" + (opts.maybe ? " is-maybe" : ""));
    var n = el("span", "st-line-name", name);
    if (sub) {
      n.appendChild(el("small", "", sub));
    }
    var leader = el("span", "st-leader");
    leader.setAttribute("aria-hidden", "true");
    var a = el("span", "st-amount num", typeof amount === "number" ? UI.money2.format(amount) : amount);
    li.append(n, leader, a);
    return li;
  }

  function note(kind, iconId, text) {
    var li = el("li", "st-note st-note-" + kind);
    li.appendChild(UI.icon(iconId));
    li.appendChild(el("span", "", text));
    return li;
  }

  function progress(state) {
    var items = statementBody.querySelectorAll("[data-statement-progress] li");
    ["type", "band", "vat", "staff"].forEach(function (k, i) {
      if (items[i]) {
        items[i].classList.toggle("is-done", !!state[k]);
      }
    });
  }

  function progressList(state) {
    var ol = el("ol", "statement-progress");
    ol.setAttribute("aria-label", "Questions answered");
    ol.setAttribute("data-statement-progress", "");
    ["What you are", "Turnover", "VAT", "Employees"].forEach(function (t, i) {
      var k = ["type", "band", "vat", "staff"][i];
      var li = el("li", state[k] ? "is-done" : "", t);
      ol.appendChild(li);
    });
    return ol;
  }

  function typeLabel(id) {
    return data.finder.types.filter(function (t) {
      return t.id === id;
    })[0].label;
  }

  // Works out the package and fee from the four answers.
  function work(state) {
    var pkgKey = state.type === "both" ? "sole" : state.type;
    var pkg = data.packages[pkgKey];
    var tierKey = pkg.tiers[state.band];
    var tierName = pkg.tierInfo[tierKey].name;
    var lines = [];
    var maybe = [];
    var notes = [];
    var total = 0;

    var fee = pkg.fees[state.band];
    lines.push({ name: pkg.short + ": " + tierName, sub: bandLabel(state.band) + (pkgKey === "landlord" ? " rent" : ""), amount: fee });
    total += fee;

    if (state.type === "both") {
      lines.push({ name: data.addons.rent.name, amount: data.addons.rent.amount });
      total += data.addons.rent.amount;
    }

    var overVat = data.finder.vatBands.indexOf(state.band) > -1;
    if (state.vat === "yes") {
      lines.push({ name: data.addons.vat.name, amount: data.addons.vat.amount });
      total += data.addons.vat.amount;
    } else if (state.vat) {
      if (pkgKey === "landlord") {
        notes.push(["info", "i-info", "Rent from letting homes is exempt from VAT, so most landlords never register. Holiday lets and commercial property can be different: we will check."]);
      } else if (overVat) {
        maybe.push({ name: data.addons.vat.name, sub: "If you need to register", amount: data.addons.vat.amount });
        notes.push(["warn", "i-alert", "Once your VAT-taxable sales go over £90,000 in any 12 months, you must register for VAT within 30 days of the end of that month. We will check this first."]);
      } else if (state.vat === "unsure") {
        notes.push(["info", "i-info", "Under £90,000 of VAT-taxable sales you do not have to register, though some businesses choose to. We will check on our first call."]);
      }
    }

    if (state.staff) {
      var s = staffInfo(state.staff);
      if (s.fee) {
        lines.push({ name: "Payroll for " + s.label.replace(/ people$/, "") + " staff", sub: "With pension auto-enrolment", amount: s.fee });
        total += s.fee;
      } else if (s.fee === null) {
        maybe.push({ name: "Payroll for more than 10 staff", sub: "Priced for your team", amount: "We quote" });
      } else if (pkgKey === "ltd") {
        notes.push(["info", "i-check", "Payroll for directors is already included."]);
      }
    }

    if (pkgKey === "sole" || pkgKey === "landlord") {
      notes.unshift(["mtd", "i-calendar", mtdNote(state.band, state.type)]);
    } else if (pkgKey === "ltd") {
      notes.unshift(["mtd", "i-info", "Limited companies are not part of Making Tax Digital for Income Tax. Your own Self Assessment return as a director is included."]);
    } else {
      notes.unshift(["info", "i-info", "Bookkeeping only: year-end accounts and tax returns are not included. Our other packages include them."]);
    }

    return { pkgKey: pkgKey, pkg: pkg, tierName: tierName, lines: lines, maybe: maybe, notes: notes, total: total };
  }

  function render() {
    var state = { type: value("type"), band: value("band"), vat: value("vat"), staff: value("staff") };

    form.querySelectorAll("fieldset.q").forEach(function (fs) {
      var name = fs.querySelector("input") ? fs.querySelector("input").name : "";
      fs.classList.toggle("is-answered", !!state[name]);
    });

    var words = BAND_WORDS[state.type] || BAND_WORDS.sole;
    bandLegend.textContent = words[0];
    bandHint.textContent = words[1];

    // Highlight the matching row in the fee tables.
    document.querySelectorAll(".fee-table tr.is-match").forEach(function (tr) {
      tr.classList.remove("is-match");
    });

    statementBody.textContent = "";
    statementBody.appendChild(progressList(state));

    if (!state.type) {
      statementFor.textContent = "Answer the questions to see it";
      statementBody.appendChild(el("p", "statement-empty", "Your package, its monthly fee and anything to add will appear here."));
      return;
    }
    var pkgKey = state.type === "both" ? "sole" : state.type;
    if (!state.band) {
      statementFor.textContent = typeLabel(state.type);
      var p = el("p", "statement-empty");
      p.appendChild(document.createTextNode("Fees for " + data.packages[pkgKey].name.toLowerCase() + " start at "));
      p.appendChild(el("strong", "", money(UI.fromFee(pkgKey)) + " a month"));
      p.appendChild(document.createTextNode(". Pick your turnover to see yours."));
      statementBody.appendChild(p);
      return;
    }

    var w = work(state);
    var row = document.querySelector("#panel-" + w.pkgKey + ' tr[data-band="' + state.band + '"]');
    if (row) {
      row.classList.add("is-match");
    }

    var forParts = [typeLabel(state.type), bandLabel(state.band)];
    if (state.vat === "yes") {
      forParts.push("VAT registered");
    }
    if (state.staff && state.staff !== "none") {
      forParts.push(staffInfo(state.staff).label.replace(/ people$/, "") + " staff");
    }
    statementFor.textContent = forParts.join(" · ");

    var ul = el("ul", "st-lines");
    w.lines.forEach(function (l) {
      ul.appendChild(line(l.name, l.sub, l.amount));
    });
    statementBody.appendChild(ul);

    var totalRow = el("div", "st-total");
    var tl = el("p", "st-total-label", "Each month");
    tl.appendChild(el("small", "", "plus VAT, by Direct Debit"));
    totalRow.appendChild(tl);
    totalRow.appendChild(el("p", "st-total-amount num", UI.money2.format(w.total)));
    statementBody.appendChild(totalRow);

    var complete = !!(state.vat && state.staff);
    statementBody.appendChild(el("p", "st-year", "That is " + money(w.total * 12) + " a year, or " + money(Math.round(w.total * 12 * (1 + data.vatRate))) + " with VAT." + (complete ? "" : " Answer the last questions to finish.")));

    if (w.maybe.length) {
      var mu = el("ul", "st-lines");
      w.maybe.forEach(function (l) {
        mu.appendChild(line(l.name, l.sub, l.amount, { maybe: true }));
      });
      statementBody.appendChild(mu);
    }

    var notes = el("ul", "st-notes");
    w.notes.forEach(function (n) {
      notes.appendChild(note(n[0], n[1], n[2]));
    });
    statementBody.appendChild(notes);

    var actions = el("div", "st-actions");
    var ask = el("a", "btn btn-ochre btn-block", "Ask about this package");
    ask.appendChild(UI.icon("i-arrow"));
    var params = new URLSearchParams();
    params.set("type", state.type);
    params.set("band", state.band);
    if (state.vat) {
      params.set("vat", state.vat);
    }
    if (state.staff) {
      params.set("staff", state.staff);
    }
    params.set("pkg", w.pkg.short + ": " + w.tierName + ", " + UI.money2.format(w.total) + " a month plus VAT");
    ask.href = "enquire.html?" + params.toString();
    var see = el("a", "btn btn-outline btn-block", "See what is included");
    see.href = "#" + w.pkgKey;
    actions.append(ask, see);
    statementBody.appendChild(actions);
  }

  form.addEventListener("change", render);
  form.addEventListener("reset", function () {
    window.setTimeout(render, 0);
  });
  form.addEventListener("submit", function (event) {
    event.preventDefault();
  });
  render();
})();
