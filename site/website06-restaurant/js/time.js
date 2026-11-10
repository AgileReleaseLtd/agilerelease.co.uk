/* Dates and times for Jonjoli: London time, opening hours, "open now", and the times a table can be
   requested on a given day. Everything here works in London wall-clock time, whatever the visitor's own
   time zone, and every date is worked out from today, so the site never goes out of date. */
(function () {
  var data = window.Jonjoli;

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

  function addMonths(d, n) {
    return new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
  }

  function sameDay(a, b) {
    return isoDate(a) === isoDate(b);
  }

  // The time in London now, as a Date whose fields (getHours() and so on) read as London's clock.
  var londonParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  });
  function now() {
    var p = {};
    londonParts.formatToParts(new Date()).forEach(function (part) {
      p[part.type] = part.value;
    });
    return new Date(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute);
  }

  // "17:30" -> 1050 (minutes after midnight).
  function minutes(hm) {
    var parts = hm.split(":");
    return +parts[0] * 60 + +parts[1];
  }

  function at(d, hm) {
    var m = minutes(hm);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), Math.floor(m / 60), m % 60);
  }

  // "17:30" -> "5:30pm", "12:00" -> "12pm", "23:00" -> "11pm".
  function clock(hm) {
    var m = typeof hm === "number" ? hm : minutes(hm);
    var h = Math.floor(m / 60) % 24;
    var min = m % 60;
    var suffix = h < 12 ? "am" : "pm";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (min ? ":" + pad(min) : "") + suffix;
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

  var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Why the restaurant is shut on a date that would normally be open ("Christmas Day"), or "".
  function closedReason(d) {
    return data.closedDates[isoDate(d)] || data.closedEveryYear[isoDate(d).slice(5)] || "";
  }

  // Opening periods on a date, as [{ open: Date, close: Date }].
  function periodsOn(d) {
    if (closedReason(d)) {
      return [];
    }
    return (data.hours[d.getDay()] || []).map(function (p) {
      return { open: at(d, p[0]), close: at(d, p[1]), from: p[0], to: p[1] };
    });
  }

  // "today", "tomorrow", "on Wednesday" or, more than a week away, "on Wednesday 6 January".
  function whenWords(d, from) {
    var today = startOfDay(from);
    if (sameDay(d, today)) {
      return "today";
    }
    if (sameDay(d, addDays(today, 1))) {
      return "tomorrow";
    }
    if (d < addDays(today, 7)) {
      return "on " + fmt.weekday.format(d);
    }
    return "on " + fmt.long.format(d);
  }

  // Open now? { open, text, detail }.
  function status(t) {
    t = t || now();
    var today = startOfDay(t);
    var periods = periodsOn(today);
    for (var i = 0; i < periods.length; i++) {
      var p = periods[i];
      if (t >= p.open && t < p.close) {
        var lastOrders = new Date(p.close.getTime() - data.lastOrdersMinutes * 60000);
        return {
          open: true,
          text: "Open now until " + clock(p.to),
          detail: t < lastOrders ? "Kitchen takes last orders at " + clock(lastOrders.getHours() * 60 + lastOrders.getMinutes()) : "The kitchen has closed for this service"
        };
      }
    }
    // The next time the doors open, looking up to three weeks ahead.
    for (var n = 0; n < 21; n++) {
      var d = addDays(today, n);
      var list = periodsOn(d);
      for (var j = 0; j < list.length; j++) {
        if (list[j].open > t) {
          var reason = n === 0 ? closedReason(today) : "";
          return {
            open: false,
            text: "Closed now, opens " + whenWords(d, t) + " at " + clock(list[j].from),
            detail: reason ? "Closed today for " + reason : ""
          };
        }
      }
    }
    return { open: false, text: "Closed now", detail: "" };
  }

  // Monday first: [{ dow, name, periods: [["12:00", "15:00"]] }].
  function weekRows() {
    return [1, 2, 3, 4, 5, 6, 0].map(function (dow) {
      return { dow: dow, name: DAY_NAMES[dow], periods: data.hours[dow] || [] };
    });
  }

  function periodText(p) {
    return clock(p[0]) + " to " + clock(p[1]);
  }

  /* ---------- Booking ---------- */

  function bookingWindow(t) {
    var first = startOfDay(t || now());
    return { first: first, last: addDays(first, data.booking.days - 1) };
  }

  // Every time a table can be requested on a date, grouped by service:
  // [{ name: "Dinner", sittings: bool, slots: [{ time, label, note, start, ok }] }]. ok is false for a time
  // that is too soon (or past) to request online.
  function servicesOn(d, t) {
    t = t || now();
    if (closedReason(d)) {
      return [];
    }
    var notice = data.booking.noticeMinutes * 60000;
    return (data.booking.services[d.getDay()] || []).map(function (svc) {
      var times = [];
      if (svc.sittings) {
        svc.sittings.forEach(function (s) {
          times.push([s[0], s[1]]);
        });
      } else {
        for (var m = minutes(svc.first); m <= minutes(svc.last); m += svc.step) {
          times.push([pad(Math.floor(m / 60)) + ":" + pad(m % 60), ""]);
        }
      }
      return {
        name: svc.name,
        sittings: !!svc.sittings,
        slots: times.map(function (x) {
          var start = at(d, x[0]);
          return { time: x[0], label: clock(x[0]), note: x[1], start: start, ok: start.getTime() - t.getTime() >= notice };
        })
      };
    });
  }

  function openSlotCount(d, t) {
    var n = 0;
    servicesOn(d, t).forEach(function (svc) {
      svc.slots.forEach(function (s) {
        if (s.ok) {
          n++;
        }
      });
    });
    return n;
  }

  // Why a date cannot be booked ("Closed on Mondays"), or "" when it can.
  function whyNotBookable(d, t) {
    t = t || now();
    var win = bookingWindow(t);
    if (d < win.first) {
      return "In the past";
    }
    if (d > win.last) {
      return "Not open for booking yet";
    }
    var reason = closedReason(d);
    if (reason) {
      return "Closed for " + reason;
    }
    if (!(data.booking.services[d.getDay()] || []).length) {
      return "Closed on " + DAY_NAMES[d.getDay()] + "s";
    }
    if (!openSlotCount(d, t)) {
      return "Too late to book online today";
    }
    return "";
  }

  window.JonjoliTime = {
    pad: pad,
    isoDate: isoDate,
    parseIso: parseIso,
    startOfDay: startOfDay,
    addDays: addDays,
    addMonths: addMonths,
    sameDay: sameDay,
    now: now,
    minutes: minutes,
    clock: clock,
    fmt: fmt,
    dayNames: DAY_NAMES,
    closedReason: closedReason,
    periodsOn: periodsOn,
    status: status,
    weekRows: weekRows,
    periodText: periodText,
    whenWords: whenWords,
    bookingWindow: bookingWindow,
    servicesOn: servicesOn,
    openSlotCount: openSlotCount,
    whyNotBookable: whyNotBookable
  };
})();
