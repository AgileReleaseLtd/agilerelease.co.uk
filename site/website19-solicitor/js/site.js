/* Every page: sticky header, mobile menu, scroll reveal, office hours and reply times worked out from today,
   the price summary on the home page, and (on the sample site) a short explanation in place of WhatsApp,
   phone and email. Also small helpers the other scripts share (window.QMUtil). */
(function () {
  var data = window.QM;
  var D = window.QMDates;

  document.documentElement.classList.add("js");

  /* ---------- Shared helpers ---------- */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== undefined && text !== null) {
      node.textContent = text;
    }
    return node;
  }

  function icon(id, className) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "icon" + (className ? " " + className : ""));
    svg.setAttribute("aria-hidden", "true");
    var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
  }

  function area(id) {
    return data.areas.filter(function (a) {
      return a.id === id;
    })[0];
  }

  function person(id) {
    return data.team.filter(function (p) {
      return p.id === id;
    })[0];
  }

  // The divider colour for a person: the colour of their main practice area.
  function personTab(p) {
    var a = p.areas.length ? area(p.areas[0]) : null;
    return "tab-" + (a ? a.tab : "plain");
  }

  // "Solicitor, qualified 2007" or "Not a solicitor, 9 years' experience".
  function personQual(p) {
    if (p.solicitor) {
      return "Solicitor, qualified " + p.qualified;
    }
    if (p.experience) {
      return "Not a solicitor, " + p.experience + " years' experience";
    }
    return "Not a solicitor";
  }

  function monogram(p, extra) {
    var m = el("span", "monogram " + personTab(p) + (extra ? " " + extra : ""), p.initials);
    m.setAttribute("aria-hidden", "true");
    return m;
  }

  // A small "who handles it" row: monogram, linked name, role and qualification.
  function whoItem(p) {
    var li = el("li", "who");
    li.appendChild(monogram(p));
    var text = el("span");
    var name = el("span", "who-name");
    var link = el("a", "", p.name);
    link.href = "team.html#" + p.id;
    name.appendChild(link);
    text.appendChild(name);
    var meta = p.role + ". " + personQual(p) + ".";
    if (p.supervisedBy) {
      meta += " Supervised by " + person(p.supervisedBy).name.split(" ")[0] + ".";
    }
    if (p.supervises && p.supervises.length) {
      meta += " Supervises the team's work.";
    }
    text.appendChild(el("span", "who-meta", meta));
    li.appendChild(text);
    return li;
  }

  window.QMUtil = {
    el: el,
    icon: icon,
    area: area,
    person: person,
    personTab: personTab,
    personQual: personQual,
    monogram: monogram,
    whoItem: whoItem
  };

  stickyHeader();
  mobileMenu();
  revealOnScroll();
  officeTimes();
  priceSummary();
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
    window.matchMedia("(min-width: 1101px)").addEventListener("change", function (event) {
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

  /* ---------- Office hours, worked out from today ---------- */

  // "by the end of tomorrow (Wednesday 11 November)" or "by the end of Monday 16 November".
  function replyPhrase(now) {
    var d = D.replyBy(now);
    var rel = D.relativeDay(d, now);
    if (rel === "tomorrow") {
      return "by the end of tomorrow, " + D.fmt.long.format(d);
    }
    return "by the end of " + D.fmt.long.format(d);
  }

  // Bank holidays and the Christmas closure in the next ten weeks, with neighbouring days joined into one range.
  function closureText(now) {
    var list = D.upcomingClosures(12, now).filter(function (c) {
      return c.date - D.startOfDay(now) < 70 * 86400000;
    });
    if (!list.length) {
      return "";
    }
    var groups = [];
    list.forEach(function (c) {
      var last = groups[groups.length - 1];
      if (last && (c.date - last.end) <= 4 * 86400000) {
        last.end = c.date;
        if (last.reasons.indexOf(c.reason) < 0) {
          last.reasons.push(c.reason);
        }
      } else {
        groups.push({ start: c.date, end: c.date, reasons: [c.reason] });
      }
    });
    var parts = groups.slice(0, 2).map(function (g) {
      if (D.sameDay(g.start, g.end)) {
        return D.fmt.long.format(g.start) + " (" + g.reasons[0] + ")";
      }
      return D.fmt.long.format(g.start) + " to " + D.fmt.long.format(g.end) + " (" + (g.reasons.some(function (r) {
        return /Christmas/.test(r);
      }) ? "Christmas and New Year" : g.reasons.join(", ")) + ")";
    });
    return "Coming up, we are closed " + parts.join(", and ") + ".";
  }

  function officeTimes() {
    var now = new Date();
    var status = D.officeStatus(now);

    var card = document.querySelector("[data-status-card]");
    if (card) {
      card.classList.toggle("is-open", status.open);
      card.querySelector("[data-status-text]").textContent = status.text;
      var sub = card.querySelector("[data-reply-by]");
      sub.textContent = "";
      sub.appendChild(document.createTextNode("Send an enquiry now and we'll reply "));
      sub.appendChild(el("strong", "", replyPhrase(now)));
      sub.appendChild(document.createTextNode("."));
    }

    document.querySelectorAll("[data-reply-by-inline]").forEach(function (node) {
      node.textContent = "If you send an enquiry now, we'll reply " + replyPhrase(now) + ".";
    });

    var hours = document.querySelector("[data-hours]");
    if (hours) {
      var today = D.startOfDay(now);
      var row = hours.querySelector('[data-day="' + today.getDay() + '"]');
      if (row) {
        row.classList.add("is-today");
        var dt = row.querySelector("dt");
        dt.appendChild(el("span", "visually-hidden", " (today)"));
      }
      var clinic = D.nextClinic(now);
      var sat = hours.querySelector('[data-day="6"] dd');
      if (clinic && sat) {
        sat.textContent = "First Saturday of the month, 9:30am to 12:30pm, wills and LPAs by appointment. Next: " +
          (D.sameDay(clinic, today) ? "today" : D.fmt.long.format(clinic)) + ".";
      }
      var reason = D.closedReason(today);
      if (row && reason) {
        row.querySelector("dd").textContent = "Closed today (" + reason + ")";
      }
    }

    var badge = document.querySelector("[data-hours-status]");
    if (badge) {
      badge.textContent = status.text;
      badge.classList.toggle("is-open", status.open);
    }

    var extra = document.querySelector("[data-hours-extra]");
    if (extra) {
      var t = closureText(now);
      if (t) {
        extra.textContent = t + " Also closed on other bank holidays.";
      }
    }
  }

  /* ---------- Home page price summary, from data.js ---------- */

  function priceSummary() {
    var box = document.querySelector("[data-price-summary]");
    if (!box || !window.QMFees) {
      return;
    }
    var F = window.QMFees;
    var C = data.conveyancing;
    var rows = [
      ["Buying a home", "from " + F.money(C.bands.purchase[0].fee) + " + VAT"],
      ["Selling a home", "from " + F.money(C.bands.sale[0].fee) + " + VAT"],
      ["Remortgage", "from " + F.money(C.bands.remortgage[0].fee) + " + VAT"],
      ["Probate, grant only", F.money(data.probate.grantOnly.fee) + " + VAT"]
    ];
    ["Will for one person", "One lasting power of attorney", "First meeting, up to an hour"].forEach(function (label) {
      var fee = data.otherFees.filter(function (f) {
        return f.label === label;
      })[0];
      if (fee) {
        rows.push([label === "First meeting, up to an hour" ? "Family law first meeting" : label, F.money(fee.fee) + " + VAT"]);
      }
    });
    box.textContent = "";
    rows.forEach(function (r) {
      var div = el("div");
      div.appendChild(el("dt", "", r[0]));
      div.appendChild(el("dd", "", r[1]));
      box.appendChild(div);
    });
  }

  /* ---------- Sample site: explain the contact buttons ---------- */

  var dialog = null;
  var dialogText = null;

  function sampleDialog(message) {
    if (typeof HTMLDialogElement !== "function") {
      return false;
    }
    if (!dialog) {
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
      dialogText = el("p", "");
      var note = el("div", "sample-note");
      note.appendChild(el("p", "", "Quinlan Mensah Solicitors is made up. Agile Release built this site to show what a small firm's website can do."));
      var actions = el("div", "dialog-actions");
      var more = el("a", "btn btn-outline", "Get a site like this");
      more.href = "https://agilerelease.co.uk/#websites";
      var ok = el("button", "btn btn-primary", "OK");
      ok.type = "button";
      actions.append(more, ok);
      body.append(head, dialogText, note, actions);
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
    dialogText.textContent = message;
    dialog.showModal();
    return true;
  }

  var words = {
    whatsapp: "On a real firm's website, this button opens a WhatsApp chat with the office, so you can ask a quick question.",
    phone: "On a real firm's website, this button rings the office from a phone. The number shown here is a made-up one kept for TV and film.",
    email: "On a real firm's website, this button opens a new email to the office. The address shown here is a made-up one."
  };
  window.QMUtil.sampleDialog = sampleDialog;
  window.QMUtil.sampleWords = words;

  function sampleContacts() {
    if (!data.sample) {
      return;
    }
    document.addEventListener("click", function (event) {
      var link = event.target.closest("a[data-contact]");
      if (!link) {
        return;
      }
      if (sampleDialog(words[link.getAttribute("data-contact")] || words.whatsapp)) {
        event.preventDefault();
      }
    });
  }
})();
