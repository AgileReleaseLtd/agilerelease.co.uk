/* Dates and times for every page: London time, opening hours (with holiday changes), the open-now line,
   bake times and cake collection days. Dates are London dates, whatever the visitor's own time zone. */
(function () {
  var data = window.Crumb;

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  // "2026-11-10" for a Date, from its own (local) fields.
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

  function sameDay(a, b) {
    return isoDate(a) === isoDate(b);
  }

  function daysBetween(a, b) {
    return Math.round((startOfDay(b) - startOfDay(a)) / 86400000);
  }

  // The time in London now, as a Date whose fields (year ... minute) read as London wall-clock time.
  var londonParts = null;
  try {
    londonParts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London", year: "numeric", month: "numeric", day: "numeric",
      hour: "numeric", minute: "numeric", hourCycle: "h23"
    });
  } catch (e) {
    londonParts = null;
  }

  function now() {
    var real = new Date();
    if (!londonParts || !londonParts.formatToParts) {
      return real;
    }
    var p = {};
    londonParts.formatToParts(real).forEach(function (part) {
      p[part.type] = +part.value;
    });
    return new Date(p.year, p.month - 1, p.day, p.hour % 24, p.minute);
  }

  function today() {
    return startOfDay(now());
  }

  // "07:30" -> 450
  function minutes(hm) {
    var parts = hm.split(":");
    return +parts[0] * 60 + +parts[1];
  }

  function minutesOf(d) {
    return d.getHours() * 60 + d.getMinutes();
  }

  // "07:30" -> "7:30am", "08:00" -> "8am", "12:00" -> "noon", "14:00" -> "2pm"
  function timeLabel(hm) {
    var h = +hm.split(":")[0];
    var m = hm.split(":")[1];
    if (h === 12 && m === "00") {
      return "noon";
    }
    var suffix = h < 12 ? "am" : "pm";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (m === "00" ? "" : ":" + m) + suffix;
  }

  // "10am to noon"
  function rangeLabel(pair) {
    return timeLabel(pair[0]) + " to " + timeLabel(pair[1]);
  }

  var fmt = {
    weekday: new Intl.DateTimeFormat("en-GB", { weekday: "long" }),
    weekdayShort: new Intl.DateTimeFormat("en-GB", { weekday: "short" }),
    long: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }),
    short: new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }),
    dayMonth: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" }),
    dayShort: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }),
    month: new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" })
  };

  // The holiday change (if any) for a date: { hours, label, why } or null.
  function exceptionFor(d) {
    var iso = isoDate(d);
    var md = iso.slice(5);
    var list = data.exceptions || [];
    for (var i = 0; i < list.length; i++) {
      var ex = list[i];
      var yearly = ex.from.length === 5;
      var key = yearly ? md : iso;
      var to = ex.to || ex.from;
      if (key >= ex.from && key <= to) {
        return ex;
      }
    }
    return null;
  }

  // Opening hours on a date: ["07:30", "17:00"] or null when closed.
  function hoursOn(d) {
    var ex = exceptionFor(d);
    if (ex) {
      return ex.hours;
    }
    return data.hours[d.getDay()] || null;
  }

  // Why the shop is closed on a date ("for the Christmas break"), or "" when it is open.
  function closedWhy(d) {
    if (hoursOn(d)) {
      return "";
    }
    var ex = exceptionFor(d);
    if (ex) {
      return ex.why || "for " + ex.label;
    }
    return "on " + fmt.weekday.format(d) + "s " + data.closedDayWhy;
  }

  // "today", "tomorrow", "on Saturday" or "on Tue 29 Dec" (more than six days away).
  function whenWords(d, from) {
    var n = daysBetween(from, d);
    if (n === 0) {
      return "today";
    }
    if (n === 1) {
      return "tomorrow";
    }
    if (n < 7) {
      return "on " + fmt.weekday.format(d);
    }
    return "on " + fmt.short.format(d);
  }

  // The next time the shop opens after the moment t: { date, time }.
  function nextOpening(t) {
    var day = startOfDay(t);
    for (var i = 0; i < 30; i++) {
      var d = addDays(day, i);
      var h = hoursOn(d);
      if (h && (i > 0 || minutesOf(t) < minutes(h[0]))) {
        return { date: d, time: h[0] };
      }
    }
    return null;
  }

  /* The open-now line.
     { open: true,  text: "Open now", detail: "until 5pm", soon: false }
     { open: false, text: "Closed now", detail: "opens tomorrow at 7:30am" } */
  function status(t) {
    t = t || now();
    var h = hoursOn(t);
    var m = minutesOf(t);
    if (h && m >= minutes(h[0]) && m < minutes(h[1])) {
      var left = minutes(h[1]) - m;
      return {
        open: true,
        soon: left <= 30,
        text: "Open now",
        detail: left <= 30 ? "closing at " + timeLabel(h[1]) : "until " + timeLabel(h[1])
      };
    }
    var next = nextOpening(t);
    var detail = next ? "opens " + whenWords(next.date, t) + " at " + timeLabel(next.time) : "";
    var text = "Closed now";
    var ex = exceptionFor(t);
    if (!h && ex) {
      text = "Closed today " + (ex.why || "for " + ex.label);
    }
    return { open: false, soon: false, text: text, detail: detail };
  }

  // The bakes on a date, in time order: [{ time, name, note }]. None on a closed day.
  function bakesOn(d) {
    var h = hoursOn(d);
    if (!h) {
      return [];
    }
    var dow = d.getDay();
    return data.bakes.filter(function (b) {
      return (!b.days || b.days.indexOf(dow) !== -1) && minutes(b.time) < minutes(h[1]);
    }).sort(function (a, b) {
      return minutes(a.time) - minutes(b.time);
    });
  }

  // Which day's bakes to show: today while the shop is open or about to open, otherwise the next
  // opening day. { date, live } where live means today (so some bakes may already be out).
  function bakeDay(t) {
    t = t || now();
    var h = hoursOn(t);
    if (h && minutesOf(t) < minutes(h[1])) {
      return { date: startOfDay(t), live: true };
    }
    var next = nextOpening(t);
    return { date: next ? next.date : startOfDay(t), live: false };
  }

  // Cake collection slots on a date (only those that end by closing time).
  function slotsOn(d) {
    var h = hoursOn(d);
    if (!h) {
      return [];
    }
    return (data.collectionSlots[d.getDay()] || []).filter(function (s) {
      return minutes(s[1]) <= minutes(h[1]) && minutes(s[0]) >= minutes(h[0]);
    });
  }

  // The first day a cake needing `lead` days' notice could be collected, counting from today.
  function earliestCollection(lead, from) {
    from = from || today();
    var d = addDays(from, lead);
    for (var i = 0; i < 60; i++, d = addDays(d, 1)) {
      if (collectionProblem(d, lead, from) === "") {
        return d;
      }
    }
    return addDays(from, lead);
  }

  /* Why a cake needing `lead` days' notice can't be collected on d, or "" when it can.
     Short reasons for the calendar's labels. */
  function collectionProblem(d, lead, from) {
    from = from || today();
    var n = daysBetween(from, d);
    if (n < 0) {
      return "in the past";
    }
    if (n < lead) {
      return "too soon, we need " + lead + " days' notice";
    }
    if (n > data.cake.maxDaysAhead) {
      return "too far ahead to book yet";
    }
    if (!hoursOn(d)) {
      return "the shop is closed " + closedWhy(d);
    }
    if ((data.fullyBooked || []).indexOf(isoDate(d)) !== -1) {
      return "the cake diary is full";
    }
    if (!slotsOn(d).length) {
      return "no collection slots";
    }
    return "";
  }

  // Holiday changes coming up in the next `days` days: [{ from: Date, to: Date, ex }].
  function upcomingExceptions(days, from) {
    from = from || today();
    var out = [];
    var current = null;
    for (var i = 0; i < days; i++) {
      var d = addDays(from, i);
      var ex = exceptionFor(d);
      if (ex && current && current.ex === ex && sameDay(addDays(current.to, 1), d)) {
        current.to = d;
      } else if (ex) {
        current = { from: d, to: d, ex: ex };
        out.push(current);
      } else {
        current = null;
      }
    }
    return out;
  }

  window.CrumbTime = {
    pad: pad,
    isoDate: isoDate,
    parseIso: parseIso,
    addDays: addDays,
    startOfDay: startOfDay,
    sameDay: sameDay,
    daysBetween: daysBetween,
    now: now,
    today: today,
    minutes: minutes,
    minutesOf: minutesOf,
    timeLabel: timeLabel,
    rangeLabel: rangeLabel,
    fmt: fmt,
    exceptionFor: exceptionFor,
    hoursOn: hoursOn,
    closedWhy: closedWhy,
    whenWords: whenWords,
    nextOpening: nextOpening,
    status: status,
    bakesOn: bakesOn,
    bakeDay: bakeDay,
    slotsOn: slotsOn,
    earliestCollection: earliestCollection,
    collectionProblem: collectionProblem,
    upcomingExceptions: upcomingExceptions
  };
})();
