/* The booking page: the clean (carried over from the estimate), a calendar of bookable days, arrival
   windows that fit the length of the clean, how we get in, parking, pets and the address. The request
   becomes a WhatsApp message (or an email) written on the visitor's own device; nothing is sent to or
   stored by this website. */
(function () {
  var data = window.Tessel;
  var D = window.TesselDates;
  var P = window.TesselPrice;
  var site = window.TesselSite;
  var el = site.el;
  var icon = site.icon;

  var form = document.querySelector("[data-booking-form]");
  if (!form) {
    return;
  }

  var calDays = form.querySelector("[data-cal-days]");
  var calTitle = form.querySelector("[data-cal-title]");
  var chosenDay = form.querySelector("[data-chosen-day]");
  var windowsBox = form.querySelector("[data-windows]");
  var accessBox = form.querySelector("[data-access]");
  var accessDetail = form.querySelector("[data-access-detail]");
  var parkingBox = form.querySelector("[data-parking]");
  var petsBox = form.querySelector("[data-pets]");
  var petDetail = form.querySelector("[data-pet-detail]");
  var coverage = form.querySelector("[data-coverage]");
  var estimateLine = form.querySelector("[data-estimate-line]");
  var formError = form.querySelector("[data-form-error]");
  var summary = document.querySelector("[data-summary]");
  var estimateLink = document.querySelector("[data-estimate-link]");

  var answers = P.fromParams(window.location.search);
  var est = null;
  var win = D.bookingWindow();
  var selected = null; // Date
  var postcodeTouched = false;

  /* ---------- Helpers ---------- */

  function errorFor(name) {
    return form.querySelector('[data-error="' + name + '"]');
  }

  function showError(name, show) {
    var node = errorFor(name);
    if (node) {
      node.hidden = !show;
    }
  }

  function checkedValue(name) {
    var input = form.querySelector('input[name="' + name + '"]:checked');
    return input ? input.value : "";
  }

  function choice(name, value, title, note, opts) {
    opts = opts || {};
    var label = el("label", "choice");
    var input = el("input");
    input.type = "radio";
    input.name = name;
    input.value = value;
    if (opts.disabled) {
      input.disabled = true;
    }
    var body = el("span", "choice-body");
    body.appendChild(el("span", "choice-title", title));
    if (note) {
      body.appendChild(el("span", "choice-note", note));
    }
    label.append(input, body);
    if (opts.side) {
      label.appendChild(el("span", "choice-side", opts.side));
    }
    return label;
  }

  // How long the first visit takes: this is what has to fit in the day.
  function jobHours() {
    if (!est || est.error) {
      return 0;
    }
    return est.first ? est.first.hours : est.hours;
  }

  /* ---------- Step 1: the clean ---------- */

  var homeSize = form.querySelector("[data-home-size]");
  var officeSize = form.querySelector("[data-office-size]");
  var freqField = form.querySelector("[data-freq-field]");
  var officeSizeLabel = officeSize.querySelector(".field-label");

  function writeClean() {
    form.querySelectorAll('input[name="service"]').forEach(function (input) {
      input.checked = input.value === answers.service;
    });
    form.elements.beds.value = String(answers.beds);
    form.elements.baths.value = String(answers.baths);
    form.elements.freq.value = answers.freq;
    form.elements.visits.value = answers.visits;
    form.elements.size.value = answers.size ? String(answers.size) : "";
  }

  function readClean() {
    var service = checkedValue("service") || answers.service;
    var size = parseInt(form.elements.size.value, 10);
    answers = P.normalise({
      service: service,
      beds: form.elements.beds.value,
      baths: form.elements.baths.value,
      freq: form.elements.freq.value,
      furnished: answers.furnished,
      unit: answers.unit,
      size: isNaN(size) ? 0 : size,
      toilets: answers.toilets,
      visits: form.elements.visits.value,
      extras: answers.extras
    });
  }

  function renderClean() {
    var office = answers.service === "office";
    homeSize.hidden = office;
    officeSize.hidden = !office;
    freqField.hidden = answers.service !== "regular";
    var desks = answers.unit === "desks";
    officeSizeLabel.textContent = desks ? "Number of desks" : "Floor area in m²";
    form.elements.size.max = desks ? "50" : String(data.services.office.maxM2);

    est = P.estimate(answers);
    estimateLine.textContent = "";
    if (est.error) {
      estimateLine.appendChild(el("span", "", est.error + " "));
    } else {
      estimateLine.appendChild(document.createTextNode("Estimate: "));
      estimateLine.appendChild(el("strong", "", P.priceLine(est) + "."));
      var extras = P.extrasLine(answers);
      if (extras) {
        estimateLine.appendChild(document.createTextNode(" Extras: " + extras + "."));
      }
      estimateLine.appendChild(document.createTextNode(" "));
    }
    var link = el("a", "", est.error ? "Open the estimate" : "See the breakdown or add extras");
    link.href = "estimate.html?" + P.toParams(answers);
    estimateLine.appendChild(link);
    estimateLink.href = link.href;
  }

  /* ---------- Step 2: the calendar ---------- */

  function inWindow(d) {
    return d >= win.first && d <= win.last;
  }

  // Why a day can't be booked for this service, or "".
  function dayBlocked(d) {
    var reason = D.closedReason(d);
    if (reason) {
      return reason;
    }
    var runs = data.windows[answers.service].some(function (w) {
      return w.days.indexOf(d.getDay()) !== -1;
    });
    return runs ? "" : answers.service === "office" ? "no office cleans that day" : "no cleans that day";
  }

  function selectable(d) {
    return inWindow(d) && !dayBlocked(d);
  }

  function gridRange() {
    var start = D.addDays(win.first, -((win.first.getDay() + 6) % 7));
    var end = D.addDays(win.last, (7 - win.last.getDay()) % 7);
    return { start: start, end: end };
  }

  function renderCalendar() {
    var range = gridRange();
    calDays.textContent = "";
    var firstMonth = D.fmt.month.format(win.first);
    var lastMonth = D.fmt.month.format(win.last);
    calTitle.textContent = firstMonth === lastMonth ? firstMonth
      : win.first.getFullYear() === win.last.getFullYear() ? D.fmt.monthName.format(win.first) + " to " + lastMonth
      : firstMonth + " to " + lastMonth;

    if (selected && !selectable(selected)) {
      selected = null;
    }
    var focusable = selected || nearest(win.first, 1);

    for (var d = range.start; d <= range.end; d = D.addDays(d, 1)) {
      var iso = D.isoDate(d);
      var b = el("button", "cal-day");
      b.type = "button";
      b.setAttribute("data-date", iso);
      b.tabIndex = focusable && D.sameDay(d, focusable) ? 0 : -1;
      if (d.getDate() === 1 || D.sameDay(d, range.start)) {
        b.appendChild(el("small", "cal-mon", D.fmt.monthShort.format(d)));
      }
      b.appendChild(el("span", "cal-num", String(d.getDate())));
      var label = D.fmt.long.format(d);
      var reason = dayBlocked(d);
      if (!inWindow(d)) {
        b.disabled = true;
        label += d < win.first ? (d < win.today ? ", in the past" : ", too soon to book online") : ", not bookable yet";
      } else if (reason) {
        b.disabled = true;
        b.classList.add("is-closed");
        b.title = "Closed: " + reason;
        label += ", closed: " + reason;
      }
      b.setAttribute("aria-label", label);
      b.setAttribute("aria-pressed", String(!!selected && D.sameDay(d, selected)));
      calDays.appendChild(b);
    }
  }

  function nearest(d, dir) {
    for (; inWindow(d); d = D.addDays(d, dir)) {
      if (selectable(d)) {
        return d;
      }
    }
    return null;
  }

  function selectDay(d, opts) {
    selected = d;
    calDays.querySelectorAll(".cal-day").forEach(function (b) {
      var on = b.getAttribute("data-date") === D.isoDate(d);
      b.setAttribute("aria-pressed", String(on));
      b.tabIndex = on ? 0 : -1;
      if (on && opts && opts.focus) {
        b.focus();
      }
    });
    chosenDay.textContent = "Your day: " + D.fmt.long.format(d) + ".";
    showError("day", false);
    renderWindows();
    renderSummary();
  }

  calDays.addEventListener("click", function (event) {
    var b = event.target.closest(".cal-day");
    if (b && !b.disabled) {
      selectDay(D.parseIso(b.getAttribute("data-date")));
    }
  });

  // Arrow keys move a day (left, right) or a week (up, down); Home and End go to the first and last day.
  calDays.addEventListener("keydown", function (event) {
    var steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    var from = selected || D.parseIso(document.activeElement.getAttribute("data-date") || "") || win.first;
    var target = null;
    if (steps[event.key]) {
      target = nearest(D.addDays(from, steps[event.key]), steps[event.key] > 0 ? 1 : -1);
    } else if (event.key === "Home") {
      target = nearest(win.first, 1);
    } else if (event.key === "End") {
      target = nearest(win.last, -1);
    }
    if (target) {
      event.preventDefault();
      selectDay(target, { focus: true });
    }
  });

  /* ---------- Step 3: arrival windows ---------- */

  function renderWindows() {
    var keep = checkedValue("window");
    windowsBox.textContent = "";
    if (!selected) {
      windowsBox.appendChild(el("p", "slot-empty", "Pick a day first."));
      return;
    }
    var hours = jobHours();
    var list = data.windows[answers.service].filter(function (w) {
      return w.days.indexOf(selected.getDay()) !== -1;
    });
    var any = false;
    list.forEach(function (w) {
      var fits = !hours || hours <= w.maxHours;
      var title = (w.label ? w.label + ": " : "") + "arrive " + D.clockRange(w.from, w.to);
      var note = fits
        ? w.note || "For cleans up to " + P.hours(w.maxHours) + "."
        : "Too short for your clean (" + P.hours(hours) + (est.first ? ", first visit" : "") + ").";
      var node = choice("window", w.id, title, note, { disabled: !fits });
      if (fits && w.id === keep) {
        node.querySelector("input").checked = true;
      }
      any = any || fits;
      windowsBox.appendChild(node);
    });
    if (!any) {
      windowsBox.appendChild(el("p", "slot-empty", "Nothing on this day fits a clean this long. Try a weekday, or message us and we'll plan it with you."));
    }
  }

  windowsBox.addEventListener("change", function () {
    showError("window", false);
    renderSummary();
  });

  function chosenWindow() {
    var id = checkedValue("window");
    return data.windows[answers.service].filter(function (w) {
      return w.id === id;
    })[0] || null;
  }

  /* ---------- Steps 4 and 5: access, parking, pets ---------- */

  function renderAccess() {
    var keep = checkedValue("access");
    accessBox.textContent = "";
    data.access.forEach(function (a) {
      if (a.services && a.services.indexOf(answers.service) === -1) {
        return;
      }
      var node = choice("access", a.id, a.label, a.hint);
      if (a.id === keep) {
        node.querySelector("input").checked = true;
      }
      accessBox.appendChild(node);
    });
    updateAccessDetail();
  }

  function chosenAccess() {
    var id = checkedValue("access");
    return data.access.filter(function (a) {
      return a.id === id;
    })[0] || null;
  }

  function updateAccessDetail() {
    var a = chosenAccess();
    accessDetail.hidden = !(a && a.ask);
    if (a && a.ask) {
      accessDetail.querySelector("[data-access-ask]").textContent = a.ask;
      accessDetail.querySelector("input").placeholder = a.placeholder || "";
    }
  }

  accessBox.addEventListener("change", function () {
    showError("access", false);
    updateAccessDetail();
    renderSummary();
  });

  data.parking.forEach(function (p, i) {
    var node = choice("parking", p.id, p.label, p.hint);
    if (i === data.parking.length - 1) {
      node.querySelector("input").checked = true;
    }
    parkingBox.appendChild(node);
  });

  data.pets.forEach(function (p, i) {
    var label = el("label", "segment");
    var input = el("input");
    input.type = "radio";
    input.name = "pets";
    input.value = p.id;
    input.checked = i === 0;
    label.append(input, el("span", "", p.label));
    petsBox.appendChild(label);
  });

  petsBox.addEventListener("change", function () {
    petDetail.hidden = checkedValue("pets") === "none";
  });

  /* ---------- Step 6: address ---------- */

  function postcodeVerdict() {
    var value = form.elements.postcode.value.trim();
    if (!value) {
      return null;
    }
    return site.verdict(site.lookup(value), answers.service, answers.freq);
  }

  function renderCoverage(force) {
    var v = postcodeVerdict();
    coverage.textContent = "";
    coverage.className = "coverage";
    form.elements.postcode.removeAttribute("aria-invalid");
    if (!v) {
      if (force) {
        coverage.className = "coverage is-no";
        coverage.appendChild(icon("i-alert"));
        coverage.appendChild(el("span", "", "Please add the postcode."));
        form.elements.postcode.setAttribute("aria-invalid", "true");
      }
      return;
    }
    if (v.kind === "bad" && !force && !postcodeTouched) {
      return;
    }
    coverage.className = "coverage is-" + (v.kind === "bad" ? "no" : v.kind);
    coverage.appendChild(icon(v.kind === "yes" ? "i-check" : "i-alert"));
    coverage.appendChild(el("span", "", v.text));
    if (v.kind !== "yes") {
      form.elements.postcode.setAttribute("aria-invalid", "true");
    }
  }

  form.elements.postcode.addEventListener("input", function () {
    var compact = form.elements.postcode.value.replace(/\s/g, "");
    if (compact.length >= 5) {
      postcodeTouched = true;
    }
    renderCoverage(false);
    renderSummary();
  });

  form.elements.postcode.addEventListener("blur", function () {
    if (form.elements.postcode.value.trim()) {
      postcodeTouched = true;
      renderCoverage(false);
    }
  });

  ["street", "name"].forEach(function (name) {
    form.elements[name].addEventListener("input", function () {
      if (form.elements[name].value.trim()) {
        showError(name, false);
        form.elements[name].removeAttribute("aria-invalid");
      }
      renderSummary();
    });
  });

  /* ---------- Summary ---------- */

  function setSum(key, text, emptyText) {
    var dd = summary.querySelector('[data-sum="' + key + '"]');
    dd.textContent = text || emptyText;
    dd.classList.toggle("is-empty", !text);
  }

  function renderSummary() {
    setSum("clean", P.serviceLine(answers) + ". " + P.sizeLine(answers), "");
    setSum("price", est.error ? "" : P.priceLine(est), "We'll give you a price");
    setSum("day", selected ? D.fmt.long.format(selected) : "", "Not picked yet");
    var w = chosenWindow();
    setSum("window", w ? "Arriving " + D.clockRange(w.from, w.to) : "", "Not picked yet");
    var a = chosenAccess();
    setSum("access", a ? a.label : "", "Not picked yet");
    var street = form.elements.street.value.trim();
    var pc = site.lookup(form.elements.postcode.value);
    setSum("address", [street, pc.valid ? pc.postcode : ""].filter(Boolean).join(", "), "Not added yet");
  }

  /* ---------- Changing the clean ---------- */

  form.querySelector("fieldset").addEventListener("change", function () {
    var before = answers.service;
    readClean();
    renderClean();
    if (answers.service !== before) {
      renderCalendar();
      renderAccess();
      if (!selected) {
        chosenDay.textContent = "No day picked yet.";
      }
    }
    renderWindows();
    renderCoverage(false);
    renderSummary();
  });

  form.elements.size.addEventListener("input", function () {
    readClean();
    renderClean();
    renderWindows();
    renderSummary();
  });

  /* ---------- The message ---------- */

  function message() {
    var w = chosenWindow();
    var a = chosenAccess();
    var lines = [
      "Hi " + data.short + ", I'd like to book a clean, please.",
      "",
      "Clean: " + P.serviceLine(answers),
      "Size: " + P.sizeLine(answers)
    ];
    var extras = P.extrasLine(answers);
    if (extras) {
      lines.push("Extras: " + extras);
    }
    if (!est.error) {
      lines.push("Estimate: " + P.priceLine(est));
    }
    lines.push("Day: " + D.fmt.long.format(selected));
    lines.push("Arrival: " + D.clockRange(w.from, w.to));
    if (answers.service === "regular" && answers.freq !== "oneoff") {
      lines.push("Then: " + (answers.freq === "weekly" ? "every week" : "every two weeks") + " on " + D.fmt.weekday.format(selected) + "s");
    }
    var detail = form.elements.accessDetail.value.trim();
    var access = a.label + (a.ask && detail ? " (" + detail + ")" : "");
    if (a.id === "keysafe") {
      access += ". Please call me for the code.";
    }
    lines.push("Getting in: " + access);
    var parking = data.parking.filter(function (p) {
      return p.id === checkedValue("parking");
    })[0];
    lines.push("Parking: " + parking.label);
    var pet = data.pets.filter(function (p) {
      return p.id === checkedValue("pets");
    })[0];
    var petNote = form.elements.petDetail.value.trim();
    lines.push("Pets: " + (pet.id === "none" ? "None" : pet.label + (petNote ? " (" + petNote + ")" : "")));
    var pc = site.lookup(form.elements.postcode.value);
    lines.push("Address: " + form.elements.street.value.trim() + ", " + pc.postcode);
    lines.push("Name: " + form.elements.name.value.trim());
    var phone = form.elements.phone.value.trim();
    if (phone) {
      lines.push("Phone: " + phone);
    }
    var note = form.elements.note.value.trim();
    if (note) {
      lines.push("Note: " + note);
    }
    lines.push("");
    lines.push("I understand the price is an estimate until you've seen photos or visited.");
    return lines.join("\n");
  }

  // Checks every step; marks what's missing and returns the first thing to fix (or null).
  function validate() {
    var problems = [];
    var first = null;
    function fail(name, label, focusTarget) {
      problems.push(label);
      showError(name, true);
      first = first || focusTarget;
    }
    if (est.error) {
      problems.push("the size of the office");
      first = first || form.elements.size;
    }
    if (!selected) {
      fail("day", "a day", calDays.querySelector('.cal-day[tabindex="0"]') || chosenDay);
    }
    if (!chosenWindow()) {
      var firstWindow = windowsBox.querySelector("input:not(:disabled)");
      fail("window", "an arrival time", firstWindow || chosenDay);
    }
    if (!chosenAccess()) {
      fail("access", "how we get in", accessBox.querySelector("input"));
    }
    if (!form.elements.street.value.trim()) {
      fail("street", "the street address", form.elements.street);
      form.elements.street.setAttribute("aria-invalid", "true");
    }
    postcodeTouched = true;
    renderCoverage(true);
    var v = postcodeVerdict();
    var full = site.lookup(form.elements.postcode.value).postcode || "";
    if (!v || v.kind === "bad" || v.kind === "no") {
      problems.push(v && v.kind === "no" ? "a postcode we cover" : "the postcode");
      first = first || form.elements.postcode;
    } else if (full.indexOf(" ") === -1) {
      problems.push("the full postcode");
      first = first || form.elements.postcode;
      coverage.className = "coverage is-no";
      coverage.textContent = "";
      coverage.appendChild(icon("i-alert"));
      coverage.appendChild(el("span", "", "Please add the full postcode, like SW12 8AB."));
      form.elements.postcode.setAttribute("aria-invalid", "true");
    }
    if (!form.elements.name.value.trim()) {
      fail("name", "your name", form.elements.name);
      form.elements.name.setAttribute("aria-invalid", "true");
    }
    formError.hidden = !problems.length;
    formError.textContent = "";
    if (problems.length) {
      formError.appendChild(icon("i-alert"));
      var list = problems.length > 1 ? problems.slice(0, -1).join(", ") + " and " + problems[problems.length - 1] : problems[0];
      formError.appendChild(el("span", "", "Nearly there. Please add " + list + "."));
    }
    return first;
  }

  function send(channel, trigger) {
    var first = validate();
    if (first) {
      first.focus();
      return;
    }
    site.sendMessage({
      channel: channel,
      title: "Your booking request",
      subject: "Booking request: " + D.fmt.long.format(selected),
      text: message(),
      againLabel: "Change something",
      returnFocus: trigger
    });
  }

  // After a first try, the list of what's missing keeps up as people fill the form in.
  var tried = false;
  function recheck() {
    if (tried) {
      validate();
    }
  }
  form.addEventListener("change", recheck);
  form.addEventListener("input", recheck);
  calDays.addEventListener("click", recheck);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    tried = true;
    send("whatsapp", form.querySelector('button[type="submit"]'));
  });

  form.querySelector("[data-send-email]").addEventListener("click", function (event) {
    tried = true;
    send("email", event.currentTarget);
  });

  /* ---------- Start ---------- */

  writeClean();
  renderClean();
  renderCalendar();
  renderWindows();
  renderAccess();
  renderSummary();
})();
