/* The security page: the lock finder (pick a door, see what it usually has, what insurers ask for and
   what we would fit) and the small extras, both from data.js. */
(function () {
  var D = window.Nightjar;
  var C = window.NightjarCore;

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

  // level = the heading level for the job name, one below the heading the card sits under.
  function jobCard(key, level) {
    var job = D.jobs[key];
    var card = el("li", "fit-card");
    var head = el("div", "fit-head");
    head.appendChild(el("h" + level, "fit-name", job.name));
    var price = el("p", "fit-price");
    price.appendChild(el("small", "", job.from ? "from " : "fitted "));
    price.appendChild(document.createTextNode(C.money(job.day)));
    head.appendChild(price);
    card.appendChild(head);
    card.appendChild(el("p", "fit-note", job.note + (job.extra ? " Each extra one on the same visit: " + C.money(job.extra) + "." : "")));
    var link = el("a", "fit-link", "Get a quote for this");
    link.href = "prices.html?job=" + key + "#quote";
    card.appendChild(link);
    return card;
  }

  /* ---------- Lock finder ---------- */

  var finder = document.querySelector("[data-finder]");
  if (finder) {
    var picker = finder.querySelector("[data-doors]");
    var panel = finder.querySelector("[data-door-panel]");

    var show = function (key) {
      var door = D.doors[key];
      picker.querySelectorAll("button").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-door") === key));
      });
      panel.textContent = "";
      panel.appendChild(el("h3", "door-title", door.label));
      var facts = el("dl", "door-facts");
      [["What it usually has", door.has], ["What most insurers ask for", door.insurers]].forEach(function (row) {
        var box = el("div");
        box.append(el("dt", "", row[0]), el("dd", "", row[1]));
        facts.appendChild(box);
      });
      panel.appendChild(facts);
      panel.appendChild(el("p", "door-fit-title", "What we'd fit"));
      var list = el("ul", "fit-list");
      door.fit.forEach(function (k) {
        list.appendChild(jobCard(k, 4));
      });
      panel.appendChild(list);
      var tip = el("p", "door-tip");
      tip.appendChild(el("strong", "", "Worth knowing: "));
      tip.appendChild(document.createTextNode(door.tip));
      panel.appendChild(tip);
    };

    picker.textContent = "";
    Object.keys(D.doors).forEach(function (key, i) {
      var b = el("button", "door-btn");
      b.type = "button";
      b.setAttribute("data-door", key);
      b.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-controls", panel.id);
      b.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#' + (key === "upvc" || key === "patio" ? "i-handle" : "i-door") + '"/></svg>';
      b.appendChild(el("span", "", D.doors[key].label));
      b.addEventListener("click", function () {
        show(key);
      });
      picker.appendChild(el("li")).appendChild(b);
      if (i === 0) {
        show(key);
      }
    });
  }

  /* ---------- Small extras ---------- */

  var extras = document.querySelector("[data-extras]");
  if (extras) {
    extras.textContent = "";
    Object.keys(D.jobs).forEach(function (k) {
      if (D.jobs[k].group === "extras") {
        extras.appendChild(jobCard(k, 3));
      }
    });
  }
})();
