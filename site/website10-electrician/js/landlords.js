/* Landlord EICR booking: any number of rented homes (each with its postcode, type, size and when its
   current report is due), how we get in, up to three preferred dates from the coming weeks, and a guide
   price for the lot. It all becomes one WhatsApp message or email; nothing is kept by this website. */
(function () {
  var data = window.Earthpin;
  var P = window.EarthpinPrices;
  var A = window.EarthpinAreas;
  var D = window.EarthpinDates;
  var UI = window.EarthpinUI;
  var el = UI.el;

  var form = document.querySelector("[data-landlord]");
  if (!form) {
    return;
  }

  var cfg = data.landlords;
  var eicr = data.jobs.eicr;
  var propsBox = form.querySelector("[data-props]");
  var countInput = form.elements.count;
  var datesBox = form.querySelector("[data-dates]");
  var pickedLine = form.querySelector("[data-picked]");
  var errorsBox = form.querySelector("[data-errors]");
  var sum = {
    homes: document.querySelector("[data-sum-homes]"),
    price: document.querySelector("[data-sum-price]"),
    small: document.querySelector("[data-sum-small]"),
    notes: document.querySelector("[data-sum-notes]")
  };

  function question(id) {
    return eicr.questions.filter(function (q) {
      return q.id === id;
    })[0];
  }

  var TYPES = question("ptype").options.filter(function (o) {
    return o.value !== "business";
  });
  var BEDS = question("beds").options;
  var DUE = ["Not sure", "No report yet", "Overdue", "Due within a month", "Due in 1 to 3 months", "Due later"];

  // What each home's fields hold, kept when the number of homes changes.
  var homes = [];
  var picked = []; // ISO dates, in the order picked

  /* ---------- Homes ---------- */

  function select(id, name, options, value) {
    var s = el("select");
    s.id = id;
    s.name = name;
    options.forEach(function (o) {
      var opt = el("option", "", o.label);
      opt.value = o.value;
      s.appendChild(opt);
    });
    if (value) {
      s.value = value;
    }
    return s;
  }

  function field(labelText, control, extra) {
    var f = el("div", "field " + extra);
    var label = el("label", "field-label", labelText);
    label.htmlFor = control.id;
    f.append(label, control);
    return f;
  }

  function renderHomes() {
    var n = clampCount(parseInt(countInput.value, 10));
    countInput.value = String(n);
    while (homes.length < n) {
      homes.push({ postcode: "", ptype: "flat", beds: "2", due: DUE[0] });
    }
    propsBox.textContent = "";
    for (var i = 0; i < n; i++) {
      var h = homes[i];
      var box = el("div", "prop");
      box.setAttribute("data-home", String(i));
      box.setAttribute("role", "group");
      box.setAttribute("aria-label", "Home " + (i + 1));
      box.appendChild(el("span", "prop-no", String(i + 1)));

      var pc = el("input");
      pc.type = "text";
      pc.id = "l-pc-" + i;
      pc.name = "pc-" + i;
      pc.maxLength = 9;
      pc.autocomplete = "off";
      pc.value = h.postcode;
      pc.setAttribute("aria-describedby", "l-pc-note-" + i);
      box.appendChild(field("Postcode", pc, "prop-pc"));

      box.appendChild(field("Type", select("l-type-" + i, "type-" + i, TYPES, h.ptype), "prop-type"));
      box.appendChild(field("Bedrooms", select("l-beds-" + i, "beds-" + i, BEDS, h.beds), "prop-beds"));
      box.appendChild(field("Current report", select("l-due-" + i, "due-" + i, DUE.map(function (d) {
        return { value: d, label: d };
      }), h.due), "prop-due"));

      // Under the fields: whether we cover the postcode, and this home's guide price.
      var foot = el("p", "prop-foot");
      var note = el("span", "field-note");
      note.id = "l-pc-note-" + i;
      var price = el("span", "prop-price");
      price.setAttribute("data-home-price", "");
      foot.append(note, price);
      box.appendChild(foot);
      propsBox.appendChild(box);
    }
    form.querySelectorAll("[data-count]").forEach(function (b) {
      var step = parseInt(b.getAttribute("data-count"), 10);
      b.disabled = step < 0 ? n <= 1 : n >= cfg.maxProperties;
    });
    update();
  }

  function clampCount(n) {
    return Math.min(cfg.maxProperties, Math.max(1, n || 1));
  }

  // Reads the homes shown on the page (which can briefly differ from the number typed in the box).
  function readHomes() {
    var n = propsBox.querySelectorAll(".prop").length;
    for (var i = 0; i < n; i++) {
      var h = homes[i];
      h.postcode = form.elements["pc-" + i].value;
      h.ptype = form.elements["type-" + i].value;
      h.beds = form.elements["beds-" + i].value;
      h.due = form.elements["due-" + i].value;
    }
    return homes.slice(0, n);
  }

  function homePrice(h) {
    return P.compute("eicr", { ptype: h.ptype, beds: h.beds, reason: "landlord", boards: "one" });
  }

  function label(options, value) {
    for (var i = 0; i < options.length; i++) {
      if (options[i].value === value) {
        return options[i].label;
      }
    }
    return value;
  }

  // "2-bedroom flat", "Studio or 1-bedroom flat", "4-bedroom shared house (HMO)".
  function describe(h) {
    var beds = label(BEDS, h.beds);
    var size = beds === "Studio or 1" ? "Studio or 1-bedroom" : beds === "5 or more" ? "5+ bedroom" : beds + "-bedroom";
    var type = h.ptype === "flat" ? "flat" : h.ptype === "house" ? "house" : "shared house (HMO)";
    return size + " " + type;
  }

  /* ---------- Dates ---------- */

  function renderDates() {
    var days = D.workingDays(new Date(), cfg.dates, cfg.leadDays - 1);
    if (!days.length) {
      return;
    }
    var offered = {};
    days.forEach(function (d) {
      offered[d.iso] = d;
    });
    var first = days[0].date;
    var last = days[days.length - 1].date;
    var monday = D.addDays(first, -((first.getDay() + 6) % 7));
    datesBox.textContent = "";
    for (var wk = monday; wk <= last; wk = D.addDays(wk, 7)) {
      var week = el("div", "week");
      week.appendChild(el("h3", "", "Week of " + D.fmt.short.format(wk)));
      var grid = el("div", "week-days");
      for (var k = 0; k < 6; k++) {
        var d = D.addDays(wk, k);
        var iso = D.isoDate(d);
        var reason = D.closedReason(d);
        if (offered[iso]) {
          var b = el("button", "date-btn");
          b.type = "button";
          b.setAttribute("data-date", iso);
          b.setAttribute("aria-pressed", "false");
          b.setAttribute("aria-label", D.fmt.long.format(d) + (offered[iso].saturday ? ", morning only" : ""));
          b.append(el("small", "", D.fmt.weekdayShort.format(d)), el("b", "", String(d.getDate())), el("i", "", offered[iso].saturday ? "am only" : D.fmt.dayMonth.format(d).split(" ")[1]));
          grid.appendChild(b);
        } else if (reason && d >= first && d <= last) {
          var c = el("button", "date-btn");
          c.type = "button";
          c.disabled = true;
          c.setAttribute("aria-label", D.fmt.long.format(d) + ", closed (" + reason + ")");
          c.append(el("small", "", D.fmt.weekdayShort.format(d)), el("b", "", String(d.getDate())), el("i", "", "Closed"));
          grid.appendChild(c);
        } else {
          var blank = el("span", "date-blank");
          blank.setAttribute("aria-hidden", "true");
          grid.appendChild(blank);
        }
      }
      week.appendChild(grid);
      datesBox.appendChild(week);
    }
  }

  function pickedText() {
    var sorted = picked.slice().sort();
    return sorted.map(function (iso) {
      return D.fmt.short.format(D.parseIso(iso));
    });
  }

  function listWords(items, word) {
    if (items.length <= 1) {
      return items.join("");
    }
    return items.slice(0, -1).join(", ") + " " + word + " " + items[items.length - 1];
  }

  function updatePicked(extra) {
    pickedLine.textContent = "";
    if (!picked.length) {
      pickedLine.textContent = extra || "No days picked yet.";
      return;
    }
    pickedLine.append(document.createTextNode("Picked: "), el("strong", "", listWords(pickedText(), "or")), document.createTextNode(extra ? ". " + extra : "."));
  }

  datesBox.addEventListener("click", function (event) {
    var b = event.target.closest(".date-btn");
    if (!b || b.disabled) {
      return;
    }
    var iso = b.getAttribute("data-date");
    var at = picked.indexOf(iso);
    if (at !== -1) {
      picked.splice(at, 1);
      b.setAttribute("aria-pressed", "false");
      updatePicked();
    } else if (picked.length >= cfg.maxDates) {
      updatePicked("That's three already: unpick one to change it");
      return;
    } else {
      picked.push(iso);
      b.setAttribute("aria-pressed", "true");
      updatePicked();
    }
    clearErrors();
    update();
  });

  /* ---------- Summary ---------- */

  function total(list) {
    var lo = 0;
    var hi = 0;
    list.forEach(function (h) {
      var r = homePrice(h);
      lo += r.lo;
      hi += r.hi;
    });
    var off = list.length >= cfg.discount.from ? cfg.discount.percent : 0;
    if (off) {
      lo = Math.floor((lo * (100 - off)) / 100 / 10) * 10;
      hi = Math.ceil((hi * (100 - off)) / 100 / 10) * 10;
    }
    return { lo: lo, hi: hi, off: off };
  }

  function update() {
    var list = readHomes();
    var outside = 0;
    var hmo = false;
    propsBox.querySelectorAll(".prop").forEach(function (box, i) {
      var h = list[i];
      var r = homePrice(h);
      var line = box.querySelector("[data-home-price]");
      line.textContent = "";
      line.append(document.createTextNode("Guide "), el("strong", "", P.range(r.lo, r.hi)));
      var note = document.getElementById("l-pc-note-" + i);
      var a = A.lookup(h.postcode);
      note.className = "field-note";
      if (!a.ok) {
        note.textContent = a.reason === "format" ? "Not a postcode yet" : "Postcode, like N12 8QJ";
      } else {
        note.classList.add(a.status === "no" ? "is-no" : "is-yes");
        note.textContent = a.status === "no" ? "Outside our area" : a.district + ", " + a.name;
        if (a.status === "no") {
          outside++;
        }
      }
      if (h.ptype === "hmo") {
        hmo = true;
      }
    });

    sum.homes.textContent = "";
    sum.homes.append(UI.icon("i-home"), document.createTextNode(list.length + (list.length === 1 ? " home" : " homes") + (picked.length ? ", " + picked.length + (picked.length === 1 ? " day" : " days") + " picked" : "")));
    var t = total(list);
    sum.price.className = "estimate-price";
    sum.price.textContent = P.range(t.lo, t.hi);
    sum.small.hidden = false;
    sum.small.textContent = "In total, including VAT" + (t.off ? ", with " + t.off + "% off for " + cfg.discount.from + " or more homes." : ".");

    sum.notes.textContent = "";
    if (!t.off && list.length === cfg.discount.from - 1) {
      sum.notes.appendChild(el("li", "", "Add one more home and the whole booking gets " + cfg.discount.percent + "% off."));
    }
    if (hmo) {
      sum.notes.appendChild(el("li", "", "HMOs often need fire alarm and emergency lighting checks too. We quote those separately."));
    }
    if (outside) {
      sum.notes.appendChild(el("li", "", (outside === 1 ? "One home is" : outside + " homes are") + " outside our area. Send it anyway and we'll tell you if we can help."));
    }
  }

  /* ---------- Checking and sending ---------- */

  function clearErrors() {
    errorsBox.hidden = true;
    errorsBox.textContent = "";
  }

  function problems(list) {
    var out = [];
    list.forEach(function (h, i) {
      var a = A.lookup(h.postcode);
      var input = form.elements["pc-" + i];
      if (!a.ok) {
        out.push("Add the postcode of home " + (i + 1) + ".");
        input.setAttribute("aria-invalid", "true");
      } else {
        input.removeAttribute("aria-invalid");
      }
    });
    if (!form.querySelector('input[name="access"]:checked')) {
      out.push("Choose how we get in.");
    }
    if (!picked.length) {
      out.push("Pick at least one day.");
    }
    var name = form.elements.name;
    var err = form.querySelector('[data-error-for="name"]');
    if (!name.value.trim()) {
      out.push("Add your name.");
      err.hidden = false;
      name.setAttribute("aria-invalid", "true");
    } else {
      err.hidden = true;
      name.removeAttribute("aria-invalid");
    }
    return out;
  }

  function message(list) {
    var t = total(list);
    var lines = ["Hi Earthpin, I'd like to book " + (list.length === 1 ? "an EICR for 1 rented home." : "EICRs for " + list.length + " rented homes."), ""];
    list.forEach(function (h, i) {
      var a = A.lookup(h.postcode);
      lines.push((i + 1) + ". " + (a.full || a.district) + ": " + describe(h) + ". Current report: " + h.due.toLowerCase());
    });
    lines.push("");
    lines.push("Access: " + form.querySelector('input[name="access"]:checked').value);
    var time = form.querySelector('input[name="time"]:checked').value;
    lines.push("Preferred dates: " + listWords(pickedText(), "or") + (time === "any" ? " (any time)" : " (" + time + ")"));
    lines.push("Guide price on your website: " + P.range(t.lo, t.hi) + (list.length > 1 ? " in total" : "") + (t.off ? ", with " + t.off + "% off" : ""));
    lines.push("");
    lines.push("Name: " + form.elements.name.value.trim() + " (" + form.elements.role.value + ")");
    var email = form.elements.email.value.trim();
    lines.push("Send the reports to: " + (email || "this WhatsApp chat"));
    var notes = form.elements.notes.value.trim();
    if (notes) {
      lines.push("Notes: " + notes);
    }
    return lines.join("\n");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var via = event.submitter && event.submitter.getAttribute("data-via") === "email" ? "email" : "whatsapp";
    var list = readHomes();
    var p = problems(list);
    if (p.length) {
      errorsBox.textContent = "";
      errorsBox.appendChild(el("p", "", "Nearly there. Please:"));
      var ul = el("ul");
      p.forEach(function (t) {
        ul.appendChild(el("li", "", t));
      });
      errorsBox.appendChild(ul);
      errorsBox.hidden = false;
      errorsBox.focus();
      return;
    }
    clearErrors();
    var text = message(list);
    if (via === "email") {
      text = text.replace("Send the reports to: this WhatsApp chat", "Send the reports to: this email address");
    }
    UI.send(via, text, { subject: "EICR booking: " + list.length + (list.length === 1 ? " home" : " homes") });
  });

  form.querySelectorAll("[data-count]").forEach(function (b) {
    b.addEventListener("click", function () {
      readHomes();
      countInput.value = String(clampCount(parseInt(countInput.value, 10) + parseInt(b.getAttribute("data-count"), 10)));
      renderHomes();
    });
  });

  countInput.addEventListener("change", function () {
    readHomes();
    renderHomes();
  });

  form.addEventListener("input", function (event) {
    if (event.target.name === "name" && event.target.value.trim()) {
      event.target.removeAttribute("aria-invalid");
      form.querySelector('[data-error-for="name"]').hidden = true;
    }
    if (event.target.name && /^pc-/.test(event.target.name)) {
      event.target.removeAttribute("aria-invalid");
      update();
    }
  });

  form.addEventListener("change", function (event) {
    if (event.target.name !== "count") {
      update();
    }
  });

  renderHomes();
  renderDates();
  updatePicked();
})();
