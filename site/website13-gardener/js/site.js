/* Every page: sticky header, mobile menu, scroll reveal, office hours status, "from £.. a month" prices,
   and (on the sample site) a short explanation in place of WhatsApp, phone and email. */
(function () {
  var data = window.Hornbeam;
  var G = window.HornbeamGarden;

  document.documentElement.classList.add("js");

  stickyHeader();
  mobileMenu();
  revealOnScroll();
  planFrom();
  officeStatus();
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

    // The links come before the button in the page, so opening the menu moves focus to the first link (Tab
    // then walks down the menu), and moving focus out of the header closes it again.
    button.addEventListener("click", function () {
      var open = !nav.classList.contains("is-open");
      set(open);
      if (open) {
        var first = nav.querySelector("a");
        if (first) {
          first.focus();
        }
      }
    });
    var header = button.closest("header");
    if (header) {
      header.addEventListener("focusout", function (event) {
        if (nav.classList.contains("is-open") && event.relatedTarget && !header.contains(event.relatedTarget)) {
          set(false);
        }
      });
    }
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

  // "Visit plans from £90 a month": the cheapest plan in data.js.
  function planFrom() {
    var text = G.money(G.cheapestMonthly());
    document.querySelectorAll("[data-plan-from]").forEach(function (el) {
      el.textContent = text;
    });
  }

  function officeStatus() {
    var status = G.officeStatus();
    document.querySelectorAll("[data-office-status]").forEach(function (el) {
      el.textContent = status.text;
      el.classList.toggle("is-open", status.open);
      el.hidden = false;
    });
  }

  // On the sample site the WhatsApp, phone and email links explain what they would do, because the numbers
  // and the email address are made up.
  function sampleContacts() {
    if (!data.sample) {
      return;
    }
    var links = document.querySelectorAll("a[data-contact]");
    if (!links.length) {
      return;
    }
    var words = {
      whatsapp: "On a real gardener's website, this opens a WhatsApp chat with the firm, so you can send photos of your garden and ask for a quote in a few taps.",
      phone: "On a real gardener's website, this rings the office from your phone. The number shown here is a made-up one kept for TV and film.",
      email: "On a real gardener's website, this opens a new email to the firm. The address shown here is a made-up one."
    };
    var dialog = null;
    var text = null;

    function build() {
      dialog = G.el("dialog", "dialog");
      dialog.setAttribute("aria-labelledby", "sample-dialog-title");
      var body = G.el("div", "dialog-body");
      var head = G.el("div", "dialog-head");
      var title = G.el("h2", "dialog-title", "This is a sample site");
      title.id = "sample-dialog-title";
      var close = G.el("button", "dialog-close");
      close.type = "button";
      close.setAttribute("aria-label", "Close");
      close.appendChild(G.icon("i-close"));
      head.append(title, close);
      text = G.el("p");
      var note = G.el("div", "sample-note");
      note.appendChild(G.el("p", "", "Hornbeam & Hoe is made up. Agile Release built this site to show what a small business website can do."));
      var actions = G.el("div", "dialog-actions");
      var more = G.el("a", "btn btn-quiet", "Get a site like this");
      more.href = "https://agilerelease.co.uk/#websites";
      var ok = G.el("button", "btn btn-green", "OK");
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
