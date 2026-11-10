/* Shared helpers: London time, dates, opening hours, "open now", prices, and the times each practitioner
   can be booked. Nothing here touches the page. */
(function () {
  "use strict";
  var D = window.Spindle;

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  // "2026-11-10" for a Date, using its own (wall-clock) fields.
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

  // The clinic's wall-clock time in London, as a Date whose fields read as London time. All dates on the
  // site use these fields, so a visitor abroad still sees the clinic's real opening hours and times.
  var londonParts = null;
  try {
    londonParts = new Intl.DateTimeFormat("en-GB", {
      timeZone: D.timeZone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
    });
  } catch (e) {
    londonParts = null;
  }

  function now() {
    var real = new Date();
    if (!londonParts) {
      return real;
    }
    var p = {};
    londonParts.formatToParts(real).forEach(function (part) {
      p[part.type] = part.value;
    });
    return new Date(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
  }

  var fmt = {
    weekday: new Intl.DateTimeFormat("en-GB", { weekday: "long" }),
    weekdayShort: new Intl.DateTimeFormat("en-GB", { weekday: "short" }),
    short: new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }),
    long: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }),
    dayMonth: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" }),
    dayMonthShort: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }),
    monthName: new Intl.DateTimeFormat("en-GB", { month: "long" })
  };

  // "07:30" -> 450 (minutes after midnight)
  function toMinutes(hhmm) {
    var p = hhmm.split(":");
    return +p[0] * 60 + +p[1];
  }

  function fromMinutes(m) {
    return pad(Math.floor(m / 60)) + ":" + pad(m % 60);
  }

  // "07:30" -> "7:30am", "20:00" -> "8pm", "12:00" -> "12pm"
  function clock(hhmm) {
    var m = toMinutes(hhmm);
    var h = Math.floor(m / 60);
    var min = m % 60;
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (min ? ":" + pad(min) : "") + (h < 12 ? "am" : "pm");
  }

  function money(n) {
    return "£" + (n % 1 ? n.toFixed(2) : String(n));
  }

  function closedReason(d) {
    return D.closed[isoDate(d)] || "";
  }

  function specialDay(d) {
    return D.special[isoDate(d)] || null;
  }

  // The clinic's opening hours on a date, as [[startMinutes, endMinutes], ...]. [] = closed.
  function clinicHours(d) {
    if (closedReason(d)) {
      return [];
    }
    var sp = specialDay(d);
    var rows = sp ? sp.hours : D.hours[d.getDay()] || [];
    return rows.map(function (r) {
      return [toMinutes(r[0]), toMinutes(r[1])];
    });
  }

  // Open now, or when it next opens. Returns { open, text, detail }.
  function openStatus(at) {
    at = at || now();
    var mins = at.getHours() * 60 + at.getMinutes();
    var today = clinicHours(at);
    for (var i = 0; i < today.length; i++) {
      if (mins >= today[i][0] && mins < today[i][1]) {
        var shortDay = specialDay(at);
        return {
          open: true,
          text: "Open now",
          detail: "until " + clock(fromMinutes(today[i][1])) + (shortDay ? " (" + shortDay.name + ")" : "")
        };
      }
    }
    // Next opening: later today, or on one of the next 14 days.
    for (var n = 0; n < 15; n++) {
      var d = addDays(startOfDay(at), n);
      var rows = clinicHours(d);
      for (var j = 0; j < rows.length; j++) {
        if (n > 0 || rows[j][0] > mins) {
          var when = n === 0 ? "today" : n === 1 ? "tomorrow" : fmt.weekday.format(d);
          if (n >= 7) {
            when = fmt.short.format(d);
          }
          var why = closedReason(at);
          return {
            open: false,
            text: why ? "Closed today (" + why + ")" : "Closed now",
            detail: "opens " + when + " at " + clock(fromMinutes(rows[j][0]))
          };
        }
      }
    }
    return { open: false, text: "Closed now", detail: "" };
  }

  /* ---------- Booking ---------- */

  // The people who do an appointment type, in the order listed in data.js.
  function practitionersFor(typeId) {
    return Object.keys(D.practitioners).filter(function (id) {
      return D.practitioners[id].types.indexOf(typeId) !== -1;
    });
  }

  // The first and last day that can be asked for.
  function bookingWindow(at) {
    var first = startOfDay(at || now());
    return { first: first, last: addDays(first, D.bookingDays - 1) };
  }

  // Start times (minutes after midnight) when one practitioner could see someone for `minutes` on date d:
  // inside their working blocks and inside the clinic's hours that day.
  function practitionerStarts(pid, d, minutes) {
    var clinic = clinicHours(d);
    var blocks = (D.practitioners[pid].week[d.getDay()] || []).map(function (b) {
      return [toMinutes(b[0]), toMinutes(b[1])];
    });
    var out = [];
    blocks.forEach(function (b) {
      clinic.forEach(function (c) {
        var start = Math.max(b[0], c[0]);
        var end = Math.min(b[1], c[1]);
        for (var t = start; t + minutes <= end; t += D.slotStepMinutes) {
          out.push(t);
        }
      });
    });
    return out;
  }

  // Bookable times on date d for a type, with one practitioner or "any".
  // Returns [{ time: "09:00", minutes: 540, who: ["grace", "tomasz"] }, ...] in time order.
  function slotsOn(d, typeId, pid, at) {
    at = at || now();
    var type = D.types[typeId];
    if (!type) {
      return [];
    }
    var win = bookingWindow(at);
    if (d < win.first || d > win.last) {
      return [];
    }
    var earliest = new Date(at.getTime() + D.minNoticeHours * 3600000);
    var people = pid && pid !== "any" ? [pid] : practitionersFor(typeId);
    var byTime = {};
    people.forEach(function (id) {
      if (D.practitioners[id].types.indexOf(typeId) === -1) {
        return;
      }
      practitionerStarts(id, d, type.minutes).forEach(function (t) {
        var start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), Math.floor(t / 60), t % 60);
        if (start < earliest) {
          return;
        }
        (byTime[t] = byTime[t] || []).push(id);
      });
    });
    return Object.keys(byTime).map(Number).sort(function (a, b) {
      return a - b;
    }).map(function (t) {
      return { time: fromMinutes(t), minutes: t, who: byTime[t] };
    });
  }

  // "Mon", "Tue (to 8pm)" ... for a practitioner's working week, Monday first.
  function workingDays(pid) {
    var week = D.practitioners[pid].week;
    return [1, 2, 3, 4, 5, 6, 0].filter(function (dow) {
      return week[dow] && week[dow].length;
    }).map(function (dow) {
      var blocks = week[dow];
      var start = blocks[0][0];
      var end = blocks[blocks.length - 1][1];
      return {
        dow: dow,
        day: fmt.weekdayShort.format(new Date(2026, 10, 1 + dow)), // 1 November 2026 was a Sunday
        dayLong: fmt.weekday.format(new Date(2026, 10, 1 + dow)),
        from: clock(start),
        to: clock(end),
        late: toMinutes(end) >= 19 * 60,
        early: toMinutes(start) <= 8 * 60
      };
    });
  }

  function packagePrices(pkg) {
    var single = D.types[pkg.type].price;
    return {
      each: pkg.price / pkg.count,
      saving: single * pkg.count - pkg.price,
      single: single
    };
  }

  window.SpindleCore = {
    pad: pad,
    isoDate: isoDate,
    parseIso: parseIso,
    startOfDay: startOfDay,
    addDays: addDays,
    sameDay: sameDay,
    now: now,
    fmt: fmt,
    toMinutes: toMinutes,
    fromMinutes: fromMinutes,
    clock: clock,
    money: money,
    closedReason: closedReason,
    specialDay: specialDay,
    clinicHours: clinicHours,
    openStatus: openStatus,
    practitionersFor: practitionersFor,
    bookingWindow: bookingWindow,
    slotsOn: slotsOn,
    workingDays: workingDays,
    packagePrices: packagePrices
  };
})();
