/* Opening hours: which opening ("session") is on now, when the next one starts, last orders, the times an
   order can be for, and the words for all of it. A session can run past midnight (5pm to 2am), so at
   1am on Saturday the kitchen is still in Friday's session. Times are the visitor's local time. */
(function () {
  var data = window.Kor;

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function isoDate(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function addDays(d, n) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  }

  function addMinutes(d, n) {
    return new Date(d.getTime() + n * 60000);
  }

  function minutesOf(hm) {
    var p = hm.split(":");
    return +p[0] * 60 + +p[1];
  }

  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var fmt = {
    short: new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }),
    long: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }),
    dayMonth: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" })
  };

  // The exception (special hours) for a date, if any. "MM-DD" repeats every year.
  function exceptionFor(d) {
    var iso = isoDate(d);
    var md = iso.slice(5);
    var list = data.exceptions || [];
    for (var i = 0; i < list.length; i++) {
      var ex = list[i];
      var full = ex.from.length === 10;
      var key = full ? iso : md;
      var to = ex.to || ex.from;
      if (key >= ex.from && key <= to) {
        return ex;
      }
    }
    return null;
  }

  function hoursFor(d) {
    var ex = exceptionFor(d);
    return ex ? ex.hours : data.hours[d.getDay()];
  }

  // The session that starts on day d, or null if the kitchen is shut that day.
  function sessionOn(d) {
    var day = startOfDay(d);
    var h = hoursFor(day);
    if (!h) {
      return null;
    }
    var open = minutesOf(h[0]);
    var close = minutesOf(h[1]);
    if (close <= open) {
      close += 1440;
    }
    var ex = exceptionFor(day);
    return {
      day: day,
      start: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, open),
      end: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, close),
      label: ex ? ex.label : ""
    };
  }

  function lastOrders(session, mode) {
    return addMinutes(session.end, -data.lastOrders[mode || "delivery"]);
  }

  // The session open at this moment, or null.
  function current(now) {
    now = now || new Date();
    var today = startOfDay(now);
    for (var i = -1; i <= 0; i++) {
      var s = sessionOn(addDays(today, i));
      if (s && now >= s.start && now < s.end) {
        return s;
      }
    }
    return null;
  }

  // The first session that starts after this moment.
  function next(now) {
    now = now || new Date();
    var today = startOfDay(now);
    for (var i = 0; i <= 21; i++) {
      var s = sessionOn(addDays(today, i));
      if (s && s.start > now) {
        return s;
      }
    }
    return null;
  }

  // "5pm", "5:30pm", "midnight", "12:30am", "noon".
  function time(d) {
    var h = d.getHours();
    var m = d.getMinutes();
    if (h === 0 && m === 0) {
      return "midnight";
    }
    if (h === 12 && m === 0) {
      return "noon";
    }
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (m ? ":" + pad(m) : "") + (h < 12 ? "am" : "pm");
  }

  // "today", "tomorrow", "on Thursday" (within a week) or "on Fri 25 Dec".
  function dayWords(d, now) {
    var today = startOfDay(now || new Date());
    var diff = Math.round((startOfDay(d) - today) / 86400000);
    if (diff === 0) {
      return "today";
    }
    if (diff === 1) {
      return "tomorrow";
    }
    if (diff > 1 && diff < 7) {
      return "on " + DAYS[d.getDay()];
    }
    return "on " + fmt.short.format(d);
  }

  // "Today", "Tomorrow", "Thursday" or "Fri 25 Dec", for a heading or a time list.
  function dayLabel(d, now) {
    var w = dayWords(d, now).replace(/^on /, "");
    return w.charAt(0).toUpperCase() + w.slice(1);
  }

  // True for a time after midnight in a session that started the evening before.
  function afterMidnight(d, session) {
    return !!session && startOfDay(d).getTime() !== session.day.getTime();
  }

  // An order time for a list: "Today at 9:30pm", "Tonight at 12:30am", "Friday night at 1am".
  function slotLabel(d, session, now) {
    if (afterMidnight(d, session)) {
      var w = dayWords(session.day, now);
      var night = w === "today" ? "Tonight" : w === "tomorrow" ? "Tomorrow night" : w.replace(/^on /, "") + " night";
      return night.charAt(0).toUpperCase() + night.slice(1) + " at " + time(d);
    }
    return dayLabel(d, now) + " at " + time(d);
  }

  // The same in full, for the order message: "Friday 13 November, 12:30am (after midnight)".
  function slotLong(d, session) {
    if (afterMidnight(d, session)) {
      return fmt.long.format(session.day) + ", " + time(d) + " (after midnight)";
    }
    return fmt.long.format(d) + ", " + time(d);
  }

  // Everything the site says about being open, for one moment.
  //   open: true while the kitchen is open; ordering: true while orders for now can still go in.
  function status(now, mode) {
    now = now || new Date();
    mode = mode || "delivery";
    var s = current(now);
    if (s) {
      var lo = lastOrders(s, mode);
      if (now < lo) {
        return {
          open: true, ordering: true, session: s, lastOrders: lo,
          headline: "Open now",
          detail: "until " + time(s.end) + ". Last " + mode + " orders " + time(lo) + "."
        };
      }
      var n1 = next(now);
      return {
        open: true, ordering: false, session: s, next: n1,
        headline: "Last orders have gone",
        detail: "for tonight. We open again " + dayWords(n1.start, now) + " at " + time(n1.start) + "."
      };
    }
    var n = next(now);
    if (!n) {
      return { open: false, ordering: false, headline: "Closed", detail: "Please call us for our hours." };
    }
    return {
      open: false, ordering: false, next: n,
      headline: "Closed now",
      detail: "Opens " + dayWords(n.start, now) + " at " + time(n.start) + (n.label ? " (" + n.label + " hours)" : "") + "."
    };
  }

  function ceilToStep(d, step) {
    var ms = step * 60000;
    return new Date(Math.ceil(d.getTime() / ms) * ms);
  }

  /* When an order can be for.
       { preorder: false, asap: "about 25 to 35 minutes", slots: [Date, ...] } while open, or
       { preorder: true, session: next opening, slots: [...] } while closed (or after last orders).
     ready = [min, max] minutes to cook and deliver (or to cook, for collection). */
  function orderTimes(now, mode, ready) {
    now = now || new Date();
    mode = mode || "delivery";
    var step = data.slotMinutes;
    var st = status(now, mode);
    var slots = [];
    var t;
    var lo;
    if (st.ordering) {
      lo = st.lastOrders;
      // Later times start after the slowest estimate, on the next quarter hour.
      t = ceilToStep(addMinutes(now, ready[1] + step), step);
      for (; t <= addMinutes(lo, ready[0]) && slots.length < 24; t = addMinutes(t, step)) {
        slots.push(t);
      }
      return { preorder: false, session: st.session, slots: slots };
    }
    var s = st.next;
    if (!s) {
      return { preorder: true, session: null, slots: [] };
    }
    lo = lastOrders(s, mode);
    t = addMinutes(s.start, data.preorderFirstMinutes);
    for (; t <= addMinutes(lo, ready[0]) && slots.length < 24; t = addMinutes(t, step)) {
      slots.push(t);
    }
    return { preorder: true, session: s, slots: slots };
  }

  // The weekly hours as rows for a table, Monday first: { day, hours: "5pm to 2am" or "Closed", dow }.
  function week() {
    return [1, 2, 3, 4, 5, 6, 0].map(function (dow) {
      var h = data.hours[dow];
      var text = "Closed";
      if (h) {
        // Any date will do: only the times are shown.
        text = time(new Date(2026, 0, 5, 0, minutesOf(h[0]))) + " to " + time(new Date(2026, 0, 5, 0, minutesOf(h[1])));
      }
      return { dow: dow, day: DAYS[dow], hours: text };
    });
  }

  // Special hours in the next exceptionsAheadDays days: [{ date, label, hours: "4pm to 10pm" or "Closed" }].
  function specialDays(now) {
    var today = startOfDay(now || new Date());
    var out = [];
    for (var i = 0; i < data.exceptionsAheadDays; i++) {
      var d = addDays(today, i);
      var ex = exceptionFor(d);
      if (ex) {
        var s = sessionOn(d);
        out.push({ date: d, label: ex.label, hours: s ? time(s.start) + " to " + time(s.end) : "Closed" });
      }
    }
    return out;
  }

  window.KorHours = {
    pad: pad,
    isoDate: isoDate,
    startOfDay: startOfDay,
    addDays: addDays,
    addMinutes: addMinutes,
    fmt: fmt,
    sessionOn: sessionOn,
    current: current,
    next: next,
    lastOrders: lastOrders,
    status: status,
    orderTimes: orderTimes,
    time: time,
    dayWords: dayWords,
    dayLabel: dayLabel,
    slotLabel: slotLabel,
    slotLong: slotLong,
    week: week,
    specialDays: specialDays
  };
})();
