/* Visit plans page: pick how often and the garden size, and see the monthly price, what each visit
   includes and a link that starts a quote for that plan. plans.html?freq=weekly&size=large opens with
   those picked. Prices come from data.js (see "Regular-visit plans" there). */
(function () {
  var data = window.Hornbeam;
  var G = window.HornbeamGarden;
  var el = G.el;

  var freqBox = document.querySelector("[data-freq-options]");
  var sizeBox = document.querySelector("[data-size-options]");
  if (!freqBox || !sizeBox) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var state = {
    freq: data.plans[params.get("freq")] ? params.get("freq") : "fortnightly",
    size: data.sizes[params.get("size")] ? params.get("size") : "medium"
  };

  function option(name, value, title, lines, extra) {
    var label = el("label", "option");
    var input = el("input");
    input.type = "radio";
    input.name = name;
    input.value = value;
    var body = el("span", "option-body");
    if (extra) {
      body.appendChild(extra);
    }
    var t = el("span", "option-title", title);
    body.appendChild(t);
    lines.forEach(function (l) {
      body.appendChild(el("span", l[0], l[1]));
    });
    label.append(input, body);
    return { label: label, input: input, title: t };
  }

  // A little garden plan for each size: the house, the plot and its lawn.
  function sizePic(size) {
    var dims = { small: [44, 34, 0], medium: [64, 46, 1], large: [92, 60, 2] }[size];
    var svg = G.svgEl("svg", { "class": "size-pic", viewBox: "0 0 96 72", "aria-hidden": "true" });
    var x = (96 - dims[0]) / 2;
    var y = 66 - dims[1];
    svg.appendChild(G.svgEl("rect", { x: x, y: y, width: dims[0], height: dims[1], rx: 2, "class": "plot" }));
    svg.appendChild(G.svgEl("rect", { x: x + 6, y: y + 6, width: dims[0] - 12, height: dims[1] - 18, rx: 1.5, "class": "lawn" }));
    svg.appendChild(G.svgEl("rect", { x: x, y: 66, width: dims[0], height: 6, "class": "house" }));
    for (var i = 0; i < dims[2]; i++) {
      svg.appendChild(G.svgEl("circle", { cx: x + dims[0] - 10 - i * 14, cy: y + 9, r: 5, "class": "tree" }));
    }
    return svg;
  }

  var freqInputs = [];
  Object.keys(data.plans).forEach(function (key) {
    var plan = data.plans[key];
    var o = option("freq", key, plan.name, [["option-sub", plan.rhythm], ["option-price", ""]]);
    if (plan.popular) {
      o.title.appendChild(el("span", "popular-flag", "Popular"));
    }
    freqBox.appendChild(o.label);
    freqInputs.push(o.input);
  });

  var sizeInputs = [];
  Object.keys(data.sizes).forEach(function (key) {
    var s = data.sizes[key];
    var o = option("size", key, G.keepUnits(s.name + ", " + s.area), [["option-sub", s.text]], sizePic(key));
    sizeBox.appendChild(o.label);
    sizeInputs.push(o.input);
  });

  freqInputs.concat(sizeInputs).forEach(function (input) {
    input.addEventListener("change", function () {
      state[input.name] = input.value;
      render(true);
    });
  });

  var table = buildTable();

  function hoursText(h) {
    var whole = Math.floor(h);
    var part = h - whole;
    var frac = part === 0.25 ? "¼" : part === 0.5 ? "½" : part === 0.75 ? "¾" : "";
    var n = (whole || !frac ? whole : "") + frac;
    return "about " + n + (h === 1 ? " hour" : " hours") + " of gardening";
  }

  function render(fromChange) {
    freqInputs.forEach(function (i) {
      i.checked = i.value === state.freq;
      // Each frequency card shows its price for the size picked.
      var p = G.planPrice(i.value, state.size);
      i.parentNode.querySelector(".option-price").textContent = G.money(p.monthly) + " a month";
    });
    sizeInputs.forEach(function (i) {
      i.checked = i.value === state.size;
    });

    var plan = data.plans[state.freq];
    var size = data.sizes[state.size];
    var p = G.planPrice(state.freq, state.size);

    document.querySelector("[data-plan-title]").textContent = plan.name + " visits, " + size.name.toLowerCase() + " garden";
    document.querySelector("[data-plan-monthly]").textContent = G.money(p.monthly);
    document.querySelector("[data-plan-sub]").textContent = G.money(p.perVisit) + " a visit, " + p.visits + " visits a year, " + hoursText(p.hours) + " each time. " + plan.rhythm;

    fillList(document.querySelector("[data-plan-every]"), plan.every, "i-check");
    var extrasBox = document.querySelector("[data-plan-extras-box]");
    extrasBox.hidden = !plan.extras.length;
    fillList(document.querySelector("[data-plan-extras]"), plan.extras, "i-sprout");

    var ask = document.querySelector("[data-plan-ask]");
    ask.href = "quote.html?job=regular&freq=" + state.freq + "&size=" + state.size;

    table.querySelectorAll("td").forEach(function (td) {
      td.classList.toggle("is-picked", td.getAttribute("data-cell") === state.freq + "-" + state.size);
    });

    if (fromChange && window.history && window.history.replaceState) {
      window.history.replaceState(null, "", "plans.html?freq=" + state.freq + "&size=" + state.size);
    }
  }

  function fillList(list, items, iconId) {
    list.textContent = "";
    items.forEach(function (text) {
      var li = el("li", iconId === "i-sprout" ? "is-extra" : "");
      li.appendChild(G.icon(iconId));
      li.appendChild(el("span", "", text));
      list.appendChild(li);
    });
  }

  function buildTable() {
    var wrap = document.querySelector("[data-price-table]");
    var t = el("table", "price-table");
    var cap = el("caption", "", "Price a month, and a visit. Including VAT and green waste.");
    t.appendChild(cap);
    var thead = el("thead");
    var hr = el("tr");
    var corner = el("th", "", "Garden size");
    corner.scope = "col";
    hr.appendChild(corner);
    Object.keys(data.plans).forEach(function (f) {
      var th = el("th", "", data.plans[f].name);
      th.scope = "col";
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    t.appendChild(thead);
    var tbody = el("tbody");
    Object.keys(data.sizes).forEach(function (s) {
      var tr = el("tr");
      var th = el("th", "", data.sizes[s].name);
      th.scope = "row";
      th.appendChild(el("span", "", G.keepUnits(data.sizes[s].area)));
      tr.appendChild(th);
      Object.keys(data.plans).forEach(function (f) {
        var p = G.planPrice(f, s);
        var td = el("td");
        td.setAttribute("data-cell", f + "-" + s);
        td.appendChild(el("strong", "", G.money(p.monthly)));
        td.appendChild(el("span", "", "a month"));
        td.appendChild(el("span", "", G.money(p.perVisit) + " a visit"));
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    t.appendChild(tbody);
    if (wrap) {
      wrap.appendChild(t);
    }
    return t;
  }

  render(false);
})();
