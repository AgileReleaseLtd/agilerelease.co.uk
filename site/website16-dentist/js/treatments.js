/* Treatments page: every treatment from data.js, with filters (all, NHS, private only, children) and a
   list to jump to each one. treatments.html?show=private opens filtered; treatments.html#implants opens
   at that treatment. */
(function () {
  var data = window.Harebell;
  var list = document.querySelector("[data-treat-list]");
  var toc = document.querySelector("[data-toc]");
  var status = document.querySelector("[data-filter-status]");
  var chips = document.querySelectorAll("[data-filter]");
  if (!list) {
    return;
  }

  var FILTERS = {
    all: { test: function () { return true; }, words: "all treatments" },
    nhs: { test: function (t) { return !!t.nhs; }, words: "treatments available on the NHS" },
    "private": { test: function (t) { return !t.nhs; }, words: "treatments we offer privately only" },
    children: { test: function (t) { return !!t.children; }, words: "treatments for children" }
  };

  // The new patient form's reason for each treatment (register.html?reason=...).
  var REASON = {
    "check-ups": "checkup", fillings: "treatment", "root-canal": "treatment", "crowns-bridges": "treatment",
    extractions: "treatment", dentures: "treatment", implants: "implants", whitening: "cosmetic",
    aligners: "cosmetic", children: "child"
  };

  var bands = {};
  data.nhsBands.forEach(function (b) {
    bands[b.id] = b;
  });

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== undefined) {
      node.textContent = text;
    }
    return node;
  }

  function iconSvg(id) {
    return '<svg class="icon"><use href="#' + id + '"/></svg>';
  }

  function nhsFee(t) {
    if (t.nhs === "free") {
      return "Free for under-18s";
    }
    if (t.nhs && bands[t.nhs]) {
      return bands[t.nhs].name + ", " + bands[t.nhs].price;
    }
    return "Not usually available";
  }

  function tagRow(t) {
    var box = el("div", "tags");
    if (t.nhs === "free") {
      box.appendChild(el("span", "tag tag-free", "Free on the NHS for under-18s"));
    } else if (t.nhs) {
      box.appendChild(el("span", "tag tag-nhs", "NHS " + bands[t.nhs].name));
      box.appendChild(el("span", "tag tag-private", "Private"));
    } else {
      box.appendChild(el("span", "tag tag-private", "Private only"));
    }
    return box;
  }

  function article(t) {
    var art = el("article", "treatment" + (t.nhs ? "" : " is-private"));
    art.id = t.id;
    art.setAttribute("aria-labelledby", t.id + "-title");

    var head = el("header", "treatment-head");
    var icon = el("span", "treat-icon");
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = iconSvg(t.icon);
    var titles = el("div");
    var h2 = el("h2", "", t.name);
    h2.id = t.id + "-title";
    titles.append(h2, tagRow(t));
    head.append(icon, titles);

    var grid = el("div", "treatment-grid");
    var stepsBox = el("div");
    stepsBox.appendChild(el("h3", "mini-title", "What happens"));
    var ol = el("ol", "treat-steps");
    t.steps.forEach(function (s) {
      ol.appendChild(el("li", "", s));
    });
    stepsBox.appendChild(ol);

    var facts = el("div", "treat-facts");
    [["How long", t.time], ["Good to know", t.note]].forEach(function (pair) {
      var f = el("div", "fact");
      f.append(el("h3", "mini-title", pair[0]), el("p", "", pair[1]));
      facts.appendChild(f);
    });
    grid.append(stepsBox, facts);

    var fees = el("div", "treatment-fees");
    var nhs = el("div");
    nhs.append(el("span", "", "On the NHS"), el("strong", "", nhsFee(t)));
    var priv = el("div");
    priv.append(el("span", "", "Privately"), el("strong", "", t.private));
    var links = el("div", "treatment-links");
    var ask = el("a", "", "Ask about this");
    ask.href = "register.html?reason=" + (REASON[t.id] || "other") + (t.nhs ? "" : "&care=private");
    ask.setAttribute("aria-label", "Ask about " + t.name.toLowerCase() + " as a new patient");
    var feesLink = el("a", "", "All fees");
    feesLink.href = t.nhs && t.nhs !== "free" ? "fees.html" : "fees.html?tab=private";
    feesLink.setAttribute("aria-label", "All fees, from " + t.name.toLowerCase());
    links.append(ask, feesLink);
    fees.append(nhs, priv, links);

    art.append(head, el("p", "treatment-summary", t.summary), el("p", "treatment-about", t.about), grid, fees);
    return art;
  }

  function render() {
    list.textContent = "";
    data.treatments.forEach(function (t) {
      list.appendChild(article(t));
    });
    if (toc) {
      toc.textContent = "";
      data.treatments.forEach(function (t) {
        var a = el("a");
        a.href = "#" + t.id;
        a.setAttribute("data-toc-for", t.id);
        a.innerHTML = iconSvg(t.icon);
        a.appendChild(document.createTextNode(t.name));
        toc.appendChild(a);
      });
    }
    Object.keys(FILTERS).forEach(function (key) {
      var n = data.treatments.filter(FILTERS[key].test).length;
      document.querySelectorAll('[data-count="' + key + '"]').forEach(function (c) {
        c.textContent = String(n);
      });
    });
  }

  function setFilter(key, opts) {
    if (!FILTERS[key]) {
      key = "all";
    }
    var shown = 0;
    data.treatments.forEach(function (t) {
      var on = FILTERS[key].test(t);
      document.getElementById(t.id).hidden = !on;
      var tocLink = toc && toc.querySelector('[data-toc-for="' + t.id + '"]');
      if (tocLink) {
        tocLink.classList.toggle("is-hidden", !on);
      }
      if (on) {
        shown += 1;
      }
    });
    chips.forEach(function (c) {
      c.setAttribute("aria-pressed", String(c.getAttribute("data-filter") === key));
    });
    status.textContent = key === "all"
      ? "Showing all " + shown + " treatments."
      : "Showing " + shown + " " + FILTERS[key].words + ".";
    if (opts && opts.updateUrl && window.history.replaceState) {
      var url = new URL(window.location.href);
      if (key === "all") {
        url.searchParams.delete("show");
      } else {
        url.searchParams.set("show", key);
      }
      url.hash = "";
      window.history.replaceState(null, "", url);
    }
  }

  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      setFilter(c.getAttribute("data-filter"), { updateUrl: true });
    });
  });

  render();
  setFilter(new URLSearchParams(window.location.search).get("show") || "all");

  // The treatments are drawn after the page loads, so go to #treatment ourselves (showing it if a filter hid it).
  function goToHash() {
    var id = decodeURIComponent(window.location.hash.slice(1));
    var target = id && document.getElementById(id);
    if (!target || !target.classList.contains("treatment")) {
      return;
    }
    if (target.hidden) {
      setFilter("all");
    }
    target.scrollIntoView({ block: "start" });
  }
  goToHash();
  window.addEventListener("hashchange", goToHash);
})();
