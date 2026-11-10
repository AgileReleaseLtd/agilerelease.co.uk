/* The quote form for non-urgent work. It works out a guide price from data.js and writes the request as a
   WhatsApp message (or an email) on the visitor's own device. Nothing is sent to or kept by this website. */
(function () {
  var D = window.Nightjar;
  var C = window.NightjarCore;

  var form = document.querySelector("[data-quote-form]");
  if (!form) {
    return;
  }
  var card = form.parentElement;
  var sent = card.querySelector("[data-quote-sent]");
  var jobSelect = form.elements.job;
  var daySelect = form.elements.day;
  var slotsBox = form.querySelector("[data-quote-slots]");
  var countField = form.querySelector("[data-quote-count]");
  var doorField = form.querySelector("[data-quote-door]");
  var areaNote = form.querySelector("[data-quote-area]");
  var errorBox = form.querySelector("[data-quote-error]");
  var nameError = form.querySelector('[data-error-for="name"]');
  var defaultAreaNote = areaNote.textContent;

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

  /* ---------- Options ---------- */

  // Bookable jobs, grouped like the price list.
  var groups = {};
  D.bookable.forEach(function (k) {
    var g = D.jobs[k].group;
    if (!groups[g]) {
      groups[g] = el("optgroup");
      groups[g].label = D.groups[g];
      jobSelect.appendChild(groups[g]);
    }
    var o = el("option", "", D.jobs[k].name + " (" + (D.jobs[k].from ? "from " : "") + C.money(D.jobs[k].day) + ")");
    o.value = k;
    groups[g].appendChild(o);
  });

  // Days from tomorrow: Monday to Saturday, not bank holidays.
  function fillDays() {
    var today = C.startOfDay(new Date());
    daySelect.textContent = "";
    for (var i = 1; i <= D.bookingDays; i++) {
      var d = C.addDays(today, i);
      if (d.getDay() === 0 || C.bankHoliday(d)) {
        continue;
      }
      var o = el("option", "", (i === 1 ? "Tomorrow, " : "") + C.fmt.long.format(d));
      o.value = C.isoDate(d);
      daySelect.appendChild(o);
    }
  }

  Object.keys(D.slots).forEach(function (k, i) {
    var s = D.slots[k];
    var label = el("label", "option");
    var input = el("input");
    input.type = "radio";
    input.name = "slot";
    input.value = k;
    input.checked = i === 0;
    var text = el("span");
    text.appendChild(el("strong", "", s.label));
    text.appendChild(document.createTextNode(" " + s.hours + (s.evening ? ", evening rate" : "")));
    label.append(input, document.createTextNode(" "), text);
    slotsBox.appendChild(label);
  });

  fillDays();

  /* ---------- Working out the price ---------- */

  function area() {
    var raw = form.elements.postcode.value.trim();
    if (!raw) {
      return { empty: true };
    }
    var parsed = C.parsePostcode(raw);
    if (parsed.error) {
      return { bad: true };
    }
    var a = C.area(parsed.outward);
    return a ? { area: a } : { outside: parsed.outward };
  }

  // Saturday work is at the evening and weekend rate, as is the evening slot.
  function rateFor() {
    var slot = D.slots[form.elements.slot.value];
    var day = C.parseIso(daySelect.value);
    if (slot.evening || (day && day.getDay() === 6)) {
      return "evening";
    }
    return "day";
  }

  function count() {
    var job = D.jobs[jobSelect.value];
    if (!job.extra) {
      return 1;
    }
    var n = Math.floor(+form.elements.count.value);
    return n >= 1 && n <= 6 ? n : 1;
  }

  function update() {
    var job = D.jobs[jobSelect.value];
    countField.hidden = !job.extra;
    doorField.hidden = job.group === "safe";
    var where = area();
    var bandKey = where.area ? where.area.bandKey : "A";
    if (where.area) {
      areaNote.textContent = where.area.code + ", " + where.area.places + ": " + where.area.band.name.toLowerCase() + (where.area.band.travel ? ", " + C.money(where.area.band.travel) + " travel." : ", no travel charge.");
      areaNote.classList.remove("is-bad");
    } else if (where.outside) {
      areaNote.textContent = "Sorry, we don't cover " + where.outside + ". It's too far for us to come at a fair price.";
      areaNote.classList.add("is-bad");
    } else {
      areaNote.textContent = defaultAreaNote;
      areaNote.classList.remove("is-bad");
    }
    var rate = rateFor();
    var q = C.quote(jobSelect.value, rate, count(), bandKey);
    form.querySelector("[data-quote-total]").textContent = (q.from ? "From " : "") + C.money(q.total);
    form.querySelector("[data-quote-lines]").textContent = summary(q, rate, where.area);
    return q;
  }

  // "2 locks, day rate, no travel charge"
  function basis(q, rate, a) {
    var parts = [];
    if (q.count > 1) {
      parts.push(q.count + " locks");
    }
    parts.push(rate === "day" ? "day rate" : "evening and weekend rate");
    parts.push(a ? (a.band.travel ? C.money(a.band.travel) + " travel" : "no travel charge") : "travel worked out from your postcode");
    return parts.join(", ");
  }

  function summary(q, rate, a) {
    var text = basis(q, rate, a);
    return text.charAt(0).toUpperCase() + text.slice(1) + "." + (q.from ? " The final price depends on your door; we confirm it before we start." : "");
  }

  form.addEventListener("input", update);
  form.addEventListener("change", update);

  /* ---------- Message ---------- */

  function message(q) {
    var job = D.jobs[jobSelect.value];
    var a = area().area;
    var slot = D.slots[form.elements.slot.value];
    var day = C.parseIso(daySelect.value);
    var lines = [
      "Hi Nightjar, I'd like to book some work that isn't urgent.",
      "",
      "Job: " + job.name + (q.count > 1 ? " x " + q.count : "")
    ];
    if (!doorField.hidden) {
      lines.push("Door: " + form.elements.door.value);
    }
    lines.push("Where: " + a.code + " (" + a.places + ")");
    lines.push("When: " + C.fmt.long.format(day) + ", " + slot.label.toLowerCase() + " (" + slot.hours + ")");
    lines.push("Guide price on your website: " + (q.from ? "from " : "") + C.money(q.total) + " (" + basis(q, rateFor(), a) + ")");
    lines.push("Name: " + form.elements.name.value.trim());
    if (form.elements.phone.value.trim()) {
      lines.push("Phone: " + form.elements.phone.value.trim());
    }
    if (form.elements.note.value.trim()) {
      lines.push("Note: " + form.elements.note.value.trim());
    }
    if (form.elements.photo.checked) {
      lines.push("");
      lines.push("I'll send a photo of the lock in this chat.");
    }
    return lines.join("\n");
  }

  function fail(text, field) {
    errorBox.textContent = text;
    errorBox.hidden = false;
    if (field) {
      field.setAttribute("aria-invalid", "true");
      field.focus();
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    errorBox.hidden = true;
    nameError.hidden = true;
    form.elements.postcode.removeAttribute("aria-invalid");
    form.elements.name.removeAttribute("aria-invalid");

    var where = area();
    if (where.empty || where.bad) {
      fail(where.empty ? "Please add your postcode, so we can work out travel and check we cover you." : "That postcode doesn't look right. Try the first part, like RM12.", form.elements.postcode);
      return;
    }
    if (where.outside) {
      fail("Sorry, we don't cover " + where.outside + ". Please look for a locksmith closer to you.", form.elements.postcode);
      return;
    }
    if (!form.elements.name.value.trim()) {
      nameError.hidden = false;
      form.elements.name.setAttribute("aria-invalid", "true");
      form.elements.name.focus();
      return;
    }

    var q = update();
    var text = message(q);
    var via = event.submitter && event.submitter.value === "email" ? "email" : "whatsapp";
    C.saveArea(where.area.code);

    if (D.sample) {
      sent.querySelector("[data-sent-message]").textContent = text;
      var to = sent.querySelector("[data-sent-to]");
      to.lastChild.textContent = via === "email" ? " To " + D.email + " by email" : " To Nightjar Locksmiths on WhatsApp";
      to.querySelector("use").setAttribute("href", via === "email" ? "#i-mail" : "#i-chat");
      sent.querySelector("[data-sent-explain]").textContent = via === "email" ?
        "On a real locksmith's website, this button opens your email app with the message above ready to send." :
        "On a real locksmith's website, this button opens WhatsApp with the message above ready to send. The locksmith replies to confirm the day and the price.";
      form.hidden = true;
      sent.hidden = false;
      sent.querySelector("[data-sent-title]").focus();
      return;
    }

    var url = via === "email" ?
      "mailto:" + D.email + "?subject=" + encodeURIComponent("Quote request: " + D.jobs[jobSelect.value].short) + "&body=" + encodeURIComponent(text) :
      "https://wa.me/" + D.whatsapp + "?text=" + encodeURIComponent(text);
    if (via === "email") {
      window.location.href = url;
      return;
    }
    var opened = window.open(url, "_blank");
    if (opened) {
      opened.opener = null;
    } else {
      window.location.href = url;
    }
  });

  form.elements.name.addEventListener("input", function () {
    if (form.elements.name.value.trim()) {
      nameError.hidden = true;
      form.elements.name.removeAttribute("aria-invalid");
    }
  });

  sent.querySelector("[data-quote-edit]").addEventListener("click", function () {
    sent.hidden = true;
    form.hidden = false;
    jobSelect.focus();
  });

  /* ---------- Filling in from links ---------- */

  function prefill(job, n, postcode) {
    if (job && D.bookable.indexOf(job) !== -1) {
      jobSelect.value = job;
    }
    if (n) {
      form.elements.count.value = String(Math.max(1, Math.min(6, n)));
    }
    if (postcode) {
      form.elements.postcode.value = postcode;
    }
    sent.hidden = true;
    form.hidden = false;
    update();
  }

  var params = new URLSearchParams(window.location.search);
  prefill(params.get("job"), +params.get("count") || 0, params.get("area") && D.districts[params.get("area")] ? params.get("area") : C.savedArea());

  window.NightjarQuote = { prefill: prefill };
})();
