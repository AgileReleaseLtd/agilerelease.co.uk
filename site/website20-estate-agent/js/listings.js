/* The property search page. Filters: buy or rent, price, bedrooms, type and status; sort by newest or
   price. The filters live in the address (properties.html?mode=let&beds=2...), so a search can be
   bookmarked, shared or reloaded, and Back from a property returns to the same results. */
(function () {
  var data = window.Transom;
  var T = window.TransomSite;
  var form = document.querySelector("[data-filters]");
  var list = document.querySelector("[data-results]");
  if (!form || !list) {
    return;
  }
  var countEl = document.querySelector("[data-count]");
  var emptyEl = document.querySelector("[data-empty]");
  var sortEl = document.getElementById("sort");
  var titleEl = document.querySelector("[data-search-title]");
  var toggle = document.querySelector(".filters-toggle");
  var panel = document.getElementById("filters-panel");

  var PRICES = {
    sale: [250000, 300000, 400000, 500000, 600000, 750000, 1000000, 1250000, 1500000, 2000000],
    let: [1000, 1500, 1750, 2000, 2500, 3000, 3500, 4000, 5000]
  };
  var TYPES = ["house", "flat", "maisonette"];
  var STATUSES = ["available", "agreed", "sold"];
  var SORTS = ["newest", "price-asc", "price-desc"];

  function statusGroup(p) {
    if (p.status === "under-offer" || p.status === "let-agreed") {
      return "agreed";
    }
    return p.status === "sold-stc" ? "sold" : "available";
  }

  /* ---------- State <-> address ---------- */

  function listParam(params, key, allowed) {
    if (!params.has(key)) {
      return allowed.slice();
    }
    return (params.get(key) || "").split(",").filter(function (v) {
      return allowed.indexOf(v) !== -1;
    });
  }

  function readState() {
    var params = new URLSearchParams(window.location.search);
    var mode = params.get("mode") === "let" ? "let" : "sale";
    var s = {
      mode: mode,
      min: Math.max(0, parseInt(params.get("min"), 10) || 0),
      max: Math.max(0, parseInt(params.get("max"), 10) || 0),
      beds: Math.min(4, Math.max(0, parseInt(params.get("beds"), 10) || 0)),
      types: listParam(params, "type", TYPES),
      statuses: listParam(params, "status", STATUSES),
      sort: SORTS.indexOf(params.get("sort")) !== -1 ? params.get("sort") : "newest"
    };
    // Prices must be one of the choices for this mode; anything else is dropped.
    if (PRICES[mode].indexOf(s.min) === -1) {
      s.min = 0;
    }
    if (PRICES[mode].indexOf(s.max) === -1) {
      s.max = 0;
    }
    return s;
  }

  function writeState(s) {
    var params = new URLSearchParams();
    params.set("mode", s.mode);
    if (s.min) {
      params.set("min", s.min);
    }
    if (s.max) {
      params.set("max", s.max);
    }
    if (s.beds) {
      params.set("beds", s.beds);
    }
    if (s.types.length !== TYPES.length) {
      params.set("type", s.types.join(","));
    }
    if (s.statuses.length !== STATUSES.length) {
      params.set("status", s.statuses.join(","));
    }
    if (s.sort !== "newest") {
      params.set("sort", s.sort);
    }
    var query = "?" + params.toString();
    if (window.history.replaceState) {
      window.history.replaceState(null, "", window.location.pathname + query);
    }
    try {
      window.sessionStorage.setItem("transom-search", query);
    } catch (e) {
      /* Private browsing: the Back link falls back to the plain search. */
    }
  }

  /* ---------- Form <-> state ---------- */

  function priceOptions(select, mode, isMax, value) {
    select.textContent = "";
    var none = T.el("option", "", isMax ? "No max" : "No min");
    none.value = "0";
    select.appendChild(none);
    // Short labels so two fit side by side: "£250k", "£1.25m"; rents are a month.
    PRICES[mode].forEach(function (p) {
      var o = T.el("option", "", mode === "let" ? T.money(p) : T.moneyShort(p));
      o.value = String(p);
      select.appendChild(o);
    });
    select.value = String(value || 0);
  }

  function priceLabels(mode) {
    form.querySelector('label[for="f-min"]').textContent = mode === "let" ? "Min rent pcm" : "Min price";
    form.querySelector('label[for="f-max"]').textContent = mode === "let" ? "Max rent pcm" : "Max price";
  }

  function fillForm(s) {
    form.elements.mode.value = s.mode;
    priceOptions(form.elements.min, s.mode, false, s.min);
    priceOptions(form.elements.max, s.mode, true, s.max);
    form.elements.beds.value = String(s.beds);
    form.querySelectorAll('input[name="type"]').forEach(function (c) {
      c.checked = s.types.indexOf(c.value) !== -1;
    });
    form.querySelectorAll('input[name="status"]').forEach(function (c) {
      c.checked = s.statuses.indexOf(c.value) !== -1;
    });
    modeLabels(s.mode);
    sortEl.value = s.sort;
  }

  // "Under offer" for sales and "Let agreed" for lettings; "Sold STC" only applies to sales.
  function modeLabels(mode) {
    priceLabels(mode);
    var agreed = form.querySelector('[data-status-label="agreed"]');
    if (agreed) {
      agreed.textContent = mode === "let" ? "Let agreed" : "Under offer";
    }
    var sold = form.querySelector('input[name="status"][value="sold"]');
    if (sold) {
      sold.disabled = mode === "let";
      sold.closest(".check").classList.toggle("is-disabled", mode === "let");
    }
  }

  function formState() {
    var s = {
      mode: form.elements.mode.value === "let" ? "let" : "sale",
      min: parseInt(form.elements.min.value, 10) || 0,
      max: parseInt(form.elements.max.value, 10) || 0,
      beds: parseInt(form.elements.beds.value, 10) || 0,
      types: [],
      statuses: [],
      sort: sortEl.value
    };
    form.querySelectorAll('input[name="type"]:checked').forEach(function (c) {
      s.types.push(c.value);
    });
    form.querySelectorAll('input[name="status"]').forEach(function (c) {
      // A disabled "Sold STC" keeps its tick for when the visitor switches back to buying.
      if (c.checked) {
        s.statuses.push(c.value);
      }
    });
    // Min above max: swap them rather than show nothing.
    if (s.min && s.max && s.min > s.max) {
      var t = s.min;
      s.min = s.max;
      s.max = t;
      form.elements.min.value = String(s.min);
      form.elements.max.value = String(s.max);
    }
    return s;
  }

  /* ---------- Results ---------- */

  function matches(p, s) {
    return p.mode === s.mode &&
      (!s.min || p.price >= s.min) &&
      (!s.max || p.price <= s.max) &&
      p.beds >= s.beds &&
      s.types.indexOf(p.type) !== -1 &&
      s.statuses.indexOf(statusGroup(p)) !== -1;
  }

  function sorted(items, how) {
    return items.slice().sort(function (a, b) {
      if (how === "price-asc") {
        return a.price - b.price || a.listed - b.listed;
      }
      if (how === "price-desc") {
        return b.price - a.price || a.listed - b.listed;
      }
      return a.listed - b.listed;
    });
  }

  function activeCount(s) {
    var n = 0;
    if (s.min) { n++; }
    if (s.max) { n++; }
    if (s.beds) { n++; }
    if (s.types.length !== TYPES.length) { n++; }
    if (s.statuses.length !== STATUSES.length) { n++; }
    return n;
  }

  function render(s) {
    var found = sorted(data.properties.filter(function (p) {
      return matches(p, s);
    }), s.sort);

    var noun = s.mode === "let" ? "to rent" : "for sale";
    // Buy or Rent in the menu shows which list this is.
    document.querySelectorAll('.nav a[href^="properties.html?mode="]').forEach(function (a) {
      if (a.getAttribute("href") === "properties.html?mode=" + s.mode) {
        a.setAttribute("aria-current", "page");
      } else {
        a.removeAttribute("aria-current");
      }
    });
    titleEl.textContent = s.mode === "let" ? "Homes to rent" : "Homes for sale";
    document.title = (s.mode === "let" ? "Homes to rent" : "Homes for sale") + " in Bow | Transom & Co (sample website)";
    countEl.textContent = found.length ? found.length + (found.length === 1 ? " home " : " homes ") + noun : "No homes " + noun + " match";

    list.textContent = "";
    found.forEach(function (p) {
      list.appendChild(T.card(p, { heading: "h2" }));
    });

    emptyEl.hidden = found.length > 0;
    if (!found.length) {
      var hint = emptyEl.querySelector("[data-empty-hint]");
      if (!s.types.length) {
        hint.textContent = "Tick at least one property type.";
      } else if (!s.statuses.length) {
        hint.textContent = "Tick at least one status.";
      } else {
        hint.textContent = "Try a wider price range or fewer bedrooms. New homes come on most weeks.";
      }
    }

    if (toggle) {
      var n = activeCount(s);
      toggle.querySelector("[data-filter-count]").textContent = n ? " (" + n + ")" : "";
    }
  }

  function update() {
    var s = formState();
    modeLabels(s.mode);
    writeState(s);
    render(s);
  }

  form.addEventListener("change", function (event) {
    if (event.target.name === "mode") {
      // Prices mean different things for buying and renting, so they reset.
      var s = formState();
      priceOptions(form.elements.min, s.mode, false, 0);
      priceOptions(form.elements.max, s.mode, true, 0);
    }
    update();
  });
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    update();
  });
  sortEl.addEventListener("change", update);

  document.querySelectorAll("[data-reset]").forEach(function (b) {
    b.addEventListener("click", function () {
      var mode = form.elements.mode.value === "let" ? "let" : "sale";
      fillForm({ mode: mode, min: 0, max: 0, beds: 0, types: TYPES.slice(), statuses: STATUSES.slice(), sort: sortEl.value });
      update();
      countEl.focus();
    });
  });

  // On phones the filters fold away behind a button.
  if (toggle && panel) {
    toggle.hidden = false;
    panel.classList.add("is-collapsible");
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      panel.classList.toggle("is-open", open);
    });
  }

  var start = readState();
  fillForm(start);
  writeState(start);
  render(start);
})();
