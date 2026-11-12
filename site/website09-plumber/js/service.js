/* The boiler service booking form: the job (service, CP12 or both), the boiler, the last service, a
   morning or afternoon a few weeks ahead, and the address. It writes a WhatsApp message on the visitor's
   own device; nothing is sent to or stored by this website. */
(function () {
  var data = window.Pinn;
  var T = window.PinnTime;
  var site = window.PinnSite;
  var el = site.el;

  var form = document.querySelector("[data-service-form]");
  if (!form) {
    return;
  }
  var F = form.elements;
  var now = T.londonNow();

  /* ---------- Build the options from data.js ---------- */

  function radioCard(name, value, title, lines, extraClass) {
    var label = el("label", "card-option" + (extraClass ? " " + extraClass : ""));
    var input = el("input");
    input.type = "radio";
    input.name = name;
    input.value = value;
    var words = el("span", "card-words");
    words.appendChild(el("span", "card-title", title));
    lines.forEach(function (line) {
      words.appendChild(el("span", line[0], line[1]));
    });
    label.append(input, words);
    return label;
  }

  var jobBox = form.querySelector("[data-job-options]");
  Object.keys(data.services).forEach(function (key) {
    var s = data.services[key];
    jobBox.appendChild(radioCard("job", key, s.short, [["card-price", T.money(s.price)], ["card-text", s.blurb]]));
  });

  var typeBox = form.querySelector("[data-boiler-types]");
  data.boilerTypes.forEach(function (t) {
    typeBox.appendChild(radioCard("boilerType", t.id, t.name, [["card-text", t.hint]], "card-small"));
  });

  function option(select, value, text) {
    var o = el("option", "", text);
    o.value = value;
    select.appendChild(o);
  }

  var makes = form.querySelector("[data-makes]");
  option(makes, "", "Choose a make");
  data.boilerMakes.forEach(function (m) {
    option(makes, m, m);
  });

  var ages = form.querySelector("[data-ages]");
  option(ages, "", "Choose");
  data.boilerAges.forEach(function (a) {
    option(ages, a.id, a.name);
  });

  var appliances = form.querySelector("[data-appliances]");
  for (var n = 1; n <= 8; n++) {
    option(appliances, String(n), n + (n === 1 ? " appliance" : " appliances"));
  }
  appliances.value = String(data.cp12Included);

  var monthSel = form.querySelector("[data-last-month]");
  var yearSel = form.querySelector("[data-last-year]");
  option(monthSel, "", "Month");
  for (var m = 0; m < 12; m++) {
    option(monthSel, String(m), T.fmt.monthName.format(new Date(2026, m, 1)));
  }
  option(yearSel, "", "Year");
  var thisYear = now.getFullYear();
  for (var y = thisYear; y > thisYear - 6; y--) {
    option(yearSel, String(y), String(y));
  }
  option(yearSel, "earlier", "Before " + (thisYear - 5));

  /* ---------- Week picker ---------- */

  var bookable = T.bookingDays(now);
  var byIso = {};
  bookable.forEach(function (d) {
    byIso[d.iso] = d;
  });
  var firstDay = bookable[0].date;
  var lastDay = bookable[bookable.length - 1].date;
  var weekBox = form.querySelector("[data-week-days]");
  var weekTitle = form.querySelector("[data-week-title]");
  var prevBtn = form.querySelector("[data-week-prev]");
  var nextBtn = form.querySelector("[data-week-next]");
  var weeks = [];
  var weekIndex = 0;

  for (var monday = T.mondayOf(firstDay); monday <= lastDay; monday = T.addDays(monday, 7)) {
    var week = el("div", "week");
    week.hidden = true;
    for (var i = 0; i < 6; i++) {
      var date = T.addDays(monday, i);
      var iso = T.isoDate(date);
      var info = byIso[iso];
      var day = el("div", "day");
      var head = el("p", "day-name");
      head.append(el("span", "day-dow", T.fmt.weekdayShort.format(date)), el("span", "day-date", T.fmt.dayShort.format(date)));
      day.appendChild(head);
      if (!info) {
        day.classList.add("is-off");
        day.appendChild(el("p", "day-off", date < T.startOfDay(now) ? "In the past" : date < firstDay ? "Too soon to book" : "Not open for booking yet"));
      } else if (info.reason) {
        day.classList.add("is-off");
        day.appendChild(el("p", "day-off", info.reason));
      } else {
        var slots = el("div", "day-slots");
        info.slots.forEach(function (key) {
          var slot = data.booking.slots[key];
          var label = el("label", "slot");
          var input = el("input");
          input.type = "radio";
          input.name = "slot";
          input.value = iso + "|" + key;
          label.appendChild(input);
          label.appendChild(el("span", "visually-hidden", T.fmt.long.format(date) + ", "));
          label.appendChild(el("span", "slot-name", slot.name));
          label.appendChild(el("small", "slot-time", slot.time));
          slots.appendChild(label);
        });
        if (info.slots.length === 1) {
          slots.appendChild(el("p", "slot-only", "Mornings only"));
        }
        day.appendChild(slots);
      }
      week.appendChild(day);
    }
    weeks.push({ monday: monday, node: week });
    weekBox.appendChild(week);
  }

  function showWeek(index) {
    weekIndex = Math.max(0, Math.min(weeks.length - 1, index));
    weeks.forEach(function (w, i) {
      w.node.hidden = i !== weekIndex;
    });
    var monday = weeks[weekIndex].monday;
    var thisMonday = T.mondayOf(now);
    var diff = Math.round((monday - thisMonday) / (7 * 864e5));
    var prefix = diff === 0 ? "This week" : diff === 1 ? "Next week" : "In " + diff + " weeks";
    weekTitle.textContent = "";
    weekTitle.append(el("strong", "", prefix), el("span", "", "Monday " + T.fmt.dayMonth.format(monday) + " to Saturday " + T.fmt.dayMonth.format(T.addDays(monday, 5))));
    prevBtn.disabled = weekIndex === 0;
    nextBtn.disabled = weekIndex === weeks.length - 1;
  }

  prevBtn.addEventListener("click", function () {
    showWeek(weekIndex - 1);
  });
  nextBtn.addEventListener("click", function () {
    showWeek(weekIndex + 1);
  });

  /* ---------- Reading the form ---------- */

  function value(name) {
    var field = F[name];
    if (!field) {
      return "";
    }
    if (field instanceof RadioNodeList) {
      return field.value;
    }
    return field.type === "checkbox" ? field.checked : String(field.value).trim();
  }

  function applianceCount() {
    return parseInt(value("appliances"), 10) || data.cp12Included;
  }

  function price() {
    var job = value("job") || "service";
    var base = data.services[job].price;
    if (job !== "service") {
      base += Math.max(0, applianceCount() - data.cp12Included) * data.extraAppliance;
    }
    return base;
  }

  function slotText() {
    var v = value("slot");
    if (!v) {
      return "";
    }
    var parts = v.split("|");
    var slot = data.booking.slots[parts[1]];
    return T.fmt.long.format(T.parseIso(parts[0])) + ", " + slot.name.toLowerCase() + " (" + slot.time + ")";
  }

  function boilerText() {
    var bits = [];
    var type = data.boilerTypes.filter(function (t) {
      return t.id === value("boilerType");
    })[0];
    if (type) {
      bits.push(type.id === "unsure" ? "type not sure" : type.name);
    }
    var make = value("make");
    if (make) {
      bits.push(make === "Not sure" ? "make not sure" : make + (value("model") ? " " + value("model") : ""));
    }
    var age = data.boilerAges.filter(function (a) {
      return a.id === value("age");
    })[0];
    if (age) {
      bits.push(age.id === "unsure" ? "age not sure" : age.name.charAt(0).toLowerCase() + age.name.slice(1) + " old");
    }
    return bits.join(", ");
  }

  // { text, months, future } for the last service, or null if not answered yet.
  function lastService() {
    if (value("lastUnknown")) {
      return { text: "Never, or not known", unknown: true };
    }
    var yr = value("lastYear");
    if (yr === "earlier") {
      return { text: "Before " + (thisYear - 5), months: 999 };
    }
    var mo = value("lastMonth");
    if (yr === "" || mo === "") {
      return null;
    }
    var yearNum = +yr;
    var monthNum = +mo;
    var future = yearNum > now.getFullYear() || (yearNum === now.getFullYear() && monthNum > now.getMonth());
    var months = T.monthsSince(yearNum, monthNum, now);
    var label = T.fmt.monthYear.format(new Date(yearNum, monthNum, 1));
    return {
      text: label + (future ? "" : months === 0 ? " (this month)" : " (" + months + (months === 1 ? " month" : " months") + " ago)"),
      months: months,
      future: future,
      due: new Date(yearNum + 1, monthNum, 1)
    };
  }

  /* ---------- Live feedback ---------- */

  var cp12Box = form.querySelector("[data-cp12]");
  var accessBox = form.querySelector("[data-access-contact]");
  var ageTip = form.querySelector("[data-age-tip]");
  var lastTip = form.querySelector("[data-last-tip]");
  var postcodeNote = form.querySelector("[data-postcode-note]");
  var summary = document.querySelector("[data-summary]");
  var summaryPrice = document.querySelector("[data-summary-price]");

  function updateTips() {
    var job = value("job");
    cp12Box.hidden = !(job === "cp12" || job === "both");
    var access = value("access");
    accessBox.hidden = cp12Box.hidden || access === "me";

    var age = data.boilerAges.filter(function (a) {
      return a.id === value("age");
    })[0];
    ageTip.hidden = !(age && age.tip);
    ageTip.textContent = age && age.tip ? age.tip : "";

    var unknown = value("lastUnknown");
    monthSel.disabled = unknown;
    yearSel.disabled = unknown;
    monthSel.disabled = unknown || value("lastYear") === "earlier";

    var last = lastService();
    var tip = "";
    var tone = "";
    if (last) {
      if (last.unknown) {
        tip = "No problem. We give it a full service and start a service record for you.";
      } else if (last.future) {
        tip = "That date has not happened yet. Check the month and the year.";
        tone = "is-warn";
      } else if (last.months >= 999) {
        tip = "Well overdue. Worth booking soon, and we will check it over carefully.";
        tone = "is-warn";
      } else if (last.months > 12) {
        tip = "Overdue: it was serviced " + last.months + " months ago. Worth booking soon.";
        tone = "is-warn";
      } else if (last.months >= 11) {
        tip = "Due now: a service every 12 months keeps it safe and in warranty.";
      } else {
        tip = "Not due until " + T.fmt.monthYear.format(last.due) + ". You can still book it early, or pick a later week.";
      }
    }
    lastTip.hidden = !tip;
    lastTip.textContent = tip;
    lastTip.className = "tip " + tone;
  }

  function updatePostcode() {
    var pc = value("postcode");
    if (!pc) {
      postcodeNote.textContent = "";
      postcodeNote.className = "postcode-note";
      return;
    }
    var result = site.lookup(pc);
    postcodeNote.textContent = result.valid ? site.coverageLine(result) : "";
    postcodeNote.className = "postcode-note" + (result.valid ? (result.covered ? " is-in" : " is-out") : "");
  }

  function updateSummary() {
    var job = data.services[value("job") || "service"];
    var rows = [
      ["Job", job.short + (value("job") && value("job") !== "service" ? ", " + applianceCount() + " gas appliance" + (applianceCount() === 1 ? "" : "s") : "")],
      ["Day", slotText() || "Not picked yet"],
      ["Boiler", boilerText() || "Not filled in yet"],
      ["Postcode", value("postcode") ? site.lookup(value("postcode")).postcode || value("postcode").toUpperCase() : "Not filled in yet"]
    ];
    summary.textContent = "";
    rows.forEach(function (row) {
      var div = el("div", row[1].indexOf("Not ") === 0 ? "is-empty" : "");
      div.append(el("dt", "", row[0]), el("dd", "", row[1]));
      summary.appendChild(div);
    });
    summaryPrice.textContent = T.money(price());
  }

  function update() {
    updateTips();
    updateSummary();
  }

  form.addEventListener("change", function (event) {
    if (event.target.name) {
      clearError(errorKey(event.target.name));
    }
    if (event.target.name === "postcode") {
      updatePostcode();
    }
    update();
  });
  form.addEventListener("input", function (event) {
    if (event.target.name === "postcode") {
      updatePostcode();
    }
    if (event.target.name && value(event.target.name)) {
      clearError(errorKey(event.target.name));
    }
    updateSummary();
  });

  /* ---------- Checking and sending ---------- */

  var errorsBox = form.querySelector("[data-form-errors]");

  function errorKey(name) {
    return name === "lastMonth" || name === "lastYear" || name === "lastUnknown" ? "last" : name;
  }

  function showError(key, show) {
    var msg = form.querySelector('[data-error-for="' + key + '"]');
    if (msg) {
      msg.hidden = !show;
    }
    var field = F[key];
    if (field && !(field instanceof RadioNodeList)) {
      if (show) {
        field.setAttribute("aria-invalid", "true");
      } else {
        field.removeAttribute("aria-invalid");
      }
    }
  }

  function clearError(key) {
    showError(key, false);
  }

  function check() {
    var bad = [];
    function need(key, ok) {
      showError(key, !ok);
      if (!ok) {
        bad.push(key);
      }
    }
    var job = value("job");
    need("accessContact", !(job !== "service" && value("access") !== "me") || !!value("accessContact"));
    need("boilerType", !!value("boilerType"));
    need("make", !!value("make"));
    need("age", !!value("age"));
    var last = lastService();
    need("last", !!last && !last.future);
    need("slot", !!value("slot"));
    need("name", !!value("name"));
    need("address", !!value("address"));
    need("postcode", site.lookup(value("postcode")).valid);
    return bad;
  }

  function focusFirst(key) {
    var target = {
      boilerType: form.querySelector('[name="boilerType"]'),
      last: value("lastUnknown") ? F.lastUnknown : monthSel.disabled ? yearSel : monthSel,
      slot: weekBox.querySelector('.week:not([hidden]) input[name="slot"]') || nextBtn
    }[key] || F[key];
    if (target && target.focus) {
      target.focus();
    }
  }

  function message() {
    var job = value("job");
    var opening = {
      service: "I'd like to book a boiler service.",
      cp12: "I'd like to book a landlord gas safety check (CP12).",
      both: "I'd like to book a boiler service and a landlord gas safety check (CP12)."
    }[job];
    opening = "Hi " + data.short + ", " + opening;
    var jobLine = data.services[job].name;
    if (job !== "service") {
      jobLine += ", " + applianceCount() + " gas appliance" + (applianceCount() === 1 ? "" : "s");
    }
    var area = site.lookup(value("postcode"));
    var lines = [
      opening,
      "",
      "Job: " + jobLine + " (" + T.money(price()) + ")",
      "Day: " + slotText(),
      "Boiler: " + boilerText(),
      "Last serviced: " + lastService().text,
      "Name: " + value("name"),
      "Address: " + value("address") + ", " + area.postcode
    ];
    if (job !== "service") {
      var who = { me: "Me", tenant: "My tenant", agent: "The letting agent" }[value("access")];
      lines.push("Who will let you in: " + who + (value("access") !== "me" ? ", " + value("accessContact") : ""));
    }
    if (value("note")) {
      lines.push("Note: " + value("note"));
    }
    return lines.join("\n");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var bad = check();
    if (bad.length) {
      errorsBox.hidden = false;
      errorsBox.textContent = bad.length === 1 ? "One thing needs a look before we can send this. It is marked below." :
        bad.length + " things need a look before we can send this. They are marked below.";
      focusFirst(bad[0]);
      return;
    }
    errorsBox.hidden = true;
    site.sendMessage(message(), { title: "Your booking is ready", subject: "Boiler service booking" });
  });

  /* ---------- Start ---------- */

  var params = new URLSearchParams(window.location.search);
  var wanted = params.get("job");
  var start = form.querySelector('input[name="job"][value="' + (data.services[wanted] ? wanted : "service") + '"]');
  start.checked = true;
  form.querySelector('input[name="access"][value="me"]').checked = true;
  showWeek(0);
  update();
})();
