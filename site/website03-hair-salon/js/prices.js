/* The prices page: every service from data.js, grouped by category, with filters for the category, the
   hair length and the stylist level. Each service links to the booking page with it already chosen. */
(function () {
  var D = window.SorrelSteel;
  var C = window.SorrelSteelCore;
  var el = C.el;

  var box = document.querySelector("[data-price-list]");
  if (!box) {
    return;
  }
  var status = document.querySelector("[data-price-status]");
  var state = { cat: "all", length: "all", level: "all" };
  var NUMERALS = ["i", "ii", "iii", "iv", "v"];
  var LEVEL_SHORT = { stylist: "Stylist", senior: "Senior" };

  function durationText(s) {
    if (state.length !== "all") {
      return C.duration(C.minutesFor(s, state.length));
    }
    var r = C.minutesRange(s);
    return r[0] === r[1] ? C.duration(r[0]) : C.duration(r[0]) + " to " + C.duration(r[1]);
  }

  function priceList(s) {
    var kind = C.priceKind(s);
    if (kind === "quote") {
      var quote = el("p", "pr-prices");
      quote.appendChild(el("span", "pr-quote", "Priced at a free consultation"));
      return quote;
    }
    var dl = el("dl", "pr-prices");
    function add(label, value, hideLabel) {
      var row = el("div");
      row.appendChild(el("dt", hideLabel ? "visually-hidden" : "", label));
      row.appendChild(el("dd", "", C.money(value)));
      dl.appendChild(row);
    }
    if (kind === "flat") {
      add("Price", s.price, true);
    } else if (kind === "level") {
      ["stylist", "senior"].forEach(function (lv) {
        if (state.level === "all" || state.level === lv) {
          add(LEVEL_SHORT[lv], s.price[lv], false);
        }
      });
    } else {
      ["short", "medium", "long"].forEach(function (len) {
        if (state.length === "all" || state.length === len) {
          add(D.lengths[len].name, s.price[len], false);
        }
      });
    }
    return dl;
  }

  function row(s) {
    var li = el("li", "price-row");
    var main = el("div", "pr-main");
    var name = el("h3", "pr-name", s.name);
    if (s.skinTest) {
      var tag = el("a", "tag", "Skin test first");
      tag.href = "index.html#skin-test";
      name.appendChild(tag);
    }
    main.appendChild(name);
    main.appendChild(el("p", "pr-blurb", s.blurb));
    li.appendChild(main);

    var time = el("p", "pr-time");
    if (!s.quote) {
      time.appendChild(C.icon("i-clock", "icon-sm"));
      time.appendChild(el("span", "", durationText(s)));
    }
    li.appendChild(time);
    li.appendChild(priceList(s));

    var book = el("a", "btn btn-outline btn-sm pr-book", "Book");
    book.href = "book.html?add=" + (s.quote ? "consult" : s.id);
    book.setAttribute("aria-label", s.quote ? "Book a free colour consultation" : "Book " + s.name);
    li.appendChild(book);
    return li;
  }

  function render() {
    box.textContent = "";
    D.categories.forEach(function (cat, i) {
      if (state.cat !== "all" && state.cat !== cat.id) {
        return;
      }
      var group = el("section", "price-group cat-" + cat.id);
      group.id = cat.id;
      group.setAttribute("aria-labelledby", "group-" + cat.id);
      var head = el("header", "price-group-head");
      var h2 = el("h2");
      h2.id = "group-" + cat.id;
      h2.appendChild(el("span", "pg-num", NUMERALS[i] + "."));
      h2.appendChild(document.createTextNode(cat.name));
      head.appendChild(h2);
      head.appendChild(el("p", "", cat.blurb));
      var note = el("p", "pg-note");
      note.appendChild(C.icon("i-info"));
      note.appendChild(el("span", "", cat.priceNote));
      head.appendChild(note);
      group.appendChild(head);

      var list = el("ul", "price-rows");
      D.services.filter(function (s) {
        return s.cat === cat.id;
      }).forEach(function (s) {
        list.appendChild(row(s));
      });
      group.appendChild(list);
      box.appendChild(group);
    });
  }

  function describe() {
    var parts = [];
    parts.push(state.cat === "all" ? "Showing every service" : "Showing " + C.category(state.cat).name.toLowerCase());
    if (state.length !== "all") {
      parts.push("prices for " + D.lengths[state.length].name.toLowerCase() + " hair");
    }
    if (state.level !== "all") {
      parts.push((state.level === "senior" ? "senior stylist" : "stylist") + " prices");
    }
    return parts.join(", ") + ".";
  }

  function set(key, value, announce) {
    state[key] = value;
    document.querySelectorAll("[data-" + key + "]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-" + key) === value));
    });
    render();
    if (announce && status) {
      status.textContent = describe();
    }
  }

  ["cat", "length", "level"].forEach(function (key) {
    document.querySelectorAll("[data-price-tools] [data-" + key + "]").forEach(function (b) {
      b.addEventListener("click", function () {
        set(key, b.getAttribute("data-" + key), true);
      });
    });
  });

  // Who is which level, from the team in data.js.
  var levelNote = document.querySelector("[data-level-note]");
  if (levelNote) {
    var byLevel = { senior: [], stylist: [] };
    D.team.forEach(function (m) {
      var cuts = m.does.some(function (id) {
        return C.priceKind(C.service(id)) === "level";
      });
      if (cuts) {
        byLevel[m.level].push(m.name);
      }
    });
    var names = function (list) {
      return list.join(", ").replace(/, ([^,]*)$/, " and $1");
    };
    levelNote.textContent = "Cuts are priced by stylist level. " + names(byLevel.senior) +
      (byLevel.senior.length > 1 ? " are senior stylists" : " is a senior stylist") + ", with at least eight years behind the chair. " +
      names(byLevel.stylist) + (byLevel.stylist.length > 1 ? " are stylists." : " is a stylist.");
  }

  // prices.html#colour (from the home page) opens on that category.
  function fromHash() {
    var wanted = window.location.hash.slice(1);
    if (!C.category(wanted)) {
      return false;
    }
    set("cat", wanted, false);
    var tools = document.querySelector("[data-price-tools]");
    window.requestAnimationFrame(function () {
      tools.scrollIntoView({ block: "start" });
    });
    return true;
  }
  window.addEventListener("hashchange", fromHash);
  if (!fromHash()) {
    render();
  }
})();
