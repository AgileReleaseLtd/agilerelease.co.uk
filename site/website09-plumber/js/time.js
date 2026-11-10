/* Dates and times for every page: London's clock (the business is in London, wherever the visitor is),
   which call-out rate applies right now, and the days a boiler service can be booked. */
(function () {
  var data = window.Pinn;

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

  function addDays(d, n) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  }

  function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  // The time in London as a plain Date holding London's wall-clock fields. Falls back to the device clock.
  var londonParts = null;
  try {
    londonParts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    });
  } catch (e) {
    londonParts = null;
  }

  function londonNow() {
    var now = new Date();
    if (!londonParts) {
      return now;
    }
    var p = {};
    londonParts.formatToParts(now).forEach(function (part) {
      p[part.type] = part.value;
    });
    return new Date(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute);
  }

  var fmt = {
    long: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }),
    short: new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }),
    dayMonth: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" }),
    dayShort: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }),
    weekdayShort: new Intl.DateTimeFormat("en-GB", { weekday: "short" }),
    monthYear: new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }),
    monthName: new Intl.DateTimeFormat("en-GB", { month: "long" })
  };

  // "9:40pm", "8am"
  function clock(d) {
    var h = d.getHours();
    var m = d.getMinutes();
    var suffix = h < 12 ? "am" : "pm";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (m ? ":" + pad(m) : "") + suffix;
  }

  function bankHoliday(d) {
    return data.bankHolidays[isoDate(d)] || "";
  }

  // The call-out band for a moment in London time: night (10pm to 8am, Sundays, bank holidays),
  // evening (weekdays 6pm to 10pm, Saturdays 8am to 10pm) or day (weekdays 8am to 6pm).
  function rateAt(d) {
    var id;
    var h = d.getHours();
    var dow = d.getDay();
    if (bankHoliday(d) || dow === 0 || h < 8 || h >= 22) {
      id = "night";
    } else if (dow === 6 || h >= 18) {
      id = "evening";
    } else {
      id = "day";
    }
    return data.rates.filter(function (r) {
      return r.id === id;
    })[0];
  }

  // Is the office open (messages answered, bookings made) at this London time?
  function officeOpen(d) {
    var hours = data.office[d.getDay()];
    if (!hours || bankHoliday(d)) {
      return false;
    }
    var hm = pad(d.getHours()) + ":" + pad(d.getMinutes());
    return hm >= hours[0] && hm < hours[1];
  }

  // Why a day cannot be booked for routine work ("" if it can).
  function noBookingReason(d) {
    var b = data.booking;
    return bankHoliday(d) || b.closed[isoDate(d)] || ((b.days[d.getDay()] || []).length ? "" : "No booked work");
  }

  // Every day in the booking window, Monday to Saturday, with the slots that can be picked.
  function bookingDays(now) {
    var today = startOfDay(now || londonNow());
    var first = addDays(today, data.booking.minDaysAhead);
    var last = addDays(today, data.booking.maxDaysAhead);
    var out = [];
    for (var d = first; d <= last; d = addDays(d, 1)) {
      if (d.getDay() === 0) {
        continue;
      }
      var reason = noBookingReason(d);
      out.push({
        date: d,
        iso: isoDate(d),
        reason: reason,
        slots: reason ? [] : data.booking.days[d.getDay()].slice()
      });
    }
    return out;
  }

  // The Monday of the week d is in.
  function mondayOf(d) {
    return addDays(startOfDay(d), -((d.getDay() + 6) % 7));
  }

  // Whole months between a month/year and now (0 if in the future).
  function monthsSince(year, monthIndex, now) {
    now = now || londonNow();
    return Math.max(0, (now.getFullYear() - year) * 12 + (now.getMonth() - monthIndex));
  }

  function money(n) {
    return "£" + n.toLocaleString("en-GB");
  }

  window.PinnTime = {
    pad: pad,
    isoDate: isoDate,
    parseIso: parseIso,
    addDays: addDays,
    startOfDay: startOfDay,
    londonNow: londonNow,
    fmt: fmt,
    clock: clock,
    bankHoliday: bankHoliday,
    rateAt: rateAt,
    officeOpen: officeOpen,
    bookingDays: bookingDays,
    mondayOf: mondayOf,
    monthsSince: monthsSince,
    money: money
  };
})();
