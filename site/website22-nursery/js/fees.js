/* The fees page: the fee calculator (age, days and sessions, funded hours, optional extras, Tax-Free Childcare),
   and the optional-extras table. Prices and funding rules come from data.js. Every figure is an estimate.

   How the estimate works:
   - booked hours a week = the sessions chosen in the planner;
   - funded hours a week = 15 or 30 in each of the 38 term weeks, or the same yearly hours spread over the
     51 weeks we are open (stretched); only booked hours can be funded;
   - paid hours are charged at the room's hourly rate; food and nappies are added if chosen;
   - a month = (term weeks x a term week + other weeks x a holiday week) / 12, or 51 x a week / 12 if stretched. */
(function () {
  var data = window.ButtonTin;
  var BT = window.BT;
  var el = BT.el;
  var F = data.funding;

  renderExtras();

  var form = document.querySelector("[data-calc]");
  if (!form) {
    return;
  }

  var agesBox = form.querySelector("[data-ages]");
  var schemesBox = form.querySelector("[data-schemes]");
  var schemeNote = form.querySelector("[data-scheme-note]");
  var takeBox = form.querySelector("[data-take]");
  var plannerTotal = form.querySelector("[data-planner-total]");
  var nappiesChoice = form.elements.nappies;

  var result = document.querySelector("[data-result]");
  var roomLine = result.querySelector("[data-result-room]");
  var totalEl = result.querySelector("[data-total]");
  var perEl = result.querySelector("[data-total-per]");
  var invoice = result.querySelector("[data-invoice]");
  var tipBox = result.querySelector("[data-tip]");
  var tfcBox = result.querySelector("[data-tfc]");
  var joinLink = result.querySelector("[data-join]");
  var bar = document.querySelector("[data-calc-bar]");
  var barTotal = bar ? bar.querySelector("[data-bar-total]") : null;

  /* ---------- Start state, from the URL if a parent shared or reloaded it ---------- */

  var params = new URLSearchParams(window.location.search);
  var state = {
    age: ageById(params.get("age")) ? params.get("age") : "two",
    pattern: BT.parsePattern(params.get("pattern")) || ["full", "full", "", "full", ""],
    scheme: params.get("fund") || "working",
    take: params.get("take") === "stretch" ? "stretch" : "term",
    food: params.get("food") !== "0",
    nappies: params.has("nappies") ? params.get("nappies") === "1" : null,
    tfc: params.get("tfc") === "1"
  };

  function ageById(id) {
    return F.ages.filter(function (a) {
      return a.id === id;
    })[0];
  }

  /* ---------- Build the controls ---------- */

  F.ages.forEach(function (a) {
    var r = BT.room(a.room);
    var label = el("label", "choice");
    var input = el("input");
    input.type = "radio";
    input.name = "age";
    input.value = a.id;
    input.checked = a.id === state.age;
    var span = el("span");
    span.appendChild(el("strong", "", a.label));
    span.appendChild(el("small", "", r.name + ", " + r.kind.toLowerCase()));
    label.append(input, span);
    agesBox.appendChild(label);
  });

  var planner = BT.planner(form.querySelector("[data-planner]"), {
    name: "calc",
    initial: state.pattern,
    onChange: function (p) {
      state.pattern = p;
      update();
    }
  });

  function renderSchemes() {
    var age = ageById(state.age);
    if (age.schemes.indexOf(state.scheme) === -1) {
      state.scheme = age.schemes[0];
    }
    schemesBox.textContent = "";
    age.schemes.forEach(function (id) {
      var s = F.schemes[id];
      var label = el("label", "choice");
      var input = el("input");
      input.type = "radio";
      input.name = "fund";
      input.value = id;
      input.checked = id === state.scheme;
      var span = el("span");
      span.appendChild(el("strong", "", s.name));
      if (s.note) {
        span.appendChild(el("small", "", s.note));
      }
      label.append(input, span);
      schemesBox.appendChild(label);
    });
    if (age.note) {
      schemeNote.textContent = age.note;
      schemeNote.hidden = false;
    } else {
      schemeNote.hidden = true;
    }
  }

  form.addEventListener("change", function (event) {
    var t = event.target;
    if (t.name === "age") {
      state.age = t.value;
      var r = BT.room(ageById(state.age).room);
      // Children in the baby and toddler rooms are usually in nappies; pre-schoolers usually are not.
      state.nappies = r.nappies;
      nappiesChoice.checked = r.nappies;
      renderSchemes();
    } else if (t.name === "fund") {
      state.scheme = t.value;
    } else if (t.name === "take") {
      state.take = t.value;
    } else if (t.name === "food") {
      state.food = t.checked;
    } else if (t.name === "nappies") {
      state.nappies = t.checked;
    } else if (t.name === "tfc") {
      state.tfc = t.checked;
    } else {
      return; // the planner reports its own changes
    }
    update();
  });

  /* ---------- The sums ---------- */

  function weekCosts(funded) {
    var r = BT.room(ageById(state.age).room);
    var booked = BT.patternHours(state.pattern);
    var days = BT.patternDays(state.pattern);
    var used = Math.min(booked, funded);
    var paidHours = booked - used;
    var food = state.food ? state.pattern.reduce(function (sum, s) {
      return sum + (s ? data.sessions[s].meals : 0);
    }, 0) : 0;
    var nappies = state.nappies ? days * 2 : 0;
    var care = paidHours * r.rate;
    return {
      booked: booked, funded: used, unused: Math.max(0, funded - booked), paidHours: paidHours,
      care: care, food: food, nappies: nappies, total: care + food + nappies
    };
  }

  // One pattern (term or stretch) for the current choices.
  function estimate(take) {
    var yearly = F.schemes[state.scheme].hours * F.termWeeks; // 570 or 1,140
    var otherWeeks = F.stretchWeeks - F.termWeeks;
    if (!yearly) {
      var w = weekCosts(0);
      return { take: "none", week: w, month: w.total * F.stretchWeeks / 12 };
    }
    if (take === "stretch") {
      var perWeek = yearly / F.stretchWeeks;
      var s = weekCosts(perWeek);
      return { take: "stretch", perWeek: perWeek, week: s, month: s.total * F.stretchWeeks / 12 };
    }
    var term = weekCosts(F.schemes[state.scheme].hours);
    var holiday = weekCosts(0);
    return {
      take: "term", perWeek: F.schemes[state.scheme].hours, term: term, holiday: holiday,
      month: (term.total * F.termWeeks + holiday.total * otherWeeks) / 12
    };
  }

  /* ---------- Show it ---------- */

  // One invoice line. subs: an optional small line under each amount (the hours).
  function row(tbody, label, note, values, className, subs) {
    var tr = el("tr", className || "");
    var th = el("th", "", label);
    th.scope = "row";
    if (note) {
      th.appendChild(el("small", "", note));
    }
    tr.appendChild(th);
    values.forEach(function (v, i) {
      var td = el("td", "", BT.money2(v));
      if (subs) {
        td.appendChild(el("small", "", subs[i]));
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }

  function renderInvoice(est) {
    var r = BT.room(ageById(state.age).room);
    invoice.textContent = "";
    var cols = est.take === "term" ? [est.term, est.holiday] : [est.week];
    var caption = el("caption", "", est.take === "term" ? "A week, laid out like our invoice" : "Each week, laid out like our invoice");
    invoice.appendChild(caption);
    var thead = el("thead");
    var hr = el("tr");
    var h0 = el("th", "", "");
    h0.scope = "col";
    h0.appendChild(el("span", "visually-hidden", "Item"));
    hr.appendChild(h0);
    (est.take === "term" ? ["Term-time week", "Other weeks"] : ["A week"]).forEach(function (t) {
      var th = el("th", "", t);
      th.scope = "col";
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    invoice.appendChild(thead);

    var tbody = el("tbody");
    var hours = function (key) {
      return cols.map(function (c) {
        return BT.hoursText(c[key]);
      });
    };
    if (est.take !== "none") {
      row(tbody, "Funded hours", "Paid by the council", cols.map(function () {
        return 0;
      }), "is-free", hours("funded"));
    }
    row(tbody, "Paid hours", "At " + BT.money2(r.rate) + " an hour", cols.map(function (c) {
      return c.care;
    }), "", hours("paidHours"));
    if (state.food) {
      row(tbody, "Food (optional)", "", cols.map(function (c) {
        return c.food;
      }));
    }
    if (state.nappies) {
      row(tbody, "Nappies, wipes and cream (optional)", "", cols.map(function (c) {
        return c.nappies;
      }));
    }
    invoice.appendChild(tbody);

    var tfoot = el("tfoot");
    var tr = el("tr");
    var th = el("th", "", "Total");
    th.scope = "row";
    tr.appendChild(th);
    cols.forEach(function (c) {
      tr.appendChild(el("td", "", BT.money2(c.total)));
    });
    tfoot.appendChild(tr);
    invoice.appendChild(tfoot);
  }

  function update() {
    var age = ageById(state.age);
    var r = BT.room(age.room);
    if (state.nappies === null) {
      state.nappies = r.nappies;
    }
    nappiesChoice.checked = state.nappies;
    form.elements.food.checked = state.food;
    form.elements.tfc.checked = state.tfc;

    var booked = BT.patternHours(state.pattern);
    var days = BT.patternDays(state.pattern);
    plannerTotal.textContent = booked ? BT.hoursText(booked) + " a week, over " + days + (days === 1 ? " day" : " days") + "." : "Choose at least one session.";

    var funded = F.schemes[state.scheme].hours > 0;
    takeBox.hidden = !funded;
    form.querySelectorAll('input[name="take"]').forEach(function (i) {
      i.checked = i.value === state.take;
    });

    roomLine.textContent = r.name + " (" + r.kind.toLowerCase() + "), " + BT.money2(r.rate) + " an hour.";

    if (!booked) {
      totalEl.textContent = "£0";
      perEl.textContent = "a month";
      invoice.textContent = "";
      tipBox.hidden = true;
      tfcBox.hidden = true;
      if (barTotal) {
        barTotal.textContent = "£0";
      }
      saveState();
      return;
    }

    var est = estimate(funded ? state.take : "none");
    totalEl.textContent = BT.money(Math.round(est.month));
    perEl.textContent = "a month, in 12 equal payments";
    if (barTotal) {
      barTotal.textContent = BT.money(Math.round(est.month));
    }
    renderInvoice(est);

    // A tip when funded hours would go unused, or when the other pattern costs less.
    var tip = "";
    if (funded) {
      var other = estimate(state.take === "term" ? "stretch" : "term");
      var unused = est.take === "term" ? est.term.unused : est.week.unused;
      if (unused > 0.01) {
        tip = "You have booked " + BT.hoursText(booked) + " a week, so about " + BT.hoursText(unused) + " of funded time a week would go unused. ";
      }
      if (other.month < est.month - 1) {
        tip += (state.take === "term" ? "Stretched" : "In term time only") + ", the same hours would cost about " + BT.money(Math.round(other.month)) + " a month.";
      } else if (unused > 0.01) {
        tip += "Ask us about a pattern that uses them all.";
      }
    }
    tipBox.hidden = !tip;
    tipBox.querySelector("p").textContent = tip;

    // Tax-Free Childcare: the government adds 20% of what goes into the account, up to £500 every 3 months.
    if (state.tfc && est.month > 0) {
      var topUp = Math.min(est.month * F.tfc.topUpRate, F.tfc.capPerQuarter / 3);
      tfcBox.querySelector("p").textContent = "With Tax-Free Childcare you would pay in about " + BT.money(Math.round(est.month - topUp)) + " a month, and the government would add about " + BT.money(Math.round(topUp)) + " (up to £500 every 3 months for each child, or £1,000 if your child is disabled).";
      tfcBox.hidden = false;
    } else {
      tfcBox.hidden = true;
    }

    saveState();
  }

  // Keep the choices in the address, so a parent can share or come back to them, and carry the pattern
  // to the waiting-list form.
  function saveState() {
    var pattern = state.pattern.join(".");
    joinLink.href = "join.html?pattern=" + encodeURIComponent(pattern) + "&age=" + state.age;
    if (!window.history.replaceState || !hasInteracted) {
      return;
    }
    var url = new URL(window.location.href);
    url.searchParams.set("age", state.age);
    url.searchParams.set("pattern", pattern);
    url.searchParams.set("fund", state.scheme);
    url.searchParams.set("take", state.take);
    url.searchParams.set("food", state.food ? "1" : "0");
    url.searchParams.set("nappies", state.nappies ? "1" : "0");
    url.searchParams.set("tfc", state.tfc ? "1" : "0");
    url.hash = "calculator";
    window.history.replaceState(null, "", url);
  }

  var hasInteracted = false;
  form.addEventListener("change", function () {
    hasInteracted = true;
  }, true);

  // On narrow screens (the CSS only shows it there) a small bar shows the monthly total while the form is on
  // screen, and steps aside once the full result is in view.
  if (bar && "IntersectionObserver" in window) {
    var seen = { form: false, result: false };
    var watch = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        seen[entry.target === result ? "result" : "form"] = entry.isIntersecting;
      });
      bar.classList.toggle("is-shown", seen.form && !seen.result);
    }, { threshold: 0 });
    watch.observe(form);
    watch.observe(result);
  }

  renderSchemes();
  planner.set(state.pattern);

  /* ---------- Optional extras table ---------- */

  function renderExtras() {
    var tbody = document.querySelector("[data-extras]");
    if (tbody) {
      tbody.textContent = "";
      data.extras.forEach(function (x) {
        var tr = el("tr");
        var th = el("th", "", x.name);
        th.scope = "row";
        tr.appendChild(th);
        [["Price", x.price], ["What it is", x.what], ["If you say no", x.instead]].forEach(function (c) {
          var td = el("td", "", c[1]);
          td.setAttribute("data-label", c[0]);
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
    }
    var never = document.querySelector("[data-never]");
    if (never) {
      never.textContent = "";
      data.neverCharge.forEach(function (t) {
        never.appendChild(el("li", "", t.charAt(0).toUpperCase() + t.slice(1) + "."));
      });
    }
  }
})();
