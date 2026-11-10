/* Every page: sticky header, mobile menu, scroll reveal, the "open now" lines, upcoming closures, the
   "right now at nursery" line, the team, and (on the sample site) a short explanation in place of
   WhatsApp, phone and email. */
(function () {
  var data = window.ButtonTin;
  var BT = window.BT;
  var el = BT.el;

  document.documentElement.classList.add("js");

  stickyHeader();
  mobileMenu();
  revealOnScroll();
  openNow();
  closures();
  rightNow();
  thread();
  prices();
  team();
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
    window.matchMedia("(min-width: 1025px)").addEventListener("change", function (event) {
      if (event.matches) {
        set(false);
      }
    });
  }

  function revealOnScroll() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window) || BT.reducedMotion()) {
      items.forEach(function (item) {
        item.classList.add("is-visible");
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
    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  // Every [data-status] gets "Open now, until 6pm" or when we next open, with a dot to match.
  function openNow() {
    var spots = document.querySelectorAll("[data-status]");
    if (!spots.length) {
      return;
    }
    function paint() {
      var s = BT.status();
      spots.forEach(function (spot) {
        spot.classList.toggle("is-open", s.open);
        spot.classList.toggle("is-closed", !s.open);
        var text = spot.querySelector("[data-status-text]") || spot;
        text.textContent = s.text;
      });
    }
    paint();
    window.setInterval(paint, 60000);
  }

  // The next closures, grouped (24 December to 1 January reads as one line).
  function closures() {
    var list = document.querySelector("[data-closures]");
    if (!list) {
      return;
    }
    var groups = BT.groupClosures(BT.upcomingClosures(14)).slice(0, 5);
    if (!groups.length) {
      return;
    }
    list.textContent = "";
    groups.forEach(function (g) {
      var li = el("li");
      var when = el("span", "closure-when");
      if (BT.isoDate(g.from) === BT.isoDate(g.to)) {
        when.textContent = BT.fmt.long.format(g.from);
      } else {
        when.textContent = BT.fmt.short.format(g.from) + " to " + BT.fmt.short.format(g.to);
      }
      var unique = g.reasons.filter(function (r, i) {
        return g.reasons.indexOf(r) === i;
      });
      var christmas = unique.some(function (r) {
        return /Christmas|New Year/.test(r);
      });
      var why = el("span", "closure-why", christmas && unique.length > 1 ? "Christmas and New Year" : unique.join(" and "));
      li.append(when, why);
      list.appendChild(li);
    });
  }

  // On the home page: what is happening at nursery right now, from the day in data.js.
  function rightNow() {
    var spot = document.querySelector("[data-right-now]");
    if (!spot) {
      return;
    }
    function paint() {
      var now = new Date();
      var mins = now.getHours() * 60 + now.getMinutes();
      var open = BT.isOpenDay(now) && mins >= BT.minutes(data.hours.open) && mins < BT.minutes(data.hours.close);
      var text;
      if (!open) {
        var reason = BT.closedReason(now);
        if (reason) {
          text = "Today the nursery is closed (" + reason + "). The rooms are quiet and the garden is waiting.";
        } else if (BT.isOpenDay(now) && mins < BT.minutes(data.hours.open)) {
          text = "The kettle is on and the rooms are being set up. Doors open at " + BT.clock(data.hours.open) + ".";
        } else if (!BT.isOpenDay(now)) {
          text = "It's the weekend, so the nursery is closed. The rooms are quiet and the garden is waiting.";
        } else if (BT.isOpenDay(BT.addDays(BT.startOfDay(now), 1))) {
          text = "Everyone has gone home. The rooms are tidy, and tomorrow's breakfast is planned.";
        } else {
          text = "Everyone has gone home. The rooms are tidy until we open again.";
        }
      } else {
        var current = data.day[0];
        data.day.forEach(function (part) {
          if (BT.minutes(part.time) <= mins) {
            current = part;
          }
        });
        var phrase = current.now.charAt(0).toUpperCase() + current.now.slice(1);
        text = "Right now (" + BT.clock(BT.pad(now.getHours()) + ":" + BT.pad(now.getMinutes())) + "): " + phrase + ".";
      }
      spot.textContent = text;
    }
    paint();
    window.setInterval(paint, 60000);
  }

  // The home page's day in nine beads, from data.day, each linking to its place on the day page.
  function thread() {
    var list = document.querySelector("[data-thread]");
    if (!list) {
      return;
    }
    list.textContent = "";
    data.day.forEach(function (part) {
      var li = el("li");
      var a = el("a");
      a.href = "day.html#" + part.id;
      var bead = el("span", "bead tone-" + part.tone);
      bead.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#' + part.icon + '"/></svg>';
      a.append(bead, el("span", "thread-time", BT.clock(part.time)), el("span", "thread-title", part.title));
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  // Every [data-price="room:session"] shows that session's price for the room, from the hourly rate.
  function prices() {
    document.querySelectorAll("[data-price]").forEach(function (spot) {
      var bits = spot.getAttribute("data-price").split(":");
      var r = BT.room(bits[0]);
      var session = data.sessions[bits[1]];
      if (r && session) {
        spot.textContent = BT.money(r.rate * session.hours);
      }
    });
    document.querySelectorAll("[data-rate]").forEach(function (spot) {
      var r = BT.room(spot.getAttribute("data-rate"));
      if (r) {
        spot.textContent = BT.money2(r.rate);
      }
    });
  }

  // The team cards, from data.team.
  function team() {
    var list = document.querySelector("[data-team]");
    if (!list) {
      return;
    }
    list.textContent = "";
    data.team.forEach(function (p) {
      var li = el("li", "person");
      var mono = el("span", "monogram tone-" + p.tone, p.initials);
      mono.setAttribute("aria-hidden", "true");
      var body = el("div", "person-body");
      body.appendChild(el("h3", "person-name", p.name));
      body.appendChild(el("p", "person-role", p.role));
      var tags = el("p", "person-tags");
      tags.appendChild(el("span", "tag tag-role", p.roleTag));
      tags.appendChild(el("span", "tag", p.level));
      body.appendChild(tags);
      body.appendChild(el("p", "person-bio", p.bio));
      li.append(mono, body);
      list.appendChild(li);
    });
    var note = document.querySelector("[data-team-note]");
    if (note) {
      note.textContent = data.teamNote;
    }
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
      whatsapp: "On a real nursery's website, this button opens a WhatsApp chat with the nursery, so parents can ask a question in a few taps.",
      phone: "On a real nursery's website, this button rings the nursery from a phone. The number shown here is a made-up one kept for TV and film.",
      email: "On a real nursery's website, this button opens a new email to the nursery. The address shown here is a made-up one."
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
      close.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-close"/></svg>';
      head.append(title, close);
      text = el("p", "");
      var note = el("div", "sample-note");
      note.appendChild(el("p", "", "Button Tin Nursery is made up. Agile Release built this site to show what a small business website can do."));
      var actions = el("div", "dialog-actions");
      var more = el("a", "btn btn-outline", "Get a site like this");
      more.href = "https://agilerelease.co.uk/#websites";
      var ok = el("button", "btn btn-ink", "OK");
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
