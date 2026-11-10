/* Every page: sticky header, mobile menu, scroll reveal, prices and rates from data.js, the postcode
   checker, the "message ready" window used by the forms, and (on the sample site) a short explanation in
   place of WhatsApp, phone and email. */
(function () {
  var data = window.Pinn;
  var T = window.PinnTime;

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

  // "ha5 3ab", "HA53AB" or "ha5" -> { outward: "HA5", ... }. valid is false when it is not a UK postcode.
  function lookup(input) {
    var s = String(input || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    var m = /^([A-Z]{1,2}[0-9][A-Z0-9]?)([0-9][A-Z]{2})?$/.exec(s);
    if (!m) {
      return { valid: false, input: s };
    }
    var out = m[1];
    var full = m[2] ? out + " " + m[2] : out;
    for (var i = 0; i < data.zones.length; i++) {
      var zone = data.zones[i];
      if (zone.districts[out]) {
        return { valid: true, covered: true, outward: out, postcode: full, zone: zone, place: zone.districts[out] };
      }
    }
    return { valid: true, covered: false, outward: out, postcode: full };
  }

  // One line for forms: "HA5 (Pinner, Eastcote, Hatch End) is in our area." (or not).
  function coverageLine(result) {
    if (!result.valid) {
      return "";
    }
    if (!result.covered) {
      return result.outward + " is outside the area we cover. Send it anyway and we will tell you if we can help.";
    }
    return result.outward + " (" + result.place + ") is in our area" +
      (result.zone.travel ? ": £" + result.zone.travel + " travel is added to the first hour." : ".");
  }

  function renderResult(box, result) {
    box.textContent = "";
    box.className = "area-result";
    if (!result.valid) {
      box.classList.add("is-bad");
      box.appendChild(el("p", "area-result-title", "That does not look like a postcode."));
      box.appendChild(el("p", "", "Try the first part, like HA5, or the whole postcode, like HA5 3AB."));
      return;
    }
    if (!result.covered) {
      box.classList.add("is-out");
      box.appendChild(el("p", "area-result-title", "Sorry, " + result.outward + " is outside our area."));
      var p = el("p", "");
      p.appendChild(document.createTextNode("We would rather send you to someone close by than keep you waiting. To find a Gas Safe engineer near you, search the "));
      var a = el("a", "", "Gas Safe Register");
      a.href = data.gasSafeRegister.web;
      p.appendChild(a);
      p.appendChild(document.createTextNode("."));
      box.appendChild(p);
      return;
    }
    var zone = result.zone;
    box.classList.add("is-in", "zone-" + zone.id);
    box.appendChild(el("p", "area-result-title", "Yes, we cover " + result.outward + "."));
    box.appendChild(el("p", "area-result-place", result.place));
    var dl = el("dl", "area-facts");
    function fact(term, value) {
      var row = el("div");
      row.append(el("dt", "", term), el("dd", "", value));
      dl.appendChild(row);
    }
    fact("Emergency call-out", zone.arrival.charAt(0).toUpperCase() + zone.arrival.slice(1));
    fact("Travel charge", zone.travel ? "£" + zone.travel + ", added to the first hour" : "None");
    fact("Booked work", "Monday to Saturday");
    box.appendChild(dl);
  }

  function areaCheckers() {
    document.querySelectorAll("[data-area-checker]").forEach(function (form) {
      var input = form.querySelector("input");
      var box = form.parentNode.querySelector("[data-area-result]");
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!input.value.trim()) {
          renderResult(box, { valid: false });
          input.focus();
          return;
        }
        var result = lookup(input.value);
        renderResult(box, result);
        // Light up the matching district in the list.
        document.querySelectorAll(".district.is-match").forEach(function (d) {
          d.classList.remove("is-match");
        });
        if (result.covered) {
          var chip = document.querySelector('.district[data-district="' + result.outward + '"]');
          if (chip) {
            chip.classList.add("is-match");
          }
        }
      });
    });
  }

  function zoneLists() {
    document.querySelectorAll("[data-zones]").forEach(function (box) {
      data.zones.forEach(function (zone) {
        var block = el("section", "zone zone-" + zone.id);
        var head = el("div", "zone-head");
        var title = el("h3", "zone-name", zone.name);
        var meta = el("p", "zone-meta");
        meta.appendChild(el("span", "", "Emergencies " + zone.arrival));
        meta.appendChild(el("span", "", zone.travel ? "£" + zone.travel + " travel" : "No travel charge"));
        head.append(title, meta);
        var ul = el("ul", "districts");
        Object.keys(zone.districts).forEach(function (code) {
          var li = el("li", "district");
          li.setAttribute("data-district", code);
          li.appendChild(el("b", "", code));
          li.appendChild(el("span", "", zone.districts[code]));
          ul.appendChild(li);
        });
        block.append(head, ul);
        box.appendChild(block);
      });
    });
  }

  /* ---------- Prices and rates ---------- */

  function prices() {
    // Any element with data-price="service" (a fixed job id) shows that price, so the prose keeps in step.
    document.querySelectorAll("[data-price]").forEach(function (node) {
      var id = node.getAttribute("data-price");
      var job = data.fixed.filter(function (f) {
        return f.id === id;
      })[0];
      if (job) {
        node.textContent = (job.from ? "from " : "") + T.money(job.price);
      }
    });
    document.querySelectorAll("[data-rate]").forEach(function (node) {
      var parts = node.getAttribute("data-rate").split(".");
      var band = data.rates.filter(function (r) {
        return r.id === parts[0];
      })[0];
      if (band && band[parts[1]] !== undefined) {
        node.textContent = T.money(band[parts[1]]);
      }
    });

    var now = T.londonNow();
    var current = T.rateAt(now);

    document.querySelectorAll("[data-rates]").forEach(function (list) {
      list.textContent = "";
      data.rates.forEach(function (band) {
        var li = el("li", "rate rate-" + band.id + (band.id === current.id ? " is-now" : ""));
        var head = el("div", "rate-head");
        head.appendChild(el("h3", "rate-name", band.name));
        if (band.id === current.id) {
          head.appendChild(el("span", "now-tag", "Now"));
        }
        li.appendChild(head);
        li.appendChild(el("p", "rate-when", band.when));
        var figs = el("p", "rate-figs");
        var first = el("span", "rate-first");
        first.append(el("strong", "", T.money(band.firstHour)), el("small", "", "first hour"));
        var half = el("span", "rate-half");
        half.append(el("strong", "", T.money(band.halfHour)), el("small", "", "each half hour after"));
        figs.append(first, half);
        li.appendChild(figs);
        list.appendChild(li);
      });
    });

    document.querySelectorAll("[data-rate-now]").forEach(function (node) {
      var day = T.bankHoliday(now) ? T.bankHoliday(now) : T.fmt.weekdayShort.format(now);
      node.textContent = "Now (" + day + " " + T.clock(now) + "): " + current.short + ", " +
        T.money(current.firstHour) + " for the first hour.";
    });

    // The worked example: the first hour plus one half hour at the night rate.
    var night = data.rates.filter(function (r) {
      return r.id === "night";
    })[0];
    document.querySelectorAll("[data-example-total]").forEach(function (node) {
      node.textContent = T.money(night.firstHour + night.halfHour);
    });

    document.querySelectorAll("[data-office-status]").forEach(function (node) {
      var open = T.officeOpen(now);
      node.classList.toggle("is-open", open);
      node.textContent = open ? "Office open now. We reply to messages within the hour." :
        "Office closed now. The emergency line is still answered; other messages get a reply when we open.";
    });

    document.querySelectorAll("[data-fixed-prices]").forEach(function (list) {
      list.textContent = "";
      data.fixed.forEach(function (job) {
        var li = el("li", "fixed-item");
        var text = el("div", "fixed-text");
        text.appendChild(el("h3", "fixed-name", job.name));
        text.appendChild(el("p", "fixed-note", job.note));
        var price = el("p", "fixed-price");
        if (job.from) {
          price.appendChild(el("small", "", "from"));
        }
        price.appendChild(el("strong", "", T.money(job.price)));
        li.append(text, price);
        list.appendChild(li);
      });
    });
  }

  /* ---------- Header and menu ---------- */

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
      button.querySelector("use").setAttribute("href", open ? "#i-close" : "#i-menu");
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
    }, { threshold: 0.06 });
    items.forEach(function (node) {
      observer.observe(node);
    });
  }

  /* ---------- Dialogs ---------- */

  function makeDialog(id, titleText) {
    var dialog = el("dialog", "dialog");
    dialog.setAttribute("aria-labelledby", id + "-title");
    var body = el("div", "dialog-body");
    var head = el("div", "dialog-head");
    var title = el("h2", "dialog-title", titleText);
    title.id = id + "-title";
    title.tabIndex = -1;
    var close = el("button", "dialog-close");
    close.type = "button";
    close.setAttribute("aria-label", "Close");
    close.appendChild(icon("i-close"));
    head.append(title, close);
    body.appendChild(head);
    dialog.appendChild(body);
    document.body.appendChild(dialog);
    close.addEventListener("click", function () {
      dialog.close();
    });
    // A click on the dimmed backdrop lands on the dialog element itself.
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) {
        dialog.close();
      }
    });
    return { dialog: dialog, body: body, title: title };
  }

  // On the sample site the WhatsApp, phone and email buttons explain what they would do, because the
  // numbers and the email address are made up. The gas emergency number is real and is never caught.
  var sampleBox = null;
  var sampleWords = {
    whatsapp: "On a real plumber's website, this button opens a WhatsApp chat with the firm, so you can send photos of the problem straight away.",
    phone: "On a real plumber's website, this button rings the firm's 24-hour line. The number shown here is a made-up one kept for TV and film.",
    email: "On a real plumber's website, this button opens a new email to the firm. The address shown here is a made-up one."
  };

  function explainSample(kind) {
    if (!sampleBox) {
      sampleBox = makeDialog("sample-dialog", "This is a sample website");
      sampleBox.text = el("p", "");
      var note = el("div", "sample-note");
      note.appendChild(el("p", "", data.name + " is made up. Agile Release built this site to show what a small business website can do."));
      var actions = el("div", "dialog-actions");
      var more = el("a", "btn btn-outline", "Get a site like this");
      more.href = "https://agilerelease.co.uk/#websites";
      var ok = el("button", "btn btn-dark", "OK");
      ok.type = "button";
      ok.addEventListener("click", function () {
        sampleBox.dialog.close();
      });
      actions.append(more, ok);
      sampleBox.body.append(sampleBox.text, note, actions);
    }
    sampleBox.text.textContent = sampleWords[kind] || sampleWords.whatsapp;
    sampleBox.dialog.showModal();
  }

  function sampleContacts() {
    if (!data.sample) {
      return;
    }
    document.addEventListener("click", function (event) {
      var link = event.target.closest("a[data-contact]");
      if (!link || typeof HTMLDialogElement !== "function") {
        return;
      }
      event.preventDefault();
      explainSample(link.getAttribute("data-contact"));
    });
  }

  /* ---------- The message window for forms ---------- */

  var msgBox = null;

  // Shows a pre-written message. On the real site the form opens WhatsApp with it; on the sample it is
  // shown here instead. opts: { title, subject, next: [title, text] }.
  function sendMessage(text, opts) {
    opts = opts || {};
    var waUrl = "https://wa.me/" + data.whatsapp + "?text=" + encodeURIComponent(text);
    var mailUrl = "mailto:" + data.email + "?subject=" + encodeURIComponent(opts.subject || "Enquiry") +
      "&body=" + encodeURIComponent(text);

    if (!data.sample) {
      var opened = window.open(waUrl, "_blank");
      if (opened) {
        opened.opener = null;
      } else {
        window.location.href = waUrl;
      }
      return;
    }

    if (!msgBox) {
      msgBox = makeDialog("message-dialog", "Your message is ready");
      var chat = el("div", "chat");
      var to = el("p", "chat-to");
      to.append(icon("i-chat", "icon-sm"), document.createTextNode(" To " + data.short + " on WhatsApp"));
      msgBox.bubble = el("p", "bubble");
      msgBox.bubble.setAttribute("data-message", "");
      chat.append(to, msgBox.bubble);
      msgBox.next = el("div", "next-step");
      msgBox.sample = el("div", "sample-note");
      msgBox.sampleText = el("p", "");
      msgBox.sample.append(el("p", "", ""), msgBox.sampleText);
      msgBox.sample.firstChild.appendChild(el("strong", "", "This is a sample website, so nothing was sent."));
      var actions = el("div", "dialog-actions");
      msgBox.copy = el("button", "btn btn-outline", "Copy the message");
      msgBox.copy.type = "button";
      msgBox.email = el("a", "btn btn-outline", "Email it instead");
      var done = el("button", "btn btn-dark", "Done");
      done.type = "button";
      actions.append(msgBox.copy, msgBox.email, done);
      msgBox.body.append(chat, msgBox.next, msgBox.sample, actions);

      done.addEventListener("click", function () {
        msgBox.dialog.close();
      });
      msgBox.copy.addEventListener("click", function () {
        var value = msgBox.bubble.textContent;
        function copied() {
          msgBox.copy.textContent = "Copied";
          window.setTimeout(function () {
            msgBox.copy.textContent = "Copy the message";
          }, 2000);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(value).then(copied, function () {
            selectBubble();
          });
        } else {
          selectBubble();
        }
      });
      msgBox.email.addEventListener("click", function (event) {
        event.preventDefault();
        msgBox.sampleText.textContent = "On the real website, \"Email it instead\" opens a new email to " + data.email +
          " with the same message, for anyone who would rather not use WhatsApp.";
      });
    }

    function selectBubble() {
      var range = document.createRange();
      range.selectNodeContents(msgBox.bubble);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }

    msgBox.title.textContent = opts.title || "Your message is ready";
    msgBox.bubble.textContent = text;
    msgBox.email.href = mailUrl;
    msgBox.next.textContent = "";
    msgBox.next.hidden = !opts.next;
    if (opts.next) {
      msgBox.next.appendChild(icon("i-camera"));
      var words = el("div");
      words.append(el("p", "next-title", opts.next[0]), el("p", "", opts.next[1]));
      msgBox.next.appendChild(words);
    }
    msgBox.sampleText.textContent = "On the real website, this button opens WhatsApp with the message above ready to send. " +
      data.short + " replies to confirm, usually within the hour while the office is open.";
    msgBox.dialog.showModal();
    msgBox.title.focus();
  }

  stickyHeader();
  mobileMenu();
  revealOnScroll();
  prices();
  zoneLists();
  areaCheckers();
  sampleContacts();

  window.PinnSite = {
    el: el,
    icon: icon,
    lookup: lookup,
    coverageLine: coverageLine,
    sendMessage: sendMessage,
    reducedMotion: reducedMotion
  };
})();
