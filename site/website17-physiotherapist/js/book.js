/* Booking page: choose an appointment type, a practitioner (or first available), a day and a time from
   their working pattern up to three weeks ahead, then the form writes a WhatsApp message. The message is
   written on the visitor's own device; nothing is sent to or stored by this website. */
(function () {
  "use strict";
  var D = window.Spindle;
  var C = window.SpindleCore;

  var form = document.querySelector("[data-booking]");
  if (!form) {
    return;
  }
  var whoBox = form.querySelector("[data-who]");
  var whoNote = form.querySelector("[data-who-note]");
  var daysBox = form.querySelector("[data-days]");
  var weekTitle = form.querySelector("[data-week-title]");
  var weekButtons = form.querySelectorAll("[data-week]");
  var timesBox = form.querySelector("[data-times]");
  var timesTitle = form.querySelector("[data-times-title]");
  var timesHint = form.querySelector("[data-times-hint]");
  var nameInput = form.elements.name;
  var nameError = form.querySelector('[data-error-for="name"]');
  var insurerSelect = form.querySelector("[data-insurer-select]");
  var insurerError = form.querySelector('[data-error-for="insurer"]');
  var insuranceBox = form.querySelector("[data-insurance]");
  var visitedWrap = form.querySelector("[data-visited-wrap]");
  var packageOption = form.querySelector("[data-package-option]");
  var errors = form.querySelector("[data-errors]");
  var errorList = form.querySelector("[data-error-list]");
  var dialog = document.getElementById("sent-dialog");
  var sum = {};
  document.querySelectorAll("[data-sum]").forEach(function (node) {
    sum[node.getAttribute("data-sum")] = node;
  });

  var now = C.now();
  var win = C.bookingWindow(now);
  var firstMonday = mondayOf(win.first);
  var weekCount = Math.round((mondayOf(win.last) - firstMonday) / (7 * 86400000)) + 1;

  var state = { type: null, who: "any", day: null, time: null, week: 0 };

  var PAY = {
    self: "Paying myself",
    insurance: "Health insurance",
    cashplan: "Health cash plan (I pay and claim back)",
    package: "From my package"
  };

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

  function mondayOf(d) {
    return C.addDays(C.startOfDay(d), -((d.getDay() + 6) % 7));
  }

  function inWindow(d) {
    return d >= win.first && d <= win.last;
  }

  function hasPackage(typeId) {
    return D.packages.some(function (p) {
      return p.type === typeId;
    });
  }

  function names(ids) {
    var first = ids.map(function (id) {
      return D.practitioners[id].first;
    });
    if (first.length < 2) {
      return first.join("");
    }
    return first.slice(0, -1).join(", ") + " or " + first[first.length - 1];
  }

  function slotsFor(d) {
    return state.type ? C.slotsOn(d, state.type, state.who, now) : [];
  }

  /* ---------- Step 1: appointment type ---------- */

  function renderTypes() {
    form.querySelectorAll("[data-types]").forEach(function (box) {
      var kind = box.getAttribute("data-types");
      box.textContent = "";
      Object.keys(D.types).forEach(function (id) {
        var t = D.types[id];
        if (t.kind !== kind) {
          return;
        }
        var label = el("label", "choice");
        var input = el("input");
        input.type = "radio";
        input.name = "type";
        input.value = id;
        var boxEl = el("span", "choice-box");
        var top = el("span", "choice-top");
        top.appendChild(el("span", "choice-title", kind === "massage" ? t.minutes + " minutes" : t.name));
        top.appendChild(el("span", "choice-price", C.money(t.price)));
        boxEl.appendChild(top);
        boxEl.appendChild(el("span", "choice-meta", (kind === "massage" ? "" : t.minutes + " min. ") + t.short));
        label.append(input, boxEl);
        box.appendChild(label);
      });
    });
  }

  /* ---------- Step 2: who ---------- */

  function renderWho() {
    var people = state.type ? C.practitionersFor(state.type) : Object.keys(D.practitioners);
    whoNote.hidden = true;
    if (state.who !== "any" && people.indexOf(state.who) === -1) {
      var p = D.practitioners[state.who];
      whoNote.textContent = p.first + " does not do " + D.types[state.type].name.toLowerCase().replace(/, (\d+) minutes/, " ($1 minutes)") + " appointments, so we have chosen first available.";
      whoNote.hidden = false;
      state.who = "any";
    }
    whoBox.textContent = "";
    ["any"].concat(people).forEach(function (id) {
      var label = el("label", "choice who-choice" + (id === "any" ? " who-any" : ""));
      var input = el("input");
      input.type = "radio";
      input.name = "who";
      input.value = id;
      input.checked = id === state.who;
      var box = el("span", "choice-box");
      var mono = el("span", "who-mono", id === "any" ? "Any" : D.practitioners[id].initials);
      mono.setAttribute("aria-hidden", "true");
      var text = el("span", "who-text");
      if (id === "any") {
        text.appendChild(el("span", "choice-title", "First available"));
        text.appendChild(el("span", "choice-meta", state.type ? "Whoever is free: " + names(people) : "Whoever is free first"));
      } else {
        text.appendChild(el("span", "choice-title", D.practitioners[id].name));
        text.appendChild(el("span", "choice-meta", D.practitioners[id].role));
      }
      box.append(mono, text);
      label.append(input, box);
      whoBox.appendChild(label);
    });
  }

  /* ---------- Step 3: day and time ---------- */

  function weekStart(i) {
    return C.addDays(firstMonday, 7 * i);
  }

  function renderWeek() {
    var start = weekStart(state.week);
    var end = C.addDays(start, 6);
    var range = start.getMonth() === end.getMonth()
      ? start.getDate() + " to " + C.fmt.dayMonth.format(end)
      : C.fmt.dayMonth.format(start) + " to " + C.fmt.dayMonth.format(end);
    weekTitle.textContent = (state.week === 0 ? "This week: " : state.week === 1 ? "Next week: " : "") + range;
    weekButtons[0].disabled = state.week === 0;
    weekButtons[1].disabled = state.week >= weekCount - 1;

    daysBox.querySelectorAll(".day").forEach(function (n) {
      n.remove();
    });
    for (var i = 0; i < 7; i++) {
      var d = C.addDays(start, i);
      var iso = C.isoDate(d);
      var label = el("label", "day" + (C.sameDay(d, now) ? " is-today" : ""));
      var input = el("input");
      input.type = "radio";
      input.name = "day";
      input.value = iso;
      input.checked = state.day === iso;

      var reason = C.closedReason(d);
      var free = "";
      var spoken = C.fmt.long.format(d);
      if (!inWindow(d)) {
        input.disabled = true;
        spoken += d < win.first ? ", in the past" : ", too far ahead to book online";
      } else if (reason || !C.clinicHours(d).length) {
        input.disabled = true;
        free = "Closed";
        spoken += ", clinic closed" + (reason ? " (" + reason + ")" : "");
      } else if (state.type) {
        var n = slotsFor(d).length;
        input.disabled = n === 0;
        free = n ? String(n) : "None";
        spoken += n ? ", " + n + (n === 1 ? " time" : " times") : ", no times";
      }

      var box = el("span", "day-box");
      box.setAttribute("aria-hidden", "true");
      box.appendChild(el("span", "day-name", C.fmt.weekdayShort.format(d)));
      box.appendChild(el("span", "day-num", String(d.getDate())));
      var freeEl = el("span", "day-free", free || "\u00a0");
      if (/^\d+$/.test(free)) {
        freeEl.appendChild(el("span", "day-free-unit", free === "1" ? " time" : " times"));
      }
      box.appendChild(freeEl);
      var sr = el("span", "visually-hidden", (C.sameDay(d, now) ? "Today, " : "") + spoken);
      label.append(input, sr, box);
      daysBox.appendChild(label);
    }
  }

  function firstDayWithTimes() {
    for (var d = win.first; d <= win.last; d = C.addDays(d, 1)) {
      if (slotsFor(d).length) {
        return d;
      }
    }
    return null;
  }

  function showDay(d) {
    state.day = C.isoDate(d);
    state.week = Math.round((mondayOf(d) - firstMonday) / (7 * 86400000));
  }

  // After the type or the person changes: keep the chosen day and time if they still work.
  function refreshWhen() {
    if (state.type) {
      var d = state.day ? C.parseIso(state.day) : null;
      if (!d || !slotsFor(d).length) {
        var next = firstDayWithTimes();
        if (next) {
          showDay(next);
        } else {
          state.day = null;
        }
      }
      if (state.time && state.day && !slotsFor(C.parseIso(state.day)).some(function (s) {
        return s.time === state.time;
      })) {
        state.time = null;
      }
    }
    renderWeek();
    renderTimes();
  }

  function groupOf(minutes) {
    return minutes < 12 * 60 ? "Morning" : minutes < 17 * 60 ? "Afternoon" : "Evening";
  }

  function renderTimes() {
    timesBox.textContent = "";
    timesHint.textContent = "";
    if (!state.type) {
      timesTitle.textContent = "Times";
      timesBox.appendChild(el("p", "empty-note", "Choose what you would like to book, and the times appear here."));
      return;
    }
    if (!state.day) {
      timesTitle.textContent = "Times";
      timesBox.appendChild(el("p", "empty-note", "Choose a day to see the times."));
      return;
    }
    var d = C.parseIso(state.day);
    timesTitle.textContent = "Times on " + C.fmt.long.format(d);
    timesHint.textContent = state.who === "any" ? "First available" : "With " + D.practitioners[state.who].first;
    var slots = slotsFor(d);
    if (!slots.length) {
      var p = el("p", "empty-note", "No times on this day.");
      var next = firstDayWithTimes();
      if (next) {
        var b = el("button", "", "Go to the first day with times");
        b.type = "button";
        b.addEventListener("click", function () {
          showDay(next);
          state.time = null;
          renderWeek();
          renderTimes();
          timesTitle.focus();
        });
        p.appendChild(b);
      }
      timesBox.appendChild(p);
      return;
    }
    var groups = {};
    var order = [];
    slots.forEach(function (s) {
      var g = groupOf(s.minutes);
      if (!groups[g]) {
        groups[g] = [];
        order.push(g);
      }
      groups[g].push(s);
    });
    order.forEach(function (g) {
      var fs = el("fieldset", "time-group");
      fs.appendChild(el("legend", "", g));
      var grid = el("div", "times");
      groups[g].forEach(function (s) {
        var label = el("label", "time");
        var input = el("input");
        input.type = "radio";
        input.name = "time";
        input.value = s.time;
        input.checked = state.time === s.time;
        input.setAttribute("data-who", s.who.join(","));
        var box = el("span", "time-box");
        box.appendChild(el("span", "time-at", C.clock(s.time)));
        if (state.who === "any") {
          box.appendChild(el("span", "time-who", s.who.map(function (id) {
            return D.practitioners[id].first;
          }).join(" · ")));
        }
        label.append(input, box);
        grid.appendChild(label);
      });
      fs.appendChild(grid);
      timesBox.appendChild(fs);
    });
  }

  /* ---------- Step 4 and the summary ---------- */

  function chosenSlot() {
    if (!state.type || !state.day || !state.time) {
      return null;
    }
    return slotsFor(C.parseIso(state.day)).filter(function (s) {
      return s.time === state.time;
    })[0] || null;
  }

  function payValue() {
    var checked = form.querySelector('input[name="pay"]:checked');
    return checked ? checked.value : "self";
  }

  function syncPayment() {
    var canPackage = state.type && hasPackage(state.type);
    packageOption.hidden = !canPackage;
    if (!canPackage && payValue() === "package") {
      form.querySelector('input[name="pay"][value="self"]').checked = true;
    }
    insuranceBox.hidden = payValue() !== "insurance";
    visitedWrap.hidden = state.type === "follow";
  }

  function whoText(slot) {
    if (state.who !== "any") {
      return D.practitioners[state.who].name;
    }
    return slot ? "First available (" + names(slot.who) + ")" : "First available";
  }

  function payText() {
    var pay = payValue();
    if (pay === "insurance" && insurerSelect.value) {
      return "Health insurance (" + insurerSelect.value + ")";
    }
    return PAY[pay];
  }

  function setSum(key, text, empty) {
    sum[key].textContent = text;
    sum[key].classList.toggle("is-empty", !!empty);
  }

  function updateSummary() {
    var t = state.type ? D.types[state.type] : null;
    var slot = chosenSlot();
    setSum("type", t ? t.name + ", " + t.minutes + " min" : "Not chosen yet", !t);
    setSum("who", whoText(slot));
    var whenText = "Not chosen yet";
    if (slot) {
      whenText = C.fmt.short.format(C.parseIso(state.day)) + ", " + C.clock(slot.time);
    } else if (state.type && state.day) {
      whenText = C.fmt.short.format(C.parseIso(state.day)) + ", choose a time";
    }
    setSum("when", whenText, !slot);
    setSum("pay", payText());
    var pay = payValue();
    var price = t ? C.money(t.price) : "£0";
    if (t && pay === "insurance") {
      price += ", billed to your insurer";
    } else if (t && pay === "package") {
      price = "From your package";
    }
    setSum("price", price, !t);
  }

  function message(slot) {
    var t = D.types[state.type];
    var lines = [
      "Hi Spindle Physio, I'd like to book an appointment.",
      "",
      "Appointment: " + t.name + " (" + t.minutes + " min, " + C.money(t.price) + ")",
      "With: " + whoText(slot),
      "Day: " + C.fmt.long.format(C.parseIso(state.day)),
      "Time: " + C.clock(slot.time),
      "Name: " + nameInput.value.trim()
    ];
    if (!visitedWrap.hidden) {
      var visited = form.querySelector('input[name="visited"]:checked');
      lines.push("Been before: " + (visited && visited.value === "yes" ? "Yes" : "No, first time"));
    }
    var pay = payValue();
    var payLine = "Paying: " + PAY[pay];
    if (pay === "insurance") {
      payLine = "Paying: Health insurance, " + insurerSelect.value;
      var auth = form.elements.auth.value.trim();
      payLine += auth ? ", authorisation code " + auth : ", authorisation code to follow";
    }
    lines.push(payLine);
    var note = form.elements.note.value.trim();
    if (note) {
      lines.push("About the problem: " + note);
    }
    lines.push("", "Please confirm, or let me know the nearest free time.");
    return lines.join("\n");
  }

  /* ---------- Validation and sending ---------- */

  function addError(text, target) {
    var li = el("li");
    var a = el("a", "", text);
    a.href = "#" + target.id;
    a.addEventListener("click", function (event) {
      event.preventDefault();
      target.focus();
      target.scrollIntoView({ block: "center" });
    });
    li.appendChild(a);
    errorList.appendChild(li);
  }

  function ensureId(node, id) {
    if (!node.id) {
      node.id = id;
    }
    return node;
  }

  // fromSubmit: also refresh the times, in case the page has been open long enough for the chosen
  // time to pass. While the visitor is still filling in the form, nothing is redrawn.
  function validate(fromSubmit) {
    errorList.textContent = "";
    var ok = true;
    if (!state.type) {
      addError("Choose what you would like to book", ensureId(form.querySelector('input[name="type"]'), "first-type"));
      ok = false;
    }
    if (fromSubmit) {
      now = C.now();
    }
    if (state.type && !chosenSlot()) {
      if (fromSubmit) {
        state.time = null;
        renderTimes();
      }
      var target = form.querySelector('input[name="time"]') || form.querySelector('input[name="day"]:not(:disabled)') || weekButtons[1];
      addError("Choose a day and a time", ensureId(target, "first-time"));
      ok = false;
    }
    var name = nameInput.value.trim();
    nameError.hidden = !!name;
    if (name) {
      nameInput.removeAttribute("aria-invalid");
    } else {
      nameInput.setAttribute("aria-invalid", "true");
      addError("Add your name", nameInput);
      ok = false;
    }
    var needInsurer = payValue() === "insurance" && !insurerSelect.value;
    insurerError.hidden = !needInsurer;
    if (needInsurer) {
      insurerSelect.setAttribute("aria-invalid", "true");
      addError("Choose your insurer", insurerSelect);
      ok = false;
    } else {
      insurerSelect.removeAttribute("aria-invalid");
    }
    errors.hidden = ok;
    return ok;
  }

  // After a first try, the error list follows the form as it is fixed.
  var tried = false;
  function recheck() {
    if (tried && !errors.hidden) {
      validate(false);
    }
  }
  form.addEventListener("input", function (event) {
    if (event.target.type !== "radio") {
      recheck();
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    tried = true;
    if (!validate(true)) {
      errors.focus();
      return;
    }
    var slot = chosenSlot();
    var text = message(slot);
    var emailLink = dialog.querySelector("[data-email-link]");
    emailLink.href = "mailto:" + D.email + "?subject=" + encodeURIComponent("Booking request: " + D.types[state.type].name) + "&body=" + encodeURIComponent(text);

    if (D.sample && typeof dialog.showModal === "function") {
      dialog.querySelector("[data-message]").textContent = text;
      dialog.showModal();
      dialog.querySelector("#sent-title").focus();
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

  /* ---------- Events ---------- */

  form.addEventListener("change", function (event) {
    var t = event.target;
    if (t.name === "type") {
      state.type = t.value;
      renderWho();
      refreshWhen();
      syncPayment();
    } else if (t.name === "who") {
      state.who = t.value;
      whoNote.hidden = true;
      refreshWhen();
    } else if (t.name === "day") {
      state.day = t.value;
      state.time = null;
      renderTimes();
    } else if (t.name === "time") {
      state.time = t.value;
    } else if (t.name === "pay") {
      syncPayment();
    }
    if (t.name === "insurer" && t.value) {
      insurerError.hidden = true;
      insurerSelect.removeAttribute("aria-invalid");
    }
    updateSummary();
    recheck();
  });

  nameInput.addEventListener("input", function () {
    if (nameInput.value.trim()) {
      nameError.hidden = true;
      nameInput.removeAttribute("aria-invalid");
    }
  });

  weekButtons.forEach(function (b) {
    b.addEventListener("click", function () {
      state.week = Math.max(0, Math.min(weekCount - 1, state.week + Number(b.getAttribute("data-week"))));
      renderWeek();
      // Keep focus on a button that still works.
      if (b.disabled) {
        weekButtons[b === weekButtons[0] ? 1 : 0].focus();
      }
    });
  });

  /* ---------- Start ---------- */

  D.insurers.forEach(function (name) {
    var o = el("option", "", name);
    o.value = name;
    insurerSelect.appendChild(o);
  });
  var other = el("option", "", "Another insurer (tell us in the note)");
  other.value = "another insurer";
  insurerSelect.appendChild(other);

  renderTypes();

  // From the address: ?type=initial, ?with=grace, ?about=knee-ligaments
  var params = new URLSearchParams(window.location.search);
  var wantType = params.get("type");
  var wantWho = params.get("with");
  var about = params.get("about");
  if (wantWho && D.practitioners[wantWho]) {
    state.who = wantWho;
    if (!wantType) {
      // Someone who only does one kind of appointment: start with their most booked type.
      var theirs = D.practitioners[wantWho].types;
      wantType = theirs.indexOf("initial") !== -1 ? "initial" : theirs[theirs.length - 1];
    }
  }
  if (wantType && D.types[wantType]) {
    state.type = wantType;
    form.querySelector('input[name="type"][value="' + wantType + '"]').checked = true;
  }
  var cond = D.conditions.filter(function (c) {
    return c.id === about;
  })[0];
  if (cond) {
    form.elements.note.value = cond.name + ": ";
  }

  renderWho();
  // ?date=2026-11-12&time=09:30 (from the home page's "next initial assessment") picks that time if it is free.
  var wantDay = C.parseIso(params.get("date"));
  if (state.type && wantDay && slotsFor(wantDay).length) {
    showDay(wantDay);
    var wantTime = params.get("time");
    if (slotsFor(wantDay).some(function (s) {
      return s.time === wantTime;
    })) {
      state.time = wantTime;
    }
  }
  refreshWhen();
  syncPayment();
  updateSummary();
})();
