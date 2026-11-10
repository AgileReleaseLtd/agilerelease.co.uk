/* The allergens page: every dish with its allergens (and the ones some choices add), a filter that hides
   dishes containing the allergens picked, and the list of the 14 allergens. All from data.js. */
(function () {
  var data = window.Kor;
  var B = window.KorBasket;
  var UI = window.KorUI;
  var el = UI.el;

  var list = document.querySelector("[data-allergen-list]");
  var chips = document.querySelector("[data-filters]");
  if (!list || !chips) {
    return;
  }
  var count = document.querySelector("[data-filter-count]");
  var clear = document.querySelector("[data-filter-clear]");
  var hidden = {}; // allergen id -> true while dishes with it are hidden

  function name(a) {
    return a.short || a.name;
  }

  // Only allergens that are on the menu are worth a filter chip.
  var used = {};
  data.menu.forEach(function (cat) {
    cat.items.forEach(function (item) {
      B.allergens(item).forEach(function (a) {
        used[a.id] = true;
      });
      B.optionalAllergens(item).forEach(function (x) {
        used[x.allergen.id] = true;
      });
    });
  });

  data.allergens.forEach(function (a) {
    if (!used[a.id]) {
      return;
    }
    var b = el("button", "chip", name(a));
    b.type = "button";
    b.setAttribute("aria-pressed", "false");
    b.setAttribute("data-allergen", a.id);
    chips.appendChild(b);
  });

  function render() {
    list.textContent = "";
    var shown = 0;
    var total = 0;
    data.menu.forEach(function (cat) {
      var rows = el("div", "allergen-rows");
      cat.items.forEach(function (item) {
        total++;
        var has = B.allergens(item);
        if (has.some(function (a) {
          return hidden[a.id];
        })) {
          return;
        }
        shown++;
        var row = el("div", "allergen-row");
        row.appendChild(el("b", "", item.name));
        var box = el("div", "allergen-chips");
        if (has.length) {
          var label = el("span", "visually-hidden", "Contains: ");
          box.appendChild(label);
          has.forEach(function (a) {
            box.appendChild(el("span", "a-chip", name(a)));
          });
        } else {
          box.appendChild(el("span", "a-none", "None of the 14 major allergens"));
        }
        var extra = B.optionalAllergens(item);
        if (extra.length) {
          box.appendChild(el("p", "a-extra", "Some choices add: " + extra.map(function (x) {
            return name(x.allergen).toLowerCase() + " (" + x.because.join(", ").toLowerCase() + ")";
          }).join("; ") + "."));
        }
        row.appendChild(box);
        rows.appendChild(row);
      });
      if (!rows.childNodes.length) {
        return;
      }
      var sec = el("section", "allergen-cat");
      var h = el("h3");
      h.appendChild(UI.icon(cat.icon, "pic"));
      h.appendChild(document.createTextNode(cat.title));
      sec.appendChild(h);
      sec.appendChild(rows);
      list.appendChild(sec);
    });
    if (!shown) {
      list.appendChild(el("p", "allergen-empty", "Every dish contains at least one of the allergens you picked. Please call us and we will see what we can do."));
    }
    var picked = Object.keys(hidden).length;
    count.textContent = picked ? "Showing " + shown + " of " + total + " dishes" : "Showing all " + total + " dishes";
    clear.hidden = !picked;
  }

  chips.addEventListener("click", function (event) {
    var b = event.target.closest("[data-allergen]");
    if (!b) {
      return;
    }
    var id = b.getAttribute("data-allergen");
    if (hidden[id]) {
      delete hidden[id];
    } else {
      hidden[id] = true;
    }
    b.setAttribute("aria-pressed", String(!!hidden[id]));
    render();
  });

  clear.addEventListener("click", function () {
    hidden = {};
    chips.querySelectorAll("[data-allergen]").forEach(function (b) {
      b.setAttribute("aria-pressed", "false");
    });
    render();
    chips.querySelector("[data-allergen]").focus();
  });

  var legend = document.querySelector("[data-allergen-legend]");
  if (legend) {
    data.allergens.forEach(function (a, i) {
      var li = el("li");
      var s = el("strong");
      s.appendChild(el("span", "allergen-num", String(i + 1)));
      s.appendChild(document.createTextNode(a.name));
      li.appendChild(s);
      li.appendChild(el("span", "", a.where));
      legend.appendChild(li);
    });
  }

  render();
})();
