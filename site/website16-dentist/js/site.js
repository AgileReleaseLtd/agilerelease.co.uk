/* Every page: sticky header, mobile menu, scroll reveal, the live "open now" and NHS list lines, the hours
   tables, the closed-day notice, and (on the sample site) a short explanation in place of WhatsApp, phone
   and email. */
(function () {
  var data = window.Harebell;
  var clock = window.HarebellClock;

  document.documentElement.classList.add("js");

  stickyHeader();
  mobileMenu();
  revealOnScroll();
  openStatus();
  nhsFlag();
  hoursTables();
  closureNotice();
  slotsSummary();
  sampleContacts();

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
    window.matchMedia("(min-width: 1081px)").addEventListener("change", function (event) {
      if (event.matches) {
        set(false);
      }
    });
  }

  function revealOnScroll() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
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

  function setState(node, state) {
    node.classList.remove("is-open", "is-closed", "is-soon");
    node.classList.add(state.open ? (state.soon ? "is-soon" : "is-open") : "is-closed");
  }

  // "Open now until 6pm" wherever a page has [data-open-row] or [data-open-line]. Refreshed every minute.
  function openStatus() {
    var rows = document.querySelectorAll("[data-open-row], [data-open-line]");
    if (!rows.length) {
      return;
    }
    function render() {
      var state = clock.describe(data.hours, clock.now());
      rows.forEach(function (row) {
        setState(row, state);
        var head = row.querySelector("[data-open-headline]");
        var detail = row.querySelector("[data-open-detail]");
        if (head) {
          head.textContent = state.headline;
        }
        if (detail) {
          detail.textContent = state.detail;
        }
      });
    }
    render();
    window.setInterval(render, 60000);
  }

  // The "accepting new NHS patients" flag, everywhere it appears.
  function nhsFlag() {
    var nhs = data.nhs;
    var yes = nhs.acceptingNew;
    var words = {
      yesno: yes ? "Yes" : "No",
      short: yes
        ? "Adults and children. Places are limited, so join soon."
        : (nhs.childrenWelcome ? "Under-18s welcome. " : "") + (nhs.waitingList ? "Adults can join the waiting list." : "Private care is available."),
      long: yes
        ? "NHS places for new patients are limited, but we are taking new NHS patients at the moment, adults and children. Send us your details and we will call you to book."
        : "NHS places for new patients are limited. We are not taking new adult NHS patients at the moment" +
          (nhs.childrenWelcome ? ", but children under 18 are welcome on the NHS" : "") + "." +
          (nhs.waitingList ? " Adults can join our NHS waiting list, or be seen privately in the meantime." : " Adults can be seen privately."),
      faq: yes
        ? "Yes, at the moment, for adults and children. NHS places are limited, so we cannot promise how long this will last. Send us your details and we will call you to book."
        : "Not adults at the moment, sorry. NHS places for new patients are limited." +
          (nhs.childrenWelcome ? " Children under 18 are welcome on the NHS." : "") +
          (nhs.waitingList ? " Adults can join our NHS waiting list," : " Adults can") +
          " be seen privately in the meantime, or look for another NHS dentist on nhs.uk."
    };
    document.querySelectorAll("[data-nhs-yesno]").forEach(function (node) {
      node.textContent = words.yesno;
    });
    document.querySelectorAll("[data-nhs-short]").forEach(function (node) {
      node.textContent = words.short;
    });
    document.querySelectorAll("[data-nhs-long]").forEach(function (node) {
      node.textContent = words.long;
    });
    document.querySelectorAll("[data-nhs-faq]").forEach(function (node) {
      node.textContent = words.faq;
    });
    document.querySelectorAll("[data-nhs-from]").forEach(function (node) {
      node.textContent = (node.tagName === "SPAN" ? "from " : "From ") + data.nhsSource.from;
    });
    document.querySelectorAll("[data-nhs-row], [data-nhs-flag]").forEach(function (node) {
      node.classList.toggle("is-yes", yes);
      node.classList.toggle("is-no", !yes);
    });
  }

  // Hours tables from data.js, today's row marked. data-hours="hours" or "emergencyLine".
  function hoursTables() {
    document.querySelectorAll("[data-hours]").forEach(function (dl) {
      var table = data[dl.getAttribute("data-hours")];
      if (!table) {
        return;
      }
      dl.textContent = "";
      clock.weekRows(table, clock.now()).forEach(function (row) {
        var div = el("div", row.today ? "is-today" : "");
        var dt = el("dt", "", row.day);
        if (row.today) {
          dt.appendChild(el("span", "visually-hidden", " (today)"));
        }
        div.append(dt, el("dd", "", row.text));
        dl.appendChild(div);
      });
    });
  }

  // A notice when the practice is closed for a bank holiday in the next three weeks.
  function closureNotice() {
    var box = document.querySelector("[data-closure-notice]");
    if (!box) {
      return;
    }
    var next = clock.nextClosure(clock.now(), 21);
    if (!next) {
      return;
    }
    box.textContent = "We are closed " + next.when + " (" + next.reason + "). For dental emergencies when we are closed, call NHS 111.";
    box.hidden = false;
  }

  // "3 emergency slots left today" on the home page's Today card.
  function slotsSummary() {
    var row = document.querySelector("[data-slots-row]");
    if (!row) {
      return;
    }
    var head = row.querySelector("[data-slots-headline]");
    var detail = row.querySelector("[data-slots-detail]");
    var at = clock.now();
    var slots = clock.slotsToday(at);
    var left = slots.filter(function (s) {
      return !s.past;
    });
    var line = clock.status(data.emergencyLine, at);
    var opensToday = !line.open && line.opens && clock.isoDate(line.opens.date) === clock.isoDate(at);
    if (left.length && (line.open || opensToday)) {
      head.textContent = left.length + (left.length === 1 ? " emergency slot" : " emergency slots") + " held back for today";
      detail.textContent = line.open ? "In pain? Call " + data.emergencyPhone : "Emergency line opens at " + clock.formatTime(line.opens.time);
    } else {
      var next = line.opens;
      head.textContent = "Emergency slots: none left today";
      detail.textContent = next ? "Line opens " + clock.whenWords(next.date, at) + " at " + clock.formatTime(next.time) + ". Out of hours: NHS 111" : "Out of hours: call NHS 111";
    }
  }

  // On the sample site the WhatsApp, phone and email buttons explain what they would do, because the
  // numbers and the email address are made up. Other scripts call HarebellSample.explain(kind).
  function sampleContacts() {
    var words = {
      whatsapp: "On a real practice's website, this button opens a WhatsApp chat with reception, with any message already written.",
      phone: "On a real practice's website, this button rings the practice from a phone. The number shown here is a made-up one kept for TV and film.",
      email: "On a real practice's website, this button opens a new email to the practice. The address shown here is a made-up one.",
      maps: "This would open the practice's real address in Google Maps."
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
      var note = el("p", "sample-note", "Harebell Dental is made up. Agile Release built this site to show what a small practice's website can do. For real dental advice, call NHS 111.");
      var actions = el("div", "dialog-actions");
      var more = el("a", "btn btn-outline", "Get a site like this");
      more.href = "https://agilerelease.co.uk/#websites";
      var ok = el("button", "btn btn-primary", "OK");
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

    function explain(kind) {
      if (typeof HTMLDialogElement !== "function") {
        return false;
      }
      if (!dialog) {
        build();
      }
      text.textContent = words[kind] || words.whatsapp;
      dialog.showModal();
      return true;
    }

    window.HarebellSample = { explain: explain };

    if (!data.sample) {
      return;
    }
    document.addEventListener("click", function (event) {
      var link = event.target.closest("a[data-contact]");
      if (!link) {
        return;
      }
      if (explain(link.getAttribute("data-contact"))) {
        event.preventDefault();
      }
    });
  }
})();
