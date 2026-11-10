/* The estimate engine: postcode lookups, distances and the price of a move. No page code here, so the quote
   page, the booking page, the area checker and the home page all work the price out the same way.
   Distances come from the middle of each postcode district, so they are estimates, not routes. */
(function () {
  var D = window.HT;
  var P = window.HTPostcodes || { districts: {}, areas: {} };

  /* ---------- Postcodes ---------- */

  // "n7 6ab", "N76AB" and "N7" all become "N7". Returns "" for anything that isn't a UK outward code.
  function outward(input) {
    var s = String(input || "").toUpperCase().replace(/[^A-Z0-9 ]/g, " ").trim();
    if (!s) {
      return "";
    }
    var parts = s.split(/\s+/);
    var code = parts[0];
    if (parts.length === 1 && code.length >= 5 && /\d[A-Z]{2}$/.test(code)) {
      code = code.slice(0, -3);
    }
    return /^[A-Z]{1,2}\d[A-Z\d]?$/.test(code) ? code : "";
  }

  // Areas (N, SE, AL ...) that have districts in our list. A typo inside one of these is not "somewhere
  // in the area": it is a district we don't know.
  var covered = {};
  Object.keys(P.districts).forEach(function (k) {
    covered[k.replace(/\d.*$/, "")] = true;
  });

  // { code, e, n, how: "district" | "area" } or null. e and n are British National Grid kilometres.
  function lookup(input) {
    var code = outward(input);
    if (!code) {
      return null;
    }
    var d = P.districts[code];
    if (d) {
      return { code: code, e: d[0], n: d[1], how: "district" };
    }
    // W1, EC1, SW1 and WC1 are split into W1B, EC1A and so on: use the middle of the parts.
    var parts = Object.keys(P.districts).filter(function (k) {
      return k.length === code.length + 1 && k.indexOf(code) === 0 && /[A-Z]$/.test(k);
    });
    if (parts.length) {
      var e = 0;
      var n = 0;
      parts.forEach(function (k) {
        e += P.districts[k][0];
        n += P.districts[k][1];
      });
      return { code: code, e: e / parts.length, n: n / parts.length, how: "district" };
    }
    var letters = code.replace(/\d.*$/, "");
    var a = P.areas[letters];
    if (a && !covered[letters]) {
      return { code: code, e: a[0], n: a[1], how: "area", area: letters };
    }
    return null;
  }

  // The National Grid is flat and in kilometres, so this is Pythagoras, then kilometres to miles.
  function straightMiles(a, b) {
    var de = b.e - a.e;
    var dn = b.n - a.n;
    return Math.sqrt(de * de + dn * dn) / 1.609344;
  }

  // Straight line to road miles: roads wind more in town than on a motorway run.
  function roadMiles(straight) {
    var f = D.roadFactor;
    var k;
    if (straight <= f.nearUpTo) {
      k = f.near;
    } else if (straight >= f.farFrom) {
      k = f.far;
    } else {
      k = f.near + (f.far - f.near) * (straight - f.nearUpTo) / (f.farFrom - f.nearUpTo);
    }
    // Even a move round the corner means a mile of loading up and parking again.
    return Math.max(1, straight * k);
  }

  function driveHours(miles) {
    var left = miles;
    var hours = 0;
    D.speeds.forEach(function (s) {
      var part = Math.min(left, s[0]);
      if (part > 0) {
        hours += part / s[1];
        left -= part;
      }
    });
    return hours;
  }

  function base() {
    return lookup(D.base);
  }

  function ringFor(place) {
    var miles = straightMiles(base(), place);
    for (var i = 0; i < D.rings.length; i++) {
      if (miles <= D.rings[i].upTo) {
        return { ring: D.rings[i], miles: miles };
      }
    }
    return { ring: D.rings[D.rings.length - 1], miles: miles };
  }

  // "SE15: across London, about 6 miles from our yard". Districts are shown by code only.
  function placeLine(place) {
    var r = ringFor(place);
    var miles = Math.max(1, Math.round(r.miles));
    var where = { home: "in our home patch", london: "across London", outer: "outer London", far: "a longer move" }[r.ring.id];
    if (place.code === D.base) {
      return place.code + ": " + where + ", where our yard is";
    }
    return place.code + ": " + where + ", about " + miles + (miles === 1 ? " mile" : " miles") + " from our yard" + (place.how === "area" ? " (from the middle of the " + place.area + " area)" : "");
  }

  function inCongestionZone(code) {
    return new RegExp(D.congestion.zone).test(code);
  }

  /* ---------- Money ---------- */

  function money(n) {
    var r = Math.round(n);
    return "£" + r.toLocaleString("en-GB");
  }

  function moneyExact(n) {
    return "£" + n.toLocaleString("en-GB", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  }

  function hoursText(h) {
    var whole = Math.floor(h);
    var mins = Math.round((h - whole) * 60);
    if (mins === 60) {
      whole += 1;
      mins = 0;
    }
    if (!whole) {
      return mins + " min";
    }
    return whole + (whole === 1 ? " hour" : " hours") + (mins ? " " + mins + " min" : "");
  }

  // "4 h 30 min", "41 min": for breakdown lines and chips, where space is short.
  function hoursShort(h) {
    var whole = Math.floor(h);
    var mins = Math.round((h - whole) * 60);
    if (mins === 60) {
      whole += 1;
      mins = 0;
    }
    if (!whole) {
      return mins + " min";
    }
    return whole + " h" + (mins ? " " + mins + " min" : "");
  }

  function ratePerHour(vanKey, crew) {
    return D.vans[vanKey].perHour + crew * D.moverPerHour;
  }

  function crewText(vanKey, crew) {
    return D.vans[vanKey].name + " and " + crew + (crew === 1 ? " mover" : " movers");
  }

  /* ---------- The load ---------- */

  var vanOrder = ["small", "lwb", "luton", "lorry", "fleet"];

  function vanFor(volume, atLeast) {
    var start = Math.max(0, vanOrder.indexOf(atLeast || "small"));
    for (var i = start; i < vanOrder.length; i++) {
      if (volume <= D.vans[vanOrder[i]].capacity) {
        return vanOrder[i];
      }
    }
    return "fleet";
  }

  var itemIndex = {};
  D.itemGroups.forEach(function (g) {
    g.items.forEach(function (it) {
      itemIndex[it.id] = it;
    });
  });

  // Volume, handling hours, van and crew for the move, from rooms or from an item list.
  function load(input) {
    if (input.mode === "items") {
      var volume = 0;
      var mins = 0;
      var heavy = false;
      var count = 0;
      Object.keys(input.items || {}).forEach(function (id) {
        var it = itemIndex[id];
        var n = Math.max(0, Math.floor(+input.items[id] || 0));
        if (!it || !n) {
          return;
        }
        count += n;
        volume += it.volume * n;
        mins += it.mins * n;
        heavy = heavy || !!it.heavy;
      });
      if (!count) {
        return null;
      }
      var crew = volume > D.threeMoversOver ? 3 : heavy || volume > D.oneMoverUpTo ? 2 : 1;
      var van = vanFor(volume);
      crew = Math.max(crew, D.vans[van].minCrew);
      // Two people load faster than one: minutes are for the crew the item needs.
      var hours = (mins * 2 + D.itemSetupMins) / 60;
      return { volume: volume, hours: hours, van: van, crew: crew, count: count, label: count + (count === 1 ? " item" : " items") };
    }
    var size = D.sizes[input.size];
    if (!size) {
      return null;
    }
    var full = D.fullness[input.fullness] || D.fullness.average;
    var vol = size.volume * full.mult;
    var vanKey = vanFor(vol, size.van);
    var crewN = Math.max(size.crew, D.vans[vanKey].minCrew);
    return { volume: vol, hours: size.hours * full.mult, van: vanKey, crew: crewN, size: size, label: size.name };
  }

  /* ---------- Distance ---------- */

  // Road miles between the two addresses, plus how far each is from the yard.
  // Returns { ok, miles, minMiles, maxMiles, from, to, fromRing, toRing, source, problem }.
  function route(input) {
    if (input.distanceMode === "band") {
      var band = null;
      D.bands.forEach(function (b) {
        if (b.id === input.band) {
          band = b;
        }
      });
      if (!band) {
        return { ok: false, problem: "band" };
      }
      return { ok: true, source: "band", band: band, minMiles: band.min, maxMiles: band.max, miles: (band.min + band.max) / 2 };
    }
    var from = lookup(input.from);
    var to = lookup(input.to);
    if (!from || !to) {
      return { ok: false, problem: !from ? "from" : "to", from: from, to: to };
    }
    var miles = roadMiles(straightMiles(from, to));
    return {
      ok: true,
      source: from.how === "area" || to.how === "area" ? "area" : "district",
      from: from,
      to: to,
      fromRing: ringFor(from),
      toRing: ringFor(to),
      miles: miles,
      minMiles: miles,
      maxMiles: miles
    };
  }

  /* ---------- The estimate ---------- */

  function accessShare(end) {
    end = end || {};
    var floor = Math.max(0, +end.floor || 0);
    var share = 0;
    if (floor > 0) {
      share += end.lift ? D.liftExtra : D.stairsPerFloor * floor;
    }
    D.parking.forEach(function (p) {
      if (p.id === end.parking) {
        share += p.time;
      }
    });
    return share;
  }

  function parkingFee(end) {
    var fee = 0;
    var line = "";
    D.parking.forEach(function (p) {
      if (p.id === (end || {}).parking) {
        fee = p.fee;
        line = p.line || "";
      }
    });
    return { fee: fee, line: line };
  }

  function dayInfo(day) {
    if (day === "bank") {
      return { name: "a bank holiday", mult: D.bankHolidayMult };
    }
    if (day === undefined || day === null || day === "" || day === "any") {
      return { name: "", mult: 1 };
    }
    return D.days[day] || { name: "", mult: 1 };
  }

  function roundUp(h) {
    return Math.max(D.minimumHours, Math.ceil(h / D.roundTo - 1e-9) * D.roundTo);
  }

  // One full price at a given road distance. Lines are [label, amount, detail].
  function priceAt(input, ld, rt, miles) {
    var rate = ratePerHour(ld.van, ld.crew);
    var drive = driveHours(miles);
    var access = ld.hours / 2 * (accessShare(input.pickup) + accessShare(input.dropoff));
    var raw = ld.hours + drive + access;
    var hours = roundUp(raw);
    var day = dayInfo(input.day);
    var labour = hours * rate;
    var lines = [];
    var extras = [];
    var total = labour;

    var dayExtra = labour * (day.mult - 1);
    total += dayExtra;

    // Getting the van to the first address, and back from the last one.
    var LDp = D.longDistance;
    var travel = 0;
    var travelLabel = "";
    var emptyMiles = 0;
    var emptyHours = 0;
    if (rt.source === "band") {
      var assumed = D.rings[1];
      travel = assumed.travelFee;
      travelLabel = "Travel to you (we've assumed London)";
      if (miles > D.rings[2].upTo * D.roadFactor.far) {
        emptyMiles += miles;
      }
    } else {
      if (rt.fromRing.ring.travelFee === null) {
        emptyMiles += roadMiles(rt.fromRing.miles);
        travelLabel = "Driving out to " + rt.from.code;
      } else {
        travel = rt.fromRing.ring.travelFee;
        travelLabel = "Travel to you (" + rt.fromRing.ring.name.charAt(0).toLowerCase() + rt.fromRing.ring.name.slice(1) + ")";
      }
      if (rt.toRing.ring.travelFee === null) {
        emptyMiles += roadMiles(rt.toRing.miles);
      }
    }
    total += travel;
    var emptyCost = 0;
    if (emptyMiles) {
      emptyHours = driveHours(emptyMiles);
      emptyCost = emptyHours * rate * LDp.emptyLegRate;
      total += emptyCost;
    }
    var fuelMiles = (miles > LDp.overMiles ? miles : 0) + (emptyMiles > LDp.overMiles ? emptyMiles : 0);
    var fuel = fuelMiles * LDp.fuelPerMile;
    total += fuel;
    var overnight = Math.max(miles, emptyMiles) > LDp.overnightOverMiles ? ld.crew * LDp.overnightPerMover : 0;
    total += overnight;

    // Parking at each end.
    var parkFrom = parkingFee(input.pickup);
    var parkTo = parkingFee(input.dropoff);
    var parking = parkFrom.fee + parkTo.fee;
    total += parking;

    var congestion = 0;
    if (rt.source !== "band" && (inCongestionZone(rt.from.code) || inCongestionZone(rt.to.code))) {
      congestion = D.congestion.charge;
      total += congestion;
    }

    // Packing, dismantling and specials.
    var packing = 0;
    var packingName = "";
    if (input.packing && input.packing !== "none") {
      var table = input.mode === "items" ? D.packingPrices.items : D.packingPrices[input.size];
      if (table && table[input.packing]) {
        packing = table[input.packing];
        packingName = D.packing[input.packing].name;
        total += packing;
        extras.push(["Packing: " + packingName.toLowerCase(), packing]);
      }
    }
    D.dismantle.forEach(function (d) {
      var n = Math.max(0, Math.floor(+((input.dismantle || {})[d.id]) || 0));
      if (n) {
        total += n * d.price;
        extras.push(["Take apart and rebuild: " + n + " " + (n === 1 ? d.one : d.many), n * d.price]);
      }
    });
    D.specials.forEach(function (s) {
      var n = Math.max(0, Math.floor(+((input.specials || {})[s.id]) || 0));
      if (n) {
        total += n * s.price;
        extras.push([n + " " + (n === 1 ? s.one : s.many), n * s.price]);
      }
    });

    lines.push(["Van and crew, " + hoursShort(hours), labour, crewText(ld.van, ld.crew) + " at " + money(rate) + " an hour. Loading and unloading " + hoursShort(ld.hours) + ", driving " + hoursShort(drive) + (access >= 0.05 ? ", stairs and carrying " + hoursShort(access) : "") + (raw < D.minimumHours - 0.05 ? ", " + D.minimumHours + "-hour minimum" : hours > raw + 0.05 ? ", rounded up to the half hour" : "") + "."]);
    if (dayExtra) {
      lines.push([day.name.charAt(0).toUpperCase() + day.name.slice(1) + " rate (+" + Math.round((day.mult - 1) * 100) + "%)", dayExtra, ""]);
    }
    if (travelLabel && (travel || !emptyMiles)) {
      lines.push([travelLabel, travel, ""]);
    }
    if (emptyCost) {
      lines.push(["Empty van to and from our yard", emptyCost, hoursText(emptyHours) + " at half rate"]);
    }
    if (fuel) {
      lines.push(["Fuel and road costs", fuel, Math.round(fuelMiles) + " miles × " + moneyExact(LDp.fuelPerMile)]);
    }
    if (overnight) {
      lines.push(["Overnight stay for the crew", overnight, ld.crew + " × " + money(LDp.overnightPerMover)]);
    }
    if (parkFrom.fee) {
      lines.push([parkFrom.line + ", pickup", parkFrom.fee, ""]);
    }
    if (parkTo.fee) {
      lines.push([parkTo.line + ", drop-off", parkTo.fee, ""]);
    }
    if (congestion) {
      lines.push(["Congestion Charge", congestion, "passed on at cost"]);
    }
    extras.forEach(function (e) {
      lines.push([e[0], e[1], ""]);
    });

    return { total: total, hours: hours, rate: rate, drive: drive, lines: lines, day: day, packing: packing, packingName: packingName };
  }

  function roundDown5(n) {
    return Math.floor(n / 5) * 5;
  }

  function roundUp5(n) {
    return Math.ceil(n / 5) * 5;
  }

  // The whole estimate. Returns { ok: false, problem } when something is missing.
  function estimate(input) {
    var ld = load(input);
    if (!ld) {
      return { ok: false, problem: input.mode === "items" ? "items" : "size" };
    }
    var rt = route(input);
    if (!rt.ok) {
      return { ok: false, problem: rt.problem, route: rt };
    }
    var lo = priceAt(input, ld, rt, rt.minMiles);
    var hi = rt.maxMiles !== rt.minMiles ? priceAt(input, ld, rt, rt.maxMiles) : lo;
    var mid = rt.maxMiles !== rt.minMiles ? priceAt(input, ld, rt, rt.miles) : lo;
    var notes = [];
    if (rt.source === "band") {
      notes.push("Distance from the band you picked (" + rt.band.detail + "), so the range is wider.");
    } else if (rt.source === "area") {
      notes.push("We only know the postcode area for " + (rt.from.how === "area" ? rt.from.code : rt.to.code) + ", so the distance is rougher.");
    }
    if (ld.size && ld.size.survey) {
      notes.push("For a move this size we'd like a quick video walk-round before we fix the price.");
    }
    if (rt.miles > 150) {
      notes.push("Over 150 miles we usually agree a fixed price instead.");
    }
    if (input.mode === "items" && ld.crew === 1) {
      notes.push("One mover does the lifting. Anything heavy needs a second pair of hands: add it and we'll send two.");
    }
    return {
      ok: true,
      load: ld,
      route: rt,
      van: D.vans[ld.van],
      crew: ld.crew,
      hours: mid.hours,
      rate: mid.rate,
      lines: mid.lines,
      day: mid.day,
      total: mid.total,
      low: roundDown5(lo.total * 0.92),
      high: roundUp5(hi.total * 1.1),
      notes: notes
    };
  }

  /* ---------- Sharing a move between pages ---------- */

  function pairs(obj) {
    return Object.keys(obj || {}).filter(function (k) {
      return +obj[k] > 0;
    }).map(function (k) {
      return k + ":" + Math.floor(+obj[k]);
    }).join(",");
  }

  function unpairs(text) {
    var out = {};
    String(text || "").split(",").forEach(function (part) {
      var kv = part.split(":");
      var n = Math.floor(+kv[1]);
      if (kv[0] && n > 0) {
        out[kv[0]] = Math.min(99, n);
      }
    });
    return out;
  }

  // The move as URL parameters, so the quote can be shared and handed to the booking page.
  function toParams(input) {
    var q = new URLSearchParams();
    q.set("mode", input.mode);
    if (input.mode === "items") {
      q.set("items", pairs(input.items));
    } else {
      q.set("size", input.size);
      q.set("full", input.fullness);
    }
    if (input.distanceMode === "band") {
      q.set("band", input.band || "");
    }
    if (input.from) {
      q.set("from", outward(input.from) || input.from);
    }
    if (input.to) {
      q.set("to", outward(input.to) || input.to);
    }
    q.set("pf", input.pickup.floor);
    q.set("pl", input.pickup.lift ? 1 : 0);
    q.set("pp", input.pickup.parking);
    q.set("df", input.dropoff.floor);
    q.set("dl", input.dropoff.lift ? 1 : 0);
    q.set("dp", input.dropoff.parking);
    q.set("day", input.day);
    q.set("pack", input.packing);
    if (pairs(input.dismantle)) {
      q.set("dis", pairs(input.dismantle));
    }
    if (pairs(input.specials)) {
      q.set("sp", pairs(input.specials));
    }
    return q;
  }

  function pick(value, allowed, fallback) {
    return allowed.indexOf(value) >= 0 ? value : fallback;
  }

  function fromParams(q) {
    var parkingIds = D.parking.map(function (p) {
      return p.id;
    });
    var floorIds = D.floors.map(function (f) {
      return String(f.id);
    });
    var dayIds = Object.keys(D.days).concat(["any"]);
    var mode = q.get("mode") === "items" ? "items" : "rooms";
    return {
      mode: mode,
      size: pick(q.get("size"), D.sizeOrder, "bed1"),
      fullness: pick(q.get("full"), Object.keys(D.fullness), "average"),
      items: unpairs(q.get("items")),
      from: outward(q.get("from")) || "",
      to: outward(q.get("to")) || "",
      distanceMode: q.has("band") ? "band" : "postcodes",
      band: q.get("band") || "",
      pickup: { floor: +pick(q.get("pf"), floorIds, "0"), lift: q.get("pl") === "1", parking: pick(q.get("pp"), parkingIds, "easy") },
      dropoff: { floor: +pick(q.get("df"), floorIds, "0"), lift: q.get("dl") === "1", parking: pick(q.get("dp"), parkingIds, "easy") },
      day: pick(q.get("day"), dayIds, "any"),
      packing: pick(q.get("pack"), Object.keys(D.packing), "none"),
      dismantle: unpairs(q.get("dis")),
      specials: unpairs(q.get("sp"))
    };
  }

  function floorText(end) {
    var f = D.floors.filter(function (x) {
      return x.id === +end.floor;
    })[0] || D.floors[0];
    if (!f.id) {
      return "ground floor or a house";
    }
    return f.name + (end.lift ? ", with a lift" : ", no lift");
  }

  function parkingText(end) {
    var p = D.parking.filter(function (x) {
      return x.id === end.parking;
    })[0] || D.parking[0];
    return p.says;
  }

  function itemsText(items) {
    var out = [];
    D.itemGroups.forEach(function (g) {
      g.items.forEach(function (it) {
        if (items[it.id]) {
          out.push(items[it.id] + " × " + it.name.charAt(0).toLowerCase() + it.name.slice(1));
        }
      });
    });
    return out.join(", ");
  }

  // Plain lines describing the move, for WhatsApp and email messages.
  function describe(input, r) {
    var lines = [];
    if (input.mode === "items") {
      lines.push("Items: " + (itemsText(input.items) || "none yet"));
    } else {
      lines.push("Move: " + D.sizes[input.size].name + " (" + D.fullness[input.fullness].name.split(":")[0].toLowerCase() + ")");
    }
    var from = lookup(input.from);
    var to = lookup(input.to);
    lines.push("From: " + ((from && from.code) || input.from || "not given") + ", " + floorText(input.pickup) + ". Parking: " + parkingText(input.pickup));
    lines.push("To: " + ((to && to.code) || input.to || "not given") + ", " + floorText(input.dropoff) + ". Parking: " + parkingText(input.dropoff));
    if (r && r.ok) {
      lines.push(r.route.source === "band" ? "Distance: " + r.route.band.detail + " (my guess)" : "Distance: about " + Math.max(1, Math.round(r.route.miles)) + " miles by road (estimated)");
    }
    var day = D.days[input.day];
    lines.push("Day: " + (day ? day.name : "not sure yet"));
    if (input.packing && input.packing !== "none") {
      lines.push("Packing: " + D.packing[input.packing].name.toLowerCase());
    }
    var extras = [];
    D.dismantle.forEach(function (d) {
      if ((input.dismantle || {})[d.id]) {
        var n = input.dismantle[d.id];
        extras.push(n + " " + (n === 1 ? d.one : d.many) + " to take apart and rebuild");
      }
    });
    D.specials.forEach(function (sp) {
      if ((input.specials || {})[sp.id]) {
        var n = input.specials[sp.id];
        extras.push(n + " " + (n === 1 ? sp.one : sp.many));
      }
    });
    if (extras.length) {
      lines.push("Extras: " + extras.join("; "));
    }
    if (r && r.ok) {
      lines.push("Online estimate: " + money(r.low) + " to " + money(r.high) + " (" + crewText(r.load.van, r.crew) + ", about " + hoursText(r.hours) + ")");
    }
    return lines;
  }

  window.HTEstimate = {
    toParams: toParams,
    fromParams: fromParams,
    describe: describe,
    itemsText: itemsText,
    floorText: floorText,
    parkingText: parkingText,
    outward: outward,
    lookup: lookup,
    straightMiles: straightMiles,
    roadMiles: roadMiles,
    driveHours: driveHours,
    ringFor: ringFor,
    placeLine: placeLine,
    base: base,
    inCongestionZone: inCongestionZone,
    ratePerHour: ratePerHour,
    crewText: crewText,
    estimate: estimate,
    money: money,
    moneyExact: moneyExact,
    hoursText: hoursText,
    hoursShort: hoursShort
  };
})();
