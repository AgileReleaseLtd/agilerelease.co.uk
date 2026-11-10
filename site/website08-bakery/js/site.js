/* Every page: sticky header, mobile menu, scroll reveal, the open-now line, opening hours, holiday hours,
   the home page's "out of the oven" list and counter cards, and (on the sample site) a short explanation
   in place of WhatsApp, phone and email. */
(function () {
  var data = window.Crumb;
  var T = window.CrumbTime;

  document.documentElement.classList.add("js");

  var DAYS = [1, 2, 3, 4, 5, 6, 0];
  var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

  function icon(id, extra) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "icon" + (extra ? " " + extra : ""));
    svg.setAttribute("aria-hidden", "true");
    var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
  }

  // "£58", "£5.20"
  function money(n) {
    return "£" + (Math.round(n * 100) % 100 === 0 ? String(Math.round(n)) : n.toFixed(2));
  }

  function capital(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // Shared with the page scripts.
  window.CrumbSite = { el: el, icon: icon, money: money, capital: capital, DAY_NAMES: DAY_NAMES, DAYS: DAYS };

  stickyHeader();
  mobileMenu();
  revealOnScroll();
  fills();
  statusLines();
  hoursTables();
  holidays();
  oven();
  counter();
  sampleContacts();

  function stickyHeader() {
    var header = document.querySelector(".site-header");
    if (!header) {
      return;
    }
    function onScroll() {
      header.classList.toggle("is-stuck", window.scrollY > 4);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

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
      button.querySelector("use").setAttribute("href", open ? "#i-close" : "#i-menu");
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
    window.matchMedia("(min-width: 1041px)").addEventListener("change", function (event) {
      if (event.matches) {
        set(false);
      }
    });
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

  function fills() {
    var from = Math.min.apply(null, data.cake.sizes.map(function (s) {
      return s.price;
    }));
    document.querySelectorAll('[data-fill="cake-from"]').forEach(function (node) {
      node.textContent = money(from);
    });
  }

  // "Open now · until 5pm" or "Closed now · opens tomorrow at 7:30am", kept up to date every minute.
  function statusLines() {
    var lines = document.querySelectorAll("[data-status]");
    if (!lines.length) {
      return;
    }
    function update() {
      var s = T.status();
      lines.forEach(function (line) {
        line.classList.toggle("is-open", s.open);
        line.classList.toggle("is-closed", !s.open);
        line.classList.toggle("is-soon", s.soon);
        line.querySelector("[data-status-text]").textContent = s.text;
        line.querySelector("[data-status-detail]").textContent = s.detail ? "· " + s.detail : "";
      });
    }
    update();
    window.setInterval(update, 60000);
  }

  // Monday to Sunday, today marked, with this week's holiday changes shown on their day.
  function hoursTables() {
    var tables = document.querySelectorAll("[data-hours]");
    if (!tables.length) {
      return;
    }
    var today = T.today();
    // The next seven days, so a holiday this week shows on its row.
    var week = {};
    for (var i = 0; i < 7; i++) {
      var d = T.addDays(today, i);
      week[d.getDay()] = d;
    }
    tables.forEach(function (table) {
      table.textContent = "";
      DAYS.forEach(function (dow) {
        var d = week[dow];
        var h = T.hoursOn(d);
        var ex = T.exceptionFor(d);
        var row = el("div", T.sameDay(d, today) ? "is-today" : "");
        var dt = el("dt", "", DAY_NAMES[dow]);
        if (T.sameDay(d, today)) {
          dt.appendChild(el("span", "tag", "Today"));
        }
        var dd = el("dd", "", h ? T.rangeLabel(h) : "Closed");
        if (ex) {
          dd.appendChild(el("small", "", ex.label));
        }
        row.append(dt, dd);
        table.appendChild(row);
      });
    });
  }

  // Holiday hours coming up, listed under the opening hours.
  function holidays() {
    var boxes = document.querySelectorAll("[data-holidays]");
    if (!boxes.length) {
      return;
    }
    var list = T.upcomingExceptions(data.exceptionsAheadDays);
    if (!list.length) {
      return;
    }
    boxes.forEach(function (box) {
      box.textContent = "";
      box.appendChild(el("h4", "holidays-title", "Holiday hours"));
      var ul = el("ul");
      list.forEach(function (item) {
        var li = el("li");
        var when = T.sameDay(item.from, item.to) ? T.fmt.short.format(item.from) : T.fmt.short.format(item.from) + " to " + T.fmt.short.format(item.to);
        li.appendChild(el("strong", "", item.ex.label));
        li.appendChild(el("span", "", when + ": " + (item.ex.hours ? T.rangeLabel(item.ex.hours) : "closed")));
        ul.appendChild(li);
      });
      box.appendChild(ul);
      box.hidden = false;
    });
  }

  // Home page: what comes out of the oven today (or on the next day we are open).
  function oven() {
    var list = document.querySelector("[data-oven]");
    if (!list) {
      return;
    }
    var title = document.querySelector("[data-oven-title]");
    var now = T.now();
    var day = T.bakeDay(now);
    var bakes = T.bakesOn(day.date);
    if (!bakes.length) {
      return;
    }
    var when = T.whenWords(day.date, now);
    title.textContent = day.live ? "Today at the bakery" : capital(when.replace(/^on /, "")) + " at the bakery";
    list.textContent = "";
    var nextMarked = false;
    bakes.forEach(function (b) {
      var out = day.live && T.minutes(b.time) <= T.minutesOf(now);
      var li = el("li", "oven-item" + (out ? " is-out" : ""));
      li.appendChild(el("span", "oven-time", T.timeLabel(b.time)));
      var body = el("span", "oven-body");
      body.appendChild(el("span", "oven-name", b.name));
      if (b.note) {
        body.appendChild(el("span", "oven-note", b.note));
      }
      li.appendChild(body);
      if (out) {
        var tag = el("span", "oven-tag");
        tag.append(icon("i-check", "icon-sm"), document.createTextNode("Out"));
        li.appendChild(tag);
      } else if (day.live && !nextMarked) {
        li.classList.add("is-next");
        li.appendChild(el("span", "oven-tag", "Next"));
        nextMarked = true;
      }
      list.appendChild(li);
    });
  }

  // Home page: three cards from the counter, with a few prices each.
  function counter() {
    var box = document.querySelector("[data-range-featured]");
    if (!box) {
      return;
    }
    var icons = { bread: "i-loaf", pastries: "i-croissant", slices: "i-slice" };
    box.textContent = "";
    data.range.forEach(function (cat) {
      var card = el("article", "counter-card counter-" + cat.id);
      var head = el("div", "counter-head");
      var badge = el("span", "counter-icon");
      badge.appendChild(icon(icons[cat.id] || "i-loaf"));
      head.appendChild(badge);
      var htext = el("div");
      htext.appendChild(el("h3", "h3", cat.title));
      htext.appendChild(el("p", "counter-from", "From " + T.timeLabel(cat.from)));
      head.appendChild(htext);
      card.appendChild(head);
      card.appendChild(el("p", "counter-note", cat.note));
      var ul = el("ul", "price-list");
      cat.items.filter(function (it) {
        return it.featured;
      }).forEach(function (it) {
        var li = el("li");
        li.appendChild(el("span", "price-name", it.name));
        li.appendChild(el("span", "price-dots"));
        li.appendChild(el("span", "price", money(it.price)));
        ul.appendChild(li);
      });
      card.appendChild(ul);
      box.appendChild(card);
    });
  }

  // On the sample site the WhatsApp, phone and email buttons explain what they would do, because the
  // numbers and the email address are made up.
  function sampleContacts() {
    if (!data.sample) {
      return;
    }
    var links = document.querySelectorAll("a[data-contact]");
    if (!links.length) {
      return;
    }
    var words = {
      whatsapp: "On a real bakery's website, this button opens a WhatsApp chat with the shop, so people can ask a question, keep a loaf back or talk about a cake in a few taps.",
      phone: "On a real bakery's website, this button rings the shop from a phone. The number shown here is a made-up one kept for TV and film.",
      email: "On a real bakery's website, this button opens a new email to the shop. The address shown here is a made-up one."
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
      note.appendChild(el("p", "", "Crumb & Candle is made up. Agile Release built this site to show what a small business website can do."));
      var actions = el("div", "dialog-actions");
      var more = el("a", "btn btn-light", "Get a site like this");
      more.href = "https://agilerelease.co.uk/#websites";
      var ok = el("button", "btn btn-dark", "OK");
      ok.type = "button";
      actions.append(more, ok);
      body.append(head, text, note, actions);
      dialog.appendChild(body);
      document.body.appendChild(dialog);

      close.addEventListener("click", function () {
        dialog.close();
      });
      ok.addEventListener("click", function () {
        dialog.close();
      });
      dialog.addEventListener("click", function (event) {
        if (event.target === dialog) {
          dialog.close();
        }
      });
    }

    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        if (typeof HTMLDialogElement !== "function") {
          return;
        }
        event.preventDefault();
        if (!dialog) {
          build();
        }
        text.textContent = words[link.getAttribute("data-contact")] || words.whatsapp;
        dialog.showModal();
      });
    });
  }
})();
