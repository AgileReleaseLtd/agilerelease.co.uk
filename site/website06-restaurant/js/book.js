/* The booking page: party size, a calendar of the days that can be booked, the times for the chosen day
   (sittings on busy nights), feast, occasion and dietary needs. The request becomes a WhatsApp message (or an
   email) written on the visitor's own device; nothing is sent to or stored by this website. */
(function () {
  var data = window.Jonjoli;
  var T = window.JonjoliTime;
  var UI = window.JonjoliUI;
  var el = UI.el;
  var money = UI.money;

  var form = document.querySelector("[data-booking-form]");
  if (!form) {
    return;
  }
  var B = data.booking;
  var sizesBox = form.querySelector("[data-sizes]");
  var groupNote = form.querySelector("[data-group-note]");
  var groupLink = form.querySelector("[data-group-link]");
  var calDays = form.querySelector("[data-cal-days]");
  var calTitle = form.querySelector("[data-cal-title]");
  var slotsBox = form.querySelector("[data-slots]");
  var timeError = form.querySelector('[data-error-for="time"]');
  var feastBox = form.querySelector("[data-feast-options]");
  var occasion = form.querySelector("[data-occasions]");
  var nameInput = form.elements.name;
  var nameError = form.querySelector('[data-error-for="name"]');
  var otherSteps = form.querySelectorAll('.step:not([data-step="guests"]), .send');
  var sum = {};
  document.querySelectorAll("[data-sum]").forEach(function (node) {
    sum[node.getAttribute("data-sum")] = node;
  });
  var sumNotes = document.querySelectorAll("[data-sum-note]");

  var now = T.now();
  var win = T.bookingWindow(now);
  var params = new URLSearchParams(window.location.search);
  var state = { guests: 2, group: false, date: null, slot: null, service: null };

  /* ---------- Party size ---------- */

  function buildSizes() {
    var wanted = parseInt(params.get("guests"), 10);
    if (wanted >= 1 && wanted <= B.maxGuests) {
      state.guests = wanted;
    }
    for (var n = 1; n <= B.maxGuests + 1; n++) {
      var group = n > B.maxGuests;
      var label = el("label", "chip-radio");
      var input = el("input");
      input.type = "radio";
      input.name = "guests";
      input.value = group ? "group" : String(n);
      input.checked = !group && n === state.guests;
      label.appendChild(input);
      label.appendChild(document.createTextNode(group ? n + "+" : String(n)));
      label.appendChild(el("span", "visually-hidden", group ? " or more people" : n === 1 ? " person" : " people"));
      sizesBox.appendChild(label);
    }
    sizesBox.addEventListener("change", function () {
      var v = form.elements.guests.value;
      state.group = v === "group";
      if (!state.group) {
        state.guests = +v;
      }
      groupNote.hidden = !state.group;
      form.classList.toggle("is-group", state.group);
      otherSteps.forEach(function (step) {
        step.inert = state.group;
      });
      groupLink.href = "private-dining.html?guests=" + (B.maxGuests + 1) + "#enquire";
      feastOptions();
      summary();
    });
  }

  /* ---------- Calendar ---------- */

  function selectable(d) {
    return !T.whyNotBookable(d, now);
  }

  function inWindow(d) {
    return d >= win.first && d <= win.last;
  }

  // Monday of the first week to Sunday of the last week, so the grid lines up under Mon ... Sun.
  function gridRange() {
    return {
      start: T.addDays(win.first, -((win.first.getDay() + 6) % 7)),
      end: T.addDays(win.last, (7 - win.last.getDay()) % 7)
    };
  }

  function renderCalendar() {
    var range = gridRange();
    var firstMonth = T.fmt.month.format(win.first);
    var lastMonth = T.fmt.month.format(win.last);
    if (firstMonth === lastMonth) {
      calTitle.textContent = firstMonth;
    } else if (win.first.getFullYear() === win.last.getFullYear()) {
      calTitle.textContent = T.fmt.monthName.format(win.first) + " to " + lastMonth;
    } else {
      calTitle.textContent = firstMonth + " to " + lastMonth;
    }
    calDays.textContent = "";
    for (var d = range.start; d <= range.end; d = T.addDays(d, 1)) {
      var b = el("button", "cal-day");
      b.type = "button";
      b.setAttribute("data-date", T.isoDate(d));
      b.tabIndex = -1;
      if (d.getDate() === 1) {
        b.appendChild(el("small", "cal-mon", T.fmt.monthShort.format(d)));
      }
      b.appendChild(el("span", "cal-num", String(d.getDate())));
      var label = T.fmt.long.format(d);
      var why = inWindow(d) ? T.whyNotBookable(d, now) : (d < win.first ? "In the past" : "Not open for booking yet");
      if (why) {
        b.disabled = true;
        label += ", " + why.toLowerCase();
        if (inWindow(d) && why !== "Too late to book online today") {
          b.classList.add("is-closed");
          b.title = why;
        }
      }
      if (T.sameDay(d, win.first)) {
        b.classList.add("is-today");
        label = "Today, " + label;
      }
      b.setAttribute("aria-label", label);
      b.setAttribute("aria-pressed", "false");
      calDays.appendChild(b);
    }
  }

  function dayButton(d) {
    return calDays.querySelector('[data-date="' + T.isoDate(d) + '"]');
  }

  function selectDate(d, opts) {
    opts = opts || {};
    state.date = d;
    calDays.querySelectorAll(".cal-day").forEach(function (b) {
      var on = b.getAttribute("data-date") === T.isoDate(d);
      b.setAttribute("aria-pressed", String(on));
      b.tabIndex = on ? 0 : -1;
    });
    if (opts.focus) {
      dayButton(d).focus();
    }
    renderSlots();
    summary();
  }

  calDays.addEventListener("click", function (event) {
    var b = event.target.closest(".cal-day");
    if (!b || b.disabled) {
      return;
    }
    selectDate(T.parseIso(b.getAttribute("data-date")));
  });

  function nearestSelectable(d, dir) {
    for (; inWindow(d); d = T.addDays(d, dir)) {
      if (selectable(d)) {
        return d;
      }
    }
    return null;
  }

  // Arrow keys move a day (left, right) or a week (up, down); Home and End go to the first and last day.
  calDays.addEventListener("keydown", function (event) {
    var steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    var target = null;
    if (steps[event.key]) {
      target = nearestSelectable(T.addDays(state.date, steps[event.key]), steps[event.key] > 0 ? 1 : -1);
    } else if (event.key === "Home") {
      target = nearestSelectable(win.first, 1);
    } else if (event.key === "End") {
      target = nearestSelectable(win.last, -1);
    }
    if (target) {
      event.preventDefault();
      selectDate(target, { focus: true });
    }
  });

  /* ---------- Times ---------- */

  function renderSlots() {
    var keep = state.slot ? state.slot.time : "";
    state.slot = null;
    state.service = null;
    slotsBox.textContent = "";
    timeError.hidden = true;
    var services = T.servicesOn(state.date, now);
    var any = false;
    services.forEach(function (svc) {
      var open = svc.slots.filter(function (s) {
        return s.ok;
      });
      if (!open.length) {
        return;
      }
      any = true;
      var group = el("div", "slot-group");
      group.setAttribute("role", "group");
      group.setAttribute("aria-labelledby", "svc-" + svc.name.replace(/\W+/g, "-").toLowerCase());
      var h = el("p", "slot-group-title", svc.name);
      h.id = "svc-" + svc.name.replace(/\W+/g, "-").toLowerCase();
      h.appendChild(el("span", "", svc.sittings
        ? "Two sittings"
        : "From " + open[0].label + ", last table at " + open[open.length - 1].label));
      group.appendChild(h);
      var grid = el("div", "slot-grid" + (svc.sittings ? " slot-grid-sittings" : ""));
      open.forEach(function (s) {
        var label = el("label", "chip-radio");
        var input = el("input");
        input.type = "radio";
        input.name = "time";
        input.value = s.time;
        input.setAttribute("data-service", svc.name);
        input.checked = s.time === keep;
        if (input.checked) {
          state.slot = s;
          state.service = svc.name;
        }
        label.appendChild(input);
        label.appendChild(document.createTextNode(s.label));
        if (s.note) {
          label.appendChild(el("small", "", s.note));
        }
        grid.appendChild(label);
      });
      group.appendChild(grid);
      slotsBox.appendChild(group);
    });
    if (!any) {
      slotsBox.appendChild(el("p", "slots-empty", "There are no more tables to book online on this day. Please choose another day."));
    } else if (T.sameDay(state.date, win.first)) {
      slotsBox.appendChild(el("p", "field-hint", "For a table in the next " + B.noticeMinutes / 60 + " hours, please call us on " + data.phone + "."));
    }
  }

  slotsBox.addEventListener("change", function (event) {
    var input = event.target;
    if (input.name !== "time") {
      return;
    }
    state.service = input.getAttribute("data-service");
    state.slot = T.servicesOn(state.date, now).reduce(function (found, svc) {
      return found || svc.slots.filter(function (s) {
        return s.time === input.value && svc.name === state.service;
      })[0];
    }, null);
    timeError.hidden = true;
    summary();
  });

  /* ---------- Feast, occasion ---------- */

  function feastOptions() {
    var current = form.elements.feast ? form.elements.feast.value : (params.get("feast") || "");
    feastBox.textContent = "";
    var choices = [{ id: "", name: "From the menu", sub: "Order on the night" }];
    data.feasts.forEach(function (f) {
      if (!f.groups) {
        choices.push({ id: f.id, name: f.name, sub: money(f.price) + " a head" + (f.vegan ? ", all vegan" : "") + ", for " + f.minGuests + " or more", min: f.minGuests });
      }
    });
    choices.forEach(function (c) {
      var label = el("label", "option");
      var input = el("input");
      input.type = "radio";
      input.name = "feast";
      input.value = c.id;
      input.disabled = !!c.min && state.guests < c.min;
      input.checked = c.id === current && !input.disabled;
      var span = el("span");
      span.appendChild(el("strong", "", c.name));
      span.appendChild(document.createTextNode(c.sub));
      label.append(input, span);
      feastBox.appendChild(label);
    });
    if (!form.elements.feast.value) {
      feastBox.querySelector("input").checked = true;
    }
  }

  feastBox.addEventListener("change", summary);

  function buildOccasions() {
    B.occasions.forEach(function (o) {
      var opt = el("option", "", o);
      opt.value = o;
      occasion.appendChild(opt);
    });
  }

  /* ---------- Summary ---------- */

  function chosenFeast() {
    var id = form.elements.feast ? form.elements.feast.value : "";
    return data.feasts.filter(function (f) {
      return f.id === id;
    })[0] || null;
  }

  function people(n) {
    return n + (n === 1 ? " person" : " people");
  }

  function summary() {
    sum.guests.textContent = state.group ? (B.maxGuests + 1) + " or more" : people(state.guests);
    sum.day.textContent = state.date ? T.fmt.long.format(state.date) : "Choose a day";
    sum.time.textContent = state.slot ? state.slot.label + (state.slot.note ? " (" + sittingName(state.slot) + ")" : "") : "Choose a time";
    var feast = chosenFeast();
    sum.feast.textContent = feast ? feast.name : "From the menu";

    var notes = [];
    if (!state.group && state.guests >= B.depositFrom) {
      notes.push("Tables of " + B.depositFrom + " to " + B.maxGuests + " pay a deposit of " + money(B.depositPerHead) + " a head (" + money(B.depositPerHead * state.guests) + " for " + state.guests + ") when we confirm. It comes off your bill.");
    }
    if (state.slot && state.slot.note) {
      notes.push(state.slot.note + ".");
    }
    sumNotes.forEach(function (node) {
      node.textContent = notes.join(" ");
      node.hidden = !notes.length;
    });
  }

  function sittingName(slot) {
    return slot.note.split(":")[0].toLowerCase();
  }

  /* ---------- Sending ---------- */

  function checked(name) {
    return Array.prototype.map.call(form.querySelectorAll('input[name="' + name + '"]:checked'), function (i) {
      return i.value;
    });
  }

  function message() {
    var s = state.slot;
    var lines = [
      "Hi Jonjoli, I'd like to book a table, please.",
      "",
      "Name: " + nameInput.value.trim(),
      "Guests: " + state.guests,
      "Day: " + T.fmt.long.format(state.date),
      "Time: " + s.label + (s.note ? " (" + sittingName(s) + ")" : "")
    ];
    var feast = chosenFeast();
    if (feast) {
      lines.push("Eating: " + feast.name + " (" + money(feast.price) + " a head)");
    }
    if (occasion.value) {
      lines.push("Occasion: " + occasion.value);
    }
    var diets = checked("diet");
    if (diets.length) {
      lines.push("Dietary needs: " + diets.join(", "));
    }
    var needs = checked("needs");
    if (needs.length) {
      lines.push("Please have ready: " + needs.join(", "));
    }
    var note = form.elements.note.value.trim();
    if (note) {
      lines.push("Note: " + note);
    }
    if (state.guests >= B.depositFrom) {
      lines.push("", "We are a table of " + state.guests + ", so I understand there is a " + money(B.depositPerHead) + " a head deposit.");
    }
    lines.push("", "Could you confirm, please?");
    return lines.join("\n");
  }

  function showError(input, errorNode, text) {
    if (text) {
      errorNode.textContent = text;
    }
    errorNode.hidden = false;
    if (input) {
      input.setAttribute("aria-invalid", "true");
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (state.group) {
      groupLink.focus();
      return;
    }
    var firstBad = null;
    // The time may have become too soon while the page was open.
    if (state.slot && state.slot.start.getTime() - T.now().getTime() < B.noticeMinutes * 60000) {
      state.slot = null;
      renderSlots();
      showError(null, timeError, "That time is now too soon to book online. Please choose a later one, or call us.");
      firstBad = firstBad || slotsBox.querySelector("input") || slotsBox;
    }
    if (!state.slot) {
      showError(null, timeError, "Please choose a time.");
      firstBad = firstBad || slotsBox.querySelector("input");
    }
    if (!nameInput.value.trim()) {
      showError(nameInput, nameError);
      firstBad = firstBad || nameInput;
    }
    if (firstBad) {
      firstBad.focus();
      return;
    }
    var channel = event.submitter && event.submitter.value === "email" ? "email" : "whatsapp";
    UI.send({
      text: message(),
      channel: channel,
      title: "Your booking request",
      subject: "Table request: " + T.fmt.long.format(state.date) + ", " + state.slot.label + ", " + people(state.guests),
      confirmNote: "Jonjoli replies to confirm. Your table is booked only once they do."
    });
  });

  nameInput.addEventListener("input", function () {
    if (nameInput.value.trim()) {
      nameError.hidden = true;
      nameInput.removeAttribute("aria-invalid");
    }
  });

  /* ---------- Start ---------- */

  buildSizes();
  buildOccasions();
  feastOptions();
  renderCalendar();
  var wanted = T.parseIso(params.get("date"));
  var start = wanted && inWindow(wanted) && selectable(wanted) ? wanted : nearestSelectable(win.first, 1);
  selectDate(start || win.first);
})();
