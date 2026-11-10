/* Shared helpers: dates and times, opening hours, prices and durations, and who can do what and when.
   Dates are the visitor's local dates, worked out from today, so the site never goes out of date. */
(function () {
  var D = window.SorrelSteel;

  /* ---------- Dates ---------- */

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  // "2026-11-10" for a Date, in local time (toISOString would shift to UTC).
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

  // "09:30" -> 570 minutes after midnight.
  function minutesOf(hm) {
    var p = hm.split(":");
    return +p[0] * 60 + +p[1];
  }

  // The Date for a number of minutes after midnight on day d.
  function at(d, minutes) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, minutes);
  }

  var fmt = {
    long: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }),
    short: new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }),
    weekday: new Intl.DateTimeFormat("en-GB", { weekday: "long" }),
    weekdayShort: new Intl.DateTimeFormat("en-GB", { weekday: "short" }),
    dayMonth: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" }),
    month: new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }),
    monthName: new Intl.DateTimeFormat("en-GB", { month: "long" }),
    monthShort: new Intl.DateTimeFormat("en-GB", { month: "short" })
  };

  var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  // Monday first, the way the week is shown on the site.
  var WEEK = [1, 2, 3, 4, 5, 6, 0];

  // 570 or a Date -> "9:30am"; on the hour -> "6pm".
  function time12(value) {
    var mins = value instanceof Date ? value.getHours() * 60 + value.getMinutes() : value;
    var h = Math.floor(mins / 60) % 24;
    var m = mins % 60;
    var suffix = h < 12 ? "am" : "pm";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (m ? ":" + pad(m) : "") + suffix;
  }

  // 135 -> "2 hr 15 min".
  function duration(mins) {
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    if (!h) {
      return m + " min";
    }
    return h + " hr" + (m ? " " + m + " min" : "");
  }

  // "Today", "Tomorrow" or "Thu 12 Nov".
  function relativeDay(d, now) {
    var today = startOfDay(now || new Date());
    if (sameDay(d, today)) {
      return "Today";
    }
    if (sameDay(d, addDays(today, 1))) {
      return "Tomorrow";
    }
    return fmt.short.format(d);
  }

  /* ---------- Opening hours ---------- */

  function closedReason(d) {
    return D.closedEveryYear[pad(d.getMonth() + 1) + "-" + pad(d.getDate())] || "";
  }

  // The salon's hours on a date as minutes, or null when it is shut.
  function hoursOn(d) {
    var h = D.hours[d.getDay()];
    if (!h || closedReason(d)) {
      return null;
    }
    return { open: minutesOf(h.open), close: minutesOf(h.close), note: h.note || "" };
  }

  // "Open now, until 8pm" or "Closed now. Opens tomorrow at 9:30am".
  function openStatus(now) {
    now = now || new Date();
    var today = startOfDay(now);
    var h = hoursOn(today);
    if (h && now >= at(today, h.open) && now < at(today, h.close)) {
      var who = h.note === "Barbers only" ? "Barbers open" : "Open";
      return { open: true, text: who + " now, until " + time12(h.close) };
    }
    for (var i = 0; i < 8; i++) {
      var d = addDays(today, i);
      var hd = hoursOn(d);
      if (hd && at(d, hd.open) > now) {
        var when = i === 0 ? "today" : i === 1 ? "tomorrow" : DAY_NAMES[d.getDay()];
        return { open: false, text: "Closed now. Opens " + when + " at " + time12(hd.open) };
      }
    }
    return { open: false, text: "Closed now" };
  }

  /* ---------- Services and prices ---------- */

  var byId = {};
  D.services.forEach(function (s) {
    byId[s.id] = s;
  });
  var memberById = {};
  D.team.forEach(function (m) {
    memberById[m.id] = m;
  });

  function service(id) {
    return byId[id] || null;
  }

  function member(id) {
    return memberById[id] || null;
  }

  function category(id) {
    return D.categories.filter(function (c) {
      return c.id === id;
    })[0] || null;
  }

  // "flat", "level" (stylist or senior), "length" (short, medium, long) or "quote".
  function priceKind(s) {
    if (s.quote) {
      return "quote";
    }
    if (typeof s.price === "number") {
      return "flat";
    }
    return "senior" in s.price ? "level" : "length";
  }

  function byLength(value) {
    return typeof value === "object" && value !== null && "medium" in value;
  }

  // The price for a level and a hair length, or null when it depends on one that is not known.
  function priceFor(s, level, length) {
    var kind = priceKind(s);
    if (kind === "flat") {
      return s.price;
    }
    if (kind === "level") {
      return level ? s.price[level] : null;
    }
    if (kind === "length") {
      return length ? s.price[length] : null;
    }
    return null;
  }

  // [lowest, highest] price.
  function priceRange(s) {
    var kind = priceKind(s);
    if (kind === "quote") {
      return null;
    }
    if (kind === "flat") {
      return [s.price, s.price];
    }
    var values = Object.keys(s.price).map(function (k) {
      return s.price[k];
    });
    return [Math.min.apply(null, values), Math.max.apply(null, values)];
  }

  function money(n) {
    return n === 0 ? "Free" : "£" + n;
  }

  function moneyRange(lo, hi) {
    return lo === hi ? money(lo) : "£" + lo + "–£" + hi;
  }

  // Minutes for a hair length, or null when it depends on a length that is not known.
  function minutesFor(s, length) {
    if (!byLength(s.minutes)) {
      return s.minutes;
    }
    return length ? s.minutes[length] : null;
  }

  function minutesRange(s) {
    if (!byLength(s.minutes)) {
      return [s.minutes, s.minutes];
    }
    return [s.minutes.short, s.minutes.long];
  }

  // Does any of these services cost or take a different time for each hair length?
  function needsLength(ids) {
    return ids.some(function (id) {
      var s = service(id);
      return priceKind(s) === "length" || byLength(s.minutes);
    });
  }

  function needsSkinTest(ids) {
    return ids.some(function (id) {
      return !!service(id).skinTest;
    });
  }

  function canDo(m, ids) {
    return ids.every(function (id) {
      return m.does.indexOf(id) !== -1;
    });
  }

  // The team members who do every one of these services.
  function eligible(ids) {
    return D.team.filter(function (m) {
      return canDo(m, ids);
    });
  }

  // Total time and price for services with a set of team members (one, or everyone who could do it).
  // min and max differ when the price depends on who does it. Missing a hair length gives null.
  function totals(ids, length, members) {
    var out = { minutes: 0, min: 0, max: 0, lines: [] };
    ids.forEach(function (id) {
      var s = service(id);
      var mins = minutesFor(s, length);
      out.minutes = out.minutes === null || mins === null ? null : out.minutes + mins;
      var prices = members.map(function (m) {
        return priceFor(s, m.level, length);
      });
      if (!members.length || prices.some(function (p) { return p === null; })) {
        out.lines.push({ service: s, min: null, max: null });
        out.min = out.max = null;
        return;
      }
      var lo = Math.min.apply(null, prices);
      var hi = Math.max.apply(null, prices);
      out.lines.push({ service: s, min: lo, max: hi });
      if (out.min !== null) {
        out.min += lo;
        out.max += hi;
      }
    });
    return out;
  }

  /* ---------- Availability ---------- */

  // The first and last day that can be booked.
  function bookingWindow(now) {
    var first = startOfDay(now || new Date());
    return { first: first, last: addDays(first, D.bookingDays - 1) };
  }

  // Start times (minutes after midnight) when one person could begin services lasting `minutes` on day d.
  function startTimes(m, d, minutes, now) {
    now = now || new Date();
    var shift = m.days[d.getDay()];
    if (!shift || closedReason(d) || !minutes) {
      return [];
    }
    var earliest = new Date(now.getTime() + D.noticeMinutes * 60000);
    var out = [];
    for (var t = minutesOf(shift[0]); t + minutes <= minutesOf(shift[1]); t += D.slotMinutes) {
      if (at(d, t) >= earliest) {
        out.push(t);
      }
    }
    return out;
  }

  // Days on which a skin test could be done for an appointment starting at `start`: any time the salon is
  // open, from now until skinTestHours before the appointment. Each has the latest time to come in.
  function skinTestDays(start, now) {
    now = now || new Date();
    var latest = new Date(start.getTime() - D.skinTestHours * 3600000);
    var out = [];
    for (var d = startOfDay(now); d <= latest; d = addDays(d, 1)) {
      var h = hoursOn(d);
      if (!h) {
        continue;
      }
      var from = Math.max(at(d, h.open).getTime(), now.getTime());
      var to = Math.min(at(d, h.close).getTime(), latest.getTime());
      // At least ten minutes for a five-minute test.
      if (to - from >= 10 * 60000) {
        out.push({ date: d, by: new Date(to), allDay: to === at(d, h.close).getTime() });
      }
    }
    return out;
  }

  // "Tue to Sat" style summary of the days someone works, Monday first.
  function workingDays(m) {
    return WEEK.filter(function (dow) {
      return !!m.days[dow];
    });
  }

  function lateDays(m) {
    return WEEK.filter(function (dow) {
      return m.days[dow] && minutesOf(m.days[dow][1]) >= 19 * 60;
    });
  }

  /* ---------- Small DOM helpers ---------- */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== undefined && text !== null) {
      node.textContent = text;
    }
    return node;
  }

  function icon(id, className) {
    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "icon" + (className ? " " + className : ""));
    svg.setAttribute("aria-hidden", "true");
    var use = document.createElementNS(NS, "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
  }

  // An arch-shaped monogram for a team member (no photos on this site).
  function monogram(m, size) {
    var box = el("span", "monogram monogram-" + m.tone + (size ? " monogram-" + size : ""));
    box.setAttribute("aria-hidden", "true");
    box.appendChild(el("span", "monogram-letter", m.name.charAt(0)));
    return box;
  }

  // A row of seven day letters with the working days marked, plus words for screen readers.
  function weekStrip(m) {
    var wrap = el("span", "week-strip");
    var days = workingDays(m);
    var late = lateDays(m);
    var letters = el("span", "week-strip-days");
    letters.setAttribute("aria-hidden", "true");
    WEEK.forEach(function (dow) {
      var on = days.indexOf(dow) !== -1;
      var cell = el("span", "wk" + (on ? " is-on" : "") + (late.indexOf(dow) !== -1 ? " is-late" : ""), DAY_SHORT[dow].charAt(0));
      letters.appendChild(cell);
    });
    var words = "Works " + days.map(function (dow) { return DAY_NAMES[dow]; }).join(", ").replace(/, ([^,]*)$/, " and $1");
    if (late.length) {
      words += ". Late on " + late.map(function (dow) { return DAY_NAMES[dow]; }).join(" and ");
    }
    wrap.appendChild(letters);
    wrap.appendChild(el("span", "visually-hidden", words + "."));
    return wrap;
  }

  window.SorrelSteelCore = {
    pad: pad,
    isoDate: isoDate,
    parseIso: parseIso,
    startOfDay: startOfDay,
    addDays: addDays,
    sameDay: sameDay,
    minutesOf: minutesOf,
    at: at,
    fmt: fmt,
    DAY_NAMES: DAY_NAMES,
    DAY_SHORT: DAY_SHORT,
    WEEK: WEEK,
    time12: time12,
    duration: duration,
    relativeDay: relativeDay,
    closedReason: closedReason,
    hoursOn: hoursOn,
    openStatus: openStatus,
    service: service,
    member: member,
    category: category,
    priceKind: priceKind,
    priceFor: priceFor,
    priceRange: priceRange,
    money: money,
    moneyRange: moneyRange,
    minutesFor: minutesFor,
    minutesRange: minutesRange,
    needsLength: needsLength,
    needsSkinTest: needsSkinTest,
    canDo: canDo,
    eligible: eligible,
    totals: totals,
    bookingWindow: bookingWindow,
    startTimes: startTimes,
    skinTestDays: skinTestDays,
    workingDays: workingDays,
    lateDays: lateDays,
    el: el,
    icon: icon,
    monogram: monogram,
    weekStrip: weekStrip
  };
})();
