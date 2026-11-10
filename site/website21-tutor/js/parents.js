/* The fees and information page: fee tables from data.js, the term fee calculator (sessions in the term,
   the sibling discount, monthly payments, and a booking message), this year's term dates, the online lesson
   checklist and the safeguarding contacts. */
(function () {
  var data = window.Markwell;
  var D = window.MarkwellDates;
  var el = window.MarkwellSite.el;
  var now = new Date();

  var MAX_ROWS = 6;
  var CHILDREN = 3;

  function svgIcon(id) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "icon");
    svg.setAttribute("aria-hidden", "true");
    var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
  }

  // The next term that runs from start to end after today (for "a whole term" prices).
  function nextWholeTerm() {
    var today = D.startOfDay(now);
    return D.allTerms(now).filter(function (t) {
      return t.start > today;
    })[0];
  }

  // Sessions in a whole term for a class on a Tuesday (no bank holidays fall on a Tuesday in term).
  function typicalSessions(t) {
    return D.sessionsInTerm({ day: 2, start: "17:00" }, t).length;
  }

  /* ---------- Fee tables ---------- */

  function feeTables() {
    var group = document.querySelector("[data-group-fees] tbody");
    var one = document.querySelector("[data-one-fees] tbody");
    var t = nextWholeTerm();
    var n = typicalSessions(t);
    if (group) {
      document.querySelector("[data-term-head]").textContent = "A term";
      group.textContent = "";
      Object.keys(data.groupFees).forEach(function (key) {
        var fee = data.groupFees[key];
        var tr = el("tr");
        var th = el("th", "", fee.label);
        th.scope = "row";
        th.appendChild(el("span", "fee-sub", fee.minutes + " minutes"));
        tr.append(th, el("td", "", D.money(fee.price)), el("td", "", D.money(fee.price * n)));
        group.appendChild(tr);
      });
      document.querySelector("[data-term-foot]").textContent = "A term here is the " + t.label + ": " + n + " weeks of classes, one a week. Terms have 10 to 14 weeks, and Monday classes in the summer term have one session fewer because of the May bank holiday. Join part-way through a term and you pay only for the sessions left.";
    }
    if (one) {
      one.textContent = "";
      data.oneToOne.forEach(function (row) {
        var tr = el("tr");
        var th = el("th", "", row.label);
        th.scope = "row";
        tr.append(th, el("td", "", D.money(row.price)));
        one.appendChild(tr);
      });
    }
  }

  /* ---------- Fee calculator ---------- */

  var calc = {
    rows: document.querySelector("[data-calc-rows]"),
    terms: document.querySelector("[data-calc-terms]"),
    add: document.querySelector("[data-calc-add]"),
    lines: document.querySelector("[data-calc-lines]"),
    total: document.querySelector("[data-calc-total]"),
    instal: document.querySelector("[data-calc-instal]"),
    termLabel: document.querySelector("[data-calc-term-label]"),
    book: document.querySelector("[data-calc-book]"),
    error: document.querySelector("[data-calc-error]")
  };
  var rowCount = 0;
  var termOptions = [];

  function setupTerms() {
    var current = D.currentTerm(now);
    var upcoming = nextWholeTerm();
    termOptions = [];
    if (current) {
      termOptions.push({ term: current, from: now, label: current.label, sub: "The sessions left, from today" });
    }
    termOptions.push({ term: upcoming, from: null, label: upcoming.label, sub: "The whole term, from " + D.fmt.dayMonth.format(upcoming.start) });
    if (!current) {
      var after = D.nextTerm(D.addDays(upcoming.end, 1));
      termOptions.push({ term: after, from: null, label: after.label, sub: "The whole term, from " + D.fmt.dayMonth.format(after.start) });
    }
    termOptions.forEach(function (opt, i) {
      var label = el("label", "choice choice-compact");
      var input = el("input");
      input.type = "radio";
      input.name = "calc-term";
      input.value = String(i);
      input.checked = i === 0;
      var body = el("span", "choice-body");
      body.append(el("strong", "", opt.label), el("span", "", opt.sub));
      label.append(input, body);
      calc.terms.appendChild(label);
    });
  }

  function chosenTerm() {
    var checked = calc.terms.querySelector("input:checked");
    return termOptions[checked ? +checked.value : 0];
  }

  // Sessions of class c in the chosen term (from today if it is the current term).
  function sessionsFor(c, opt) {
    if (opt.from) {
      return D.termFee(c, opt.term, now).sessions;
    }
    return D.sessionsInTerm(c, opt.term).length;
  }

  function classOptions(select) {
    select.appendChild(el("option", "", "Choose a class"));
    select.firstChild.value = "";
    ["maths", "english", "science", "elevenplus"].forEach(function (subject) {
      var group = el("optgroup");
      group.label = data.subjects[subject].name;
      data.classes.filter(function (c) {
        return c.subject === subject;
      }).forEach(function (c) {
        var full = D.placesLeft(c) === 0;
        var o = el("option", "", c.title + ", " + D.yearsLabel(c.from, c.to) + " · " + D.DAY_NAMES[c.day].slice(0, 3) + " " + D.time(c.start) +
          " · " + D.money(data.groupFees[c.fee].price) + (full ? " (full)" : ""));
        o.value = c.id;
        group.appendChild(o);
      });
      select.appendChild(group);
    });
  }

  function addRow(preset) {
    if (rowCount >= MAX_ROWS) {
      return;
    }
    rowCount += 1;
    var n = rowCount;
    var li = el("li", "calc-row");

    var childField = el("div", "field field-child");
    var childLabel = el("label", "field-label", "Child");
    childLabel.htmlFor = "calc-child-" + n;
    var child = el("select");
    child.id = "calc-child-" + n;
    child.setAttribute("data-calc-child", "");
    for (var i = 1; i <= CHILDREN; i++) {
      var o = el("option", "", "Child " + i);
      o.value = String(i);
      child.appendChild(o);
    }
    child.value = preset && preset.child ? String(preset.child) : "1";
    childField.append(childLabel, child);

    var classField = el("div", "field field-class");
    var classLabel = el("label", "field-label", "Class");
    classLabel.htmlFor = "calc-class-" + n;
    var cls = el("select");
    cls.id = "calc-class-" + n;
    cls.setAttribute("data-calc-class", "");
    classOptions(cls);
    if (preset && preset.cls) {
      cls.value = preset.cls;
    }
    classField.append(classLabel, cls);

    var remove = el("button", "icon-btn");
    remove.type = "button";
    remove.setAttribute("aria-label", "Remove this class");
    remove.appendChild(svgIcon("i-trash"));
    remove.addEventListener("click", function () {
      var prev = li.previousElementSibling || li.nextElementSibling;
      li.remove();
      rowCount = calc.rows.children.length;
      if (!rowCount) {
        addRow();
      }
      update();
      var focusTarget = prev && prev.isConnected ? prev.querySelector("select") : calc.add;
      focusTarget.focus();
    });

    li.append(childField, classField, remove);
    calc.rows.appendChild(li);
    update();
    return li;
  }

  // Works out the fees: each class's sessions times its price, then 10% off every child after the one
  // with the highest fees.
  function work() {
    var opt = chosenTerm();
    var items = [];
    calc.rows.querySelectorAll(".calc-row").forEach(function (row) {
      var c = D.classById(row.querySelector("[data-calc-class]").value);
      if (!c) {
        return;
      }
      var sessions = sessionsFor(c, opt);
      var price = data.groupFees[c.fee].price;
      items.push({ child: +row.querySelector("[data-calc-child]").value, c: c, sessions: sessions, price: price, cost: sessions * price });
    });
    var byChild = {};
    items.forEach(function (it) {
      byChild[it.child] = (byChild[it.child] || 0) + it.cost;
    });
    var kids = Object.keys(byChild).map(Number).sort(function (a, b) {
      return byChild[b] - byChild[a] || a - b;
    });
    var discounts = kids.slice(1).map(function (k) {
      return { child: k, amount: Math.round(byChild[k] * data.siblingDiscount * 100) / 100 };
    });
    var subtotal = items.reduce(function (s, it) { return s + it.cost; }, 0);
    var off = discounts.reduce(function (s, d) { return s + d.amount; }, 0);
    return { opt: opt, items: items, discounts: discounts, total: Math.round((subtotal - off) * 100) / 100 };
  }

  function update() {
    if (!calc.lines) {
      return;
    }
    var r = work();
    calc.termLabel.textContent = r.opt.label + ": " + r.opt.sub.toLowerCase() + ".";
    calc.lines.textContent = "";
    if (!r.items.length) {
      calc.lines.appendChild(el("li", "is-empty", "Choose a class to see its fees."));
    }
    var several = r.items.some(function (it) { return it.child !== r.items[0].child; });
    r.items.forEach(function (it) {
      var li = el("li");
      li.append(el("span", "", (several ? "Child " + it.child + ": " : "") + it.c.title + ", " + D.DAY_NAMES[it.c.day].slice(0, 3) +
        " · " + it.sessions + " × " + D.money(it.price) + (D.placesLeft(it.c) ? "" : " (full: waiting list)")), el("span", "", D.money(it.cost)));
      calc.lines.appendChild(li);
    });
    r.discounts.forEach(function (d) {
      var li = el("li", "is-discount");
      li.append(el("span", "", "Sibling discount, child " + d.child + " (" + Math.round(data.siblingDiscount * 100) + "%)"), el("span", "", "−" + D.money(d.amount)));
      calc.lines.appendChild(li);
    });
    calc.total.textContent = D.money(r.total);
    calc.instal.textContent = r.total ? "Or " + data.instalments + " monthly payments of " + D.money(Math.ceil(r.total / data.instalments * 100) / 100) + "." : "";
    calc.add.disabled = rowCount >= MAX_ROWS;
    calc.error.hidden = true;
  }

  function bookingMessage(r) {
    var lines = ["Hello Markwell Tuition, we would like to book these places for the " + r.opt.label + ":", ""];
    var several = r.items.some(function (it) { return it.child !== r.items[0].child; });
    r.items.forEach(function (it) {
      lines.push((several ? "Child " + it.child + ": " : "") + it.c.title + " (" + D.yearsLabel(it.c.from, it.c.to) + "), " + D.DAY_NAMES[it.c.day] + " " +
        D.time(it.c.start) + ", " + it.sessions + " sessions, " + D.money(it.cost) + (D.placesLeft(it.c) ? "" : " (full: please add us to the waiting list)"));
    });
    r.discounts.forEach(function (d) {
      lines.push("Sibling discount for child " + d.child + ": −" + D.money(d.amount));
    });
    lines.push("");
    lines.push("Total: " + D.money(r.total) + " (or " + data.instalments + " monthly payments of " + D.money(Math.ceil(r.total / data.instalments * 100) / 100) + ")");
    lines.push("Please confirm the places and send the invoice. Thank you.");
    return lines.join("\n");
  }

  function setupCalculator() {
    if (!calc.rows) {
      return;
    }
    setupTerms();
    var params = new URLSearchParams(window.location.search);
    addRow({ cls: D.classById(params.get("class")) ? params.get("class") : "" });
    calc.add.addEventListener("click", function () {
      var row = addRow({ child: 1 });
      if (row) {
        row.querySelector("[data-calc-class]").focus();
      }
    });
    calc.terms.addEventListener("change", update);
    calc.rows.addEventListener("change", update);

    var dialog = document.getElementById("book-dialog");
    calc.book.addEventListener("click", function () {
      var r = work();
      if (!r.items.length) {
        calc.error.hidden = false;
        calc.rows.querySelector("[data-calc-class]").focus();
        return;
      }
      var text = bookingMessage(r);
      dialog.querySelector("[data-email-link]").href = "mailto:" + data.email + "?subject=" + encodeURIComponent("Booking for the " + r.opt.label) + "&body=" + encodeURIComponent(text);
      if (!data.sample) {
        var url = "https://wa.me/" + data.whatsapp + "?text=" + encodeURIComponent(text);
        var opened = window.open(url, "_blank");
        if (opened) {
          opened.opener = null;
        } else {
          window.location.href = url;
        }
        return;
      }
      dialog.querySelector("[data-message]").textContent = text;
      dialog.showModal();
      dialog.querySelector("#book-title").focus();
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
    update();
  }

  /* ---------- Term dates ---------- */

  function termDates() {
    var box = document.querySelector("[data-terms]");
    if (!box) {
      return;
    }
    var current = D.currentTerm(now);
    var joinable = D.joinableTerm(now);
    // The school year that holds the current (or next) term.
    var startYear = joinable.season === "autumn" ? joinable.start.getFullYear() : joinable.start.getFullYear() - 1;
    var terms = D.termsOfYear(startYear);
    document.querySelector("[data-terms-title]").textContent = "Term dates for " + startYear + " to " + (startYear + 1);
    box.textContent = "";
    terms.forEach(function (t) {
      var isNow = current && current.id === t.id;
      var tile = el("article", "term-tile" + (isNow ? " is-current" : ""));
      tile.appendChild(el("h3", "", t.label));
      var past = t.end < D.startOfDay(now);
      tile.appendChild(el("span", "term-tag", isNow ? "This term" : past ? "Finished" : D.nextTerm(now).id === t.id ? "Next term" : "Coming up"));
      var dl = el("dl");
      function row(k, v) {
        var div = el("div");
        div.append(el("dt", "", k), el("dd", "", v));
        dl.appendChild(div);
      }
      row("First classes", D.fmt.short.format(t.start));
      row("Half-term", D.range(t.halfStart, t.halfEnd));
      t.bankHolidays.forEach(function (b) {
        row("Bank holiday", D.fmt.short.format(b));
      });
      row("Last classes", D.fmt.short.format(t.end));
      row("Weeks of classes", String(D.termWeeks(t).total));
      tile.appendChild(dl);
      box.appendChild(tile);
    });

    var rebook = document.querySelector("[data-rebook]");
    if (rebook) {
      rebook.textContent = "";
      var p = el("p");
      p.appendChild(svgIcon("i-calendar"));
      var span = el("span");
      if (current) {
        // In term: current pupils rebook for the next term by a date three weeks before this one ends.
        var next = D.nextTerm(current.end);
        var by = D.addDays(current.end, -7 * data.termRules.rebookWeeksBeforeEnd);
        span.append(el("strong", "", "Booking for the " + next.label + ": "), document.createTextNode(by >= D.startOfDay(now) ?
          "current pupils keep their place if they rebook by " + D.fmt.long.format(by) + ". After that, free places go to the waiting list and new families." :
          "places not rebooked by current pupils are now open to new families."));
      } else {
        // In the holidays: the term about to start is open.
        span.append(el("strong", "", "Booking for the " + joinable.label + ": "),
          document.createTextNode("places are open now. Book a free trial first if your child is new to us."));
      }
      p.appendChild(span);
      rebook.appendChild(p);
    }
  }

  /* ---------- Online checklist ---------- */

  function checklist() {
    var box = document.querySelector("[data-checklist]");
    if (!box) {
      return;
    }
    var boxes = box.querySelectorAll('input[name="ready"]');
    var count = box.querySelector("[data-checklist-count]");
    var done = box.querySelector("[data-checklist-done]");
    function update() {
      var n = Array.prototype.filter.call(boxes, function (b) { return b.checked; }).length;
      count.textContent = n + " of " + boxes.length + " ready";
      count.classList.toggle("is-ready", n === boxes.length);
      done.hidden = n !== boxes.length;
    }
    boxes.forEach(function (b) {
      b.addEventListener("change", update);
    });
    update();
  }

  /* ---------- Safeguarding contacts ---------- */

  function safeguarding() {
    var box = document.querySelector("[data-dsl]");
    if (!box) {
      return;
    }
    box.textContent = "";
    [["lead", "Designated safeguarding lead"], ["deputy", "Deputy safeguarding lead"]].forEach(function (pair) {
      var t = data.tutors[data.safeguarding[pair[0]]];
      var row = el("div", "dsl-person");
      var mono = el("span", "monogram m-" + t.colour, t.initial);
      mono.setAttribute("aria-hidden", "true");
      var p = el("p");
      p.append(el("strong", "", t.name + ", " + t.role), el("span", "", pair[1]));
      row.append(mono, p);
      box.appendChild(row);
    });
  }

  feeTables();
  setupCalculator();
  termDates();
  checklist();
  safeguarding();
})();
