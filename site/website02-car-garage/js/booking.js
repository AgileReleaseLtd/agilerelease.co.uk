/* The booking page: what the car needs (MOT, service or both), a calendar of the next three weeks, the
   drop-off time, the car, optional collection and delivery, and the visitor's details. The booking
   becomes a WhatsApp message (or an email) written on the visitor's own device; nothing is sent to or
   stored by this website. */
(function () {
  var data = window.Gantry;
  var K = window.GantryKit;

  var form = document.querySelector("[data-booking]");
  if (!form) {
    return;
  }

  var calDays = form.querySelector("[data-cal-days]");
  var calTitle = form.querySelector("[data-cal-title]");
  var servicePick = form.querySelector("[data-service-pick]");
  var sizeSelect = form.querySelector("[data-size-select]");
  var fuelSelect = form.querySelector("[data-fuel-select]");
  var dropoffDay = form.querySelector("[data-dropoff-day]");
  var collectToggle = form.querySelector("[data-collect-toggle]");
  var collectFields = form.querySelector("[data-collect-fields]");
  var postcodeResult = form.querySelector("[data-postcode-result]");
  var ticket = document.querySelector(".ticket");
  var ticketError = document.querySelector("[data-ticket-error]");
  var el = K.el;

  var today = K.londonToday();
  var first = K.addDays(today, 1); // same-day bookings are by phone
  var last = K.addDays(today, data.bookingDays);
  var selected = null; // the chosen Date

  var checkReg = K.wirePlate(form.elements.reg, form.querySelector("[data-plate-status]"), { onChange: updateTicket });

  /* ---------- What the car needs ---------- */

  Object.keys(data.sizes).forEach(function (key) {
    var like = data.sizes[key].examples.split(", ").slice(0, 2).join(" or ");
    var o = el("option", "", data.sizes[key].short + ", like a " + like);
    o.value = key;
    sizeSelect.appendChild(o);
  });
  sizeSelect.value = "medium";
  Object.keys(data.fuels).forEach(function (key) {
    var o = el("option", "", data.fuels[key].label);
    o.value = key;
    fuelSelect.appendChild(o);
  });

  function job() {
    return form.elements.job.value;
  }

  function serviceKey() {
    return job() === "mot" ? "" : form.elements.service.value;
  }

  function serviceName() {
    var s = data.services[serviceKey()];
    return s.name + " (" + data.sizes[sizeSelect.value].label + ", " + data.fuels[fuelSelect.value].label.toLowerCase() + ")";
  }

  // The priced lines of the booking: [[what, price]].
  function priceLines() {
    var lines = [];
    if (job() !== "service") {
      lines.push([job() === "both" ? "MOT, booked with a service" : "MOT test", job() === "both" ? data.mot.withService : data.mot.price]);
    }
    if (job() !== "mot") {
      lines.push([serviceName(), K.servicePrice(serviceKey(), sizeSelect.value, fuelSelect.value)]);
    }
    var c = collection();
    if (c && c.ok && c.covered) {
      lines.push(["Collection and delivery (" + c.district + ")", c.fee]);
    }
    return lines;
  }

  function renderPrices() {
    form.querySelector('[data-job-price="mot"]').textContent = K.money(data.mot.price);
    form.querySelector('[data-job-price="both"]').textContent = "MOT " + K.money(data.mot.withService) + " plus the service";
    form.querySelector('[data-job-price="service"]').textContent = "From " + K.money(K.cheapestService());
    Object.keys(data.services).forEach(function (key) {
      form.querySelector('[data-service-price="' + key + '"]').textContent = K.money(K.servicePrice(key, sizeSelect.value, fuelSelect.value));
    });
  }

  function onWorkChange() {
    servicePick.hidden = job() === "mot";
    renderPrices();
    renderCalendar();
    if (selected && !dropOffs(selected).length) {
      selected = null;
    }
    markSelected();
    renderDropoffs();
    updateTicket();
  }

  ["job", "service"].forEach(function (name) {
    Array.prototype.forEach.call(form.elements[name], function (radio) {
      radio.addEventListener("change", onWorkChange);
    });
  });
  sizeSelect.addEventListener("change", onWorkChange);
  fuelSelect.addEventListener("change", onWorkChange);

  /* ---------- Days and drop-off times ---------- */

  // The drop-off times on a day for the chosen work: ["morning", "afternoon"], or fewer.
  function dropOffs(d) {
    if (d < first || d > last) {
      return [];
    }
    var h = K.hoursOn(d);
    if (h.closed !== undefined) {
      return [];
    }
    var close = K.toMinutes(h.close);
    var svc = data.services[serviceKey()];
    return Object.keys(data.dropOff).filter(function (key) {
      if (close < K.toMinutes(data.dropOff[key].needsOpenUntil)) {
        return false;
      }
      // We collect the car at one time of day only.
      if (collectToggle.checked && key !== data.collect.dropOff) {
        return false;
      }
      if (svc && svc.fullDay && close < K.toMinutes(data.dropOff.afternoon.needsOpenUntil)) {
        return false;
      }
      return !(svc && svc.morningOnly && key !== "morning");
    });
  }

  // Why a day in the booking window cannot be picked.
  function whyNot(d) {
    var h = K.hoursOn(d);
    if (h.closed) {
      return "closed (" + h.closed + ")";
    }
    if (h.closed === "") {
      return "closed";
    }
    return "no drop-off for a " + data.services[serviceKey()].name.toLowerCase() + " (it needs a full working day)";
  }

  function gridRange() {
    return {
      start: K.addDays(today, -((today.getDay() + 6) % 7)),
      end: K.addDays(last, (7 - last.getDay()) % 7)
    };
  }

  function renderCalendar() {
    var range = gridRange();
    calDays.textContent = "";
    var a = K.fmt.month.format(first);
    var b = K.fmt.month.format(last);
    calTitle.textContent = a === b ? a : (first.getFullYear() === last.getFullYear() ? K.fmt.monthName.format(first) + " to " + b : a + " to " + b);

    for (var d = range.start; d <= range.end; d = K.addDays(d, 1)) {
      var button = el("button", "cal-day");
      button.type = "button";
      button.tabIndex = -1;
      button.setAttribute("data-date", K.isoDate(d));
      if (d.getDate() === 1) {
        button.appendChild(el("small", "cal-mon", K.fmt.monthShort.format(d)));
      }
      button.appendChild(el("span", "cal-num", String(d.getDate())));

      var label = K.fmt.long.format(d);
      var slots = dropOffs(d);
      if (K.sameDay(d, today)) {
        button.disabled = true;
        button.classList.add("is-today");
        label = "Today, " + label + ": call us for a same-day booking";
      } else if (d < first || d > last) {
        button.disabled = true;
        label += d < first ? ", in the past" : ", not bookable yet";
      } else if (!slots.length) {
        button.disabled = true;
        button.classList.add(K.isClosedDay(d) ? "is-closed" : "is-full");
        label += ", " + whyNot(d);
        if (K.hoursOn(d).closed) {
          button.title = "Closed: " + K.hoursOn(d).closed;
        }
      } else {
        var bars = el("span", "cal-slots");
        bars.setAttribute("aria-hidden", "true");
        bars.appendChild(el("i", "am" + (slots.indexOf("morning") > -1 ? " on" : "")));
        bars.appendChild(el("i", "pm" + (slots.indexOf("afternoon") > -1 ? " on" : "")));
        button.appendChild(bars);
        label += slots.length === 2 ? ", morning or afternoon drop-off" : ", " + slots[0] + " drop-off only";
      }
      button.setAttribute("aria-label", label);
      button.setAttribute("aria-pressed", "false");
      calDays.appendChild(button);
    }
  }

  function firstSelectable() {
    for (var d = first; d <= last; d = K.addDays(d, 1)) {
      if (dropOffs(d).length) {
        return d;
      }
    }
    return null;
  }

  // Pressed state and the one day button that is in the Tab order.
  function markSelected() {
    var focusDate = K.isoDate(selected || firstSelectable() || first);
    calDays.querySelectorAll(".cal-day").forEach(function (b) {
      var iso = b.getAttribute("data-date");
      b.setAttribute("aria-pressed", String(!!selected && iso === K.isoDate(selected)));
      b.tabIndex = iso === focusDate ? 0 : -1;
    });
  }

  function select(d, opts) {
    selected = d;
    markSelected();
    if (opts && opts.focus) {
      calDays.querySelector('[data-date="' + K.isoDate(d) + '"]').focus();
    }
    K.fieldError(form, "date", "");
    renderDropoffs();
    updateTicket();
  }

  calDays.addEventListener("click", function (event) {
    var b = event.target.closest(".cal-day");
    if (b && !b.disabled) {
      select(K.parseIso(b.getAttribute("data-date")));
    }
  });

  function nearest(d, dir) {
    for (; d >= first && d <= last; d = K.addDays(d, dir)) {
      if (dropOffs(d).length) {
        return d;
      }
    }
    return null;
  }

  // Arrow keys move a day (left, right) or a week (up, down); Home and End go to the first and last
  // day. Days that cannot be picked are skipped.
  calDays.addEventListener("keydown", function (event) {
    var steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    var from = selected || firstSelectable();
    var target = null;
    if (!from) {
      return;
    }
    if (steps[event.key]) {
      target = nearest(K.addDays(from, steps[event.key]), steps[event.key] > 0 ? 1 : -1);
    } else if (event.key === "Home") {
      target = nearest(first, 1);
    } else if (event.key === "End") {
      target = nearest(last, -1);
    }
    if (target) {
      event.preventDefault();
      select(target, { focus: true });
    }
  });

  function readyText(key, d) {
    var slot = data.dropOff[key];
    var h = d ? K.hoursOn(d) : null;
    var when = "Drop off " + K.clock(slot.from) + " to " + K.clock(slot.to) + ". ";
    if (job() === "mot") {
      return when + "MOT ready by " + K.clock(slot.ready) + ".";
    }
    if (key === "morning") {
      return when + "Ready by " + K.clock(h && h.close ? h.close : "18:00") + ".";
    }
    return when + "Ready by " + K.clock(h && h.close ? h.close : "18:00") + ", or the next morning.";
  }

  function renderDropoffs() {
    var slots = selected ? dropOffs(selected) : [];
    dropoffDay.textContent = selected ? K.fmt.long.format(selected) + ":" : "Pick a day first.";
    Array.prototype.forEach.call(form.elements.dropoff, function (radio) {
      var key = radio.value;
      var text = form.querySelector('[data-dropoff-text="' + key + '"]');
      var open = slots.indexOf(key) > -1;
      radio.disabled = !open;
      if (!open && radio.checked) {
        radio.checked = false;
      }
      if (!selected) {
        text.textContent = readyText(key, null);
      } else if (open) {
        text.textContent = readyText(key, selected);
      } else {
        var svc = data.services[serviceKey()];
        var pickup = data.dropOff[data.collect.dropOff];
        var closesEarly = K.toMinutes(K.hoursOn(selected).close) < K.toMinutes(data.dropOff[key].needsOpenUntil);
        if (closesEarly) {
          text.textContent = "Not on this day: we close at " + K.clock(K.hoursOn(selected).close) + ".";
        } else if (svc && svc.morningOnly) {
          text.textContent = "A " + svc.name.toLowerCase() + " needs a morning drop-off.";
        } else {
          text.textContent = "Not with collection: we collect between " + K.clock(pickup.from) + " and " + K.clock(pickup.to) + ".";
        }
      }
    });
    // One time left: choose it.
    if (slots.length === 1) {
      form.querySelector('input[name="dropoff"][value="' + slots[0] + '"]').checked = true;
    }
  }

  form.addEventListener("change", function (event) {
    if (event.target.name === "dropoff") {
      K.fieldError(form, "dropoff", "");
    }
    updateTicket();
  });

  /* ---------- Collection ---------- */

  function collection() {
    if (!collectToggle.checked) {
      return null;
    }
    return K.checkPostcode(form.elements.postcode.value);
  }

  function renderCollection(showErrors) {
    collectFields.hidden = !collectToggle.checked;
    postcodeResult.textContent = "";
    var c = collection();
    if (!c) {
      return;
    }
    var input = form.elements.postcode;
    input.removeAttribute("aria-invalid");
    if (c.empty) {
      if (showErrors) {
        input.setAttribute("aria-invalid", "true");
        postcodeResult.appendChild(el("p", "result result-error", "Please add the postcode we collect from."));
      }
      return;
    }
    if (!c.ok) {
      if (showErrors) {
        input.setAttribute("aria-invalid", "true");
        postcodeResult.appendChild(el("p", "result result-error", c.error));
      }
      return;
    }
    if (!c.covered) {
      input.setAttribute("aria-invalid", "true");
      postcodeResult.appendChild(el("p", "result result-no", "Sorry, we don't collect from " + c.district + " yet. Untick collection to drop the car off yourself."));
      return;
    }
    if (!c.full) {
      postcodeResult.appendChild(el("p", "result result-ok", "We cover " + c.district + " (" + c.area + "): " + K.feeWords(c.fee).toLowerCase() + ". Please add the full postcode."));
      if (showErrors) {
        input.setAttribute("aria-invalid", "true");
      }
      return;
    }
    postcodeResult.appendChild(el("p", "result result-ok", "We cover " + c.district + " (" + c.area + "). " + K.feeWords(c.fee) + "."));
  }

  collectToggle.addEventListener("change", function () {
    renderCollection(false);
    // Collection changes the drop-off times on offer.
    renderCalendar();
    markSelected();
    renderDropoffs();
    updateTicket();
    if (collectToggle.checked) {
      form.elements.postcode.focus();
    }
  });
  form.elements.postcode.addEventListener("input", function () {
    var c = K.checkPostcode(form.elements.postcode.value);
    if (c.ok && (c.full || !c.covered)) {
      renderCollection(false);
    } else {
      postcodeResult.textContent = "";
    }
    updateTicket();
  });
  form.elements.postcode.addEventListener("blur", function () {
    var c = K.checkPostcode(form.elements.postcode.value);
    if (c.ok) {
      form.elements.postcode.value = c.full || c.district;
    }
    renderCollection(!c.empty);
    updateTicket();
  });

  /* ---------- The job card ---------- */

  // "MOT", "MOT and full service" or "Full service".
  function workWords() {
    if (job() === "mot") {
      return "MOT";
    }
    var name = data.services[serviceKey()].name;
    return job() === "both" ? "MOT and " + name.toLowerCase() : name;
  }

  function dropoffChoice() {
    var r = form.querySelector('input[name="dropoff"]:checked');
    return r && !r.disabled ? r.value : "";
  }

  function carWords() {
    var reg = K.checkPlate(form.elements.reg.value);
    var mm = [form.elements.make.value.trim(), form.elements.model.value.trim()].filter(Boolean).join(" ");
    return [reg.ok ? reg.plate : "", mm].filter(Boolean).join(", ");
  }

  function collectWords() {
    var c = collection();
    if (!c) {
      return "No, I'll drop it off";
    }
    if (!c.ok || !c.covered) {
      return "Yes: postcode to check";
    }
    return "Yes, " + (c.full || c.district) + (c.fee ? " (" + K.money(c.fee) + ")" : " (free)");
  }

  function updateTicket() {
    // Errors that have been put right go away.
    if (selected) {
      K.fieldError(form, "date", "");
    }
    if (dropoffChoice()) {
      K.fieldError(form, "dropoff", "");
    }
    if (ticketError && !ticketError.hidden && !form.querySelector('[aria-invalid="true"], .field-error:not([hidden])')) {
      ticketError.hidden = true;
    }
    if (!ticket) {
      return;
    }
    var set = function (key, text, empty) {
      var dd = ticket.querySelector('[data-t="' + key + '"]');
      dd.textContent = text || empty;
      dd.classList.toggle("is-empty", !text);
    };
    set("work", workWords());
    set("day", selected ? K.fmt.long.format(selected) : "", "Not chosen yet");
    var slot = dropoffChoice();
    set("dropoff", slot ? data.dropOff[slot].label + ", " + K.clock(data.dropOff[slot].from) + " to " + K.clock(data.dropOff[slot].to) : "", "Not chosen yet");
    set("car", carWords(), "Not added yet");
    set("collect", collectWords());

    var box = ticket.querySelector("[data-ticket-lines]");
    box.textContent = "";
    var total = 0;
    priceLines().forEach(function (line) {
      total += line[1];
      var row = el("p", "ticket-line");
      row.appendChild(el("span", "", line[0]));
      row.appendChild(el("span", "", line[1] ? K.money(line[1]) : "Free"));
      box.appendChild(row);
    });
    ticket.querySelector('[data-t="total"]').textContent = K.money(total);
  }

  ["make", "model"].forEach(function (name) {
    form.elements[name].addEventListener("input", function () {
      if (form.elements[name].value.trim()) {
        K.fieldError(form, name, "");
      }
      updateTicket();
    });
  });
  ["name", "phone", "street"].forEach(function (name) {
    form.elements[name].addEventListener("input", function () {
      if (form.elements[name].getAttribute("aria-invalid") === "true" && form.elements[name].value.trim()) {
        K.fieldError(form, name, "");
      }
    });
  });

  /* ---------- Sending ---------- */

  // Checks every step and shows what is missing. Returns the first field to fix, or null.
  function validate() {
    var problems = [];
    if (!selected) {
      K.fieldError(form, "date", "Please pick a day for the booking.");
      problems.push(calDays.querySelector('.cal-day[tabindex="0"]'));
    }
    if (!dropoffChoice()) {
      K.fieldError(form, "dropoff", selected ? "Please choose a drop-off time." : "Pick a day, then a drop-off time.");
      problems.push(form.querySelector('input[name="dropoff"]:not(:disabled)') || calDays.querySelector('.cal-day[tabindex="0"]'));
    }
    if (!checkReg(false)) {
      problems.push(form.elements.reg);
    }
    ["make", "model"].forEach(function (name) {
      if (!form.elements[name].value.trim()) {
        K.fieldError(form, name, name === "make" ? "Please add the make, for example Ford." : "Please add the model, for example Focus.");
        problems.push(form.elements[name]);
      }
    });
    var c = collection();
    if (c) {
      renderCollection(true);
      if (!c.ok || !c.covered || !c.full) {
        problems.push(form.elements.postcode);
      }
      if (!form.elements.street.value.trim()) {
        K.fieldError(form, "street", "Please add the house number and street we collect from.");
        problems.push(form.elements.street);
      }
    }
    if (!form.elements.name.value.trim()) {
      K.fieldError(form, "name", "Please add your name.");
      problems.push(form.elements.name);
    }
    if (!K.looksLikePhone(form.elements.phone.value)) {
      K.fieldError(form, "phone", form.elements.phone.value.trim() ? "That doesn't look like a UK phone number. Please check it." : "Please add a mobile number, so we can reach you about the car.");
      problems.push(form.elements.phone);
    } else {
      K.fieldError(form, "phone", "");
    }
    return problems[0] || null;
  }

  function message() {
    var slot = data.dropOff[dropoffChoice()];
    var reg = K.checkPlate(form.elements.reg.value).plate;
    var c = collection();
    var lines = [
      "Hi " + data.name + ", I'd like to book my car in.",
      "",
      "Booking: " + workWords(),
      "Day: " + K.fmt.long.format(selected),
      "Drop-off: " + slot.label.toLowerCase() + ", " + K.clock(slot.from) + " to " + K.clock(slot.to),
      "Car: " + reg + ", " + form.elements.make.value.trim() + " " + form.elements.model.value.trim()
    ];
    if (job() !== "mot") {
      lines.push("Service for: " + data.sizes[sizeSelect.value].label + ", " + data.fuels[fuelSelect.value].label.toLowerCase());
    }
    if (c) {
      lines.push("Collection: please collect from " + form.elements.street.value.trim() + ", " + c.full + " and bring it back" + (c.fee ? " (" + K.money(c.fee) + ")" : " (free)"));
    } else {
      lines.push("Collection: no, I'll drop it off");
    }
    lines.push("Name: " + form.elements.name.value.trim());
    lines.push("Mobile: " + form.elements.phone.value.trim());
    var note = form.elements.note.value.trim();
    if (note) {
      lines.push("Note: " + note);
    }
    var total = 0;
    var parts = priceLines().map(function (line) {
      total += line[1];
      return line[0] + " " + (line[1] ? K.money(line[1]) : "free");
    });
    lines.push("");
    lines.push("Prices: " + parts.join("; "));
    lines.push("Estimated total: " + K.money(total) + (c ? ", paid when you bring it back" : ", paid when I collect"));
    return lines.join("\n");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var bad = validate();
    if (ticketError) {
      ticketError.hidden = !bad;
    }
    if (bad) {
      bad.focus();
      return;
    }
    var via = event.submitter && event.submitter.value === "email" ? "email" : "whatsapp";
    var reg = K.checkPlate(form.elements.reg.value).plate;
    K.sendMessage({
      via: via,
      reply: "The garage replies to confirm the booking.",
      title: "Your booking message",
      subject: "Booking: " + workWords() + ", " + K.fmt.short.format(selected) + ", " + reg,
      text: message()
    });
  });

  /* ---------- Start ---------- */

  // Links from other pages can fill in the form: ?job=both&service=full&size=medium&fuel=diesel
  // &date=2026-11-20&reg=AB12CDE&collect=E17 4AB
  var params = new URLSearchParams(window.location.search);
  if (/^(mot|both|service)$/.test(params.get("job") || "")) {
    form.querySelector('input[name="job"][value="' + params.get("job") + '"]').checked = true;
  }
  if (data.services[params.get("service")]) {
    form.querySelector('input[name="service"][value="' + params.get("service") + '"]').checked = true;
  }
  if (data.sizes[params.get("size")]) {
    sizeSelect.value = params.get("size");
  }
  if (data.fuels[params.get("fuel")]) {
    fuelSelect.value = params.get("fuel");
  }
  if (params.get("reg")) {
    form.elements.reg.value = params.get("reg");
    checkReg(true);
  }
  if (params.get("collect")) {
    collectToggle.checked = true;
    form.elements.postcode.value = params.get("collect");
    var pc = K.checkPostcode(params.get("collect"));
    if (pc.ok) {
      form.elements.postcode.value = pc.full || pc.district;
    }
  }

  servicePick.hidden = job() === "mot";
  renderPrices();
  renderCalendar();
  var wanted = K.parseIso(params.get("date"));
  if (wanted && dropOffs(wanted).length) {
    selected = wanted;
  }
  markSelected();
  renderDropoffs();
  renderCollection(false);
  updateTicket();
})();
