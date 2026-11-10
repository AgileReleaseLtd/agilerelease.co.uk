/* The menu page: every dish from data.js with its dietary tags and allergens, filters for dietary needs and
   allergens, and the drinks list. (Feast menus are drawn by site.js.) */
(function () {
  var data = window.Jonjoli;
  var UI = window.JonjoliUI;
  var el = UI.el;
  var money = UI.money;

  var box = document.querySelector("[data-menu]");
  if (!box) {
    return;
  }
  var tools = document.querySelector("[data-menu-tools]");
  var dietBox = document.querySelector("[data-diet-filters]");
  var allergenBox = document.querySelector("[data-allergen-filters]");
  var allergenSummary = document.querySelector("[data-allergen-summary]");
  var count = document.querySelector("[data-menu-count]");
  var clearButton = document.querySelector("[data-clear-filters]");
  var empty = document.querySelector("[data-menu-empty]");
  var jump = document.querySelector("[data-jump]");

  var wantDiets = []; // dietary tags every shown dish must have
  var avoid = []; // allergens no shown dish may contain
  var total = 0;

  var DIET_ORDER = ["vg", "v", "gf", "df"];

  // A vegan dish also counts as vegetarian and dairy-free.
  function hasDiet(dish, key) {
    var diets = dish.diets || [];
    if (diets.indexOf(key) !== -1) {
      return true;
    }
    return diets.indexOf("vg") !== -1 && (key === "v" || key === "df");
  }

  function matches(dish) {
    var allergens = dish.allergens || {};
    return wantDiets.every(function (k) {
      return hasDiet(dish, k);
    }) && avoid.every(function (k) {
      return !Object.prototype.hasOwnProperty.call(allergens, k);
    });
  }

  // The tags shown on a dish. Vegan already says vegetarian and dairy-free, so those are left off.
  function shownTags(dish) {
    var diets = dish.diets || [];
    var vegan = diets.indexOf("vg") !== -1;
    return DIET_ORDER.filter(function (k) {
      return diets.indexOf(k) !== -1 && !(vegan && (k === "v" || k === "df"));
    });
  }

  function allergenLine(dish) {
    var keys = Object.keys(dish.allergens || {});
    var span = el("span", "dish-allergens" + (keys.length ? "" : " is-none"));
    span.appendChild(UI.icon(keys.length ? "i-alert" : "i-check"));
    if (!keys.length) {
      span.appendChild(document.createTextNode("None of the 14 allergens"));
      return span;
    }
    var words = keys.map(function (k) {
      var what = dish.allergens[k];
      return data.allergens[k].toLowerCase() + (what ? " (" + what + ")" : "");
    });
    span.appendChild(document.createTextNode("Contains " + words.join(", ")));
    return span;
  }

  /* ---------- The menu ---------- */

  function render() {
    box.textContent = "";
    var links = [];
    data.menu.forEach(function (section) {
      var part = el("section", "menu-part");
      part.id = "m-" + section.id;
      part.setAttribute("aria-labelledby", "m-" + section.id + "-title");
      part.setAttribute("data-part", section.id);

      var head = el("header", "menu-part-head");
      var badge = el("span", "menu-part-icon");
      badge.appendChild(UI.icon(section.icon));
      var title = el("h2", "menu-part-title", section.title);
      title.id = "m-" + section.id + "-title";
      var sub = el("p", "menu-part-sub");
      if (section.ka) {
        sub.appendChild(el("span", "menu-part-ka", section.ka));
      }
      if (section.intro) {
        sub.appendChild(el("span", "", section.intro));
      }
      head.append(badge, title, sub);
      part.appendChild(head);

      var list = el("ul", "dish-list");
      section.dishes.forEach(function (dish) {
        total++;
        var li = el("li", "dish");
        li.setAttribute("data-dish", dish.id);
        var row = el("div", "dish-head");
        row.appendChild(el("h3", "dish-name", dish.name));
        var dots = el("span", "dish-dots");
        dots.setAttribute("aria-hidden", "true");
        row.appendChild(dots);
        var price = el("span", "dish-price", money(dish.price));
        if (dish.unit) {
          price.appendChild(el("small", "", " " + dish.unit));
        }
        row.appendChild(price);
        li.appendChild(row);
        li.appendChild(el("p", "dish-desc", dish.desc));
        var meta = el("p", "dish-meta");
        shownTags(dish).forEach(function (k) {
          meta.appendChild(el("span", "diet diet-" + k, data.diets[k]));
        });
        meta.appendChild(allergenLine(dish));
        li.appendChild(meta);
        list.appendChild(li);
      });
      part.appendChild(list);
      box.appendChild(part);

      var a = el("a", "", section.title);
      a.href = "#m-" + section.id;
      a.setAttribute("data-jump-to", section.id);
      links.push(a);
    });
    if (jump) {
      links.reverse().forEach(function (a) {
        jump.insertBefore(a, jump.firstChild);
      });
    }
  }

  /* ---------- Filters ---------- */

  function buildFilters() {
    DIET_ORDER.forEach(function (k) {
      var b = el("button", "chip diet-" + k, data.diets[k]);
      b.type = "button";
      b.setAttribute("aria-pressed", "false");
      b.setAttribute("data-diet", k);
      dietBox.appendChild(b);
    });
    Object.keys(data.allergens).forEach(function (k) {
      var label = el("label", "check");
      var input = el("input");
      input.type = "checkbox";
      input.name = "avoid";
      input.value = k;
      label.append(input, el("span", "", data.allergens[k]));
      allergenBox.appendChild(label);
    });

    dietBox.addEventListener("click", function (event) {
      var b = event.target.closest("[data-diet]");
      if (!b) {
        return;
      }
      var k = b.getAttribute("data-diet");
      var on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", String(on));
      wantDiets = wantDiets.filter(function (x) {
        return x !== k;
      });
      if (on) {
        wantDiets.push(k);
      }
      apply();
    });

    allergenBox.addEventListener("change", function () {
      avoid = Array.prototype.map.call(allergenBox.querySelectorAll("input:checked"), function (i) {
        return i.value;
      });
      apply();
    });

    clearButton.addEventListener("click", function () {
      wantDiets = [];
      avoid = [];
      dietBox.querySelectorAll("[data-diet]").forEach(function (b) {
        b.setAttribute("aria-pressed", "false");
      });
      allergenBox.querySelectorAll("input").forEach(function (i) {
        i.checked = false;
      });
      apply();
      dietBox.querySelector("[data-diet]").focus();
    });

    tools.hidden = false;
  }

  function apply() {
    var shown = 0;
    data.menu.forEach(function (section) {
      var visible = 0;
      section.dishes.forEach(function (dish) {
        var ok = matches(dish);
        box.querySelector('[data-dish="' + dish.id + '"]').hidden = !ok;
        if (ok) {
          visible++;
        }
      });
      shown += visible;
      box.querySelector('[data-part="' + section.id + '"]').hidden = !visible;
      var link = jump && jump.querySelector('[data-jump-to="' + section.id + '"]');
      if (link) {
        link.hidden = !visible;
      }
    });

    var filtering = wantDiets.length || avoid.length;
    count.textContent = "";
    count.appendChild(document.createTextNode("Showing "));
    count.appendChild(el("strong", "", String(shown)));
    count.appendChild(document.createTextNode(filtering ? " of " + total + " dishes" : " dishes"));
    clearButton.hidden = !filtering;

    allergenSummary.textContent = avoid.length
      ? "Leaving out: " + avoid.map(function (k) {
        return data.allergens[k];
      }).join(", ")
      : "Leave out dishes with an allergen";

    empty.hidden = shown > 0;
    empty.textContent = shown ? "" : "No dishes match all of these. Try fewer filters, or ask us: the kitchen can often change a dish for you.";
  }

  /* ---------- Drinks ---------- */

  function drinks() {
    var wrap = document.querySelector("[data-drinks]");
    if (!wrap) {
      return;
    }
    wrap.textContent = "";
    data.drinks.forEach(function (part) {
      var div = el("div", "drink-part");
      div.appendChild(el("h3", "", part.title));
      if (part.note) {
        div.appendChild(el("p", "drink-note", part.note));
      }
      var ul = el("ul");
      part.items.forEach(function (d) {
        var li = el("li", "drink");
        var head = el("div", "drink-head");
        head.appendChild(el("span", "drink-name", d.name));
        head.appendChild(el("span", "drink-kind", d.kind));
        var price = el("span", "drink-price");
        if (d.glass) {
          price.appendChild(document.createTextNode(money(d.glass) + " "));
          price.appendChild(el("small", "", "glass"));
          price.appendChild(document.createTextNode(" · " + money(d.bottle) + " "));
          price.appendChild(el("small", "", "bottle"));
        } else {
          price.textContent = money(d.price);
        }
        head.appendChild(price);
        li.appendChild(head);
        li.appendChild(el("p", "drink-desc", d.desc));
        ul.appendChild(li);
      });
      div.appendChild(ul);
      wrap.appendChild(div);
    });
  }

  render();
  buildFilters();
  apply();
  drinks();
})();
