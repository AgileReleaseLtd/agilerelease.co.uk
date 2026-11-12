/* Every page: sticky header, mobile menu, scroll reveal, the "open now" line, the opening hours and holiday
   hours, the home page's board, events and menu preview, and (on the sample site) a short explanation in
   place of WhatsApp, phone and email. */
(function () {
  var data = window.Cobnut;
  var D = window.CobnutDays;

  document.documentElement.classList.add("js");

  /* ---------- Small helpers, shared with menu.js and whats-on.js ---------- */

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

  // <svg class="icon"><use href="#i-cup"/></svg>
  function icon(id, className) {
    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", className || "icon");
    svg.setAttribute("aria-hidden", "true");
    var use = document.createElementNS(NS, "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
  }

  var DIET = {
    vg: { label: "Vegan", icon: "i-leaf" },
    v: { label: "Vegetarian", icon: "i-sprout" },
    gf: { label: "Gluten-free", icon: "i-wheat" }
  };

  // The tags for a dish: what it is ("Vegan") and what it can be made ("Gluten-free option").
  function dietTags(diet, can) {
    diet = diet || [];
    can = can || [];
    var out = [];
    if (diet.indexOf("vg") >= 0) {
      out.push({ key: "vg", option: false });
    } else if (diet.indexOf("v") >= 0) {
      out.push({ key: "v", option: false });
    }
    if (diet.indexOf("gf") >= 0) {
      out.push({ key: "gf", option: false });
    }
    can.forEach(function (k) {
      if (diet.indexOf(k) < 0) {
        out.push({ key: k, option: true });
      }
    });
    return out;
  }

  function tagEls(diet, can) {
    return dietTags(diet, can).map(function (t) {
      var tag = el("span", "tag tag-" + t.key + (t.option ? " tag-option" : ""));
      tag.appendChild(icon(DIET[t.key].icon, "icon icon-sm"));
      tag.appendChild(document.createTextNode(DIET[t.key].label + (t.option ? " option" : "")));
      return tag;
    });
  }

  // "vegan, gluten-free" for the chalkboard.
  function dietWords(diet) {
    return dietTags(diet).map(function (t) {
      return DIET[t.key].label.toLowerCase();
    }).join(", ");
  }

  // Opens WhatsApp with a ready-written message (used when sample is false).
  function sendWhatsApp(text) {
    var url = "https://wa.me/" + data.whatsapp + "?text=" + encodeURIComponent(text);
    var opened = window.open(url, "_blank");
    if (opened) {
      opened.opener = null;
    } else {
      window.location.href = url;
    }
  }

  window.CobnutUI = {
    el: el,
    icon: icon,
    DIET: DIET,
    dietTags: dietTags,
    tagEls: tagEls,
    dietWords: dietWords,
    sendWhatsApp: sendWhatsApp
  };

  stickyHeader();
  mobileMenu();
  revealOnScroll();
  liveStatus();
  hoursTable();
  todayBoard();
  upcoming();
  menuPreview();
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
    window.matchMedia("(min-width: 961px)").addEventListener("change", function (event) {
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

  /* ---------- Open now ---------- */

  // "Tonight at 7:30pm: Quiz night", "Today at 2pm: Knit & natter" or "On now until 4pm: Knit & natter".
  function eventToday(now) {
    var next = D.upcomingEvents(now, 0)[0];
    if (!next) {
      return null;
    }
    if (next.start <= now) {
      return { o: next, text: "On now, until " + D.clock(next.end) + ": " };
    }
    return { o: next, text: (next.start.getHours() >= 17 ? "Tonight" : "Today") + " at " + D.clock(next.start) + ": " };
  }

  function liveStatus() {
    var lines = document.querySelectorAll("[data-status]");
    var eventLine = document.querySelector("[data-status-event]");
    var shop = document.querySelector(".shopfront");
    if (!lines.length && !shop) {
      return;
    }
    function paint() {
      var now = new Date();
      var s = D.status(now);
      lines.forEach(function (line) {
        line.classList.toggle("is-open", s.open);
        line.classList.toggle("is-closed", !s.open);
        line.textContent = "";
        line.appendChild(el("strong", "", s.head));
        if (s.detail) {
          line.appendChild(document.createTextNode(" "));
          line.appendChild(el("span", "", s.detail));
        }
      });
      if (shop) {
        shop.classList.toggle("is-open", s.open);
        shop.classList.toggle("is-closed", !s.open);
      }
      if (eventLine) {
        var ev = eventToday(now);
        eventLine.hidden = !ev;
        eventLine.textContent = "";
        if (ev) {
          eventLine.appendChild(document.createTextNode(ev.text));
          var link = el("a", "", ev.o.ev.title);
          link.href = "whats-on.html?event=" + ev.o.id + "&date=" + D.isoDate(ev.o.date) + "#events";
          eventLine.appendChild(link);
        }
      }
    }
    paint();
    // Keep it right if the page is left open.
    window.setInterval(paint, 60000);
  }

  /* ---------- Opening hours ---------- */

  function hoursTable() {
    document.querySelectorAll("[data-hours]").forEach(function (box) {
      var names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      var order = [1, 2, 3, 4, 5, 6, 0];
      var today = new Date().getDay();
      var groups = [];
      // Days next to each other with the same hours share a row: "Monday to Friday".
      order.forEach(function (day) {
        var span = data.hours[day];
        var key = span ? span.join("-") : "closed";
        var last = groups[groups.length - 1];
        if (last && last.key === key) {
          last.days.push(day);
        } else {
          groups.push({ key: key, span: span, days: [day] });
        }
      });
      box.textContent = "";
      groups.forEach(function (g) {
        var row = el("div", g.days.indexOf(today) >= 0 ? "is-today" : "");
        var first = names[g.days[0]];
        var label = g.days.length === 1 ? first : first + " to " + names[g.days[g.days.length - 1]];
        var dt = el("dt", "", label);
        if (g.days.indexOf(today) >= 0) {
          dt.appendChild(el("span", "visually-hidden", " (today)"));
        }
        row.appendChild(dt);
        row.appendChild(el("dd", "", g.span ? D.spanText(g.span) : "Closed"));
        box.appendChild(row);
      });
    });

    var holiday = document.querySelector("[data-holiday]");
    var list = document.querySelector("[data-holiday-list]");
    if (holiday && list) {
      var runs = D.upcomingExceptions(new Date());
      list.textContent = "";
      runs.forEach(function (r) {
        var li = el("li");
        li.appendChild(el("strong", "", D.rangeText(r.from, r.to) + ":"));
        li.appendChild(document.createTextNode(" "));
        var what = el("span", "", (r.exception.hours ? D.spanText(r.exception.hours) : "closed") + " ");
        what.appendChild(el("em", "", "(" + r.exception.label + ")"));
        li.appendChild(what);
        list.appendChild(li);
      });
      holiday.hidden = !runs.length;
    }
  }

  /* ---------- Home: today's board, coming up, menu preview ---------- */

  function boardItem(label, value, small) {
    var li = el("li");
    li.appendChild(el("span", "board-label", label));
    li.appendChild(el("span", "board-value", value));
    if (small) {
      li.appendChild(el("span", "board-small", small));
    }
    return li;
  }

  function todayBoard() {
    var list = document.querySelector("[data-today-specials]");
    if (!list) {
      return;
    }
    var now = new Date();
    var sp = D.specials(now);
    var today = sp.days[(now.getDay() + 6) % 7];
    var dateLine = document.querySelector("[data-today-date]");
    if (dateLine) {
      dateLine.textContent = D.fmt.long.format(now);
    }
    list.textContent = "";
    var soup = today.closed
      ? boardItem("Soup of the day", "Closed today", today.closed)
      : boardItem("Soup of the day", today.soup.name, dietWords(today.soup.diet) || "with sourdough");
    list.appendChild(soup);
    list.appendChild(boardItem("Bake of the week", sp.bake));
    list.appendChild(boardItem("Sandwich of the week", sp.sandwich));
    list.appendChild(boardItem("Guest coffee", sp.coffee.origin, sp.coffee.notes));
  }

  function dateTile(o) {
    var tile = el("span", "date-tile tone-" + o.id);
    tile.setAttribute("aria-hidden", "true");
    tile.appendChild(el("small", "", D.fmt.weekdayShort.format(o.date)));
    tile.appendChild(el("b", "", String(o.date.getDate())));
    tile.appendChild(el("small", "", D.fmt.monthShort.format(o.date)));
    return tile;
  }

  // "Today, 2pm", "Tomorrow, 9:30am" or "Thursday 3 December, 7:30pm" ("Thu 3 Dec, 7:30pm" when short).
  function whenText(o, now, short) {
    var words = D.dayWords(o.date, now);
    var day = words === "today" ? "Today" : words === "tomorrow" ? "Tomorrow" : (short ? D.fmt.short : D.fmt.long).format(o.date);
    return day + ", " + D.clock(o.start);
  }

  window.CobnutUI.dateTile = dateTile;
  window.CobnutUI.whenText = whenText;

  // The next date of each event, soonest first (so the weekly ones do not crowd out the monthly ones).
  function upcoming() {
    var list = document.querySelector("[data-upcoming]");
    if (!list) {
      return;
    }
    var now = new Date();
    var seen = {};
    var next = D.upcomingEvents(now, 120).filter(function (o) {
      if (seen[o.id]) {
        return false;
      }
      seen[o.id] = true;
      return true;
    }).slice(0, 4);
    if (!next.length) {
      return;
    }
    list.textContent = "";
    next.forEach(function (o) {
      var li = el("li");
      var a = el("a");
      a.href = "whats-on.html?event=" + o.id + "&date=" + D.isoDate(o.date) + "#events";
      var body = el("span");
      body.appendChild(el("span", "upcoming-name", o.ev.title));
      body.appendChild(el("span", "upcoming-when", whenText(o, now, true)));
      a.appendChild(dateTile(o));
      a.appendChild(body);
      a.appendChild(icon("i-arrow", "icon upcoming-go"));
      a.setAttribute("aria-label", o.ev.title + ", " + whenText(o, now) + ". Save a spot");
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  function menuPreview() {
    var box = document.querySelector("[data-menu-preview]");
    if (!box) {
      return;
    }
    box.textContent = "";
    data.menu.forEach(function (sec) {
      var card = el("article", "mp-card");
      var badge = el("span", "mp-icon");
      badge.appendChild(icon(sec.icon));
      card.appendChild(badge);
      card.appendChild(el("h3", "", sec.title));
      card.appendChild(el("p", "mp-note", sec.short || sec.note));
      var ul = el("ul", "mp-items");
      sec.items.filter(function (item) {
        return item.featured;
      }).slice(0, 3).forEach(function (item) {
        var li = el("li", "leader");
        li.appendChild(el("span", "", item.name));
        li.appendChild(el("span", "leader-price", D.money(item.price)));
        ul.appendChild(li);
      });
      card.appendChild(ul);
      var link = el("a", "link-arrow", "See all " + sec.title.toLowerCase());
      link.href = "menu.html#" + sec.id;
      link.appendChild(icon("i-arrow", "icon icon-sm"));
      card.appendChild(link);
      box.appendChild(card);
    });
  }

  /* ---------- Sample site ---------- */

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
      whatsapp: "On a real café's website, this button opens a WhatsApp chat with the café, so people can ask a question, order ahead or book an evening in a few taps.",
      phone: "On a real café's website, this button rings the café from a phone. The number shown here is a made-up one kept for TV and film.",
      email: "On a real café's website, this button opens a new email to the café. The address shown here is a made-up one."
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
      note.appendChild(el("p", "", "Cobnut Café is made up. Agile Release built this site to show what a small business website can do."));
      var actions = el("div", "dialog-actions");
      var more = el("a", "btn", "Get a site like this");
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
