/* The price page: which rate applies now, the price calculator, and the price tables, all from data.js. */
(function () {
  var D = window.Nightjar;
  var C = window.NightjarCore;
  var RATES = ["day", "evening", "night"];

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

  /* ---------- The three rates ---------- */

  function renderRates() {
    var box = document.querySelector("[data-rates]");
    if (!box) {
      return;
    }
    var now = C.rateAt();
    var icons = { day: "#i-sun", evening: "#i-sunset", night: "#i-moon" };
    box.textContent = "";
    RATES.forEach(function (k) {
      var li = el("li", "rate" + (k === now ? " is-now" : ""));
      var icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      icon.setAttribute("class", "icon rate-icon");
      icon.setAttribute("aria-hidden", "true");
      var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
      use.setAttribute("href", icons[k]);
      icon.appendChild(use);
      var h = el("h3", "", D.rates[k].label);
      if (k === now) {
        h.appendChild(el("span", "now-badge", "Now"));
      }
      li.append(icon, h, el("p", "", D.rates[k].hours));
      var lock = el("p", "rate-price");
      lock.appendChild(el("span", "", "Lock-out entry"));
      lock.appendChild(el("strong", "", C.money(D.jobs.lockout.prices[k])));
      li.appendChild(lock);
      li.appendChild(el("p", "rate-extra", k === "day" ? "Other jobs at the listed price" : "Other jobs +" + C.money(D.surcharge[k])));
      box.appendChild(li);
    });
  }

  /* ---------- Price tables ---------- */

  // Tables become stacked cards on phones, so the roles are set explicitly to keep them read as tables.
  function renderTable(box, group) {
    var keys = Object.keys(D.jobs).filter(function (k) {
      return D.jobs[k].group === group;
    });
    var shop = keys.every(function (k) {
      return D.jobs[k].shop;
    });
    var now = C.rateAt();
    var table = el("table", "price-table" + (shop ? " price-table-shop" : ""));
    table.setAttribute("role", "table");
    var thead = el("thead");
    thead.setAttribute("role", "rowgroup");
    var hr = el("tr");
    hr.setAttribute("role", "row");
    var th0 = el("th", "", "Job");
    th0.scope = "col";
    th0.setAttribute("role", "columnheader");
    hr.appendChild(th0);
    var cols = shop ? ["shop"] : RATES;
    cols.forEach(function (k) {
      var th = el("th", k === now && !shop ? "is-now" : "");
      th.scope = "col";
      th.setAttribute("role", "columnheader");
      th.textContent = shop ? "In the shop" : D.rates[k].label;
      if (k === now && !shop) {
        th.appendChild(el("span", "now-badge", "Now"));
      }
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    var tbody = el("tbody");
    tbody.setAttribute("role", "rowgroup");
    keys.forEach(function (k) {
      var job = D.jobs[k];
      var tr = el("tr");
      tr.setAttribute("role", "row");
      var th = el("th");
      th.scope = "row";
      th.setAttribute("role", "rowheader");
      th.appendChild(el("span", "job-name", job.name));
      var note = job.note;
      if (job.extra) {
        note += " Each extra lock on the same visit: " + C.money(job.extra) + ".";
      }
      th.appendChild(el("span", "job-note", note));
      tr.appendChild(th);
      cols.forEach(function (rate) {
        var td = el("td", rate === now && !shop ? "is-now" : "");
        td.setAttribute("role", "cell");
        td.setAttribute("data-label", shop ? "In the shop" : D.rates[rate].short);
        if (job.from) {
          td.appendChild(el("small", "", "from "));
        }
        td.appendChild(document.createTextNode(C.money(shop ? job.day : C.unitPrice(job, rate))));
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    box.textContent = "";
    box.appendChild(table);
  }

  function renderTravel() {
    var box = document.querySelector("[data-travel-table]");
    if (!box) {
      return;
    }
    var list = el("ul", "travel-list");
    Object.keys(D.bands).forEach(function (k) {
      var b = D.bands[k];
      var codes = Object.keys(D.districts).filter(function (c) {
        return D.districts[c].band === k;
      });
      var li = el("li", "travel-row band-" + k.toLowerCase());
      var key = el("span", "band-key", k);
      key.setAttribute("aria-hidden", "true");
      var text = el("div");
      text.appendChild(el("strong", "", b.name));
      text.appendChild(el("span", "", codes.join(", ")));
      li.append(key, text, el("span", "travel-price", b.travel ? "+" + C.money(b.travel) : "No charge"));
      list.appendChild(li);
    });
    box.textContent = "";
    box.appendChild(list);
  }

  document.querySelectorAll("[data-price-table]").forEach(function (box) {
    renderTable(box, box.getAttribute("data-price-table"));
  });
  renderTravel();
  renderRates();

  /* ---------- Calculator ---------- */

  var calc = document.querySelector("[data-calc]");
  if (!calc) {
    return;
  }
  var form = calc.querySelector("form");
  var select = form.elements.job;
  var countField = calc.querySelector("[data-count-field]");
  var areaNote = calc.querySelector("[data-calc-area]");

  // Job options, grouped as on the price list (keys are cut in the shop, so they are left out).
  Object.keys(D.groups).forEach(function (g) {
    if (g === "keys") {
      return;
    }
    var og = el("optgroup");
    og.label = D.groups[g];
    Object.keys(D.jobs).forEach(function (k) {
      if (D.jobs[k].group === g) {
        var o = el("option", "", D.jobs[k].name);
        o.value = k;
        og.appendChild(o);
      }
    });
    select.appendChild(og);
  });

  var params = new URLSearchParams(window.location.search);
  if (params.get("job") && D.jobs[params.get("job")] && !D.jobs[params.get("job")].shop) {
    select.value = params.get("job");
  }
  var saved = C.savedArea();
  if (params.get("area") && D.districts[params.get("area")]) {
    saved = params.get("area");
  }
  if (saved) {
    form.elements.postcode.value = saved;
  }

  function currentBand() {
    var raw = form.elements.postcode.value.trim();
    if (!raw) {
      areaNote.textContent = "Leave it empty for our home patch (no travel charge).";
      areaNote.classList.remove("is-bad");
      return "A";
    }
    var parsed = C.parsePostcode(raw);
    if (parsed.error) {
      areaNote.textContent = "That doesn't look like a postcode yet. Showing the home patch price.";
      areaNote.classList.add("is-bad");
      return "A";
    }
    var a = C.area(parsed.outward);
    if (!a) {
      areaNote.textContent = "We don't cover " + parsed.outward + ", sorry. Showing the home patch price.";
      areaNote.classList.add("is-bad");
      return "A";
    }
    areaNote.textContent = a.code + ", " + a.places + ": " + a.band.name.toLowerCase() + (a.band.travel ? ", " + C.money(a.band.travel) + " travel." : ", no travel charge.");
    areaNote.classList.remove("is-bad");
    return a.bandKey;
  }

  function update() {
    var key = select.value;
    var job = D.jobs[key];
    countField.hidden = !job.extra;
    var when = form.elements.when.value;
    var rate = when === "now" ? C.rateAt() : when;
    var count = job.extra ? +form.elements.count.value || 1 : 1;
    var q = C.quote(key, rate, count, currentBand());

    calc.querySelector("[data-rate-label]").textContent = D.rates[C.rateAt()].long;
    calc.querySelector("[data-calc-from]").textContent = q.from ? "From " : "";
    calc.querySelector("[data-calc-total]").textContent = C.money(q.total);
    calc.querySelector("[data-calc-job]").textContent = job.name + (q.count > 1 ? ", " + q.count + " locks" : "");
    var lines = calc.querySelector("[data-calc-lines]");
    lines.textContent = "";
    q.lines.forEach(function (line) {
      var row = el("div");
      row.append(el("dt", "", line[0]), el("dd", "", line[1] ? C.money(line[1]) : "£0"));
      lines.appendChild(row);
    });
    calc.querySelector("[data-calc-note]").textContent = (q.from ? "A starting price: the final one depends on what we find, and we agree it before we start. " : "") + "VAT included. " + job.note;
    var book = calc.querySelector("[data-calc-book]");
    var bookable = D.bookable.indexOf(key) !== -1;
    book.hidden = !bookable;
    book.href = "?job=" + key + "&count=" + q.count + "#quote";
  }

  // Up to six locks a visit (as the price works out): a number outside 1 to 6 is put back in range when the
  // field is left, so the field matches the price shown.
  form.elements.count.addEventListener("change", function () {
    var n = String(Math.max(1, Math.min(6, Math.floor(+form.elements.count.value) || 1)));
    if (form.elements.count.value !== n) {
      form.elements.count.value = n;
    }
  });
  form.addEventListener("input", update);
  form.addEventListener("change", update);
  form.addEventListener("submit", function (event) {
    event.preventDefault();
  });

  // "Book it for another day" fills in the quote form below with the same job.
  calc.querySelector("[data-calc-book]").addEventListener("click", function (event) {
    var quoteForm = document.querySelector("[data-quote-form]");
    if (!quoteForm || !window.NightjarQuote) {
      return;
    }
    event.preventDefault();
    window.NightjarQuote.prefill(select.value, +form.elements.count.value || 1, form.elements.postcode.value.trim());
    document.getElementById("quote").scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    quoteForm.elements.job.focus({ preventScroll: true });
  });

  update();
  window.setInterval(update, 60000);
})();
