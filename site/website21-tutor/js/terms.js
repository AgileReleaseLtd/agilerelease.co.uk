/* Dates for Markwell Tuition: works out the term dates from the rules in data.js, and turns the weekly
   timetable into real dated sessions. Everything is relative to today, in the visitor's local time, so the
   site never shows an old term. Also school years, times and prices in words. */
(function () {
  var data = window.Markwell;
  var rules = data.termRules;
  var DAY_MS = 86400000;

  /* ---------- Plain date helpers ---------- */

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  // "2026-11-10" in local time (toISOString would shift to UTC).
  function isoDate(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function parseIso(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
    if (!m) {
      return null;
    }
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return isoDate(d) === s ? d : null;
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

  // Whole days from a to b (dates only).
  function daysBetween(a, b) {
    return Math.round((startOfDay(b) - startOfDay(a)) / DAY_MS);
  }

  // The first given weekday (0 = Sunday) on or after d.
  function onOrAfter(d, weekday) {
    return addDays(d, (weekday - d.getDay() + 7) % 7);
  }

  // The last given weekday on or before d.
  function onOrBefore(d, weekday) {
    return addDays(d, -((d.getDay() - weekday + 7) % 7));
  }

  // The Monday of d's week (weeks run Monday to Sunday).
  function mondayOf(d) {
    return addDays(d, -((d.getDay() + 6) % 7));
  }

  // Easter Sunday (Gregorian calendar, the "anonymous" algorithm).
  function easter(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
    var f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    var h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
    var l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    var month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, month - 1, day);
  }

  function md(y, pair) {
    return new Date(y, pair[0] - 1, pair[1]);
  }

  /* ---------- Terms ---------- */

  // The three terms of the school year that starts in September of year y.
  function termsOfYear(y) {
    var autumnStart = onOrAfter(md(y, rules.autumnStartsOnOrAfter), 1);
    var autumnEnd = onOrBefore(md(y, rules.autumnEndsOnOrBefore), 6);
    var autumnHalf = onOrBefore(new Date(y, 9, 31), 1); // the last Monday in October

    var springStart = onOrAfter(md(y + 1, rules.springStartsOnOrAfter), 1);
    var springHalf = onOrAfter(md(y + 1, rules.springHalfTermOnOrAfter), 1);
    // Easter: two weeks off from the first Monday on or after 29 March, as local schools do, whatever the
    // date of Easter. If Good Friday comes just before the break, the spring term ends on the Thursday; if
    // Easter Monday is the first day back, the summer term starts on the Tuesday. Any other Good Friday or
    // Easter Monday in term is a bank holiday with no classes.
    var easterDay = easter(y + 1);
    var goodFriday = addDays(easterDay, -2);
    var easterMonday = addDays(easterDay, 1);
    var easterBreak = onOrAfter(md(y + 1, rules.easterBreakOnOrAfter), 1);
    var springEnd = addDays(easterBreak, -2); // the Saturday before it
    if (sameDay(addDays(goodFriday, 1), springEnd)) {
      springEnd = addDays(goodFriday, -1);
    }

    var summerStart = addDays(easterBreak, 14);
    if (sameDay(easterMonday, summerStart)) {
      summerStart = addDays(summerStart, 1);
    }
    var summerHalf = onOrBefore(new Date(y + 1, 4, 31), 1); // the late May bank holiday
    var summerEnd = onOrBefore(md(y + 1, rules.summerEndsOnOrBefore), 6);
    var earlyMay = onOrAfter(new Date(y + 1, 4, 1), 1); // the early May bank holiday
    var springBank = [], summerBank = [];
    [goodFriday, easterMonday].forEach(function (b) {
      if (b >= springStart && b <= springEnd) {
        springBank.push(b);
      }
      if (b >= summerStart && b <= summerEnd) {
        summerBank.push(b);
      }
    });
    summerBank.push(earlyMay);

    function term(id, name, year, start, end, half, bankHolidays) {
      return {
        id: id + "-" + year,
        season: id,
        name: name,
        label: name + " " + year,
        start: start,
        end: end,
        halfStart: half,
        halfEnd: addDays(half, 5), // Monday to Saturday
        bankHolidays: bankHolidays || []
      };
    }

    return [
      term("autumn", "Autumn term", y, autumnStart, autumnEnd, autumnHalf),
      term("spring", "Spring term", y + 1, springStart, springEnd, springHalf, springBank),
      term("summer", "Summer term", y + 1, summerStart, summerEnd, summerHalf, summerBank)
    ];
  }

  // Terms from the start of this school year to the end of the next one.
  function allTerms(now) {
    var today = startOfDay(now || new Date());
    var y = today.getFullYear();
    // Before the autumn term starts, we are still in the school year that began last September.
    var first = today < termsOfYear(y)[0].start ? y - 1 : y;
    return termsOfYear(first).concat(termsOfYear(first + 1));
  }

  // The term today falls in (half-term included), or null in the holidays.
  function currentTerm(now) {
    var today = startOfDay(now || new Date());
    return allTerms(today).filter(function (t) {
      return today >= t.start && today <= t.end;
    })[0] || null;
  }

  // The next term to start after today.
  function nextTerm(now) {
    var today = startOfDay(now || new Date());
    return allTerms(today).filter(function (t) {
      return t.start > today;
    })[0];
  }

  // The term people can join now: the current one, or the next one in the holidays.
  function joinableTerm(now) {
    return currentTerm(now) || nextTerm(now);
  }

  function inHalfTerm(d, t) {
    return d >= t.halfStart && d <= t.halfEnd;
  }

  // Why there are no classes on a date in term time ("" if there are).
  function noClassReason(d, t) {
    if (inHalfTerm(d, t)) {
      return "Half-term";
    }
    var iso = isoDate(d);
    if (data.closed[iso]) {
      return data.closed[iso];
    }
    if (t.bankHolidays.some(function (b) { return sameDay(b, d); })) {
      return "Bank holiday";
    }
    return "";
  }

  // Teaching weeks in a term (half-term week not counted), and which one today is in.
  function termWeeks(t, now) {
    // Calendar weeks from the first Monday to the last, less the half-term week.
    var total = Math.round((mondayOf(t.end) - mondayOf(t.start)) / (7 * DAY_MS));
    var today = startOfDay(now || new Date());
    var current = null;
    if (today >= t.start && today <= t.end && !inHalfTerm(today, t)) {
      current = Math.round((mondayOf(today) - mondayOf(t.start)) / (7 * DAY_MS)) + 1;
      if (today > t.halfEnd) {
        current -= 1;
      }
    }
    return { total: total, current: current };
  }

  // The status of the centre's year today: in term, in half-term or on holiday.
  function termStatus(now) {
    var today = startOfDay(now || new Date());
    var t = currentTerm(today);
    if (t && inHalfTerm(today, t)) {
      return { kind: "half", term: t, back: addDays(t.halfEnd, 2) };
    }
    if (t) {
      return { kind: "term", term: t, weeks: termWeeks(t, today) };
    }
    return { kind: "holiday", term: nextTerm(today) };
  }

  /* ---------- Classes and sessions ---------- */

  function classById(id) {
    return data.classes.filter(function (c) {
      return c.id === id;
    })[0] || null;
  }

  function classStart(c, d) {
    var hm = c.start.split(":");
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), +hm[0], +hm[1]);
  }

  // Every session of class c in term t, as dates, from the day `from` on (optional).
  function sessionsInTerm(c, t, from) {
    var out = [];
    var first = onOrAfter(t.start, c.day % 7);
    for (var d = first; d <= t.end; d = addDays(d, 7)) {
      if (from && d < startOfDay(from)) {
        continue;
      }
      if (!noClassReason(d, t)) {
        out.push(d);
      }
    }
    return out;
  }

  // The next n sessions of class c that start at least `noticeHours` from now, across terms.
  function nextSessions(c, n, now, noticeHours) {
    now = now || new Date();
    var limit = new Date(now.getTime() + (noticeHours || 0) * 3600000);
    var out = [];
    allTerms(now).forEach(function (t) {
      if (out.length >= n || t.end < startOfDay(now)) {
        return;
      }
      sessionsInTerm(c, t, now).forEach(function (d) {
        if (out.length < n && classStart(c, d) >= limit) {
          out.push(d);
        }
      });
    });
    return out;
  }

  // The fee for joining class c for the rest of the joinable term (or a whole later term).
  function termFee(c, t, now) {
    var today = startOfDay(now || new Date());
    var from = today > t.start ? today : null;
    var list = sessionsInTerm(c, t, from);
    // A session later today still counts only if it has not started.
    if (list.length && sameDay(list[0], today) && classStart(c, list[0]) <= (now || new Date())) {
      list = list.slice(1);
    }
    var price = data.groupFees[c.fee].price;
    return { sessions: list.length, price: price, total: list.length * price, whole: !from };
  }

  function placesLeft(c) {
    return Math.max(0, c.capacity - c.enrolled);
  }

  function forYear(c, year) {
    return year === null || year === undefined || (year >= c.from && year <= c.to);
  }

  /* ---------- Words ---------- */

  var fmt = {
    short: new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }),
    long: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }),
    longYear: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    dayMonth: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" }),
    dayMonthShort: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }),
    dayMonthYear: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }),
    weekday: new Intl.DateTimeFormat("en-GB", { weekday: "long" })
  };

  var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // "16:15" -> "4:15pm", "09:00" -> "9am".
  function time(hm) {
    var p = hm.split(":");
    var h = +p[0], m = +p[1];
    var suffix = h >= 12 ? "pm" : "am";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (m ? ":" + pad(m) : "") + suffix;
  }

  function addMinutes(hm, minutes) {
    var p = hm.split(":");
    var total = +p[0] * 60 + +p[1] + minutes;
    return pad(Math.floor(total / 60)) + ":" + pad(total % 60);
  }

  // "4:15pm to 5:15pm"
  function timeRange(c) {
    return time(c.start) + " to " + time(addMinutes(c.start, c.minutes));
  }

  // 0 -> "Reception", 7 -> "Year 7".
  function yearName(n) {
    return n === 0 ? "Reception" : "Year " + n;
  }

  // "Year 5", "Years 3 and 4", "Years 7 to 9".
  function yearsLabel(from, to) {
    if (from === to) {
      return yearName(from);
    }
    if (to === from + 1) {
      return "Years " + from + " and " + to;
    }
    return "Years " + from + " to " + to;
  }

  function stageOf(year) {
    return data.stages.filter(function (s) {
      return year >= s.from && year <= s.to;
    })[0];
  }

  // A child's school year in the school year that contains `now`, from their birth year and month (1-12).
  function yearFromBirth(birthYear, birthMonth, now) {
    var today = now || new Date();
    // The school year starts on 1 September.
    var schoolYearStart = today.getMonth() >= 8 ? today.getFullYear() : today.getFullYear() - 1;
    // Age on 31 August before that school year started.
    var age = schoolYearStart - birthYear - (birthMonth >= 9 ? 1 : 0);
    return age - 4; // 4 on 31 August = Reception (0)
  }

  function schoolYearLabel(now) {
    var today = now || new Date();
    var y = today.getMonth() >= 8 ? today.getFullYear() : today.getFullYear() - 1;
    return y + " to " + (y + 1);
  }

  function money(n) {
    var whole = Math.round(n * 100) % 100 === 0;
    return "£" + (whole ? Math.round(n).toLocaleString("en-GB") : n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  }

  function plural(n, one, many) {
    return n + " " + (n === 1 ? one : (many || one + "s"));
  }

  // "Today", "Tomorrow" or "Tue 10 Nov".
  function relativeDay(d, now) {
    var today = startOfDay(now || new Date());
    if (sameDay(d, today)) {
      return "Today";
    }
    if (sameDay(d, addDays(today, 1))) {
      return "Tomorrow";
    }
    return fmt.short.format(d);
  }

  // "26 October to 31 October" or "26 to 31 October".
  function range(a, b) {
    if (a.getMonth() === b.getMonth()) {
      return a.getDate() + " to " + fmt.dayMonth.format(b);
    }
    return fmt.dayMonth.format(a) + " to " + fmt.dayMonth.format(b);
  }

  window.MarkwellDates = {
    isoDate: isoDate,
    parseIso: parseIso,
    startOfDay: startOfDay,
    addDays: addDays,
    sameDay: sameDay,
    daysBetween: daysBetween,
    mondayOf: mondayOf,
    easter: easter,
    termsOfYear: termsOfYear,
    allTerms: allTerms,
    currentTerm: currentTerm,
    nextTerm: nextTerm,
    joinableTerm: joinableTerm,
    inHalfTerm: inHalfTerm,
    noClassReason: noClassReason,
    termWeeks: termWeeks,
    termStatus: termStatus,
    classById: classById,
    classStart: classStart,
    sessionsInTerm: sessionsInTerm,
    nextSessions: nextSessions,
    termFee: termFee,
    placesLeft: placesLeft,
    forYear: forYear,
    fmt: fmt,
    DAY_NAMES: DAY_NAMES,
    time: time,
    addMinutes: addMinutes,
    timeRange: timeRange,
    yearName: yearName,
    yearsLabel: yearsLabel,
    stageOf: stageOf,
    yearFromBirth: yearFromBirth,
    schoolYearLabel: schoolYearLabel,
    money: money,
    plural: plural,
    relativeDay: relativeDay,
    range: range
  };
})();
