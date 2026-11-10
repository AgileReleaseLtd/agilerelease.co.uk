/* New patient form. It checks the answers, then writes a message on the visitor's own device for them to
   send on WhatsApp or by email. Nothing is sent to or kept by this website, and on purpose the form asks
   no health questions: the medical history form is filled in at the first visit.
   register.html?care=private&reason=implants fills those answers in. */
(function () {
  var data = window.Harebell;
  var clock = window.HarebellClock;
  var form = document.querySelector("[data-join-form]");
  if (!form) {
    return;
  }
  var result = document.querySelector("[data-result]");
  var summary = form.querySelector("[data-error-summary]");
  var summaryList = form.querySelector("[data-error-list]");
  var f = form.elements;

  var REASONS = {
    checkup: "A check-up",
    hygiene: "A hygienist visit",
    problem: "A problem that is not urgent",
    treatment: "Treatment I know I need",
    cosmetic: "Whitening or clear aligners",
    implants: "Implants",
    child: "My child's first visit",
    other: "Something else"
  };
  var CALL_TIMES = {
    any: "Any time you are open",
    morning: "Morning (8:30am to 12 noon)",
    lunch: "Lunchtime (12 noon to 2pm)",
    afternoon: "Afternoon (2pm to 5pm)",
    evening: "After 5pm on a Tuesday or Thursday"
  };
  var FEEL = { fine: "Fine", bit: "A bit nervous", very: "Very nervous" };
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  function radio(name) {
    var checked = form.querySelector('input[name="' + name + '"]:checked');
    return checked ? checked.value : "";
  }

  function show(selector, on) {
    var node = form.querySelector(selector);
    if (node) {
      node.hidden = !on;
    }
    return node;
  }

  // The date of birth as a Date, or an error message.
  function readDob() {
    var d = f.dobDay.value.trim();
    var m = f.dobMonth.value.trim();
    var y = f.dobYear.value.trim();
    if (!d && !m && !y) {
      return { error: "Enter a date of birth" };
    }
    if (!/^\d{1,2}$/.test(d) || !/^\d{1,2}$/.test(m) || !/^\d{4}$/.test(y)) {
      return { error: "Date of birth must be a real date, like 27 3 1990" };
    }
    var date = new Date(+y, +m - 1, +d);
    if (date.getFullYear() !== +y || date.getMonth() !== +m - 1 || date.getDate() !== +d) {
      return { error: "Date of birth must be a real date, like 27 3 1990" };
    }
    var today = clock.startOfDay(clock.now());
    if (date > today) {
      return { error: "Date of birth must be in the past" };
    }
    if (clock.ageOn(date, today) > 120) {
      return { error: "Check the year of birth" };
    }
    return { date: date, age: clock.ageOn(date, today) };
  }

  /* ---------- Answers that change the form ---------- */

  function update() {
    var dob = readDob();
    var age = dob.date ? dob.age : null;
    var child = age !== null && age < 18;

    // Under 18: NHS care is free. Under 16: we need a parent or carer's name.
    show("[data-child-note]", child);
    if (child) {
      form.querySelector("[data-child-text]").textContent = data.nhs.acceptingNew || data.nhs.childrenWelcome
        ? "NHS dental care is free for under-18s, and we are taking new NHS patients under 18."
        : "NHS dental care is free for under-18s. Our NHS list is full at the moment, but we can see children privately or add them to the waiting list.";
    }
    show("[data-guardian]", age !== null && age < 16);

    // Call-back time only when a call back is wanted.
    show("[data-call-time]", radio("reply") === "callback");

    // NHS or private: say plainly what is possible, from the data file's flag.
    var care = radio("care");
    var note = form.querySelector("[data-care-text]");
    var nhsOpen = data.nhs.acceptingNew || (child && data.nhs.childrenWelcome);
    var waiting = false;
    var noteBox = form.querySelector("[data-care-note]");
    noteBox.classList.remove("inline-note-good", "inline-note-warm");
    if (care === "nhs") {
      if (nhsOpen) {
        note.textContent = child && !data.nhs.acceptingNew
          ? "Good news: we are taking new NHS patients under 18."
          : "Good news: we are taking new NHS patients at the moment. Places are limited.";
        noteBox.classList.add("inline-note-good");
      } else {
        note.textContent = "We are not taking new adult NHS patients at the moment. NHS places are limited. " +
          (data.nhs.waitingList ? "We can add you to our NHS waiting list and see you privately in the meantime, or you can look for another NHS dentist on nhs.uk." : "We can see you privately, or you can look for another NHS dentist on nhs.uk.");
        noteBox.classList.add("inline-note-warm");
        waiting = data.nhs.waitingList;
      }
    } else if (care === "unsure") {
      note.textContent = nhsOpen
        ? "No problem. We are taking new NHS patients at the moment, and we will explain the NHS and private options and prices when we call."
        : "No problem. Our NHS list is full for adults right now, so we will explain the private options and prices, and the NHS waiting list, when we call.";
      noteBox.classList.add("inline-note-good");
    }
    noteBox.hidden = !(care === "nhs" || care === "unsure");
    show("[data-waiting]", waiting);

    show("[data-pain-note]", f.reason.value === "problem");
    show("[data-nervous-note]", radio("feel") === "very");

    var left = 300 - f.note.value.length;
    form.querySelector("[data-note-count]").textContent = left + (left === 1 ? " character left" : " characters left");
  }

  form.addEventListener("input", update);
  form.addEventListener("change", update);

  /* ---------- Checking ---------- */

  function setError(key, message, field) {
    var p = form.querySelector('[data-error-for="' + key + '"]');
    if (p) {
      p.textContent = message || "";
      p.hidden = !message;
    }
    var fields = key === "dob" ? [f.dobDay, f.dobMonth, f.dobYear] : field ? [field] : [];
    fields.forEach(function (input) {
      if (message) {
        input.setAttribute("aria-invalid", "true");
      } else {
        input.removeAttribute("aria-invalid");
      }
    });
  }

  function check() {
    var errors = [];
    function add(key, message, field, focus) {
      setError(key, message, field);
      if (message) {
        errors.push({ message: message, focus: focus || field });
      }
    }

    add("name", f.name.value.trim() ? "" : "Enter the patient's full name", f.name);

    var dob = readDob();
    add("dob", dob.error || "", null, f.dobDay);

    var needGuardian = dob.date && dob.age < 16;
    add("guardian", needGuardian && !f.guardian.value.trim() ? "Enter the name of a parent or carer" : "", f.guardian);

    var phone = f.phone.value.trim();
    var digits = phone.replace(/[\s()-]/g, "");
    var phoneError = "";
    if (!phone) {
      phoneError = "Enter a phone number so we can call you back";
    } else if (!/^(\+44|0)\d{9,10}$/.test(digits)) {
      phoneError = "Enter a UK phone number, like 07700 900123";
    }
    add("phone", phoneError, f.phone);

    var email = f.email.value.trim();
    var emailError = "";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailError = "Enter an email address like name@example.com";
    } else if (!email && radio("reply") === "email") {
      emailError = "Enter an email address so we can reply by email";
    }
    add("email", emailError, f.email);

    add("care", radio("care") ? "" : "Choose NHS, private or not sure", null, form.querySelector('input[name="care"]'));
    add("reason", f.reason.value ? "" : "Choose the main reason for your visit", f.reason);

    summaryList.textContent = "";
    errors.forEach(function (e) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + e.focus.id;
      a.textContent = e.message;
      a.addEventListener("click", function (event) {
        event.preventDefault();
        e.focus.focus();
      });
      li.appendChild(a);
      summaryList.appendChild(li);
    });
    summary.hidden = !errors.length;
    return { ok: !errors.length, dob: dob };
  }

  // Give the first radio buttons ids so the error summary can jump to them.
  form.querySelector('input[name="care"]').id = "care-nhs";

  /* ---------- The message ---------- */

  function message(dob) {
    var name = f.name.value.trim();
    var child = dob.age < 16;
    var reply = radio("reply");
    var lines = [];
    lines.push(child
      ? "Hi Harebell Dental, I'd like to bring my child to you as a new patient."
      : "Hi Harebell Dental, I'd like to join as a new patient.");
    lines.push(reply === "callback" ? "Please call me back." : reply === "whatsapp" ? "Please reply on WhatsApp." : "Please reply by email.");
    lines.push("");
    lines.push((child ? "Patient: " : "Name: ") + name);
    lines.push("Date of birth: " + dob.date.getDate() + " " + MONTHS[dob.date.getMonth()] + " " + dob.date.getFullYear() + " (age " + dob.age + ")");
    if (child) {
      lines.push("Parent or carer: " + f.guardian.value.trim());
    }
    lines.push("Phone: " + f.phone.value.trim());
    if (f.email.value.trim()) {
      lines.push("Email: " + f.email.value.trim());
    }
    if (reply === "callback") {
      lines.push("Best time to call: " + CALL_TIMES[f.callTime.value]);
    }
    var care = radio("care");
    var careWords = { nhs: "NHS", "private": "Private", unsure: "Not sure yet" }[care];
    if (care === "nhs" && !form.querySelector("[data-waiting]").hidden && f.waitingList.checked) {
      careWords += " (please add me to the NHS waiting list)";
    }
    lines.push("Care: " + careWords);
    lines.push("Reason for visit: " + REASONS[f.reason.value]);
    lines.push("Feelings about the dentist: " + FEEL[radio("feel")]);
    var access = Array.prototype.slice.call(form.querySelectorAll('input[name="access"]:checked')).map(function (c) {
      return c.value;
    });
    if (access.length) {
      lines.push("It would help to have: " + access.join(", "));
    }
    var note = f.note.value.trim().replace(/\s+/g, " ");
    if (note) {
      lines.push("Note: " + note);
    }
    lines.push("");
    lines.push(f.healthChat.checked
      ? "Health: I'd like a quick call about my health before booking. I'll fill in the medical history form at my first visit."
      : "Health: I'll fill in the medical history form at my first visit.");
    return lines.join("\n");
  }

  var current = "";

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var checked = check();
    if (!checked.ok) {
      summary.focus();
      return;
    }
    current = message(checked.dob);
    result.querySelector("[data-message]").textContent = current;
    var wa = result.querySelector('[data-send="whatsapp"]');
    var mail = result.querySelector('[data-send="email"]');
    wa.href = "https://wa.me/" + data.whatsapp + "?text=" + encodeURIComponent(current);
    mail.href = "mailto:" + data.email + "?subject=" + encodeURIComponent("New patient: " + f.name.value.trim()) + "&body=" + encodeURIComponent(current);
    result.querySelector("[data-sample-inline]").hidden = !data.sample;
    form.hidden = true;
    result.hidden = false;
    result.querySelector("[data-result-title]").focus();
    result.scrollIntoView({ block: "start" });
  });

  // On the sample site the send buttons explain themselves; on a real site they open WhatsApp or email.
  result.querySelectorAll("[data-send]").forEach(function (link) {
    link.addEventListener("click", function (event) {
      if (data.sample && window.HarebellSample && window.HarebellSample.explain(link.getAttribute("data-send"))) {
        event.preventDefault();
      }
    });
  });

  result.querySelector("[data-edit]").addEventListener("click", function () {
    result.hidden = true;
    form.hidden = false;
    f.name.focus();
  });

  /* ---------- Start: answers from the link ---------- */

  var params = new URLSearchParams(window.location.search);
  var care = params.get("care");
  if (["nhs", "private", "unsure"].indexOf(care) >= 0) {
    form.querySelector('input[name="care"][value="' + care + '"]').checked = true;
  }
  var reason = params.get("reason");
  if (reason && REASONS[reason]) {
    f.reason.value = reason;
  }
  update();
})();
