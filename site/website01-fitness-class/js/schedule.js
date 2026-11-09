/* Turns the weekly timetable in data.js into real dated classes. Dates are the visitor's local dates. */
(function () {
  var data = window.Ironfern;

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

  var fmt = {
    short: new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }),
    long: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }),
    month: new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }),
    monthName: new Intl.DateTimeFormat("en-GB", { month: "long" }),
    monthShort: new Intl.DateTimeFormat("en-GB", { month: "short" }),
    dayMonth: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" }),
    weekday: new Intl.DateTimeFormat("en-GB", { weekday: "long" })
  };

  function closedReason(d) {
    return data.closed[isoDate(d)] || "";
  }

  // The first and last day that can be booked.
  function bookingWindow(now) {
    var first = startOfDay(now || new Date());
    return { first: first, last: addDays(first, data.bookingDays - 1) };
  }

  // Every class on one date, in time order. status: "open", "closed" (booking has shut) or "past".
  function classesOn(d, now) {
    now = now || new Date();
    if (closedReason(d)) {
      return [];
    }
    var rows = data.week[d.getDay()] || [];
    return rows.map(function (row) {
      var hm = row[0].split(":");
      var start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), +hm[0], +hm[1]);
      var cls = data.classes[row[1]];
      var end = new Date(start.getTime() + cls.minutes * 60000);
      var cutoff = new Date(start.getTime() - data.bookingCutoffMinutes * 60000);
      var status = now >= start ? "past" : now >= cutoff ? "closed" : "open";
      return {
        id: isoDate(d) + "T" + row[0] + "-" + row[1],
        date: d,
        time: row[0],
        end: pad(end.getHours()) + ":" + pad(end.getMinutes()),
        start: start,
        key: row[1],
        cls: cls,
        coach: data.coaches[row[2]],
        status: status
      };
    }).sort(function (a, b) {
      return a.start - b.start;
    });
  }

  // The next n classes that can still be booked.
  function nextClasses(n, now) {
    now = now || new Date();
    var win = bookingWindow(now);
    var out = [];
    for (var d = win.first; d <= win.last && out.length < n; d = addDays(d, 1)) {
      classesOn(d, now).forEach(function (slot) {
        if (slot.status === "open" && out.length < n) {
          out.push(slot);
        }
      });
    }
    return out;
  }

  // "Today", "Tomorrow" or "Tue 10 Nov".
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

  function classesPerWeek() {
    var n = 0;
    Object.keys(data.week).forEach(function (k) {
      n += data.week[k].length;
    });
    return n;
  }

  window.IronfernSchedule = {
    isoDate: isoDate,
    parseIso: parseIso,
    startOfDay: startOfDay,
    addDays: addDays,
    sameDay: sameDay,
    fmt: fmt,
    closedReason: closedReason,
    bookingWindow: bookingWindow,
    classesOn: classesOn,
    nextClasses: nextClasses,
    relativeDay: relativeDay,
    classesPerWeek: classesPerWeek
  };
})();
