/* Every page: mobile menu, scroll reveal, the basket count in the header, the open-now lines, opening hours,
   delivery areas, the postcode check, the home page's dishes and deals, and (on the sample site) a short
   explanation in place of WhatsApp, phone and email. Also the dish cards the menu page reuses. */
(function () {
  var data = window.Kor;
  var H = window.KorHours;
  var B = window.KorBasket;

  document.documentElement.classList.add("js");

  /* ---------- Helpers ---------- */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== undefined && text !== null) {
      node.textContent = text;
    }
    return node;
  }

  var SVG = "http://www.w3.org/2000/svg";

  // <svg class="icon"><use href="#i-..."/></svg>
  function icon(id, className) {
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("class", className || "icon");
    svg.setAttribute("aria-hidden", "true");
    var use = document.createElementNS(SVG, "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
  }

  // "£12" for whole pounds, "£2.50" otherwise: for fees and minimums.
  function pounds(n) {
    return n % 1 === 0 ? "£" + n : B.money(n);
  }

  function allergenText(list) {
    if (!list.length) {
      return "No major allergens";
    }
    return "Contains: " + list.map(function (a) {
      return (a.short || a.name).toLowerCase();
    }).join(", ");
  }

  // True if some choice costs extra, so the price is a "from" price.
  function hasExtras(item) {
    return B.groups(item).some(function (g) {
      return g.def.type === "one" && g.def.choices.some(function (c) {
        return c.add > 0;
      });
    });
  }

  function tags(item) {
    var box = el("span", "tags");
    if (item.feeds) {
      box.appendChild(el("span", "tag tag-feeds", "Feeds " + item.feeds));
    }
    if (item.hot) {
      var hot = el("span", "tag tag-hot");
      hot.appendChild(icon("i-chilli", "icon icon-fill"));
      hot.appendChild(document.createTextNode("Spicy"));
      box.appendChild(hot);
    }
    (item.diet || []).forEach(function (d) {
      var t = el("span", "tag tag-" + d);
      t.appendChild(icon("i-leaf", "icon icon-fill"));
      t.appendChild(document.createTextNode(d === "vg" ? "Vegan" : "Vegetarian"));
      box.appendChild(t);
    });
    return box;
  }

  /* A dish card. action "link" goes to the menu page with the dish open; "button" is the menu page's own
     Add button (data-add). */
  function dishCard(item, action) {
    var li = el("li", "dish");
    if (item.pics) {
      var pics = el("div", "deal-pics deal-pics-sm");
      item.pics.forEach(function (id) {
        pics.appendChild(icon(id, "pic"));
      });
      li.appendChild(pics);
    } else if (action === "link") {
      li.appendChild(icon(item.pic || B.category(item.id).icon, "pic dish-pic"));
    }
    var top = el("div", "dish-top");
    top.appendChild(el("h3", "", item.name));
    var t = tags(item);
    if (t.childNodes.length) {
      top.appendChild(t);
    }
    li.appendChild(top);
    li.appendChild(el("p", "dish-desc", item.desc));
    if (item.saveUpTo) {
      li.appendChild(el("p", "dish-save", "Save up to " + B.money(item.saveUpTo) + " on the parts bought separately"));
    }
    li.appendChild(el("p", "dish-allergens", allergenText(B.allergens(item))));

    var foot = el("div", "dish-foot");
    var price = el("p", "price");
    var from = hasExtras(item);
    if (from) {
      price.appendChild(el("small", "", "From"));
    }
    price.appendChild(document.createTextNode(B.money(item.price)));
    foot.appendChild(price);

    var add = el(action === "link" ? "a" : "button", "add-btn");
    if (action === "link") {
      add.href = "menu.html?add=" + encodeURIComponent(item.id);
    } else {
      add.type = "button";
      add.setAttribute("data-add", item.id);
    }
    add.setAttribute("aria-label", "Add " + item.name + ", " + (from ? "from " : "") + B.money(item.price));
    add.appendChild(icon("i-plus"));
    add.appendChild(document.createTextNode("Add"));
    foot.appendChild(add);
    li.appendChild(foot);
    return li;
  }

  function dealCard(item) {
    var li = el("li", "deal");
    var wrap = el("div", "price-burst-wrap");
    wrap.setAttribute("aria-hidden", "true");
    wrap.appendChild(el("span", "price-burst", B.money(item.price)));
    li.appendChild(wrap);
    var pics = el("div", "deal-pics");
    (item.pics || [B.category(item.id).icon]).forEach(function (id) {
      pics.appendChild(icon(id, "pic"));
    });
    li.appendChild(pics);
    li.appendChild(el("h3", "", item.name));
    if (item.saveUpTo) {
      li.appendChild(el("p", "deal-tag", "Save up to " + B.money(item.saveUpTo)));
    } else if (item.feeds) {
      li.appendChild(el("p", "deal-tag", "Feeds " + item.feeds));
    }
    var desc = el("p", "deal-desc", item.desc);
    desc.appendChild(el("span", "visually-hidden", " " + B.money(item.price) + "."));
    li.appendChild(desc);
    var add = el("a", "btn btn-yellow btn-block", "Add this deal");
    add.href = "menu.html?add=" + encodeURIComponent(item.id);
    add.setAttribute("aria-label", "Add the " + item.name + " deal, " + B.money(item.price));
    li.appendChild(add);
    return li;
  }

  /* ---------- Header and menu ---------- */

  function mobileMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.getElementById("site-nav");
    if (!button || !nav) {
      return;
    }
    button.hidden = false;

    function set(open) {
      nav.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", String(open));
    }

    button.addEventListener("click", function () {
      set(!nav.classList.contains("is-open"));
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        set(false);
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        set(false);
        button.focus();
      }
    });
    // The links come before the button in the page, so Tab from the button of an open menu would skip
    // them and land on the page behind it: take it to the first link instead.
    button.addEventListener("keydown", function (event) {
      if (event.key === "Tab" && !event.shiftKey && nav.classList.contains("is-open")) {
        var first = nav.querySelector("a");
        if (first) {
          event.preventDefault();
          first.focus();
        }
      }
    });
    window.matchMedia("(min-width: 941px)").addEventListener("change", function (event) {
      if (event.matches) {
        set(false);
      }
    });
  }

  function basketCount() {
    var link = document.querySelector("[data-header-order]");
    var badge = document.querySelector("[data-basket-count]");
    if (!link || !badge) {
      return;
    }
    function update() {
      var n = B.count();
      badge.hidden = n === 0;
      badge.textContent = String(n);
      link.setAttribute("aria-label", n ? "Order: " + n + (n === 1 ? " item" : " items") + " in your basket" : "Order");
    }
    update();
    B.onChange(update);
  }

  function revealOnScroll() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (node) {
        node.classList.add("is-visible");
      });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06 });
    items.forEach(function (node) {
      observer.observe(node);
    });
  }

  /* ---------- Open now ---------- */

  // The short line in the hero and page heads: "Open now until 2am" or "Closed now. Opens today at 5pm".
  function statusLines() {
    var now = new Date();
    // Collection orders close last, so the kitchen counts as taking orders until then.
    var st = H.status(now, "collection");
    document.querySelectorAll("[data-status]").forEach(function (box) {
      var text = box.querySelector("[data-status-text]");
      box.classList.toggle("is-open", st.ordering);
      box.classList.toggle("is-closed", !st.ordering);
      text.textContent = "";
      if (st.ordering) {
        text.appendChild(el("strong", "", "Open now"));
        text.appendChild(document.createTextNode(" until " + H.time(st.session.end)));
      } else {
        text.appendChild(el("strong", "", st.open ? "Last orders have gone." : "Closed now."));
        if (st.next) {
          text.appendChild(document.createTextNode(" Opens " + H.dayWords(st.next.start, now) + " at " + H.time(st.next.start)));
        }
      }
    });

    // While closed, the main order buttons say it will be a pre-order.
    document.querySelectorAll("[data-cta-label]").forEach(function (node) {
      node.textContent = st.ordering ? node.getAttribute("data-cta-label") : "Pre-order now";
    });

    var neon = document.querySelector("[data-neon]");
    if (neon) {
      neon.classList.toggle("is-closed", !st.open);
      neon.querySelector("[data-neon-word]").textContent = st.open ? "Open" : "Closed";
      var line = neon.querySelector("[data-neon-line]");
      line.textContent = "";
      if (st.ordering) {
        line.appendChild(document.createTextNode("Cooking now until "));
        line.appendChild(el("strong", "", H.time(st.session.end)));
        line.appendChild(document.createTextNode(". Last delivery orders " + H.time(H.lastOrders(st.session, "delivery")) +
          ", collection " + H.time(H.lastOrders(st.session, "collection")) + "."));
      } else if (st.next) {
        line.appendChild(document.createTextNode((st.open ? "Last orders have gone for tonight. " : "") + "We open "));
        line.appendChild(el("strong", "", H.dayWords(st.next.start, now) + " at " + H.time(st.next.start)));
        line.appendChild(document.createTextNode(". You can pre-order now."));
      }

      // Tonight's (or the next opening's) times, under the sign.
      var s = st.ordering || (st.open && !st.next) ? st.session : (st.next || st.session);
      var title = neon.querySelector("[data-tonight-title]");
      var list = neon.querySelector("[data-tonight]");
      if (s && title && list) {
        var w = H.dayWords(s.start, now).replace(/^on /, "");
        title.textContent = st.ordering ? "Tonight" : "Next opening: " + w;
        list.textContent = "";
        [["Kitchen open", H.time(s.start) + " to " + H.time(s.end)],
          ["Last delivery orders", H.time(H.lastOrders(s, "delivery"))],
          ["Last collection orders", H.time(H.lastOrders(s, "collection"))]].forEach(function (r) {
          var row = el("div");
          row.appendChild(el("dt", "", r[0]));
          row.appendChild(el("dd", "", r[1]));
          list.appendChild(row);
        });
      }
    }
  }

  // The weekly hours, days with the same hours grouped ("Monday to Wednesday"), today marked.
  function hoursTable() {
    var body = document.querySelector("[data-hours]");
    if (!body) {
      return;
    }
    var today = new Date().getDay();
    var rows = H.week();
    var groups = [];
    rows.forEach(function (r) {
      var last = groups[groups.length - 1];
      if (last && last.hours === r.hours) {
        last.days.push(r);
      } else {
        groups.push({ hours: r.hours, days: [r] });
      }
    });
    body.textContent = "";
    groups.forEach(function (g) {
      var tr = el("tr");
      var th = el("th", "", g.days[0].day + (g.days.length > 1 ? " to " + g.days[g.days.length - 1].day : ""));
      th.scope = "row";
      var isToday = g.days.some(function (d) {
        return d.dow === today;
      });
      if (isToday) {
        tr.className = "is-today";
        th.appendChild(el("span", "today-tag", "Today"));
      }
      tr.appendChild(th);
      tr.appendChild(el("td", "", g.hours));
      body.appendChild(tr);
    });

    var box = document.querySelector("[data-special]");
    var list = document.querySelector("[data-special-list]");
    var days = H.specialDays();
    if (box && list && days.length) {
      list.textContent = "";
      days.forEach(function (d) {
        var li = el("li");
        li.appendChild(el("span", "", H.fmt.short.format(d.date) + ", " + d.label));
        li.appendChild(el("b", "", d.hours));
        list.appendChild(li);
      });
      box.hidden = false;
    }
  }

  /* ---------- Delivery areas ---------- */

  function areasTable() {
    var body = document.querySelector("[data-areas]");
    if (!body) {
      return;
    }
    body.textContent = "";
    data.delivery.forEach(function (a) {
      var tr = el("tr");
      tr.setAttribute("data-district", a.district);
      var th = el("th");
      th.scope = "row";
      th.appendChild(el("span", "district", a.district));
      th.appendChild(document.createTextNode(a.name));
      tr.appendChild(th);
      [["Delivery", pounds(a.fee)], ["Minimum", pounds(a.min)], ["Time", a.time[0] + " to " + a.time[1] + " min"]].forEach(function (c) {
        var td = el("td", "", c[1]);
        td.setAttribute("data-label", c[0]);
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
    document.querySelectorAll("[data-min-fee]").forEach(function (node) {
      node.textContent = pounds(Math.min.apply(null, data.delivery.map(function (a) {
        return a.fee;
      })));
    });
  }

  /* The not-to-scale delivery diagram: rings by delivery fee around the shop, each district in its ring,
     roughly in its direction. Drawn from data.js; the table beside it carries the same facts. */
  function zoneMap() {
    var box = document.querySelector("[data-zone-map]");
    if (!box) {
      return;
    }
    function node(tag, attrs, parent) {
      var n = document.createElementNS(SVG, tag);
      Object.keys(attrs).forEach(function (k) {
        n.setAttribute(k, attrs[k]);
      });
      if (parent) {
        parent.appendChild(n);
      }
      return n;
    }
    var fees = [];
    data.delivery.forEach(function (a) {
      if (fees.indexOf(a.fee) === -1) {
        fees.push(a.fee);
      }
    });
    fees.sort(function (a, b) {
      return a - b;
    });
    var C = 200;
    var radii = [50, 86, 120, 155, 190];
    var svg = node("svg", { viewBox: "0 0 400 400", "class": "zone-svg", "aria-hidden": "true" });
    for (var k = fees.length - 1; k >= 0; k--) {
      node("circle", { cx: C, cy: C, r: radii[k], "class": "zone-ring zone-ring-" + k }, svg);
    }
    // The fee for each ring, in a gap between the districts (south-west).
    fees.forEach(function (fee, k) {
      var mid = k === 0 ? 37 : (radii[k - 1] + radii[k]) / 2;
      var a = (k === 0 ? 0 : 232) * Math.PI / 180;
      var t = node("text", { x: (C + mid * Math.sin(a)).toFixed(1), y: (C - mid * Math.cos(a) + 4).toFixed(1), "class": "zone-fee", "text-anchor": "middle" }, svg);
      t.textContent = pounds(fee);
    });
    data.delivery.forEach(function (a) {
      var k = fees.indexOf(a.fee);
      var g = node("g", { "class": "zone-chip" }, svg);
      var x;
      var y;
      if (k === 0) {
        x = C;
        y = C + 26;
      } else {
        var mid = (radii[k - 1] + radii[k]) / 2;
        var rad = a.bearing * Math.PI / 180;
        x = C + mid * Math.sin(rad);
        y = C - mid * Math.cos(rad);
      }
      var w = a.district.length * 9 + 16;
      node("rect", { x: (x - w / 2).toFixed(1), y: (y - 11).toFixed(1), width: w, height: 22, rx: 6 }, g);
      var t = node("text", { x: x.toFixed(1), y: (y + 5).toFixed(1), "text-anchor": "middle" }, g);
      t.textContent = a.district;
    });
    // The shop.
    node("circle", { cx: C, cy: C - 6, r: 19, "class": "zone-shop" }, svg);
    var flame = node("path", { "class": "zone-flame", d: "M16.6 2.8c1.2 4.6 7.6 7.4 7.6 15.1 0 5-3.6 8.9-8.3 8.9s-8.1-3.7-8.1-8.4c0-3.7 2-6.2 3.9-7.8.1 2.4 1 4.1 2.6 4.9-.8-5.2.3-9.5 2.3-12.7Z" }, svg);
    flame.setAttribute("transform", "translate(" + (C - 16) + " " + (C - 22) + ") scale(1)");
    box.insertBefore(svg, box.firstChild);
  }

  function postcodeCheck() {
    var form = document.querySelector("[data-postcode-check]");
    var out = document.querySelector("[data-check-result]");
    if (!form || !out) {
      return;
    }
    var input = form.elements.postcode;

    function show(text) {
      var pc = B.postcode(text);
      out.textContent = "";
      document.querySelectorAll("[data-district]").forEach(function (tr) {
        tr.classList.toggle("is-match", !!pc.area && tr.getAttribute("data-district") === pc.district);
      });
      var box = el("div", "result");
      var body = el("div");
      if (!pc.valid) {
        box.classList.add("is-bad");
        box.appendChild(icon("i-alert"));
        body.appendChild(el("p", "", text.trim() ? "That does not look like a postcode. Try one like NW6 7AB, or just the first part, like NW6." : "Please type your postcode first."));
        input.setAttribute("aria-invalid", "true");
      } else if (pc.area) {
        var a = pc.area;
        box.appendChild(icon("i-check"));
        var p = el("p");
        p.appendChild(el("strong", "", "Yes, we deliver to " + pc.district + "."));
        p.appendChild(document.createTextNode(" " + a.name + "."));
        body.appendChild(p);
        var facts = el("p", "result-facts");
        facts.appendChild(el("span", "", "Delivery " + pounds(a.fee)));
        facts.appendChild(el("span", "", "Minimum order " + pounds(a.min)));
        facts.appendChild(el("span", "", "About " + a.time[0] + " to " + a.time[1] + " minutes"));
        body.appendChild(facts);
        var go = el("a", "btn btn-yellow btn-sm", "Start your order");
        go.href = "menu.html";
        go.appendChild(icon("i-arrow"));
        body.appendChild(go);
        B.setMode("delivery");
        B.setPostcode(pc.full || pc.district);
        input.removeAttribute("aria-invalid");
      } else {
        box.classList.add("is-no");
        box.appendChild(icon("i-store"));
        var no = el("p");
        no.appendChild(el("strong", "", "Sorry, we do not deliver to " + pc.district + " yet."));
        body.appendChild(no);
        body.appendChild(el("p", "", "You can still order for collection from 41 Varley Parade, Kilburn: no minimum, ready in " +
          data.collectionMinutes[0] + " to " + data.collectionMinutes[1] + " minutes."));
        var collect = el("a", "btn btn-sm", "Order for collection");
        collect.href = "menu.html";
        collect.addEventListener("click", function () {
          B.setMode("collection");
        });
        body.appendChild(collect);
        input.removeAttribute("aria-invalid");
      }
      box.appendChild(body);
      out.appendChild(box);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      show(input.value);
    });

    // Fill in the postcode from an earlier visit, without a result until they ask.
    var saved = B.state().postcode;
    if (saved && !input.value) {
      input.value = saved;
    }
  }

  /* ---------- Home: dishes and deals ---------- */

  function homeLists() {
    var featured = document.querySelector("[data-featured]");
    if (featured) {
      data.menu.forEach(function (cat) {
        if (cat.id === "deals") {
          return;
        }
        cat.items.forEach(function (item) {
          if (item.featured) {
            featured.appendChild(dishCard(item, "link"));
          }
        });
      });
    }
    var deals = document.querySelector("[data-deals]");
    if (deals) {
      data.menu[0].items.forEach(function (item) {
        deals.appendChild(dealCard(item));
      });
    }
  }

  /* ---------- Sample notices ---------- */

  // On the sample site the WhatsApp, phone and email buttons explain what they would do, because the
  // numbers and the email address are made up.
  function sampleContacts() {
    if (!data.sample) {
      return;
    }
    var words = {
      whatsapp: "On a real takeaway's website, this button opens a WhatsApp chat with the shop, so people can ask a question or order in a few taps.",
      phone: "On a real takeaway's website, this button rings the shop from a phone. The number shown here is a made-up one kept for TV and film.",
      email: "On a real takeaway's website, this button opens a new email to the shop. The address shown here is a made-up one."
    };
    var dialog = null;
    var text = null;

    function build() {
      dialog = el("dialog", "dialog");
      dialog.setAttribute("aria-labelledby", "sample-dialog-title");
      var body = el("div", "dialog-body");
      var head = el("div", "dialog-head");
      var title = el("h2", "dialog-title", "This is a sample site");
      title.id = "sample-dialog-title";
      var close = el("button", "dialog-close");
      close.type = "button";
      close.setAttribute("aria-label", "Close");
      close.appendChild(icon("i-close"));
      head.append(title, close);
      text = el("p", "");
      var note = el("div", "sample-note");
      note.appendChild(el("p", "", "Kor Charcoal Grill is made up. Agile Release built this site to show what a takeaway's website can do."));
      var actions = el("div", "dialog-actions");
      var more = el("a", "btn", "Get a site like this");
      more.href = "https://agilerelease.co.uk/#websites";
      var ok = el("button", "btn btn-dark", "OK");
      ok.type = "button";
      actions.append(more, ok);
      body.append(head, text, note, actions);
      dialog.appendChild(body);
      document.body.appendChild(dialog);

      [close, ok].forEach(function (b) {
        b.addEventListener("click", function () {
          dialog.close();
        });
      });
      dialog.addEventListener("click", function (event) {
        if (event.target === dialog) {
          dialog.close();
        }
      });
    }

    // Delegated, so links added later (like the checkout's Call button) are covered too.
    document.addEventListener("click", function (event) {
      var link = event.target.closest("a[data-contact]");
      if (!link || typeof HTMLDialogElement !== "function") {
        return;
      }
      event.preventDefault();
      if (!dialog) {
        build();
      }
      text.textContent = words[link.getAttribute("data-contact")] || words.whatsapp;
      dialog.showModal();
    });
  }

  window.KorUI = {
    el: el,
    icon: icon,
    pounds: pounds,
    allergenText: allergenText,
    hasExtras: hasExtras,
    tags: tags,
    dishCard: dishCard
  };

  mobileMenu();
  basketCount();
  homeLists();
  statusLines();
  hoursTable();
  areasTable();
  zoneMap();
  postcodeCheck();
  sampleContacts();
  revealOnScroll();
})();
