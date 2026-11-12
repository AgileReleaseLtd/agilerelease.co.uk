/* Booking page: a calendar of the next few weeks (busy and popular days marked), a start time, the move,
   access notes and inventory. The request becomes a WhatsApp message written on the visitor's own device;
   nothing is sent to or stored by this website. */
(function () {
  var D = window.HT;
  var E = window.HTEstimate;
  var T = window.HTDates;
  var S = window.HTSite;
  var el = S.el;

  var form = document.querySelector("[data-book]");
  if (!form) {
    return;
  }

  var params = S.params();
  var fromQuote = params.has("mode");
  var move = E.fromParams(params);
  var calDays = form.querySelector("[data-cal-days]");
  var picked = form.querySelector("[data-cal-picked]");
  var today = T.startOfDay(new Date());
  var first = T.addDays(today, 1);
  var last = T.addDays(first, D.bookingWeeks * 7 - 1);
  var selected = null;

  /* ---------- Calendar ---------- */

  function bookable(d) {
    return d >= first && d <= last && !T.closedReason(d);
  }

  function label(d) {
    var text = T.fmt.long.format(d);
    if (!(d >= first && d <= last)) {
      return text + (d < first ? ", not available" : ", not open for booking yet");
    }
    var closed = T.closedReason(d);
    if (closed) {
      return text + ", closed (" + closed + ")";
    }
    var dm = T.demand(d);
    var parts = [];
    if (dm.level === "busy") {
      parts.push("busy day");
    } else if (dm.level === "popular") {
      parts.push("popular day");
    } else if (dm.level === "quiet") {
      parts.push("usually easy to get");
    }
    if (dm.why && dm.level !== "quiet") {
      parts.push(dm.why.toLowerCase());
    }
    if (dm.mult > 1) {
      parts.push("labour plus " + Math.round((dm.mult - 1) * 100) + "%");
    }
    return text + (parts.length ? ", " + parts.join(", ") : "");
  }

  // One month at a time, with the next and previous buttons stopping at the booking window.
  var view = new Date(first.getFullYear(), first.getMonth(), 1);
  var prev = form.querySelector("[data-cal-prev]");
  var next = form.querySelector("[data-cal-next]");

  function renderCalendar() {
    var monthEnd = new Date(view.getFullYear(), view.getMonth() + 1, 0);
    var start = T.addDays(view, -((view.getDay() + 6) % 7));
    var end = T.addDays(monthEnd, (7 - monthEnd.getDay()) % 7);
    form.querySelector("[data-cal-title]").textContent = T.fmt.month.format(view);
    prev.disabled = view <= new Date(first.getFullYear(), first.getMonth(), 1);
    next.disabled = new Date(view.getFullYear(), view.getMonth() + 1, 1) > last;
    calDays.textContent = "";
    for (var d = start; d <= end; d = T.addDays(d, 1)) {
      if (d.getMonth() !== view.getMonth()) {
        var pad = el("span", "cal-pad");
        pad.setAttribute("aria-hidden", "true");
        calDays.appendChild(pad);
        continue;
      }
      var b = el("button", "cal-day");
      b.type = "button";
      b.tabIndex = -1;
      b.setAttribute("data-date", T.isoDate(d));
      b.appendChild(el("span", "cal-num", String(d.getDate())));
      if (!bookable(d)) {
        b.disabled = true;
        if (T.closedReason(d) && d >= first && d <= last) {
          b.classList.add("is-closed");
          b.appendChild(el("span", "cal-tag", "Closed"));
        }
      } else {
        var dm = T.demand(d);
        b.classList.add("is-" + dm.level);
        var tag = { busy: "Busy", popular: T.bankHoliday(d) ? "Bank hol" : "Popular", quiet: "", normal: "" }[dm.level];
        if (tag) {
          b.appendChild(el("span", "cal-tag", tag));
        }
      }
      var on = selected && T.sameDay(d, selected);
      b.setAttribute("aria-label", label(d));
      b.setAttribute("aria-pressed", String(!!on));
      if (on) {
        b.tabIndex = 0;
      }
      calDays.appendChild(b);
    }
    // Something must be reachable with Tab before a day is picked in this month.
    if (!calDays.querySelector('.cal-day[tabindex="0"]')) {
      var firstOpen = calDays.querySelector(".cal-day:not([disabled])");
      if (firstOpen) {
        firstOpen.tabIndex = 0;
      }
    }
  }

  function showMonth(d) {
    if (d.getFullYear() !== view.getFullYear() || d.getMonth() !== view.getMonth()) {
      view = new Date(d.getFullYear(), d.getMonth(), 1);
      renderCalendar();
    }
  }

  prev.addEventListener("click", function () {
    view = new Date(view.getFullYear(), view.getMonth() - 1, 1);
    renderCalendar();
  });
  next.addEventListener("click", function () {
    view = new Date(view.getFullYear(), view.getMonth() + 1, 1);
    renderCalendar();
  });

  function select(d, focus) {
    selected = d;
    showMonth(d);
    calDays.querySelectorAll(".cal-day").forEach(function (b) {
      var on = b.getAttribute("data-date") === T.isoDate(d);
      b.setAttribute("aria-pressed", String(on));
      b.tabIndex = on ? 0 : -1;
      if (on && focus) {
        b.focus();
      }
    });
    var dm = T.demand(d);
    picked.textContent = "";
    picked.appendChild(el("strong", "", T.fmt.full.format(d)));
    picked.append(dm.why ? ". " + dm.why + (dm.mult > 1 ? ": labour is " + Math.round((dm.mult - 1) * 100) + "% more." : ".") : ".");
    picked.className = "cal-picked is-" + dm.level;
    form.querySelector('[data-error="date"]').hidden = true;
    update();
  }

  calDays.addEventListener("click", function (event) {
    var b = event.target.closest(".cal-day");
    if (b && !b.disabled) {
      select(T.parseIso(b.getAttribute("data-date")));
    }
  });

  function nearest(d, dir) {
    for (; d >= first && d <= last; d = T.addDays(d, dir)) {
      if (bookable(d)) {
        return d;
      }
    }
    return null;
  }

  calDays.addEventListener("keydown", function (event) {
    var steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    var from = selected || nearest(first, 1);
    var target = null;
    if (steps[event.key]) {
      target = nearest(T.addDays(from, steps[event.key]), steps[event.key] > 0 ? 1 : -1);
    } else if (event.key === "Home") {
      target = nearest(first, 1);
    } else if (event.key === "End") {
      target = nearest(last, -1);
    }
    if (target) {
      event.preventDefault();
      select(target, true);
    }
  });

  /* ---------- Times, size, prefill ---------- */

  var times = form.querySelector("[data-times]");
  D.startTimes.forEach(function (t, i) {
    var r = el("input");
    r.type = "radio";
    r.name = "time";
    r.value = t.id;
    r.id = "time-" + i;
    r.checked = i === 0;
    var l = el("label", "pill", t.name);
    l.htmlFor = r.id;
    if (t.hint) {
      l.appendChild(el("small", "", t.hint));
    }
    times.append(r, l);
  });

  var sizeSelect = form.querySelector("[data-size-select]");
  var itemsOption = el("option", "", "A few items, or a student room");
  itemsOption.value = "items";
  sizeSelect.appendChild(itemsOption);
  D.sizeOrder.forEach(function (k) {
    var o = el("option", "", D.sizes[k].name);
    o.value = k;
    sizeSelect.appendChild(o);
  });
  sizeSelect.value = move.mode === "items" ? "items" : move.size;
  form.elements.from.value = move.from;
  form.elements.to.value = move.to;
  if (move.mode === "items" && E.itemsText(move.items)) {
    form.elements.inventory.value = E.itemsText(move.items).replace(/^./, function (c) {
      return c.toUpperCase();
    });
  }
  form.querySelector("[data-from-quote]").hidden = !fromQuote;
  form.querySelector("[data-no-quote]").hidden = fromQuote;

  var wanted = T.parseIso(params.get("date"));
  if (wanted && bookable(wanted)) {
    selected = wanted;
  }

  /* ---------- The move and its estimate ---------- */

  function current() {
    var m = JSON.parse(JSON.stringify(move));
    var size = sizeSelect.value;
    if (size === "items") {
      m.mode = "items";
    } else {
      m.mode = "rooms";
      m.size = size;
    }
    m.from = form.elements.from.value.trim();
    m.to = form.elements.to.value.trim();
    m.distanceMode = m.distanceMode === "band" && !m.from && !m.to ? "band" : "postcodes";
    m.day = selected ? T.demand(selected).day : "any";
    return m;
  }

  function placeNote(name) {
    var note = form.querySelector('[data-place="' + name + '"]');
    var field = form.elements[name];
    var v = field.value.trim();
    note.textContent = "";
    note.className = "field-note";
    field.removeAttribute("aria-invalid");
    if (!v) {
      return null;
    }
    var place = E.lookup(v);
    if (!place) {
      note.textContent = "We can't find that district. Check it, or just send the request and we'll ask.";
      note.classList.add("is-error");
      return null;
    }
    note.appendChild(S.icon("i-pin"));
    note.append(" " + E.placeLine(place));
    note.classList.add("is-ok");
    return place;
  }

  var sum = {
    route: document.querySelector("[data-sum-route]"),
    date: document.querySelector("[data-sum-date]"),
    time: document.querySelector("[data-sum-time]"),
    size: document.querySelector("[data-sum-size]"),
    price: document.querySelector("[data-sum-price]"),
    note: document.querySelector("[data-sum-note]")
  };
  var lastResult = null;

  function timeName() {
    var checked = form.querySelector('input[name="time"]:checked');
    var t = D.startTimes.filter(function (x) {
      return checked && x.id === checked.value;
    })[0] || D.startTimes[0];
    return t.name;
  }

  function update() {
    var m = current();
    var a = placeNote("from");
    var b = placeNote("to");
    var r = E.estimate(m);
    lastResult = { move: m, result: r };
    sum.route.textContent = (a ? a.code : "A") + " → " + (b ? b.code : "B");
    sum.date.textContent = selected ? T.fmt.long.format(selected) : "Pick a day";
    sum.time.textContent = timeName();
    sum.size.textContent = m.mode === "items" ? (E.itemsText(m.items) ? "A few items" : "A few items (list them below)") : D.sizes[m.size].name;
    sum.note.textContent = "";
    if (r.ok) {
      sum.price.textContent = E.money(r.low) + " to " + E.money(r.high);
      var bits = [E.crewText(r.load.van, r.crew) + ", about " + E.hoursText(r.hours) + "."];
      if (selected && T.demand(selected).mult > 1) {
        bits.push("Includes the " + (T.bankHoliday(selected) ? "bank holiday" : D.days[selected.getDay()].name) + " rate.");
      }
      sum.note.textContent = bits.join(" ");
    } else if (m.mode === "items" && !E.itemsText(m.items)) {
      sum.price.textContent = "From " + S.pounds(S.rate("small", 1)) + " an hour";
      sum.note.textContent = "We'll price it from your list.";
    } else {
      sum.price.textContent = a && b ? "We'll work it out" : "Add both postcodes";
    }
    var q = E.toParams(m);
    if (selected) {
      q.set("date", T.isoDate(selected));
    }
    form.querySelectorAll("[data-change-quote]").forEach(function (link) {
      link.href = "quote.html?" + E.toParams(m).toString();
    });
    if (window.history.replaceState) {
      var url = new URL(window.location.href);
      url.search = q.toString();
      window.history.replaceState(null, "", url);
    }
  }

  form.addEventListener("input", update);
  form.addEventListener("change", update);
  form.addEventListener("submit", function (event) {
    event.preventDefault();
  });
  ["from", "to"].forEach(function (name) {
    form.elements[name].addEventListener("blur", function () {
      var code = E.outward(form.elements[name].value);
      if (code && E.lookup(code)) {
        form.elements[name].value = code;
        update();
      }
    });
  });

  /* ---------- Sending ---------- */

  function check() {
    var problems = [];
    var dateErr = form.querySelector('[data-error="date"]');
    dateErr.hidden = !!selected;
    if (!selected) {
      problems.push(calDays.querySelector('.cal-day[tabindex="0"]'));
    }
    ["from", "to"].forEach(function (name) {
      var f = form.elements[name];
      if (!f.value.trim()) {
        var note = form.querySelector('[data-place="' + name + '"]');
        note.textContent = "Please add the postcode district.";
        note.className = "field-note is-error";
        f.setAttribute("aria-invalid", "true");
        problems.push(f);
      }
    });
    var name = form.elements.name;
    var nameErr = form.querySelector('[data-error="name"]');
    nameErr.hidden = !!name.value.trim();
    if (!name.value.trim()) {
      name.setAttribute("aria-invalid", "true");
      problems.push(name);
    } else {
      name.removeAttribute("aria-invalid");
    }
    document.querySelector('[data-error="summary"]').hidden = !problems.length;
    if (problems.length && problems[0]) {
      problems[0].focus();
    }
    return !problems.length;
  }

  function message() {
    var m = lastResult.move;
    var r = lastResult.result;
    var lines = ["Hi " + D.name + ", I'd like to book a move.", ""];
    lines.push("Date: " + T.fmt.full.format(selected));
    lines.push("Start: " + timeName());
    var moveLines = E.describe(m, r).filter(function (l) {
      return l.indexOf("Day:") !== 0;
    });
    if (!fromQuote) {
      // Without an estimate we don't know the stairs or parking yet: leave those to the notes.
      // There's no item list on this page either: say what kind of move it is, and the list follows below.
      moveLines = moveLines.map(function (l) {
        return l.replace(/, ground floor or a house\. Parking: outside or on a driveway$/, "").replace(/^Online estimate: /, "Rough estimate, before stairs and parking: ").replace(/^Items: none yet$/, "Move: a few items, or a student room");
      });
    }
    lines = lines.concat(moveLines);
    var access = form.elements.access.value.trim();
    var inventory = form.elements.inventory.value.trim();
    lines.push("");
    lines.push("Access notes: " + (access || "none yet"));
    lines.push("Inventory: " + (inventory || "I'll send a list"));
    if (form.elements.photos.checked) {
      lines.push("Photos: I'll send photos or a video in this chat.");
    }
    lines.push("");
    lines.push("Name: " + form.elements.name.value.trim());
    if (form.elements.phone.value.trim()) {
      lines.push("Phone: " + form.elements.phone.value.trim());
    }
    return lines.join("\n");
  }

  document.querySelector("[data-book-send]").addEventListener("click", function () {
    update();
    if (!check()) {
      return;
    }
    S.sendWhatsApp(message(), "booking request");
  });

  document.querySelector("[data-book-email]").addEventListener("click", function (event) {
    event.preventDefault();
    update();
    if (!check()) {
      return;
    }
    if (D.sample && typeof HTMLDialogElement === "function") {
      S.showDialog("Your email is ready", "On the real website, this opens a new email to " + D.name + " with your booking request written out:", message());
      return;
    }
    window.location.href = S.emailLink("Booking request", message());
  });

  form.elements.name.addEventListener("input", function () {
    if (form.elements.name.value.trim()) {
      form.querySelector('[data-error="name"]').hidden = true;
      form.elements.name.removeAttribute("aria-invalid");
    }
  });

  if (selected) {
    view = new Date(selected.getFullYear(), selected.getMonth(), 1);
  }
  renderCalendar();
  if (selected) {
    select(selected);
  }
  update();
})();
