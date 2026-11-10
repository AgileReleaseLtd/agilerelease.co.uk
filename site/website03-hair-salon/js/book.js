/* The booking page: choose services, then who, then a day and a time from that person's working pattern.
   The total time and price add up as you go, and the request becomes a WhatsApp message (or an email)
   written on the visitor's own device. Nothing is sent to or stored by this website. */
(function () {
  var D = window.SorrelSteel;
  var C = window.SorrelSteelCore;
  var el = C.el;

  var form = document.querySelector("[data-book-form]");
  if (!form) {
    return;
  }
  var dialog = document.getElementById("sent-dialog");

  var q = function (sel) {
    return form.querySelector(sel);
  };
  var ui = {
    filters: q("[data-svc-filters]"),
    groups: q("[data-svc-groups]"),
    lengthBlock: q("[data-length-block]"),
    lengthOptions: q("[data-length-options]"),
    colourBlock: q("[data-colour-block]"),
    skinNotice: q("[data-skin-notice]"),
    whoWaiting: q("[data-who-waiting]"),
    whoBlock: q("[data-who-block]"),
    whoList: q("[data-who-list]"),
    whoNone: q("[data-who-none]"),
    whoNoneText: q("[data-who-none-text]"),
    whenWaiting: q("[data-when-waiting]"),
    whenBlock: q("[data-when-block]"),
    calTitle: q("[data-cal-title]"),
    calDays: q("[data-cal-days]"),
    timesTitle: q("[data-times-title]"),
    times: q("[data-times]"),
    timesEmpty: q("[data-times-empty]"),
    skinBlock: q("[data-skin-block]"),
    skinSelect: q("#skin-day"),
    skinHint: q("[data-skin-hint]"),
    sumLines: q("[data-sum-lines]"),
    sumWho: q("[data-sum-who]"),
    sumWhen: q("[data-sum-when]"),
    sumTime: q("[data-sum-time]"),
    sumPrice: q("[data-sum-price]"),
    sumPriceNote: q("[data-sum-price-note]"),
    sumDeposit: q("[data-sum-deposit]"),
    errors: q("[data-errors]")
  };

  var state = {
    selected: [],
    cat: D.categories[0].id,
    length: null,
    colourBefore: null,
    who: null,
    date: null,
    time: null
  };
  var win = C.bookingWindow();
  var bookable = D.services.filter(function (s) {
    return !s.quote;
  });

  /* ---------- What is chosen, worked out ---------- */

  function selectedServices() {
    return state.selected.map(C.service);
  }

  function needsLength() {
    return C.needsLength(state.selected);
  }

  function colourChosen() {
    return C.needsSkinTest(state.selected);
  }

  // A skin test is needed unless they have told us they had colour with us recently.
  function needsSkin() {
    return colourChosen() && state.colourBefore !== "yes";
  }

  function totalMinutes() {
    var mins = 0;
    for (var i = 0; i < state.selected.length; i++) {
      var m = C.minutesFor(C.service(state.selected[i]), state.length);
      if (m === null) {
        return null;
      }
      mins += m;
    }
    return mins;
  }

  function eligible() {
    return state.selected.length ? C.eligible(state.selected) : [];
  }

  // The people a time could be with: the chosen person, or everyone who does all of it.
  function candidates() {
    if (!state.who) {
      return [];
    }
    return state.who === "anyone" ? eligible() : [C.member(state.who)];
  }

  function whenReady() {
    return state.selected.length > 0 && !!state.who && candidates().length > 0 && totalMinutes() !== null;
  }

  // Start times on a day, each with the people free to do it. Times too close for a skin test are left out.
  function slotsOn(d) {
    if (!whenReady()) {
      return [];
    }
    var mins = totalMinutes();
    var byTime = {};
    candidates().forEach(function (m) {
      C.startTimes(m, d, mins).forEach(function (t) {
        (byTime[t] = byTime[t] || []).push(m);
      });
    });
    return Object.keys(byTime).map(Number).sort(function (a, b) {
      return a - b;
    }).filter(function (t) {
      return !needsSkin() || C.skinTestDays(C.at(d, t)).length > 0;
    }).map(function (t) {
      return { time: t, members: byTime[t] };
    });
  }

  function chosenSlot() {
    if (!state.date || state.time === null) {
      return null;
    }
    return slotsOn(state.date).filter(function (s) {
      return s.time === state.time;
    })[0] || null;
  }

  // The price range of one service for a set of people and the hair length (if known).
  function lineRange(s, members) {
    var kind = C.priceKind(s);
    if (kind === "flat") {
      return [s.price, s.price];
    }
    if (kind === "length") {
      if (state.length) {
        return [s.price[state.length], s.price[state.length]];
      }
      return C.priceRange(s);
    }
    var levels = members.length ? members.map(function (m) {
      return m.level;
    }) : ["stylist", "senior"];
    var values = levels.map(function (lv) {
      return s.price[lv];
    });
    return [Math.min.apply(null, values), Math.max.apply(null, values)];
  }

  function priceMembers() {
    var slot = chosenSlot();
    if (slot) {
      return slot.members;
    }
    var c = candidates();
    return c.length ? c : eligible();
  }

  // The person chosen or asked for (a "pending-" id is someone asked for who still has to be checked).
  function askedFor() {
    return state.who && state.who !== "anyone" ? C.member(state.who.replace(/^pending-/, "")) : null;
  }

  function joinNames(list) {
    return list.join(", ").replace(/, ([^,]*)$/, " or $1");
  }

  function daysText(m) {
    return C.workingDays(m).map(function (dow) {
      return C.DAY_SHORT[dow];
    }).join(", ");
  }

  /* ---------- Step 1: services ---------- */

  function buildServices() {
    D.categories.forEach(function (cat) {
      var chip = el("button", "chip");
      chip.type = "button";
      chip.setAttribute("data-cat", cat.id);
      chip.appendChild(el("span", "", cat.name));
      var count = el("span", "chip-count");
      count.hidden = true;
      chip.appendChild(count);
      chip.addEventListener("click", function () {
        state.cat = cat.id;
        renderServiceFilter();
      });
      ui.filters.appendChild(chip);

      var group = el("fieldset", "svc-group");
      group.setAttribute("data-group", cat.id);
      group.appendChild(el("legend", "", cat.name));
      var list = el("div", "svc-list");
      bookable.filter(function (s) {
        return s.cat === cat.id;
      }).forEach(function (s) {
        var label = el("label", "check svc");
        var input = el("input");
        input.type = "checkbox";
        input.name = "service";
        input.value = s.id;
        var text = el("span", "check-text");
        text.appendChild(el("span", "check-name", s.name));
        text.appendChild(el("span", "check-price", priceText(s)));
        var meta = el("span", "check-meta");
        meta.setAttribute("data-meta", s.id);
        text.appendChild(meta);
        label.append(input, text);
        list.appendChild(label);
      });
      group.appendChild(list);
      if (cat.id === "colour") {
        group.appendChild(el("p", "sub-hint svc-foot", "Colour correction is priced at a free consultation, so choose Colour consultation for that."));
      }
      ui.groups.appendChild(group);
    });

    ui.groups.addEventListener("change", function (event) {
      if (event.target.name !== "service") {
        return;
      }
      var ids = [];
      ui.groups.querySelectorAll("input[name=service]:checked").forEach(function (input) {
        ids.push(input.value);
      });
      // Keep the order of the price list.
      state.selected = bookable.map(function (s) {
        return s.id;
      }).filter(function (id) {
        return ids.indexOf(id) !== -1;
      });
      afterServices();
    });

    Object.keys(D.lengths).forEach(function (key) {
      var len = D.lengths[key];
      var label = el("label", "check");
      var input = el("input");
      input.type = "radio";
      input.name = "length";
      input.value = key;
      var text = el("span", "check-text");
      text.appendChild(el("span", "check-name", len.name));
      text.appendChild(el("span", "check-meta", len.hint));
      label.append(input, text);
      ui.lengthOptions.appendChild(label);
    });
  }

  function priceText(s) {
    var r = C.priceRange(s);
    return r[0] === r[1] ? C.money(r[0]) : C.moneyRange(r[0], r[1]);
  }

  function metaText(s) {
    var r = C.minutesRange(s);
    var time = r[0] === r[1] ? C.duration(r[0]) : C.duration(r[0]) + " to " + C.duration(r[1]);
    var bits = [time];
    if (C.priceKind(s) === "level") {
      bits.push("stylist or senior");
    } else if (C.priceKind(s) === "length") {
      bits.push("by hair length");
    }
    return bits.join(" · ");
  }

  function renderServiceFilter() {
    ui.filters.querySelectorAll("[data-cat]").forEach(function (chip) {
      var id = chip.getAttribute("data-cat");
      chip.setAttribute("aria-pressed", String(id === state.cat));
      var n = state.selected.filter(function (sid) {
        return C.service(sid).cat === id;
      }).length;
      var count = chip.querySelector(".chip-count");
      count.hidden = !n;
      count.textContent = String(n);
      chip.setAttribute("aria-label", chip.firstChild.textContent + (n ? ", " + n + " chosen" : ""));
    });
    ui.groups.querySelectorAll("[data-group]").forEach(function (g) {
      g.hidden = g.getAttribute("data-group") !== state.cat;
    });
  }

  // Service notes: time, how it is priced, the skin test, and whether the chosen person does it.
  function renderServiceMeta() {
    var m = askedFor();
    bookable.forEach(function (s) {
      var meta = ui.groups.querySelector('[data-meta="' + s.id + '"]');
      meta.textContent = metaText(s);
      if (s.skinTest) {
        var tag = el("span", "tag", "Skin test");
        meta.appendChild(tag);
      }
      var off = m && m.does.indexOf(s.id) === -1;
      meta.closest(".check").classList.toggle("is-off", !!off);
      if (off) {
        meta.appendChild(document.createTextNode(" · not done by " + m.name));
      }
    });
  }

  function afterServices() {
    renderServiceFilter();
    ui.lengthBlock.hidden = !needsLength();
    ui.colourBlock.hidden = !colourChosen();
    renderSkinNotice();
    // Someone chosen who does not do all of this has to be chosen again.
    if (C.member(state.who) && !C.canDo(C.member(state.who), state.selected)) {
      state.who = "pending-" + state.who;
    }
    renderWho();
    renderWhen();
    renderServiceMeta();
    renderSummary();
  }

  function renderSkinNotice() {
    ui.skinNotice.hidden = !(colourChosen() && state.colourBefore === "no");
  }

  form.addEventListener("change", function (event) {
    var t = event.target;
    if (t.name === "length") {
      state.length = t.value;
      renderWhen();
      renderSummary();
    } else if (t.name === "colourBefore") {
      state.colourBefore = t.value;
      renderSkinNotice();
      renderWhen();
      renderSummary();
    } else if (t.name === "who") {
      state.who = t.value;
      ui.whoNone.hidden = true;
      renderServiceMeta();
      renderWhen();
      renderSummary();
    } else if (t.name === "time") {
      state.time = Number(t.value);
      renderSkin();
      renderSummary();
    } else if (t.name === "skinDay") {
      renderSummary();
    }
  });

  /* ---------- Step 2: who ---------- */

  function renderWho() {
    var none = !state.selected.length;
    ui.whoWaiting.hidden = !none;
    ui.whoBlock.hidden = none;
    ui.whoNone.hidden = true;
    ui.whoList.textContent = "";
    if (none) {
      // Someone asked for stays "pending" until a service is chosen.
      if (C.member(state.who)) {
        state.who = "pending-" + state.who;
      }
      return;
    }
    var can = eligible();
    var wanted = state.who && state.who.indexOf("pending-") === 0 ? state.who.slice(8) : null;
    if (wanted) {
      state.who = null;
      if (C.canDo(C.member(wanted), state.selected)) {
        state.who = wanted;
      } else {
        ui.whoNone.hidden = false;
        ui.whoNoneText.textContent = C.member(wanted).name + " does not do " + missing(C.member(wanted)) + ", so please choose again.";
      }
    }
    if (state.who === "anyone" && !can.length) {
      state.who = null;
    }

    if (!can.length) {
      ui.whoBlock.hidden = true;
      ui.whoNone.hidden = false;
      ui.whoNoneText.textContent = "No one person does all of these in one visit. Remove one, or send two requests and say so in the note, and we will plan it with two of the team.";
      return;
    }

    var any = el("label", "check who");
    var anyInput = el("input");
    anyInput.type = "radio";
    anyInput.name = "who";
    anyInput.value = "anyone";
    anyInput.checked = state.who === "anyone";
    var mark = el("span", "any-mark", "&");
    mark.setAttribute("aria-hidden", "true");
    var anyText = el("span", "check-text");
    anyText.appendChild(el("span", "check-name", "Anyone"));
    anyText.appendChild(el("span", "check-meta", can.length === 1 ? "Only " + can[0].name + " does all of this" :
      "The first free chair: " + joinNames(can.map(function (m) {
        return m.name;
      }))));
    any.append(anyInput, mark, anyText);
    ui.whoList.appendChild(any);

    D.team.forEach(function (m) {
      var ok = C.canDo(m, state.selected);
      var label = el("label", "check who" + (ok ? "" : " is-off"));
      var input = el("input");
      input.type = "radio";
      input.name = "who";
      input.value = m.id;
      input.disabled = !ok;
      input.checked = state.who === m.id;
      var text = el("span", "check-text");
      text.appendChild(el("span", "check-name", m.name));
      text.appendChild(el("span", "check-meta", ok ? m.role + " · " + daysText(m) : "Does not do " + missing(m)));
      label.append(input, C.monogram(m, "sm"), text);
      ui.whoList.appendChild(label);
    });
  }

  function missing(m) {
    var names = state.selected.filter(function (id) {
      return m.does.indexOf(id) === -1;
    }).map(function (id) {
      return C.service(id).name.toLowerCase();
    });
    return names.join(", ").replace(/, ([^,]*)$/, " or $1");
  }

  /* ---------- Step 3: when ---------- */

  function gridRange() {
    var start = C.addDays(win.first, -((win.first.getDay() + 6) % 7));
    var end = C.addDays(win.last, (7 - win.last.getDay()) % 7);
    return { start: start, end: end };
  }

  function inWindow(d) {
    return d >= win.first && d <= win.last;
  }

  function dayReason(d) {
    var closed = C.closedReason(d);
    if (closed) {
      return "closed for " + closed;
    }
    if (state.who && state.who !== "anyone") {
      var m = C.member(state.who);
      if (!m.days[d.getDay()]) {
        return m.name + " does not work on " + C.DAY_NAMES[d.getDay()] + "s";
      }
    }
    return "no free times for this booking";
  }

  function renderWhen() {
    var ready = whenReady();
    ui.whenWaiting.hidden = ready;
    ui.whenBlock.hidden = !ready;
    if (!ready) {
      ui.whenWaiting.textContent = !state.selected.length || !state.who || state.who.indexOf("pending-") === 0 ?
        "Choose your services and who you would like first." :
        needsLength() && !state.length ? "Choose your hair length first, so we know how long to book." :
        "Choose who you would like first.";
      state.date = null;
      state.time = null;
      renderSkin();
      return;
    }

    var range = gridRange();
    var firstMonth = C.fmt.month.format(win.first);
    var lastMonth = C.fmt.month.format(win.last);
    ui.calTitle.textContent = firstMonth === lastMonth ? firstMonth :
      win.first.getFullYear() === win.last.getFullYear() ? C.fmt.monthName.format(win.first) + " to " + lastMonth :
      firstMonth + " to " + lastMonth;

    ui.calDays.textContent = "";
    var firstOpen = null;
    for (var d = range.start; d <= range.end; d = C.addDays(d, 1)) {
      var b = el("button", "cal-day");
      b.type = "button";
      b.setAttribute("data-date", C.isoDate(d));
      b.tabIndex = -1;
      if (d.getDate() === 1) {
        b.appendChild(el("small", "cal-mon", C.fmt.monthShort.format(d)));
      }
      b.appendChild(el("span", "cal-num", String(d.getDate())));
      var label = C.fmt.long.format(d);
      if (!inWindow(d)) {
        b.disabled = true;
        b.classList.add("is-out");
        label += d < win.first ? ", in the past" : ", too far ahead";
      } else {
        var n = slotsOn(d).length;
        if (!n) {
          b.disabled = true;
          label += ", " + dayReason(d);
        } else {
          label += ", " + n + (n === 1 ? " start time" : " start times");
          if (!firstOpen) {
            firstOpen = new Date(d);
          }
        }
      }
      if (C.sameDay(d, win.first)) {
        b.classList.add("is-today");
        label = "Today, " + label;
      }
      b.setAttribute("aria-label", label);
      b.setAttribute("aria-pressed", "false");
      ui.calDays.appendChild(b);
    }

    // Keep the chosen day if it still works, otherwise move to the first day that does.
    if (!state.date || !slotsOn(state.date).length) {
      state.date = firstOpen;
    }
    if (state.date) {
      selectDay(state.date, { keepTime: true });
    } else {
      ui.timesTitle.textContent = "No times";
      ui.times.textContent = "";
      ui.timesEmpty.hidden = false;
      ui.timesEmpty.textContent = "There are no times in the next four weeks for this booking. Try someone else, or message us and we will find a time.";
      state.time = null;
      renderSkin();
    }
  }

  function dayButton(d) {
    return ui.calDays.querySelector('[data-date="' + C.isoDate(d) + '"]');
  }

  function selectDay(d, opts) {
    opts = opts || {};
    state.date = d;
    ui.calDays.querySelectorAll(".cal-day").forEach(function (b) {
      var on = b.getAttribute("data-date") === C.isoDate(d);
      b.setAttribute("aria-pressed", String(on));
      b.tabIndex = on ? 0 : -1;
    });
    if (opts.focus) {
      dayButton(d).focus();
    }
    renderTimes(opts.keepTime);
  }

  function renderTimes(keepTime) {
    var d = state.date;
    var slots = slotsOn(d);
    var rel = C.relativeDay(d);
    ui.timesTitle.textContent = "";
    ui.timesTitle.appendChild(el("small", "", rel === "Today" || rel === "Tomorrow" ? rel : C.fmt.weekday.format(d)));
    ui.timesTitle.appendChild(document.createTextNode(C.fmt.dayMonth.format(d)));

    if (!keepTime || !slots.some(function (s) { return s.time === state.time; })) {
      state.time = null;
    }
    ui.times.textContent = "";
    ui.timesEmpty.hidden = true;
    var parts = [["Morning", 0, 720], ["Afternoon", 720, 1020], ["Evening", 1020, 1440]];
    parts.forEach(function (part) {
      var inPart = slots.filter(function (s) {
        return s.time >= part[1] && s.time < part[2];
      });
      if (!inPart.length) {
        return;
      }
      var fs = el("fieldset", "time-group");
      fs.appendChild(el("legend", "", part[0]));
      var chips = el("div", "time-chips");
      inPart.forEach(function (s) {
        var label = el("label", "time-chip");
        var input = el("input");
        input.type = "radio";
        input.name = "time";
        input.value = String(s.time);
        input.checked = s.time === state.time;
        var names = state.who === "anyone" ? ", with " + joinNames(s.members.map(function (m) { return m.name; })) : "";
        input.setAttribute("aria-label", C.time12(s.time) + names);
        label.append(input, el("span", "", C.time12(s.time)));
        chips.appendChild(label);
      });
      fs.appendChild(chips);
      ui.times.appendChild(fs);
    });
    renderSkin();
    renderSummary();
  }

  ui.calDays.addEventListener("click", function (event) {
    var b = event.target.closest(".cal-day");
    if (!b || b.disabled) {
      return;
    }
    selectDay(C.parseIso(b.getAttribute("data-date")));
    if (window.matchMedia("(max-width: 719px)").matches) {
      ui.timesTitle.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }
  });

  function selectable(d) {
    var b = dayButton(d);
    return !!b && !b.disabled;
  }

  function nearestSelectable(d, dir) {
    for (; inWindow(d); d = C.addDays(d, dir)) {
      if (selectable(d)) {
        return d;
      }
    }
    return null;
  }

  // Arrow keys move a day (left, right) or a week (up, down); Home and End go to the first and last day.
  ui.calDays.addEventListener("keydown", function (event) {
    if (!state.date) {
      return;
    }
    var steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    var target = null;
    if (steps[event.key]) {
      target = nearestSelectable(C.addDays(state.date, steps[event.key]), steps[event.key] > 0 ? 1 : -1);
    } else if (event.key === "Home") {
      target = nearestSelectable(win.first, 1);
    } else if (event.key === "End") {
      target = nearestSelectable(win.last, -1);
    }
    if (target) {
      event.preventDefault();
      selectDay(target, { focus: true });
    }
  });

  /* ---------- Step 4: the skin test day ---------- */

  function skinOptions() {
    var slot = chosenSlot();
    return slot && needsSkin() ? C.skinTestDays(C.at(state.date, slot.time)) : [];
  }

  function renderSkin() {
    var show = needsSkin() && !!chosenSlot();
    ui.skinBlock.hidden = !show;
    var previous = ui.skinSelect.value;
    ui.skinSelect.textContent = "";
    if (!show) {
      return;
    }
    var placeholder = el("option", "", "Choose a day");
    placeholder.value = "";
    ui.skinSelect.appendChild(placeholder);
    var options = skinOptions();
    options.forEach(function (o) {
      var rel = C.relativeDay(o.date);
      var text = (rel === "Today" || rel === "Tomorrow" ? rel + ", " + C.fmt.dayMonth.format(o.date) : C.fmt.long.format(o.date)) +
        (o.allDay ? "" : ", before " + C.time12(o.by));
      var opt = el("option", "", text);
      opt.value = C.isoDate(o.date);
      ui.skinSelect.appendChild(opt);
    });
    if (options.some(function (o) { return C.isoDate(o.date) === previous; })) {
      ui.skinSelect.value = previous;
    }
    var last = options[options.length - 1];
    ui.skinHint.textContent = "Five minutes, free, no appointment needed. Any time we are open" +
      (last && !last.allDay ? ", up to " + C.time12(last.by) + " on " + C.fmt.weekday.format(last.date) : "") + ".";
  }

  /* ---------- Summary ---------- */

  function priceTotal() {
    var members = priceMembers();
    var lo = 0;
    var hi = 0;
    selectedServices().forEach(function (s) {
      var r = lineRange(s, members);
      lo += r[0];
      hi += r[1];
    });
    return [lo, hi];
  }

  function minutesText() {
    var mins = totalMinutes();
    if (mins !== null) {
      return C.duration(mins);
    }
    var lo = 0;
    var hi = 0;
    selectedServices().forEach(function (s) {
      var r = C.minutesRange(s);
      lo += r[0];
      hi += r[1];
    });
    return C.duration(lo) + " to " + C.duration(hi);
  }

  function whoText() {
    if (!state.who || state.who.indexOf("pending-") === 0) {
      return null;
    }
    if (state.who !== "anyone") {
      return C.member(state.who).name;
    }
    var slot = chosenSlot();
    var names = (slot ? slot.members : eligible()).map(function (m) {
      return m.name;
    });
    return "Anyone free (" + joinNames(names) + ")";
  }

  function whenText() {
    var slot = chosenSlot();
    if (!slot) {
      return null;
    }
    var end = slot.time + totalMinutes();
    return C.fmt.long.format(state.date) + ", " + C.time12(slot.time) + " to " + C.time12(end);
  }

  function renderSummary() {
    var services = selectedServices();
    var members = priceMembers();
    ui.sumLines.textContent = "";
    if (!services.length) {
      ui.sumLines.appendChild(el("li", "sum-none", "No services chosen yet."));
    }
    services.forEach(function (s) {
      var li = el("li");
      var name = s.name + (C.priceKind(s) === "length" && state.length ? ", " + D.lengths[state.length].name.toLowerCase() + " hair" : "");
      li.appendChild(el("span", "", name));
      var r = lineRange(s, members);
      li.appendChild(el("span", "sum-price", C.moneyRange(r[0], r[1])));
      ui.sumLines.appendChild(li);
    });

    ui.sumWho.textContent = whoText() || "Not chosen yet";
    ui.sumWhen.textContent = whenText() || "Not chosen yet";
    ui.sumTime.textContent = services.length ? minutesText() : "–";

    var total = priceTotal();
    ui.sumPrice.textContent = services.length ? C.moneyRange(total[0], total[1]) : "£0";
    var notes = [];
    if (services.length && total[0] !== total[1]) {
      if (needsLength() && !state.length) {
        notes.push("Choose your hair length for an exact price.");
      }
      if (members.length > 1 && services.some(function (s) { return C.priceKind(s) === "level"; })) {
        notes.push("Cut prices depend on whether a stylist or a senior stylist is free.");
      }
    }
    ui.sumPriceNote.hidden = !notes.length;
    ui.sumPriceNote.textContent = notes.join(" ");

    var mins = totalMinutes();
    var deposit = mins !== null && mins >= D.depositMinutes;
    ui.sumDeposit.hidden = !deposit;
    ui.sumDeposit.textContent = deposit ? "This visit is three hours or more, so we ask for a " + C.money(D.deposit) + " deposit when we confirm. It comes off your bill." : "";

    if (mobileTotal) {
      mobileTotal.hidden = !services.length;
      document.body.classList.toggle("has-total", !!services.length);
      mobileTotal.querySelector("[data-mt-time]").textContent = services.length + (services.length === 1 ? " service · " : " services · ") + minutesText();
      mobileTotal.querySelector("[data-mt-price]").textContent = ui.sumPrice.textContent;
    }
  }

  // The bar at the bottom on phones steps aside while the summary itself is on screen.
  var mobileTotal = document.querySelector("[data-mobile-total]");
  if (mobileTotal && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      mobileTotal.classList.toggle("is-tucked", entries[0].isIntersecting);
    }).observe(form.querySelector(".summary"));
  }

  /* ---------- Sending ---------- */

  var nameInput = form.elements.name;
  var nameError = form.querySelector('[data-error-for="name"]');
  var skinError = form.querySelector('[data-error-for="skinDay"]');

  function problems() {
    var out = [];
    if (!state.selected.length) {
      out.push(["Choose at least one service.", "#services-title"]);
    } else if (!eligible().length) {
      out.push(["No one person does all of those services. Remove one.", "#services-title"]);
    }
    if (needsLength() && !state.length) {
      out.push(["Choose your hair length.", "input[name=length]"]);
    }
    if (colourChosen() && !state.colourBefore) {
      out.push(["Tell us if you have had colour with us in the last six months.", "input[name=colourBefore]"]);
    }
    if (state.selected.length && eligible().length && (!state.who || state.who.indexOf("pending-") === 0)) {
      out.push(["Choose who you would like.", "#who-title"]);
    }
    if (whenReady() && !chosenSlot()) {
      out.push(["Choose a day and a time.", "#when-title"]);
    }
    if (!nameInput.value.trim()) {
      out.push(["Add your name.", "input[name=name]"]);
    }
    if (needsSkin() && chosenSlot() && !ui.skinSelect.value) {
      out.push(["Choose a day for the skin test.", "#skin-day"]);
    }
    return out;
  }

  function invalid(field, error, bad) {
    error.hidden = !bad;
    if (bad) {
      field.setAttribute("aria-invalid", "true");
    } else {
      field.removeAttribute("aria-invalid");
    }
  }

  // Once a send has been stopped, the list of what is missing keeps itself up to date.
  function refreshProblems() {
    if (!ui.errors.hidden) {
      showProblems(problems(), { quiet: true });
    }
  }

  function showProblems(list, opts) {
    ui.errors.textContent = "";
    invalid(nameInput, nameError, !nameInput.value.trim());
    invalid(ui.skinSelect, skinError, needsSkin() && !!chosenSlot() && !ui.skinSelect.value);
    if (!list.length) {
      ui.errors.hidden = true;
      return;
    }
    ui.errors.appendChild(el("p", "", "Before you send:"));
    var ul = el("ul");
    list.forEach(function (item) {
      var li = el("li");
      var a = el("a", "", item[0]);
      a.href = "#";
      a.addEventListener("click", function (event) {
        event.preventDefault();
        var target = form.querySelector(item[1]);
        if (target) {
          target.focus();
          target.scrollIntoView({ block: "center" });
        }
      });
      li.appendChild(a);
      ul.appendChild(li);
    });
    ui.errors.appendChild(ul);
    ui.errors.hidden = false;
    if (!(opts && opts.quiet)) {
      ui.errors.focus();
    }
  }

  form.addEventListener("input", refreshProblems);
  form.addEventListener("change", function () {
    window.setTimeout(refreshProblems, 0);
  });
  ui.calDays.addEventListener("click", function () {
    window.setTimeout(refreshProblems, 0);
  });

  nameInput.addEventListener("input", function () {
    if (nameInput.value.trim()) {
      nameError.hidden = true;
      nameInput.removeAttribute("aria-invalid");
    }
  });

  ui.skinSelect.addEventListener("change", function () {
    if (ui.skinSelect.value) {
      skinError.hidden = true;
      ui.skinSelect.removeAttribute("aria-invalid");
    }
  });

  function message() {
    var slot = chosenSlot();
    var total = priceTotal();
    var lines = ["Hi " + D.name + ", I'd like to book an appointment, please.", "", "Services:"];
    selectedServices().forEach(function (s) {
      lines.push("- " + s.name + (C.priceKind(s) === "length" ? " (" + D.lengths[state.length].name.toLowerCase() + " hair)" : ""));
    });
    lines.push("With: " + whoText());
    lines.push("Day: " + C.fmt.long.format(state.date));
    lines.push("Time: " + C.time12(slot.time) + " to " + C.time12(slot.time + totalMinutes()) + " (" + C.duration(totalMinutes()) + ")");
    lines.push("Price on your website: " + C.moneyRange(total[0], total[1]));
    lines.push("Name: " + nameInput.value.trim());
    var mobile = form.elements.mobile.value.trim();
    if (mobile) {
      lines.push("Mobile: " + mobile);
    }
    if (colourChosen()) {
      if (needsSkin()) {
        var o = skinOptions().filter(function (x) {
          return C.isoDate(x.date) === ui.skinSelect.value;
        })[0];
        lines.push("Skin test: I'm new to colour with you, or it's been over six months. I'll pop in on " +
          C.fmt.long.format(o.date) + (o.allDay ? "" : ", before " + C.time12(o.by)) + ".");
      } else {
        lines.push("Colour with you in the last six months: yes");
      }
    }
    var note = form.elements.note.value.trim();
    if (note) {
      lines.push("Note: " + note);
    }
    return lines.join("\n");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var how = event.submitter && event.submitter.getAttribute("data-send") === "email" ? "email" : "whatsapp";
    var list = problems();
    showProblems(list);
    if (list.length) {
      return;
    }
    var text = message();

    if (D.sample && dialog && typeof dialog.showModal === "function") {
      dialog.querySelector("[data-message]").textContent = text;
      var to = dialog.querySelector("[data-sent-to]");
      to.lastChild.textContent = how === "email" ? " To " + D.email + " by email" : " To " + D.name + " on WhatsApp";
      dialog.querySelector("[data-sent-explain]").textContent = how === "email" ?
        "On the salon's real website, this button opens a new email with the message above ready to send. The salon replies to confirm the time." :
        "On the salon's real website, this button opens WhatsApp with the message above ready to send. The salon replies to confirm the time.";
      dialog.showModal();
      dialog.querySelector("#sent-title").focus();
      return;
    }

    if (how === "email") {
      var subject = "Appointment request: " + C.fmt.long.format(state.date) + ", " + C.time12(state.time);
      window.location.href = "mailto:" + D.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
      return;
    }
    var url = "https://wa.me/" + D.whatsapp + "?text=" + encodeURIComponent(text);
    var opened = window.open(url, "_blank");
    if (opened) {
      opened.opener = null;
    } else {
      window.location.href = url;
    }
  });

  if (dialog) {
    dialog.querySelectorAll("[data-close]").forEach(function (b) {
      b.addEventListener("click", function () {
        dialog.close();
      });
    });
    dialog.querySelector("[data-done]").addEventListener("click", function () {
      dialog.close();
    });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) {
        dialog.close();
      }
    });
  }

  /* ---------- Start: book.html?add=balayage or ?with=theo ---------- */

  buildServices();
  var params = new URLSearchParams(window.location.search);
  (params.get("add") || "").split(",").forEach(function (id) {
    var s = C.service(id);
    if (s && !s.quote && state.selected.indexOf(id) === -1) {
      state.selected.push(id);
      ui.groups.querySelector('input[value="' + id + '"]').checked = true;
    }
  });
  var withId = params.get("with");
  if (withId && C.member(withId)) {
    state.who = "pending-" + withId;
    state.cat = C.service(C.member(withId).does[0]).cat;
  }
  if (state.selected.length) {
    state.cat = C.service(state.selected[0]).cat;
  }
  afterServices();
  if (C.member(withId) && !state.selected.length) {
    ui.whoWaiting.textContent = "You asked for " + C.member(withId).name + ". Choose a service, and we will check they do it.";
  }
})();
