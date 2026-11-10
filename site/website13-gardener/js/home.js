/* Home page: this month in the garden, guide prices, the seasons (the current one picked from today's date),
   the month-by-month chart, plan prices, and the areas we cover with a postcode checker. */
(function () {
  var data = window.Hornbeam;
  var G = window.HornbeamGarden;
  var el = G.el;
  var today = G.now();
  var monthIndex = today.getMonth();
  var current = G.seasonOf(today);
  var ICONS = { spring: "i-sprout", summer: "i-sun", autumn: "i-leaf", winter: "i-snow" };
  var ORDER = ["spring", "summer", "autumn", "winter"];

  nowCard();
  guides();
  seasons();
  yearChart();
  planTeasers();
  areas();

  function monthsText(key) {
    var m = data.seasons[key].months;
    return G.MONTHS[m[0] - 1] + " to " + G.MONTHS[m[m.length - 1] - 1];
  }

  function nowCard() {
    var title = document.querySelector("[data-now-title]");
    var list = document.querySelector("[data-now-list]");
    if (!title || !list) {
      return;
    }
    title.textContent = G.MONTHS[monthIndex] + ", " + data.seasons[current].name.toLowerCase();
    var jobs = G.jobsForMonth(monthIndex).slice(0, 4);
    list.textContent = "";
    jobs.forEach(function (j) {
      list.appendChild(el("li", "", j));
    });
    // March to August: hedges wait for a nest check.
    if (monthIndex >= 2 && monthIndex <= 7) {
      list.appendChild(el("li", "", "Hedges cut only after a nest check"));
    }
  }

  function guides() {
    var list = document.querySelector("[data-guides]");
    if (!list) {
      return;
    }
    data.guides.forEach(function (g) {
      var row = el("div", "guide");
      row.appendChild(el("dt", "", g[0]));
      row.appendChild(el("dd", "guide-price", g[2]));
      row.appendChild(el("dd", "guide-detail", g[1]));
      list.appendChild(row);
    });
  }

  /* ---------- Seasons: tabs, with the current season selected and marked "Now" ---------- */
  function seasons() {
    var root = document.querySelector("[data-seasons]");
    if (!root) {
      return;
    }
    var heading = document.querySelector("[data-season-heading]");
    if (heading) {
      heading.textContent = "this " + data.seasons[current].name.toLowerCase();
    }

    var tablist = el("div", "season-tabs");
    tablist.setAttribute("role", "tablist");
    tablist.setAttribute("aria-label", "Seasons");
    var tabs = [];
    var panels = [];

    ORDER.forEach(function (key) {
      var s = data.seasons[key];
      var isNow = key === current;

      var tab = el("button", "season-tab is-" + key);
      tab.type = "button";
      tab.id = "tab-" + key;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", "panel-" + key);
      tab.setAttribute("data-season", key);
      tab.appendChild(G.icon(ICONS[key]));
      var words = el("span");
      words.appendChild(el("span", "season-tab-name", s.name));
      words.appendChild(el("span", "season-tab-months", monthsText(key)));
      tab.appendChild(words);
      if (isNow) {
        var badge = el("span", "now-badge", "Now");
        tab.appendChild(badge);
        tab.setAttribute("aria-label", s.name + ", " + monthsText(key) + ", now");
      }
      tablist.appendChild(tab);
      tabs.push(tab);

      var panel = el("div", "season-panel is-" + key);
      panel.id = "panel-" + key;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", "tab-" + key);
      panel.tabIndex = 0;

      var art = el("div", "season-art");
      var img = el("img");
      img.src = "img/season-" + key + ".svg";
      img.alt = "";
      img.width = 420;
      img.height = 520;
      art.appendChild(img);

      var body = el("div", "season-body");
      body.appendChild(el("p", "season-when", monthsText(key) + (isNow ? " · now" : "")));
      body.appendChild(el("h3", "season-title", s.name + ": " + s.title.charAt(0).toLowerCase() + s.title.slice(1)));
      body.appendChild(el("p", "season-intro", s.intro));
      var jobs = el("ul", "season-jobs");
      s.jobs.forEach(function (j) {
        var li = el("li");
        li.appendChild(el("h4", "", j[0]));
        li.appendChild(el("p", "", j[1]));
        jobs.appendChild(li);
      });
      body.appendChild(jobs);
      panel.append(art, body);
      panels.push(panel);
    });

    root.textContent = "";
    root.appendChild(tablist);
    panels.forEach(function (p) {
      root.appendChild(p);
    });

    function select(key, focus) {
      tabs.forEach(function (t, i) {
        var on = t.getAttribute("data-season") === key;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;
        if (on && focus) {
          t.focus();
        }
      });
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        select(tab.getAttribute("data-season"), false);
      });
      tab.addEventListener("keydown", function (event) {
        var next = null;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          next = (i + 1) % tabs.length;
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          next = (i + tabs.length - 1) % tabs.length;
        } else if (event.key === "Home") {
          next = 0;
        } else if (event.key === "End") {
          next = tabs.length - 1;
        }
        if (next !== null) {
          event.preventDefault();
          select(tabs[next].getAttribute("data-season"), true);
        }
      });
    });

    select(current, false);
  }

  /* ---------- Month by month ---------- */
  function yearChart() {
    var root = document.querySelector("[data-year]");
    if (!root) {
      return;
    }
    var nowLabel = document.querySelector("[data-now-month]");
    if (nowLabel) {
      nowLabel.textContent = "This month (" + G.MONTHS[monthIndex] + ")";
    }

    var head = el("div", "year-months");
    head.setAttribute("aria-hidden", "true");
    head.appendChild(el("span", "year-corner"));
    G.MONTHS.forEach(function (m, i) {
      var cell = el("span", "year-month" + (i === monthIndex ? " is-now" : ""));
      cell.appendChild(el("span", "m3", m.slice(0, 3)));
      cell.appendChild(el("span", "m1", m.charAt(0)));
      head.appendChild(cell);
    });
    root.appendChild(head);

    var WORDS = ["not usually", "can be done", "best time"];
    data.yearGroups.forEach(function (group) {
      var g = el("div", "year-group");
      g.appendChild(el("h4", "year-group-name", group.name));
      group.jobs.forEach(function (job) {
        var values = job[1];
        var row = el("div", "year-row");
        var label = el("p", "year-label", job[0]);
        label.appendChild(el("span", "visually-hidden", ". " + G.jobTiming(values)));
        row.appendChild(label);
        values.forEach(function (v, i) {
          var cls = "year-cell v" + v;
          if (v && values[i - 1] !== v) {
            cls += " run-start";
          }
          if (v && values[i + 1] !== v) {
            cls += " run-end";
          }
          if (i === monthIndex) {
            cls += " is-now";
          }
          var cell = el("span", cls);
          cell.setAttribute("aria-hidden", "true");
          cell.title = job[0] + ", " + G.MONTHS[i] + ": " + WORDS[v];
          cell.appendChild(el("i"));
          row.appendChild(cell);
        });
        g.appendChild(row);
      });
      root.appendChild(g);
    });
  }

  /* ---------- Plan prices ---------- */
  function planTeasers() {
    var list = document.querySelector("[data-plan-teasers]");
    if (!list) {
      return;
    }
    list.textContent = "";
    Object.keys(data.plans).forEach(function (key) {
      var plan = data.plans[key];
      var small = G.planPrice(key, "small");
      var li = el("li", "plan-teaser" + (plan.popular ? " is-popular" : ""));
      if (plan.popular) {
        li.appendChild(el("span", "teaser-badge", "Most popular"));
      }
      li.appendChild(el("h3", "", plan.name));
      li.appendChild(el("p", "", plan.rhythm));
      var price = el("p", "teaser-price");
      price.append("From ");
      price.appendChild(el("strong", "", G.money(small.monthly)));
      price.append(" a month");
      li.appendChild(price);
      li.appendChild(el("p", "", G.money(small.perVisit) + " a visit for a small garden, " + small.visits + " visits a year."));
      list.appendChild(li);
    });
  }

  /* ---------- Areas: lists, ring map and postcode checker ---------- */
  function shortName(name) {
    return name.split(" (")[0].split(" and ")[0];
  }

  function areas() {
    var lists = document.querySelector("[data-area-lists]");
    var mapRoot = document.querySelector("[data-ring-map]");
    var form = document.querySelector("[data-checker]");
    if (!lists && !mapRoot && !form) {
      return;
    }
    var codes = Object.keys(data.areas);

    if (lists) {
      [["all", "Regular visits and one-off jobs"], ["projects", "One-off jobs and projects"]].forEach(function (grp) {
        var box = el("div");
        var h = el("h3");
        h.appendChild(el("span", "area-dot is-" + grp[0]));
        h.append(grp[1]);
        box.appendChild(h);
        var ul = el("ul");
        codes.forEach(function (code) {
          var a = data.areas[code];
          var inGroup = grp[0] === "all" ? a.status === "all" : a.status !== "all";
          if (!inGroup) {
            return;
          }
          var li = el("li");
          li.appendChild(el("b", "", code));
          li.append(" " + a.name + (a.status === "part" ? ", part" : ""));
          ul.appendChild(li);
        });
        box.appendChild(ul);
        lists.appendChild(box);
      });
    }

    var nodes = {};
    if (mapRoot) {
      nodes = ringMap(mapRoot, codes);
    }

    if (!form) {
      return;
    }
    var input = form.querySelector("input");
    var result = form.querySelector("[data-check-result]");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var r = G.lookup(input.value);
      Object.keys(nodes).forEach(function (k) {
        nodes[k].classList.remove("map-hit");
      });
      result.textContent = "";
      var kind;
      var text;
      if (r.error) {
        kind = "error";
        text = r.error === "empty" ? "Type a postcode first, for example SM5 or SM5 3AB." : "That doesn't look like a postcode. Try the first half, for example SM5.";
      } else if (!r.area) {
        kind = "out";
        text = "Sorry, " + r.district + " is outside our area. We work within about six miles of Carshalton.";
      } else {
        kind = r.area.status;
        var place = r.district + " (" + r.area.name + ")";
        if (kind === "all") {
          text = "Yes, we cover " + place + " for regular visits and one-off jobs.";
        } else if (kind === "projects") {
          text = "We cover " + place + " for one-off jobs and landscaping. It's a little far for regular visits.";
        } else {
          text = "We cover part of " + r.district + ": " + r.area.name.replace(/^[^(]*\(|\)$/g, "") + ". Send us your full postcode and we'll confirm.";
        }
        if (nodes[r.district]) {
          nodes[r.district].classList.add("map-hit");
        }
      }
      result.className = "checker-result is-" + kind;
      result.appendChild(G.icon(kind === "all" ? "i-check" : kind === "error" || kind === "out" ? "i-close" : "i-pin"));
      var span = el("span", "", text + " ");
      if (kind === "all" || kind === "projects" || kind === "part") {
        var link = el("a", "", "Ask for a quote");
        link.href = "quote.html?postcode=" + encodeURIComponent(r.full);
        span.appendChild(link);
      }
      result.appendChild(span);
    });
  }

  // The tree-ring map: the yard in the middle, the regular-visit ring, and the outer ring for projects.
  function ringMap(root, codes) {
    var S = 46;
    var svg = G.svgEl("svg", { viewBox: "-300 -290 600 590", role: "img", "aria-label": "Map of the postcode districts we cover around Carshalton. The lists beside it give the same districts." });

    function wobbly(r, seed, cls) {
      var d = "";
      for (var i = 0; i <= 72; i++) {
        var a = i / 72 * Math.PI * 2;
        var k = 1 + 0.014 * Math.sin(3 * a + seed) + 0.008 * Math.sin(7 * a + seed * 2);
        var x = Math.cos(a) * r * k;
        var y = Math.sin(a) * r * k;
        d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
      }
      return G.svgEl("path", { d: d + "Z", "class": cls });
    }

    svg.appendChild(wobbly(5.5 * S, 1, "ring-zone-projects"));
    svg.appendChild(wobbly(5.5 * S, 1, "ring-edge ring-edge-outer"));
    svg.appendChild(wobbly(3.3 * S, 2, "ring-zone-all"));
    for (var r = 0.55; r < 5.4; r += 0.55) {
      svg.appendChild(wobbly(r * S, r * 3, "ring"));
    }
    svg.appendChild(wobbly(3.3 * S, 2, "ring-edge"));

    var nodes = {};
    codes.forEach(function (code) {
      var a = data.areas[code];
      var x = a.x * S;
      var y = a.y * S;
      var g = G.svgEl("g", { "class": "map-node" });
      if (a.home) {
        g.appendChild(G.svgEl("circle", { cx: x, cy: y, r: 24, "class": "map-home" }));
        var yard = G.svgEl("text", { x: x, y: y + 4, "text-anchor": "middle", "class": "map-yard" });
        yard.textContent = "YARD";
        g.appendChild(yard);
        y += 22;
      } else {
        g.appendChild(G.svgEl("circle", { cx: x, cy: y, r: 7, "class": "map-dot is-" + a.status }));
      }
      var t1 = G.svgEl("text", { x: x, y: y + 24, "text-anchor": "middle", "class": "map-code" });
      t1.textContent = code;
      var t2 = G.svgEl("text", { x: x, y: y + 39, "text-anchor": "middle", "class": "map-name" });
      t2.textContent = shortName(a.name);
      g.append(t1, t2);
      svg.appendChild(g);
      nodes[code] = g;
    });
    root.appendChild(svg);
    return nodes;
  }
})();
