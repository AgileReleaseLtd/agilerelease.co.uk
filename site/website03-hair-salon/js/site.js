/* Every page: sticky header, mobile menu, scroll reveal, "open now", the opening hours, and (on the sample
   site) a short explanation in place of WhatsApp, phone and email. */
(function () {
  var D = window.SorrelSteel;
  var C = window.SorrelSteelCore;

  document.documentElement.classList.add("js");

  stickyHeader();
  mobileMenu();
  revealOnScroll();
  openStatus();
  openingHours();
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
    window.matchMedia("(min-width: 1080px)").addEventListener("change", function (event) {
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

  // "Open now, until 6pm" in the header and the home page, refreshed every minute.
  function openStatus() {
    var boxes = document.querySelectorAll("[data-open-status]");
    if (!boxes.length) {
      return;
    }
    function update() {
      var status = C.openStatus();
      boxes.forEach(function (box) {
        box.classList.toggle("is-open", status.open);
        var text = box.querySelector("[data-status-text]");
        if (text) {
          text.textContent = status.text;
        }
      });
    }
    update();
    window.setInterval(update, 60000);
  }

  // The opening hours, from data.js, with today marked.
  function openingHours() {
    var list = document.querySelector("[data-hours]");
    if (!list) {
      return;
    }
    var today = new Date().getDay();
    list.textContent = "";
    C.WEEK.forEach(function (dow) {
      var h = D.hours[dow];
      var row = C.el("div", dow === today ? "is-today" : "");
      row.appendChild(C.el("dt", "", C.DAY_NAMES[dow]));
      var dd = C.el("dd", "", h ? C.time12(C.minutesOf(h.open)) + " to " + C.time12(C.minutesOf(h.close)) : "Closed");
      if (h && h.note) {
        dd.appendChild(C.el("small", "", h.note));
      }
      row.appendChild(dd);
      list.appendChild(row);
    });
    document.querySelectorAll("[data-deposit-amount]").forEach(function (node) {
      node.textContent = C.money(D.deposit);
    });
  }

  // On the sample site the WhatsApp, phone and email buttons explain what they would do, because the
  // numbers and the email address are made up.
  function sampleContacts() {
    if (!D.sample) {
      return;
    }
    var links = document.querySelectorAll("a[data-contact]");
    if (!links.length) {
      return;
    }
    var words = {
      whatsapp: "On a real salon's website, this button opens a WhatsApp chat with the salon, so people can ask a question or book in a few taps.",
      phone: "On a real salon's website, this button rings the salon from a phone. The number shown here is a made-up one kept for TV and film.",
      email: "On a real salon's website, this button opens a new email to the salon. The address shown here is a made-up one."
    };
    var dialog = null;
    var text = null;

    function build() {
      dialog = C.el("dialog", "dialog");
      dialog.setAttribute("aria-labelledby", "sample-dialog-title");
      var body = C.el("div", "dialog-body");
      var head = C.el("div", "dialog-head");
      var title = C.el("h2", "dialog-title", "This is a sample site");
      title.id = "sample-dialog-title";
      var close = C.el("button", "dialog-close");
      close.type = "button";
      close.setAttribute("aria-label", "Close");
      close.appendChild(C.icon("i-close"));
      head.append(title, close);
      text = C.el("p", "");
      var note = C.el("div", "sample-note");
      note.appendChild(C.el("p", "", D.name + " is made up. Agile Release built this site to show what a small business website can do."));
      var actions = C.el("div", "dialog-actions");
      var more = C.el("a", "btn btn-outline", "Get a site like this");
      more.href = "https://agilerelease.co.uk/#websites";
      var ok = C.el("button", "btn btn-ink", "OK");
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
