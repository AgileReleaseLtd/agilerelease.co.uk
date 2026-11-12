/* Every page: shared helpers (money, dates, the property card, the rough guide), the sticky header and
   mobile menu, scroll reveal, the "open now" line, and the WhatsApp step. On the sample site the WhatsApp,
   phone and email buttons explain what they would do instead of opening anything. */
(function () {
  var data = window.Transom;
  document.documentElement.classList.add("js");

  /* ---------- Small helpers ---------- */

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

  function icon(name, className) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "icon" + (className ? " " + className : ""));
    svg.setAttribute("aria-hidden", "true");
    var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#i-" + name);
    svg.appendChild(use);
    return svg;
  }

  var gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
  var gbpPence = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var num = new Intl.NumberFormat("en-GB");

  function money(n) {
    return gbp.format(n);
  }
  function moneyPence(n) {
    return gbpPence.format(Math.round(n * 100) / 100);
  }
  // £1.65m style for tight spaces.
  function moneyShort(n) {
    if (n >= 1000000) {
      return "£" + (Math.round(n / 10000) / 100).toString() + "m";
    }
    if (n >= 10000) {
      return "£" + Math.round(n / 1000) + "k";
    }
    return money(n);
  }
  function withVat(pct) {
    return Math.round(pct * (1 + data.vat / 100) * 100) / 100;
  }
  function pctText(pct) {
    return (Math.round(pct * 100) / 100).toString() + "%";
  }

  // Weekly rent and deposits, the way the Tenant Fees Act works them out: monthly rent x 12 / 52.
  function weekly(pcm) {
    return (pcm * 12) / 52;
  }
  function deposit(pcm) {
    var weeks = pcm * 12 >= 50000 ? 6 : 5;
    // Rounded down to the penny so it never goes over the cap.
    return { weeks: weeks, amount: Math.floor(weekly(pcm) * weeks * 100) / 100 };
  }
  function holding(pcm) {
    return Math.floor(weekly(pcm) * 100) / 100;
  }

  /* ---------- Dates (the visitor's local date) ---------- */

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }
  function isoDate(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  function today() {
    var n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }
  function addDays(d, n) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  }
  var fmt = {
    long: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }),
    short: new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }),
    dayMonth: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" }),
    weekday: new Intl.DateTimeFormat("en-GB", { weekday: "long" }),
    dayShort: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "short" })
  };

  function listedLabel(days) {
    if (days <= 0) {
      return "Added today";
    }
    if (days === 1) {
      return "Added yesterday";
    }
    if (days < 14) {
      return "Added " + days + " days ago";
    }
    return "Added on " + fmt.dayMonth.format(addDays(today(), -days));
  }

  function availableLabel(days) {
    if (!days || days <= 0) {
      return "Available now";
    }
    return "Available from " + fmt.short.format(addDays(today(), days));
  }

  function closedReason(d) {
    return data.closed[isoDate(d)] || "";
  }

  // The days a viewing or valuation can be asked for: from tomorrow, Monday to Saturday, not bank holidays.
  function appointmentDays() {
    var out = [];
    var start = today();
    for (var i = 1; i <= data.bookingDays; i++) {
      var d = addDays(start, i);
      if (d.getDay() === 0 || closedReason(d)) {
        continue;
      }
      out.push({
        iso: isoDate(d),
        date: d,
        label: i === 1 ? "Tomorrow, " + fmt.short.format(d) : fmt.dayShort.format(d),
        slots: d.getDay() === 6 ? data.slots.saturday : data.slots.weekday
      });
    }
    return out;
  }

  // "9am", "6:30pm".
  function clock(hhmm) {
    var p = hhmm.split(":");
    var h = +p[0];
    var m = +p[1];
    var suffix = h >= 12 ? "pm" : "am";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (m ? ":" + pad(m) : "") + suffix;
  }

  /* ---------- Properties ---------- */

  var STATUS = {
    available: "Available",
    "under-offer": "Under offer",
    "let-agreed": "Let agreed",
    "sold-stc": "Sold STC"
  };

  function find(id) {
    return data.properties.filter(function (p) {
      return p.id === id;
    })[0] || null;
  }

  function place(p) {
    return p.street + ", " + p.area + " " + p.postcode;
  }

  function price(p) {
    if (p.mode === "let") {
      return { main: money(p.price) + " pcm", qualifier: "", sub: money(Math.round(weekly(p.price))) + " pw" };
    }
    return { main: money(p.price), qualifier: p.qualifier || "Asking price", sub: "" };
  }

  function sqm(sqft) {
    return Math.round(sqft * 0.092903);
  }

  function bedsText(p) {
    return p.beds === 0 ? "Studio" : p.beds + (p.beds === 1 ? " bedroom" : " bedrooms");
  }

  // The listing card used on the home page, the search page and under "Similar homes".
  function card(p, opts) {
    opts = opts || {};
    var li = el("li", "card card-" + p.status);
    var media = el("div", "card-media");
    if (window.TransomArt) {
      media.appendChild(window.TransomArt.property(p));
    }
    if (p.status !== "available") {
      media.appendChild(el("span", "slip slip-" + p.status, STATUS[p.status]));
    }
    var tag = el("span", "art-tag");
    tag.appendChild(icon("camera", "icon-xs"));
    tag.appendChild(document.createTextNode("Illustration"));
    media.appendChild(tag);

    var body = el("div", "card-body");
    var pr = price(p);
    var priceLine = el("p", "card-price");
    priceLine.appendChild(el("span", "card-qualifier", pr.qualifier || "To rent"));
    priceLine.appendChild(el("strong", "", pr.main));
    if (pr.sub) {
      priceLine.appendChild(el("span", "card-sub", pr.sub));
    }
    body.appendChild(priceLine);

    var h = el(opts.heading || "h3", "card-title");
    var a = el("a", "card-link", p.title);
    a.href = "property.html?id=" + encodeURIComponent(p.id);
    h.appendChild(a);
    body.appendChild(h);
    body.appendChild(el("p", "card-address", place(p)));

    var stats = el("ul", "stats");
    [["bed", p.beds === 0 ? "Studio" : String(p.beds), p.beds === 0 ? "" : p.beds === 1 ? " bedroom" : " bedrooms"],
     ["bath", String(p.baths), p.baths === 1 ? " bathroom" : " bathrooms"],
     ["area", num.format(p.sqft) + " sq ft", ""]].forEach(function (s) {
      var item = el("li");
      item.appendChild(icon(s[0]));
      item.appendChild(document.createTextNode(s[1]));
      if (s[2]) {
        item.appendChild(el("span", "visually-hidden", s[2]));
      }
      stats.appendChild(item);
    });
    body.appendChild(stats);

    var foot = el("p", "card-foot");
    foot.appendChild(el("span", "", p.mode === "let" ? availableLabel(p.availableIn) + " · " + p.furnished : listedLabel(p.listed)));
    foot.appendChild(el("span", "card-ref", p.ref));
    body.appendChild(foot);

    li.append(media, body);
    return li;
  }

  /* ---------- The rough guide ---------- */

  function nearestKey(table, beds) {
    var keys = Object.keys(table).map(Number).sort(function (a, b) {
      return a - b;
    });
    var pick = keys[0];
    keys.forEach(function (k) {
      if (k <= beds) {
        pick = k;
      }
    });
    return pick;
  }

  // A rough range for a home. mode "sale" or "let"; type "house", "flat" or "maisonette"; beds 0 to 5;
  // condition "work", "good" or "renovated".
  function guideRange(mode, type, beds, condition) {
    var table = data.guide[mode] && data.guide[mode][type];
    if (!table) {
      return null;
    }
    var key = nearestKey(table, beds);
    var base = table[key];
    var f = data.guide.condition[condition] || 1;
    var step = mode === "let" ? 25 : 5000;
    return {
      low: Math.round((base[0] * f) / step) * step,
      high: Math.round((base[1] * f) / step) * step,
      usedBeds: key,
      exact: key === beds
    };
  }

  /* ---------- Sending: WhatsApp, or on the sample site an explanation ---------- */

  var dialog = null;

  function buildDialog() {
    dialog = el("dialog", "dialog dialog-message");
    dialog.setAttribute("aria-labelledby", "message-dialog-title");
    var body = el("div", "dialog-body");
    var head = el("div", "dialog-head");
    var title = el("h2", "dialog-title", "");
    title.id = "message-dialog-title";
    title.tabIndex = -1;
    var close = el("button", "dialog-close");
    close.type = "button";
    close.setAttribute("aria-label", "Close");
    close.appendChild(icon("close"));
    head.append(title, close);
    var intro = el("p", "dialog-intro", "");
    var box = el("div", "message-box");
    box.appendChild(el("p", "message-label", "Your WhatsApp message"));
    var pre = el("pre", "message");
    pre.setAttribute("data-message", "");
    box.appendChild(pre);
    var note = el("div", "sample-note");
    note.appendChild(el("p", "", "Transom & Co is made up, so nothing has been sent. Agile Release built this sample to show what an estate agent's website can do."));
    var actions = el("div", "dialog-actions");
    var more = el("a", "btn btn-outline", "Get a site like this");
    more.href = "https://agilerelease.co.uk/#websites";
    var ok = el("button", "btn btn-primary", "Done");
    ok.type = "button";
    actions.append(more, ok);
    body.append(head, intro, box, note, actions);
    dialog.appendChild(body);
    document.body.appendChild(dialog);

    [close, ok].forEach(function (b) {
      b.addEventListener("click", function () {
        dialog.close();
      });
    });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) {
        dialog.close();
      }
    });
    dialog.addEventListener("close", function () {
      if (dialog.returnTo && document.contains(dialog.returnTo)) {
        dialog.returnTo.focus();
      }
    });
  }

  function showDialog(opts) {
    if (!dialog) {
      buildDialog();
    }
    dialog.querySelector(".dialog-title").textContent = opts.title;
    dialog.querySelector(".dialog-intro").textContent = opts.intro;
    var box = dialog.querySelector(".message-box");
    box.hidden = !opts.message;
    dialog.querySelector("[data-message]").textContent = opts.message || "";
    dialog.returnTo = opts.returnTo || document.activeElement;
    dialog.showModal();
    dialog.querySelector(".dialog-title").focus();
  }

  // Send a pre-written message. On the real site this opens WhatsApp with the text filled in.
  function send(text, returnTo) {
    if (data.sample && typeof HTMLDialogElement === "function") {
      showDialog({
        title: "Your message is ready",
        intro: "On a real agent's website, this step opens WhatsApp with the message below already written, so you only need to press send. You could also send it by email or read it out on the phone.",
        message: text,
        returnTo: returnTo
      });
      return;
    }
    var url = "https://wa.me/" + data.whatsapp + "?text=" + encodeURIComponent(text);
    var opened = window.open(url, "_blank");
    if (opened) {
      opened.opener = null;
    } else {
      window.location.href = url;
    }
  }

  function sampleContacts() {
    if (!data.sample) {
      return;
    }
    var words = {
      whatsapp: "On a real agent's website, this button opens a WhatsApp chat with the office, so you can ask a question or arrange a viewing in a few taps.",
      phone: "On a real agent's website, this button rings the office from your phone. The number shown here is a made-up one kept for TV and film.",
      email: "On a real agent's website, this button opens a new email to the office. The address shown here is a made-up one."
    };
    document.addEventListener("click", function (event) {
      var link = event.target.closest("a[data-contact]");
      if (!link || typeof HTMLDialogElement !== "function") {
        return;
      }
      event.preventDefault();
      showDialog({ title: "This is a sample site", intro: words[link.getAttribute("data-contact")] || words.whatsapp, message: "", returnTo: link });
    });
  }

  /* ---------- Page furniture ---------- */

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
    button.addEventListener("click", function (event) {
      var open = !nav.classList.contains("is-open");
      set(open);
      // The menu comes before the button in the page, so opened from the keyboard (detail 0), focus moves to
      // its first link; otherwise Tab would skip the menu and go on into the page.
      if (open && event.detail === 0) {
        nav.querySelector("a").focus();
      }
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
      items.forEach(function (n) {
        n.classList.add("is-visible");
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
    items.forEach(function (n) {
      observer.observe(n);
    });
  }

  // "Open now until 6:30pm" or "Closed now. Opens Monday at 9am", and today's row in the hours table.
  function openNow() {
    var spots = document.querySelectorAll("[data-open-now]");
    var now = new Date();
    document.querySelectorAll("[data-day]").forEach(function (row) {
      row.classList.toggle("is-today", +row.getAttribute("data-day") === now.getDay() && !closedReason(today()));
    });
    if (!spots.length) {
      return;
    }
    var mins = now.getHours() * 60 + now.getMinutes();
    var h = closedReason(today()) ? null : data.hours[now.getDay()];
    var text;
    var open = false;
    function toMin(s) {
      var p = s.split(":");
      return +p[0] * 60 + +p[1];
    }
    if (h && mins >= toMin(h[0]) && mins < toMin(h[1])) {
      open = true;
      text = "Open now, until " + clock(h[1]);
    } else if (h && mins < toMin(h[0])) {
      text = "Closed now. Opens today at " + clock(h[0]);
    } else {
      for (var i = 1; i <= 8; i++) {
        var d = addDays(today(), i);
        var dh = closedReason(d) ? null : data.hours[d.getDay()];
        if (dh) {
          text = "Closed now. Opens " + (i === 1 ? "tomorrow" : fmt.weekday.format(d)) + " at " + clock(dh[0]);
          break;
        }
      }
    }
    spots.forEach(function (spot) {
      spot.textContent = text || "";
      spot.classList.toggle("is-open", open);
    });
  }

  // Footer and contact: keep phone numbers and links in step with data.js.
  function fillContacts() {
    document.querySelectorAll("[data-fill]").forEach(function (n) {
      var key = n.getAttribute("data-fill");
      if (key === "sales-fee") {
        n.textContent = pctText(withVat(data.salesFee));
      }
    });
  }

  window.TransomSite = {
    el: el,
    icon: icon,
    money: money,
    moneyPence: moneyPence,
    moneyShort: moneyShort,
    withVat: withVat,
    pctText: pctText,
    weekly: weekly,
    deposit: deposit,
    holding: holding,
    isoDate: isoDate,
    today: today,
    addDays: addDays,
    fmt: fmt,
    listedLabel: listedLabel,
    availableLabel: availableLabel,
    appointmentDays: appointmentDays,
    clock: clock,
    STATUS: STATUS,
    find: find,
    place: place,
    price: price,
    sqm: sqm,
    bedsText: bedsText,
    card: card,
    guideRange: guideRange,
    send: send,
    showDialog: showDialog,
    num: num
  };

  stickyHeader();
  mobileMenu();
  revealOnScroll();
  openNow();
  fillContacts();
  sampleContacts();
})();
