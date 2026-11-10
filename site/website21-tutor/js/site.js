/* Every page: sticky header, mobile menu, scroll reveal, the highlighter swipe, "open now" with today's hours,
   and (on the sample site) a short explanation in place of WhatsApp, phone and email. */
(function () {
  var data = window.Markwell;
  var D = window.MarkwellDates;

  document.documentElement.classList.add("js");

  stickyHeader();
  mobileMenu();
  revealOnScroll();
  highlighter();
  openStatus();
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
    window.matchMedia("(min-width: 961px)").addEventListener("change", function (event) {
      if (event.matches) {
        set(false);
      }
    });
  }

  function revealOnScroll() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
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
    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  // The hero's highlighter draws itself in once the page has loaded.
  function highlighter() {
    var marks = document.querySelectorAll(".hero .hl, .page-head .hl");
    marks.forEach(function (m) {
      m.classList.add("hl-animate");
    });
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        marks.forEach(function (m) {
          m.classList.add("is-drawn");
        });
      });
    });
  }

  function minutesOf(hm) {
    var p = hm.split(":");
    return +p[0] * 60 + +p[1];
  }

  // "Open now: lessons until 8pm", "Closed now: opens Monday at 3:45pm", or the half-term or holiday message.
  function openStatus() {
    var box = document.querySelector("[data-open-status]");
    if (!box || !D) {
      return;
    }
    var text = box.querySelector("[data-open-text]");
    var now = new Date();
    var status = D.termStatus(now);

    // Mark today's row in the hours lists (Monday to Thursday share a row).
    var rowFor = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1, 6: 2, 0: 3 };
    if (status.kind === "term") {
      document.querySelectorAll(".hours").forEach(function (dl) {
        var row = dl.children[rowFor[now.getDay()]];
        if (row) {
          row.classList.add("is-today");
          row.firstElementChild.appendChild(el("span", "visually-hidden", " (today)"));
        }
      });
    }

    if (status.kind === "half" || status.kind === "holiday") {
      box.classList.add("is-holiday");
      var back = status.kind === "half" ? status.back : status.term.start;
      text.textContent = (status.kind === "half" ? "Half-term: " : "School holidays: ") +
        "the centre is closed. Classes start again on " + D.fmt.long.format(back) + ".";
      return;
    }

    var mins = now.getHours() * 60 + now.getMinutes();
    var today = data.centreHours[now.getDay()];
    var closedToday = D.noClassReason(D.startOfDay(now), status.term); // a bank holiday in term time
    if (today && !closedToday && mins >= minutesOf(today[0]) && mins < minutesOf(today[1])) {
      box.classList.add("is-open");
      text.textContent = "Open now: lessons until " + D.time(today[1]) + " today.";
      return;
    }
    // The next opening, up to a week ahead.
    for (var i = 0; i < 8; i++) {
      var d = D.addDays(D.startOfDay(now), i);
      var hours = data.centreHours[d.getDay()];
      if (!hours || (i === 0 && mins >= minutesOf(hours[0]))) {
        continue;
      }
      var t = D.currentTerm(d);
      if (!t || D.noClassReason(d, t)) {
        continue;
      }
      var when = i === 0 ? "today" : i === 1 ? "tomorrow" : D.DAY_NAMES[d.getDay()];
      text.textContent = (closedToday ? "Closed today (" + closedToday.toLowerCase() + "): " : "Closed now: ") + "opens " + when + " at " + D.time(hours[0]) + ".";
      return;
    }
    // The last day of term, after the last lesson.
    var next = D.nextTerm(now);
    text.textContent = "Closed now: the " + next.name.toLowerCase() + " starts on " + D.fmt.long.format(next.start) + ".";
  }

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

  // On the sample site the WhatsApp, phone and email buttons explain what they would do, because the
  // numbers and the email address are made up.
  function sampleContacts() {
    if (!data.sample) {
      return;
    }
    var words = {
      whatsapp: "On a real centre's website, this button opens a WhatsApp chat with the centre, so parents can ask a question or book in a few taps.",
      phone: "On a real centre's website, this button rings the centre from a phone. The number shown here is a made-up one kept for TV and film.",
      email: "On a real centre's website, this button opens a new email to the centre. The address shown here is a made-up one."
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
      close.innerHTML = '<svg class="icon"><use href="#i-close"/></svg>';
      head.append(title, close);
      text = el("p", "");
      var note = el("div", "sample-note");
      note.appendChild(el("p", "", "Markwell Tuition is made up. Agile Release built this site to show what a small business website can do."));
      var actions = el("div", "dialog-actions");
      var more = el("a", "btn btn-outline", "Get a site like this");
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

    // Delegated, so links added later (by other scripts) are covered too.
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

  window.MarkwellSite = { el: el };
})();
