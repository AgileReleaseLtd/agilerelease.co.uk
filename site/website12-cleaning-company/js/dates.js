/* Dates for the booking calendar and the office hours. Dates are the visitor's local dates, counted from
   today, so the calendar never looks out of date. */
(function () {
  var data = window.Tessel;

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
    long: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }),
    month: new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }),
    monthName: new Intl.DateTimeFormat("en-GB", { month: "long" }),
    monthShort: new Intl.DateTimeFormat("en-GB", { month: "short" }),
    dayMonth: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" }),
    weekday: new Intl.DateTimeFormat("en-GB", { weekday: "long" })
  };

  // The reason we're closed on a day ("Sunday", "Christmas break"), or "".
  function closedReason(d) {
    var iso = isoDate(d);
    for (var i = 0; i < data.closed.length; i++) {
      if (iso >= data.closed[i][0] && iso <= data.closed[i][1]) {
        return data.closed[i][2];
      }
    }
    if (data.closedWeekdays.indexOf(d.getDay()) !== -1) {
      return "we don't clean on " + fmt.weekday.format(d) + "s";
    }
    return "";
  }

  // The first and last day that can be booked.
  function bookingWindow(now) {
    var today = startOfDay(now || new Date());
    var first = addDays(today, data.leadDays);
    return { today: today, first: first, last: addDays(first, data.bookingDays - 1) };
  }

  // "09:30" -> "9:30am", "13:00" -> "1pm".
  function clock(hm) {
    var p = hm.split(":");
    var h = +p[0];
    var m = +p[1];
    var suffix = h >= 12 ? "pm" : "am";
    var h12 = h % 12 || 12;
    return h12 + (m ? ":" + pad(m) : "") + suffix;
  }

  // "8:30am to 9:30am" -> "8:30 to 9:30am" when both are in the morning.
  function clockRange(from, to) {
    var a = clock(from);
    var b = clock(to);
    if (a.slice(-2) === b.slice(-2)) {
      a = a.slice(0, -2);
    }
    return a + " to " + b;
  }

  // Is the office answering now? { open, today: [from, to] or null, next: text for when it opens next }.
  function officeStatus(now) {
    now = now || new Date();
    var day = now.getDay();
    var hours = closedReason(now) && data.closedWeekdays.indexOf(day) === -1 ? null : data.hours[day];
    var mins = now.getHours() * 60 + now.getMinutes();
    function toMin(hm) {
      var p = hm.split(":");
      return +p[0] * 60 + +p[1];
    }
    var open = !!hours && mins >= toMin(hours[0]) && mins < toMin(hours[1]);
    var next = "";
    if (!open) {
      for (var i = 0; i < 8; i++) {
        var d = addDays(startOfDay(now), i);
        var h = data.hours[d.getDay()];
        var holiday = closedReason(d) && data.closedWeekdays.indexOf(d.getDay()) === -1;
        if (!h || holiday || (i === 0 && mins >= toMin(h[0]))) {
          continue;
        }
        next = (i === 0 ? "today" : i === 1 ? "tomorrow" : fmt.weekday.format(d)) + " at " + clock(h[0]);
        break;
      }
    }
    return { open: open, closesAt: open ? clock(hours[1]) : "", next: next };
  }

  window.TesselDates = {
    pad: pad,
    isoDate: isoDate,
    parseIso: parseIso,
    startOfDay: startOfDay,
    addDays: addDays,
    sameDay: sameDay,
    fmt: fmt,
    closedReason: closedReason,
    bookingWindow: bookingWindow,
    clock: clock,
    clockRange: clockRange,
    officeStatus: officeStatus
  };
})();
