/* The free trial form. Year, subject, then a group class from the timetable (with its next dates) or a
   one-to-one request with preferred days and times, then the parent's contact details and the child's first
   name. It writes a WhatsApp message on the visitor's own device; nothing is sent to or kept by this site. */
(function () {
  var data = window.Markwell;
  var D = window.MarkwellDates;
  var el = window.MarkwellSite.el;
  var now = new Date();

  var form = document.querySelector("[data-trial-form]");
  var dialog = document.getElementById("sent-dialog");
  if (!form || !dialog) {
    return;
  }
  var f = form.elements;
  var summary = document.querySelector("[data-summary]");
  var groupPanel = form.querySelector("[data-group-panel]");
  var onePanel = form.querySelector("[data-one-panel]");
  var slotList = form.querySelector("[data-slot-list]");
  var datesBox = form.querySelector("[data-dates]");
  var dateChoices = form.querySelector("[data-date-choices]");
  var fullNote = form.querySelector("[data-full-note]");
  var boardField = form.querySelector("[data-board-field]");
  var youngNote = form.querySelector("[data-young-note]");
  var errorsBox = form.querySelector("[data-errors]");
  var errorList = form.querySelector("[data-error-list]");

  var NOTICE_HOURS = 20; // a trial is booked for tomorrow at the earliest
  var TIMES = [
    { value: "after-school", label: "After school", sub: "4pm to 6pm" },
    { value: "evening", label: "Early evening", sub: "6pm to 8pm" },
    { value: "sat-morning", label: "Saturday morning", sub: "9am to 12pm" },
    { value: "sat-afternoon", label: "Saturday afternoon", sub: "12pm to 3pm" }
  ];
  var DAYS = [1, 2, 3, 4, 5, 6];
  var pendingDate = null; // a date asked for in the link, used once its class is shown

  function svgIcon(id) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "icon");
    svg.setAttribute("aria-hidden", "true");
    var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
  }

  function choice(type, name, value, title, sub, extraClass) {
    var label = el("label", "choice" + (type === "checkbox" ? " choice-check" : "") + (extraClass ? " " + extraClass : ""));
    var input = el("input");
    input.type = type;
    input.name = name;
    input.value = value;
    var body = el("span", "choice-body");
    var strong = el("strong", "", title);
    body.appendChild(strong);
    if (sub) {
      body.appendChild(el("span", "", sub));
    }
    label.append(input, body);
    return label;
  }

  function radioValue(name) {
    var checked = form.querySelector('input[name="' + name + '"]:checked');
    return checked ? checked.value : "";
  }

  function checkedValues(name) {
    return Array.prototype.map.call(form.querySelectorAll('input[name="' + name + '"]:checked'), function (i) {
      return i.value;
    });
  }

  function year() {
    return f.year.value === "" ? null : +f.year.value;
  }

  function levelFor(subject, y) {
    return data.levels.filter(function (l) {
      return l.subject === subject && y >= l.from && y <= l.to;
    })[0] || null;
  }

  function matchingClasses() {
    var y = year();
    var subject = radioValue("subject");
    if (y === null || !subject) {
      return [];
    }
    return data.classes.filter(function (c) {
      return c.subject === subject && D.forYear(c, y);
    }).sort(function (a, b) {
      return a.day - b.day || (a.start < b.start ? -1 : 1);
    });
  }

  function selectedClass() {
    return D.classById(radioValue("slot"));
  }

  /* ---------- Building the choices ---------- */

  function fillYears() {
    data.stages.forEach(function (stage) {
      var group = el("optgroup");
      group.label = stage.name + (stage.tag ? " (" + stage.tag + ")" : "");
      for (var y = stage.from; y <= stage.to; y++) {
        var o = el("option", "", D.yearName(y));
        o.value = String(y);
        group.appendChild(o);
      }
      f.year.appendChild(group);
    });
    form.querySelector("[data-year-hint]").textContent = "The year they are in now, in the " + D.schoolYearLabel(now) + " school year.";
    data.boards.forEach(function (b) {
      var o = el("option", "", b);
      o.value = b;
      f.board.appendChild(o);
    });
  }

  function fillOneToOne() {
    var days = form.querySelector("[data-day-choices]");
    DAYS.forEach(function (d) {
      days.appendChild(choice("checkbox", "days", String(d), D.DAY_NAMES[d], "", "choice-compact"));
    });
    var times = form.querySelector("[data-time-choices]");
    TIMES.forEach(function (t) {
      times.appendChild(choice("checkbox", "times", t.value, t.label, t.sub, "choice-compact"));
    });
  }

  // Subject cards: what each subject means for the chosen year, and 11+ only for Years 4 to 6.
  function updateSubjects() {
    var y = year();
    form.querySelectorAll('input[name="subject"]').forEach(function (input) {
      var body = input.nextElementSibling;
      var sub = body.querySelector("span");
      if (!sub) {
        sub = el("span");
        body.appendChild(sub);
      }
      var level = y === null ? null : levelFor(input.value, y);
      input.disabled = y !== null && y >= data.firstYear && !level;
      if (input.disabled && input.checked) {
        input.checked = false;
      }
      if (y === null || y < data.firstYear) {
        sub.textContent = input.value === "elevenplus" ? "Years 4 to 6" : "Year 3 to Year 13";
      } else {
        sub.textContent = level ? level.title : "For Years 4 to 6 only";
      }
    });
    boardField.hidden = !(y !== null && y >= 10 && radioValue("subject") && radioValue("subject") !== "elevenplus");
  }

  function updateYoung() {
    var y = year();
    var young = y !== null && y < data.firstYear;
    youngNote.hidden = !young;
    if (young) {
      var stage = D.stageOf(y);
      form.querySelector("[data-young-text]").textContent = D.yearName(y) + " is in " +
        (stage.id === "eyfs" ? "the Early Years Foundation Stage" : stage.long) +
        ". Our classes start in Year 3, at the beginning of Key Stage 2, so we cannot offer a trial yet.";
    }
    form.querySelectorAll('[data-step="subject"], [data-step="type"], [data-step="you"], [data-submit-row]').forEach(function (step) {
      step.hidden = young;
    });
  }

  function updateGroupChoice() {
    var list = matchingClasses();
    var groupInput = form.querySelector('input[name="type"][value="group"]');
    var sub = form.querySelector("[data-group-sub]");
    var ready = year() !== null && radioValue("subject");
    groupInput.disabled = !!ready && !list.length;
    if (groupInput.disabled && groupInput.checked) {
      groupInput.checked = false;
    }
    sub.textContent = ready && !list.length ? "No group class for this year and subject at the moment." :
      ready ? D.plural(list.length, "class", "classes") + " a week for this year. Up to six in a group." :
      "Join one real session free, in a group of up to six.";
  }

  function renderSlots() {
    var keep = radioValue("slot");
    slotList.textContent = "";
    matchingClasses().forEach(function (c) {
      var left = D.placesLeft(c);
      var meta = D.yearsLabel(c.from, c.to) + " · " + (c.room === "online" ? "Online" : data.rooms[c.room].name) + " · " + data.tutors[c.tutor].name +
        " · " + (left ? D.plural(left, "place") + " left" : "Full: waiting list");
      var label = choice("radio", "slot", c.id, D.DAY_NAMES[c.day] + ", " + D.timeRange(c), "", "");
      var body = label.querySelector(".choice-body");
      body.appendChild(el("span", "slot-title", c.title));
      body.appendChild(el("span", "", meta));
      if (c.id === keep) {
        label.querySelector("input").checked = true;
      }
      slotList.appendChild(label);
    });
    renderDates();
  }

  function renderDates() {
    var c = selectedClass();
    var keep = pendingDate || radioValue("date");
    dateChoices.textContent = "";
    datesBox.hidden = true;
    fullNote.hidden = true;
    if (!c) {
      return;
    }
    if (!D.placesLeft(c)) {
      fullNote.hidden = false;
      return;
    }
    var dates = D.nextSessions(c, 3, now, NOTICE_HOURS);
    dates.forEach(function (d, i) {
      var iso = D.isoDate(d);
      var label = choice("radio", "date", iso, D.fmt.long.format(d), "", "choice-compact");
      var input = label.querySelector("input");
      if (iso === keep || (!keep && i === 0)) {
        input.checked = true;
      }
      dateChoices.appendChild(label);
    });
    if (!radioValue("date") && dates.length) {
      dateChoices.querySelector("input").checked = true;
    }
    pendingDate = null;
    datesBox.hidden = !dates.length;
  }

  function updateType() {
    var type = radioValue("type");
    groupPanel.hidden = type !== "group";
    onePanel.hidden = type !== "one";
    if (type === "group") {
      renderSlots();
    }
  }

  /* ---------- Summary and message ---------- */

  function lessonText() {
    var type = radioValue("type");
    if (type === "group") {
      var c = selectedClass();
      if (!c) {
        return "Group class";
      }
      var where = c.room === "online" ? "online" : data.rooms[c.room].name;
      return "Group class: " + c.title + ", " + D.DAY_NAMES[c.day] + " " + D.timeRange(c) + ", " + where + ", with " + data.tutors[c.tutor].name;
    }
    if (type === "one") {
      return "One-to-one taster (" + data.trialMinutesOneToOne + " minutes), " + (radioValue("where") === "online" ? "online" : "in the centre");
    }
    return "";
  }

  function whenText() {
    var type = radioValue("type");
    if (type === "group") {
      var c = selectedClass();
      if (c && !D.placesLeft(c)) {
        return "Class full: please add us to the waiting list";
      }
      var d = D.parseIso(radioValue("date"));
      return d ? D.fmt.long.format(d) : "";
    }
    if (type === "one") {
      var days = checkedValues("days").map(function (d) {
        return D.DAY_NAMES[+d];
      });
      var times = checkedValues("times").map(function (v) {
        var t = TIMES.filter(function (x) { return x.value === v; })[0];
        return t.label.toLowerCase() + " (" + t.sub + ")";
      });
      return [days.join(", "), times.join(", ")].filter(Boolean).join("; ");
    }
    return "";
  }

  function subjectText() {
    var s = radioValue("subject");
    if (!s) {
      return "";
    }
    var level = year() !== null ? levelFor(s, year()) : null;
    return data.subjects[s].name + (level && s !== "elevenplus" ? " (" + level.title + ")" : "");
  }

  function childText() {
    var y = year();
    var name = f.child.value.trim();
    var parts = [];
    if (name) {
      parts.push(name);
    }
    if (y !== null) {
      parts.push(D.yearName(y) + " (" + D.stageOf(y).name + ")");
    }
    return parts.join(", ");
  }

  function renderSummary() {
    var rows = [
      ["Child", childText()],
      ["Subject", subjectText() + (f.board.value && !boardField.hidden ? ", " + f.board.value : "")],
      ["Lesson", lessonText()],
      ["When", whenText()],
      ["Contact", [f.parent.value.trim(), f.phone.value.trim()].filter(Boolean).join(", ")]
    ];
    summary.textContent = "";
    rows.forEach(function (r) {
      var div = el("div");
      div.appendChild(el("dt", "", r[0]));
      div.appendChild(el("dd", r[1] ? "" : "is-empty", r[1] || "Not chosen yet"));
      summary.appendChild(div);
    });
  }

  function message() {
    var type = radioValue("type");
    var lines = ["Hello Markwell Tuition, I would like to book a free trial lesson.", ""];
    lines.push("Child: " + childText());
    lines.push("Subject: " + subjectText());
    if (f.board.value && !boardField.hidden) {
      lines.push("Exam board: " + f.board.value);
    }
    lines.push("Lesson: " + lessonText());
    if (type === "group") {
      lines.push((selectedClass() && !D.placesLeft(selectedClass()) ? "Waiting list: " : "Trial date: ") + whenText().replace("Class full: please add us to the waiting list", "please add us"));
    } else {
      lines.push("Preferred days: " + checkedValues("days").map(function (d) { return D.DAY_NAMES[+d]; }).join(", "));
      lines.push("Preferred times: " + checkedValues("times").map(function (v) {
        var t = TIMES.filter(function (x) { return x.value === v; })[0];
        return t.label + " (" + t.sub + ")";
      }).join(", "));
    }
    lines.push("");
    lines.push("Parent or carer: " + f.parent.value.trim());
    lines.push("Mobile: " + f.phone.value.trim());
    if (f.email.value.trim()) {
      lines.push("Email: " + f.email.value.trim());
    }
    if (f.note.value.trim()) {
      lines.push("Note: " + f.note.value.trim());
    }
    return lines.join("\n");
  }

  /* ---------- Checking the form ---------- */

  function setError(id, show, field) {
    var node = document.getElementById(id);
    if (node) {
      node.hidden = !show;
    }
    if (field) {
      if (show) {
        field.setAttribute("aria-invalid", "true");
      } else {
        field.removeAttribute("aria-invalid");
      }
    }
  }

  function validPhone(v) {
    var digits = v.replace(/[\s()-]/g, "");
    return /^(\+44|0044|0)7\d{9}$/.test(digits);
  }

  function validEmail(v) {
    return !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  }

  // Returns a list of [message, element to focus].
  function check() {
    var problems = [];
    function need(ok, errorId, text, target, field) {
      setError(errorId, !ok, field);
      if (!ok) {
        problems.push([text, target]);
      }
    }
    need(year() !== null, "year-error", "Choose your child's school year", f.year, f.year);
    need(!!f.child.value.trim(), "child-error", "Add your child's first name", f.child, f.child);
    var firstSubject = form.querySelector('input[name="subject"]:not(:disabled)');
    need(!!radioValue("subject"), "subject-error", "Choose a subject", firstSubject);
    var firstType = form.querySelector('input[name="type"]:not(:disabled)');
    need(!!radioValue("type"), "type-error", "Choose a group class or one-to-one", firstType);
    if (radioValue("type") === "group") {
      var c = selectedClass();
      var ok = !!c && (!D.placesLeft(c) || !!radioValue("date"));
      need(ok, "slot-error", "Choose a class and a date", form.querySelector('input[name="slot"]') || firstType);
    } else {
      setError("slot-error", false);
    }
    if (radioValue("type") === "one") {
      need(checkedValues("days").length > 0, "days-error", "Tick at least one day that suits you", form.querySelector('input[name="days"]'));
      need(checkedValues("times").length > 0, "times-error", "Tick at least one time that suits you", form.querySelector('input[name="times"]'));
    } else {
      setError("days-error", false);
      setError("times-error", false);
    }
    need(!!f.parent.value.trim(), "parent-error", "Add your name", f.parent, f.parent);
    need(validPhone(f.phone.value.trim()), "phone-error", "Add a UK mobile number", f.phone, f.phone);
    need(validEmail(f.email.value.trim()), "email-error", "Check the email address", f.email, f.email);
    return problems;
  }

  function fillErrors(problems) {
    errorList.textContent = "";
    problems.forEach(function (p) {
      var li = el("li");
      var a = el("a", "", p[0]);
      a.href = "#" + (p[1].id || "");
      a.addEventListener("click", function (event) {
        event.preventDefault();
        p[1].focus();
      });
      li.appendChild(a);
      errorList.appendChild(li);
    });
  }

  function showErrors(problems) {
    fillErrors(problems);
    errorsBox.hidden = false;
    errorsBox.focus();
  }

  // Once the form has been sent once, keep the error list in step as things are fixed.
  var tried = false;

  /* ---------- Events ---------- */

  function refresh() {
    updateYoung();
    updateSubjects();
    updateGroupChoice();
    updateType();
    renderSummary();
    if (tried) {
      var problems = check();
      errorsBox.hidden = !problems.length;
      if (problems.length) {
        fillErrors(problems);
      }
    }
  }

  form.addEventListener("change", function (event) {
    var name = event.target.name;
    if (name === "slot") {
      renderDates();
      renderSummary();
      if (tried) {
        refresh();
      }
      return;
    }
    if (name === "date" || name === "days" || name === "times" || name === "where" || name === "board") {
      renderSummary();
      if (tried) {
        check();
      }
      return;
    }
    refresh();
  });
  form.addEventListener("input", function (event) {
    if (event.target.matches("input[type=text], input[type=tel], input[type=email], textarea")) {
      renderSummary();
      if (tried) {
        check();
      }
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    tried = true;
    var problems = check();
    if (problems.length) {
      showErrors(problems);
      return;
    }
    errorsBox.hidden = true;
    var text = message();

    var email = dialog.querySelector("[data-email-link]");
    email.href = "mailto:" + data.email + "?subject=" + encodeURIComponent("Free trial request") + "&body=" + encodeURIComponent(text);

    if (!data.sample) {
      var url = "https://wa.me/" + data.whatsapp + "?text=" + encodeURIComponent(text);
      var opened = window.open(url, "_blank");
      if (opened) {
        opened.opener = null;
      } else {
        window.location.href = url;
      }
      return;
    }
    dialog.querySelector("[data-message]").textContent = text;
    dialog.querySelector("[data-copy-status]").textContent = "";
    dialog.showModal();
    dialog.querySelector("#sent-title").focus();
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
  dialog.querySelector("[data-copy]").addEventListener("click", function () {
    var status = dialog.querySelector("[data-copy-status]");
    var text = dialog.querySelector("[data-message]").textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        status.textContent = "Copied. Paste it into WhatsApp, a text or an email.";
      }, function () {
        status.textContent = "Could not copy here. Select the message and copy it instead.";
      });
    } else {
      status.textContent = "Could not copy here. Select the message and copy it instead.";
    }
  });

  /* ---------- Start: fill in anything passed in the link ---------- */

  fillYears();
  fillOneToOne();
  var params = new URLSearchParams(window.location.search);
  var fromClass = D.classById(params.get("class"));
  var y = params.get("year");
  if (y !== null && /^\d{1,2}$/.test(y) && +y <= 13) {
    f.year.value = String(+y);
  } else if (fromClass) {
    f.year.value = String(fromClass.from);
  }
  if (fromClass && !D.forYear(fromClass, year())) {
    f.year.value = String(fromClass.from);
  }
  var subject = fromClass ? fromClass.subject : params.get("subject");
  updateSubjects();
  var subjectInput = data.subjects[subject] && form.querySelector('input[name="subject"][value="' + subject + '"]');
  if (subjectInput && !subjectInput.disabled) {
    subjectInput.checked = true;
  }
  updateSubjects();
  updateGroupChoice();
  var type = fromClass ? "group" : params.get("type") === "one" ? "one" : "";
  var typeInput = type && form.querySelector('input[name="type"][value="' + type + '"]');
  if (typeInput && !typeInput.disabled) {
    typeInput.checked = true;
  }
  if (fromClass) {
    pendingDate = params.get("date");
    groupPanel.hidden = false;
    renderSlots();
    var slotInput = form.querySelector('input[name="slot"][value="' + fromClass.id + '"]');
    if (slotInput) {
      slotInput.checked = true;
    }
  }
  refresh();
})();
