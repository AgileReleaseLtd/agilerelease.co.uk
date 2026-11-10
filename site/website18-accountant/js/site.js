/* Every page: sticky header, mobile menu, scroll reveal, fees and dates filled in from data.js, the home
   page's tax year card and deadline list, office hours, and (on the sample site) a short explanation in
   place of WhatsApp, phone and email. Also shares a few helpers with the page scripts (QuarterdayUI). */
(function () {
  var data = window.Quarterday;
  var D = window.QuarterdayDates;

  document.documentElement.classList.add("js");

  var CATS = {
    sa: "Self Assessment",
    mtd: "Making Tax Digital",
    payroll: "Employers",
    year: "Tax year"
  };

  var money0 = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
  var money2 = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2 });

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

  var SVGNS = "http://www.w3.org/2000/svg";

  function svg(tag, attrs) {
    var node = document.createElementNS(SVGNS, tag);
    Object.keys(attrs || {}).forEach(function (k) {
      node.setAttribute(k, attrs[k]);
    });
    return node;
  }

  function icon(id, className) {
    var s = svg("svg", { "class": "icon" + (className ? " " + className : ""), "aria-hidden": "true" });
    var use = svg("use", { href: "#" + id });
    s.appendChild(use);
    return s;
  }

  /* ---------- Fees ---------- */

  function fromFee(type) {
    var fees = data.packages[type].fees;
    return Math.min.apply(null, Object.keys(fees).map(function (k) {
      return fees[k];
    }));
  }

  // The lowest fee on a type's Making Tax Digital tier.
  function mtdFrom(type) {
    var p = data.packages[type];
    var list = Object.keys(p.fees).filter(function (band) {
      return p.tiers[band] === "mtd";
    }).map(function (band) {
      return p.fees[band];
    });
    return Math.min.apply(null, list);
  }

  function fillFees() {
    document.querySelectorAll("[data-from-fee]").forEach(function (node) {
      var type = node.getAttribute("data-from-fee");
      var value = type === "all" ? Math.min.apply(null, Object.keys(data.packages).map(fromFee)) : fromFee(type);
      node.textContent = money0.format(value);
    });
    document.querySelectorAll("[data-mtd-from]").forEach(function (node) {
      node.textContent = money0.format(mtdFrom(node.getAttribute("data-mtd-from")));
    });
  }

  /* ---------- Deadlines ---------- */

  // Joins the 31 January return and payment into one line, for short lists.
  function merged(list) {
    var out = [];
    list.forEach(function (item) {
      if (item.id === "sa-pay") {
        var prev = out[out.length - 1];
        if (prev && prev.id === "sa-online" && D.isoDate(prev.date) === D.isoDate(item.date)) {
          prev.title = "Tax return and payment deadline";
          prev.detail = "Online Self Assessment returns for " + D.taxYearLabel(item.ty) + " are due, and so is the tax, with any first payment on account for " + D.taxYearLabel(item.ty + 1) + ".";
          return;
        }
      }
      out.push(Object.assign({}, item));
    });
    return out;
  }

  // One deadline as a list item. opts: { heading: "h3", next: true }
  function deadlineItem(item, opts) {
    opts = opts || {};
    var li = el("li", "dl-item" + (opts.next ? " is-next" : ""));
    li.setAttribute("data-cat", item.cat);

    var time = el("time", "dl-date");
    time.setAttribute("datetime", D.isoDate(item.date));
    time.appendChild(el("span", "dl-day", String(item.date.getDate())));
    time.appendChild(el("span", "dl-month", D.fmt.monthShort.format(item.date)));
    time.appendChild(el("span", "visually-hidden", " " + item.date.getFullYear() + ", " + D.fmt.weekday.format(item.date)));

    var body = el("div", "dl-body");
    body.appendChild(el(opts.heading || "h3", "", item.title));
    body.appendChild(el("p", "", item.detail));
    var meta = el("div", "dl-meta");
    if (opts.next) {
      meta.appendChild(el("span", "tag tag-next", "Next up"));
    }
    meta.appendChild(el("span", "tag tag-" + item.cat, item.monthly ? CATS[item.cat] + ", every month" : CATS[item.cat]));
    body.appendChild(meta);

    var days = D.daysBetween(D.today(), item.date);
    var when = el("p", "dl-when" + (days <= 30 ? " is-soon" : ""), D.countdown(item.date));
    li.append(time, body, when);
    return li;
  }

  function homeDeadlines() {
    document.querySelectorAll("[data-deadline-list]").forEach(function (list) {
      var count = +list.getAttribute("data-count") || 5;
      var items = merged(D.deadlines(D.today(), 365).filter(function (d) {
        return !d.monthly;
      })).slice(0, count);
      if (!items.length) {
        return;
      }
      list.textContent = "";
      items.forEach(function (item, i) {
        list.appendChild(deadlineItem(item, { next: i === 0 }));
      });
    });
  }

  /* ---------- The tax year card (home) ---------- */

  function polar(cx, cy, r, deg) {
    var a = (deg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }

  // A ring segment from angle a0 to a1 (degrees, 0 = top, clockwise) between radii r0 and r1.
  function arcPath(cx, cy, r0, r1, a0, a1) {
    var large = a1 - a0 > 180 ? 1 : 0;
    var p1 = polar(cx, cy, r1, a0);
    var p2 = polar(cx, cy, r1, a1);
    var p3 = polar(cx, cy, r0, a1);
    var p4 = polar(cx, cy, r0, a0);
    function f(n) {
      return n.toFixed(2);
    }
    return "M" + f(p1[0]) + " " + f(p1[1]) +
      "A" + r1 + " " + r1 + " 0 " + large + " 1 " + f(p2[0]) + " " + f(p2[1]) +
      "L" + f(p3[0]) + " " + f(p3[1]) +
      "A" + r0 + " " + r0 + " 0 " + large + " 0 " + f(p4[0]) + " " + f(p4[1]) + "Z";
  }

  var ORDINAL = ["first", "second", "third", "fourth"];

  function yearCard() {
    var card = document.querySelector("[data-year-card]");
    if (!card) {
      return;
    }
    var today = D.today();
    var p = D.taxYearProgress(today);
    var label = card.querySelector("[data-ty-label]");
    label.textContent = D.taxYearLabel(p.start);
    card.querySelector("[data-ty-day]").textContent = "Day " + p.day + " of " + p.total;

    // Angles: the tax year runs clockwise from the top.
    function angle(d) {
      return (D.daysBetween(p.first, d) / p.total) * 360;
    }
    var starts = [p.first, D.addDays(p.quarterEnds[0], 1), D.addDays(p.quarterEnds[1], 1), D.addDays(p.quarterEnds[2], 1)];
    var bounds = starts.map(angle).concat([360]);
    var todayAngle = angle(today) + (360 / p.total) / 2;

    var cx = 100;
    var cy = 100;
    var R = 84;
    var r = 52;
    var gap = 1.6;
    var qNames = ["6 April to 5 July", "6 July to 5 October", "6 October to 5 January", "6 January to 5 April"];
    var s = svg("svg", { viewBox: "-22 -22 244 244", role: "img" });
    s.setAttribute("aria-label", "Tax year " + D.taxYearLabel(p.start) + ": day " + p.day + " of " + p.total + ", in the " + ORDINAL[p.quarter] + " quarter (" + qNames[p.quarter] + ").");

    for (var q = 0; q < 4; q++) {
      var a0 = bounds[q] + gap;
      var a1 = bounds[q + 1] - gap;
      var cls = "pie-q" + (q < p.quarter ? " is-done" : q === p.quarter ? " is-now" : "");
      s.appendChild(svg("path", { "class": cls, d: arcPath(cx, cy, r, R, a0, a1) }));
      if (q === p.quarter && todayAngle > a0) {
        s.appendChild(svg("path", { "class": "pie-fill", d: arcPath(cx, cy, r, R, a0, Math.min(todayAngle, a1)) }));
      }
    }

    // Deadline ticks round the outside.
    var inYear = D.deadlines(p.first, p.total - 1).filter(function (d) {
      return (d.cat === "sa" || d.cat === "mtd") && d.id !== "sa-pay";
    });
    var nextMarked = false;
    inYear.forEach(function (d) {
      var pt = polar(cx, cy, R + 9, angle(d.date) + (360 / p.total) / 2);
      var cls = "pie-tick";
      if (d.date >= today) {
        cls += nextMarked ? " is-ahead" : " is-next";
        nextMarked = true;
      }
      s.appendChild(svg("circle", { "class": cls, cx: pt[0].toFixed(2), cy: pt[1].toFixed(2), r: cls.indexOf("is-next") > -1 ? 4.2 : 2.8 }));
    });

    // Month labels at the start of each quarter.
    ["APR", "JUL", "OCT", "JAN"].forEach(function (m, i) {
      var pt = polar(cx, cy, R + 21, bounds[i] + 5);
      var t = svg("text", { "class": "pie-label", x: pt[0].toFixed(1), y: (pt[1] + 3.5).toFixed(1), "text-anchor": "middle" });
      t.textContent = m;
      s.appendChild(t);
    });

    // Today's marker across the ring.
    var h0 = polar(cx, cy, r - 6, todayAngle);
    var h1 = polar(cx, cy, R + 3, todayAngle);
    s.appendChild(svg("line", { "class": "pie-hand", x1: h0[0].toFixed(2), y1: h0[1].toFixed(2), x2: h1[0].toFixed(2), y2: h1[1].toFixed(2) }));
    s.appendChild(svg("circle", { "class": "pie-hand-dot", cx: h0[0].toFixed(2), cy: h0[1].toFixed(2), r: 3.5 }));

    var t1 = svg("text", { "class": "pie-centre", x: cx, y: cy + 6, "text-anchor": "middle" });
    t1.textContent = "Q" + (p.quarter + 1);
    var t2 = svg("text", { "class": "pie-centre-sub", x: cx, y: cy + 22, "text-anchor": "middle" });
    t2.textContent = "of the tax year";
    s.append(t1, t2);

    var pie = card.querySelector("[data-year-pie]");
    pie.textContent = "";
    pie.appendChild(s);

    // Next deadline and the three after it.
    var upcoming = merged(D.deadlines(today, 365).filter(function (d) {
      return d.cat === "sa" || d.cat === "mtd";
    }));
    var next = upcoming.filter(function (d) {
      return !d.minor;
    })[0];
    var box = card.querySelector("[data-year-next]");
    if (next) {
      box.textContent = "";
      box.appendChild(el("p", "year-next-label", "Next big deadline"));
      var date = el("p", "year-next-date");
      date.appendChild(el("span", "num", String(next.date.getDate())));
      date.appendChild(el("span", "", D.fmt.monthShort.format(next.date) + " " + next.date.getFullYear()));
      box.appendChild(date);
      box.appendChild(el("p", "year-next-title", next.title));
      var n = D.daysBetween(today, next.date);
      box.appendChild(el("p", "year-next-count", n === 0 ? "Today" : n === 1 ? "Tomorrow" : n + " days to go"));
    }
    var list = card.querySelector("[data-year-list]");
    list.textContent = "";
    upcoming.filter(function (d) {
      return d !== next;
    }).slice(0, 3).forEach(function (d) {
      var li = el("li");
      li.appendChild(el("span", "yl-date", d.date.getDate() + " " + D.fmt.monthShort.format(d.date)));
      li.appendChild(el("span", "yl-title", d.title));
      li.appendChild(el("span", "yl-when", D.countdown(d.date)));
      list.appendChild(li);
    });
  }

  /* ---------- MTD phases ---------- */

  // Status for each Making Tax Digital start date: started, next or later.
  function phaseStatuses() {
    var today = D.today();
    var seenNext = false;
    return data.mtd.phases.map(function (ph) {
      var start = D.parseIso(ph.starts);
      if (today >= start) {
        return { phase: ph, status: "now", text: "Started" };
      }
      if (!seenNext) {
        seenNext = true;
        return { phase: ph, status: "next", text: "Next: " + D.countdown(start).replace(/^In /, "in ") };
      }
      return { phase: ph, status: "later", text: "Later" };
    });
  }

  function homePhases() {
    var list = document.querySelector("[data-phases]");
    if (!list) {
      return;
    }
    var items = list.querySelectorAll(".phase");
    phaseStatuses().forEach(function (s, i) {
      if (!items[i]) {
        return;
      }
      items[i].classList.toggle("is-now", s.status === "now");
      var p = el("p", "phase-status");
      p.appendChild(el("span", "status-chip status-" + s.status, s.text));
      items[i].appendChild(p);
    });
  }

  /* ---------- Office hours ---------- */

  function officeStatus() {
    var nodes = document.querySelectorAll("[data-office-status]");
    if (!nodes.length) {
      return;
    }
    var st = D.officeStatus();
    nodes.forEach(function (node) {
      node.textContent = st.text;
      node.classList.add(st.open ? "is-open" : "is-closed");
    });
  }

  /* ---------- Header, menu and reveal ---------- */

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
    document.addEventListener("click", function (event) {
      if (nav.classList.contains("is-open") && !nav.contains(event.target) && !button.contains(event.target)) {
        set(false);
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
    }, { threshold: 0.06, rootMargin: "0px 0px -20px 0px" });
    items.forEach(function (node) {
      observer.observe(node);
    });
  }

  /* ---------- Sample contacts ---------- */

  var sampleDialog = null;
  var sampleText = null;

  // Explains what a WhatsApp, phone or email button would do, since the details are made up.
  function explain(kind, extra) {
    var words = {
      whatsapp: "On a real practice's website, this button opens a WhatsApp chat with the practice, so people can ask a question in a few taps.",
      phone: "On a real practice's website, this button rings the office from a phone. The number shown here is a made-up one kept for TV and film.",
      email: "On a real practice's website, this button opens a new email to the practice. The address shown here is a made-up one."
    };
    if (typeof HTMLDialogElement !== "function") {
      return false;
    }
    if (!sampleDialog) {
      sampleDialog = el("dialog", "dialog");
      sampleDialog.setAttribute("aria-labelledby", "sample-dialog-title");
      var body = el("div", "dialog-body");
      var head = el("div", "dialog-head");
      var title = el("h2", "dialog-title", "This is a sample site");
      title.id = "sample-dialog-title";
      var close = el("button", "dialog-close");
      close.type = "button";
      close.setAttribute("aria-label", "Close");
      close.appendChild(icon("i-close"));
      head.append(title, close);
      sampleText = el("p");
      var note = el("div", "sample-note");
      note.appendChild(el("p", "", "Quarterday is made up. Agile Release built this site to show what a small practice's website can do."));
      var actions = el("div", "dialog-actions");
      var more = el("a", "btn btn-outline", "Get a site like this");
      more.href = "https://agilerelease.co.uk/#websites";
      var ok = el("button", "btn btn-ink", "OK");
      ok.type = "button";
      actions.append(more, ok);
      body.append(head, sampleText, note, actions);
      sampleDialog.appendChild(body);
      document.body.appendChild(sampleDialog);
      [close, ok].forEach(function (b) {
        b.addEventListener("click", function () {
          sampleDialog.close();
        });
      });
      sampleDialog.addEventListener("click", function (event) {
        if (event.target === sampleDialog) {
          sampleDialog.close();
        }
      });
    }
    sampleText.textContent = (extra ? extra + " " : "") + (words[kind] || words.whatsapp);
    var open = document.querySelector("dialog[open]");
    if (open && open !== sampleDialog) {
      open.close();
    }
    sampleDialog.showModal();
    return true;
  }

  function sampleContacts() {
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

  window.QuarterdayUI = {
    el: el,
    svg: svg,
    icon: icon,
    money0: money0,
    money2: money2,
    CATS: CATS,
    fromFee: fromFee,
    merged: merged,
    deadlineItem: deadlineItem,
    phaseStatuses: phaseStatuses,
    explain: explain
  };

  stickyHeader();
  mobileMenu();
  fillFees();
  yearCard();
  homeDeadlines();
  homePhases();
  officeStatus();
  revealOnScroll();
  sampleContacts();
})();
