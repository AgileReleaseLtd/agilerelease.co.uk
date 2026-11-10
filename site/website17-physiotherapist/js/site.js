/* Every page: sticky header, mobile menu, scroll reveal, "open now", opening hours, prices and other
   details filled in from data.js, the body chart's highlight on hover, and (on the sample site) a short
   explanation in place of WhatsApp, phone and email. */
(function () {
  "use strict";
  var D = window.Spindle;
  var C = window.SpindleCore;

  document.documentElement.classList.add("js");

  stickyHeader();
  mobileMenu();
  revealOnScroll();
  openNow();
  hoursTable();
  fillPrices();
  workingDays();
  areaCounts();
  insurerLists();
  packageRows();
  nextFree();
  chartHover();
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
    window.matchMedia("(min-width: 1041px)").addEventListener("change", function (event) {
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

  // "Open now, until 8pm" or "Closed now, opens tomorrow at 7:30am", refreshed every minute.
  function openNow() {
    var lines = document.querySelectorAll("[data-open-now]");
    if (!lines.length) {
      return;
    }
    function update() {
      var status = C.openStatus();
      lines.forEach(function (line) {
        line.classList.add("open-line");
        line.classList.toggle("is-open", status.open);
        var text = line.querySelector(".open-text");
        var detail = line.querySelector(".open-detail");
        if (text) {
          text.textContent = status.text;
        }
        if (detail) {
          detail.textContent = status.detail;
        }
      });
    }
    update();
    window.setInterval(update, 60000);
  }

  function hoursText(rows) {
    if (!rows.length) {
      return "Closed";
    }
    return rows.map(function (r) {
      return C.clock(C.fromMinutes(r[0])) + " to " + C.clock(C.fromMinutes(r[1]));
    }).join(", ");
  }

  // The week's hours, Monday first, with today marked; then any closures or short days coming up.
  function hoursTable() {
    var list = document.querySelector("[data-hours]");
    if (!list) {
      return;
    }
    var today = C.now();
    var monday = C.addDays(C.startOfDay(today), -((today.getDay() + 6) % 7));
    list.textContent = "";
    for (var i = 0; i < 7; i++) {
      var d = C.addDays(monday, i);
      var dow = d.getDay();
      var rows = (D.hours[dow] || []).map(function (r) {
        return [C.toMinutes(r[0]), C.toMinutes(r[1])];
      });
      var row = el("div", C.sameDay(d, today) ? "is-today" : "");
      row.appendChild(el("dt", "", C.fmt.weekday.format(d)));
      row.appendChild(el("dd", "", hoursText(rows)));
      list.appendChild(row);
    }

    var special = document.querySelector("[data-hours-special]");
    if (!special) {
      return;
    }
    special.textContent = "";
    var count = 0;
    for (var n = 0; n < 45; n++) {
      var day = C.addDays(C.startOfDay(today), n);
      var closed = C.closedReason(day);
      var sp = C.specialDay(day);
      if (closed || sp) {
        var li = el("li");
        li.appendChild(el("strong", "", C.fmt.short.format(day) + ": "));
        li.appendChild(document.createTextNode(closed ? "closed (" + closed + ")" : hoursText(C.clinicHours(day)) + " (" + sp.name + ")"));
        special.appendChild(li);
        count++;
      }
    }
    special.hidden = count === 0;
  }

  function fillPrices() {
    document.querySelectorAll("[data-type-price]").forEach(function (node) {
      var type = D.types[node.getAttribute("data-type-price")];
      if (type) {
        node.textContent = C.money(type.price);
      }
    });
    document.querySelectorAll("[data-type-minutes]").forEach(function (node) {
      var type = D.types[node.getAttribute("data-type-minutes")];
      if (type) {
        node.textContent = type.minutes + " minutes";
      }
    });
  }

  // The days each person works, as small tags: "Mon", "Tue till 8pm", "Sat morning".
  function workingDays() {
    document.querySelectorAll("[data-works]").forEach(function (list) {
      var pid = list.getAttribute("data-works");
      if (!D.practitioners[pid]) {
        return;
      }
      list.textContent = "";
      C.workingDays(pid).forEach(function (w) {
        var label = w.day;
        if (w.dow === 6 && C.toMinutes(D.practitioners[pid].week[6].slice(-1)[0][1]) <= 14 * 60) {
          label += " morning";
        } else if (w.late) {
          label += " till " + w.to;
        }
        list.appendChild(el("li", w.late ? "is-late" : "", label));
      });
    });
  }

  function conditionCount(area) {
    return D.conditions.filter(function (c) {
      return c.areas.indexOf(area) !== -1;
    }).length;
  }

  function areaCounts() {
    document.querySelectorAll("[data-area-count]").forEach(function (node) {
      var n = conditionCount(node.getAttribute("data-area-count"));
      node.textContent = String(n);
      var link = node.closest("a");
      if (link) {
        link.setAttribute("aria-label", D.areas[node.getAttribute("data-area-count")].name + ", " + n + (n === 1 ? " condition" : " conditions"));
      }
    });
  }

  function insurerLists() {
    [["[data-insurers]", D.insurers], ["[data-cash-plans]", D.cashPlans]].forEach(function (pair) {
      document.querySelectorAll(pair[0]).forEach(function (list) {
        list.textContent = "";
        pair[1].forEach(function (name) {
          list.appendChild(el("li", "", name));
        });
      });
    });
  }

  function packageName(pkg) {
    var type = D.types[pkg.type];
    if (type.kind === "massage") {
      return pkg.count + " sports massages, " + type.minutes + " min";
    }
    return pkg.count + " " + type.name.toLowerCase() + "s";
  }

  function packageRows() {
    var list = document.querySelector("[data-package-rows]");
    if (!list) {
      return;
    }
    list.textContent = "";
    D.packages.forEach(function (pkg) {
      var p = C.packagePrices(pkg);
      var li = el("li");
      var name = el("span", "pr-name", packageName(pkg));
      name.appendChild(el("small", "", C.money(p.each) + " each, you save " + C.money(p.saving)));
      li.appendChild(name);
      li.appendChild(el("span", "pr-price", C.money(pkg.price)));
      list.appendChild(li);
    });
  }

  // "Next initial assessment: tomorrow at 7:30am with Rhiannon", linking to that time on the booking page.
  function nextFree() {
    var box = document.querySelector("[data-next-free]");
    if (!box) {
      return;
    }
    var now = C.now();
    var win = C.bookingWindow(now);
    for (var d = win.first; d <= win.last; d = C.addDays(d, 1)) {
      var slots = C.slotsOn(d, "initial", "any", now);
      if (slots.length) {
        var s = slots[0];
        var n = Math.round((d - win.first) / 86400000);
        var day = n === 0 ? "today" : n === 1 ? "tomorrow" : C.fmt.weekday.format(d);
        box.querySelector("[data-next-when]").textContent = day + " at " + C.clock(s.time) + " with " + D.practitioners[s.who[0]].first;
        var link = box.querySelector("[data-next-link]");
        link.href = "book.html?type=initial&with=" + s.who[0] + "&date=" + C.isoDate(d) + "&time=" + s.time;
        link.setAttribute("aria-label", "Book the next initial assessment, " + day + " at " + C.clock(s.time));
        box.hidden = false;
        return;
      }
    }
  }

  // Hovering or focusing a hotspot or an area link shades that area on the body chart.
  function chartHover() {
    var chart = document.querySelector("[data-chart]");
    if (!chart) {
      return;
    }
    function set(area, on) {
      chart.querySelectorAll('.zone[data-zone="' + area + '"]').forEach(function (z) {
        z.classList.toggle("is-hover", on);
      });
    }
    document.querySelectorAll("[data-chart] [data-area], [data-area-links] [data-area], [data-area-chips] [data-area]").forEach(function (node) {
      var area = node.getAttribute("data-area");
      ["mouseenter", "focus"].forEach(function (type) {
        node.addEventListener(type, function () {
          set(area, true);
        });
      });
      ["mouseleave", "blur"].forEach(function (type) {
        node.addEventListener(type, function () {
          set(area, false);
        });
      });
    });
  }

  // On the sample site the WhatsApp, phone and email buttons explain what they would do, because the
  // numbers and the email address are made up.
  function sampleContacts() {
    if (!D.sample) {
      return;
    }
    var words = {
      whatsapp: "On a real clinic’s website, this button opens a WhatsApp chat with the clinic, so people can ask a question or book in a few taps.",
      phone: "On a real clinic’s website, this button rings the clinic from a phone. The number shown here is a made-up one kept for TV and film.",
      email: "On a real clinic’s website, this button opens a new email to the clinic. The address shown here is a made-up one."
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
      note.appendChild(el("p", "", "Spindle Physio is made up. Agile Release built this site to show what a small business website can do."));
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

    // Delegated, so links added later (the booking page's email link) are covered too.
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
})();
