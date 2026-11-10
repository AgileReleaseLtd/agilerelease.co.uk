/* The Making Tax Digital page: which start dates have passed, the checker (qualifying income against the
   threshold for a tax year), and the quarterly update deadlines for the tax year in progress. The rules
   come from data.js (mtd). Nothing typed here leaves the browser. */
(function () {
  var data = window.Quarterday;
  var D = window.QuarterdayDates;
  var UI = window.QuarterdayUI;
  var el = UI.el;
  var money = UI.money0.format;

  /* ---------- Timeline statuses ---------- */

  var phaseNodes = document.querySelectorAll("[data-phase-status]");
  UI.phaseStatuses().forEach(function (s) {
    phaseNodes.forEach(function (node) {
      if (node.getAttribute("data-phase-status") === s.phase.starts) {
        node.textContent = "";
        node.appendChild(el("span", "status-chip status-" + s.status, s.text));
        node.closest(".tl-phase").classList.toggle("is-now", s.status === "now");
      }
    });
  });

  /* ---------- Quarterly deadlines ---------- */

  function quarterDates(start) {
    return data.mtd.quarters.map(function (q, i) {
      var year = i < 2 ? start : start + 1; // Feb and May deadlines fall in the next calendar year
      return { label: q[0], date: new Date(year, q[1] - 1, q[2]) };
    });
  }

  function renderQuarters() {
    var body = document.querySelector("[data-q-rows]");
    if (!body) {
      return;
    }
    var today = D.today();
    var ty = D.taxYearStart(today);
    // Until the last update of last year is due (7 May), show last year's table.
    var prev = quarterDates(ty - 1);
    if (ty - 1 >= data.mtd.firstTaxYear && prev[3].date >= today) {
      ty = ty - 1;
    }
    ty = Math.max(ty, data.mtd.firstTaxYear);
    document.querySelector("[data-q-year]").textContent = D.taxYearLabel(ty);

    var rows = quarterDates(ty);
    var nextIndex = -1;
    rows.forEach(function (r, i) {
      if (nextIndex < 0 && r.date >= today) {
        nextIndex = i;
      }
    });
    body.textContent = "";
    rows.forEach(function (r, i) {
      var past = r.date < today;
      var tr = el("tr", past ? "is-past" : i === nextIndex ? "is-next" : "");
      var th = el("th", "", String(i + 1));
      th.scope = "row";
      tr.appendChild(th);
      tr.appendChild(el("td", "", r.label));
      var td = el("td");
      var time = el("time", "", D.fmt.full.format(r.date));
      time.setAttribute("datetime", D.isoDate(r.date));
      td.appendChild(time);
      tr.appendChild(td);
      var status = el("td");
      var chip;
      if (past) {
        chip = el("span", "q-chip q-chip-past", "Deadline passed");
      } else if (i === nextIndex) {
        chip = el("span", "q-chip q-chip-next", "Next: " + D.countdown(r.date).replace(/^In /, "in "));
      } else {
        chip = el("span", "q-chip q-chip-later", D.countdown(r.date));
      }
      status.appendChild(chip);
      tr.appendChild(status);
      body.appendChild(tr);
    });
  }

  renderQuarters();

  /* ---------- Checker ---------- */

  var form = document.querySelector("[data-checker]");
  if (!form) {
    return;
  }
  var result = form.querySelector("[data-checker-result]");
  var inputs = [form.elements.self, form.elements.rent];

  // "£32,500" or "32500.50" to a number; "" to 0; anything else to NaN.
  function parse(s) {
    var t = String(s || "").replace(/[£,\s]/g, "");
    if (!t) {
      return 0;
    }
    return /^\d+(\.\d{1,2})?$/.test(t) ? parseFloat(t) : NaN;
  }

  function bar(amount, threshold) {
    var max = Math.max(threshold * 1.6, amount * 1.08);
    var wrap = el("div", "ck-bar");
    var s = UI.svg("svg", { viewBox: "0 0 100 10", preserveAspectRatio: "none", "aria-hidden": "true" });
    var w = Math.max(0, Math.min(100, (amount / max) * 100));
    s.appendChild(UI.svg("rect", { "class": "ck-bar-fill" + (amount > threshold ? " is-over" : ""), x: 0, y: 0, width: w.toFixed(2), height: 10, rx: 0 }));
    var tx = ((threshold / max) * 100).toFixed(2);
    s.appendChild(UI.svg("line", { "class": "ck-bar-line", x1: tx, y1: -4, x2: tx, y2: 14, "vector-effect": "non-scaling-stroke" }));
    wrap.appendChild(s);
    return wrap;
  }

  function render() {
    var phase = data.mtd.phases[+form.elements.year.value];
    var values = inputs.map(function (input) {
      return parse(input.value);
    });
    var bad = false;
    inputs.forEach(function (input, i) {
      var invalid = isNaN(values[i]);
      bad = bad || invalid;
      if (invalid) {
        input.setAttribute("aria-invalid", "true");
      } else {
        input.removeAttribute("aria-invalid");
      }
    });

    result.textContent = "";
    if (bad) {
      result.appendChild(el("p", "field-error", "Use numbers only, like 32,500."));
      return;
    }
    if (!inputs[0].value.trim() && !inputs[1].value.trim()) {
      result.appendChild(el("p", "checker-empty", "Your qualifying income and what it means will appear here."));
      return;
    }

    var total = values[0] + values[1];
    var over = total > phase.threshold;
    var start = D.parseIso(phase.starts);
    var started = D.today() >= start;

    var sum = el("div", "ck-sum");
    sum.appendChild(el("span", "ck-sum-label", "Qualifying income, " + phase.taxYear));
    sum.appendChild(el("span", "num", money(total)));
    result.appendChild(sum);
    result.appendChild(bar(total, phase.threshold));
    var key = el("div", "ck-bar-key");
    key.appendChild(el("span", "", "£0"));
    key.appendChild(el("span", "", "Threshold: more than " + money(phase.threshold)));
    result.appendChild(key);

    var verdict = el("div", "ck-verdict " + (over ? "is-in" : "is-out"));
    verdict.appendChild(UI.icon(over ? "i-calendar" : "i-check"));
    var text = el("div");
    var p = el("p");
    var dateText = D.fmt.full.format(start);
    if (over) {
      p.appendChild(el("strong", "", started ? "You should be using MTD since " + dateText : "You will need MTD from " + dateText));
      p.appendChild(document.createTextNode(money(total) + " is more than " + money(phase.threshold) + " for " + phase.taxYear + ". HMRC usually writes to tell you, but it is up to you to check." + (started ? " If you have not signed up yet, you still can: talk to us." : "")));
    } else {
      p.appendChild(el("strong", "", "Not from these figures"));
      var why = money(total) + " is not more than the " + money(phase.threshold) + " threshold for " + phase.taxYear + ".";
      var i = data.mtd.phases.indexOf(phase);
      var later = data.mtd.phases[i + 1];
      if (later) {
        why += " The threshold is lower for " + later.taxYear + ": more than " + money(later.threshold) + ", from " + D.fmt.full.format(D.parseIso(later.starts)) + ". Check again with that year's figures.";
      } else {
        why += " No lower threshold has been announced yet. We would check again each year.";
      }
      p.appendChild(document.createTextNode(why));
    }
    text.appendChild(p);
    verdict.appendChild(text);
    result.appendChild(verdict);

    var more = el("p", "ck-more");
    more.appendChild(document.createTextNode("Wages, dividends, partnership profits and pensions do not count. "));
    var link = el("a", "", "See our MTD packages");
    link.href = "packages.html#finder";
    more.appendChild(link);
    result.appendChild(more);
  }

  form.addEventListener("input", render);
  form.addEventListener("change", render);
  form.addEventListener("submit", function (event) {
    event.preventDefault();
  });
  render();
})();
