/* Shared helpers for every page: dates and opening hours in London time, prices, the number-plate and
   postcode checks, and sending a message by WhatsApp or email. Nothing here talks to a server. */
(function () {
  var data = window.Gantry;

  /* ---------- Small helpers ---------- */

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

  // An inline icon from the page's sprite.
  function icon(id, extra) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "icon" + (extra ? " " + extra : ""));
    svg.setAttribute("aria-hidden", "true");
    var use = document.createElementNS(ns, "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
  }

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  // "£45", "£54.85"
  function money(n) {
    return "£" + (n % 1 ? n.toFixed(2) : String(n));
  }

  // "E17, E10 and N17"
  function listWords(items) {
    if (items.length < 2) {
      return items.join("");
    }
    return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
  }

  /* ---------- Dates ---------- */

  // "2026-11-10" for a Date, from its local fields.
  function isoDate(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function parseIso(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
    if (!m) {
      return null;
    }
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return isoDate(d) === s ? d : null; // rejects 2026-02-31 and the like
  }

  function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function addDays(d, n) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  }

  function sameDay(a, b) {
    return isoDate(a) === isoDate(b);
  }

  var fmt = {
    short: new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }),
    long: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }),
    month: new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }),
    monthName: new Intl.DateTimeFormat("en-GB", { month: "long" }),
    monthShort: new Intl.DateTimeFormat("en-GB", { month: "short" }),
    dayMonth: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" }),
    weekday: new Intl.DateTimeFormat("en-GB", { weekday: "long" })
  };

  // The garage keeps London hours, wherever the visitor is. londonNow() is a Date whose local fields
  // (year, month, day, hours, minutes) read the time on a clock in London.
  var londonClock = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23"
  });

  function londonNow() {
    var p = {};
    londonClock.formatToParts(new Date()).forEach(function (part) {
      p[part.type] = part.value;
    });
    return new Date(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute);
  }

  function londonToday() {
    return startOfDay(londonNow());
  }

  /* ---------- Opening hours ---------- */

  function toMinutes(hm) {
    var a = hm.split(":");
    return +a[0] * 60 + +a[1];
  }

  // "8am", "6pm", "12:30pm"
  function clock(hm) {
    var m = toMinutes(hm);
    var h = Math.floor(m / 60);
    var min = m % 60;
    return (h % 12 || 12) + (min ? ":" + pad(min) : "") + (h >= 12 ? "pm" : "am");
  }

  // The hours on one date: { open: "08:00", close: "18:00", note } or { closed: "Christmas Day" }.
  // closed is "" on a day the garage is always shut (Sunday).
  function hoursOn(d) {
    var iso = isoDate(d);
    if (data.closed[iso]) {
      return { closed: data.closed[iso] };
    }
    var special = data.shortDays[iso];
    if (special) {
      return { open: special[0], close: special[1], note: special[2] };
    }
    var h = data.hours[d.getDay()];
    return h ? { open: h[0], close: h[1] } : { closed: "" };
  }

  function isClosedDay(d) {
    return hoursOn(d).closed !== undefined;
  }

  // "today", "tomorrow", "Monday" or "Monday 28 December"
  function whenWord(d, today) {
    var days = Math.round((startOfDay(d) - today) / 86400000);
    if (days === 0) {
      return "today";
    }
    if (days === 1) {
      return "tomorrow";
    }
    return days < 7 ? fmt.weekday.format(d) : fmt.long.format(d);
  }

  // Open or closed right now, in London. { open, title, detail }.
  function openStatus(now) {
    now = now || londonNow();
    var today = startOfDay(now);
    var mins = now.getHours() * 60 + now.getMinutes();
    var h = hoursOn(today);

    if (h.closed === undefined && mins >= toMinutes(h.open) && mins < toMinutes(h.close)) {
      var left = toMinutes(h.close) - mins;
      return {
        open: true,
        title: "Open now",
        detail: (left <= 60 ? "closes soon, at " : "until ") + clock(h.close) + (h.note ? " (" + h.note + ")" : "")
      };
    }
    if (h.closed === undefined && mins < toMinutes(h.open)) {
      return { open: false, title: "Closed now", detail: "opens today at " + clock(h.open) };
    }
    var title = h.closed ? "Closed today (" + h.closed + ")" : h.closed === "" ? "Closed today" : "Closed now";
    for (var i = 1; i <= 21; i++) {
      var d = addDays(today, i);
      var next = hoursOn(d);
      if (next.closed === undefined) {
        return { open: false, title: title, detail: "opens " + whenWord(d, today) + " at " + clock(next.open) };
      }
    }
    return { open: false, title: title, detail: "" };
  }

  // Closures and short days from today to `days` ahead, in date order: [{ date, text }].
  function upcomingChanges(days) {
    var today = londonToday();
    var out = [];
    for (var i = 0; i <= days; i++) {
      var d = addDays(today, i);
      var iso = isoDate(d);
      if (data.closed[iso]) {
        out.push({ date: d, text: "closed (" + data.closed[iso] + ")" });
      } else if (data.shortDays[iso]) {
        var s = data.shortDays[iso];
        out.push({ date: d, text: "closes at " + clock(s[1]) + " (" + s[2] + ")" });
      }
    }
    return out;
  }

  /* ---------- Prices ---------- */

  function servicePrice(service, size, fuel) {
    var s = data.services[service];
    var f = data.fuels[fuel];
    if (!s || !f || s.prices[size] === undefined) {
      return null;
    }
    return s.prices[size] + f.extra[service];
  }

  function cheapestService() {
    var lowest = Infinity;
    Object.keys(data.services).forEach(function (key) {
      Object.keys(data.services[key].prices).forEach(function (size) {
        lowest = Math.min(lowest, data.services[key].prices[size]);
      });
    });
    return lowest;
  }

  /* ---------- Number plates ---------- */

  // When a current-style age identifier (the two numbers in AB12 CDE) was issued: "March to August
  // 2012" for 12, "September 2021 to February 2022" for 71. "" if it has never been issued.
  function ageIdentifier(code, now) {
    var n = +code;
    var year;
    var march;
    if (n >= 2 && n <= 50) {
      year = 2000 + n;
      march = true;
    } else if (n >= 51 || n === 0) {
      year = n === 0 ? 2050 : 2000 + n - 50;
      march = false;
    } else {
      return ""; // 01 was never used
    }
    if (new Date(year, march ? 2 : 8, 1) > (now || londonNow())) {
      return "";
    }
    return march ? "March to August " + year : "September " + year + " to February " + (year + 1);
  }

  // Checks a UK registration. Returns { ok: true, plate: "AB12 CDE", note } or { ok: false, error }.
  // It checks the format only: it cannot tell whether the car exists.
  function checkPlate(raw, now) {
    var s = String(raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    var m;
    if (!s) {
      return { ok: false, empty: true, error: "Please add the car's registration." };
    }
    if (s.length > 7) {
      return { ok: false, error: "That's too long. UK registrations have up to 7 letters and numbers." };
    }

    // Current style, since September 2001: AB12 CDE.
    if ((m = /^([A-Z]{2})(\d{2})([A-Z]{3})$/.exec(s))) {
      if (/[IQZ]/.test(m[1]) || /[IQ]/.test(m[3])) {
        return { ok: false, error: "Plates in this style never use I or Q, or Z in the first two letters. Is one of them a 1 or a 0?" };
      }
      var issued = ageIdentifier(m[2], now);
      if (!issued) {
        return { ok: false, error: m[2] + " isn't a year code that has been issued. Check the two numbers." };
      }
      return { ok: true, plate: m[1] + m[2] + " " + m[3], note: "A " + m[2] + " plate: first registered " + issued + "." };
    }

    // Older styles, also used on private plates. Their numbers never start with 0.
    var older = [
      // Prefix style, 1983 to 2001: A123 BCD.
      [/^([A-Z])(\d{1,3})([A-Z]{3})$/, function () {
        return /[IOUZ]/.test(m[1]) ? "" : m[1] + m[2] + " " + m[3];
      }, "Older style (1983 to 2001), or a private plate."],
      // Suffix style, 1963 to 1983: ABC 123D.
      [/^([A-Z]{3})(\d{1,3})([A-Z])$/, function () {
        return /[IOQUZ]/.test(m[3]) ? "" : m[1] + " " + m[2] + m[3];
      }, "Older style (1963 to 1983), or a private plate."],
      // Dateless and Northern Ireland styles: AB 1234, 1234 AB.
      [/^([A-Z]{1,3})(\d{1,4})$/, function () {
        return m[1] + " " + m[2];
      }, "Dateless or Northern Ireland style plate."],
      [/^(\d{1,4})([A-Z]{1,3})$/, function () {
        return m[1] + " " + m[2];
      }, "Dateless style plate."]
    ];
    for (var i = 0; i < older.length; i++) {
      if ((m = older[i][0].exec(s))) {
        var digits = /\d+/.exec(s)[0];
        var plate = older[i][1]();
        if (digits.charAt(0) === "0" || !plate) {
          break;
        }
        return { ok: true, plate: plate, note: older[i][2] };
      }
    }
    return { ok: false, error: "That doesn't match a UK number plate. Check it against your V5C logbook." };
  }

  // Wires a number-plate input: capitals as you type, tidy spacing and a check when you leave it.
  // Returns a function that checks it now and shows the result: true if it is a valid plate.
  function wirePlate(input, status, opts) {
    opts = opts || {};
    var hint = status ? status.textContent : "";
    var box = input.closest(".plate");

    function show(result) {
      if (!status) {
        return;
      }
      status.classList.toggle("is-ok", !!result && result.ok);
      status.classList.toggle("is-error", !!result && !result.ok);
      status.textContent = result ? (result.ok ? result.note : result.error) : hint;
    }

    function check(quietIfEmpty) {
      var result = checkPlate(input.value);
      if (result.empty && quietIfEmpty) {
        show(null);
        input.removeAttribute("aria-invalid");
        if (box) {
          box.classList.remove("is-error");
        }
        return false;
      }
      if (result.ok) {
        input.value = result.plate;
        input.removeAttribute("aria-invalid");
      } else {
        input.setAttribute("aria-invalid", "true");
      }
      if (box) {
        box.classList.toggle("is-error", !result.ok);
      }
      show(result);
      if (opts.onChange) {
        opts.onChange(result);
      }
      return result.ok;
    }

    input.addEventListener("input", function () {
      var start = input.selectionStart;
      var upper = input.value.toUpperCase();
      if (upper !== input.value) {
        input.value = upper;
        input.setSelectionRange(start, start);
      }
      if (input.getAttribute("aria-invalid") === "true" && checkPlate(input.value).ok) {
        check(false);
      }
      if (opts.onChange) {
        opts.onChange(checkPlate(input.value));
      }
    });
    input.addEventListener("blur", function () {
      check(true);
    });
    if (input.value) {
      check(true);
    }
    return check;
  }

  /* ---------- Postcodes ---------- */

  // Reads a full or part postcode. { ok, district: "E17", full: "E17 4AB" or "", covered, area, fee }.
  function checkPostcode(raw) {
    var s = String(raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!s) {
      return { ok: false, empty: true, error: "Please add your postcode." };
    }
    var m = /^([A-Z]{1,2}\d[A-Z\d]?)(\d[A-Z]{2})?$/.exec(s);
    if (!m) {
      return { ok: false, error: "That doesn't look like a postcode. Try the first part, like E17." };
    }
    var hit = data.collect.districts[m[1]];
    return {
      ok: true,
      district: m[1],
      full: m[2] ? m[1] + " " + m[2] : "",
      covered: !!hit,
      area: hit ? hit[0] : "",
      fee: hit ? hit[1] : null
    };
  }

  function feeWords(fee) {
    return fee ? money(fee) + " for collection and delivery" : "Free collection and delivery";
  }

  function freeDistricts() {
    var d = data.collect.districts;
    return Object.keys(d).filter(function (k) {
      return d[k][1] === 0;
    });
  }

  function collectFee() {
    var d = data.collect.districts;
    var fees = Object.keys(d).map(function (k) {
      return d[k][1];
    }).filter(Boolean);
    return fees.length ? Math.max.apply(null, fees) : 0;
  }

  /* ---------- Sending a message ---------- */

  var dialog = null;

  // A dialog with a title, a close button and the given body nodes.
  function makeDialog(id) {
    var d = el("dialog", "dialog");
    d.setAttribute("aria-labelledby", id + "-title");
    var body = el("div", "dialog-body");
    var head = el("div", "dialog-head");
    var title = el("h2", "dialog-title");
    title.id = id + "-title";
    title.tabIndex = -1;
    var close = el("button", "dialog-close");
    close.type = "button";
    close.setAttribute("aria-label", "Close");
    close.appendChild(icon("i-close"));
    head.append(title, close);
    body.appendChild(head);
    d.appendChild(body);
    document.body.appendChild(d);
    close.addEventListener("click", function () {
      d.close();
    });
    d.addEventListener("click", function (event) {
      if (event.target === d) {
        d.close();
      }
    });
    return { dialog: d, body: body, title: title };
  }

  // Sends `text` by WhatsApp or email ("whatsapp" or "email"). On the sample site the message is shown
  // in a dialog instead, with a note that nothing was sent.
  function sendMessage(opts) {
    var via = opts.via === "email" ? "email" : "whatsapp";
    if (!data.sample) {
      if (via === "email") {
        window.location.href = "mailto:" + data.email + "?subject=" + encodeURIComponent(opts.subject || "") +
          "&body=" + encodeURIComponent(opts.text);
        return;
      }
      var url = "https://wa.me/" + data.whatsapp + "?text=" + encodeURIComponent(opts.text);
      var opened = window.open(url, "_blank");
      if (opened) {
        opened.opener = null;
      } else {
        window.location.href = url;
      }
      return;
    }

    if (dialog) {
      dialog.dialog.remove();
    }
    dialog = makeDialog("message-dialog");
    dialog.dialog.classList.add("dialog-message");
    dialog.title.textContent = opts.title || "Your message";

    var chat = el("div", via === "email" ? "chat chat-email" : "chat");
    var to = el("p", "chat-to");
    to.appendChild(icon(via === "email" ? "i-mail" : "i-chat", "icon-sm"));
    to.appendChild(document.createTextNode(via === "email" ? "Email to " + data.email : "To " + data.name + " on WhatsApp"));
    chat.appendChild(to);
    if (via === "email" && opts.subject) {
      chat.appendChild(el("p", "chat-subject", "Subject: " + opts.subject));
    }
    var bubble = el("p", "bubble", opts.text);
    bubble.setAttribute("data-message", "");
    chat.appendChild(bubble);

    var note = el("div", "sample-note");
    note.appendChild(el("p", "", "This is a sample website, so nothing was sent."));
    note.appendChild(el("p", "", via === "email"
      ? "On the garage's real website, this button opens your email app with the message above ready to send."
      : "On the garage's real website, this button opens WhatsApp with the message above ready to send." + (opts.reply ? " " + opts.reply : "")));

    var actions = el("div", "dialog-actions");
    var edit = el("button", "btn btn-outline", "Change something");
    edit.type = "button";
    var done = el("button", "btn btn-dark", "Done");
    done.type = "button";
    actions.append(edit, done);
    dialog.body.append(chat, note, actions);

    edit.addEventListener("click", function () {
      dialog.dialog.close();
    });
    done.addEventListener("click", function () {
      dialog.dialog.close();
      if (opts.onDone) {
        opts.onDone();
      }
    });
    dialog.dialog.showModal();
    dialog.title.focus();
  }

  // For the sample site's contact buttons: says what the button would do.
  var notice = null;
  function sampleNotice(text) {
    if (!notice) {
      notice = makeDialog("sample-dialog");
      notice.title.textContent = "This is a sample website";
      notice.text = el("p", "");
      var note = el("div", "sample-note");
      note.appendChild(el("p", "", data.name + " is made up. Agile Release built this site to show what a small business website can do."));
      var actions = el("div", "dialog-actions");
      var more = el("a", "btn btn-outline", "Get a site like this");
      more.href = "https://agilerelease.co.uk/#websites";
      var ok = el("button", "btn btn-dark", "OK");
      ok.type = "button";
      ok.addEventListener("click", function () {
        notice.dialog.close();
      });
      actions.append(more, ok);
      notice.body.append(notice.text, note, actions);
    }
    notice.text.textContent = text;
    notice.dialog.showModal();
    notice.title.focus();
  }

  /* ---------- Forms ---------- */

  // Shows or clears the error message for a field. The message element is found by
  // [data-error-for="name"]; the field gets aria-invalid.
  function fieldError(form, name, message) {
    var box = form.querySelector('[data-error-for="' + name + '"]');
    var field = form.elements[name];
    if (box) {
      box.textContent = message || "";
      box.hidden = !message;
    }
    if (field && field.setAttribute) {
      if (message) {
        field.setAttribute("aria-invalid", "true");
      } else {
        field.removeAttribute("aria-invalid");
      }
    }
    return !message;
  }

  function looksLikePhone(value) {
    var digits = String(value || "").replace(/[\s()-]/g, "");
    return /^(\+44|0)\d{9,10}$/.test(digits);
  }

  window.GantryKit = {
    el: el,
    icon: icon,
    pad: pad,
    money: money,
    listWords: listWords,
    isoDate: isoDate,
    parseIso: parseIso,
    startOfDay: startOfDay,
    addDays: addDays,
    sameDay: sameDay,
    fmt: fmt,
    londonNow: londonNow,
    londonToday: londonToday,
    toMinutes: toMinutes,
    clock: clock,
    hoursOn: hoursOn,
    isClosedDay: isClosedDay,
    openStatus: openStatus,
    upcomingChanges: upcomingChanges,
    servicePrice: servicePrice,
    cheapestService: cheapestService,
    checkPlate: checkPlate,
    wirePlate: wirePlate,
    checkPostcode: checkPostcode,
    feeWords: feeWords,
    freeDistricts: freeDistricts,
    collectFee: collectFee,
    sendMessage: sendMessage,
    sampleNotice: sampleNotice,
    fieldError: fieldError,
    looksLikePhone: looksLikePhone
  };
})();
