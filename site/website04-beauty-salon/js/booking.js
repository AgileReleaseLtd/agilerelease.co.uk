/* The booking page: choose treatments, answer the patch test question when it applies, pick a day and a
   start time that fits before closing, add a name, and the request is written as a WhatsApp message (or
   an email) on the visitor's own device. Nothing is sent to or stored by this website. */
(function () {
  var data = window.Lunette;
  var H = window.LunetteHours;
  var site = window.LunetteSite;
  var el = site.el;
  var icon = site.icon;

  var form = document.querySelector("[data-booking]");
  if (!form) {
    return;
  }

  var q = function (sel) {
    return document.querySelector(sel);
  };
  var lists = q("[data-pick-lists]");
  var tabs = form.querySelectorAll("[data-cat]");
  var patchBox = q("[data-patch]");
  var patchList = q("[data-patch-list]");
  var patchWhen = q("[data-patch-when]");
  var calTitle = q("[data-cal-title]");
  var calDays = q("[data-cal-days]");
  var timesBox = q("[data-times]");
  var timesLegend = q("[data-times-legend]");
  var timesTitle = q("[data-times-title]");
  var timesEmpty = q("[data-times-empty]");
  var sumList = q("[data-summary-list]");
  var sumEmpty = q("[data-summary-empty]");
  var sumTime = q("[data-sum-time]");
  var sumPrice = q("[data-sum-price]");
  var sumWhen = q("[data-sum-when]");
  var sumPatch = q("[data-sum-patch]");
  var sumDeposit = q("[data-sum-deposit]");
  var errorSummary = q("[data-error-summary]");
  var mobileBar = q("[data-mobile-bar]");
  var mobileSummary = q("[data-mobile-summary]");
  var nameInput = form.elements.name;

  var announcer = el("p", "visually-hidden");
  announcer.setAttribute("aria-live", "polite");
  document.body.appendChild(announcer);
  function announce(text) {
    announcer.textContent = "";
    // A new text node each time, so the same words are read again.
    window.setTimeout(function () {
      announcer.textContent = text;
    }, 30);
  }

  var win = H.bookingWindow();
  var state = { chosen: [], cat: data.categories[0].id, day: null, time: null };

  /* ---------- Working things out ---------- */

  function items() {
    return state.chosen.map(H.treatment);
  }

  function totals() {
    var t = { mins: 0, price: 0, from: false, patch: [], deposit: false };
    items().forEach(function (x) {
      t.mins += x.mins;
      t.price += x.price;
      t.from = t.from || !!x.from;
      if (x.patch) {
        t.patch.push(x.name);
      }
      t.deposit = t.deposit || !!x.deposit;
    });
    t.deposit = t.deposit || t.price > data.booking.depositOver;
    return t;
  }

  function priceText(t) {
    return (t.from ? "from " : "") + H.money(t.price);
  }

  function patchAnswer() {
    var checked = form.querySelector('input[name="patch"]:checked');
    return checked ? checked.value : "";
  }

  // True when a chosen treatment needs a patch test and the visitor has not had one yet.
  function needsTestFirst() {
    return totals().patch.length > 0 && patchAnswer() === "no";
  }

  // Can date d be chosen? Returns "" when it can, or the reason it cannot.
  function dayProblem(d) {
    if (d < win.first) {
      return "in the past";
    }
    if (d > win.last) {
      return "not open for booking yet";
    }
    if (!H.hoursOn(d)) {
      var why = H.closedLabel(d);
      return "closed" + (why ? " (" + why + ")" : "");
    }
    if (needsTestFirst() && d < H.patchTestEarliest()) {
      return "too soon after a patch test";
    }
    if (!H.startTimes(d, totals().mins).length) {
      return state.chosen.length ? "no start times left that fit" : "no start times left";
    }
    return "";
  }

  function joinNames(names) {
    if (names.length < 2) {
      return names.join("");
    }
    return names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
  }

  /* ---------- Step i: treatments ---------- */

  function renderLists() {
    data.categories.forEach(function (cat) {
      var set = el("fieldset", "pick-list");
      set.setAttribute("data-pick-cat", cat.id);
      set.appendChild(el("legend", "visually-hidden", cat.name));
      data.treatments.filter(function (t) {
        return t.cat === cat.id;
      }).forEach(function (t) {
        var label = el("label", "pick");
        var input = el("input");
        input.type = "checkbox";
        input.name = "treatment";
        input.value = t.id;
        var box = el("span", "pick-box");
        box.setAttribute("aria-hidden", "true");
        box.appendChild(icon("i-check", "icon"));
        var main = el("span", "pick-main");
        var name = el("span", "pick-name", t.name);
        if (t.patch) {
          var badge = el("span", "badge badge-patch");
          badge.appendChild(icon("i-patch", "icon icon-sm"));
          badge.appendChild(document.createTextNode("Patch test"));
          name.appendChild(document.createTextNode(" "));
          name.appendChild(badge);
        }
        main.append(name, el("span", "pick-desc", t.desc));
        var meta = el("span", "pick-meta");
        meta.append(el("span", "pick-price", H.priceLabel(t)), el("span", "pick-time", H.duration(t.mins)));
        label.append(input, box, main, meta);
        set.appendChild(label);
      });
      lists.appendChild(set);
    });
  }

  function showCat(id) {
    state.cat = id;
    tabs.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-cat") === id));
    });
    lists.querySelectorAll("[data-pick-cat]").forEach(function (set) {
      set.hidden = set.getAttribute("data-pick-cat") !== id;
    });
  }

  tabs.forEach(function (b) {
    b.addEventListener("click", function () {
      showCat(b.getAttribute("data-cat"));
    });
  });

  lists.addEventListener("change", function (event) {
    var input = event.target;
    if (input.name !== "treatment") {
      return;
    }
    var t = H.treatment(input.value);
    if (input.checked && state.chosen.indexOf(t.id) === -1) {
      state.chosen.push(t.id);
    } else if (!input.checked) {
      state.chosen = state.chosen.filter(function (id) {
        return id !== t.id;
      });
    }
    changed((input.checked ? "Added " : "Removed ") + t.name + ".");
  });

  function syncChecks() {
    lists.querySelectorAll('input[name="treatment"]').forEach(function (input) {
      input.checked = state.chosen.indexOf(input.value) !== -1;
    });
    data.categories.forEach(function (cat) {
      var n = items().filter(function (t) {
        return t.cat === cat.id;
      }).length;
      var badge = form.querySelector('[data-count-for="' + cat.id + '"]');
      badge.textContent = "";
      if (n) {
        badge.appendChild(document.createTextNode(String(n)));
        badge.appendChild(el("span", "visually-hidden", " chosen"));
      }
    });
  }

  function renderPatch() {
    var t = totals();
    patchBox.hidden = !t.patch.length;
    if (!t.patch.length) {
      return;
    }
    patchList.textContent = joinNames(t.patch) + (t.patch.length === 1 ? " needs" : " need") +
      " a patch test at least 48 hours before your appointment. It is free and takes five minutes.";
    if (patchAnswer() === "no") {
      patchWhen.textContent = "Pop in any time we are open, no appointment needed. The earliest day we can then book you in is " +
        H.fmt.long.format(firstOkDay(H.patchTestEarliest()) || H.patchTestEarliest()) + ".";
      patchWhen.hidden = false;
    } else {
      patchWhen.hidden = true;
    }
  }

  form.addEventListener("change", function (event) {
    if (event.target.name === "patch") {
      changed(event.target.value === "no" ? "Days less than 48 hours after a patch test are now unavailable." : "");
    }
  });

  /* ---------- Step ii: day and time ---------- */

  function firstOkDay(from) {
    for (var d = from || win.first; d <= win.last; d = H.addDays(d, 1)) {
      if (!dayProblem(d)) {
        return d;
      }
    }
    return null;
  }

  // Monday of the first week to Sunday of the last week, so the grid lines up under Mon ... Sun.
  function renderCalendar() {
    var start = H.addDays(win.first, -((win.first.getDay() + 6) % 7));
    var end = H.addDays(win.last, (7 - win.last.getDay()) % 7);
    var firstMonth = H.fmt.month.format(win.first);
    var lastMonth = H.fmt.month.format(win.last);
    if (firstMonth === lastMonth) {
      calTitle.textContent = firstMonth;
    } else if (win.first.getFullYear() === win.last.getFullYear()) {
      calTitle.textContent = H.fmt.monthName.format(win.first) + " to " + lastMonth;
    } else {
      calTitle.textContent = firstMonth + " to " + lastMonth;
    }

    var focusable = state.day || firstOkDay();
    calDays.textContent = "";
    for (var d = start; d <= end; d = H.addDays(d, 1)) {
      var button = el("button", "cal-day");
      button.type = "button";
      button.setAttribute("data-date", H.isoDate(d));
      if (d.getDate() === 1 || H.sameDay(d, start)) {
        button.appendChild(el("small", "cal-mon", H.fmt.monthShort.format(d)));
      }
      button.appendChild(el("span", "cal-num", String(d.getDate())));
      var label = H.fmt.long.format(d);
      var problem = dayProblem(d);
      if (problem) {
        button.disabled = true;
        label += ", " + problem;
        if (/^closed/.test(problem)) {
          button.classList.add("is-closed");
        } else if (d >= win.first && d <= win.last) {
          button.classList.add("is-unavailable");
        } else {
          button.classList.add("is-outside");
        }
      }
      if (H.sameDay(d, win.first)) {
        button.classList.add("is-today");
        label = "Today, " + label;
      }
      var on = !!state.day && H.sameDay(d, state.day);
      button.setAttribute("aria-pressed", String(on));
      button.tabIndex = focusable && H.sameDay(d, focusable) ? 0 : -1;
      button.setAttribute("aria-label", label);
      calDays.appendChild(button);
    }
  }

  function selectDay(d, opts) {
    opts = opts || {};
    state.day = d;
    renderCalendar();
    renderTimes();
    renderSummary();
    if (opts.focus) {
      var b = calDays.querySelector('[data-date="' + H.isoDate(d) + '"]');
      if (b) {
        b.focus();
      }
    }
  }

  calDays.addEventListener("click", function (event) {
    var b = event.target.closest(".cal-day");
    if (!b || b.disabled) {
      return;
    }
    selectDay(H.parseIso(b.getAttribute("data-date")), { focus: true });
    clearError("day");
    // On narrow screens the times sit under the calendar: bring them into view.
    if (window.matchMedia("(max-width: 760px)").matches) {
      timesTitle.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }
  });

  // Arrow keys move a day (left, right) or a week (up, down); Home and End go to the first and last day.
  // Days that cannot be chosen are skipped. Enter or Space chooses the focused day.
  calDays.addEventListener("keydown", function (event) {
    var current = H.parseIso((document.activeElement && document.activeElement.getAttribute("data-date")) || "");
    if (!current) {
      return;
    }
    var steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    var target = null;
    function nearest(d, dir) {
      for (; d >= win.first && d <= win.last; d = H.addDays(d, dir)) {
        if (!dayProblem(d)) {
          return d;
        }
      }
      return null;
    }
    if (steps[event.key]) {
      var step = steps[event.key];
      target = nearest(H.addDays(current, step), step > 0 ? 1 : -1);
    } else if (event.key === "Home") {
      target = nearest(win.first, 1);
    } else if (event.key === "End") {
      target = nearest(win.last, -1);
    }
    if (target) {
      event.preventDefault();
      calDays.querySelectorAll(".cal-day").forEach(function (b) {
        b.tabIndex = b.getAttribute("data-date") === H.isoDate(target) ? 0 : -1;
      });
      calDays.querySelector('[data-date="' + H.isoDate(target) + '"]').focus();
    }
  });

  function renderTimes() {
    timesBox.querySelectorAll(".time-group").forEach(function (g) {
      g.remove();
    });
    timesEmpty.hidden = true;
    if (!state.day) {
      timesTitle.textContent = "Start times";
      timesLegend.textContent = "Start time";
      timesEmpty.textContent = "Choose a day to see the start times.";
      timesEmpty.hidden = false;
      timesBox.hidden = true;
      return;
    }
    var t = totals();
    var slots = H.startTimes(state.day, t.mins);
    timesTitle.textContent = "Start times on " + H.fmt.long.format(state.day);
    timesLegend.textContent = "Start time on " + H.fmt.long.format(state.day);
    if (!slots.length) {
      timesEmpty.textContent = "No start times fit on this day. Try another day, or call us and we can split a long visit in two.";
      timesEmpty.hidden = false;
      timesBox.hidden = true;
      return;
    }
    timesBox.hidden = false;
    if (!t.mins) {
      timesEmpty.textContent = "Choose your treatments in step i, and we will only show times that fit before closing.";
      timesEmpty.hidden = false;
    }
    if (state.time !== null && !slots.some(function (s) { return s.mins === state.time; })) {
      state.time = null;
      announce("Your start time no longer fits, so it has been cleared. Please choose another.");
    }
    var groups = {};
    slots.forEach(function (s) {
      if (!groups[s.period]) {
        var g = el("div", "time-group");
        g.appendChild(el("p", "time-group-title", s.period));
        groups[s.period] = el("div", "time-chips");
        g.appendChild(groups[s.period]);
        timesBox.appendChild(g);
      }
      var label = el("label", "time-chip");
      var input = el("input");
      input.type = "radio";
      input.name = "time";
      input.value = String(s.mins);
      input.checked = state.time === s.mins;
      var face = el("span", "", s.label);
      if (t.mins) {
        face.appendChild(el("span", "visually-hidden", ", finishing about " + H.timeLabel(s.mins + t.mins)));
      }
      label.append(input, face);
      groups[s.period].appendChild(label);
    });
  }

  timesBox.addEventListener("change", function (event) {
    if (event.target.name === "time") {
      state.time = +event.target.value;
      clearError("time");
      renderSummary();
    }
  });

  /* ---------- Summary ---------- */

  function renderSummary() {
    var t = totals();
    var list = items();
    sumList.textContent = "";
    sumEmpty.hidden = list.length > 0;
    list.forEach(function (x) {
      var li = el("li", "summary-item");
      var text = el("span", "summary-item-text");
      text.append(el("span", "summary-item-name", x.name), el("span", "summary-item-meta", H.duration(x.mins) + " · " + H.priceLabel(x)));
      var remove = el("button", "summary-remove");
      remove.type = "button";
      remove.setAttribute("data-remove", x.id);
      remove.setAttribute("aria-label", "Remove " + x.name);
      remove.appendChild(icon("i-close", "icon icon-sm"));
      li.append(text, remove);
      sumList.appendChild(li);
    });
    sumTime.textContent = list.length ? H.duration(t.mins) : "None yet";
    sumPrice.textContent = list.length ? priceText(t) : "None yet";
    if (state.day && state.time !== null) {
      sumWhen.textContent = H.fmt.long.format(state.day) + ", " + H.timeLabel(state.time) +
        (t.mins ? " to about " + H.timeLabel(state.time + t.mins) : "");
    } else if (state.day) {
      sumWhen.textContent = H.fmt.long.format(state.day) + ", choose a time";
    } else {
      sumWhen.textContent = "Not chosen yet";
    }

    sumPatch.hidden = !t.patch.length;
    sumPatch.querySelector("span").textContent = patchAnswer() === "yes" ? "Patch test: done in the last six months." :
      patchAnswer() === "no" ? "Patch test needed first, at least 48 hours before." : "Patch test needed: please answer the question in step i.";
    sumDeposit.hidden = !t.deposit;
    sumDeposit.querySelector("span").textContent = "A " + H.money(data.booking.deposit) +
      " deposit secures this booking. We send a payment link when we confirm.";

    var short = list.length + (list.length === 1 ? " treatment" : " treatments") + " · " + H.duration(t.mins) + " · " + priceText(t);
    mobileSummary.textContent = short;
    updateMobileBar();
  }

  sumList.addEventListener("click", function (event) {
    var b = event.target.closest("[data-remove]");
    if (!b) {
      return;
    }
    var t = H.treatment(b.getAttribute("data-remove"));
    var index = state.chosen.indexOf(t.id);
    state.chosen = state.chosen.filter(function (id) {
      return id !== t.id;
    });
    changed("Removed " + t.name + ".");
    // Keep focus in the list: on the next remove button, or on the heading when the list is empty.
    var buttons = sumList.querySelectorAll("[data-remove]");
    if (buttons.length) {
      buttons[Math.min(index, buttons.length - 1)].focus();
    } else {
      q("#summary-title").setAttribute("tabindex", "-1");
      q("#summary-title").focus();
    }
  });

  // On phones a slim bar keeps the totals in view until the summary itself is on screen.
  var summaryVisible = false;
  function updateMobileBar() {
    var show = state.chosen.length > 0 && !summaryVisible;
    mobileBar.hidden = !show;
    document.body.classList.toggle("has-tray", show);
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      summaryVisible = entries[0].isIntersecting;
      updateMobileBar();
    }).observe(q("#summary"));
  }

  /* ---------- Changes, errors and sending ---------- */

  // Something about the treatments or the patch test answer changed: everything that depends on them follows.
  function changed(words) {
    syncChecks();
    renderPatch();
    var lost = "";
    if (state.day && dayProblem(state.day)) {
      lost = " " + H.fmt.long.format(state.day) + " is no longer available, so please choose another day.";
      state.day = null;
      state.time = null;
    }
    renderCalendar();
    renderTimes();
    renderSummary();
    if (state.chosen.length) {
      clearError("treatments");
    }
    if (patchAnswer()) {
      clearError("patch");
    }
    var t = totals();
    var sum = state.chosen.length ? " Your booking: " + state.chosen.length +
      (state.chosen.length === 1 ? " treatment, " : " treatments, ") + H.duration(t.mins) + ", " + priceText(t) + "." : "";
    if (words || lost) {
      announce((words || "") + sum + lost);
    }
    if (!errorSummary.hidden) {
      showErrors(validate(), false);
    }
  }

  function validate() {
    var t = totals();
    var errors = [];
    if (!state.chosen.length) {
      errors.push({ key: "treatments", text: "Choose at least one treatment." });
    }
    if (t.patch.length && !patchAnswer()) {
      errors.push({ key: "patch", text: "Tell us whether you have had a patch test." });
    }
    if (!state.day) {
      errors.push({ key: "day", text: "Choose a day." });
    } else if (state.time === null) {
      errors.push({ key: "time", text: "Choose a start time." });
    }
    if (!nameInput.value.trim()) {
      errors.push({ key: "name", text: "Add your name." });
    }
    return errors;
  }

  function clearError(key) {
    var node = form.querySelector('[data-error="' + key + '"]');
    if (node) {
      node.hidden = true;
    }
    if (key === "name") {
      nameInput.removeAttribute("aria-invalid");
    }
  }

  // Where each error's link takes the focus.
  function focusFor(key) {
    if (key === "treatments") {
      return lists.querySelector(".pick-list:not([hidden]) input");
    }
    if (key === "patch") {
      return form.querySelector('input[name="patch"]');
    }
    if (key === "day") {
      return calDays.querySelector('.cal-day[tabindex="0"]');
    }
    if (key === "time") {
      return timesBox.querySelector('input[name="time"]');
    }
    return nameInput;
  }

  function showErrors(errors, moveFocus) {
    ["treatments", "patch", "day", "time", "name"].forEach(clearError);
    var ul = errorSummary.querySelector("ul");
    ul.textContent = "";
    errors.forEach(function (e) {
      var node = form.querySelector('[data-error="' + e.key + '"]');
      if (node) {
        node.hidden = false;
      }
      if (e.key === "name") {
        nameInput.setAttribute("aria-invalid", "true");
      }
      var li = el("li");
      var a = el("a", "", e.text);
      a.href = "#" + (e.key === "treatments" ? "step-treatments" : e.key);
      a.setAttribute("data-goto", e.key);
      li.appendChild(a);
      ul.appendChild(li);
    });
    errorSummary.hidden = !errors.length;
    if (errors.length && moveFocus) {
      errorSummary.focus();
    }
  }

  errorSummary.addEventListener("click", function (event) {
    var a = event.target.closest("[data-goto]");
    if (!a) {
      return;
    }
    event.preventDefault();
    var target = focusFor(a.getAttribute("data-goto"));
    if (target) {
      target.focus();
      target.scrollIntoView({ block: "center", behavior: "auto" });
    }
  });

  nameInput.addEventListener("input", function () {
    if (nameInput.value.trim()) {
      clearError("name");
      if (!errorSummary.hidden) {
        showErrors(validate(), false);
      }
    }
  });

  function message() {
    var t = totals();
    var lines = ["Hi " + data.shortName + ", I'd like to book an appointment, please.", "", "Treatments:"];
    items().forEach(function (x) {
      lines.push("- " + x.name + " (" + H.duration(x.mins) + ", " + H.priceLabel(x) + ")");
    });
    lines.push("Total: " + H.duration(t.mins) + ", " + priceText(t));
    lines.push("");
    lines.push("Day: " + H.fmt.long.format(state.day));
    lines.push("Time: " + H.timeLabel(state.time) + " (finishing about " + H.timeLabel(state.time + t.mins) + ")");
    lines.push("");
    lines.push("Name: " + nameInput.value.trim());
    lines.push("Been before: " + (form.elements.visit.value === "returning" ? "Yes" : "No, this is my first visit"));
    if (t.patch.length) {
      lines.push("Patch test: " + (patchAnswer() === "yes" ? "Yes, with you in the last six months" :
        "Not yet. I'll pop in for one at least 48 hours before."));
    }
    if (t.deposit) {
      lines.push("Deposit: I understand a " + H.money(data.booking.deposit) + " deposit is needed. Please send me the link.");
    }
    var note = form.elements.note.value.trim();
    if (note) {
      lines.push("Note: " + note);
    }
    lines.push("");
    lines.push("Please confirm, or suggest another time.");
    return lines.join("\n");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var errors = validate();
    showErrors(errors, true);
    if (errors.length) {
      return;
    }
    var via = event.submitter && event.submitter.getAttribute("data-via") === "email" ? "email" : "whatsapp";
    site.sendMessage({
      text: message(),
      via: via,
      subject: "Booking request: " + H.fmt.short.format(state.day) + ", " + H.timeLabel(state.time),
      title: "Your booking request",
      reply: "The salon replies to confirm the time, usually within the hour while it is open."
    });
  });

  /* ---------- Start ---------- */

  renderLists();
  var params = new URLSearchParams(window.location.search);
  (params.get("t") || "").split(",").forEach(function (id) {
    if (H.treatment(id) && state.chosen.indexOf(id) === -1) {
      state.chosen.push(id);
    }
  });
  var startCat = H.category(params.get("cat") || "") ? params.get("cat") :
    state.chosen.length ? H.treatment(state.chosen[0]).cat : data.categories[0].id;
  showCat(startCat);
  changed("");
})();
