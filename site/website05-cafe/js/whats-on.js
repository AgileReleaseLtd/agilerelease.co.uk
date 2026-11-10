/* What's on: this week's specials board and the events, worked out from data.js relative to today, and the
   "save a spot" form, which writes a WhatsApp message on the visitor's own device. Nothing is sent to or
   stored by this website. */
(function () {
  var data = window.Cobnut;
  var D = window.CobnutDays;
  var UI = window.CobnutUI;
  var el = UI.el;
  var icon = UI.icon;

  var now = new Date();
  var LOOK_AHEAD = 120; // days, so a monthly event that skips a closed day still shows its next date

  /* ---------- Specials board ---------- */

  function board() {
    var soups = document.querySelector("[data-soups]");
    var side = document.querySelector("[data-specials-side]");
    if (!soups || !side) {
      return;
    }
    var sp = D.specials(now);
    var range = document.querySelector("[data-week-range]");
    if (range) {
      range.textContent = "Week of " + D.rangeText(sp.monday, sp.sunday);
    }
    soups.textContent = "";
    sp.days.forEach(function (day) {
      var past = D.daysBetween(now, day.date) < 0;
      var isToday = D.sameDay(day.date, now);
      var li = el("li", isToday ? "is-today" : past ? "is-past" : day.closed ? "is-closed" : "");
      li.appendChild(el("span", "soup-day", D.fmt.weekdayShort.format(day.date) + " " + day.date.getDate()));
      var name = el("span", "soup-name");
      if (day.closed) {
        name.textContent = "Closed (" + day.closed + ")";
      } else {
        name.appendChild(document.createTextNode(day.soup.name + " "));
        var words = UI.dietWords(day.soup.diet);
        if (words) {
          name.appendChild(el("span", "chalk-tags", words));
        }
      }
      if (isToday) {
        name.appendChild(el("span", "today-mark", "today"));
      }
      li.appendChild(name);
      soups.appendChild(li);
    });

    side.textContent = "";
    function item(label, value, small) {
      var li = el("li");
      li.appendChild(el("span", "board-label", label));
      li.appendChild(el("span", "board-value", value));
      if (small) {
        li.appendChild(el("span", "board-small", small));
      }
      side.appendChild(li);
    }
    item("Bake of the week", sp.bake, "£4.20 a slice, until it runs out");
    item("Sandwich of the week", sp.sandwich, "£9.50, or £11 with a cup of soup");
    item("Guest coffee for " + D.fmt.month.format(now), sp.coffee.origin, sp.coffee.notes + ". As a pour-over, £4.50");
  }

  /* ---------- Events ---------- */

  var listBox = document.querySelector("[data-events]");
  var dialog = document.getElementById("spot-dialog");
  var byId = {};
  data.events.forEach(function (ev) {
    byId[ev.id] = ev;
  });

  function bookableDates(id) {
    return D.upcomingEvents(now, LOOK_AHEAD, id).filter(function (o) {
      return D.bookable(o, now);
    });
  }

  function events() {
    if (!listBox) {
      return;
    }
    var cards = data.events.map(function (ev) {
      var all = D.upcomingEvents(now, LOOK_AHEAD, ev.id);
      return { ev: ev, all: all, next: all[0] };
    }).filter(function (c) {
      return c.next;
    }).sort(function (a, b) {
      return a.next.start - b.next.start;
    });

    listBox.textContent = "";
    cards.forEach(function (c) {
      var ev = c.ev;
      var o = c.next;
      var li = el("li", "event tone-" + ev.id);
      li.id = "event-" + ev.id;
      li.setAttribute("data-event-card", ev.id);
      li.appendChild(UI.dateTile(o));

      var body = el("div", "event-body");
      var h = el("h3");
      h.appendChild(icon(ev.icon));
      h.appendChild(document.createTextNode(ev.title));
      body.appendChild(h);
      body.appendChild(el("p", "event-rule", D.ruleText(ev)));
      var meta = el("p", "event-meta");
      var when = el("span");
      when.appendChild(icon("i-clock"));
      when.appendChild(document.createTextNode("Next: " + UI.whenText(o, now) + " to " + D.clock(o.end)));
      var price = el("span");
      price.appendChild(icon("i-tag"));
      price.appendChild(document.createTextNode(ev.price));
      meta.append(when, price);
      body.appendChild(meta);
      body.appendChild(el("p", "event-desc", ev.desc));
      var later = c.all.slice(1, 4);
      var more = later.map(function (x) {
        return D.fmt.short.format(x.date);
      });
      // Dates this event would fall on but the café is closed (a holiday): say so, so nobody turns up.
      var last = later.length ? later[later.length - 1].date : o.date;
      var skipped = [];
      for (var d = D.startOfDay(now); d <= last; d = D.addDays(d, 1)) {
        if (D.occursOn(ev, d) && D.closedReason(d)) {
          skipped.push(D.fmt.short.format(d) + " (" + D.closedReason(d) + ")");
        }
      }
      if (more.length || skipped.length) {
        var line = el("p", "event-more", more.length ? "Then " + more.join(", ") + "." : "");
        if (skipped.length) {
          line.appendChild(el("span", "event-skip", " Not on " + skipped.join(" or ") + "."));
        }
        body.appendChild(line);
      }
      li.appendChild(body);

      var action = el("div", "event-action");
      var dates = bookableDates(ev.id);
      if (!D.bookable(o, now)) {
        action.appendChild(el("p", "event-soon", o.start <= now ? "On now: just come along." : "Starting soon: just come along."));
      }
      if (dates.length) {
        var b = el("button", "btn btn-primary");
        b.type = "button";
        b.setAttribute("data-spot", ev.id);
        b.setAttribute("aria-label", ev.book.button + ": " + ev.title);
        b.appendChild(icon("i-chat"));
        b.appendChild(document.createTextNode(ev.book.button));
        action.appendChild(b);
      }
      li.appendChild(action);
      listBox.appendChild(li);
    });
  }

  /* ---------- Save a spot ---------- */

  if (!dialog) {
    board();
    events();
    return;
  }

  var form = dialog.querySelector("[data-spot-form]");
  var sent = dialog.querySelector("[data-sent]");
  var nameInput = form.elements.name;
  var nameError = form.querySelector('[data-error-for="name"]');
  var dateSelect = form.querySelector("[data-spot-date]");
  var countSelect = form.querySelector("[data-spot-count]");
  var current = null; // the event
  var opener = null;

  var UNIT = { people: "People", children: "Children", places: "Places" };

  function openSpot(id, iso, from) {
    var ev = byId[id];
    var dates = ev ? bookableDates(id) : [];
    if (!dates.length || typeof dialog.showModal !== "function") {
      return;
    }
    current = ev;
    opener = from || null;

    dialog.querySelector("[data-spot-title]").textContent = ev.book.button;
    var summary = dialog.querySelector("[data-spot-summary]");
    summary.textContent = "";
    summary.appendChild(el("strong", "", ev.title));
    summary.appendChild(el("span", "", D.clockHM(ev.start) + " to " + D.clockHM(ev.end) + ". " + ev.price + "."));

    dateSelect.textContent = "";
    dates.slice(0, 6).forEach(function (o) {
      var opt = el("option", "", D.fmt.short.format(o.date));
      opt.value = D.isoDate(o.date);
      dateSelect.appendChild(opt);
    });
    if (iso && dateSelect.querySelector('option[value="' + iso + '"]')) {
      dateSelect.value = iso;
    }

    form.querySelector("[data-count-label]").textContent = ev.book.label;
    countSelect.textContent = "";
    for (var n = 1; n <= ev.book.max; n++) {
      var opt = el("option", "", String(n));
      opt.value = String(n);
      countSelect.appendChild(opt);
    }
    countSelect.value = ev.book.unit === "people" && ev.book.max >= 2 ? "2" : "1";

    form.hidden = false;
    sent.hidden = true;
    nameError.hidden = true;
    nameInput.removeAttribute("aria-invalid");
    form.elements.note.value = "";
    dialog.showModal();
    dateSelect.focus();
  }

  function message() {
    var ev = current;
    var o = D.upcomingEvents(now, LOOK_AHEAD, ev.id).filter(function (x) {
      return D.isoDate(x.date) === dateSelect.value;
    })[0];
    var n = +countSelect.value;
    var lines = [
      n === 1 ? "Hi Cobnut, please save me a spot." : "Hi Cobnut, please save us a spot.",
      "",
      "Event: " + ev.title,
      "Date: " + D.fmt.long.format(o.date) + ", " + D.clock(o.start),
      "Name: " + nameInput.value.trim(),
      UNIT[ev.book.unit] + ": " + n
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
    var text = message();
    if (data.sample) {
      sent.querySelector("[data-message]").textContent = text;
      form.hidden = true;
      sent.hidden = false;
      sent.querySelector("[data-sent-title]").focus();
      return;
    }
    UI.sendWhatsApp(text);
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
    var first = listBox && listBox.querySelector("[data-spot]");
    if (first) {
      first.focus();
    }
  });

  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  // A dialog opened from a link on the home page had nothing focused before it; send focus to its card.
  dialog.addEventListener("close", function () {
    if (opener && document.activeElement === document.body) {
      opener.focus();
    }
  });

  if (listBox) {
    listBox.addEventListener("click", function (event) {
      var b = event.target.closest("[data-spot]");
      if (b) {
        openSpot(b.getAttribute("data-spot"), null, b);
      }
    });
  }

  /* ---------- Start ---------- */

  board();
  events();

  // Links from the home page: whats-on.html?event=quiz&date=2026-12-03 opens that booking.
  var params = new URLSearchParams(window.location.search);
  var wanted = params.get("event");
  if (wanted && byId[wanted]) {
    var card = document.getElementById("event-" + wanted);
    if (card) {
      card.scrollIntoView({ block: "center" });
    }
    openSpot(wanted, params.get("date"), card && card.querySelector("[data-spot]"));
  } else if (window.location.hash) {
    var target = document.getElementById(window.location.hash.slice(1));
    if (target) {
      target.scrollIntoView();
    }
  }
})();
