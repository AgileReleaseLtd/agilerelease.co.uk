/* Every page: sticky header, mobile menu, scroll reveal, the home page's "Up next" list, and (on the sample
   site) a short explanation in place of WhatsApp, phone and email. */
(function () {
  var data = window.Ironfern;
  var schedule = window.IronfernSchedule;

  document.documentElement.classList.add("js");

  stickyHeader();
  mobileMenu();
  revealOnScroll();
  fillCounts();
  upNext();
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
    }, { threshold: 0.08 });
    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  function fillCounts() {
    document.querySelectorAll("[data-classes-per-week]").forEach(function (el) {
      el.textContent = String(schedule.classesPerWeek());
    });
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

  // The next four classes that can still be booked, each linking to the timetable with its booking open.
  function upNext() {
    var list = document.querySelector("[data-upnext]");
    if (!list) {
      return;
    }
    var slots = schedule.nextClasses(4);
    if (!slots.length) {
      return;
    }
    list.textContent = "";
    var lastDay = "";
    slots.forEach(function (slot) {
      // A small heading ("Tomorrow", "Tue 10 Nov") each time the day changes.
      var day = schedule.relativeDay(slot.date);
      if (day !== lastDay) {
        list.appendChild(el("li", "upnext-day", day));
        lastDay = day;
      }
      var item = el("li", "upnext-item" + (slot.cls.family === "flow" ? " is-flow" : ""));
      var link = el("a");
      link.href = "timetable.html?date=" + schedule.isoDate(slot.date) + "&book=" + encodeURIComponent(slot.id);

      var time = el("span", "upnext-time", slot.time);

      var body = el("span");
      body.appendChild(el("span", "upnext-name", slot.cls.name));
      body.appendChild(el("span", "upnext-coach", "with " + slot.coach.name + " · " + slot.cls.minutes + " min"));

      var book = el("span", "upnext-book", "Book");
      book.setAttribute("aria-hidden", "true");

      link.setAttribute("aria-label", "Book " + slot.cls.name + ", " + schedule.relativeDay(slot.date) + " at " + slot.time + ", with " + slot.coach.name);
      link.append(time, body, book);
      item.appendChild(link);
      list.appendChild(item);
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
      whatsapp: "On a real studio's website, this button opens a WhatsApp chat with the studio, so people can ask a question or book in a few taps.",
      phone: "On a real studio's website, this button rings the studio from a phone. The number shown here is a made-up one kept for TV and film.",
      email: "On a real studio's website, this button opens a new email to the studio. The address shown here is a made-up one."
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
      note.appendChild(el("p", "", "Ironfern Studio is made up. Agile Release built this site to show what a small business website can do."));
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
