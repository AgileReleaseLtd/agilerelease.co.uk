/* Dates for every page: UK tax years, the key deadlines for the next twelve months (from the rules in
   data.js), company deadlines from a year end, and whether the office is open. Dates are the visitor's
   local dates, and "today" is always the real today, so the site never shows a stale deadline. */
(function () {
  var data = window.Quarterday;

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

  function today() {
    return startOfDay(new Date());
  }

  function addDays(d, n) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  }

  function daysBetween(a, b) {
    // Whole days from a to b, safe across clock changes.
    return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86400000);
  }

  function lastDayOfMonth(y, m) {
    return new Date(y, m + 1, 0).getDate();
  }

  function isMonthEnd(d) {
    return d.getDate() === lastDayOfMonth(d.getFullYear(), d.getMonth());
  }

  // Months later. A month-end date stays a month-end (30 June + 9 months = 31 March), as Companies House
  // and HMRC count; any other day is capped at the end of a shorter month.
  function addMonths(d, n) {
    var y = d.getFullYear();
    var m = d.getMonth() + n;
    var ty = y + Math.floor(m / 12);
    var tm = ((m % 12) + 12) % 12;
    var last = lastDayOfMonth(ty, tm);
    var day = isMonthEnd(d) ? last : Math.min(d.getDate(), last);
    return new Date(ty, tm, day);
  }

  var fmt = {
    long: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    full: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }),
    dayMonth: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" }),
    short: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    monthYear: new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }),
    monthShort: new Intl.DateTimeFormat("en-GB", { month: "short" }),
    weekday: new Intl.DateTimeFormat("en-GB", { weekday: "long" }),
    weekdayShort: new Intl.DateTimeFormat("en-GB", { weekday: "short" })
  };

  /* ---------- Tax years ---------- */

  // The tax year a date falls in, by its first calendar year: 6 April 2026 to 5 April 2027 is 2026.
  function taxYearStart(d) {
    var y = d.getFullYear();
    var april6 = new Date(y, 3, 6);
    return d >= april6 ? y : y - 1;
  }

  function taxYearLabel(start) {
    return start + " to " + (start + 1);
  }

  function taxYearShort(start) {
    return start + "–" + String(start + 1).slice(2);
  }

  // How far through the tax year a date is: the year, the day number, the days in the year and the quarter.
  function taxYearProgress(d) {
    var start = taxYearStart(d);
    var first = new Date(start, 3, 6);
    var last = new Date(start + 1, 3, 5);
    var total = daysBetween(first, last) + 1;
    var day = daysBetween(first, d) + 1;
    // Quarters end on 5 July, 5 October, 5 January and 5 April.
    var ends = [new Date(start, 6, 5), new Date(start, 9, 5), new Date(start + 1, 0, 5), last];
    var quarter = 0;
    while (quarter < 3 && d > ends[quarter]) {
      quarter++;
    }
    return { start: start, first: first, last: last, day: day, total: total, quarter: quarter, quarterEnds: ends };
  }

  /* ---------- Deadlines ---------- */

  // The tax year a deadline belongs to ({ty} in data.js), by deadline id and the date it falls on.
  function deadlineTaxYear(rule, date) {
    var y = date.getFullYear();
    switch (rule.id) {
      case "sa-online":
      case "sa-pay":
        return y - 2; // 31 January 2027 is the return for 2025 to 2026
      case "mtd-q3":
      case "mtd-q4":
      case "year-end":
      case "p60":
      case "poa2":
      case "register":
      case "paper":
      case "paye-code":
        return y - 1;
      default:
        return y; // year-start, mtd-q1, mtd-q2
    }
  }

  function fillText(text, ty) {
    return text.replace(/\{ty\}/g, taxYearLabel(ty)).replace(/\{next\}/g, taxYearLabel(ty + 1));
  }

  // Every deadline from `from` for `days` days, in date order. Each: { id, date, cat, title, detail, ty }.
  function deadlines(from, days) {
    from = startOfDay(from || today());
    var until = addDays(from, days === undefined ? 365 : days);
    var out = [];
    var mtdFirst = data.mtd.firstTaxYear;

    data.deadlines.forEach(function (rule) {
      if (rule.monthly) {
        // Next one only: a monthly payment would crowd out everything else.
        var d = new Date(from.getFullYear(), from.getMonth(), rule.monthly);
        if (d < from) {
          d = new Date(from.getFullYear(), from.getMonth() + 1, rule.monthly);
        }
        out.push({ id: rule.id, date: d, cat: rule.cat, title: rule.title, detail: rule.detail, monthly: true, ty: taxYearStart(d) });
        return;
      }
      for (var y = from.getFullYear(); y <= until.getFullYear(); y++) {
        var date = new Date(y, rule.month - 1, rule.day);
        if (date < from || date > until) {
          continue;
        }
        var ty = deadlineTaxYear(rule, date);
        // Quarterly updates only exist from the first MTD tax year.
        if (rule.cat === "mtd" && ty < mtdFirst) {
          continue;
        }
        var detail = fillText(rule.detail, ty);
        if (rule.id === "sa-online" && ty >= mtdFirst) {
          detail += " If you are in Making Tax Digital, it goes through your MTD software.";
        }
        if (rule.id === "year-start" && data.mtdStarts[String(y)]) {
          detail += " " + data.mtdStarts[String(y)];
        }
        out.push({ id: rule.id, date: date, cat: rule.cat, title: rule.title, detail: detail, ty: ty, minor: !!rule.minor });
      }
    });

    out.sort(function (a, b) {
      return a.date - b.date || order(a) - order(b);
    });
    return out;

    function order(item) {
      return ["sa-online", "sa-pay"].indexOf(item.id) + 1;
    }
  }

  // "Today", "Tomorrow", "In 5 days", "In 3 weeks" or "In 4 months".
  function countdown(date, now) {
    var n = daysBetween(startOfDay(now || new Date()), date);
    if (n < 0) {
      return n === -1 ? "Yesterday" : Math.abs(n) + " days ago";
    }
    if (n === 0) {
      return "Today";
    }
    if (n === 1) {
      return "Tomorrow";
    }
    if (n < 21) {
      return "In " + n + " days";
    }
    if (n < 92) {
      return "In " + Math.round(n / 7) + " weeks";
    }
    return "In " + Math.round(n / 30.4) + " months";
  }

  /* ---------- Limited company dates ---------- */

  // Deadlines for a company's accounting period ending on yearEnd (a Date).
  function companyDeadlines(yearEnd) {
    return [
      { id: "accounts", title: "Accounts to Companies House", date: addMonths(yearEnd, 9), rule: "9 months after your year end" },
      { id: "ct-pay", title: "Pay Corporation Tax", date: addDays(addMonths(yearEnd, 9), 1), rule: "9 months and 1 day after your year end" },
      { id: "ct600", title: "Company Tax Return (CT600)", date: addMonths(yearEnd, 12), rule: "12 months after your year end" }
    ];
  }

  // The most recent year end (day, month 0-11) on or before `from`.
  function lastYearEnd(day, month, from) {
    from = startOfDay(from || today());
    var y = from.getFullYear();
    var d = new Date(y, month, Math.min(day, lastDayOfMonth(y, month)));
    if (d > from) {
      d = new Date(y - 1, month, Math.min(day, lastDayOfMonth(y - 1, month)));
    }
    return d;
  }

  // Confirmation statement: due within 14 days after each anniversary of the date the company was set up.
  function nextConfirmation(incorporated, from) {
    from = startOfDay(from || today());
    for (var y = Math.max(incorporated.getFullYear() + 1, from.getFullYear() - 1); y <= from.getFullYear() + 1; y++) {
      var review = new Date(y, incorporated.getMonth(), Math.min(incorporated.getDate(), lastDayOfMonth(y, incorporated.getMonth())));
      var due = addDays(review, 14);
      if (due >= from) {
        return { review: review, due: due };
      }
    }
    return null;
  }

  /* ---------- Office hours ---------- */

  function hoursOn(d) {
    if (data.closed[isoDate(d)]) {
      return null;
    }
    if (d.getDay() === 6 && d.getMonth() === 0 && data.januarySaturdays) {
      return data.januarySaturdays;
    }
    return data.hours[d.getDay()] || null;
  }

  function at(d, hm) {
    var p = hm.split(":");
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), +p[0], +p[1]);
  }

  // "9am", "5:30pm".
  function clock(hm) {
    var p = hm.split(":");
    var h = +p[0];
    var m = p[1];
    var suffix = h >= 12 ? "pm" : "am";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (m === "00" ? "" : ":" + m) + suffix;
  }

  // { open: true, text: "Open now until 5:30pm" } or { open: false, text: "Closed. Opens Monday at 9am" }.
  function officeStatus(now) {
    now = now || new Date();
    var day = startOfDay(now);
    var h = hoursOn(day);
    if (h && now >= at(day, h[0]) && now < at(day, h[1])) {
      return { open: true, text: "Open now, until " + clock(h[1]) };
    }
    for (var i = 0; i < 14; i++) {
      var d = addDays(day, i);
      var hh = hoursOn(d);
      if (!hh || (i === 0 && now >= at(d, hh[0]))) {
        continue;
      }
      var when = i === 0 ? "today" : i === 1 ? "tomorrow" : fmt.weekday.format(d);
      if (i > 6) {
        when = fmt.weekday.format(d) + " " + fmt.dayMonth.format(d);
      }
      var reason = data.closed[isoDate(day)];
      return { open: false, text: (reason ? "Closed for " + reason + ". " : "Closed now. ") + "Opens " + when + " at " + clock(hh[0]) };
    }
    return { open: false, text: "Closed now" };
  }

  window.QuarterdayDates = {
    pad: pad,
    isoDate: isoDate,
    parseIso: parseIso,
    startOfDay: startOfDay,
    today: today,
    addDays: addDays,
    addMonths: addMonths,
    daysBetween: daysBetween,
    fmt: fmt,
    taxYearStart: taxYearStart,
    taxYearLabel: taxYearLabel,
    taxYearShort: taxYearShort,
    taxYearProgress: taxYearProgress,
    deadlines: deadlines,
    countdown: countdown,
    companyDeadlines: companyDeadlines,
    lastYearEnd: lastYearEnd,
    nextConfirmation: nextConfirmation,
    hoursOn: hoursOn,
    clock: clock,
    officeStatus: officeStatus
  };
})();
