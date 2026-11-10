/* The project gallery: every project in data.js as a before-and-after comparison, with filters by type.
   The chosen filter is kept in the address (projects.html?type=loft), so the home page can link to it. */
(function () {
  var data = window.Kember;
  var KD = window.KD;
  var C = window.KDCompare;
  var el = KD.el;

  var list = document.querySelector("[data-projects]");
  var filterBox = document.querySelector("[data-filters]");
  var count = document.querySelector("[data-count]");
  if (!list || !filterBox) {
    return;
  }

  // "Nine jobs, before and after": the number in the heading follows data.js.
  var words = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
  document.querySelectorAll("[data-project-count]").forEach(function (node) {
    var n = data.projects.length;
    node.textContent = words[n] || String(n);
  });

  // Types that have at least one project, in the order of data.types.
  var types = Object.keys(data.types).filter(function (t) {
    return data.projects.some(function (p) {
      return p.type === t;
    });
  });

  function countOf(type) {
    return data.projects.filter(function (p) {
      return type === "all" || p.type === type;
    }).length;
  }

  var buttons = [];
  [["all", "All projects", null]].concat(types.map(function (t) {
    return [t, data.types[t].plural, data.types[t].icon];
  })).forEach(function (f) {
    var b = el("button", "chip");
    b.type = "button";
    b.setAttribute("data-filter", f[0]);
    b.setAttribute("aria-pressed", "false");
    if (f[2]) {
      b.appendChild(KD.icon(f[2]));
    }
    b.appendChild(el("span", "", f[1]));
    b.appendChild(el("span", "chip-count", String(countOf(f[0]))));
    b.addEventListener("click", function () {
      show(f[0], true);
    });
    buttons.push(b);
    filterBox.appendChild(b);
  });

  // Each project once; filtering hides and shows them.
  list.textContent = "";
  var cards = data.projects.map(function (project) {
    var card = el("article", "project");
    card.id = project.id;
    card.setAttribute("data-type", project.type);
    card.setAttribute("aria-labelledby", project.id + "-title");
    var body = C.details(project, "h3");
    body.querySelector(".project-title").id = project.id + "-title";
    body.appendChild(C.links(project, false));
    card.append(C.create(project), body);
    list.appendChild(card);
    return card;
  });

  function show(type, fromClick) {
    if (type !== "all" && types.indexOf(type) === -1) {
      type = "all";
    }
    buttons.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === type));
    });
    var n = 0;
    cards.forEach(function (card) {
      var on = type === "all" || card.getAttribute("data-type") === type;
      card.hidden = !on;
      n += on ? 1 : 0;
    });
    if (count) {
      var what = type === "all" ? (n === 1 ? "project" : "projects") : (n === 1 ? data.types[type].name.toLowerCase() : data.types[type].plural.toLowerCase());
      count.textContent = "Showing " + n + " " + what;
    }
    if (fromClick && window.history.replaceState) {
      var url = new URL(window.location.href);
      if (type === "all") {
        url.searchParams.delete("type");
      } else {
        url.searchParams.set("type", type);
      }
      url.hash = "";
      window.history.replaceState(null, "", url);
    }
  }

  show(new URLSearchParams(window.location.search).get("type") || "all", false);

  // A link to one project (projects.html#penge-dormer) scrolls to it once the cards exist.
  if (window.location.hash) {
    var target = document.getElementById(window.location.hash.slice(1));
    if (target && target.classList.contains("project")) {
      target.hidden = false;
      target.scrollIntoView();
    }
  }
})();
