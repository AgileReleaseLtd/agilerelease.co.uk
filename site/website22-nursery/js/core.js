/* Shared helpers for every page: dates (the visitor's local dates), money, opening hours, closures, the
   child's age, and the week planner (Monday to Friday, none / morning / afternoon / full day) used by the fee
   calculator and the waiting-list form. Reads window.ButtonTin from data.js. */
(function () {
  var data = window.ButtonTin;

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

  function minutes(hhmm) {
    var p = hhmm.split(":");
    return +p[0] * 60 + +p[1];
  }

  var fmt = {
    long: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }),
    longYear: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    dayMonthYear: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }),
    short: new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }),
    weekday: new Intl.DateTimeFormat("en-GB", { weekday: "long" })
  };

  // "8am", "1pm", "9:30am", "6pm".
  function clock(hhmm) {
    var p = hhmm.split(":");
    var h = +p[0];
    var m = +p[1];
    var suffix = h >= 12 ? "pm" : "am";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (m ? ":" + pad(m) : "") + suffix;
  }

  // £1,234.50 or £88 (pence only when there are any).
  function money(n) {
    var rounded = Math.round(n * 100) / 100;
    var whole = Math.abs(rounded - Math.round(rounded)) < 0.005;
    return "£" + rounded.toLocaleString("en-GB", { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 });
  }

  // Always two decimals: £88.00. For invoice-style lines where columns should line up.
  function money2(n) {
    return "£" + (Math.round(n * 100) / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function hoursText(h) {
    var r = Math.round(h * 100) / 100;
    return (r === Math.round(r) ? String(r) : r.toFixed(2).replace(/0$/, "")) + (r === 1 ? " hour" : " hours");
  }

  /* ---------- Opening hours and closures ---------- */

  function closedReason(d) {
    return data.closed[isoDate(d)] || "";
  }

  function isOpenDay(d) {
    return data.hours.days.indexOf(d.getDay()) !== -1 && !closedReason(d);
  }

  // The next n days the nursery is closed on a weekday (bank holidays, Christmas, training days), from today.
  function upcomingClosures(n, now) {
    var today = isoDate(now || new Date());
    return Object.keys(data.closed).sort().filter(function (k) {
      return k >= today;
    }).slice(0, n).map(function (k) {
      return { date: parseIso(k), reason: data.closed[k] };
    });
  }

  // Groups closures that fall on consecutive weekdays, so a Christmas closure reads as one line.
  function groupClosures(list) {
    var groups = [];
    list.forEach(function (c) {
      var last = groups[groups.length - 1];
      if (last) {
        var next = addDays(last.to, 1);
        while (next.getDay() === 0 || next.getDay() === 6) {
          next = addDays(next, 1);
        }
        if (isoDate(next) === isoDate(c.date)) {
          last.to = c.date;
          last.reasons.push(c.reason);
          return;
        }
      }
      groups.push({ from: c.date, to: c.date, reasons: [c.reason] });
    });
    return groups;
  }

  // { open: bool, text: "Open now until 6pm" | "Closed now. We open tomorrow at 8am." }
  function status(now) {
    now = now || new Date();
    var mins = now.getHours() * 60 + now.getMinutes();
    var openM = minutes(data.hours.open);
    var closeM = minutes(data.hours.close);
    if (isOpenDay(now) && mins >= openM && mins < closeM) {
      return { open: true, text: "Open now, until " + clock(data.hours.close) };
    }
    var reason = closedReason(now);
    var d = startOfDay(now);
    if (isOpenDay(now) && mins < openM) {
      return { open: false, text: "Closed now. We open today at " + clock(data.hours.open) + "." };
    }
    for (var i = 1; i <= 21; i++) {
      var next = addDays(d, i);
      if (isOpenDay(next)) {
        var when = i === 1 ? "tomorrow" : fmt.long.format(next);
        return { open: false, text: (reason ? "Closed today (" + reason + "). " : "Closed now. ") + "We open " + when + " at " + clock(data.hours.open) + "." };
      }
    }
    return { open: false, text: "Closed now." };
  }

  /* ---------- Ages ---------- */

  // Whole months between two dates (birth to on).
  function monthsBetween(birth, on) {
    var m = (on.getFullYear() - birth.getFullYear()) * 12 + (on.getMonth() - birth.getMonth());
    if (on.getDate() < birth.getDate()) {
      m -= 1;
    }
    return m;
  }

  // "7 months", "1 year 3 months", "2 years".
  function ageText(months) {
    if (months < 12) {
      return months + (months === 1 ? " month" : " months");
    }
    var y = Math.floor(months / 12);
    var m = months % 12;
    return y + (y === 1 ? " year" : " years") + (m ? " " + m + (m === 1 ? " month" : " months") : "");
  }

  function roomForMonths(months) {
    for (var i = 0; i < data.rooms.length; i++) {
      var r = data.rooms[i];
      if (months >= r.fromMonths && months < r.toMonths) {
        return r;
      }
    }
    return null;
  }

  function room(id) {
    return data.rooms.filter(function (r) {
      return r.id === id;
    })[0];
  }

  /* ---------- Week planner ----------
     A pattern is an array of five values, Monday to Friday: "", "am", "pm" or "full". It is shared between
     the fee calculator and the waiting-list form through the URL (?pattern=full.am..full.), so a parent can
     carry the pattern from one to the other. */
  var DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  var DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  function parsePattern(s) {
    var parts = (s || "").split(".");
    if (parts.length !== 5) {
      return null;
    }
    for (var i = 0; i < 5; i++) {
      if (parts[i] && !data.sessions[parts[i]]) {
        return null;
      }
    }
    return parts;
  }

  function patternHours(pattern) {
    return pattern.reduce(function (sum, s) {
      return sum + (s ? data.sessions[s].hours : 0);
    }, 0);
  }

  function patternDays(pattern) {
    return pattern.filter(Boolean).length;
  }

  // "Monday full day, Wednesday morning (15 hours a week)".
  function patternText(pattern) {
    var bits = [];
    pattern.forEach(function (s, i) {
      if (s) {
        bits.push(DAYS[i] + " " + data.sessions[s].name.toLowerCase());
      }
    });
    return bits.join(", ");
  }

  /* Builds the planner inside a container: one row a day with four choices (radio buttons, so keyboard
     and screen readers work as normal). onChange(pattern) runs on every change. */
  function planner(box, opts) {
    var name = opts.name || "plan";
    var initial = opts.initial || ["", "", "", "", ""];
    var choices = [["", "None"], ["am", "Morning"], ["pm", "Afternoon"], ["full", "Full day"]];
    box.textContent = "";
    var rows = [];
    DAYS.forEach(function (day, i) {
      var fs = document.createElement("fieldset");
      fs.className = "planner-day";
      var lg = document.createElement("legend");
      lg.className = "planner-day-name";
      var full = document.createElement("span");
      full.className = "planner-day-long";
      full.textContent = day;
      lg.appendChild(full);
      fs.appendChild(lg);
      var opts2 = document.createElement("div");
      opts2.className = "planner-options";
      choices.forEach(function (c) {
        var label = document.createElement("label");
        label.className = "planner-option" + (c[0] ? " is-" + c[0] : " is-none");
        var input = document.createElement("input");
        input.type = "radio";
        input.name = name + "-" + i;
        input.value = c[0];
        input.checked = (initial[i] || "") === c[0];
        var span = document.createElement("span");
        span.textContent = c[1];
        if (c[0]) {
          var small = document.createElement("small");
          small.textContent = clock(data.sessions[c[0]].from) + " to " + clock(data.sessions[c[0]].to);
          span.appendChild(small);
        }
        label.append(input, span);
        opts2.appendChild(label);
      });
      fs.appendChild(opts2);
      box.appendChild(fs);
      rows.push(fs);
    });

    function read() {
      return rows.map(function (fs) {
        var on = fs.querySelector("input:checked");
        return on ? on.value : "";
      });
    }

    function set(pattern) {
      rows.forEach(function (fs, i) {
        fs.querySelectorAll("input").forEach(function (input) {
          input.checked = input.value === (pattern[i] || "");
        });
      });
      if (opts.onChange) {
        opts.onChange(read());
      }
    }

    box.addEventListener("change", function () {
      if (opts.onChange) {
        opts.onChange(read());
      }
    });
    return { read: read, set: set };
  }

  /* ---------- Small DOM helper ---------- */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== undefined) {
      node.textContent = text;
    }
    return node;
  }

  function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  window.BT = {
    pad: pad,
    isoDate: isoDate,
    parseIso: parseIso,
    startOfDay: startOfDay,
    addDays: addDays,
    minutes: minutes,
    fmt: fmt,
    clock: clock,
    money: money,
    money2: money2,
    hoursText: hoursText,
    closedReason: closedReason,
    isOpenDay: isOpenDay,
    upcomingClosures: upcomingClosures,
    groupClosures: groupClosures,
    status: status,
    monthsBetween: monthsBetween,
    ageText: ageText,
    roomForMonths: roomForMonths,
    room: room,
    DAYS: DAYS,
    DAYS_SHORT: DAYS_SHORT,
    parsePattern: parsePattern,
    patternHours: patternHours,
    patternDays: patternDays,
    patternText: patternText,
    planner: planner,
    el: el,
    reducedMotion: reducedMotion
  };
})();
