/* Date helpers for the booking calendar and the checklist. Dates are the visitor's local dates, worked out
   from today, so the site never shows a date in the past as if it were the future. */
(function () {
  var D = window.HT;

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

  function daysBetween(a, b) {
    return Math.round((startOfDay(b) - startOfDay(a)) / 86400000);
  }

  var fmt = {
    short: new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }),
    long: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }),
    full: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    month: new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }),
    monthShort: new Intl.DateTimeFormat("en-GB", { month: "short" })
  };

  function closedReason(d) {
    return D.closed[isoDate(d)] || "";
  }

  function bankHoliday(d) {
    return D.bankHolidays[isoDate(d)] || "";
  }

  // The last few working days (Monday to Friday, not bank holidays) of the month: completion days.
  function isMonthEnd(d) {
    var dow = d.getDay();
    if (dow === 0 || dow === 6 || bankHoliday(d) || closedReason(d)) {
      return false;
    }
    var count = 0;
    for (var x = addDays(d, 1); x.getMonth() === d.getMonth(); x = addDays(x, 1)) {
      if (x.getDay() !== 0 && x.getDay() !== 6 && !bankHoliday(x) && !closedReason(x)) {
        count += 1;
      }
    }
    return count < D.monthEndBusyDays;
  }

  // How busy a day usually is, and what it costs: { level: "quiet" | "normal" | "popular" | "busy", why, mult }.
  function demand(d) {
    var dow = d.getDay();
    var bh = bankHoliday(d);
    if (bh) {
      return { level: "popular", why: bh, mult: D.bankHolidayMult, day: "bank" };
    }
    if (dow === 5) {
      return { level: "busy", why: isMonthEnd(d) ? "Friday and a month-end completion day" : "Fridays are our busiest day", mult: D.days[5].mult, day: "5" };
    }
    if (isMonthEnd(d)) {
      return { level: "busy", why: "Month-end completion day", mult: D.days[dow].mult, day: String(dow) };
    }
    if (dow === 6) {
      return { level: "popular", why: "Saturdays book up early", mult: D.days[6].mult, day: "6" };
    }
    if (dow === 0) {
      return { level: "normal", why: "Sunday rate", mult: D.days[0].mult, day: "0" };
    }
    if (dow >= 2 && dow <= 4) {
      return { level: "quiet", why: "Usually easy to get", mult: 1, day: String(dow) };
    }
    return { level: "normal", why: "", mult: 1, day: String(dow) };
  }

  window.HTDates = {
    isoDate: isoDate,
    parseIso: parseIso,
    startOfDay: startOfDay,
    addDays: addDays,
    sameDay: sameDay,
    daysBetween: daysBetween,
    fmt: fmt,
    closedReason: closedReason,
    bankHoliday: bankHoliday,
    isMonthEnd: isMonthEnd,
    demand: demand
  };
})();
