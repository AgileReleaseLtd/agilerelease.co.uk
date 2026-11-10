/* Every page: sticky header, mobile menu, scroll reveal, the "open now" lines and the opening hours, the
   featured dishes and gift vouchers on the home page, and the message window that shows (on the sample site)
   or sends (on a real site) every booking and enquiry. */
(function () {
  var data = window.Jonjoli;
  var T = window.JonjoliTime;

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

  // 16.5 -> "£16.50", 12 -> "£12", 1400 -> "£1,400".
  function money(n) {
    var whole = Math.round(n * 100) % 100 === 0;
    return "£" + n.toLocaleString("en-GB", { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 });
  }

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

  function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
      document.body.classList.toggle("menu-open", open);
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

  /* ---------- Open now, and the opening hours ---------- */

  function openStatus() {
    var lines = document.querySelectorAll("[data-open-status]");
    if (!lines.length) {
      return;
    }
    function update() {
      var s = T.status();
      lines.forEach(function (line) {
        line.classList.toggle("is-open", s.open);
        line.classList.toggle("is-closed", !s.open);
        line.textContent = "";
        line.appendChild(el("span", "status-dot"));
        var words = el("span", "status-text");
        words.appendChild(el("strong", "", s.text));
        if (s.detail && !line.hasAttribute("data-short")) {
          words.appendChild(document.createTextNode(" "));
          words.appendChild(el("span", "status-detail", s.detail));
        }
        line.appendChild(words);
      });
    }
    update();
    window.setInterval(update, 60000);
  }

  function hoursTables() {
    document.querySelectorAll("[data-hours]").forEach(function (box) {
      var today = T.now().getDay();
      box.textContent = "";
      T.weekRows().forEach(function (row) {
        var div = el("div", "hours-row" + (row.dow === today ? " is-today" : "") + (row.periods.length ? "" : " is-shut"));
        var dt = el("dt", "", row.name);
        if (row.dow === today) {
          dt.appendChild(el("span", "today-tag", "Today"));
        }
        var dd = el("dd");
        if (!row.periods.length) {
          dd.textContent = "Closed";
        } else {
          row.periods.forEach(function (p) {
            dd.appendChild(el("span", "", T.periodText(p)));
          });
        }
        div.append(dt, dd);
        box.appendChild(div);
      });
    });
  }

  /* ---------- Home page: dishes to start with ---------- */

  function dietWords(diets) {
    return (diets || []).map(function (k) {
      return data.diets[k];
    });
  }

  function allergenWords(allergens) {
    return Object.keys(allergens || {}).map(function (k) {
      return data.allergens[k].toLowerCase() + (allergens[k] ? " (" + allergens[k] + ")" : "");
    });
  }

  function featured() {
    var list = document.querySelector("[data-featured]");
    if (!list) {
      return;
    }
    list.textContent = "";
    data.menu.forEach(function (section) {
      section.dishes.forEach(function (dish) {
        if (!dish.featured) {
          return;
        }
        var li = el("li", "feature");
        var head = el("div", "feature-head");
        head.appendChild(el("h3", "feature-name", dish.name));
        head.appendChild(el("span", "feature-dots"));
        var price = el("span", "feature-price", money(dish.price));
        if (dish.unit) {
          price.appendChild(el("small", "", " " + dish.unit));
        }
        head.appendChild(price);
        li.appendChild(head);
        li.appendChild(el("p", "feature-desc", dish.desc));
        var meta = el("p", "feature-meta");
        (dish.diets || []).forEach(function (k) {
          meta.appendChild(el("span", "diet diet-" + k, data.diets[k]));
        });
        var al = allergenWords(dish.allergens);
        meta.appendChild(el("span", "feature-allergens", al.length ? "Contains " + al.join(", ") : "None of the 14 allergens"));
        li.appendChild(meta);
        list.appendChild(li);
      });
    });
  }

  /* ---------- Feast menus (home, menu and private dining pages) ---------- */

  function feasts() {
    document.querySelectorAll("[data-feasts]").forEach(function (box) {
      var which = box.getAttribute("data-feasts");
      var list = data.feasts.filter(function (f) {
        return which === "all" || !f.groups;
      });
      box.textContent = "";
      list.forEach(function (f) {
        var card = el("article", "feast-card" + (f.vegan ? " is-vegan" : "") + (f.groups ? " is-group" : ""));
        card.setAttribute("aria-labelledby", "feast-" + f.id + "-" + which);
        var tag = f.groups ? "Groups of " + f.minGuests + " or more" : "For " + f.minGuests + " or more";
        if (f.vegan) {
          tag += " · Vegan";
        }
        card.appendChild(el("p", "feast-tag", tag));
        var name = el("h3", "feast-name", f.name);
        name.id = "feast-" + f.id + "-" + which;
        card.appendChild(name);
        var price = el("p", "feast-price");
        price.appendChild(el("strong", "", money(f.price)));
        price.appendChild(document.createTextNode(" a head"));
        card.appendChild(price);
        card.appendChild(el("p", "feast-blurb", f.blurb));
        var ol = el("ol", "feast-courses");
        f.courses.forEach(function (c) {
          var li = el("li");
          li.appendChild(el("span", "course-name", c[0]));
          li.appendChild(el("span", "course-dishes", c[1]));
          ol.appendChild(li);
        });
        card.appendChild(ol);
        card.appendChild(el("p", "feast-allergens", f.allergens));
        var onPrivate = document.body.classList.contains("page-private");
        var link = el("a", "btn btn-sm " + (f.groups || onPrivate ? "btn-ghost" : "btn-primary"));
        if (onPrivate || f.groups) {
          link.href = (onPrivate ? "" : "private-dining.html") + "?menu=" + f.id + "#enquire";
          link.textContent = "Ask about " + f.name.replace(/^The /, "the ");
        } else {
          link.href = "book.html?feast=" + f.id;
          link.textContent = "Book " + f.name.replace(/^The /, "the ");
        }
        card.appendChild(link);
        box.appendChild(card);
      });
    });
  }

  /* ---------- Numbers in the page text that come from data.js ---------- */

  function fills() {
    var b = data.booking;
    var pd = data.privateDining;
    var marani = pd.spaces.filter(function (s) {
      return s.id === "marani";
    })[0];
    var values = {
      "feast-from": money(Math.min.apply(null, data.feasts.filter(function (f) {
        return !f.groups;
      }).map(function (f) {
        return f.price;
      }))),
      "marani-from": marani ? money(Math.min.apply(null, Object.keys(marani.minSpend).map(function (k) {
        return marani.minSpend[k];
      }))) : "",
      "voucher-months": String(data.vouchers.validMonths),
      "postage": money(data.vouchers.postage),
      "service": data.serviceCharge + "%",
      "deposit-from": String(b.depositFrom),
      "max-guests": String(b.maxGuests),
      "deposit": money(b.depositPerHead),
      "refund-hours": String(b.depositRefundHours),
      "last-orders": data.lastOrdersMinutes + " minutes",
      "pairing": money(data.winePairing),
      "pd-min": String(pd.minGuests),
      "pd-deposit": money(pd.depositPerHead),
      "final-hours": String(pd.finalNumbersHours)
    };
    document.querySelectorAll("[data-fill]").forEach(function (node) {
      var v = values[node.getAttribute("data-fill")];
      if (v) {
        node.textContent = v;
      }
    });
  }

  /* ---------- The message window ---------- */

  var sendDialog = null;
  var parts = {};

  function buildSendDialog() {
    sendDialog = el("dialog", "dialog");
    sendDialog.id = "send-dialog";
    sendDialog.setAttribute("aria-labelledby", "send-title");
    var body = el("div", "dialog-body");
    var head = el("div", "dialog-head");
    parts.title = el("h2", "dialog-title", "Your message");
    parts.title.id = "send-title";
    parts.title.tabIndex = -1;
    var close = el("button", "dialog-close");
    close.type = "button";
    close.setAttribute("aria-label", "Close");
    close.appendChild(icon("i-close"));
    head.append(parts.title, close);

    var chat = el("div", "chat");
    parts.to = el("p", "chat-to");
    parts.bubble = el("p", "bubble");
    chat.append(parts.to, parts.bubble);

    parts.note = el("div", "sample-note");
    var actions = el("div", "dialog-actions");
    var more = el("a", "btn btn-ghost", "Get a site like this");
    more.href = "https://agilerelease.co.uk/#websites";
    var done = el("button", "btn btn-primary", "Done");
    done.type = "button";
    actions.append(more, done);

    body.append(head, chat, parts.note, actions);
    sendDialog.appendChild(body);
    document.body.appendChild(sendDialog);

    close.addEventListener("click", function () {
      sendDialog.close();
    });
    done.addEventListener("click", function () {
      sendDialog.close();
    });
    sendDialog.addEventListener("click", function (event) {
      if (event.target === sendDialog) {
        sendDialog.close();
      }
    });
  }

  // Send a ready-written message: opts { text, channel: "whatsapp" | "email", title, subject, email, confirmNote }.
  // On the sample site it shows the message and explains; on a real site it opens WhatsApp or email.
  function send(opts) {
    var email = opts.email || data.email;
    if (!data.sample) {
      var url = opts.channel === "email"
        ? "mailto:" + email + "?subject=" + encodeURIComponent(opts.subject || "") + "&body=" + encodeURIComponent(opts.text)
        : "https://wa.me/" + data.whatsapp + "?text=" + encodeURIComponent(opts.text);
      if (opts.channel === "email") {
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
    if (!sendDialog) {
      buildSendDialog();
    }
    var byEmail = opts.channel === "email";
    parts.title.textContent = opts.title || "Your message";
    parts.to.textContent = "";
    parts.to.appendChild(icon(byEmail ? "i-mail" : "i-chat", "icon-sm"));
    parts.to.appendChild(document.createTextNode(byEmail ? "Email to " + email + (opts.subject ? ", subject: " + opts.subject : "") : "To Jonjoli on WhatsApp"));
    parts.bubble.textContent = opts.text;
    parts.note.textContent = "";
    parts.note.appendChild(el("p", "", "This is a sample website, so nothing was sent."));
    parts.note.firstChild.className = "sample-note-title";
    parts.note.appendChild(el("p", "", byEmail
      ? "On the restaurant's real website, this button opens your email app with the message above ready to send."
      : "On the restaurant's real website, this button opens WhatsApp with the message above ready to send."));
    if (opts.confirmNote) {
      parts.note.appendChild(el("p", "", opts.confirmNote));
    }
    if (!sendDialog.open) {
      sendDialog.showModal();
    }
    parts.title.focus();
  }

  /* ---------- Sample contact buttons ---------- */

  // On the sample site the WhatsApp, phone and email buttons explain what they would do, because the
  // numbers and the email addresses are made up.
  function sampleContacts() {
    if (!data.sample) {
      return;
    }
    var words = {
      whatsapp: "On the restaurant's real website, this button opens a WhatsApp chat with Jonjoli, so people can ask a question or book in a few taps.",
      phone: "On the restaurant's real website, this button rings Jonjoli from a phone. The number shown here is a made-up one kept for TV and film.",
      email: "On the restaurant's real website, this button opens a new email to Jonjoli. The address shown here is a made-up one.",
      maps: ""
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
      text = el("p", "dialog-text");
      var note = el("div", "sample-note");
      note.appendChild(el("p", "", "Jonjoli is made up. Agile Release built this site to show what a restaurant website can do."));
      var actions = el("div", "dialog-actions");
      var more = el("a", "btn btn-ghost", "Get a site like this");
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

  /* ---------- Gift vouchers (home page) ---------- */

  function vouchers() {
    var form = document.querySelector("[data-voucher-form]");
    if (!form) {
      return;
    }
    var v = data.vouchers;
    var box = form.querySelector("[data-voucher-options]");
    var choices = v.amounts.map(function (n) {
      return { value: String(n), label: money(n), words: "A " + money(n) + " voucher" };
    });
    choices.push({ value: "supra", label: "Supra for two", sub: money(v.supraForTwo) + ", with a bottle of Saperavi", words: "The supra for two, with a bottle of Saperavi (" + money(v.supraForTwo) + ")" });
    box.textContent = "";
    choices.forEach(function (c, i) {
      var label = el("label", "voucher-option" + (c.sub ? " is-wide" : ""));
      var input = el("input");
      input.type = "radio";
      input.name = "voucher";
      input.value = c.value;
      input.checked = i === 1;
      var span = el("span", "");
      span.appendChild(el("strong", "", c.label));
      if (c.sub) {
        span.appendChild(el("small", "", c.sub));
      }
      label.append(input, span);
      box.appendChild(label);
    });

    // The voucher card next to the form shows what is being chosen.
    var cardAmount = document.querySelector("[data-vc-amount]");
    var cardFor = document.querySelector("[data-vc-for]");
    var cardMessage = document.querySelector("[data-vc-message]");
    function preview() {
      if (!cardAmount) {
        return;
      }
      var pick = form.elements.voucher.value;
      cardAmount.textContent = pick === "supra" ? "The supra for two" : money(+pick);
      cardAmount.classList.toggle("is-words", pick === "supra");
      cardFor.textContent = form.elements["for"].value.trim() || "someone hungry";
      cardMessage.textContent = form.elements.message.value.trim() || "Gaumarjos!";
    }
    form.addEventListener("input", preview);
    form.addEventListener("change", preview);
    preview();

    var nameError = form.querySelector('[data-error-for="for"]');
    form.elements["for"].addEventListener("input", function () {
      if (form.elements["for"].value.trim()) {
        nameError.hidden = true;
        form.elements["for"].removeAttribute("aria-invalid");
      }
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var who = form.elements["for"].value.trim();
      if (!who) {
        nameError.hidden = false;
        form.elements["for"].setAttribute("aria-invalid", "true");
        form.elements["for"].focus();
        return;
      }
      var pick = form.elements.voucher.value;
      var choice = choices.filter(function (c) {
        return c.value === pick;
      })[0];
      var post = form.elements.delivery.value === "post";
      var lines = [
        "Hi Jonjoli, I'd like to buy a gift voucher, please.",
        "",
        "Voucher: " + choice.words,
        "For: " + who,
        "Delivery: " + (post ? "A printed card in the post (+" + money(v.postage) + ")" : "By email, as a PDF")
      ];
      var msg = form.elements.message.value.trim();
      if (msg) {
        lines.push("Message on the card: " + msg);
      }
      lines.push("", "Please send me a payment link.");
      send({
        text: lines.join("\n"),
        channel: "whatsapp",
        title: "Your voucher request",
        confirmNote: "Jonjoli replies with a secure payment link, then sends the voucher. It is valid for " + v.validMonths + " months."
      });
    });
  }

  window.JonjoliUI = { el: el, money: money, icon: icon, send: send, reducedMotion: reducedMotion, dietWords: dietWords, allergenWords: allergenWords };

  stickyHeader();
  mobileMenu();
  revealOnScroll();
  fills();
  feasts();
  openStatus();
  hoursTables();
  featured();
  sampleContacts();
  vouchers();
})();
