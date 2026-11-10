/* The order: what is in the basket, delivery or collection, the postcode, prices, delivery areas and the
   order message. Every page loads it, so the basket follows the visitor from page to page.

   The basket is kept in this browser's local storage (on the visitor's own device) until the order is sent
   or cleared. Nothing goes to this website: the order leaves as a WhatsApp message (or email) that the
   visitor sends themselves. */
(function () {
  var data = window.Kor;
  var H = window.KorHours;
  var KEY = "kor-order-v1";
  var listeners = [];

  var index = {};
  data.menu.forEach(function (cat) {
    cat.items.forEach(function (item) {
      index[item.id] = { item: item, cat: cat };
    });
  });

  function money(n) {
    return "£" + (Math.round(n * 100) / 100).toFixed(2);
  }

  function find(id) {
    return index[id] ? index[id].item : null;
  }

  function category(id) {
    return index[id] ? index[id].cat : null;
  }

  /* ---------- Options and prices ---------- */

  // The item's option groups: [{ id, def }].
  function groups(item) {
    return (item.options || []).map(function (gid) {
      return { id: gid, def: data.groups[gid] };
    });
  }

  function choiceOf(def, id) {
    return def.choices.filter(function (c) {
      return c.id === id;
    })[0] || null;
  }

  // A group with showIf: [group, choice] shows only when that choice is picked, and only if the item has
  // that group at all (lamb chops come on a plate, so their side group always shows).
  function shown(item, def, choices) {
    if (!def.showIf || (item.options || []).indexOf(def.showIf[0]) === -1) {
      return true;
    }
    return choices[def.showIf[0]] === def.showIf[1];
  }

  function defaults(item) {
    var out = {};
    groups(item).forEach(function (g) {
      out[g.id] = g.def.type === "many" ? [] : (g.def["default"] || g.def.choices[0].id);
    });
    return out;
  }

  // Fills in anything missing or unknown with the defaults, and drops groups that do not apply.
  function clean(item, choices) {
    var out = defaults(item);
    choices = choices || {};
    groups(item).forEach(function (g) {
      var v = choices[g.id];
      if (g.def.type === "many") {
        out[g.id] = (Array.isArray(v) ? v : []).filter(function (id) {
          return !!choiceOf(g.def, id);
        });
      } else if (v && choiceOf(g.def, v)) {
        out[g.id] = v;
      }
    });
    groups(item).forEach(function (g) {
      if (!shown(item, g.def, out)) {
        delete out[g.id];
      }
    });
    return out;
  }

  // The choices that apply, in menu order: [{ group, def, choice }].
  function picked(item, choices) {
    var out = [];
    groups(item).forEach(function (g) {
      if (!(g.id in choices)) {
        return;
      }
      var v = choices[g.id];
      (Array.isArray(v) ? v : [v]).forEach(function (id) {
        var c = choiceOf(g.def, id);
        if (c) {
          out.push({ group: g.id, def: g.def, choice: c });
        }
      });
    });
    return out;
  }

  function unitPrice(item, choices) {
    return picked(item, choices).reduce(function (sum, p) {
      return sum + (p.choice.add || 0);
    }, item.price);
  }

  // "plate, with bulgur, hot, + grilled halloumi"
  function describe(item, choices) {
    return picked(item, choices).map(function (p) {
      return p.choice.say === undefined ? p.choice.label.toLowerCase() : p.choice.say;
    }).filter(Boolean).join(", ");
  }

  // The dish's allergens with these choices, in the order of the legal list.
  function allergens(item, choices) {
    var set = {};
    (item.allergens || []).forEach(function (a) {
      set[a] = true;
    });
    if (choices) {
      picked(item, choices).forEach(function (p) {
        (p.choice.allergens || []).forEach(function (a) {
          set[a] = true;
        });
      });
    }
    return data.allergens.filter(function (a) {
      return set[a.id];
    });
  }

  // Allergens that only some choices add: [{ allergen, because: ["Melted cheese", ...] }].
  function optionalAllergens(item) {
    var base = {};
    (item.allergens || []).forEach(function (a) {
      base[a] = true;
    });
    var extra = {};
    groups(item).forEach(function (g) {
      g.def.choices.forEach(function (c) {
        (c.allergens || []).forEach(function (a) {
          if (!base[a]) {
            (extra[a] = extra[a] || []).push(c.label);
          }
        });
      });
    });
    return data.allergens.filter(function (a) {
      return extra[a.id];
    }).map(function (a) {
      return { allergen: a, because: extra[a.id] };
    });
  }

  /* ---------- Postcodes and delivery areas ---------- */

  // "nw6 7ab" -> { valid: true, full: "NW6 7AB", district: "NW6", area }. A district on its own ("NW6")
  // is valid too, with full = "".
  function postcode(text) {
    var s = String(text || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    var m = /^([A-Z]{1,2}[0-9][0-9A-Z]?)([0-9][A-Z]{2})$/.exec(s);
    var district = "";
    var full = "";
    if (m) {
      district = m[1];
      full = m[1] + " " + m[2];
    } else if (/^[A-Z]{1,2}[0-9][0-9A-Z]?$/.test(s)) {
      district = s;
    } else {
      return { valid: false, text: s, district: "", full: "", area: null };
    }
    return { valid: true, text: s, district: district, full: full, area: areaFor(district) };
  }

  function areaFor(district) {
    return data.delivery.filter(function (a) {
      return a.district === district;
    })[0] || null;
  }

  function minutes(range) {
    return range[0] + " to " + range[1] + " minutes";
  }

  /* ---------- The basket ---------- */

  var state = load();

  function blank() {
    return { lines: [], mode: "delivery", postcode: "" };
  }

  function load() {
    var s = blank();
    try {
      var raw = window.localStorage.getItem(KEY);
      var saved = raw ? JSON.parse(raw) : null;
      if (saved && typeof saved === "object") {
        s.mode = saved.mode === "collection" ? "collection" : "delivery";
        s.postcode = typeof saved.postcode === "string" ? saved.postcode.slice(0, 10) : "";
        (Array.isArray(saved.lines) ? saved.lines : []).forEach(function (l) {
          var item = l && find(l.id);
          var qty = Math.floor(+l.qty);
          if (item && qty > 0) {
            s.lines.push({ id: item.id, qty: Math.min(qty, 20), choices: clean(item, l.choices) });
          }
        });
      }
    } catch (e) {
      // Private windows and blocked storage: the basket simply starts empty.
    }
    return s;
  }

  function save() {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      // Not saved: the basket still works until the page is left.
    }
    listeners.forEach(function (fn) {
      fn(state);
    });
  }

  function sameChoices(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  function add(id, choices, qty) {
    var item = find(id);
    if (!item) {
      return;
    }
    choices = clean(item, choices);
    qty = Math.max(1, Math.min(20, qty || 1));
    var line = state.lines.filter(function (l) {
      return l.id === id && sameChoices(l.choices, choices);
    })[0];
    if (line) {
      line.qty = Math.min(20, line.qty + qty);
    } else {
      state.lines.push({ id: id, qty: qty, choices: choices });
    }
    save();
  }

  function setQty(i, qty) {
    if (!state.lines[i]) {
      return;
    }
    if (qty <= 0) {
      state.lines.splice(i, 1);
    } else {
      state.lines[i].qty = Math.min(20, qty);
    }
    save();
  }

  function clear() {
    state.lines = [];
    save();
  }

  function setMode(mode) {
    state.mode = mode === "collection" ? "collection" : "delivery";
    save();
  }

  function setPostcode(text) {
    state.postcode = String(text || "").trim().toUpperCase().slice(0, 10);
    save();
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  function lineTotal(line) {
    var item = find(line.id);
    return unitPrice(item, line.choices) * line.qty;
  }

  function count() {
    return state.lines.reduce(function (n, l) {
      return n + l.qty;
    }, 0);
  }

  /* Totals and whether the order can go: problem is "", "empty", "postcode" (none yet or not valid),
     "outside" (we do not deliver there) or "minimum" (short of the area's minimum, by short pounds). */
  function totals() {
    var subtotal = state.lines.reduce(function (sum, l) {
      return sum + lineTotal(l);
    }, 0);
    subtotal = Math.round(subtotal * 100) / 100;
    var pc = postcode(state.postcode);
    var delivery = state.mode === "delivery";
    var area = delivery && pc.valid ? pc.area : null;
    var fee = area ? area.fee : 0;
    var problem = "";
    var short = 0;
    if (!state.lines.length) {
      problem = "empty";
    } else if (delivery && !pc.valid) {
      problem = "postcode";
    } else if (delivery && !area) {
      problem = "outside";
    } else if (delivery && subtotal < area.min) {
      problem = "minimum";
      short = Math.round((area.min - subtotal) * 100) / 100;
    }
    return {
      count: count(),
      subtotal: subtotal,
      fee: fee,
      total: subtotal + fee,
      mode: state.mode,
      postcode: pc,
      area: area,
      ready: delivery ? (area ? area.time : null) : data.collectionMinutes,
      problem: problem,
      short: short
    };
  }

  /* ---------- The order message ---------- */

  // details: { name, address, postcode (full), when: Date or null for as soon as possible, pay, notes },
  // times: what KorHours.orderTimes returned when the form was filled in.
  function message(details, times) {
    var t = totals();
    var delivery = t.mode === "delivery";
    var lines = ["Hi " + data.short + ", I'd like to order for " + (delivery ? "DELIVERY" : "COLLECTION") + "."];
    lines.push("");
    if (times.preorder) {
      lines.push("PRE-ORDER: sent while you were closed.");
      lines.push("Wanted: " + (details.when ? H.slotLong(details.when, times.session) :
        "as soon as you open, " + H.slotLong(times.session.start, times.session)));
    } else if (details.when) {
      lines.push("Wanted: " + H.slotLabel(details.when, times.session));
    } else {
      lines.push("Wanted: as soon as possible");
    }
    lines.push("");
    state.lines.forEach(function (l) {
      var item = find(l.id);
      var how = describe(item, l.choices);
      lines.push(l.qty + " x " + item.name + (how ? " (" + how + ")" : "") + ": " + money(lineTotal(l)));
    });
    lines.push("");
    lines.push("Food: " + money(t.subtotal));
    if (delivery) {
      lines.push("Delivery to " + t.area.district + ": " + money(t.fee));
    }
    lines.push("Total to pay: " + money(t.total));
    lines.push("Paying by " + details.pay + " on " + (delivery ? "delivery" : "collection"));
    lines.push("");
    lines.push("Name: " + details.name);
    if (delivery) {
      lines.push("Address: " + details.address + ", " + details.postcode);
    }
    if (details.notes) {
      lines.push("Notes: " + details.notes);
    }
    return lines.join("\n");
  }

  window.KorBasket = {
    money: money,
    find: find,
    category: category,
    groups: groups,
    shown: shown,
    defaults: defaults,
    clean: clean,
    unitPrice: unitPrice,
    describe: describe,
    allergens: allergens,
    optionalAllergens: optionalAllergens,
    postcode: postcode,
    areaFor: areaFor,
    minutes: minutes,
    state: function () {
      return state;
    },
    add: add,
    setQty: setQty,
    clear: clear,
    setMode: setMode,
    setPostcode: setPostcode,
    onChange: onChange,
    lineTotal: lineTotal,
    count: count,
    totals: totals,
    message: message
  };
})();
