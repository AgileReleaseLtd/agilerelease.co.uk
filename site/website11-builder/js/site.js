/* Every page: the menu, scroll reveal, the dates and figures worked out from today and from data.js, the
   office open/closed line, and (on the sample site) a short explanation in place of WhatsApp, phone and
   email. Also shares a few helpers with the other scripts as window.KD. */
(function () {
  var data = window.Kember;

  document.documentElement.classList.add("js");

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

  // An icon from the page's sprite.
  function icon(id, className) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "icon" + (className ? " " + className : ""));
    svg.setAttribute("aria-hidden", "true");
    var use = document.createElementNS(ns, "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
  }

  // 55000 -> "£55,000"
  function money(n) {
    return "£" + Math.round(n).toLocaleString("en-GB");
  }

  function range(g) {
    return money(g.low) + " to " + money(g.high);
  }

  // The lowest guide price for a project type.
  function lowest(type) {
    var guide = data.types[type].guide;
    var low = Infinity;
    Object.keys(guide).forEach(function (k) {
      low = Math.min(low, guide[k].low);
    });
    return low;
  }

  function addDays(d, n) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  }

  var fmt = {
    monthYear: new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }),
    month: new Intl.DateTimeFormat("en-GB", { month: "short" }),
    dayMonth: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" })
  };

  // The month a build could start: today plus our lead time.
  function nextStart(now) {
    return addDays(now || new Date(), data.leadWeeks * 7);
  }

  // The month a project finished, n months before this one.
  function monthsAgo(n, now) {
    now = now || new Date();
    return new Date(now.getFullYear(), now.getMonth() - n, 1);
  }

  window.KD = {
    el: el,
    icon: icon,
    money: money,
    range: range,
    lowest: lowest,
    addDays: addDays,
    fmt: fmt,
    nextStart: nextStart,
    monthsAgo: monthsAgo
  };

  stickyHeader();
  mobileMenu();
  revealOnScroll();
  fillFigures();
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

  function fillFigures() {
    var now = new Date();
    document.querySelectorAll("[data-years]").forEach(function (node) {
      node.textContent = String(now.getFullYear() - data.founded);
    });
    document.querySelectorAll("[data-next-start]").forEach(function (node) {
      node.textContent = fmt.monthYear.format(nextStart(now));
    });
    document.querySelectorAll("[data-quote-days]").forEach(function (node) {
      node.textContent = String(data.quoteDays);
    });
    // The title block on the hero drawing is dated today, as 10.11.26.
    document.querySelectorAll("[data-today]").forEach(function (node) {
      var dd = String(now.getDate()).padStart(2, "0");
      var mm = String(now.getMonth() + 1).padStart(2, "0");
      node.textContent = dd + "." + mm + "." + String(now.getFullYear()).slice(2);
    });
    document.querySelectorAll("[data-guide-from]").forEach(function (node) {
      node.textContent = money(lowest(node.getAttribute("data-guide-from")));
    });
  }

  // "Office open now, until 5:30pm" or "Office closed. We reply from 8am on Monday." (London time.)
  function officeStatus() {
    var node = document.querySelector("[data-office-status]");
    if (!node) {
      return;
    }
    var parts = {};
    try {
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "short"
      }).formatToParts(new Date()).forEach(function (p) {
        parts[p.type] = p.value;
      });
    } catch (e) {
      return;
    }
    var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    var dow = days[parts.weekday];
    var mins = (+parts.hour) * 60 + (+parts.minute);
    var iso = parts.year + "-" + parts.month + "-" + parts.day;

    function toMins(hm) {
      var b = hm.split(":");
      return (+b[0]) * 60 + (+b[1]);
    }
    function clock(hm) {
      var b = hm.split(":");
      var h = +b[0];
      var m = b[1] === "00" ? "" : ":" + b[1];
      if (h === 12 && !m) {
        return "12 noon";
      }
      return (h > 12 ? h - 12 : h) + m + (h >= 12 ? "pm" : "am");
    }

    var today = data.hours[dow];
    var open = today && !data.closed[iso] && mins >= toMins(today[0]) && mins < toMins(today[1]);
    if (open) {
      node.textContent = "Office open now, until " + clock(today[1]) + ".";
      node.classList.add("is-open");
    } else {
      // The next opening, up to a week ahead.
      var names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      var base = new Date(+parts.year, +parts.month - 1, +parts.day);
      for (var i = 0; i < 8; i++) {
        var d = addDays(base, i);
        var h = data.hours[d.getDay()];
        var key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
        if (!h || data.closed[key] || (i === 0 && mins >= toMins(h[0]))) {
          continue;
        }
        var when = i === 0 ? "today" : i === 1 ? "tomorrow" : "on " + names[d.getDay()];
        node.textContent = "Office closed now. We reply from " + clock(h[0]) + " " + when + ".";
        break;
      }
    }
    node.hidden = !node.textContent;
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
      whatsapp: "On a real builder's website, this button opens a WhatsApp chat with the firm, so you can ask a question and send photos of your house in a few taps.",
      phone: "On a real builder's website, this button rings the office from a phone. The number shown here is a made-up one kept for TV and film.",
      email: "On a real builder's website, this button opens a new email to the office. The address shown here is a made-up one."
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
      note.appendChild(el("p", "", "Kember & Daughter is made up. Agile Release built this site to show what a small business website can do."));
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
