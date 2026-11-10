/* The treatments page: the full menu, built from data.js, with an Add button on each treatment. Chosen
   treatments go to the booking page in its address (book.html?t=biab,lash-lift), so nothing is stored. */
(function () {
  var data = window.Lunette;
  var H = window.LunetteHours;
  var site = window.LunetteSite;
  var el = site.el;
  var icon = site.icon;

  var box = document.querySelector("[data-menu]");
  var tray = document.querySelector("[data-tray]");
  if (!box || !tray) {
    return;
  }
  var traySummary = tray.querySelector("[data-tray-summary]");
  var trayLink = tray.querySelector("[data-tray-link]");
  var announce = el("p", "visually-hidden");
  announce.setAttribute("aria-live", "polite");
  document.body.appendChild(announce);

  var chosen = [];

  function render() {
    data.categories.forEach(function (cat) {
      var items = data.treatments.filter(function (t) {
        return t.cat === cat.id;
      });
      var section = el("section", "menu-cat");
      section.id = cat.id;
      section.setAttribute("aria-labelledby", "cat-" + cat.id);

      var head = el("header", "menu-cat-head");
      var arch = el("span", "cat-arch cat-arch-sm");
      arch.appendChild(icon(cat.icon, "cat-icon"));
      var h2 = el("h2", "h2", cat.name);
      h2.id = "cat-" + cat.id;
      head.append(arch, h2, el("p", "", cat.blurb));
      var bookLink = el("a", "text-link", "Book " + cat.name.toLowerCase());
      bookLink.href = "book.html?cat=" + cat.id;
      head.appendChild(bookLink);

      var list = el("ul", "menu-list");
      items.forEach(function (t) {
        var li = el("li", "menu-item");
        li.setAttribute("data-item", t.id);

        var line = el("div", "mi-line");
        line.appendChild(el("h3", "mi-name", t.name));
        var leader = el("span", "mi-leader");
        leader.setAttribute("aria-hidden", "true");
        line.appendChild(leader);
        var price = el("span", "mi-price", H.priceLabel(t));
        line.appendChild(price);

        var desc = el("p", "mi-desc", t.desc);

        var foot = el("div", "mi-foot");
        var time = el("span", "mi-time");
        time.appendChild(icon("i-clock", "icon icon-sm"));
        time.appendChild(document.createTextNode(H.duration(t.mins)));
        foot.appendChild(time);
        if (t.patch) {
          var badge = el("span", "badge badge-patch");
          badge.appendChild(icon("i-patch", "icon icon-sm"));
          badge.appendChild(document.createTextNode("Patch test needed"));
          foot.appendChild(badge);
        }

        var add = el("label", "mi-add");
        var input = el("input");
        input.type = "checkbox";
        input.value = t.id;
        input.setAttribute("data-add", t.id);
        var face = el("span", "mi-add-face");
        face.setAttribute("aria-hidden", "true");
        face.appendChild(icon("i-plus", "icon icon-sm mi-add-plus"));
        face.appendChild(icon("i-check", "icon icon-sm mi-add-check"));
        face.appendChild(el("span", "mi-add-word", "Add"));
        face.appendChild(el("span", "mi-add-done", "Added"));
        add.append(input, face, el("span", "visually-hidden", "Add " + t.name + " to your booking"));

        li.append(line, desc, foot, add);
        list.appendChild(li);
      });

      section.append(head, list);
      box.appendChild(section);
    });
  }

  function update(changed) {
    var items = chosen.map(H.treatment);
    var mins = 0;
    var price = 0;
    var from = false;
    items.forEach(function (t) {
      mins += t.mins;
      price += t.price;
      from = from || !!t.from;
    });
    box.querySelectorAll("[data-item]").forEach(function (li) {
      li.classList.toggle("is-chosen", chosen.indexOf(li.getAttribute("data-item")) !== -1);
    });
    if (!items.length) {
      tray.hidden = true;
      document.body.classList.remove("has-tray");
      if (changed) {
        announce.textContent = "Nothing chosen.";
      }
      return;
    }
    var text = items.length + (items.length === 1 ? " treatment" : " treatments") + ", " + H.duration(mins) + ", " +
      (from ? "from " : "") + H.money(price);
    traySummary.textContent = "";
    traySummary.appendChild(el("strong", "", items.length === 1 ? items[0].name : items.length + " treatments"));
    traySummary.appendChild(el("span", "", H.duration(mins) + " · " + (from ? "from " : "") + H.money(price)));
    trayLink.href = "book.html?t=" + chosen.join(",");
    tray.hidden = false;
    document.body.classList.add("has-tray");
    if (changed) {
      announce.textContent = changed + " Your booking: " + text + ".";
    }
  }

  box.addEventListener("change", function (event) {
    var input = event.target.closest("[data-add]");
    if (!input) {
      return;
    }
    var id = input.value;
    var t = H.treatment(id);
    if (input.checked && chosen.indexOf(id) === -1) {
      chosen.push(id);
      update("Added " + t.name + ".");
    } else if (!input.checked) {
      chosen = chosen.filter(function (x) {
        return x !== id;
      });
      update("Removed " + t.name + ".");
    }
  });

  tray.querySelector("[data-tray-clear]").addEventListener("click", function () {
    chosen = [];
    box.querySelectorAll("[data-add]").forEach(function (input) {
      input.checked = false;
    });
    update("Cleared.");
    var first = box.querySelector("[data-add]");
    if (first) {
      first.focus();
    }
  });

  render();
  // Coming back with the browser's back button can restore ticked boxes: pick them up.
  window.addEventListener("pageshow", function () {
    chosen = [];
    box.querySelectorAll("[data-add]").forEach(function (input) {
      if (input.checked) {
        chosen.push(input.value);
      }
    });
    update("");
  });
  update("");

  // The page was opened at #lashes and the like: the menu did not exist yet, so scroll there now.
  if (window.location.hash) {
    var target = document.getElementById(window.location.hash.slice(1));
    if (target) {
      target.scrollIntoView();
    }
  }
})();
