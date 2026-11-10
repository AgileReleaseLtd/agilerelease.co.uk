/* The menu page: the menu from data.js, the vegan / vegetarian / gluten-free filters, and ordering ahead
   for collection. An order becomes a WhatsApp message written on the visitor's own device; nothing is
   sent to or stored by this website. */
(function () {
  var data = window.Cobnut;
  var D = window.CobnutDays;
  var UI = window.CobnutUI;
  var el = UI.el;
  var icon = UI.icon;

  var menuBox = document.querySelector("[data-menu]");
  var dialog = document.getElementById("order-dialog");
  if (!menuBox || !dialog) {
    return;
  }

  var filtersBox = document.querySelector("[data-filters]");
  var filterButtons = document.querySelectorAll("[data-diet]");
  var countLine = document.querySelector("[data-menu-count]");
  var panel = document.querySelector("[data-order-panel]");
  var bar = document.querySelector("[data-order-bar]");
  var form = dialog.querySelector("[data-order-form]");
  var sent = dialog.querySelector("[data-sent]");
  var nameInput = form.elements.name;
  var nameError = form.querySelector('[data-error-for="name"]');
  var timeSelect = form.querySelector("[data-time-select]");
  var timeHint = form.querySelector("[data-time-hint]");

  var items = {}; // id -> item, with .section
  var chosen = []; // diet filters switched on: "vg", "v", "gf"
  var order = []; // [{ id, qty }] in the order they were added

  // A spoken note for screen readers when the order changes.
  var live = el("p", "visually-hidden");
  live.setAttribute("aria-live", "polite");
  document.body.appendChild(live);

  data.menu.forEach(function (sec) {
    sec.items.forEach(function (item) {
      item.section = sec;
      items[item.id] = item;
    });
  });

  /* ---------- The menu ---------- */

  function renderMenu() {
    menuBox.textContent = "";
    data.menu.forEach(function (sec) {
      var section = el("section", "menu-section");
      section.id = sec.id;
      section.setAttribute("aria-labelledby", sec.id + "-title");

      var head = el("header", "menu-section-head");
      var badge = el("span", "mp-icon");
      badge.appendChild(icon(sec.icon));
      var title = el("h2", "h2", sec.title);
      title.id = sec.id + "-title";
      head.append(badge, title, el("p", "", sec.note));
      section.appendChild(head);

      var list = el("ul", "menu-list");
      sec.items.forEach(function (item) {
        list.appendChild(renderItem(item));
      });
      section.appendChild(list);

      var none = el("p", "menu-empty");
      none.hidden = true;
      none.setAttribute("data-empty", "");
      section.appendChild(none);
      menuBox.appendChild(section);
    });
  }

  // Name ........ £3.70 across the top; the description and tags, with the Add button beside them.
  function renderItem(item) {
    var li = el("li", "menu-item");
    li.setAttribute("data-item", item.id);
    var name = el("h3", "mi-name leader");
    name.appendChild(el("span", "", item.name));
    name.appendChild(el("span", "leader-price", D.money(item.price)));
    var main = el("div", "mi-main");
    main.appendChild(el("p", "mi-desc", item.desc));
    // What the dish is as it comes, as tags; what it can be made, in words.
    var tags = UI.tagEls(item.diet);
    if (tags.length || item.canNote) {
      var tagBox = el("p", "mi-tags");
      tags.forEach(function (t) {
        tagBox.appendChild(t);
      });
      if (item.canNote) {
        tagBox.appendChild(el("span", "mi-can", item.canNote));
      }
      main.appendChild(tagBox);
    }
    var action = el("div", "mi-action");
    action.setAttribute("data-action", item.id);
    li.append(name, main, action);
    fillAction(action, item);
    return li;
  }

  function qtyOf(id) {
    var line = order.filter(function (l) {
      return l.id === id;
    })[0];
    return line ? line.qty : 0;
  }

  // A stepper: [-] 2 [+], for the menu and the order panel.
  function stepper(item, qty) {
    var box = el("span", "stepper");
    box.setAttribute("role", "group");
    box.setAttribute("aria-label", item.name + " in your order");
    var minus = el("button");
    minus.type = "button";
    minus.setAttribute("data-step", "-1");
    minus.setAttribute("data-id", item.id);
    minus.setAttribute("aria-label", "Remove one " + item.name);
    minus.appendChild(icon("i-minus"));
    var out = el("output", "", String(qty));
    var plus = el("button");
    plus.type = "button";
    plus.setAttribute("data-step", "1");
    plus.setAttribute("data-id", item.id);
    plus.setAttribute("aria-label", "Add one more " + item.name);
    plus.disabled = qty >= data.orderAhead.maxEach;
    plus.appendChild(icon("i-plus"));
    box.append(minus, out, plus);
    return box;
  }

  function fillAction(box, item) {
    box.textContent = "";
    var qty = qtyOf(item.id);
    if (qty) {
      box.appendChild(stepper(item, qty));
    } else {
      var add = el("button", "add-btn");
      add.type = "button";
      add.setAttribute("data-step", "1");
      add.setAttribute("data-id", item.id);
      add.setAttribute("aria-label", "Add " + item.name + " to your order");
      add.appendChild(icon("i-plus"));
      add.appendChild(document.createTextNode("Add"));
      box.appendChild(add);
    }
  }

  /* ---------- Filters ---------- */

  function matches(item, key) {
    var all = (item.diet || []).concat(item.can || []);
    if (key === "v") {
      return all.indexOf("v") >= 0 || all.indexOf("vg") >= 0;
    }
    return all.indexOf(key) >= 0;
  }

  function filterWords() {
    var names = { vg: "vegan", v: "vegetarian", gf: "gluten-free" };
    var words = chosen.map(function (k) {
      return names[k];
    });
    return words.length > 1 ? words.slice(0, -1).join(", ") + " and " + words[words.length - 1] : words[0];
  }

  function applyFilters() {
    var shown = 0;
    var total = 0;
    data.menu.forEach(function (sec) {
      var section = document.getElementById(sec.id);
      var inSection = 0;
      sec.items.forEach(function (item) {
        var ok = chosen.every(function (k) {
          return matches(item, k);
        });
        section.querySelector('[data-item="' + item.id + '"]').hidden = !ok;
        total++;
        if (ok) {
          inSection++;
          shown++;
        }
      });
      var none = section.querySelector("[data-empty]");
      none.hidden = inSection > 0;
      none.textContent = inSection ? "" : "Nothing in " + sec.title.toLowerCase().replace("&", "and") + " is " + filterWords() + " as it stands. Ask us: we can often change a dish.";
    });

    filterButtons.forEach(function (b) {
      b.setAttribute("aria-pressed", String(chosen.indexOf(b.getAttribute("data-diet")) >= 0));
    });

    countLine.textContent = "";
    countLine.hidden = !chosen.length;
    if (chosen.length) {
      countLine.appendChild(document.createTextNode("Showing " + shown + " of " + total + " dishes and drinks that are " + filterWords() + ", or can be made that way."));
      var clear = el("button", "", "Show everything");
      clear.type = "button";
      clear.addEventListener("click", function () {
        chosen = [];
        applyFilters();
        filterButtons[0].focus();
      });
      countLine.appendChild(clear);
    }

    if (window.history.replaceState) {
      var url = new URL(window.location.href);
      if (chosen.length) {
        url.searchParams.set("diet", chosen.join(","));
      } else {
        url.searchParams.delete("diet");
      }
      window.history.replaceState(null, "", url);
    }
  }

  filterButtons.forEach(function (b) {
    b.addEventListener("click", function () {
      var key = b.getAttribute("data-diet");
      var at = chosen.indexOf(key);
      if (at >= 0) {
        chosen.splice(at, 1);
      } else {
        chosen.push(key);
      }
      applyFilters();
    });
  });

  /* ---------- The order ---------- */

  function count() {
    return order.reduce(function (n, l) {
      return n + l.qty;
    }, 0);
  }

  function total() {
    return order.reduce(function (sum, l) {
      return sum + items[l.id].price * l.qty;
    }, 0);
  }

  function itemsText(n) {
    return n + (n === 1 ? " item" : " items");
  }

  function change(id, step) {
    var line = order.filter(function (l) {
      return l.id === id;
    })[0];
    if (!line && step > 0) {
      line = { id: id, qty: 0 };
      order.push(line);
    }
    if (!line) {
      return;
    }
    line.qty = Math.max(0, Math.min(data.orderAhead.maxEach, line.qty + step));
    if (!line.qty) {
      order.splice(order.indexOf(line), 1);
    }
    var item = items[id];
    live.textContent = (step > 0 ? "Added " : "Removed ") + item.name + ". " + (line.qty ? line.qty + " in your order. " : "") + "Total " + D.money(total()) + ".";
    renderOrder();
  }

  // Clicks on any stepper or Add button, in the menu or the order panel.
  document.addEventListener("click", function (event) {
    var b = event.target.closest("[data-step]");
    if (!b || b.disabled) {
      return;
    }
    var id = b.getAttribute("data-id");
    var step = +b.getAttribute("data-step");
    var where = b.closest("[data-action]") ? "menu" : b.closest("[data-order-panel]") ? "panel" : "dialog";
    change(id, step);
    restoreFocus(where, id, step);
  });

  // After a re-render, put the focus back on the matching control so keyboard users do not lose their place.
  function restoreFocus(where, id, step) {
    var scope = where === "menu" ? document.querySelector('[data-action="' + id + '"]') : where === "panel" ? panel : dialog;
    if (!scope) {
      return;
    }
    var target = scope.querySelector('[data-id="' + id + '"][data-step="' + step + '"]:not([disabled])') ||
      scope.querySelector('[data-id="' + id + '"]:not([disabled])');
    if (target) {
      target.focus();
    } else if (where === "panel") {
      var first = panel.querySelector("button");
      (first || document.getElementById("order")).focus();
    } else if (where === "dialog") {
      var next = dialog.querySelector("[data-step]") || timeSelect;
      next.focus();
    }
  }

  function orderLines(withSteppers) {
    var ul = el("ul", withSteppers ? "order-lines" : "summary-lines");
    order.forEach(function (l) {
      var item = items[l.id];
      if (withSteppers) {
        var li = el("li", "order-line");
        var name = el("span", "order-line-name", item.name);
        name.appendChild(el("span", "order-line-price", D.money(item.price * l.qty) + (l.qty > 1 ? " (" + D.money(item.price) + " each)" : "")));
        li.append(name, stepper(item, l.qty));
        ul.appendChild(li);
      } else {
        var row = el("li", "leader");
        row.appendChild(el("span", "", l.qty + " x " + item.name));
        row.appendChild(el("span", "leader-price", D.money(item.price * l.qty)));
        ul.appendChild(row);
      }
    });
    return ul;
  }

  function renderOrder() {
    var n = count();
    // Menu buttons
    document.querySelectorAll("[data-action]").forEach(function (box) {
      fillAction(box, items[box.getAttribute("data-action")]);
    });
    // Sidebar panel
    panel.textContent = "";
    if (!n) {
      var empty = el("p", "order-empty");
      empty.appendChild(document.createTextNode("Nothing here yet. Press "));
      empty.appendChild(el("strong", "", "Add"));
      empty.appendChild(document.createTextNode(" on anything you fancy."));
      panel.appendChild(empty);
    } else {
      panel.appendChild(orderLines(true));
      var tot = el("p", "order-total");
      tot.append(el("span", "", "Total, " + itemsText(n)), el("span", "", D.money(total())));
      panel.appendChild(tot);
      var go = el("button", "btn btn-primary btn-block");
      go.type = "button";
      go.setAttribute("data-open-order", "");
      go.appendChild(icon("i-clock"));
      go.appendChild(document.createTextNode("Choose a time and send"));
      panel.appendChild(go);
      var clear = el("button", "order-clear", "Clear the order");
      clear.type = "button";
      clear.setAttribute("data-clear", "");
      panel.appendChild(clear);
    }
    // Phone bar
    document.body.classList.toggle("has-order", n > 0);
    bar.querySelector("[data-bar-total]").textContent = D.money(total());
    bar.querySelector("[data-bar-count]").textContent = itemsText(n) + " to collect";
    // The dialog, if it is open
    if (dialog.open && !form.hidden) {
      if (n) {
        fillSummary();
      } else {
        dialog.close();
      }
    }
  }

  document.addEventListener("click", function (event) {
    if (event.target.closest("[data-open-order]")) {
      openOrder();
    } else if (event.target.closest("[data-clear]")) {
      order = [];
      live.textContent = "Your order is empty.";
      renderOrder();
      document.getElementById("order").focus();
    }
  });

  /* ---------- Collection time and sending ---------- */

  function fillSummary() {
    var box = dialog.querySelector("[data-order-summary]");
    box.textContent = "";
    box.appendChild(orderLines(false));
    var tot = el("p", "leader summary-total");
    tot.append(el("span", "", "Total"), el("span", "leader-price", D.money(total())));
    box.appendChild(tot);
  }

  function fillTimes() {
    var now = new Date();
    var days = D.collectionDays(now);
    timeSelect.textContent = "";
    days.forEach(function (day) {
      var group = el("optgroup");
      group.label = day.label;
      // The closed select shows only the option, so each one says the day too.
      var prefix = day.words === "today" ? "Today" : day.words === "tomorrow" ? "Tomorrow" : D.fmt.short.format(day.date);
      day.times.forEach(function (t) {
        var opt = el("option", "", prefix + " at " + D.clock(t));
        opt.value = D.isoDate(t) + "T" + ("0" + t.getHours()).slice(-2) + ":" + ("0" + t.getMinutes()).slice(-2);
        group.appendChild(opt);
      });
      timeSelect.appendChild(group);
    });
    var first = days[0];
    if (!first) {
      timeHint.textContent = "Ordering ahead is not open right now. Please message us.";
    } else if (first.words === "today") {
      timeHint.textContent = "The earliest is " + D.clock(first.times[0]) + ", 15 minutes after you send it.";
    } else {
      timeHint.textContent = "We are closed now, so the earliest is " + (first.words === "tomorrow" ? "tomorrow" : D.fmt.long.format(first.date)) + " at " + D.clock(first.times[0]) + ".";
    }
  }

  function openOrder() {
    if (!count() || typeof dialog.showModal !== "function") {
      return;
    }
    fillSummary();
    fillTimes();
    form.hidden = false;
    sent.hidden = true;
    nameError.hidden = true;
    nameInput.removeAttribute("aria-invalid");
    dialog.showModal();
    timeSelect.focus();
  }

  // "today at 10:30am", "tomorrow (Wednesday 11 November) at 7:45am" or "Thursday 12 November at 9am".
  function collectText(value) {
    var t = new Date(+value.slice(0, 4), +value.slice(5, 7) - 1, +value.slice(8, 10), +value.slice(11, 13), +value.slice(14, 16));
    var words = D.dayWords(t, new Date());
    var day = words === "today" ? "today" : words === "tomorrow" ? "tomorrow (" + D.fmt.long.format(t) + ")" : D.fmt.long.format(t);
    return day + " at " + D.clock(t);
  }

  function message() {
    var lines = ["Hi Cobnut, I'd like to order for collection.", ""];
    order.forEach(function (l) {
      var item = items[l.id];
      lines.push(l.qty + " x " + item.name + " (" + D.money(item.price * l.qty) + ")");
    });
    lines.push("Total: " + D.money(total()));
    lines.push("");
    lines.push("Collect: " + collectText(timeSelect.value));
    lines.push("Name: " + nameInput.value.trim());
    var note = form.elements.note.value.trim();
    if (note) {
      lines.push("Note: " + note);
    }
    lines.push("I'll pay when I collect.");
    return lines.join("\n");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!nameInput.value.trim()) {
      nameError.hidden = false;
      nameInput.setAttribute("aria-invalid", "true");
      nameInput.focus();
      return;
    }
    if (!timeSelect.value) {
      timeSelect.focus();
      return;
    }
    var text = message();
    if (data.sample) {
      sent.querySelector("[data-message]").textContent = text;
      form.hidden = true;
      sent.hidden = false;
      sent.querySelector("[data-sent-title]").focus();
      return;
    }
    UI.sendWhatsApp(text);
    dialog.close();
  });

  nameInput.addEventListener("input", function () {
    if (nameInput.value.trim()) {
      nameError.hidden = true;
      nameInput.removeAttribute("aria-invalid");
    }
  });

  dialog.querySelectorAll("[data-close]").forEach(function (b) {
    b.addEventListener("click", function () {
      dialog.close();
    });
  });

  // "Done" after a (sample) send starts a fresh order.
  dialog.querySelector("[data-done]").addEventListener("click", function () {
    dialog.close();
    order = [];
    form.reset();
    renderOrder();
  });

  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  /* ---------- Start ---------- */

  renderMenu();
  filtersBox.hidden = false;
  var params = new URLSearchParams(window.location.search);
  chosen = (params.get("diet") || "").split(",").filter(function (k, i, all) {
    return UI.DIET[k] && all.indexOf(k) === i;
  });
  applyFilters();
  renderOrder();

  // #order on a phone: the order panel is the bar at the bottom, so show the first section instead.
  if (window.location.hash === "#order" && window.matchMedia("(max-width: 1060px)").matches) {
    var help = document.querySelector("[data-order-help]");
    if (help) {
      help.scrollIntoView();
    }
  } else if (window.location.hash && window.location.hash !== "#order") {
    var target = document.getElementById(window.location.hash.slice(1));
    if (target) {
      target.scrollIntoView();
    }
  }
})();
