/* Dates, opening hours and appointment times, worked out from data.js. Dates are the visitor's local dates,
   so the site never looks out of date: "today" is always today. */
(function () {
  var data = window.Lunette;

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

  function addMonths(d, n) {
    var out = new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
    // 31 March + 1 month is 30 April, not 1 May.
    if (out.getDate() !== d.getDate()) {
      out = new Date(out.getFullYear(), out.getMonth(), 0);
    }
    return out;
  }

  function sameDay(a, b) {
    return isoDate(a) === isoDate(b);
  }

  var fmt = {
    long: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }),
    longYear: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }),
    short: new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }),
    month: new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }),
    monthName: new Intl.DateTimeFormat("en-GB", { month: "long" }),
    monthShort: new Intl.DateTimeFormat("en-GB", { month: "short" }),
    dayMonth: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" }),
    weekday: new Intl.DateTimeFormat("en-GB", { weekday: "long" })
  };

  // "10:30" -> 630 (minutes after midnight).
  function toMinutes(hm) {
    var p = hm.split(":");
    return +p[0] * 60 + +p[1];
  }

  // 630 -> "10:30am", 600 -> "10am", 1140 -> "7pm", 720 -> "12pm".
  function timeLabel(mins) {
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (m ? ":" + pad(m) : "") + (h < 12 ? "am" : "pm");
  }

  // 45 -> "45 min", 60 -> "1 hr", 95 -> "1 hr 35 min".
  function duration(mins) {
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    if (!h) {
      return m + " min";
    }
    return h + " hr" + (m ? " " + m + " min" : "");
  }

  function money(pounds) {
    return "£" + pounds;
  }

  function special(d) {
    return data.specialDays[isoDate(d)] || null;
  }

  // The opening hours on one date: { open: 600, close: 1140, label } or null when closed.
  function hoursOn(d) {
    var sp = special(d);
    var h = sp ? sp.hours : data.hours[d.getDay()];
    if (!h) {
      return null;
    }
    return { open: toMinutes(h[0]), close: toMinutes(h[1]), label: sp ? sp.label : "" };
  }

  function closedLabel(d) {
    var sp = special(d);
    return sp && !sp.hours ? sp.label : "";
  }

  // "Open now until 7pm", "Opens today at 10am", "Closed now. Opens Tuesday at 10am".
  function openStatus(now) {
    now = now || new Date();
    var today = startOfDay(now);
    var mins = now.getHours() * 60 + now.getMinutes();
    var h = hoursOn(today);
    if (h && mins >= h.open && mins < h.close) {
      return { open: true, text: "Open now until " + timeLabel(h.close) };
    }
    if (h && mins < h.open) {
      return { open: false, text: "Opens today at " + timeLabel(h.open) };
    }
    for (var i = 1; i <= 14; i++) {
      var d = addDays(today, i);
      var next = hoursOn(d);
      if (next) {
        var day = i === 1 ? "tomorrow" : fmt.weekday.format(d);
        return { open: false, text: "Closed now. Opens " + day + " at " + timeLabel(next.open) };
      }
    }
    return { open: false, text: "Closed now" };
  }

  // The first and last day that can be asked for.
  function bookingWindow(now) {
    var first = startOfDay(now || new Date());
    return { first: first, last: addDays(first, data.booking.days - 1) };
  }

  // Someone who has not had a patch test needs a day to come in for one, and then 48 hours. That day is
  // today while we are open, or else the next day we open (on a Sunday evening, the Tuesday).
  function patchTestEarliest(now) {
    now = now || new Date();
    var testDay = startOfDay(now);
    var mins = now.getHours() * 60 + now.getMinutes();
    for (var i = 0; i <= 14; i++) {
      var d = addDays(testDay, i);
      var h = hoursOn(d);
      // The test takes five minutes, so today counts until ten minutes before closing.
      if (h && (i > 0 || mins <= h.close - 10)) {
        testDay = d;
        break;
      }
    }
    return addDays(testDay, Math.ceil(data.booking.patchTestHours / 24) + 1);
  }

  // Start times on date d for an appointment of the given length, every booking.step minutes, finishing
  // by closing time. Today's times need booking.noticeMinutes of notice.
  function startTimes(d, length, now) {
    now = now || new Date();
    var h = hoursOn(d);
    if (!h) {
      return [];
    }
    length = Math.max(length || 0, data.booking.step);
    var earliest = 0;
    if (sameDay(d, now)) {
      earliest = now.getHours() * 60 + now.getMinutes() + data.booking.noticeMinutes;
    }
    var out = [];
    for (var t = h.open; t + length <= h.close; t += data.booking.step) {
      if (t >= earliest) {
        out.push({
          mins: t,
          label: timeLabel(t),
          period: t < 720 ? "Morning" : t < 1020 ? "Afternoon" : "Evening"
        });
      }
    }
    return out;
  }

  // The weekly hours as rows for a table: Monday first, with days that share hours kept apart so each
  // day is easy to find on a phone.
  function weekRows() {
    var names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return [1, 2, 3, 4, 5, 6, 0].map(function (dow, i) {
      var h = data.hours[dow];
      return {
        dow: dow,
        name: names[i],
        text: h ? timeLabel(toMinutes(h[0])) + " to " + timeLabel(toMinutes(h[1])) : "Closed"
      };
    });
  }

  // Special opening days still to come within the next n days.
  function upcomingSpecials(n, now) {
    var today = startOfDay(now || new Date());
    var last = addDays(today, n);
    return Object.keys(data.specialDays).sort().map(function (iso) {
      return { date: parseIso(iso), info: data.specialDays[iso] };
    }).filter(function (row) {
      return row.date && row.date >= today && row.date <= last;
    });
  }

  function treatment(id) {
    for (var i = 0; i < data.treatments.length; i++) {
      if (data.treatments[i].id === id) {
        return data.treatments[i];
      }
    }
    return null;
  }

  function category(id) {
    for (var i = 0; i < data.categories.length; i++) {
      if (data.categories[i].id === id) {
        return data.categories[i];
      }
    }
    return null;
  }

  // "£36" or "from £5".
  function priceLabel(t) {
    return (t.from ? "from " : "") + money(t.price);
  }

  window.LunetteHours = {
    pad: pad,
    isoDate: isoDate,
    parseIso: parseIso,
    startOfDay: startOfDay,
    addDays: addDays,
    addMonths: addMonths,
    sameDay: sameDay,
    fmt: fmt,
    toMinutes: toMinutes,
    timeLabel: timeLabel,
    duration: duration,
    money: money,
    hoursOn: hoursOn,
    closedLabel: closedLabel,
    openStatus: openStatus,
    bookingWindow: bookingWindow,
    patchTestEarliest: patchTestEarliest,
    startTimes: startTimes,
    weekRows: weekRows,
    upcomingSpecials: upcomingSpecials,
    treatment: treatment,
    category: category,
    priceLabel: priceLabel
  };
})();
