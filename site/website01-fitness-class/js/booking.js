/* The timetable page: a calendar of the bookable days, the classes on the chosen day, the week at a glance,
   and the booking form. A booking becomes a WhatsApp message written on the visitor's own device; nothing
   is sent to or stored by this website. */
(function () {
  var data = window.Ironfern;
  var S = window.IronfernSchedule;

  var calDays = document.querySelector("[data-cal-days]");
  var calTitle = document.querySelector("[data-cal-title]");
  var dayTitle = document.querySelector("[data-day-title]");
  var slotList = document.querySelector("[data-slots]");
  var empty = document.querySelector("[data-day-empty]");
  var filterButtons = document.querySelectorAll("[data-filter]");
  var dialog = document.getElementById("book-dialog");
  if (!calDays || !slotList || !dialog) {
    return;
  }

  var form = dialog.querySelector("[data-book-form]");
  var sent = dialog.querySelector("[data-sent]");
  var nameInput = form.elements.name;
  var nameError = form.querySelector('[data-error-for="name"]');

  var win = S.bookingWindow();
  var selected = null; // Date
  var filter = "all";
  var current = null; // the class being booked

  var PLAN = {
    first: "First class with us (free)",
    dropin: "Drop-in (£14, paying when I arrive)",
    pass: "10-class pass",
    unlimited: "Unlimited member"
  };

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

  function openSlots(d) {
    return S.classesOn(d).filter(function (slot) {
      return slot.status === "open";
    });
  }

  function inWindow(d) {
    return d >= win.first && d <= win.last;
  }

  function selectable(d) {
    return inWindow(d) && !S.closedReason(d);
  }

  /* ---------- Calendar ---------- */

  // Monday of the first week to Sunday of the last week, so the grid lines up under Mon ... Sun.
  function gridRange() {
    var start = S.addDays(win.first, -((win.first.getDay() + 6) % 7));
    var end = S.addDays(win.last, (7 - win.last.getDay()) % 7);
    return { start: start, end: end };
  }

  function renderCalendar() {
    var range = gridRange();
    calDays.textContent = "";
    // "November 2026", "November to December 2026" or "December 2026 to January 2027".
    var firstMonth = S.fmt.month.format(win.first);
    var lastMonth = S.fmt.month.format(win.last);
    if (firstMonth === lastMonth) {
      calTitle.textContent = firstMonth;
    } else if (win.first.getFullYear() === win.last.getFullYear()) {
      calTitle.textContent = S.fmt.monthName.format(win.first) + " to " + lastMonth;
    } else {
      calTitle.textContent = firstMonth + " to " + lastMonth;
    }

    for (var d = range.start; d <= range.end; d = S.addDays(d, 1)) {
      var iso = S.isoDate(d);
      var button = el("button", "cal-day");
      button.type = "button";
      button.setAttribute("data-date", iso);
      button.tabIndex = -1;

      if (d.getDate() === 1) {
        button.appendChild(el("small", "cal-mon", S.fmt.monthShort.format(d)));
      }
      button.appendChild(el("span", "cal-num", String(d.getDate())));

      var label = S.fmt.long.format(d);
      var reason = S.closedReason(d);
      if (!inWindow(d)) {
        button.disabled = true;
        label += d < win.first ? ", in the past" : ", not bookable yet";
      } else if (reason) {
        button.disabled = true;
        button.classList.add("is-closed");
        button.title = "Closed: " + reason;
        label += ", studio closed (" + reason + ")";
      } else {
        var slots = openSlots(d);
        var dots = el("span", "cal-dots");
        dots.setAttribute("aria-hidden", "true");
        if (slots.some(function (s) { return s.cls.family === "forge"; })) {
          dots.appendChild(el("i", "forge"));
        }
        if (slots.some(function (s) { return s.cls.family === "flow"; })) {
          dots.appendChild(el("i", "flow"));
        }
        button.appendChild(dots);
        label += ", " + (slots.length ? slots.length + (slots.length === 1 ? " class" : " classes") + " to book" : "no more classes to book");
      }
      if (S.sameDay(d, win.first)) {
        button.classList.add("is-today");
        label = "Today, " + label;
      }
      button.setAttribute("aria-label", label);
      button.setAttribute("aria-pressed", "false");
      calDays.appendChild(button);
    }
  }

  function dayButton(d) {
    return calDays.querySelector('[data-date="' + S.isoDate(d) + '"]');
  }

  function select(d, opts) {
    opts = opts || {};
    selected = d;
    calDays.querySelectorAll(".cal-day").forEach(function (b) {
      var on = b.getAttribute("data-date") === S.isoDate(d);
      b.setAttribute("aria-pressed", String(on));
      b.tabIndex = on ? 0 : -1;
    });
    if (opts.focus) {
      dayButton(d).focus();
    }
    renderDay();
    if (window.history.replaceState) {
      var url = new URL(window.location.href);
      url.searchParams.set("date", S.isoDate(d));
      url.searchParams.delete("book");
      window.history.replaceState(null, "", url);
    }
  }

  calDays.addEventListener("click", function (event) {
    var b = event.target.closest(".cal-day");
    if (!b || b.disabled) {
      return;
    }
    select(S.parseIso(b.getAttribute("data-date")));
    // On narrow screens the list sits under the calendar: bring it into view.
    if (window.matchMedia("(max-width: 960px)").matches) {
      dayTitle.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }
  });

  // The nearest day that can be picked, starting at d and moving by dir (1 or -1) days.
  function nearestSelectable(d, dir) {
    for (; inWindow(d); d = S.addDays(d, dir)) {
      if (selectable(d)) {
        return d;
      }
    }
    return null;
  }

  // Arrow keys move a day (left, right) or a week (up, down); Home and End go to the first and last day.
  // Days that cannot be picked are skipped.
  calDays.addEventListener("keydown", function (event) {
    var steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    var target = null;
    if (steps[event.key]) {
      var step = steps[event.key];
      target = nearestSelectable(S.addDays(selected, step), step > 0 ? 1 : -1);
    } else if (event.key === "Home") {
      target = nearestSelectable(win.first, 1);
    } else if (event.key === "End") {
      target = nearestSelectable(win.last, -1);
    }
    if (target) {
      event.preventDefault();
      select(target, { focus: true });
    }
  });

  /* ---------- The chosen day ---------- */

  function renderDay() {
    var d = selected;
    var rel = S.relativeDay(d);
    dayTitle.textContent = "";
    dayTitle.appendChild(el("small", "", rel === "Today" || rel === "Tomorrow" ? rel : S.fmt.weekday.format(d)));
    dayTitle.appendChild(document.createTextNode(S.fmt.dayMonth.format(d)));

    var all = S.classesOn(d);
    var shown = all.filter(function (slot) {
      return filter === "all" || slot.cls.family === filter;
    });

    slotList.textContent = "";
    empty.hidden = true;
    empty.textContent = "";

    if (!shown.length) {
      empty.hidden = false;
      if (S.closedReason(d)) {
        empty.textContent = "The studio is closed on this day (" + S.closedReason(d) + ").";
      } else {
        empty.appendChild(document.createTextNode("No " + (filter === "forge" ? "Forge" : "Flow") + " classes on this day."));
        var showAll = el("button", "", "Show all classes");
        showAll.type = "button";
        showAll.addEventListener("click", function () {
          setFilter("all");
        });
        empty.appendChild(showAll);
      }
      return;
    }

    shown.forEach(function (slot) {
      var li = el("li", "slot" + (slot.cls.family === "flow" ? " is-flow" : "") + (slot.status === "past" ? " is-past" : ""));

      var time = el("div", "slot-time", slot.time);
      time.appendChild(el("small", "", slot.cls.minutes + " min"));

      var body = el("div", "slot-body");
      var name = el("h3", "slot-name", slot.cls.name);
      if (slot.cls.level === "Beginners") {
        name.appendChild(el("span", "tag", "Beginners"));
      }
      body.appendChild(name);
      body.appendChild(el("p", "slot-meta", "with " + slot.coach.name + " · " + slot.cls.level + " · up to " + slot.cls.capacity));
      body.appendChild(el("p", "slot-blurb", slot.cls.blurb));

      var action = el("div", "slot-action");
      if (slot.status === "open") {
        var book = el("button", "btn btn-primary btn-sm", "Book");
        book.type = "button";
        book.setAttribute("data-book", slot.id);
        book.setAttribute("aria-label", "Book " + slot.cls.name + " at " + slot.time + " with " + slot.coach.name);
        action.appendChild(book);
      } else {
        action.appendChild(el("span", "slot-status", slot.status === "past" ? "Started" : "Booking closed"));
      }

      li.append(time, body, action);
      slotList.appendChild(li);
    });
  }

  function setFilter(value) {
    filter = value;
    filterButtons.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === value));
    });
    renderDay();
  }

  filterButtons.forEach(function (b) {
    b.addEventListener("click", function () {
      setFilter(b.getAttribute("data-filter"));
    });
  });

  slotList.addEventListener("click", function (event) {
    var b = event.target.closest("[data-book]");
    if (b) {
      openBooking(b.getAttribute("data-book"));
    }
  });

  /* ---------- Week at a glance ---------- */

  function renderWeek() {
    var box = document.querySelector("[data-week]");
    if (!box) {
      return;
    }
    var names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    [1, 2, 3, 4, 5, 6, 0].forEach(function (dow, i) {
      var col = el("div", "week-day");
      col.appendChild(el("h3", "", names[i]));
      var ul = el("ul");
      (data.week[dow] || []).forEach(function (row) {
        var cls = data.classes[row[1]];
        var li = el("li", cls.family === "flow" ? "is-flow" : "");
        li.appendChild(el("span", "wk-time", row[0]));
        li.appendChild(el("b", "", cls.name));
        li.appendChild(el("span", "", data.coaches[row[2]].name + ", " + cls.minutes + " min"));
        ul.appendChild(li);
      });
      col.appendChild(ul);
      box.appendChild(col);
    });
  }

  /* ---------- Booking form ---------- */

  function findSlot(id) {
    var d = S.parseIso((id || "").slice(0, 10));
    if (!d) {
      return null;
    }
    return S.classesOn(d).filter(function (slot) {
      return slot.id === id;
    })[0] || null;
  }

  function openBooking(id) {
    var slot = findSlot(id);
    if (!slot || slot.status !== "open") {
      renderDay(); // the list was stale (booking has since closed)
      return;
    }
    current = slot;

    var summary = dialog.querySelector("[data-summary]");
    summary.className = "book-summary" + (slot.cls.family === "flow" ? " is-flow" : "");
    summary.textContent = "";
    summary.appendChild(el("strong", "", slot.cls.name));
    summary.appendChild(el("span", "", S.fmt.long.format(slot.date) + ", " + slot.time + " to " + slot.end + ", with " + slot.coach.name));

    form.hidden = false;
    sent.hidden = true;
    nameError.hidden = true;
    nameInput.removeAttribute("aria-invalid");
    form.elements.note.value = "";
    dialog.showModal();
    nameInput.focus();
  }

  function message(slot) {
    var lines = [
      "Hi Ironfern, I'd like to book a place.",
      "",
      "Class: " + slot.cls.name,
      "Day: " + S.fmt.long.format(slot.date),
      "Time: " + slot.time + " to " + slot.end + " (with " + slot.coach.name + ")",
      "Name: " + nameInput.value.trim(),
      "Booking as: " + PLAN[form.elements.plan.value]
    ];
    var note = form.elements.note.value.trim();
    if (note) {
      lines.push("Note: " + note);
    }
    return lines.join("\n");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!nameInput.value.trim()) {
      nameError.hidden = false;
      nameInput.setAttribute("aria-invalid", "true");
      nameInput.focus();
      return;
    }
    var text = message(current);

    if (data.sample) {
      sent.querySelector("[data-message]").textContent = text;
      form.hidden = true;
      sent.hidden = false;
      sent.querySelector("[data-sent-title]").focus();
      return;
    }

    var url = "https://wa.me/" + data.whatsapp + "?text=" + encodeURIComponent(text);
    var opened = window.open(url, "_blank");
    if (opened) {
      opened.opener = null;
    } else {
      window.location.href = url;
    }
    dialog.close();
  });

  nameInput.addEventListener("input", function () {
    if (nameInput.value.trim()) {
      nameError.hidden = true;
      nameInput.removeAttribute("aria-invalid");
    }
  });

  dialog.querySelectorAll("[data-close]").forEach(function (b) {
    b.addEventListener("click", function () {
      dialog.close();
    });
  });

  dialog.querySelector("[data-again]").addEventListener("click", function () {
    dialog.close();
    dayTitle.focus();
  });

  // A click on the dimmed backdrop lands on the dialog element itself.
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  /* ---------- Start ---------- */

  renderCalendar();
  renderWeek();

  var params = new URLSearchParams(window.location.search);
  var wanted = S.parseIso(params.get("date"));
  var start = wanted && selectable(wanted) ? wanted : null;
  if (!start) {
    // The first day that still has a class to book; today if it has.
    for (var d = win.first; d <= win.last; d = S.addDays(d, 1)) {
      if (selectable(d) && openSlots(d).length) {
        start = d;
        break;
      }
    }
  }
  select(start || win.first);

  var bookId = params.get("book");
  if (bookId && typeof dialog.showModal === "function") {
    openBooking(bookId);
  }
})();
