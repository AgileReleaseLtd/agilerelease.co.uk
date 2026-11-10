/* The menu page: the menu, the options dialog, the basket (beside the menu on wide screens, in a sheet on
   phones), the delivery minimum, and the checkout that writes the order as a WhatsApp message (or email).
   Nothing is sent to or kept by this website. */
(function () {
  var data = window.Kor;
  var H = window.KorHours;
  var B = window.KorBasket;
  var UI = window.KorUI;
  var el = UI.el;
  var icon = UI.icon;

  var menuBox = document.querySelector("[data-menu]");
  if (!menuBox) {
    return;
  }

  function smooth() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  }

  /* ---------- Menu ---------- */

  var nav = document.querySelector("[data-cat-nav]");

  function renderMenu() {
    data.menu.forEach(function (cat) {
      var sec = el("section", "menu-cat");
      sec.id = "cat-" + cat.id;
      sec.setAttribute("aria-labelledby", "h-" + cat.id);
      var head = el("div", "menu-cat-head");
      head.appendChild(icon(cat.icon, "pic"));
      var h = el("h2", "menu-cat-title", cat.title);
      h.id = "h-" + cat.id;
      head.appendChild(h);
      sec.appendChild(head);
      if (cat.blurb) {
        sec.appendChild(el("p", "menu-cat-blurb", cat.blurb));
      }
      var ul = el("ul", "dish-grid");
      cat.items.forEach(function (item) {
        ul.appendChild(UI.dishCard(item, "button"));
      });
      sec.appendChild(ul);
      menuBox.appendChild(sec);

      var li = el("li");
      var a = el("a");
      a.href = "#cat-" + cat.id;
      a.appendChild(icon(cat.icon, "pic"));
      a.appendChild(document.createTextNode(cat.title));
      li.appendChild(a);
      nav.appendChild(li);
    });
  }

  // Marks the section in view in the chip bar, and keeps its chip in sight.
  function scrollSpy() {
    if (!("IntersectionObserver" in window)) {
      return;
    }
    var links = nav.querySelectorAll("a");
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }
        var id = "#" + entry.target.id;
        links.forEach(function (a) {
          var on = a.getAttribute("href") === id;
          if (on) {
            a.setAttribute("aria-current", "true");
            var left = a.offsetLeft - 16;
            if (nav.scrollTo) {
              nav.scrollTo({ left: left, behavior: smooth() });
            } else {
              nav.scrollLeft = left;
            }
          } else {
            a.removeAttribute("aria-current");
          }
        });
      });
    }, { rootMargin: "-35% 0px -60% 0px" });
    menuBox.querySelectorAll(".menu-cat").forEach(function (sec) {
      observer.observe(sec);
    });
  }

  /* ---------- Toast ---------- */

  var toastBox = document.querySelector("[data-toast]");
  var toastTimer = null;

  function toast(text) {
    toastBox.textContent = text;
    toastBox.classList.remove("is-hidden");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastBox.classList.add("is-hidden");
    }, 2600);
  }

  /* ---------- The options dialog ---------- */

  var itemDialog = document.getElementById("item-dialog");
  var itemForm = itemDialog.querySelector("[data-item-form]");
  var current = null; // { item, choices, qty }

  function readChoices() {
    var out = {};
    B.groups(current.item).forEach(function (g) {
      var inputs = Array.prototype.slice.call(itemForm.querySelectorAll('[name="g-' + g.id + '"]'));
      if (g.def.type === "many") {
        out[g.id] = inputs.filter(function (i) {
          return i.checked;
        }).map(function (i) {
          return i.value;
        });
      } else {
        var on = inputs.filter(function (i) {
          return i.checked;
        })[0];
        if (on) {
          out[g.id] = on.value;
        }
      }
    });
    return out;
  }

  function renderGroups() {
    var box = itemForm.querySelector("[data-item-groups]");
    box.textContent = "";
    var picked = current.choices;
    B.groups(current.item).forEach(function (g) {
      var fs = el("fieldset", "option-group");
      fs.setAttribute("data-group", g.id);
      var legend = el("legend", "", g.def.label);
      if (g.def.type === "many") {
        legend.appendChild(el("small", "", "Optional"));
      }
      fs.appendChild(legend);
      var wrap = el("div", "choices");
      g.def.choices.forEach(function (c) {
        var label = el("label", "choice");
        var input = el("input");
        input.type = g.def.type === "many" ? "checkbox" : "radio";
        input.name = "g-" + g.id;
        input.value = c.id;
        var v = picked[g.id];
        input.checked = Array.isArray(v) ? v.indexOf(c.id) !== -1 : v === c.id;
        var text = el("span", "choice-text");
        var b = el("b", "", c.label);
        if (g.def.spice && c.heat) {
          var heat = el("span", "heat");
          for (var i = 0; i < c.heat; i++) {
            heat.appendChild(icon("i-chilli", "icon icon-fill"));
          }
          b.appendChild(document.createTextNode(" "));
          b.appendChild(heat);
        }
        text.appendChild(b);
        if (c.note) {
          text.appendChild(el("small", "", c.note));
        }
        label.append(input, text);
        if (c.add) {
          label.appendChild(el("span", "choice-add", "+" + B.money(c.add)));
        }
        wrap.appendChild(label);
      });
      fs.appendChild(wrap);
      box.appendChild(fs);
    });
  }

  function updateItem() {
    var item = current.item;
    var raw = readChoices();
    // Show or hide groups that depend on another choice (the side only goes with a plate).
    B.groups(item).forEach(function (g) {
      var fs = itemForm.querySelector('[data-group="' + g.id + '"]');
      fs.hidden = !B.shown(item, g.def, raw);
    });
    current.choices = B.clean(item, raw);
    var total = B.unitPrice(item, current.choices) * current.qty;
    itemForm.querySelector("[data-item-total]").textContent = B.money(total);
    itemForm.querySelector("[data-qty]").textContent = String(current.qty);
    itemForm.querySelector("[data-qty-minus]").disabled = current.qty <= 1;

    var al = itemForm.querySelector("[data-item-allergens]");
    al.textContent = UI.allergenText(B.allergens(item, current.choices)) + ". Allergic? Please call us before you order. ";
    var more = el("a", "", "Allergen details");
    more.href = "allergens.html";
    al.appendChild(more);
  }

  function openItem(id) {
    var item = B.find(id);
    if (!item) {
      return;
    }
    if (!item.options || !item.options.length || typeof itemDialog.showModal !== "function") {
      B.add(id, {}, 1);
      toast("Added: " + item.name);
      return;
    }
    current = { item: item, choices: B.defaults(item), qty: 1 };
    itemForm.querySelector("[data-item-name]").textContent = item.name;
    itemForm.querySelector("[data-item-desc]").textContent = item.desc;
    renderGroups();
    updateItem();
    itemDialog.showModal();
    var first = itemForm.querySelector(".option-group input:checked") || itemForm.querySelector(".option-group input");
    if (first) {
      first.focus();
    }
  }

  itemForm.addEventListener("change", updateItem);

  itemForm.querySelector("[data-qty-minus]").addEventListener("click", function () {
    current.qty = Math.max(1, current.qty - 1);
    updateItem();
  });

  itemForm.querySelector("[data-qty-plus]").addEventListener("click", function () {
    current.qty = Math.min(20, current.qty + 1);
    updateItem();
  });

  itemForm.addEventListener("submit", function (event) {
    event.preventDefault();
    B.add(current.item.id, current.choices, current.qty);
    itemDialog.close();
    toast("Added: " + (current.qty > 1 ? current.qty + " x " : "") + current.item.name);
  });

  menuBox.addEventListener("click", function (event) {
    var b = event.target.closest("[data-add]");
    if (b) {
      openItem(b.getAttribute("data-add"));
    }
  });

  /* ---------- The basket ---------- */

  var roots = document.querySelectorAll("[data-basket]");
  var editingPostcode = false;
  var postcodeError = "";
  var sheet = document.getElementById("basket-sheet");
  var bar = document.querySelector("[data-basket-bar]");

  function deliveryLine(area) {
    return UI.pounds(area.fee) + " delivery · " + UI.pounds(area.min) + " minimum · " + area.time[0] + " to " + area.time[1] + " min";
  }

  function keyed(node, key) {
    node.setAttribute("data-key", key);
    return node;
  }

  function renderBasket(root, where) {
    var t = B.totals();
    var st = B.state();
    root.textContent = "";
    var r = el("div", "receipt");

    if (where === "aside") {
      var head = el("div", "receipt-head");
      var h = el("h2", "", "Your order");
      h.id = "aside-title";
      h.tabIndex = -1;
      head.appendChild(h);
      head.appendChild(el("span", "", t.count ? t.count + (t.count === 1 ? " item" : " items") : "Empty"));
      r.appendChild(head);
    }

    // Delivery or collection.
    var fs = el("fieldset", "mode-switch");
    fs.appendChild(el("legend", "", "Delivery or collection"));
    [["delivery", "Delivery", "i-scooter"], ["collection", "Collection", "i-store"]].forEach(function (m) {
      var label = el("label");
      var input = keyed(el("input"), "mode-" + m[0]);
      input.type = "radio";
      input.name = "mode-" + where;
      input.value = m[0];
      input.checked = st.mode === m[0];
      label.append(input, icon(m[2]), document.createTextNode(m[1]));
      fs.appendChild(label);
    });
    r.appendChild(fs);

    // Where it is going.
    var w = el("div", "where");
    if (st.mode === "collection") {
      var c = el("div", "where-set");
      var cp = el("p");
      cp.appendChild(el("strong", "", "Collect from 41 Varley Parade"));
      cp.appendChild(el("br"));
      cp.appendChild(document.createTextNode("Ready in " + data.collectionMinutes[0] + " to " + data.collectionMinutes[1] + " minutes. No minimum order."));
      c.appendChild(cp);
      w.appendChild(c);
    } else if (t.postcode.valid && !editingPostcode) {
      var set = el("div", "where-set" + (t.area ? "" : " is-no"));
      var p = el("p");
      if (t.area) {
        p.appendChild(el("strong", "", "Delivering to " + t.postcode.district));
        p.appendChild(document.createTextNode(", " + t.area.name));
        p.appendChild(el("br"));
        p.appendChild(document.createTextNode(deliveryLine(t.area)));
      } else {
        p.appendChild(el("strong", "", "We do not deliver to " + t.postcode.district + "."));
        p.appendChild(document.createTextNode(" You can collect it instead: no minimum."));
        p.appendChild(el("br"));
        var collect = keyed(el("button", "link-btn", "Switch to collection"), "collect");
        collect.type = "button";
        collect.setAttribute("data-act", "collect");
        p.appendChild(collect);
      }
      set.appendChild(p);
      var change = keyed(el("button", "link-btn", "Change"), "change-pc");
      change.type = "button";
      change.setAttribute("data-act", "change-pc");
      change.setAttribute("aria-label", "Change postcode");
      set.appendChild(change);
      w.appendChild(set);
    } else {
      var form = el("form");
      form.setAttribute("data-basket-postcode", "");
      form.noValidate = true;
      var lab = el("label", "where-label", "Your postcode, for the delivery fee");
      lab.htmlFor = "pc-" + where;
      form.appendChild(lab);
      var row = el("div", "postcode-form");
      var input2 = keyed(el("input", "input input-postcode"), "pc-input");
      input2.id = "pc-" + where;
      input2.name = "postcode";
      input2.autocomplete = "postal-code";
      input2.maxLength = 10;
      input2.placeholder = "Like NW6 7AB";
      input2.spellcheck = false;
      input2.setAttribute("autocapitalize", "characters");
      input2.value = st.postcode;
      if (postcodeError) {
        input2.setAttribute("aria-invalid", "true");
        input2.setAttribute("aria-describedby", "pc-error-" + where);
      }
      row.appendChild(input2);
      var go = keyed(el("button", "btn btn-dark btn-sm", "Set"), "pc-set");
      go.type = "submit";
      row.appendChild(go);
      form.appendChild(row);
      if (postcodeError) {
        var err = el("p", "where-error", postcodeError);
        err.id = "pc-error-" + where;
        form.appendChild(err);
      }
      w.appendChild(form);
    }
    r.appendChild(w);

    // The lines.
    if (!st.lines.length) {
      var empty = el("div", "basket-empty");
      empty.appendChild(icon("i-paperbag", "pic"));
      empty.appendChild(el("p", "", "Your basket is empty."));
      empty.appendChild(el("p", "", "Add something hot from the menu."));
      r.appendChild(empty);
    } else {
      var ul = el("ul", "lines");
      st.lines.forEach(function (l, i) {
        var item = B.find(l.id);
        var li = el("li", "line");
        var name = el("span", "line-name", item.name);
        var how = B.describe(item, l.choices);
        if (how) {
          name.appendChild(el("span", "line-how", how));
        }
        li.appendChild(name);
        li.appendChild(el("span", "line-price", B.money(B.lineTotal(l))));
        var q = el("span", "qty");
        var minus = keyed(el("button"), "minus-" + i);
        minus.type = "button";
        minus.setAttribute("data-act", "minus");
        minus.setAttribute("data-i", String(i));
        minus.setAttribute("aria-label", (l.qty === 1 ? "Remove " : "One fewer ") + item.name);
        minus.appendChild(icon("i-minus"));
        var n = el("span");
        n.appendChild(el("span", "visually-hidden", "Quantity "));
        n.appendChild(document.createTextNode(String(l.qty)));
        var plus = keyed(el("button"), "plus-" + i);
        plus.type = "button";
        plus.setAttribute("data-act", "plus");
        plus.setAttribute("data-i", String(i));
        plus.setAttribute("aria-label", "One more " + item.name);
        plus.appendChild(icon("i-plus"));
        q.append(minus, n, plus);
        li.appendChild(q);
        ul.appendChild(li);
      });
      r.appendChild(ul);

      var dl = el("dl", "sums");
      function sum(label, value, cls) {
        var row = el("div", cls || "");
        row.appendChild(el("dt", "", label));
        row.appendChild(el("dd", "", value));
        dl.appendChild(row);
      }
      sum("Food", B.money(t.subtotal));
      if (st.mode === "delivery") {
        sum("Delivery", t.area ? B.money(t.fee) : "Add your postcode");
      }
      sum("Total", B.money(t.total), "sum-total");
      r.appendChild(dl);
    }

    // Short of the delivery minimum: say by how much, and offer collection.
    if (t.problem === "minimum") {
      var min = el("div", "minimum");
      var mp = el("p");
      mp.appendChild(document.createTextNode("Add "));
      mp.appendChild(el("strong", "", B.money(t.short)));
      mp.appendChild(document.createTextNode(" more to reach the " + UI.pounds(t.area.min) + " minimum for delivery to " + t.area.district + "."));
      min.appendChild(mp);
      var prog = el("progress", "minimum-bar");
      prog.max = t.area.min;
      prog.value = t.subtotal;
      prog.setAttribute("aria-label", B.money(t.subtotal) + " of the " + UI.pounds(t.area.min) + " minimum");
      min.appendChild(prog);
      var or = el("p");
      or.appendChild(document.createTextNode("Or "));
      var sw = keyed(el("button", "link-btn", "collect it instead"), "collect");
      sw.type = "button";
      sw.setAttribute("data-act", "collect");
      or.appendChild(sw);
      or.appendChild(document.createTextNode(": collection has no minimum."));
      min.appendChild(or);
      r.appendChild(min);
    }

    // Closed now: the order will be a pre-order.
    var times = H.orderTimes(new Date(), st.mode, t.ready || [30, 45]);
    if (times.preorder && times.session) {
      var note = el("div", "notice notice-preorder");
      note.appendChild(icon("i-calendar"));
      var np = el("p");
      np.appendChild(el("strong", "", "We are closed now. "));
      np.appendChild(document.createTextNode("Your order goes in as a pre-order for " + H.dayWords(times.session.start).replace(/^on /, "") +
        " from " + H.time(times.session.start) + ". You choose the time at checkout."));
      note.appendChild(np);
      r.appendChild(note);
    }

    var checkout = keyed(el("button", "btn btn-red btn-block"), "checkout");
    checkout.type = "button";
    checkout.setAttribute("data-act", "checkout");
    checkout.appendChild(document.createTextNode(times.preorder ? "Pre-order: checkout" : "Go to checkout"));
    if (t.count) {
      checkout.appendChild(document.createTextNode(" · " + B.money(t.total)));
    }
    checkout.appendChild(icon("i-arrow"));
    checkout.disabled = !!t.problem;
    r.appendChild(checkout);

    var pay = el("p", "pay-note");
    pay.appendChild(icon("i-cash"));
    pay.appendChild(document.createTextNode("Pay on the door: cash or card"));
    r.appendChild(pay);

    root.appendChild(r);
  }

  function renderBaskets() {
    // Keep keyboard focus on the same control after the basket is redrawn.
    var active = document.activeElement;
    var key = active && active.getAttribute ? active.getAttribute("data-key") : null;
    var where = null;
    roots.forEach(function (root) {
      if (root.contains(active)) {
        where = root;
      }
    });
    roots.forEach(function (root) {
      renderBasket(root, root.getAttribute("data-basket"));
    });
    if (where && key) {
      var again = where.querySelector('[data-key="' + key + '"]');
      if (!again && /^pc-/.test(key)) {
        again = where.querySelector("[data-key='change-pc']");
      }
      if (!again && /^(minus|plus)-/.test(key)) {
        again = where.querySelector("[data-key^='minus-']") || where.querySelector("[data-key='mode-delivery']");
      }
      if (again && !again.disabled) {
        again.focus();
      } else {
        var heading = where.querySelector("#aside-title") || sheet.querySelector(".dialog-title");
        heading.tabIndex = -1;
        heading.focus();
      }
    }
    updateBar();
  }

  function updateBar() {
    if (!bar) {
      return;
    }
    var t = B.totals();
    bar.hidden = t.count === 0;
    // Room at the foot of the page, so the bar never covers the footer.
    document.body.classList.toggle("has-basket-bar", !bar.hidden);
    bar.querySelector("[data-bar-count]").textContent = String(t.count);
    bar.querySelector("[data-bar-total]").textContent = B.money(t.total);
  }

  roots.forEach(function (root) {
    root.addEventListener("change", function (event) {
      if (event.target.name === "mode-" + root.getAttribute("data-basket")) {
        B.setMode(event.target.value);
      }
    });
    root.addEventListener("submit", function (event) {
      if (!event.target.matches("[data-basket-postcode]")) {
        return;
      }
      event.preventDefault();
      var value = event.target.elements.postcode.value;
      var pc = B.postcode(value);
      if (!pc.valid) {
        postcodeError = value.trim() ? "That does not look like a postcode. Try one like NW6 7AB." : "Please type your postcode.";
        renderBaskets();
        var input = root.querySelector('[data-key="pc-input"]');
        if (input) {
          input.focus();
        }
        return;
      }
      postcodeError = "";
      editingPostcode = false;
      B.setPostcode(pc.full || pc.district);
    });
    root.addEventListener("click", function (event) {
      var b = event.target.closest("[data-act]");
      if (!b) {
        return;
      }
      var act = b.getAttribute("data-act");
      var i = +b.getAttribute("data-i");
      var lines = B.state().lines;
      if (act === "minus") {
        B.setQty(i, lines[i].qty - 1);
      } else if (act === "plus") {
        B.setQty(i, lines[i].qty + 1);
      } else if (act === "collect") {
        B.setMode("collection");
      } else if (act === "change-pc") {
        editingPostcode = true;
        renderBaskets();
        var input = root.querySelector('[data-key="pc-input"]');
        if (input) {
          input.focus();
          input.select();
        }
      } else if (act === "checkout") {
        openCheckout();
      }
    });
  });

  B.onChange(renderBaskets);

  if (bar) {
    bar.querySelector("[data-open-basket]").addEventListener("click", function () {
      sheet.showModal();
    });
  }

  // On this page the header's Order button shows the basket instead of reloading the page.
  var headerOrder = document.querySelector("[data-header-order]");
  if (headerOrder) {
    headerOrder.addEventListener("click", function (event) {
      event.preventDefault();
      if (window.matchMedia("(max-width: 940px)").matches) {
        sheet.showModal();
      } else {
        var heading = document.getElementById("aside-title");
        heading.scrollIntoView({ block: "nearest", behavior: smooth() });
        heading.focus();
      }
    });
  }

  /* ---------- Checkout ---------- */

  var co = document.getElementById("checkout-dialog");
  var coForm = co.querySelector("[data-checkout-form]");
  var sent = co.querySelector("[data-sent]");
  var coTimes = null;
  var lastChannel = "whatsapp";

  function errorFor(name) {
    return coForm.querySelector('[data-error-for="' + name + '"]');
  }

  function setError(name, text) {
    var input = coForm.elements[name];
    var err = errorFor(name);
    if (text) {
      err.textContent = text;
      err.hidden = false;
      input.setAttribute("aria-invalid", "true");
    } else {
      err.hidden = true;
      input.removeAttribute("aria-invalid");
    }
  }

  function fillSummary() {
    var t = B.totals();
    var box = coForm.querySelector("[data-checkout-summary]");
    box.textContent = "";
    box.appendChild(el("h3", "", "Your order"));
    var ul = el("ul");
    B.state().lines.forEach(function (l) {
      var item = B.find(l.id);
      var how = B.describe(item, l.choices);
      var li = el("li");
      li.appendChild(el("span", "", l.qty + " x " + item.name + (how ? " (" + how + ")" : "")));
      li.appendChild(el("span", "", B.money(B.lineTotal(l))));
      ul.appendChild(li);
    });
    box.appendChild(ul);
    var dl = el("dl", "sums");
    [["Food", B.money(t.subtotal)]].concat(t.mode === "delivery" && t.area ? [["Delivery to " + t.area.district, B.money(t.fee)]] : [])
      .concat([["Total to pay on the door", B.money(t.total)]]).forEach(function (row, i, all) {
        var div = el("div", i === all.length - 1 ? "sum-total" : "");
        div.appendChild(el("dt", "", row[0]));
        div.appendChild(el("dd", "", row[1]));
        dl.appendChild(div);
      });
    box.appendChild(dl);

    var sub = coForm.querySelector("[data-checkout-sub]");
    sub.textContent = t.mode === "delivery" ?
      "Delivery to " + t.area.district + ", about " + t.area.time[0] + " to " + t.area.time[1] + " minutes." :
      "Collection from 41 Varley Parade, Kilburn.";
  }

  function fillTimes() {
    var t = B.totals();
    var select = coForm.querySelector("[data-when]");
    var before = select.value;
    coTimes = H.orderTimes(new Date(), t.mode, t.ready);
    select.textContent = "";
    var note = coForm.querySelector("[data-preorder-note]");
    if (!coTimes.preorder) {
      var asap = el("option", "", "As soon as possible (about " + t.ready[0] + " to " + t.ready[1] + " minutes)");
      asap.value = "asap";
      select.appendChild(asap);
      note.hidden = true;
    } else {
      var s = coTimes.session;
      note.hidden = false;
      coForm.querySelector("[data-preorder-text]").textContent = s ?
        "We are closed now, so this is a pre-order for " + H.fmt.long.format(s.start) + ". Pick a time from " + H.time(H.addMinutes(s.start, data.preorderFirstMinutes)) +
        ". We confirm it when the kitchen opens at " + H.time(s.start) + "." :
        "We are closed now. Please call us to arrange a time.";
    }
    coTimes.slots.forEach(function (d) {
      var o = el("option", "", H.slotLabel(d, coTimes.session));
      o.value = String(d.getTime());
      select.appendChild(o);
    });
    if (before && select.querySelector('option[value="' + before + '"]')) {
      select.value = before;
    }
    coForm.querySelector("[data-when-label]").textContent = coTimes.preorder ? "When do you want it? (pre-order)" :
      (t.mode === "delivery" ? "When do you want it delivered?" : "When will you collect?");
  }

  function openCheckout() {
    var t = B.totals();
    if (t.problem || typeof co.showModal !== "function") {
      return;
    }
    if (sheet.open) {
      sheet.close();
    }
    var delivery = t.mode === "delivery";
    coForm.querySelector("[data-delivery-fields]").hidden = !delivery;
    if (delivery && t.postcode.full && !coForm.elements.postcode.value) {
      coForm.elements.postcode.value = t.postcode.full;
    }
    coForm.querySelector("[data-pay-cash]").textContent = delivery ? "Pay the driver" : "Pay when you collect";
    coForm.querySelector("[data-pay-card]").textContent = delivery ? "Our driver brings a card machine" : "Pay by card in the shop";
    ["name", "address", "postcode"].forEach(function (n) {
      setError(n, "");
    });
    fillSummary();
    fillTimes();
    coForm.hidden = false;
    sent.hidden = true;
    co.showModal();
    coForm.elements.name.focus();
  }

  // Checks the form. A new postcode may move the order to another area, with another fee and minimum.
  function validate() {
    var f = coForm.elements;
    var ok = true;
    var first = null;
    function fail(name, text) {
      setError(name, text);
      ok = false;
      first = first || f[name];
    }
    setError("name", "");
    if (!f.name.value.trim()) {
      fail("name", "Please add your name, so the driver knows who to ask for.");
    }
    var t = B.totals();
    if (t.mode === "delivery") {
      setError("address", "");
      setError("postcode", "");
      if (!f.address.value.trim()) {
        fail("address", "Please add your house number and street.");
      }
      var pc = B.postcode(f.postcode.value);
      if (!pc.valid || !pc.full) {
        fail("postcode", "Please add your full postcode, like NW6 7AB.");
      } else if (!pc.area) {
        fail("postcode", "Sorry, we do not deliver to " + pc.district + ". Close this and switch to collection, or call us.");
      } else {
        if (pc.district !== t.postcode.district || pc.full !== B.state().postcode) {
          B.setPostcode(pc.full);
          fillSummary();
          fillTimes();
          t = B.totals();
        }
        if (t.problem === "minimum") {
          fail("postcode", "The minimum order for delivery to " + pc.district + " is " + UI.pounds(pc.area.min) + ". Add " + B.money(t.short) + " more, or switch to collection.");
        }
      }
    }
    if (first) {
      first.focus();
    }
    return ok;
  }

  function details() {
    var f = coForm.elements;
    var when = f.when.value;
    var street = f.address.value.trim();
    var flat = f.flat.value.trim();
    return {
      name: f.name.value.trim(),
      address: (flat ? flat + ", " : "") + street,
      postcode: B.postcode(f.postcode.value).full,
      when: when && when !== "asap" ? new Date(+when) : null,
      pay: f.pay.value,
      notes: f.notes.value.trim()
    };
  }

  function send(channel) {
    if (!validate()) {
      return;
    }
    var text = B.message(details(), coTimes);
    lastChannel = channel;
    if (data.sample) {
      sent.querySelector("[data-message]").textContent = text;
      sent.querySelector("[data-sent-to]").textContent = channel === "email" ?
        "By email to " + data.email : "To " + data.name + " on WhatsApp";
      sent.querySelector(".sample-note p + p").textContent = channel === "email" ?
        "On the takeaway's real website, this button opens your email app with the order above ready to send. The shop replies to confirm it." :
        "On the takeaway's real website, this button opens WhatsApp with the order above ready to send. The shop replies to confirm it and give a time.";
      coForm.hidden = true;
      sent.hidden = false;
      sent.querySelector("[data-sent-title]").focus();
      return;
    }
    if (channel === "email") {
      window.location.href = "mailto:" + data.email + "?subject=" + encodeURIComponent("Order for " + details().name) +
        "&body=" + encodeURIComponent(text);
      return;
    }
    var url = "https://wa.me/" + data.whatsapp + "?text=" + encodeURIComponent(text);
    var opened = window.open(url, "_blank");
    if (opened) {
      opened.opener = null;
    } else {
      window.location.href = url;
    }
    co.close();
  }

  coForm.addEventListener("submit", function (event) {
    event.preventDefault();
    send("whatsapp");
  });

  coForm.querySelector("[data-email-order]").addEventListener("click", function () {
    send("email");
  });

  ["name", "address"].forEach(function (n) {
    coForm.elements[n].addEventListener("input", function () {
      if (coForm.elements[n].value.trim()) {
        setError(n, "");
      }
    });
  });

  sent.querySelector("[data-back]").addEventListener("click", function () {
    sent.hidden = true;
    coForm.hidden = false;
    coForm.querySelector('button[type="submit"]').focus();
  });

  sent.querySelector("[data-new-order]").addEventListener("click", function () {
    B.clear();
    coForm.reset();
    co.close();
    toast(lastChannel === "email" ? "Basket cleared." : "Basket cleared. Hungry again soon?");
  });

  /* ---------- Dialogs ---------- */

  [itemDialog, co, sheet].forEach(function (d) {
    d.querySelectorAll("[data-close]").forEach(function (b) {
      b.addEventListener("click", function () {
        d.close();
      });
    });
    // A click on the dimmed backdrop lands on the dialog element itself.
    d.addEventListener("click", function (event) {
      if (event.target === d) {
        d.close();
      }
    });
  });

  /* ---------- Start ---------- */

  renderMenu();
  renderBaskets();
  scrollSpy();

  // menu.html?add=adana opens that dish (from the home page's Add buttons).
  var params = new URLSearchParams(window.location.search);
  var wanted = params.get("add");
  if (wanted && B.find(wanted)) {
    var card = menuBox.querySelector('[data-add="' + wanted + '"]');
    if (card) {
      card.closest(".menu-cat").scrollIntoView({ block: "start" });
    }
    openItem(wanted);
    if (window.history.replaceState) {
      var url = new URL(window.location.href);
      url.searchParams.delete("add");
      window.history.replaceState(null, "", url);
    }
  }
})();
