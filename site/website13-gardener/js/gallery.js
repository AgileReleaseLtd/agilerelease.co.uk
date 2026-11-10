/* Project gallery: before-and-after tiles from data.js, with type filters on the projects page
   (projects.html?type=patio opens filtered). The home page shows one project of each of the first types.
   On the sample site the tiles show drawings; a real site shows the firm's own photos. */
(function () {
  var data = window.Hornbeam;
  var G = window.HornbeamGarden;
  var el = G.el;

  var root = document.querySelector("[data-gallery]");
  if (!root) {
    return;
  }

  var limit = Number(root.getAttribute("data-gallery-limit")) || 0;
  var projects = data.projects;
  if (limit) {
    // One project per type, in the order the types are listed.
    var seen = {};
    projects = projects.filter(function (p) {
      if (seen[p.type]) {
        return false;
      }
      seen[p.type] = true;
      return true;
    }).slice(0, limit);
  }

  var tiles = projects.map(tile);
  tiles.forEach(function (t) {
    root.appendChild(t);
  });

  filters();

  function tile(p) {
    var li = el("li", "project");
    li.setAttribute("data-type", p.type);

    var media = el("div", "project-media");
    var before = el("img", "is-off");
    before.src = "img/projects/" + p.id + "-before.svg";
    before.alt = p.before;
    before.setAttribute("aria-hidden", "true");
    var after = el("img");
    after.src = "img/projects/" + p.id + "-after.svg";
    after.alt = p.after;
    [before, after].forEach(function (img) {
      img.width = 480;
      img.height = 360;
      img.loading = "lazy";
      img.decoding = "async";
    });

    var compare = el("div", "compare");
    compare.setAttribute("role", "group");
    compare.setAttribute("aria-label", "Show " + p.title.toLowerCase() + " before or after");
    var bBtn = el("button", "", "Before");
    var aBtn = el("button", "", "After");
    [bBtn, aBtn].forEach(function (b) {
      b.type = "button";
    });

    function show(which) {
      var isAfter = which === "after";
      after.classList.toggle("is-off", !isAfter);
      before.classList.toggle("is-off", isAfter);
      after.setAttribute("aria-hidden", String(!isAfter));
      before.setAttribute("aria-hidden", String(isAfter));
      aBtn.setAttribute("aria-pressed", String(isAfter));
      bBtn.setAttribute("aria-pressed", String(!isAfter));
      li.setAttribute("data-showing", which);
    }
    bBtn.addEventListener("click", function () {
      show("before");
    });
    aBtn.addEventListener("click", function () {
      show("after");
    });
    compare.append(bBtn, aBtn);

    var note = el("span", "photo-note");
    note.appendChild(G.icon("i-camera"));
    note.append("Our photo goes here");

    media.append(before, after, compare, note);
    show("after");

    var body = el("div", "project-body");
    var meta = el("p", "project-meta");
    meta.appendChild(el("span", "type-chip is-" + p.type, data.projectTypes[p.type]));
    meta.append(p.area + " · " + p.days);
    body.appendChild(meta);
    body.appendChild(el("h3", "", p.title));
    body.appendChild(el("p", "project-text", p.text));

    li.append(media, body);
    return li;
  }

  function filters() {
    var bar = document.querySelector("[data-filters]");
    var status = document.querySelector("[data-gallery-status]");
    if (!bar) {
      return;
    }
    var types = ["all"].concat(Object.keys(data.projectTypes));
    var buttons = types.map(function (type) {
      var count = type === "all" ? projects.length : projects.filter(function (p) {
        return p.type === type;
      }).length;
      var b = el("button", "chip");
      b.type = "button";
      b.setAttribute("data-filter", type);
      b.append(type === "all" ? "All projects" : data.projectTypes[type]);
      var c = el("span", "chip-count", String(count));
      c.setAttribute("aria-hidden", "true");
      b.appendChild(c);
      b.addEventListener("click", function () {
        apply(type, true);
      });
      bar.appendChild(b);
      return b;
    });

    function apply(type, fromClick) {
      var shown = 0;
      tiles.forEach(function (t) {
        var on = type === "all" || t.getAttribute("data-type") === type;
        t.hidden = !on;
        if (on) {
          shown++;
        }
      });
      buttons.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === type));
      });
      if (status) {
        status.textContent = type === "all"
          ? "Showing all " + shown + " projects."
          : "Showing " + shown + " " + (shown === 1 ? "project" : "projects") + ": " + data.projectTypes[type].toLowerCase() + ".";
      }
      if (fromClick && window.history && window.history.replaceState) {
        var url = new URL(window.location.href);
        if (type === "all") {
          url.searchParams.delete("type");
        } else {
          url.searchParams.set("type", type);
        }
        window.history.replaceState(null, "", url.pathname.split("/").pop() + url.search);
      }
    }

    var wanted = new URLSearchParams(window.location.search).get("type");
    apply(data.projectTypes[wanted] ? wanted : "all", false);
  }
})();
