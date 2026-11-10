/* The deadlines page: the next deadline, every deadline in the next twelve months grouped by month (with
   filters), and a limited company's own dates from its year end. All dates are worked out from today. */
(function () {
  var D = window.QuarterdayDates;
  var UI = window.QuarterdayUI;
  var el = UI.el;

  var today = D.today();
  var all = D.deadlines(today, 365);

  /* ---------- Next deadline ---------- */

  var nextCard = document.querySelector("[data-next-card]");
  var firstReal = UI.merged(all.filter(function (d) {
    return !d.monthly && d.cat !== "year";
  }))[0];
  if (nextCard && firstReal) {
    var n = D.daysBetween(today, firstReal.date);
    nextCard.textContent = "";
    nextCard.appendChild(el("p", "next-label", "Next deadline"));
    var days = el("p", "next-days");
    if (n === 0) {
      days.appendChild(el("span", "num", "Today"));
    } else {
      days.appendChild(el("span", "num", String(n)));
      days.appendChild(el("span", "", n === 1 ? "day to go" : "days to go"));
    }
    nextCard.appendChild(days);
    var what = el("p", "next-what", D.fmt.long.format(firstReal.date));
    what.appendChild(el("small", "", firstReal.title));
    nextCard.appendChild(what);
  }

  /* ---------- Month by month ---------- */

  var box = document.querySelector("[data-months]");
  var filterButtons = document.querySelectorAll("[data-filter]");
  // Tax year dates show under every filter.
  var SHOW = { all: null, sa: ["sa", "year"], mtd: ["mtd", "year"], payroll: ["payroll", "year"] };

  function renderMonths() {
    if (!box) {
      return;
    }
    box.textContent = "";
    var groups = [];
    all.forEach(function (item) {
      var key = item.date.getFullYear() + "-" + item.date.getMonth();
      var g = groups[groups.length - 1];
      if (!g || g.key !== key) {
        g = { key: key, date: item.date, items: [] };
        groups.push(g);
      }
      g.items.push(item);
    });
    var nextDone = false;
    groups.forEach(function (g) {
      var section = el("section", "month");
      section.setAttribute("aria-label", D.fmt.monthYear.format(g.date));
      var title = el("h3", "month-title", new Intl.DateTimeFormat("en-GB", { month: "long" }).format(g.date));
      title.appendChild(el("small", "", String(g.date.getFullYear())));
      section.appendChild(title);
      var list = el("ol", "deadline-list");
      g.items.forEach(function (item) {
        var isNext = !nextDone && !item.monthly && item.cat !== "year";
        if (isNext) {
          nextDone = true;
        }
        list.appendChild(UI.deadlineItem(item, { heading: "h4", next: isNext }));
      });
      section.appendChild(list);
      box.appendChild(section);
    });
  }

  function setFilter(value) {
    filterButtons.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === value));
    });
    var show = SHOW[value] || null;
    box.querySelectorAll(".month").forEach(function (m) {
      var visible = 0;
      m.querySelectorAll(".dl-item").forEach(function (li) {
        var on = !show || show.indexOf(li.getAttribute("data-cat")) > -1;
        li.hidden = !on;
        if (on) {
          visible++;
        }
      });
      m.hidden = visible === 0;
    });
    if (window.history.replaceState) {
      var url = new URL(window.location.href);
      if (value === "all") {
        url.searchParams.delete("show");
      } else {
        url.searchParams.set("show", value);
      }
      window.history.replaceState(null, "", url);
    }
  }

  renderMonths();
  filterButtons.forEach(function (b) {
    b.addEventListener("click", function () {
      setFilter(b.getAttribute("data-filter"));
    });
  });
  var wanted = new URLSearchParams(window.location.search).get("show");
  if (wanted && SHOW.hasOwnProperty(wanted)) {
    setFilter(wanted);
  }

  /* ---------- Company dates ---------- */

  var form = document.querySelector("[data-company]");
  if (!form) {
    return;
  }
  var daySel = form.querySelector("[data-co-day]");
  var monthSel = form.querySelector("[data-co-month]");
  var incInput = form.querySelector("[data-co-inc]");
  var out = form.querySelector("[data-co-result]");
  var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  for (var d = 1; d <= 31; d++) {
    var o = el("option", "", String(d));
    o.value = String(d);
    daySel.appendChild(o);
  }
  monthNames.forEach(function (name, i) {
    var o = el("option", "", name);
    o.value = String(i);
    monthSel.appendChild(o);
  });
  daySel.value = "31";
  monthSel.value = "2";
  incInput.max = D.isoDate(today);

  function row(title, rule, date, cls) {
    var r = el("div", "co-row" + (cls ? " " + cls : ""));
    r.appendChild(el("span", "co-row-title", title));
    r.appendChild(el("span", "co-row-rule", rule));
    var t = el("time", "co-row-date", D.fmt.short.format(date));
    t.setAttribute("datetime", D.isoDate(date));
    r.appendChild(t);
    var n = D.daysBetween(today, date);
    r.appendChild(el("span", "co-row-when", n < 0 ? "Passed" : D.countdown(date)));
    return r;
  }

  function render() {
    var day = +daySel.value;
    var month = +monthSel.value;
    var ye = D.lastYearEnd(day, month, today);
    var rows = D.companyDeadlines(ye).map(function (x) {
      return { title: x.title, rule: x.rule, date: x.date };
    });

    var inc = D.parseIso(incInput.value);
    if (incInput.value && (!inc || inc > today)) {
      incInput.setAttribute("aria-invalid", "true");
    } else {
      incInput.removeAttribute("aria-invalid");
    }
    if (inc && inc <= today) {
      var cs = D.nextConfirmation(inc, today);
      if (cs) {
        rows.push({ title: "Confirmation statement", rule: "Within 14 days of " + D.fmt.dayMonth.format(cs.review) + ", each year", date: cs.due });
      }
      var first = D.addMonths(inc, 21);
      if (first >= today) {
        rows.push({ title: "First accounts to Companies House", rule: "21 months after the company was set up", date: first });
      }
    }
    rows.sort(function (a, b) {
      return a.date - b.date;
    });

    out.textContent = "";
    var head = el("p", "co-ye");
    head.appendChild(document.createTextNode("For the year that ended on "));
    head.appendChild(el("strong", "", D.fmt.full.format(ye)));
    head.appendChild(document.createTextNode(". Your next year end is " + D.fmt.full.format(D.addMonths(ye, 12)) + "."));
    out.appendChild(head);
    var nextMarked = false;
    rows.forEach(function (r) {
      var past = r.date < today;
      var cls = past ? "is-past" : !nextMarked ? "is-next" : "";
      if (!past) {
        nextMarked = true;
      }
      out.appendChild(row(r.title, r.rule, r.date, cls));
    });
    if (incInput.getAttribute("aria-invalid")) {
      out.appendChild(el("p", "field-error", "That date is in the future. Use the date the company was registered."));
    }
  }

  form.addEventListener("change", render);
  form.addEventListener("input", render);
  form.addEventListener("submit", function (event) {
    event.preventDefault();
  });
  render();
})();
