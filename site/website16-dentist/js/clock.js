/* Opening hours, the emergency line and today's emergency slots, worked out from data.js in London time.
   Add ?now=2026-12-24T17:45 (or just ?now=2026-12-24) to any page to see it as at another moment. */
(function () {
  var data = window.Harebell;

  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var ORDER = [1, 2, 3, 4, 5, 6, 0];

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function isoDate(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function addDays(d, n) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  }

  function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  // The time now as a London wall clock. The Date it returns is built from London's date and time, so the
  // rest of this file can use plain getHours() and getDay() wherever the visitor is.
  function now() {
    var param = new URLSearchParams(window.location.search).get("now");
    var m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(param || "");
    if (m) {
      var given = new Date(+m[1], +m[2] - 1, +m[3], m[4] ? +m[4] : 10, m[5] ? +m[5] : 0);
      if (isoDate(given) === m[1] + "-" + m[2] + "-" + m[3]) {
        return given;
      }
    }
    try {
      var parts = {};
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hourCycle: "h23"
      }).formatToParts(new Date()).forEach(function (p) {
        parts[p.type] = p.value;
      });
      return new Date(+parts.year, +parts.month - 1, +parts.day, +parts.hour % 24, +parts.minute);
    } catch (e) {
      return new Date();
    }
  }

  function toMinutes(hhmm) {
    var p = hhmm.split(":");
    return +p[0] * 60 + +p[1];
  }

  // "08:30" -> "8:30am", "18:00" -> "6pm", "12:00" -> "12 noon".
  function formatTime(hhmm) {
    var p = hhmm.split(":");
    var h = +p[0];
    var min = p[1];
    if (h === 12 && min === "00") {
      return "12 noon";
    }
    var suffix = h < 12 ? "am" : "pm";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (min === "00" ? "" : ":" + min) + suffix;
  }

  var fmt = {
    long: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }),
    dayMonth: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" })
  };

  function closedReason(d) {
    return data.closed[isoDate(d)] || "";
  }

  // [open, close] for a table (data.hours or data.emergencyLine) on a date, or null when shut.
  function hoursOn(table, d) {
    if (closedReason(d)) {
      return null;
    }
    return table[d.getDay()] || null;
  }

  // "today", "tomorrow", "on Friday" (within a week) or "on Monday 28 December".
  function whenWords(d, at) {
    var today = startOfDay(at);
    var diff = Math.round((startOfDay(d) - today) / 86400000);
    if (diff === 0) {
      return "today";
    }
    if (diff === 1) {
      return "tomorrow";
    }
    if (diff < 7) {
      return "on " + DAYS[d.getDay()];
    }
    return "on " + fmt.long.format(d);
  }

  /* Whether a table is open at a moment, and what happens next:
     { open, closes: "18:00", closingSoon, opens: { date, time } , closedToday: reason } */
  function status(table, at) {
    at = at || now();
    var mins = at.getHours() * 60 + at.getMinutes();
    var today = startOfDay(at);
    var h = hoursOn(table, today);
    if (h && mins >= toMinutes(h[0]) && mins < toMinutes(h[1])) {
      var left = toMinutes(h[1]) - mins;
      return { open: true, closes: h[1], minutesLeft: left, closingSoon: left <= 30 };
    }
    var result = { open: false, closedToday: closedReason(today) };
    if (h && mins < toMinutes(h[0])) {
      result.opens = { date: today, time: h[0] };
      return result;
    }
    for (var i = 1; i <= 14; i++) {
      var d = addDays(today, i);
      var next = hoursOn(table, d);
      if (next) {
        result.opens = { date: d, time: next[0] };
        return result;
      }
    }
    return result;
  }

  // One line for people: "Open now until 6pm", "Closing soon: open until 6pm", "Closed now. Opens tomorrow at 8:30am".
  function describe(table, at, nouns) {
    at = at || now();
    nouns = nouns || { open: "Open now", closed: "Closed now" };
    var s = status(table, at);
    if (s.open) {
      return {
        open: true,
        soon: s.closingSoon,
        headline: s.closingSoon ? "Closing soon" : nouns.open,
        detail: (s.closingSoon ? "Open until " : "until ") + formatTime(s.closes)
      };
    }
    var detail = "";
    if (s.opens) {
      detail = "Opens " + whenWords(s.opens.date, at) + " at " + formatTime(s.opens.time);
    }
    return {
      open: false,
      headline: s.closedToday ? "Closed today (" + s.closedToday + ")" : nouns.closed,
      detail: detail
    };
  }

  // Today's held-back emergency slots, each marked "past" once its time has gone.
  function slotsToday(at) {
    at = at || now();
    var mins = at.getHours() * 60 + at.getMinutes();
    if (closedReason(at)) {
      return [];
    }
    return (data.emergencySlots[at.getDay()] || []).map(function (t) {
      return { time: t, label: formatTime(t), past: toMinutes(t) <= mins };
    });
  }

  // The next closed day within `days` days (for a notice), or null.
  function nextClosure(at, days) {
    at = at || now();
    for (var i = 0; i <= days; i++) {
      var d = addDays(startOfDay(at), i);
      var reason = closedReason(d);
      if (reason) {
        return { date: d, reason: reason, when: whenWords(d, at) };
      }
    }
    return null;
  }

  // Rows for an hours table, Monday first: { day, dow, text, today }.
  function weekRows(table, at) {
    at = at || now();
    return ORDER.map(function (dow) {
      var h = table[dow];
      return {
        day: DAYS[dow],
        dow: dow,
        text: h ? formatTime(h[0]) + " to " + formatTime(h[1]) : "Closed",
        today: dow === at.getDay()
      };
    });
  }

  // Age in whole years on a date.
  function ageOn(birth, at) {
    var age = at.getFullYear() - birth.getFullYear();
    if (at.getMonth() < birth.getMonth() || (at.getMonth() === birth.getMonth() && at.getDate() < birth.getDate())) {
      age -= 1;
    }
    return age;
  }

  window.HarebellClock = {
    DAYS: DAYS,
    now: now,
    isoDate: isoDate,
    addDays: addDays,
    startOfDay: startOfDay,
    formatTime: formatTime,
    fmt: fmt,
    closedReason: closedReason,
    hoursOn: hoursOn,
    status: status,
    describe: describe,
    whenWords: whenWords,
    slotsToday: slotsToday,
    nextClosure: nextClosure,
    weekRows: weekRows,
    ageOn: ageOn
  };
})();
