/* Shared helpers: which rate applies right now, postcode lookups, arrival times and prices.
   Dates and times are the visitor's own clock. Nothing here touches the page. */
(function () {
  var D = window.Nightjar;

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

  var fmt = {
    weekday: new Intl.DateTimeFormat("en-GB", { weekday: "long" }),
    short: new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }),
    long: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" })
  };

  // "9am", "9:15pm", "12pm".
  function clock(d) {
    var h = d.getHours();
    var m = d.getMinutes();
    var suffix = h < 12 ? "am" : "pm";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (m ? ":" + pad(m) : "") + suffix;
  }

  // "08:30" -> "8:30am"
  function clockText(hhmm) {
    var p = hhmm.split(":");
    return clock(new Date(2000, 0, 1, +p[0], +p[1]));
  }

  function bankHoliday(d) {
    return D.bankHolidays[isoDate(d)] || "";
  }

  /* ---------- Rates ---------- */

  function rateAt(d) {
    d = d || new Date();
    var h = d.getHours();
    if (bankHoliday(d) || h < 7 || h >= 22) {
      return "night";
    }
    var dow = d.getDay();
    if (dow === 0 || dow === 6 || h >= 18) {
      return "evening";
    }
    return "day";
  }

  // When the rate that applies at d next changes (checked in 15-minute steps; the bands all start on the hour).
  function rateEnds(d) {
    d = d || new Date();
    var now = rateAt(d);
    var t = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), Math.floor(d.getMinutes() / 15) * 15);
    for (var i = 0; i < 4 * 24 * 4; i++) {
      t = new Date(t.getTime() + 15 * 60000);
      if (rateAt(t) !== now) {
        return t;
      }
    }
    return null;
  }

  // "until 10pm", "until 7am tomorrow", "until 7am on Monday".
  function untilText(d) {
    d = d || new Date();
    var end = rateEnds(d);
    if (!end) {
      return "";
    }
    var text = "until " + clock(end);
    if (sameDay(end, d)) {
      return text;
    }
    if (sameDay(end, addDays(d, 1))) {
      return text + " tomorrow";
    }
    return text + " on " + fmt.weekday.format(end);
  }

  /* ---------- Shop hours ---------- */

  function shopHours(d) {
    if (bankHoliday(d)) {
      return null;
    }
    return D.shop[d.getDay()] || null;
  }

  function atTime(d, hhmm) {
    var p = hhmm.split(":");
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), +p[0], +p[1]);
  }

  // { open: true, text: "Open until 5:30pm" } or { open: false, text: "Opens 8:30am tomorrow" }.
  function shopStatus(now) {
    now = now || new Date();
    var today = shopHours(now);
    if (today && now >= atTime(now, today[0]) && now < atTime(now, today[1])) {
      return { open: true, text: "Open until " + clockText(today[1]) };
    }
    for (var i = 0; i < 8; i++) {
      var day = addDays(startOfDay(now), i);
      var hours = shopHours(day);
      if (hours && atTime(day, hours[0]) > now) {
        var when = i === 0 ? "today" : i === 1 ? "tomorrow" : "on " + fmt.weekday.format(day);
        return { open: false, text: "Opens " + clockText(hours[0]) + " " + when };
      }
    }
    return { open: false, text: "Closed" };
  }

  /* ---------- Postcodes and areas ---------- */

  // Accepts "rm11", "RM11 2AB", "rm112ab". Returns { outward: "RM11" } or { error: "..." }.
  function parsePostcode(input) {
    var s = String(input || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!s) {
      return { error: "empty" };
    }
    var full = /^([A-Z]{1,2}[0-9][A-Z0-9]?)([0-9][A-Z]{2})$/.exec(s);
    if (full) {
      return { outward: full[1] };
    }
    if (/^[A-Z]{1,2}[0-9][A-Z0-9]?$/.test(s)) {
      return { outward: s };
    }
    return { error: "format" };
  }

  // The district and its band, or null when we don't cover it.
  function area(outward) {
    var d = D.districts[outward];
    if (!d) {
      return null;
    }
    return { code: outward, places: d.places, bandKey: d.band, band: D.bands[d.band] };
  }

  // [shortest, longest] minutes for a band at a rate.
  function arrival(bandKey, rate) {
    return D.bands[bandKey].arrive[rate || rateAt()];
  }

  function arrivalText(range) {
    return range[0] + " to " + range[1] + " minutes";
  }

  // The widest typical arrival across every band at a rate, e.g. [20, 60].
  function arrivalSpread(rate) {
    var lo = Infinity;
    var hi = 0;
    Object.keys(D.bands).forEach(function (k) {
      var r = D.bands[k].arrive[rate || rateAt()];
      lo = Math.min(lo, r[0]);
      hi = Math.max(hi, r[1]);
    });
    return [lo, hi];
  }

  /* ---------- Prices ---------- */

  function money(n) {
    return "£" + (n % 1 ? n.toFixed(2) : String(n));
  }

  // The price of one job at one rate (no travel), or the day price for shop work.
  function unitPrice(job, rate) {
    if (job.prices) {
      return job.prices[rate];
    }
    if (job.shop) {
      return job.day;
    }
    return job.day + D.surcharge[rate];
  }

  // The lowest price a job is ever charged at: its day price.
  function fromPrice(job) {
    return job.prices ? job.prices.day : job.day;
  }

  // A full guide price: { total, lines: [[label, amount]], from }.
  // count = how many locks (each one after the first costs job.extra). bandKey defaults to the home patch.
  function quote(jobKey, rate, count, bandKey) {
    var job = D.jobs[jobKey];
    rate = rate || rateAt();
    count = Math.max(1, Math.min(6, Math.floor(count || 1)));
    if (!job.extra) {
      count = 1;
    }
    var band = D.bands[bandKey || "A"];
    var lines = [];
    var total;
    if (job.prices) {
      total = job.prices[rate];
      lines.push([job.short + ", " + D.rates[rate].long.toLowerCase(), total]);
    } else {
      total = job.day;
      lines.push([job.short + (job.from ? " (from)" : ""), total]);
      if (!job.shop && D.surcharge[rate]) {
        lines.push([D.rates[rate].long, D.surcharge[rate]]);
        total += D.surcharge[rate];
      }
    }
    if (count > 1) {
      var extras = (count - 1) * job.extra;
      lines.push([(count - 1) + " more " + (count - 1 === 1 ? "lock" : "locks") + " on the same visit, " + money(job.extra) + " each", extras]);
      total += extras;
    }
    if (!job.shop) {
      lines.push(["Travel: " + band.name.toLowerCase() + (band.travel ? "" : ", no charge"), band.travel]);
      total += band.travel;
    }
    return { total: total, lines: lines, from: !!job.from, count: count };
  }

  /* ---------- Remembered area (this device only) ---------- */

  var KEY = "nightjar-area";

  function savedArea() {
    try {
      var code = window.localStorage.getItem(KEY);
      return code && D.districts[code] ? code : "";
    } catch (e) {
      return "";
    }
  }

  function saveArea(code) {
    try {
      window.localStorage.setItem(KEY, code);
    } catch (e) {
      /* storage blocked: the page still works, it just won't remember */
    }
    document.dispatchEvent(new CustomEvent("nightjar:area", { detail: { code: code } }));
  }

  window.NightjarCore = {
    pad: pad,
    isoDate: isoDate,
    parseIso: parseIso,
    startOfDay: startOfDay,
    addDays: addDays,
    sameDay: sameDay,
    fmt: fmt,
    clock: clock,
    clockText: clockText,
    bankHoliday: bankHoliday,
    rateAt: rateAt,
    rateEnds: rateEnds,
    untilText: untilText,
    shopHours: shopHours,
    shopStatus: shopStatus,
    parsePostcode: parsePostcode,
    area: area,
    arrival: arrival,
    arrivalText: arrivalText,
    arrivalSpread: arrivalSpread,
    money: money,
    unitPrice: unitPrice,
    fromPrice: fromPrice,
    quote: quote,
    savedArea: savedArea,
    saveArea: saveArea
  };
})();
