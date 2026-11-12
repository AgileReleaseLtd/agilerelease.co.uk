/* Every page: sticky header, mobile menu, scroll reveal, the live "right now" details (rate, price, shop
   hours, arrival time on the call bar), prices filled in from data.js, and (on the sample site) a short
   explanation in place of the phone, WhatsApp and email. */
(function () {
  var D = window.Nightjar;
  var C = window.NightjarCore;

  document.documentElement.classList.add("js");

  stickyHeader();
  mobileMenu();
  currentPage();
  revealOnScroll();
  fillFromPrices();
  live();
  window.setInterval(live, 30000);
  document.addEventListener("nightjar:area", callbarEta);
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
    window.matchMedia("(min-width: 1021px)").addEventListener("change", function (event) {
      if (event.matches) {
        set(false);
      }
    });
  }

  // Marks the menu link for the page you are on.
  function currentPage() {
    var here = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === here) {
        a.setAttribute("aria-current", "page");
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

  // <strong data-from="euro"> gets the lowest price of that job; <strong data-money="key"> a sum from data.js.
  function fillFromPrices() {
    document.querySelectorAll("[data-from]").forEach(function (el) {
      var job = D.jobs[el.getAttribute("data-from")];
      if (job) {
        el.textContent = C.money(C.fromPrice(job));
      }
    });
    document.querySelectorAll("[data-money]").forEach(function (el) {
      var n = D[el.getAttribute("data-money")];
      if (typeof n === "number") {
        el.textContent = C.money(n);
      }
    });
  }

  function live() {
    var now = new Date();
    var rate = C.rateAt(now);
    var icons = { day: "#i-sun", evening: "#i-sunset", night: "#i-moon" };
    var holiday = C.bankHoliday(now);

    document.querySelectorAll("[data-now-time]").forEach(function (el) {
      el.textContent = C.fmt.weekday.format(now) + ", " + C.clock(now) + (holiday ? " (" + holiday + ")" : "");
    });
    document.querySelectorAll("[data-now-rate]").forEach(function (el) {
      el.textContent = D.rates[rate].long;
    });
    document.querySelectorAll("[data-now-until]").forEach(function (el) {
      el.textContent = C.untilText(now) ? "Applies " + C.untilText(now) + "." : "";
    });
    document.querySelectorAll("[data-now-icon] use").forEach(function (use) {
      use.setAttribute("href", icons[rate]);
    });
    document.querySelectorAll("[data-now-price]").forEach(function (el) {
      el.textContent = C.money(C.unitPrice(D.jobs[el.getAttribute("data-now-price")], rate));
    });
    document.querySelectorAll("[data-rate-name]").forEach(function (el) {
      el.textContent = D.rates[rate].long.toLowerCase();
    });
    // The arrival range across the whole area at this rate, in the hero card before a postcode is checked.
    // Only written when it changes, because it sits in a live region.
    var spread = C.arrivalSpread(rate);
    document.querySelectorAll("[data-now-spread]").forEach(function (el) {
      var text = C.arrivalText(spread);
      if (el.textContent !== text) {
        el.textContent = text;
      }
    });

    var shop = C.shopStatus(now);
    document.querySelectorAll("[data-shop-status]").forEach(function (el) {
      el.textContent = "Shop: " + shop.text.charAt(0).toLowerCase() + shop.text.slice(1) + ".";
    });
    document.querySelectorAll("[data-shop-dot]").forEach(function (el) {
      el.classList.toggle("is-open", shop.open);
    });

    callbarEta();
  }

  // The call bar on phones shows the typical arrival time: for the visitor's district once they have
  // checked it, otherwise the range across the whole area.
  function callbarEta() {
    var eta = document.querySelector("[data-callbar-eta]");
    if (!eta) {
      return;
    }
    var rate = C.rateAt();
    var code = C.savedArea();
    var small = eta.querySelector("small");
    var strong = eta.querySelector("strong");
    if (code) {
      var range = C.arrival(D.districts[code].band, rate);
      small.textContent = "To " + code + " now";
      strong.textContent = range[0] + " to " + range[1] + " min";
      eta.setAttribute("aria-label", "Typical arrival in " + code + " right now: " + range[0] + " to " + range[1] + " minutes. Check another postcode.");
    } else {
      var spread = C.arrivalSpread(rate);
      small.textContent = "Typical arrival";
      strong.textContent = spread[0] + " to " + spread[1] + " min";
      eta.setAttribute("aria-label", "Typical arrival " + spread[0] + " to " + spread[1] + " minutes. Check your postcode.");
    }
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

  // On the sample site the phone, WhatsApp and email buttons explain what they would do, because the
  // numbers and the email address are made up.
  function sampleContacts() {
    if (!D.sample) {
      return;
    }
    var words = {
      phone: "On a real locksmith's website, this button rings the locksmith straight away from a phone. The number shown here is a made-up one kept for TV and film.",
      whatsapp: "On a real locksmith's website, this button opens a WhatsApp chat, so people can send a photo of their lock and get a price.",
      email: "On a real locksmith's website, this button opens a new email to the locksmith. The address shown here is a made-up one."
    };
    var dialog = null;
    var text = null;
    var title = null;

    function build() {
      dialog = el("dialog", "dialog");
      dialog.setAttribute("aria-labelledby", "sample-dialog-title");
      var body = el("div", "dialog-body");
      var head = el("div", "dialog-head");
      title = el("h2", "dialog-title", "This is a sample site");
      title.id = "sample-dialog-title";
      var close = el("button", "dialog-close");
      close.type = "button";
      close.setAttribute("aria-label", "Close");
      close.innerHTML = '<svg class="icon"><use href="#i-close"/></svg>';
      head.append(title, close);
      text = el("p", "");
      var note = el("div", "sample-note");
      note.appendChild(el("p", "", "Nightjar Locksmiths is made up. Agile Release built this site to show what a small business website can do."));
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

    // Delegated, so buttons added later (area results, the quote form) behave the same.
    document.addEventListener("click", function (event) {
      var link = event.target.closest("a[data-contact]");
      if (!link || typeof HTMLDialogElement !== "function") {
        return;
      }
      event.preventDefault();
      if (!dialog) {
        build();
      }
      text.textContent = words[link.getAttribute("data-contact")] || words.phone;
      dialog.showModal();
    });
  }
})();
