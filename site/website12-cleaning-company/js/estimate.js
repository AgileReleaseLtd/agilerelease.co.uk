/* The estimate page: the four questions, and the estimate card with its breakdown. The sums are in
   price.js; the prices are in data.js. The answers are kept in the address, so an estimate can be
   bookmarked, shared or carried to the booking page. */
(function () {
  var data = window.Tessel;
  var P = window.TesselPrice;
  var site = window.TesselSite;
  var el = site.el;
  var icon = site.icon;

  var form = document.querySelector("[data-estimate-form]");
  if (!form) {
    return;
  }

  var extrasBox = form.querySelector("[data-extras]");
  var includedNote = form.querySelector("[data-included]");
  var extrasHint = form.querySelector("[data-extras-hint]");
  var sizeHome = form.querySelector("[data-size-home]");
  var sizeOffice = form.querySelector("[data-size-office]");
  var sizeTitle = form.querySelector("[data-size-title]");
  var furnishedField = form.querySelector("[data-furnished-field]");
  var oftenStep = form.querySelector("[data-often]");
  var freqBox = form.querySelector("[data-freq]");
  var visitsBox = form.querySelector("[data-visits]");
  var sizeInput = form.elements.size;
  var sizeLabel = form.querySelector("[data-size-label]");
  var sizeHint = form.querySelector("[data-size-hint]");

  var result = document.querySelector(".result");
  var priceOut = result.querySelector("[data-result-price]");
  var metaOut = result.querySelector("[data-result-meta]");
  var firstOut = result.querySelector("[data-result-first]");
  var breakdown = result.querySelector("[data-result-breakdown]");
  var hintOut = result.querySelector("[data-result-hint]");
  var statusOut = result.querySelector("[data-result-status]");
  var bookLink = result.querySelector("[data-book-link]");
  var photosButton = result.querySelector("[data-send-photos]");
  var bar = document.querySelector("[data-price-bar]");

  var state = P.fromParams(window.location.search);
  var renderedService = null;
  var current = null; // the latest estimate

  /* ---------- Labels from data.js ---------- */

  form.querySelectorAll("[data-rate]").forEach(function (node) {
    node.textContent = P.money(data.services.regular.rates[node.getAttribute("data-rate")]) + " an hour";
  });
  form.querySelectorAll("[data-visit-rate]").forEach(function (node) {
    var o = data.services.office;
    node.textContent = P.money(+node.getAttribute("data-visit-rate") >= o.busyVisits ? o.rates.busy : o.rates.standard) + " an hour";
  });
  form.querySelector("[data-furnished-price]").textContent = "+" + P.money(data.services.tenancy.furnished.price);

  /* ---------- Extras ---------- */

  function sideText(cfg, service) {
    if (cfg.each) {
      return P.money(cfg.each) + " a room";
    }
    if (cfg.price) {
      return "+" + P.money(cfg.price);
    }
    if (cfg.perBedroom) {
      return "+" + P.hours(cfg.perBedroom) + " a bed";
    }
    return "+" + P.hours(cfg.hours) + (cfg.count ? " each" : "");
  }

  function whenText(cfg, service) {
    if (service === "tenancy" || (service === "regular" && state.freq === "oneoff")) {
      return "";
    }
    return cfg.once ? "First visit" : "Every visit";
  }

  function renderExtras() {
    var service = state.service;
    var list = P.extrasFor(service);
    extrasBox.textContent = "";
    var included = [];
    list.forEach(function (x) {
      if (x.included) {
        included.push(x.name.charAt(0).toLowerCase() + x.name.slice(1));
        return;
      }
      var wrap = el("div", "extra");
      var label = el("label", "choice");
      var input = el("input");
      input.type = "checkbox";
      input.name = "x-" + x.id;
      input.value = x.id;
      input.checked = !!state.extras[x.id];
      var body = el("span", "choice-body");
      body.appendChild(el("span", "choice-title", x.name));
      var note = x.note;
      var when = whenText(x.cfg, service);
      body.appendChild(el("span", "choice-note", note + "."));
      if (when) {
        body.appendChild(el("span", "choice-when", when));
      }
      label.append(input, body, el("span", "choice-side", sideText(x.cfg, service)));
      wrap.appendChild(label);

      if (x.cfg.count) {
        var row = el("div", "extra-count");
        var id = "count-" + x.id;
        var lab = el("label", "", x.cfg.count.label);
        lab.htmlFor = id;
        var select = el("select");
        select.id = id;
        select.name = "n-" + x.id;
        for (var n = 1; n <= x.cfg.count.max; n++) {
          var opt = el("option", "", String(n));
          opt.value = String(n);
          select.appendChild(opt);
        }
        select.value = String(state.extras[x.id] || 1);
        row.append(lab, select);
        row.hidden = !input.checked;
        wrap.classList.toggle("has-count", input.checked);
        wrap.appendChild(row);
      }
      extrasBox.appendChild(wrap);
    });

    includedNote.hidden = !included.length;
    if (included.length) {
      var words = included.slice(0, -1).join(", ") + " and " + included[included.length - 1];
      includedNote.querySelector("span").textContent = "Already included: " + words + ".";
    }
    extrasHint.hidden = service === "tenancy" || (service === "regular" && state.freq === "oneoff");
    renderedService = service + (service === "regular" ? ":" + state.freq : "");
  }

  /* ---------- Reading and writing the form ---------- */

  function checkedValue(name) {
    var input = form.querySelector('input[name="' + name + '"]:checked');
    return input ? input.value : null;
  }

  function setChecked(name, value) {
    form.querySelectorAll('input[name="' + name + '"]').forEach(function (input) {
      input.checked = input.value === String(value);
    });
  }

  function readForm() {
    var extras = {};
    extrasBox.querySelectorAll('input[type="checkbox"]').forEach(function (input) {
      if (input.checked) {
        var select = extrasBox.querySelector('select[name="n-' + input.value + '"]');
        extras[input.value] = select ? +select.value : 1;
      }
    });
    var size = parseInt(sizeInput.value, 10);
    return P.normalise({
      service: checkedValue("service"),
      beds: checkedValue("beds"),
      baths: checkedValue("baths"),
      freq: checkedValue("freq"),
      furnished: form.elements.furnished.checked,
      unit: checkedValue("unit"),
      size: isNaN(size) ? 0 : size,
      toilets: checkedValue("toilets"),
      visits: checkedValue("visits"),
      extras: extras
    });
  }

  function writeForm() {
    setChecked("service", state.service);
    setChecked("beds", state.beds);
    setChecked("baths", state.baths);
    setChecked("freq", state.freq);
    setChecked("unit", state.unit);
    setChecked("toilets", state.toilets);
    setChecked("visits", state.visits);
    form.elements.furnished.checked = state.furnished;
    sizeInput.value = state.size ? String(state.size) : "";
  }

  function showSections() {
    var s = state.service;
    sizeHome.hidden = s === "office";
    sizeOffice.hidden = s !== "office";
    furnishedField.hidden = s !== "tenancy";
    sizeTitle.textContent = s === "office" ? "How big is your office?" : s === "tenancy" ? "How big is the home?" : "How big is your home?";
    oftenStep.hidden = s === "tenancy";
    freqBox.hidden = s !== "regular";
    visitsBox.hidden = s !== "office";
    var desks = state.unit === "desks";
    sizeLabel.textContent = desks ? "Number of desks" : "Floor area in m²";
    sizeHint.textContent = desks
      ? "We count about " + data.services.office.m2PerDesk + " m² for each desk, kitchen and meeting space included."
      : "The floor area you rent, kitchen, toilets and meeting rooms included.";
  }

  /* ---------- The estimate card ---------- */

  // One fact under the price. The hidden full stop keeps screen readers from running the facts together.
  function metaItem(iconId, text) {
    var span = el("span");
    span.appendChild(icon(iconId));
    span.appendChild(document.createTextNode(text));
    span.appendChild(el("span", "visually-hidden", ". "));
    return span;
  }

  function renderResult() {
    var r = P.estimate(state);
    current = r;
    priceOut.textContent = "";
    metaOut.textContent = "";
    breakdown.textContent = "";
    firstOut.hidden = true;

    var params = P.toParams(state);
    if (window.history.replaceState) {
      window.history.replaceState(null, "", "?" + params);
    }

    if (r.error) {
      priceOut.appendChild(el("strong", "", "Ask us"));
      metaOut.appendChild(metaItem("i-info", "We need a little more to go on"));
      var err = el("p", "form-error");
      err.appendChild(icon("i-alert"));
      err.appendChild(el("span", "", r.error));
      breakdown.appendChild(err);
      hintOut.textContent = "";
      bookLink.hidden = true;
      photosButton.lastChild.textContent = " Message us for a price";
      statusOut.textContent = r.error;
      bar.querySelector("[data-bar-price]").textContent = "Ask us for a price";
      bar.querySelector("[data-bar-hours]").textContent = "";
      return;
    }

    bookLink.hidden = false;
    photosButton.lastChild.textContent = " Send photos to confirm";
    priceOut.appendChild(el("strong", "", P.money(r.price)));
    priceOut.appendChild(document.createTextNode(" "));
    priceOut.appendChild(el("span", "", r.per));

    var timeText = r.service === "tenancy" ? "About " + P.hours(r.hours) + " on site" : P.hours(r.hours) + (r.per === "a visit" ? " a visit" : "");
    metaOut.appendChild(metaItem("i-clock", timeText));
    metaOut.appendChild(metaItem("i-people", r.crew.charAt(0).toUpperCase() + r.crew.slice(1)));
    if (r.month) {
      metaOut.appendChild(metaItem("i-calendar", "About " + P.money(r.month.price) + " a month"));
    }

    if (r.first) {
      firstOut.hidden = false;
      firstOut.textContent = r.service === "regular"
        ? "First visit " + P.money(r.first.price) + " (" + P.hours(r.first.hours) + "). The first clean in any home takes longer."
        : "First visit " + P.money(r.first.price) + " (" + P.hours(r.first.hours) + "), with the extras.";
    }

    r.sections.forEach(function (section) {
      var box = el("div", "receipt");
      box.appendChild(el("h3", "", section.title));
      var dl = el("dl");
      section.rows.concat([Object.assign({}, section.total, { kind: "total" })]).forEach(function (row) {
        var div = el("div", "receipt-row" + (row.kind ? " is-" + row.kind : ""));
        div.appendChild(el("dt", "", row.label));
        div.appendChild(el("dd", "", row.value));
        dl.appendChild(div);
      });
      box.appendChild(dl);
      breakdown.appendChild(box);
    });

    hintOut.textContent = r.hint || "";
    bookLink.href = "book.html?" + params;

    var short = P.money(r.price) + (r.per === "a visit" ? " a visit" : "");
    statusOut.textContent = "Estimate: " + short + ", " + timeText.toLowerCase() + ".";
    bar.querySelector("[data-bar-price]").textContent = short;
    bar.querySelector("[data-bar-hours]").textContent = timeText;
  }

  function update() {
    state = readForm();
    var key = state.service + (state.service === "regular" ? ":" + state.freq : "");
    if (key !== renderedService) {
      renderExtras();
    }
    showSections();
    renderResult();
  }

  /* ---------- Events ---------- */

  form.addEventListener("change", function (event) {
    var t = event.target;
    if (t.name === "unit") {
      // Keep roughly the same office when switching between desks and square metres.
      var per = data.services.office.m2PerDesk;
      var n = parseInt(sizeInput.value, 10);
      if (!isNaN(n) && n > 0) {
        sizeInput.value = String(t.value === "m2" ? n * per : Math.max(1, Math.round(n / per)));
      }
    }
    if (t.type === "checkbox" && t.name.indexOf("x-") === 0) {
      var wrap = t.closest(".extra");
      var row = wrap.querySelector(".extra-count");
      if (row) {
        row.hidden = !t.checked;
        wrap.classList.toggle("has-count", t.checked);
      }
    }
    update();
  });

  sizeInput.addEventListener("input", update);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
  });

  photosButton.addEventListener("click", function () {
    var a = current.answers;
    var lines = current.error
      ? ["Hi " + data.short + ", could you give me a price for an office clean?", "", "Office: " + P.sizeLine(a)]
      : [
        "Hi " + data.short + ", here's my estimate from your website. I'll send photos of the rooms so you can confirm the price.",
        "",
        "Clean: " + P.serviceLine(a),
        "Size: " + P.sizeLine(a)
      ];
    var extras = P.extrasLine(a);
    if (extras) {
      lines.push("Extras: " + extras);
    }
    if (!current.error) {
      lines.push("Estimate: " + P.priceLine(current));
    }
    site.sendMessage({ title: "Your message", text: lines.join("\n"), againLabel: "Back to the estimate", returnFocus: photosButton });
  });

  // Phones: the price bar steps aside while the estimate card is on screen.
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        bar.classList.toggle("is-away", entry.isIntersecting);
      });
    }, { threshold: 0.15 }).observe(result);
  }

  /* ---------- Start ---------- */

  writeForm();
  renderExtras();
  showSections();
  renderResult();
})();
