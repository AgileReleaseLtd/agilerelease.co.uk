/* Conditions page: the body chart, the area and topic filters, the search box and the list of conditions,
   all from data.js. The chosen area or topic is kept in the address (?area=knee or ?topic=running), so
   links from the home page open the right list. */
(function () {
  "use strict";
  var D = window.Spindle;

  var chart = document.querySelector("[data-chart]");
  var list = document.querySelector("[data-conditions]");
  var areaChips = document.querySelector("[data-area-chips]");
  var tagChips = document.querySelector("[data-tag-chips]");
  var search = document.querySelector("[data-search]");
  var count = document.querySelector("[data-count]");
  var none = document.querySelector("[data-none]");
  var reset = document.querySelector("[data-reset]");
  var resultsBar = document.querySelector(".results-bar");
  if (!chart || !list) {
    return;
  }

  var state = { area: null, tag: null, query: "" };

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

  function inArea(c, area) {
    return c.areas.indexOf(area) !== -1;
  }

  function areaCount(area) {
    return D.conditions.filter(function (c) {
      return inArea(c, area);
    }).length;
  }

  function tagCount(tag) {
    return D.conditions.filter(function (c) {
      return c.tags.indexOf(tag) !== -1;
    }).length;
  }

  function plural(n, word) {
    return n + " " + word + (n === 1 ? "" : "s");
  }

  // Lower case, accents and punctuation removed, so "golfer's" finds "golfers".
  function norm(s) {
    return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’'`]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  }

  var haystack = {};
  D.conditions.forEach(function (c) {
    var words = [c.name, c.summary, c.help, c.plan.join(" "), c.note || ""];
    c.areas.forEach(function (a) {
      words.push(D.areas[a].name);
    });
    c.tags.forEach(function (t) {
      words.push(D.tags[t]);
    });
    haystack[c.id] = " " + norm(words.join(" ")) + " ";
  });

  function matches(c) {
    if (state.area && !inArea(c, state.area)) {
      return false;
    }
    if (state.tag && c.tags.indexOf(state.tag) === -1) {
      return false;
    }
    if (state.query) {
      return norm(state.query).split(" ").every(function (word) {
        return haystack[c.id].indexOf(word) !== -1;
      });
    }
    return true;
  }

  /* ---------- Chips and hotspots ---------- */

  function chip(label, n, attr, value) {
    var b = el("button", "chip");
    b.type = "button";
    b.setAttribute(attr, value);
    b.setAttribute("aria-pressed", "false");
    b.appendChild(document.createTextNode(label + " "));
    var small = el("small", "", String(n));
    small.setAttribute("aria-hidden", "true");
    b.appendChild(small);
    b.setAttribute("aria-label", label + ", " + plural(n, "condition"));
    return b;
  }

  function buildChips() {
    areaChips.appendChild(chip("All areas", D.conditions.length, "data-area", ""));
    Object.keys(D.areas).forEach(function (area) {
      areaChips.appendChild(chip(D.areas[area].name, areaCount(area), "data-area", area));
    });
    Object.keys(D.tags).forEach(function (tag) {
      tagChips.appendChild(chip(D.tags[tag], tagCount(tag), "data-tag", tag));
    });

    // Hotspot names for screen readers: "Knee, 5 conditions".
    chart.querySelectorAll(".spot").forEach(function (spot) {
      var area = spot.getAttribute("data-area");
      spot.setAttribute("aria-label", D.areas[area].name + ", " + plural(areaCount(area), "condition"));
    });

    // Hovering an area chip shades the area on the chart.
    areaChips.querySelectorAll("[data-area]").forEach(function (b) {
      var area = b.getAttribute("data-area");
      if (!area) {
        return;
      }
      ["mouseenter", "focus"].forEach(function (type) {
        b.addEventListener(type, function () {
          hover(area, true);
        });
      });
      ["mouseleave", "blur"].forEach(function (type) {
        b.addEventListener(type, function () {
          hover(area, false);
        });
      });
    });
  }

  function hover(area, on) {
    chart.querySelectorAll('.zone[data-zone="' + area + '"]').forEach(function (z) {
      z.classList.toggle("is-hover", on);
    });
  }

  function syncControls() {
    areaChips.querySelectorAll("[data-area]").forEach(function (b) {
      var v = b.getAttribute("data-area");
      b.setAttribute("aria-pressed", String(v ? v === state.area : !state.area && !state.tag));
    });
    tagChips.querySelectorAll("[data-tag]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-tag") === state.tag));
    });
    chart.querySelectorAll(".spot").forEach(function (s) {
      s.setAttribute("aria-pressed", String(s.getAttribute("data-area") === state.area));
    });
  }

  // Shade the areas the current list covers: the chosen area, or every area of the matching conditions.
  function shade(shown) {
    var on = {};
    if (state.area) {
      on[state.area] = true;
    } else if (state.tag || state.query) {
      shown.forEach(function (c) {
        c.areas.forEach(function (a) {
          on[a] = true;
        });
      });
    }
    chart.querySelectorAll(".zone").forEach(function (z) {
      z.classList.toggle("is-on", !!on[z.getAttribute("data-zone")]);
    });
  }

  /* ---------- The list ---------- */

  function renderCondition(c) {
    var li = el("li");
    var details = el("details", "condition");
    details.id = "c-" + c.id;

    var summary = el("summary");
    summary.appendChild(el("span", "condition-name", c.name));
    var areas = el("span", "condition-areas");
    c.areas.forEach(function (a) {
      areas.appendChild(el("span", "", D.areas[a].name));
    });
    summary.appendChild(areas);
    details.appendChild(summary);

    var body = el("div", "condition-body");
    body.appendChild(el("p", "", c.summary));

    var help = el("div", "condition-help");
    help.appendChild(el("h3", "", "How physio can help"));
    help.appendChild(el("p", "", c.help));
    body.appendChild(help);

    var plan = el("div", "condition-plan");
    plan.appendChild(el("h3", "", "What we might do"));
    var ul = el("ul");
    c.plan.forEach(function (p) {
      ul.appendChild(el("li", "", p));
    });
    plan.appendChild(ul);
    body.appendChild(plan);

    if (c.note) {
      var note = el("p", "condition-note");
      note.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-alert"/></svg>';
      var span = el("span", "", c.note + " ");
      var more = el("a", "", "Warning signs");
      more.href = "#red-flags";
      span.appendChild(more);
      note.appendChild(span);
      body.appendChild(note);
    }

    var actions = el("div", "condition-actions");
    var book = el("a", "btn btn-dark btn-sm", "Book an assessment");
    book.href = "book.html?type=initial&about=" + encodeURIComponent(c.id);
    actions.appendChild(book);
    if (c.tags.indexOf("running") !== -1 && c.id === "running-injuries") {
      var run = el("a", "text-link", "Or a running assessment");
      run.href = "book.html?type=running&about=" + encodeURIComponent(c.id);
      actions.appendChild(run);
    }
    body.appendChild(actions);
    details.appendChild(body);
    li.appendChild(details);
    return li;
  }

  var items = {};
  D.conditions.forEach(function (c) {
    items[c.id] = renderCondition(c);
  });

  function render() {
    var shown = D.conditions.filter(matches);
    list.textContent = "";
    shown.forEach(function (c) {
      list.appendChild(items[c.id]);
    });
    none.hidden = shown.length > 0;

    var label = plural(shown.length, "condition");
    if (state.area) {
      label += " for " + D.areas[state.area].name.toLowerCase();
    } else if (state.tag) {
      label += ": " + D.tags[state.tag].toLowerCase();
    }
    if (state.query) {
      label += ", matching “" + state.query.trim() + "”";
    }
    count.textContent = label;
    reset.hidden = !(state.area || state.tag || state.query);

    syncControls();
    shade(shown);
    saveUrl();
  }

  function saveUrl() {
    if (!window.history.replaceState) {
      return;
    }
    var url = new URL(window.location.href);
    url.searchParams.delete("area");
    url.searchParams.delete("topic");
    if (state.area) {
      url.searchParams.set("area", state.area);
    }
    if (state.tag) {
      url.searchParams.set("topic", state.tag);
    }
    window.history.replaceState(null, "", url);
  }

  function setArea(area) {
    state.area = area && area !== state.area ? area : null;
    state.tag = null;
    render();
  }

  function setTag(tag) {
    state.tag = tag && tag !== state.tag ? tag : null;
    state.area = null;
    render();
  }

  /* ---------- Events ---------- */

  buildChips();

  areaChips.addEventListener("click", function (event) {
    var b = event.target.closest("[data-area]");
    if (!b) {
      return;
    }
    var area = b.getAttribute("data-area");
    if (!area) {
      state.area = null;
      state.tag = null;
      render();
      return;
    }
    setArea(area);
  });

  tagChips.addEventListener("click", function (event) {
    var b = event.target.closest("[data-tag]");
    if (b) {
      setTag(b.getAttribute("data-tag"));
    }
  });

  chart.addEventListener("click", function (event) {
    var spot = event.target.closest(".spot");
    if (!spot) {
      return;
    }
    setArea(spot.getAttribute("data-area"));
    // On narrow screens the list sits under the chart: bring the results into view.
    if (window.matchMedia("(max-width: 960px)").matches && state.area) {
      resultsBar.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }
  });

  search.addEventListener("input", function () {
    state.query = search.value.slice(0, 60);
    render();
  });

  reset.addEventListener("click", function () {
    state.area = null;
    state.tag = null;
    state.query = "";
    search.value = "";
    render();
    search.focus();
  });

  // Start from the address: ?area=knee, ?topic=running, #c-ankle-sprain.
  var params = new URLSearchParams(window.location.search);
  var area = params.get("area");
  var topic = params.get("topic");
  if (area && D.areas[area]) {
    state.area = area;
  } else if (topic && D.tags[topic]) {
    state.tag = topic;
  }
  render();

  function openFromHash() {
    var id = window.location.hash.slice(1);
    if (id.indexOf("c-") !== 0) {
      return;
    }
    var target = document.getElementById(id);
    if (!target) {
      // Filtered out: show everything, then open it.
      state.area = null;
      state.tag = null;
      state.query = "";
      search.value = "";
      render();
      target = document.getElementById(id);
    }
    if (target) {
      target.open = true;
      target.scrollIntoView({ block: "start" });
      target.querySelector("summary").focus();
    }
  }
  openFromHash();
  window.addEventListener("hashchange", openFromHash);
})();
