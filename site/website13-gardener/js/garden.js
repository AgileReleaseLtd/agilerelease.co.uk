/* Shared helpers worked out from data.js: today's date and season, month names, postcode lookups, plan
   prices and office hours. Everything uses the visitor's own clock, so the site never looks out of date.
   (For checking the seasons, ?today=YYYY-MM-DD on any page pretends it is that day.) */
(function () {
  var data = window.Hornbeam;

  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

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

  // Now, or the day given by ?today= (at 10am, so office hours read as a working morning).
  function now() {
    var param = new URLSearchParams(window.location.search).get("today");
    var d = parseIso(param);
    if (d) {
      d.setHours(10, 0, 0, 0);
      return d;
    }
    return new Date();
  }

  // "spring", "summer", "autumn" or "winter" for a date (Met Office seasons).
  function seasonOf(d) {
    var m = d.getMonth() + 1;
    var key = "winter";
    Object.keys(data.seasons).forEach(function (k) {
      if (data.seasons[k].months.indexOf(m) !== -1) {
        key = k;
      }
    });
    return key;
  }

  // "March to October" style text for the months (1 to 12) in a set, wrapping round the new year.
  function monthRanges(values, wanted) {
    var on = values.map(function (v) {
      return v === wanted;
    });
    if (on.every(Boolean)) {
      return ["all year"];
    }
    // Start counting from a month that is off, so a run over New Year stays in one piece.
    var start = on.indexOf(false);
    var runs = [];
    var run = null;
    for (var i = 1; i <= 12; i++) {
      var m = (start + i) % 12;
      if (on[m]) {
        if (!run) {
          run = [m, m];
          runs.push(run);
        } else {
          run[1] = m;
        }
      } else {
        run = null;
      }
    }
    return runs.map(function (r) {
      return r[0] === r[1] ? MONTHS[r[0]] : MONTHS[r[0]] + " to " + MONTHS[r[1]];
    });
  }

  function listText(items) {
    if (items.length < 2) {
      return items.join("");
    }
    return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
  }

  // A sentence for one row of the garden-year chart.
  function jobTiming(values) {
    var best = monthRanges(values, 2);
    var also = monthRanges(values, 1);
    if (best[0] === "all year") {
      return "Any time of year.";
    }
    var text = best.length ? "Best " + listText(best) + "." : "";
    if (also.length) {
      text += (text ? " " : "") + "Can be done " + listText(also) + ".";
    }
    return text;
  }

  // The jobs that are at their best this month, in chart order.
  function jobsForMonth(monthIndex) {
    var out = [];
    data.yearGroups.forEach(function (g) {
      g.jobs.forEach(function (j) {
        if (j[1][monthIndex] === 2 && j[1].indexOf(0) !== -1) {
          out.push(j[0]);
        }
      });
    });
    return out;
  }

  /* Postcodes: accepts a full postcode ("SM5 3AB") or just the district ("sm5").
     Returns { district, area } where area is the entry in data.areas or null, or { error } when it is
     not a postcode. */
  function lookup(text) {
    var s = String(text || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!s) {
      return { error: "empty" };
    }
    var m = /^([A-Z]{1,2}[0-9][A-Z0-9]?)([0-9][A-Z]{2})?$/.exec(s);
    if (!m) {
      return { error: "format" };
    }
    // With the space taken out, the inward code is always the last digit and two letters ("SM53AB").
    var district = m[1];
    return { district: district, full: m[2] ? district + " " + m[2] : district, area: data.areas[district] || null };
  }

  function money(n) {
    return "£" + Math.round(n).toLocaleString("en-GB");
  }

  function planPrice(freq, size) {
    var plan = data.plans[freq];
    var perVisit = plan.perVisit[size];
    return {
      perVisit: perVisit,
      visits: plan.visitsPerYear,
      monthly: Math.round(perVisit * plan.visitsPerYear / 12),
      hours: plan.hours[size]
    };
  }

  // The lowest monthly price of any plan, for "from £.. a month".
  function cheapestMonthly() {
    var low = Infinity;
    Object.keys(data.plans).forEach(function (f) {
      Object.keys(data.sizes).forEach(function (s) {
        low = Math.min(low, planPrice(f, s).monthly);
      });
    });
    return low;
  }

  function closedOn(d) {
    var iso = isoDate(d);
    for (var i = 0; i < data.closed.length; i++) {
      if (iso >= data.closed[i][0] && iso <= data.closed[i][1]) {
        return data.closed[i];
      }
    }
    return null;
  }

  function timeText(hhmm) {
    var p = hhmm.split(":");
    var h = +p[0];
    var m = p[1];
    var suffix = h >= 12 ? "pm" : "am";
    var h12 = h % 12 || 12;
    return h12 + (m === "00" ? "" : ":" + m) + suffix;
  }

  // Is the office answering now, and if not, when does it next open?
  function officeStatus(at) {
    var t = at || now();
    var hhmm = pad(t.getHours()) + ":" + pad(t.getMinutes());
    var today = data.hours[t.getDay()];
    if (today && !closedOn(t) && hhmm >= today[0] && hhmm < today[1]) {
      return { open: true, text: "Open now, until " + timeText(today[1]) };
    }
    for (var i = 0; i < 21; i++) {
      var d = new Date(t.getFullYear(), t.getMonth(), t.getDate() + i);
      var h = data.hours[d.getDay()];
      if (!h || closedOn(d)) {
        continue;
      }
      if (i === 0 && hhmm >= h[0]) {
        continue;
      }
      var when = i === 0 ? "today" : i === 1 ? "tomorrow" : DAYS[d.getDay()];
      if (i > 6) {
        when = DAYS[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()];
      }
      var why = closedOn(t);
      return { open: false, text: (why ? "Closed: " + why[2] : "Closed now") + ". Opens " + when + " at " + timeText(h[0]) };
    }
    return { open: false, text: "Closed now" };
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== undefined && text !== null) {
      node.textContent = text;
    }
    return node;
  }

  function svgEl(tag, attrs) {
    var node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attrs || {}).forEach(function (k) {
      node.setAttribute(k, attrs[k]);
    });
    return node;
  }

  function icon(id, extra) {
    var s = svgEl("svg", { "class": "icon" + (extra ? " " + extra : ""), "aria-hidden": "true" });
    s.appendChild(svgEl("use", { href: "#" + id }));
    return s;
  }

  // Opens WhatsApp with the message, or on the sample site returns false so the page can show it instead.
  function sendWhatsApp(text) {
    if (data.sample) {
      return false;
    }
    var url = "https://wa.me/" + data.whatsapp + "?text=" + encodeURIComponent(text);
    var opened = window.open(url, "_blank");
    if (opened) {
      opened.opener = null;
    } else {
      window.location.href = url;
    }
    return true;
  }

  function mailtoLink(subject, body) {
    return "mailto:" + data.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  window.HornbeamGarden = {
    MONTHS: MONTHS,
    now: now,
    isoDate: isoDate,
    seasonOf: seasonOf,
    jobTiming: jobTiming,
    jobsForMonth: jobsForMonth,
    lookup: lookup,
    money: money,
    planPrice: planPrice,
    cheapestMonthly: cheapestMonthly,
    officeStatus: officeStatus,
    timeText: timeText,
    el: el,
    svgEl: svgEl,
    icon: icon,
    sendWhatsApp: sendWhatsApp,
    mailtoLink: mailtoLink
  };
})();
