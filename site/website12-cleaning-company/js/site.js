/* Every page: sticky header, mobile menu, scroll reveal, prices from data.js, office hours, the postcode
   checker, the "message ready" window used by the forms, and (on the sample site) a short explanation in
   place of WhatsApp, phone and email. */
(function () {
  var data = window.Tessel;
  var D = window.TesselDates;
  var P = window.TesselPrice;

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

  function icon(id, extra) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "icon" + (extra ? " " + extra : ""));
    svg.setAttribute("aria-hidden", "true");
    var use = document.createElementNS(ns, "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
  }

  function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ---------- Postcode areas ---------- */

  // "sw12 8ab", "SW128AB" or "sw12" -> { valid, outward, area, ... }.
  function lookup(input) {
    var raw = String(input || "").toUpperCase().trim();
    var s = raw.replace(/[^A-Z0-9]/g, "");
    var m = /^([A-Z]{1,2}[0-9][A-Z0-9]?)([0-9][A-Z]{2})?$/.exec(s);
    if (!m) {
      return { valid: false, input: raw };
    }
    var out = m[1];
    var area = data.areas[out] || null;
    return { valid: true, outward: out, postcode: m[2] ? out + " " + m[2] : out, area: area };
  }

  // A short verdict for a postcode, and for a service when one is given.
  // kind: "yes", "part" (covered, but not for regular home cleans) or "no".
  function verdict(result, service, freq) {
    if (!result.valid) {
      return { kind: "bad", text: "That doesn't look like a postcode. Try the first half, like SW12." };
    }
    var a = result.area;
    if (!a) {
      return { kind: "no", text: "Sorry, " + result.outward + " is outside our area. For a big end-of-tenancy clean nearby, message us and we'll see what we can do." };
    }
    var where = result.outward + " (" + a.name + ")";
    if (a.status === "all") {
      return { kind: "yes", text: "Yes, we cover " + where + " for every service." };
    }
    if (service === "regular" && freq !== "oneoff") {
      return { kind: "no", text: "In " + where + " we do end-of-tenancy, one-off and office cleans. Our regular rounds there are full: ask to join the waiting list." };
    }
    if (service) {
      return { kind: "yes", text: "Yes, we cover " + where + " for this clean." };
    }
    return { kind: "part", text: "We cover " + where + " for end-of-tenancy, one-off and office cleans. Regular home cleans there are full for now: ask to join the waiting list." };
  }

  /* ---------- The message window ---------- */

  var msgDialog = null;

  // Shows a ready-written message. On the sample site it explains that nothing was sent; on a real site it
  // opens WhatsApp (or an email) with the message filled in.
  function sendMessage(opts) {
    var channel = opts.channel || "whatsapp";
    if (!data.sample) {
      var url = channel === "email"
        ? "mailto:" + data.email + "?subject=" + encodeURIComponent(opts.subject || "Cleaning") + "&body=" + encodeURIComponent(opts.text)
        : "https://wa.me/" + data.whatsapp + "?text=" + encodeURIComponent(opts.text);
      if (channel === "email") {
        window.location.href = url;
        return;
      }
      var opened = window.open(url, "_blank");
      if (opened) {
        opened.opener = null;
      } else {
        window.location.href = url;
      }
      return;
    }
    if (!msgDialog) {
      msgDialog = buildMessageDialog();
    }
    msgDialog.title.textContent = opts.title || "Your message";
    msgDialog.to.textContent = "";
    msgDialog.to.appendChild(icon(channel === "email" ? "i-mail" : "i-chat", "icon-sm"));
    msgDialog.to.appendChild(document.createTextNode(channel === "email"
      ? " Email to " + data.email + (opts.subject ? ", subject: " + opts.subject : "")
      : " To " + data.name + " on WhatsApp"));
    msgDialog.bubble.textContent = opts.text;
    msgDialog.what.textContent = channel === "email"
      ? "On the company's real website, this button opens a new email with the message above, ready to send."
      : "On the company's real website, this button opens WhatsApp with the message above, ready to send. The company replies to confirm.";
    msgDialog.again.textContent = opts.againLabel || "Change something";
    msgDialog.returnFocus = opts.returnFocus || document.activeElement;
    msgDialog.node.showModal();
    msgDialog.title.focus();
  }

  function buildMessageDialog() {
    var dialog = el("dialog", "dialog");
    dialog.setAttribute("aria-labelledby", "msg-dialog-title");
    dialog.setAttribute("data-message-dialog", "");
    var body = el("div", "dialog-body");
    var head = el("div", "dialog-head");
    var title = el("h2", "dialog-title");
    title.id = "msg-dialog-title";
    title.tabIndex = -1;
    var close = el("button", "dialog-close");
    close.type = "button";
    close.setAttribute("aria-label", "Close");
    close.appendChild(icon("i-close"));
    head.append(title, close);

    var chat = el("div", "chat");
    var to = el("p", "chat-to");
    var bubble = el("p", "bubble");
    bubble.setAttribute("data-message", "");
    chat.append(to, bubble);

    var note = el("div", "sample-note");
    note.appendChild(el("p", "")).appendChild(el("strong", "", "This is a sample website, so nothing was sent."));
    var what = el("p", "");
    note.appendChild(what);

    var actions = el("div", "dialog-actions");
    var again = el("button", "btn btn-outline");
    again.type = "button";
    again.setAttribute("data-again", "");
    var done = el("button", "btn btn-primary", "Done");
    done.type = "button";
    actions.append(again, done);

    body.append(head, chat, note, actions);
    dialog.appendChild(body);
    document.body.appendChild(dialog);

    var state = { node: dialog, title: title, to: to, bubble: bubble, what: what, again: again, returnFocus: null };
    function shut() {
      dialog.close();
    }
    close.addEventListener("click", shut);
    done.addEventListener("click", shut);
    again.addEventListener("click", shut);
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) {
        shut();
      }
    });
    dialog.addEventListener("close", function () {
      if (state.returnFocus && document.contains(state.returnFocus)) {
        state.returnFocus.focus();
      }
    });
    return state;
  }

  /* ---------- Every page ---------- */

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
    window.matchMedia("(min-width: 981px)").addEventListener("change", function (event) {
      if (event.matches) {
        set(false);
      }
    });
  }

  function revealOnScroll() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window) || reducedMotion()) {
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
    }, { threshold: 0.08 });
    items.forEach(function (node) {
      observer.observe(node);
    });
  }

  // "From" prices on the home page, worked out from data.js so they never drift from the estimate.
  function fromPrices() {
    var s = data.services;
    var lowestRegular = Math.min(s.regular.rates.weekly, s.regular.rates.fortnightly, s.regular.rates.oneoff);
    var set = {
      regular: P.money(lowestRegular),
      tenancy: P.money(s.tenancy.prices[0]),
      office: P.money(s.office.rates.busy)
    };
    document.querySelectorAll("[data-from]").forEach(function (node) {
      node.textContent = set[node.getAttribute("data-from")] || node.textContent;
    });
    document.querySelectorAll("[data-from-rate]").forEach(function (node) {
      node.textContent = P.money(lowestRegular);
    });
  }

  // The "Prices at a glance" tables on the home page, written from data.js so they match the estimate.
  function priceTables() {
    var s = data.services;
    function fill(name, rows) {
      var dl = document.querySelector('[data-price-table="' + name + '"]');
      if (!dl) {
        return;
      }
      dl.textContent = "";
      rows.forEach(function (r) {
        var div = el("div", "receipt-row");
        div.append(el("dt", "", r[0]), el("dd", "", r[1]));
        dl.appendChild(div);
      });
    }
    function note(name, text) {
      var node = document.querySelector('[data-price-note="' + name + '"]');
      if (node) {
        node.textContent = text;
      }
    }
    var r = s.regular;
    fill("regular-rates", r.frequencies.map(function (f) {
      return [f.label, P.money(r.rates[f.id]) + " an hour"];
    }));
    var hours = [["Studio or 1 bedroom", Math.max(r.hours[0], r.hours[1])]];
    for (var b = 2; b <= 4; b++) {
      hours.push([data.sizes[b], r.hours[b]]);
    }
    fill("regular-hours", hours.map(function (h) {
      return [h[0], P.hours(Math.max(r.minHours, h[1]))];
    }));
    note("regular", "Add " + P.hours(r.extraBathroom) + " for each extra bathroom. The first clean in any home takes about an hour longer.");

    var t = s.tenancy;
    fill("tenancy", t.prices.map(function (price, i) {
      return [data.sizes[i], P.money(price)];
    }));
    var carpets = data.extras.filter(function (x) {
      return x.id === "carpets";
    })[0].tenancy.each;
    note("tenancy", "Fixed prices with one bathroom. Each extra bathroom " + P.money(t.extraBathroom.price) + ", furnished homes " + P.money(t.furnished.price) + ", carpets " + P.money(carpets) + " a room.");

    var o = s.office;
    fill("office", [
      ["Once or twice a week", P.money(o.rates.standard) + " an hour"],
      ["Three or more times a week", P.money(o.rates.busy) + " an hour"],
      ["Shortest visit", P.hours(o.minHours)]
    ]);
    var ex = P.estimate({ service: "office", unit: "desks", size: 12, toilets: 2, visits: "2" });
    fill("office-example", [["12 desks, 2 toilets, twice a week", P.money(ex.price) + " a visit"]]);
    note("office", "That's about " + P.money(ex.month.price) + " a month. Offices over " + o.maxM2 + "\u00a0m² get a price after a short visit.");
  }

  // Marks today in the hours list, and says whether the office is answering now.
  function officeHours() {
    var now = new Date();
    var day = now.getDay();
    document.querySelectorAll("[data-hours] [data-days]").forEach(function (row) {
      var spec = row.getAttribute("data-days").split("-");
      var lo = +spec[0];
      var hi = spec.length > 1 ? +spec[1] : lo;
      row.classList.toggle("is-today", day >= lo && day <= hi);
    });
    var status = document.querySelector("[data-open-now]");
    if (!status) {
      return;
    }
    var s = D.officeStatus(now);
    status.classList.toggle("is-open", s.open);
    status.textContent = s.open
      ? "Open now, until " + s.closesAt
      : "Closed now" + (s.next ? ". We open " + s.next : "");
  }

  function areaChecker() {
    var list = document.querySelector("[data-districts]");
    if (list) {
      list.textContent = "";
      Object.keys(data.areas).forEach(function (code) {
        var a = data.areas[code];
        var li = el("li", "district " + (a.home ? "is-home" : a.status === "all" ? "is-all" : "is-oneoff"));
        li.setAttribute("data-district", code);
        li.appendChild(el("b", "", code));
        li.appendChild(el("span", "", a.name));
        if (a.status !== "all") {
          li.appendChild(el("span", "visually-hidden", " (end-of-tenancy, one-off and office cleans)"));
        }
        list.appendChild(li);
      });
    }

    var form = document.querySelector("[data-area-checker]");
    if (!form) {
      return;
    }
    var input = form.querySelector("input");
    var out = form.querySelector("[data-area-result]");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var r = lookup(input.value);
      var v = r.valid || input.value.trim() ? verdict(r) : { kind: "bad", text: "Type a postcode first, like SW12 8AB." };
      out.hidden = false;
      out.className = "area-result is-" + v.kind;
      out.textContent = "";
      out.appendChild(icon(v.kind === "yes" ? "i-check" : v.kind === "part" ? "i-info" : "i-alert"));
      var p = el("p", "", v.text);
      out.appendChild(p);
      if (v.kind === "yes" || v.kind === "part") {
        p.appendChild(document.createTextNode(" "));
        var link = el("a", "", "Get an estimate");
        link.href = "estimate.html";
        p.appendChild(link);
      }
      if (list) {
        list.querySelectorAll(".district").forEach(function (li) {
          li.classList.toggle("is-match", r.valid && li.getAttribute("data-district") === r.outward);
        });
      }
    });
  }

  // On the sample site the WhatsApp, phone and email links explain what they would do, because the
  // numbers and the email address are made up.
  function sampleContacts() {
    if (!data.sample) {
      return;
    }
    var words = {
      whatsapp: "On a real cleaning company's website, this button opens a WhatsApp chat with the office, so people can send photos and ask for a price in a few taps.",
      phone: "On a real cleaning company's website, this button rings the office from a phone. The number shown here is a made-up one kept for TV and film.",
      email: "On a real cleaning company's website, this button opens a new email to the office. The address shown here is a made-up one."
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
      note.appendChild(el("p", "", data.name + " is made up. Agile Release built this site to show what a small business website can do."));
      var actions = el("div", "dialog-actions");
      var more = el("a", "btn btn-outline", "Get a site like this");
      more.href = "https://agilerelease.co.uk/#websites";
      var ok = el("button", "btn btn-primary", "OK");
      ok.type = "button";
      actions.append(more, ok);
      body.append(head, text, note, actions);
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
    }

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

  stickyHeader();
  mobileMenu();
  revealOnScroll();
  fromPrices();
  priceTables();
  officeHours();
  areaChecker();
  sampleContacts();

  window.TesselSite = {
    el: el,
    icon: icon,
    reducedMotion: reducedMotion,
    lookup: lookup,
    verdict: verdict,
    sendMessage: sendMessage
  };
})();
