/* Dates and opening hours, worked out from data.js in the visitor's own time zone, so the site never
   shows dates that have passed. */
(function () {
  var data = window.Earthpin;

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
    return isoDate(d) === s ? d : null;
  }

  function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function addDays(d, n) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  }

  var fmt = {
    short: new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }),
    long: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }),
    weekday: new Intl.DateTimeFormat("en-GB", { weekday: "long" }),
    weekdayShort: new Intl.DateTimeFormat("en-GB", { weekday: "short" }),
    dayMonth: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }),
    monthYear: new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" })
  };

  // The reason a day is closed ("Christmas break"), or "".
  function closedReason(d) {
    var iso = isoDate(d);
    for (var i = 0; i < data.closed.length; i++) {
      var r = data.closed[i];
      if (iso >= r[0] && iso <= r[1]) {
        return r[2];
      }
    }
    return "";
  }

  // [open, close] as minutes after midnight, or null when closed all day.
  function hoursOn(d) {
    if (closedReason(d)) {
      return null;
    }
    var h = data.hours[d.getDay()];
    if (!h) {
      return null;
    }
    return h.map(function (t) {
      var p = t.split(":");
      return +p[0] * 60 + +p[1];
    });
  }

  // "7:30am", "6pm", "1pm".
  function clock(mins) {
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    var suffix = h >= 12 ? "pm" : "am";
    var h12 = h % 12 || 12;
    return h12 + (m ? ":" + pad(m) : "") + suffix;
  }

  // "Today", "Tomorrow" or "Thursday".
  function dayWord(d, now) {
    var today = startOfDay(now);
    if (isoDate(d) === isoDate(today)) {
      return "today";
    }
    if (isoDate(d) === isoDate(addDays(today, 1))) {
      return "tomorrow";
    }
    return fmt.weekday.format(d) + " " + fmt.dayMonth.format(d);
  }

  // { open: true, text: "Open now until 6pm" } or { open: false, text: "Closed now. We open tomorrow at 7:30am" }.
  function status(now) {
    now = now || new Date();
    var mins = now.getHours() * 60 + now.getMinutes();
    var today = hoursOn(now);
    if (today && mins >= today[0] && mins < today[1]) {
      return { open: true, text: "Open now", detail: "until " + clock(today[1]) + ". We usually reply within the hour." };
    }
    if (today && mins < today[0]) {
      return { open: false, text: "Closed now", detail: "We open today at " + clock(today[0]) + ". Send a message and we'll reply then." };
    }
    for (var i = 1; i <= 14; i++) {
      var d = addDays(startOfDay(now), i);
      var h = hoursOn(d);
      if (h) {
        return { open: false, text: "Closed now", detail: "We open " + dayWord(d, now) + " at " + clock(h[0]) + ". Send a message and we'll reply then." };
      }
    }
    return { open: false, text: "Closed now", detail: "Send a message and we'll reply when we're back." };
  }

  // Working days from `from` on: Monday to Saturday, not closed. Saturdays are flagged (mornings only).
  function workingDays(from, count, skip) {
    var out = [];
    var d = startOfDay(from);
    var skipped = 0;
    for (var guard = 0; out.length < count && guard < 400; guard++) {
      d = addDays(d, 1);
      if (d.getDay() === 0 || closedReason(d)) {
        continue;
      }
      if (skipped < skip) {
        if (d.getDay() !== 6) {
          skipped++;
        }
        continue;
      }
      out.push({ date: d, iso: isoDate(d), saturday: d.getDay() === 6 });
    }
    return out;
  }

  window.EarthpinDates = {
    pad: pad,
    isoDate: isoDate,
    parseIso: parseIso,
    startOfDay: startOfDay,
    addDays: addDays,
    fmt: fmt,
    closedReason: closedReason,
    hoursOn: hoursOn,
    clock: clock,
    status: status,
    workingDays: workingDays
  };
})();
