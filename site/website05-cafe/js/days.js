/* Dates and times for every page: opening hours and holiday exceptions, the "open now" line, the
   weekly specials, the dated events and the collection times for orders. Everything is worked out from
   data.js and the visitor's own clock, so the site never shows last month's quiz. */
(function () {
  var data = window.Cobnut;
  var DAY = 86400000;

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

  // Whole days from a to b (rounded, so a clock change does not matter).
  function daysBetween(a, b) {
    return Math.round((startOfDay(b) - startOfDay(a)) / DAY);
  }

  // The time "HH:MM" on date d.
  function at(d, hm) {
    var p = hm.split(":");
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), +p[0], +p[1]);
  }

  var fmt = {
    weekday: new Intl.DateTimeFormat("en-GB", { weekday: "long" }),
    weekdayShort: new Intl.DateTimeFormat("en-GB", { weekday: "short" }),
    short: new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }),
    long: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }),
    dayMonth: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" }),
    monthShort: new Intl.DateTimeFormat("en-GB", { month: "short" }),
    month: new Intl.DateTimeFormat("en-GB", { month: "long" })
  };

  // "7:30am", "5pm", "12 noon", "12:30pm".
  function clock(d) {
    var h = d.getHours();
    var m = d.getMinutes();
    if (h === 12 && m === 0) {
      return "12 noon";
    }
    if (h === 0 && m === 0) {
      return "midnight";
    }
    return (h % 12 || 12) + (m ? ":" + pad(m) : "") + (h < 12 ? "am" : "pm");
  }

  function clockHM(hm) {
    return clock(at(new Date(2000, 0, 1), hm));
  }

  // "7:30am to 5pm"
  function spanText(span) {
    return clockHM(span[0]) + " to " + clockHM(span[1]);
  }

  // Money: 3.7 -> "£3.70".
  function money(n) {
    return "£" + n.toFixed(2);
  }

  /* ---------- Opening hours ---------- */

  // The exception (holiday hours or closure) that covers date d, if any.
  function exceptionOn(d) {
    var iso = isoDate(d);
    var md = iso.slice(5);
    var list = data.exceptions || [];
    for (var i = 0; i < list.length; i++) {
      var ex = list[i];
      var key = ex.from.length === 5 ? md : iso;
      if (key >= ex.from && key <= (ex.to || ex.from)) {
        return ex;
      }
    }
    return null;
  }

  // ["07:30", "17:00"] for date d, or null when the café is closed all day.
  function spanOn(d) {
    var ex = exceptionOn(d);
    return ex ? ex.hours : data.hours[d.getDay()] || null;
  }

  // { open: Date, close: Date, exception } for date d, or null when closed.
  function hoursOn(d) {
    var span = spanOn(d);
    if (!span) {
      return null;
    }
    return { open: at(d, span[0]), close: at(d, span[1]), exception: exceptionOn(d) };
  }

  // Why the café is closed all day on d ("Christmas break"), or "" when it is not.
  function closedReason(d) {
    var ex = exceptionOn(d);
    return ex && !ex.hours ? ex.label : "";
  }

  // The next opening after now, looking up to three weeks ahead.
  function nextOpening(now) {
    var today = startOfDay(now);
    for (var i = 0; i < 21; i++) {
      var h = hoursOn(addDays(today, i));
      if (h && h.open > now) {
        return h;
      }
    }
    return null;
  }

  // "today", "tomorrow", "Thursday" (this week) or "Tuesday 29 December". The date is given in full
  // when a holiday closure falls in between, so "Tuesday" after Christmas is not read as this Tuesday.
  function dayWords(d, now) {
    var n = daysBetween(now, d);
    if (n === 0) {
      return "today";
    }
    if (n === 1) {
      return "tomorrow";
    }
    for (var i = 1; i < n; i++) {
      if (closedReason(addDays(startOfDay(now), i))) {
        return fmt.long.format(d);
      }
    }
    return n < 7 ? fmt.weekday.format(d) : fmt.long.format(d);
  }

  /* The "open now" line: { open, head, detail }.
       Open now      | until 5pm
       Open now      | until 5pm, closing in 20 minutes
       Open now      | until 2pm (Christmas Eve hours)
       Closed now,   | opens today at 7:30am
       Closed now,   | opens tomorrow at 9am
       Closed today  | for the Christmas break. Opens Tuesday 29 December at 7:30am */
  function status(now) {
    now = now || new Date();
    var today = startOfDay(now);
    var h = hoursOn(today);
    if (h && now >= h.open && now < h.close) {
      var left = Math.ceil((h.close - now) / 60000);
      var detail = "until " + clock(h.close);
      if (h.exception) {
        detail += " (" + h.exception.label + " hours)";
      }
      if (left <= 30) {
        detail += ", closing in " + left + (left === 1 ? " minute" : " minutes");
      }
      return { open: true, head: "Open now", detail: detail };
    }
    var next = nextOpening(now);
    var ex = exceptionOn(today);
    var when = "";
    if (next) {
      var words = dayWords(next.open, now);
      when = words === "today" ? "opens today at " + clock(next.open) : "opens " + words + " at " + clock(next.open);
    }
    if (ex && !ex.hours) {
      var why = ex.why || "(" + ex.label + ")";
      return { open: false, head: "Closed today", detail: why + (when ? ". " + when.charAt(0).toUpperCase() + when.slice(1) : "") };
    }
    return { open: false, head: when ? "Closed now," : "Closed now", detail: when };
  }

  // Holiday hours coming up, as runs of days: [{ from, to, exception }], from today onwards.
  function upcomingExceptions(now, days) {
    now = now || new Date();
    days = days == null ? data.exceptionsAheadDays || 60 : days;
    var out = [];
    var today = startOfDay(now);
    for (var i = 0; i <= days; i++) {
      var d = addDays(today, i);
      var ex = exceptionOn(d);
      var last = out[out.length - 1];
      if (ex && last && last.exception === ex && daysBetween(last.to, d) === 1) {
        last.to = d;
      } else if (ex) {
        out.push({ from: d, to: d, exception: ex });
      }
    }
    return out;
  }

  // "Thursday 24 December" or "Friday 25 to Monday 28 December" or "Thu 31 Dec to Fri 1 Jan".
  function rangeText(from, to) {
    if (sameDay(from, to)) {
      return fmt.long.format(from);
    }
    if (from.getMonth() === to.getMonth()) {
      return fmt.weekday.format(from) + " " + from.getDate() + " to " + fmt.long.format(to);
    }
    return fmt.long.format(from) + " to " + fmt.long.format(to);
  }

  /* ---------- Specials board ---------- */

  function weekStart(d) {
    return addDays(startOfDay(d), -((d.getDay() + 6) % 7));
  }

  // Weeks since Monday 1 January 2024, so the bake and the sandwich move on every Monday.
  function weekNumber(d) {
    return Math.floor(daysBetween(new Date(2024, 0, 1), weekStart(d)) / 7);
  }

  function pick(list, n) {
    return list[((n % list.length) + list.length) % list.length];
  }

  // The board for the week holding date d.
  function specials(d) {
    d = d || new Date();
    var s = data.specials;
    var monday = weekStart(d);
    var days = [];
    for (var i = 0; i < 7; i++) {
      var day = addDays(monday, i);
      days.push({ date: day, soup: s.soups[day.getDay()], closed: closedReason(day) });
    }
    var w = weekNumber(d);
    return {
      monday: monday,
      sunday: addDays(monday, 6),
      days: days,
      bake: pick(s.bakes, w),
      sandwich: pick(s.sandwiches, w),
      coffee: pick(s.coffees, d.getFullYear() * 12 + d.getMonth())
    };
  }

  /* ---------- Events ---------- */

  function occursOn(ev, d) {
    if (d.getDay() !== ev.day) {
      return false;
    }
    if (ev.when === "week") {
      return true;
    }
    if (ev.nth === -1) {
      return addDays(d, 7).getMonth() !== d.getMonth();
    }
    return Math.ceil(d.getDate() / 7) === ev.nth;
  }

  function occurrence(ev, d) {
    return {
      id: ev.id,
      key: ev.id + "@" + isoDate(d),
      ev: ev,
      date: startOfDay(d),
      start: at(d, ev.start),
      end: at(d, ev.end)
    };
  }

  // Event dates that have not finished yet, soonest first. Days the café is closed are skipped.
  function upcomingEvents(now, days, onlyId) {
    now = now || new Date();
    days = days == null ? data.eventsAheadDays || 56 : days;
    var today = startOfDay(now);
    var out = [];
    for (var i = 0; i <= days; i++) {
      var d = addDays(today, i);
      if (closedReason(d)) {
        continue;
      }
      data.events.forEach(function (ev) {
        if ((!onlyId || ev.id === onlyId) && occursOn(ev, d)) {
          var o = occurrence(ev, d);
          if (o.end > now) {
            out.push(o);
          }
        }
      });
    }
    return out.sort(function (a, b) {
      return a.start - b.start;
    });
  }

  // A place can be saved until an hour before the start.
  function bookable(o, now) {
    return o.start - (now || new Date()) > 60 * 60000;
  }

  // "First Thursday of the month", "Every Saturday", "Last Friday of the month".
  function ruleText(ev) {
    var dayName = fmt.weekday.format(new Date(2024, 0, 7 + ev.day)); // 7 Jan 2024 was a Sunday
    if (ev.when === "week") {
      return "Every " + dayName;
    }
    var nth = { "-1": "Last", 1: "First", 2: "Second", 3: "Third", 4: "Fourth" }[ev.nth];
    return nth + " " + dayName + " of the month";
  }

  /* ---------- Order ahead ---------- */

  // Collection times for today (if any are left) and the next day the café is open:
  // [{ date, label, times: [Date] }].
  function collectionDays(now) {
    now = now || new Date();
    var rules = data.orderAhead;
    var step = rules.stepMinutes * 60000;
    var out = [];
    for (var i = 0; i < 14 && out.length < 2; i++) {
      var d = addDays(startOfDay(now), i);
      var h = hoursOn(d);
      if (!h) {
        continue;
      }
      var first = Math.max(h.open.getTime(), now.getTime()) + rules.leadMinutes * 60000;
      // Round up to the next whole step after midnight (10:07 -> 10:15 with 15-minute steps).
      var t = startOfDay(d).getTime() + Math.ceil((first - startOfDay(d).getTime()) / step) * step;
      var last = h.close.getTime() - rules.lastBeforeCloseMinutes * 60000;
      var times = [];
      for (; t <= last; t += step) {
        times.push(new Date(t));
      }
      if (times.length) {
        var words = dayWords(d, now);
        out.push({
          date: d,
          label: words === "today" ? "Today" : words === "tomorrow" ? "Tomorrow, " + fmt.long.format(d) : fmt.long.format(d),
          words: words,
          times: times
        });
      }
    }
    return out;
  }

  window.CobnutDays = {
    isoDate: isoDate,
    parseIso: parseIso,
    startOfDay: startOfDay,
    addDays: addDays,
    sameDay: sameDay,
    daysBetween: daysBetween,
    fmt: fmt,
    clock: clock,
    clockHM: clockHM,
    spanText: spanText,
    money: money,
    exceptionOn: exceptionOn,
    spanOn: spanOn,
    hoursOn: hoursOn,
    closedReason: closedReason,
    status: status,
    dayWords: dayWords,
    upcomingExceptions: upcomingExceptions,
    rangeText: rangeText,
    specials: specials,
    occursOn: occursOn,
    upcomingEvents: upcomingEvents,
    bookable: bookable,
    ruleText: ruleText,
    collectionDays: collectionDays
  };
})();
