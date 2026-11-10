/* The instant estimate: turns answers (service, size, extras, how often) into hours, a price and a
   line-by-line breakdown, using the prices in data.js. Used by the estimate page and the booking page.
   Answers travel between pages in the address, like ?svc=regular&beds=2&baths=1&freq=fortnightly&x=oven. */
(function () {
  var data = window.Tessel;

  var DEFAULTS = {
    service: "regular",
    beds: 2,
    baths: 1,
    freq: "fortnightly",
    furnished: false,
    unit: "desks",
    size: 10,
    toilets: 1,
    visits: "2",
    extras: {}
  };

  /* ---------- Formatting ---------- */

  // 2.5 -> "2½ hours", 0.75 -> "45 min", 1 -> "1 hour".
  function hours(h) {
    var whole = Math.floor(h + 1e-9);
    var part = Math.round((h - whole) * 4);
    if (whole === 0) {
      return [0, 15, 30, 45][part] + " min";
    }
    var frac = ["", "¼", "½", "¾"][part];
    return whole + frac + (whole === 1 && !frac ? " hour" : " hours");
  }

  // 81 -> "£81", 94.5 -> "£94.50", 1250 -> "£1,250".
  function money(n) {
    var pence = Math.round(n * 100) % 100 !== 0;
    return "£" + n.toLocaleString("en-GB", { minimumFractionDigits: pence ? 2 : 0, maximumFractionDigits: pence ? 2 : 0 });
  }

  function roundUpHalf(h) {
    return Math.ceil(h * 2 - 1e-9) / 2;
  }

  function roundUpQuarter(h) {
    return Math.ceil(h * 4 - 1e-9) / 4;
  }

  function plural(n, words) {
    return n + " " + (n === 1 ? words[0] : words[1]);
  }

  function sizeLabel(beds) {
    return data.sizes[beds];
  }

  function bathLabel(baths) {
    return plural(baths, ["bathroom", "bathrooms"]);
  }

  /* ---------- Extras ---------- */

  // The extras that apply to a service: [{ id, name, note, cfg, included }].
  function extrasFor(service) {
    var out = [];
    data.extras.forEach(function (x) {
      var cfg = x[service];
      if (!cfg) {
        return;
      }
      out.push({
        id: x.id,
        name: (cfg !== "included" && cfg.name) || x.name,
        note: x.note,
        cfg: cfg,
        included: cfg === "included"
      });
    });
    return out;
  }

  // The chosen extras for this service, in data order: [{ id, name, cfg, count }].
  function chosenExtras(a) {
    return extrasFor(a.service).filter(function (x) {
      return !x.included && a.extras[x.id];
    }).map(function (x) {
      return { id: x.id, name: x.name, cfg: x.cfg, count: x.cfg.count ? a.extras[x.id] : 1 };
    });
  }

  function extraName(x) {
    if (x.cfg.count) {
      return x.name + ", " + plural(x.count, x.cfg.count.unit);
    }
    return x.name;
  }

  /* ---------- Answers <-> address ---------- */

  function clampInt(v, lo, hi, fallback) {
    var n = parseInt(v, 10);
    if (isNaN(n)) {
      return fallback;
    }
    return Math.min(hi, Math.max(lo, n));
  }

  function normalise(a) {
    var out = {
      service: data.services[a.service] ? a.service : DEFAULTS.service,
      beds: clampInt(a.beds, 0, 5, DEFAULTS.beds),
      baths: clampInt(a.baths, 1, 4, DEFAULTS.baths),
      freq: data.services.regular.rates[a.freq] ? a.freq : DEFAULTS.freq,
      furnished: !!a.furnished,
      unit: a.unit === "m2" ? "m2" : "desks",
      size: clampInt(a.size, 0, 2000, DEFAULTS.size),
      toilets: clampInt(a.toilets, 1, 4, DEFAULTS.toilets),
      visits: ["1", "2", "3", "5"].indexOf(String(a.visits)) !== -1 ? String(a.visits) : DEFAULTS.visits,
      extras: {}
    };
    var extras = a.extras || {};
    extrasFor(out.service).forEach(function (x) {
      if (x.included || !extras[x.id]) {
        return;
      }
      out.extras[x.id] = x.cfg.count ? clampInt(extras[x.id], 1, x.cfg.count.max, 1) : 1;
    });
    return out;
  }

  function fromParams(search) {
    var p = new URLSearchParams(search || "");
    var extras = {};
    (p.get("x") || "").split(",").forEach(function (part) {
      var bits = part.split(":");
      if (bits[0]) {
        extras[bits[0]] = bits[1] ? bits[1] : 1;
      }
    });
    return normalise({
      service: p.get("svc"),
      beds: p.get("beds"),
      baths: p.get("baths"),
      freq: p.get("freq"),
      furnished: p.get("furn") === "1",
      unit: p.get("unit"),
      size: p.get("size"),
      toilets: p.get("toilets"),
      visits: p.get("visits"),
      extras: extras
    });
  }

  // Only the answers that matter for the service go in the address.
  function toParams(a) {
    var p = new URLSearchParams();
    p.set("svc", a.service);
    if (a.service === "office") {
      p.set("unit", a.unit);
      p.set("size", String(a.size));
      p.set("toilets", String(a.toilets));
      p.set("visits", a.visits);
    } else {
      p.set("beds", String(a.beds));
      p.set("baths", String(a.baths));
      if (a.service === "regular") {
        p.set("freq", a.freq);
      } else if (a.furnished) {
        p.set("furn", "1");
      }
    }
    var x = chosenExtras(a).map(function (e) {
      return e.cfg.count ? e.id + ":" + e.count : e.id;
    });
    // Commas and colons are safe in a query string, and easier to read than %2C and %3A.
    return p.toString() + (x.length ? "&x=" + x.join(",") : "");
  }

  /* ---------- The sums ---------- */

  function row(label, value, kind) {
    return { label: label, value: value, kind: kind || "" };
  }

  function regular(a) {
    var svc = data.services.regular;
    var rate = svc.rates[a.freq];
    var oneoff = a.freq === "oneoff";
    var every = [];
    var first = [];

    var base = svc.hours[a.beds];
    every.push(row(sizeLabel(a.beds) + ", 1 bathroom", hours(base)));
    var h = base;
    if (a.baths > 1) {
      var bh = (a.baths - 1) * svc.extraBathroom;
      every.push(row(plural(a.baths - 1, ["extra bathroom", "extra bathrooms"]), "+" + hours(bh)));
      h += bh;
    }

    var onceHours = 0;
    var onceFixed = 0;
    var onceRows = [];
    chosenExtras(a).forEach(function (x) {
      var cfg = x.cfg;
      if (cfg.each) {
        onceFixed += cfg.each * x.count;
        onceRows.push(row(extraName(x), "+" + money(cfg.each * x.count)));
        return;
      }
      var add = cfg.perBedroom ? cfg.perBedroom * Math.max(1, a.beds) : cfg.hours * x.count;
      var label = cfg.perBedroom ? x.name + " (" + plural(Math.max(1, a.beds), ["bed", "beds"]) + ")" : extraName(x);
      if (cfg.once) {
        onceHours += add;
        onceRows.push(row(label, "+" + hours(add)));
      } else {
        h += add;
        every.push(row(label, "+" + hours(add)));
      }
    });

    var firstExtra = svc.firstClean[a.beds];
    var result = { service: "regular", rate: rate, oneoff: oneoff, sections: [] };

    if (oneoff) {
      var raw = h + firstExtra + onceHours;
      var total = roundUpHalf(Math.max(svc.minHours, raw));
      var rows = every.concat([row("First clean in your home", "+" + hours(firstExtra))], onceRows.filter(function (r) {
        return r.value.indexOf("£") === -1;
      }));
      if (total > raw) {
        rows.push(row(raw < svc.minHours ? "Shortest clean we book" : "Rounded up to the half hour", "+" + hours(total - raw), "muted"));
      }
      rows.push(row(hours(total) + " at " + money(rate) + " an hour", money(total * rate), "subtotal"));
      onceRows.forEach(function (r) {
        if (r.value.indexOf("£") !== -1) {
          rows.push(r);
        }
      });
      var price = total * rate + onceFixed;
      result.sections.push({ title: "One clean", rows: rows, total: row("Total", money(price)) });
      result.price = price;
      result.per = "for the clean";
      result.hours = total;
      result.crew = "one cleaner";
      result.first = null;
      result.hint = "Booking every two weeks? From then on it would be " + money(roundUpHalf(Math.max(svc.minHours, h)) * svc.rates.fortnightly) + " a visit.";
      return result;
    }

    var visitHours = roundUpHalf(Math.max(svc.minHours, h));
    if (visitHours > h) {
      every.push(row(h < svc.minHours ? "Shortest visit we book" : "Rounded up to the half hour", "+" + hours(visitHours - h), "muted"));
    }
    every.push(row("Rate (" + (a.freq === "weekly" ? "weekly" : "every two weeks") + ")", money(rate) + " an hour", "muted"));
    var visitPrice = visitHours * rate;
    result.sections.push({ title: "Every visit", rows: every, total: row(hours(visitHours) + " a visit", money(visitPrice)) });

    var firstRaw = visitHours + firstExtra + onceHours;
    var firstHours = roundUpHalf(firstRaw);
    var firstRows = [row("Your usual visit", hours(visitHours)), row("First clean in your home", "+" + hours(firstExtra))];
    onceRows.forEach(function (r) {
      if (r.value.indexOf("£") === -1) {
        firstRows.push(r);
      }
    });
    if (firstHours > firstRaw) {
      firstRows.push(row("Rounded up to the half hour", "+" + hours(firstHours - firstRaw), "muted"));
    }
    firstRows.push(row(hours(firstHours) + " at " + money(rate) + " an hour", money(firstHours * rate), "subtotal"));
    onceRows.forEach(function (r) {
      if (r.value.indexOf("£") !== -1) {
        firstRows.push(r);
      }
    });
    var firstPrice = firstHours * rate + onceFixed;
    result.sections.push({ title: "First visit only", rows: firstRows, total: row("First visit", money(firstPrice)) });

    result.price = visitPrice;
    result.per = "a visit";
    result.hours = visitHours;
    result.crew = "one cleaner";
    result.first = { price: firstPrice, hours: firstHours };
    result.hint = a.freq === "fortnightly"
      ? "Weekly would be " + money(visitHours * svc.rates.weekly) + " a visit (" + money(svc.rates.weekly) + " an hour)."
      : "You get our lowest rate: " + money(svc.rates.weekly) + " an hour instead of " + money(svc.rates.oneoff) + " for a one-off clean.";
    return result;
  }

  function tenancy(a) {
    var svc = data.services.tenancy;
    var rows = [];
    var price = svc.prices[a.beds];
    var team = svc.teamHours[a.beds];
    rows.push(row(sizeLabel(a.beds) + ", 1 bathroom", money(price)));
    if (a.baths > 1) {
      var n = a.baths - 1;
      price += n * svc.extraBathroom.price;
      team += n * svc.extraBathroom.hours;
      rows.push(row(plural(n, ["extra bathroom", "extra bathrooms"]), "+" + money(n * svc.extraBathroom.price)));
    }
    if (a.furnished) {
      price += svc.furnished.price;
      team += svc.furnished.hours;
      rows.push(row("Furnished (the furniture stays)", "+" + money(svc.furnished.price)));
    }
    chosenExtras(a).forEach(function (x) {
      var cost = x.cfg.each ? x.cfg.each * x.count : x.cfg.price;
      price += cost;
      team += x.cfg.hoursEach ? x.cfg.hoursEach * x.count : x.cfg.hours || 0;
      rows.push(row(extraName(x), "+" + money(cost)));
    });
    var included = extrasFor("tenancy").filter(function (x) {
      return x.included;
    }).map(function (x) {
      return x.name.replace(/^Inside /, "").replace(/^the /, "");
    });
    rows.push(row("Inside the " + included.slice(0, -1).join(", ") + " and " + included[included.length - 1], "Included", "muted"));

    var cleaners = svc.cleaners[a.beds];
    var onSite = roundUpHalf(team / cleaners);
    return {
      service: "tenancy",
      sections: [{ title: "Fixed price", rows: rows, total: row("Total", money(price)) }],
      price: price,
      per: "for the clean",
      hours: onSite,
      crew: plural(cleaners, ["cleaner", "cleaners"]),
      first: null,
      deposit: svc.deposit,
      hint: "A " + money(svc.deposit) + " deposit holds your date. It comes off the final bill."
    };
  }

  function office(a) {
    var svc = data.services.office;
    if (!a.size || a.size < 1) {
      return { service: "office", error: "Add the size of your office, in desks or square metres." };
    }
    var m2 = a.unit === "desks" ? a.size * svc.m2PerDesk : a.size;
    if (m2 > svc.maxM2) {
      return {
        service: "office",
        error: "For offices over " + svc.maxM2 + " m² (about " + Math.round(svc.maxM2 / svc.m2PerDesk) + " desks), we give a price after a short visit. Message us and we'll arrange one."
      };
    }
    var visits = +a.visits;
    var rate = visits >= svc.busyVisits ? svc.rates.busy : svc.rates.standard;
    var every = [];
    var sizeText = a.unit === "desks"
      ? plural(a.size, ["desk", "desks"]) + " (about " + m2 + " m²)"
      : m2 + " m² (about " + plural(Math.max(1, Math.round(m2 / svc.m2PerDesk)), ["desk", "desks"]) + ")";
    var base = roundUpQuarter(svc.baseHours + m2 / svc.m2PerHour);
    every.push(row(sizeText + ", 1 toilet", hours(base)));
    var h = base;
    if (a.toilets > 1) {
      var th = (a.toilets - 1) * svc.extraToilet;
      every.push(row(plural(a.toilets - 1, ["extra toilet", "extra toilets"]), "+" + hours(th)));
      h += th;
    }
    var visitHours = roundUpHalf(Math.max(svc.minHours, h));
    if (visitHours > h) {
      every.push(row(h < svc.minHours ? "Shortest visit we book" : "Rounded up to the half hour", "+" + hours(visitHours - h), "muted"));
    }
    var visitLabel = svc.visits.filter(function (v) {
      return v.id === a.visits;
    })[0].label;
    every.push(row("Rate (" + visitLabel.toLowerCase() + ")", money(rate) + " an hour", "muted"));
    var visitPrice = visitHours * rate;
    var perMonth = visits * 52 / 12;
    var monthPrice = Math.round(visitPrice * perMonth / 5) * 5;

    var sections = [{ title: "Every visit", rows: every, total: row(hours(visitHours) + " a visit", money(visitPrice)) }];

    var onceHours = 0;
    var onceFixed = 0;
    var firstRows = [row("Your usual visit", hours(visitHours))];
    chosenExtras(a).forEach(function (x) {
      if (x.cfg.each) {
        onceFixed += x.cfg.each * x.count;
        return;
      }
      onceHours += x.cfg.hours;
      firstRows.push(row(extraName(x), "+" + hours(x.cfg.hours)));
    });
    var first = null;
    if (onceHours || onceFixed) {
      var firstHours = roundUpHalf(visitHours + onceHours);
      firstRows.push(row(hours(firstHours) + " at " + money(rate) + " an hour", money(firstHours * rate), "subtotal"));
      chosenExtras(a).forEach(function (x) {
        if (x.cfg.each) {
          firstRows.push(row(extraName(x), "+" + money(x.cfg.each * x.count)));
        }
      });
      first = { price: firstHours * rate + onceFixed, hours: firstHours };
      sections.push({ title: "First visit only", rows: firstRows, total: row("First visit", money(first.price)) });
    }

    return {
      service: "office",
      sections: sections,
      price: visitPrice,
      per: "a visit",
      hours: visitHours,
      crew: "one cleaner",
      first: first,
      month: { price: monthPrice, visits: perMonth },
      hint: visits >= svc.busyVisits
        ? "Three or more visits a week get our lower rate of " + money(svc.rates.busy) + " an hour."
        : "Three or more visits a week drop the rate to " + money(svc.rates.busy) + " an hour."
    };
  }

  function estimate(a) {
    a = normalise(a);
    var r = a.service === "tenancy" ? tenancy(a) : a.service === "office" ? office(a) : regular(a);
    r.answers = a;
    return r;
  }

  /* ---------- Words for messages ---------- */

  // "Regular home clean, every two weeks"
  function serviceLine(a) {
    if (a.service === "regular") {
      var f = data.services.regular.frequencies.filter(function (x) {
        return x.id === a.freq;
      })[0];
      return a.freq === "oneoff" ? "One-off home clean" : "Regular home clean, " + f.label.toLowerCase();
    }
    if (a.service === "office") {
      var v = data.services.office.visits.filter(function (x) {
        return x.id === a.visits;
      })[0];
      return "Office clean, " + v.label.toLowerCase();
    }
    return "End-of-tenancy clean";
  }

  // "2 bedrooms, 1 bathroom" or "12 desks (about 96 m²), 2 toilets"
  function sizeLine(a) {
    if (a.service === "office") {
      var svc = data.services.office;
      var m2 = a.unit === "desks" ? a.size * svc.m2PerDesk : a.size;
      var s = a.unit === "desks" ? plural(a.size, ["desk", "desks"]) + " (about " + m2 + " m²)" : m2 + " m²";
      return s + ", " + plural(a.toilets, ["toilet", "toilets"]);
    }
    var bits = [sizeLabel(a.beds), bathLabel(a.baths)];
    if (a.service === "tenancy" && a.furnished) {
      bits.push("furnished");
    }
    return bits.join(", ");
  }

  // "Inside the oven (first visit), Change the bed linen" or "".
  function extrasLine(a) {
    return chosenExtras(a).map(function (x) {
      return extraName(x) + (x.cfg.once && a.service !== "tenancy" && !(a.service === "regular" && a.freq === "oneoff") ? " (first visit)" : "");
    }).join(", ");
  }

  // "£94.50 a visit (3½ hours). First visit £218.50 (5½ hours)."
  function priceLine(r) {
    if (r.error) {
      return "";
    }
    var s = money(r.price) + (r.per === "a visit" ? " a visit" : "") + " (" + (r.service === "tenancy" ? r.crew + ", about " + hours(r.hours) : hours(r.hours)) + ")";
    if (r.month) {
      s += ", about " + money(r.month.price) + " a month";
    }
    if (r.first) {
      s += ". First visit " + money(r.first.price) + " (" + hours(r.first.hours) + ")";
    }
    return s;
  }

  window.TesselPrice = {
    defaults: function () {
      return normalise(DEFAULTS);
    },
    normalise: normalise,
    extrasFor: extrasFor,
    fromParams: fromParams,
    toParams: toParams,
    estimate: estimate,
    hours: hours,
    money: money,
    plural: plural,
    serviceLine: serviceLine,
    sizeLine: sizeLine,
    extrasLine: extrasLine,
    priceLine: priceLine
  };
})();
