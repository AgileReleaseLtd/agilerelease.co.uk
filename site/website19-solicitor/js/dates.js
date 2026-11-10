/* Dates relative to today: whether the office is open, when we will reply, and the next Saturday wills morning.
   Dates are the visitor's local dates. */
(function () {
  var data = window.QM;

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  // "2026-11-10" in local time.
  function isoDate(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function addDays(d, n) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  }

  function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function sameDay(a, b) {
    return isoDate(a) === isoDate(b);
  }

  var fmt = {
    long: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }),
    full: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    short: new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }),
    weekday: new Intl.DateTimeFormat("en-GB", { weekday: "long" }),
    monthYear: new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" })
  };

  function closedReason(d) {
    return data.closed[isoDate(d)] || "";
  }

  // The first Saturday of the month, when we see wills and LPA clients by appointment.
  function isClinicSaturday(d) {
    return d.getDay() === 6 && d.getDate() <= 7 && !closedReason(d);
  }

  // Opening hours for one date: ["09:00", "17:30"], or null when the office is shut.
  function hoursOn(d) {
    if (closedReason(d)) {
      return null;
    }
    if (isClinicSaturday(d)) {
      return [data.saturday.open, data.saturday.close];
    }
    return data.hours[d.getDay()] || null;
  }

  function isWorkingDay(d) {
    return !!data.hours[d.getDay()] && !closedReason(d);
  }

  function at(d, hm) {
    var p = hm.split(":");
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), +p[0], +p[1]);
  }

  // "9:00am", "5:30pm", "12:30pm".
  function time12(hm) {
    var p = hm.split(":");
    var h = +p[0];
    var suffix = h >= 12 ? "pm" : "am";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ":" + p[1] + suffix;
  }

  // "today", "tomorrow" or "on Monday 16 November".
  function relativeDay(d, now) {
    var today = startOfDay(now || new Date());
    if (sameDay(d, today)) {
      return "today";
    }
    if (sameDay(d, addDays(today, 1))) {
      return "tomorrow";
    }
    return "on " + fmt.long.format(d);
  }

  // Is the office open right now, and if not, when does it next open? Saturday mornings are for booked wills
  // appointments only, so "opens" always means the next weekday.
  function officeStatus(now) {
    now = now || new Date();
    var today = startOfDay(now);
    var h = hoursOn(today);
    if (h && now >= at(today, h[0]) && now < at(today, h[1])) {
      if (today.getDay() === 6) {
        return { open: true, until: time12(h[1]), saturday: true, text: "Open for booked appointments until " + time12(h[1]) };
      }
      return { open: true, until: time12(h[1]), text: "Open now, until " + time12(h[1]) };
    }
    for (var i = 0; i < 21; i++) {
      var d = addDays(today, i);
      var dh = isWorkingDay(d) ? data.hours[d.getDay()] : null;
      if (dh && (i > 0 || now < at(d, dh[0]))) {
        return {
          open: false,
          reason: closedReason(today),
          nextDay: d,
          nextTime: time12(dh[0]),
          text: "Closed now. Opens " + relativeDay(d, now) + " at " + time12(dh[0])
        };
      }
    }
    return { open: false, text: "Closed now" };
  }

  // We reply within data.replyDays working days, counting from the next working day if the office is shut.
  function replyBy(now) {
    now = now || new Date();
    var d = startOfDay(now);
    var left = data.replyDays;
    while (left > 0) {
      d = addDays(d, 1);
      if (isWorkingDay(d)) {
        left--;
      }
    }
    return d;
  }

  function nextClinic(now) {
    var today = startOfDay(now || new Date());
    for (var i = 0; i < 70; i++) {
      var d = addDays(today, i);
      if (isClinicSaturday(d)) {
        return d;
      }
    }
    return null;
  }

  // The next n days the office is closed for a holiday, from today.
  function upcomingClosures(n, now) {
    var today = startOfDay(now || new Date());
    var out = [];
    Object.keys(data.closed).sort().forEach(function (iso) {
      var p = iso.split("-");
      var d = new Date(+p[0], +p[1] - 1, +p[2]);
      if (d >= today && d.getDay() !== 0 && d.getDay() !== 6 && out.length < n) {
        out.push({ date: d, reason: data.closed[iso] });
      }
    });
    return out;
  }

  window.QMDates = {
    isoDate: isoDate,
    addDays: addDays,
    startOfDay: startOfDay,
    sameDay: sameDay,
    fmt: fmt,
    closedReason: closedReason,
    hoursOn: hoursOn,
    isWorkingDay: isWorkingDay,
    time12: time12,
    relativeDay: relativeDay,
    officeStatus: officeStatus,
    replyBy: replyBy,
    nextClinic: nextClinic,
    upcomingClosures: upcomingClosures
  };
})();
