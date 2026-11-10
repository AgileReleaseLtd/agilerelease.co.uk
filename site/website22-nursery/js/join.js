/* The waiting-list form: the child's first name and date of birth (or due date), a preferred start date, days and
   sessions, the parent's contact details, how they heard of us, and an optional show-round visit. It writes a
   WhatsApp (or email) message on the visitor's own device; nothing is sent to or stored by this website. */
(function () {
  var data = window.ButtonTin;
  var BT = window.BT;
  var el = BT.el;

  var form = document.querySelector("[data-join-form]");
  if (!form) {
    return;
  }
  var sent = document.querySelector("[data-sent]");
  var summary = form.querySelector("[data-error-summary]");
  var ageNote = form.querySelector("[data-age-note]");
  var plannerTotal = form.querySelector("[data-planner-total]");
  var f = form.elements;

  var today = BT.startOfDay(new Date());
  var params = new URLSearchParams(window.location.search);

  /* ---------- Build the parts that come from data.js ---------- */

  var heard = form.querySelector("[data-heard]");
  data.heardFrom.forEach(function (h) {
    var o = el("option", "", h);
    o.value = h;
    heard.appendChild(o);
  });

  // Show-round slots: the next few Tuesdays and Thursdays from tomorrow, skipping days we are closed.
  var slotsBox = form.querySelector("[data-slots]");
  var slots = [];
  for (var i = 1; i <= data.showRounds.daysAhead && slots.length < 8; i++) {
    var d = BT.addDays(today, i);
    var times = data.showRounds.days[d.getDay()];
    if (times && !BT.closedReason(d)) {
      times.forEach(function (t) {
        if (slots.length < 8) {
          slots.push({ date: d, time: t });
        }
      });
    }
  }
  var suggest = slotsBox.querySelector('input[value="suggest"]').closest("label");
  slots.forEach(function (s, n) {
    var label = el("label", "choice");
    var input = el("input");
    input.type = "radio";
    input.name = "visit";
    input.value = "slot-" + n;
    var span = el("span");
    span.appendChild(el("strong", "", BT.fmt.short.format(s.date) + ", " + BT.clock(s.time)));
    label.append(input, span);
    slotsBox.insertBefore(label, suggest);
  });
  var none = el("label", "choice choice-wide");
  var noneInput = el("input");
  noneInput.type = "radio";
  noneInput.name = "visit";
  noneInput.value = "";
  noneInput.checked = true;
  var noneSpan = el("span");
  noneSpan.appendChild(el("strong", "", "Not now, thanks"));
  none.append(noneInput, noneSpan);
  slotsBox.appendChild(none);

  var planner = BT.planner(form.querySelector("[data-planner]"), {
    name: "join",
    initial: BT.parsePattern(params.get("pattern")) || ["", "", "", "", ""],
    onChange: function () {
      showPlannerTotal();
      clearError("pattern");
    }
  });

  f.start.min = BT.isoDate(today);

  /* ---------- Helpers ---------- */

  function born() {
    return f.born.value === "yes";
  }

  function childName() {
    return f.childName.value.trim();
  }

  function showPlannerTotal() {
    var p = planner.read();
    var h = BT.patternHours(p);
    var n = BT.patternDays(p);
    plannerTotal.textContent = h ? BT.hoursText(h) + " a week, over " + n + (n === 1 ? " day" : " days") + "." : "No sessions chosen yet.";
  }

  // The child's age in months on the start date, and the room they would start in.
  function ageAtStart() {
    var dob = BT.parseIso(f.dob.value);
    var start = BT.parseIso(f.start.value);
    if (!dob || !start) {
      return null;
    }
    var months = BT.monthsBetween(dob, start);
    return { months: months, room: BT.roomForMonths(months), dob: dob, start: start };
  }

  function updateDobLabel() {
    var label = form.querySelector("[data-dob-label]");
    var hint = form.querySelector("[data-dob-hint]");
    label.textContent = born() ? "Date of birth" : "Due date";
    hint.textContent = born() ? "We use it to work out which room your child would start in." : "Congratulations! Many families join the list before their baby is born.";
    if (!born()) {
      f.dob.min = BT.isoDate(today);
      f.dob.removeAttribute("max");
    } else {
      f.dob.max = BT.isoDate(today);
      f.dob.removeAttribute("min");
    }
  }

  function updateAgeNote() {
    var a = ageAtStart();
    if (!a || a.months < 0) {
      ageNote.hidden = true;
      return;
    }
    var name = childName() || "Your child";
    if (a.room) {
      ageNote.textContent = name + " will be " + BT.ageText(a.months) + " on " + BT.fmt.longYear.format(a.start) + ", so would start in " + a.room.name + ", our " + a.room.kind.toLowerCase() + ".";
      ageNote.hidden = false;
    } else {
      ageNote.hidden = true;
    }
  }

  /* ---------- Validation ---------- */

  var LABELS = {
    childName: "Child's first name",
    dob: "Date of birth",
    start: "Preferred start date",
    pattern: "Days and sessions",
    parentName: "Your name",
    phone: "Mobile number",
    email: "Email"
  };

  function errorEl(name) {
    return form.querySelector('[data-error-for="' + name + '"]');
  }

  function fieldFor(name) {
    if (name === "pattern") {
      return form.querySelector('[data-planner] input');
    }
    return f[name];
  }

  function setError(name, message) {
    var e = errorEl(name);
    e.textContent = message;
    e.hidden = false;
    var field = fieldFor(name);
    if (field && name !== "pattern") {
      field.setAttribute("aria-invalid", "true");
    }
  }

  function clearError(name) {
    var e = errorEl(name);
    if (!e) {
      return;
    }
    e.hidden = true;
    e.textContent = "";
    var field = fieldFor(name);
    if (field) {
      field.removeAttribute("aria-invalid");
    }
  }

  function validate() {
    var errors = [];
    function add(name, message) {
      setError(name, message);
      errors.push([name, message]);
    }
    Object.keys(LABELS).forEach(clearError);

    if (!childName()) {
      add("childName", "Please add your child's first name.");
    }

    var dob = BT.parseIso(f.dob.value);
    if (!dob) {
      add("dob", born() ? "Please add your child's date of birth." : "Please add your baby's due date.");
    } else if (born() && dob > today) {
      add("dob", "That date is in the future. If your baby is not born yet, choose Not yet and give the due date.");
    } else if (born() && BT.monthsBetween(dob, today) >= 60) {
      add("dob", "We care for children up to 5. Please check the date of birth.");
    } else if (!born() && dob < today) {
      add("dob", "A due date should be today or later. If your baby is born, choose Yes and give the date of birth.");
    } else if (!born() && dob > BT.addDays(today, 300)) {
      add("dob", "Please check the due date: it is more than 10 months away.");
    }

    var start = BT.parseIso(f.start.value);
    if (!start) {
      add("start", "Please choose a preferred start date.");
    } else if (start < today) {
      add("start", "The start date is in the past. Please choose a date from today.");
    } else if (start > BT.addDays(today, 3 * 366)) {
      add("start", "Our list runs up to three years ahead. Please choose an earlier date.");
    } else if (!BT.isOpenDay(start)) {
      add("start", "We are closed on " + BT.fmt.longYear.format(start) + (BT.closedReason(start) ? " (" + BT.closedReason(start) + ")" : "") + ". Please choose a weekday we are open.");
    } else if (dob) {
      var months = BT.monthsBetween(dob, start);
      if (months < 6) {
        var six = new Date(dob.getFullYear(), dob.getMonth() + 6, dob.getDate());
        add("start", "Babies can start from 6 months. " + (childName() || "Your baby") + " will be 6 months on " + BT.fmt.dayMonthYear.format(six) + ", so please choose that date or later.");
      } else if (months >= 60) {
        add("start", "We care for children until they start school, at 5 at the latest. Please choose an earlier date.");
      }
    }

    if (!BT.patternHours(planner.read())) {
      add("pattern", "Please choose at least one morning, afternoon or full day.");
    }

    if (!f.parentName.value.trim()) {
      add("parentName", "Please add your name, so we know who to reply to.");
    }

    var phone = f.phone.value.trim();
    var digits = phone.replace(/\D/g, "");
    if (!phone) {
      add("phone", "Please add a mobile number, so we can reply.");
    } else if (!/^[+\d\s()-]+$/.test(phone) || digits.length < 10 || digits.length > 13) {
      add("phone", "Please check the number. It should look like 07700 900123.");
    }

    var email = f.email.value.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      add("email", "Please check the email address, or leave it empty.");
    }
    return errors;
  }

  function showSummary(errors) {
    var list = summary.querySelector("ul");
    list.textContent = "";
    errors.forEach(function (e) {
      var li = el("li");
      var a = el("a", "", e[1]);
      a.href = "#" + (e[0] === "pattern" ? "pattern-error" : fieldFor(e[0]).id);
      a.addEventListener("click", function (event) {
        event.preventDefault();
        var field = fieldFor(e[0]);
        field.focus();
        field.scrollIntoView({ block: "center", behavior: BT.reducedMotion() ? "auto" : "smooth" });
      });
      li.appendChild(a);
      list.appendChild(li);
    });
    summary.hidden = false;
    summary.focus();
  }

  /* ---------- The message ---------- */

  function message() {
    var name = childName();
    var dob = BT.parseIso(f.dob.value);
    var a = ageAtStart();
    var pattern = planner.read();
    var lines = [
      "Hi Button Tin, we'd like to join your waiting list.",
      "",
      "Child: " + name,
      (born() ? "Date of birth: " : "Due date: ") + BT.fmt.dayMonthYear.format(dob),
      "Preferred start: " + BT.fmt.longYear.format(a.start) + (a.room ? " (" + name + " will be " + BT.ageText(a.months) + ": " + a.room.name + ", the " + a.room.kind.toLowerCase() + ")" : ""),
      "Days: " + BT.patternText(pattern) + " (" + BT.hoursText(BT.patternHours(pattern)) + " a week)",
      "",
      "Parent: " + f.parentName.value.trim(),
      "Mobile: " + f.phone.value.trim()
    ];
    if (f.email.value.trim()) {
      lines.push("Email: " + f.email.value.trim());
    }
    if (f.heard.value) {
      lines.push("Heard about you: " + f.heard.value);
    }
    var visit = f.visit.value;
    if (visit === "suggest") {
      lines.push("", "We'd like a show-round. Please suggest a time.");
    } else if (visit.indexOf("slot-") === 0) {
      var s = slots[+visit.slice(5)];
      lines.push("", "We'd like a show-round on " + BT.fmt.long.format(s.date) + " at " + BT.clock(s.time) + ", please.");
    }
    return lines.join("\n");
  }

  /* ---------- Events ---------- */

  form.addEventListener("change", function (event) {
    var t = event.target;
    if (t.name === "born") {
      updateDobLabel();
      clearError("dob");
    }
    if (t.name === "dob" || t.name === "start" || t.name === "born") {
      updateAgeNote();
    }
  });

  form.addEventListener("input", function (event) {
    var name = event.target.name;
    if (LABELS[name] && event.target.value.trim()) {
      clearError(name);
    }
    if (name === "childName") {
      updateAgeNote();
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var errors = validate();
    if (errors.length) {
      showSummary(errors);
      return;
    }
    summary.hidden = true;
    var via = event.submitter && event.submitter.value === "email" ? "email" : "whatsapp";
    var text = message();

    if (data.sample) {
      sent.querySelector("[data-message]").textContent = text;
      var to = sent.querySelector("[data-sent-to]");
      to.textContent = "";
      to.insertAdjacentHTML("afterbegin", '<svg class="icon icon-sm" aria-hidden="true"><use href="#' + (via === "email" ? "i-mail" : "i-chat") + '"/></svg>');
      to.appendChild(document.createTextNode(via === "email" ? " By email to " + data.email : " To Button Tin on WhatsApp"));
      form.hidden = true;
      sent.hidden = false;
      sent.querySelector("[data-sent-title]").focus();
      return;
    }

    var url = via === "email"
      ? "mailto:" + data.email + "?subject=" + encodeURIComponent("Waiting list: " + childName()) + "&body=" + encodeURIComponent(text)
      : "https://wa.me/" + data.whatsapp + "?text=" + encodeURIComponent(text);
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

  sent.querySelector("[data-edit]").addEventListener("click", function () {
    sent.hidden = true;
    form.hidden = false;
    f.childName.focus();
  });

  updateDobLabel();
  showPlannerTotal();
})();
