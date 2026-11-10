/* Every page: header and mobile menu, scroll reveal, "open now", the opening hours table, prices worked out
   from data.js, and the message window that bookings and voucher orders end in. On the sample site the
   WhatsApp, phone and email buttons explain what they would do instead. */
(function () {
  var data = window.Lunette;
  var H = window.LunetteHours;

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

  // An icon from the page's sprite: <svg class="icon"><use href="#i-close"/></svg>.
  function icon(id, className) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", className || "icon");
    svg.setAttribute("aria-hidden", "true");
    var use = document.createElementNS(ns, "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
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

  // "Open now until 7pm" and the like, wherever the page has [data-open-status].
  function openStatus() {
    var status = H.openStatus();
    document.querySelectorAll("[data-open-status]").forEach(function (node) {
      node.textContent = status.text;
      node.classList.toggle("is-open", status.open);
      node.classList.toggle("is-closed", !status.open);
    });
  }

  // The weekly hours from data.js, with today marked, wherever the page has [data-hours].
  function hoursTables() {
    var today = new Date().getDay();
    document.querySelectorAll("[data-hours]").forEach(function (dl) {
      dl.textContent = "";
      H.weekRows().forEach(function (row) {
        var div = el("div", row.dow === today ? "is-today" : "");
        var dt = el("dt", "", row.name);
        if (row.dow === today) {
          dt.appendChild(el("span", "today-tag", "Today"));
        }
        div.append(dt, el("dd", row.text === "Closed" ? "is-shut" : "", row.text));
        dl.appendChild(div);
      });
    });
    // The footer's short version: days in a row with the same hours share a line ("Tue to Wed").
    var shortNames = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun" };
    var groups = [];
    H.weekRows().forEach(function (row) {
      var last = groups[groups.length - 1];
      if (last && last.text === row.text) {
        last.to = row.name;
      } else {
        groups.push({ from: row.name, to: "", text: row.text });
      }
    });
    document.querySelectorAll("[data-hours-compact]").forEach(function (ul) {
      ul.textContent = "";
      groups.forEach(function (g) {
        var li = el("li");
        li.appendChild(el("span", "", g.to ? shortNames[g.from] + " to " + shortNames[g.to] : g.from));
        li.appendChild(document.createTextNode(" " + g.text));
        ul.appendChild(li);
      });
    });

    var specials = H.upcomingSpecials(60);
    document.querySelectorAll("[data-specials]").forEach(function (box) {
      if (!specials.length) {
        box.hidden = true;
        return;
      }
      var list = box.querySelector("ul");
      list.textContent = "";
      specials.forEach(function (row) {
        var h = row.info.hours;
        var text = h ? H.timeLabel(H.toMinutes(h[0])) + " to " + H.timeLabel(H.toMinutes(h[1])) : "Closed";
        list.appendChild(el("li", "", row.info.label + ", " + H.fmt.long.format(row.date) + ": " + text));
      });
      box.hidden = false;
    });
  }

  // "From £30" for each category, leaving out add-ons and removals, wherever the page has [data-cat-from].
  function categoryPrices() {
    document.querySelectorAll("[data-cat-from]").forEach(function (node) {
      var id = node.getAttribute("data-cat-from");
      var prices = data.treatments.filter(function (t) {
        return t.cat === id && t.voucher !== false;
      }).map(function (t) {
        return t.price;
      });
      if (prices.length) {
        node.textContent = "From " + H.money(Math.min.apply(null, prices));
      }
    });
    document.querySelectorAll("[data-cat-count]").forEach(function (node) {
      var id = node.getAttribute("data-cat-count");
      var n = data.treatments.filter(function (t) {
        return t.cat === id;
      }).length;
      node.textContent = n + " treatments";
    });
  }

  /* ---------- Dialogs ---------- */

  function makeDialog(titleText, id) {
    var dialog = el("dialog", "dialog");
    dialog.setAttribute("aria-labelledby", id);
    var body = el("div", "dialog-body");
    var head = el("div", "dialog-head");
    var title = el("h2", "dialog-title", titleText);
    title.id = id;
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

  var sampleWords = {
    whatsapp: "On the salon's real website, this button opens a WhatsApp chat with the salon, so people can ask a question or book in a few taps.",
    phone: "On the salon's real website, this button rings the salon from a phone. The number shown here is a made-up one kept for TV and film.",
    email: "On the salon's real website, this button opens a new email to the salon. The address shown here is a made-up one."
  };
  var sampleBox = null;

  function showSampleNote(kind) {
    if (!sampleBox) {
      sampleBox = makeDialog("This is a sample site", "sample-dialog-title");
      sampleBox.text = el("p", "dialog-text");
      var note = el("div", "sample-note");
      note.appendChild(el("p", "", data.name + " is made up. Agile Release built this site to show what a small business website can do."));
      var actions = el("div", "dialog-actions");
      var more = el("a", "btn btn-outline", "Get a site like this");
      more.href = "https://agilerelease.co.uk/#websites";
      var ok = el("button", "btn btn-primary", "OK");
      ok.type = "button";
      ok.addEventListener("click", function () {
        sampleBox.dialog.close();
      });
      actions.append(more, ok);
      sampleBox.body.append(sampleBox.text, note, actions);
    }
    sampleBox.text.textContent = sampleWords[kind] || sampleWords.whatsapp;
    sampleBox.dialog.showModal();
    sampleBox.title.focus();
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
      showSampleNote(link.getAttribute("data-contact"));
    });
  }

  // A booking or an order, written as a message. via: "whatsapp" or "email".
  var messageBox = null;

  function sendMessage(opts) {
    var via = opts.via === "email" ? "email" : "whatsapp";
    if (!data.sample) {
      if (via === "email") {
        window.location.href = "mailto:" + data.email + "?subject=" + encodeURIComponent(opts.subject || "") +
          "&body=" + encodeURIComponent(opts.text);
        return;
      }
      var url = "https://wa.me/" + data.whatsapp + "?text=" + encodeURIComponent(opts.text);
      var opened = window.open(url, "_blank");
      if (opened) {
        opened.opener = null;
      } else {
        window.location.href = url;
      }
      return;
    }

    if (!messageBox) {
      messageBox = makeDialog("", "message-dialog-title");
      messageBox.dialog.classList.add("dialog-wide");
      var chat = el("div", "chat");
      messageBox.to = el("p", "chat-to");
      messageBox.bubble = el("p", "bubble");
      messageBox.bubble.setAttribute("data-message", "");
      chat.append(messageBox.to, messageBox.bubble);
      var note = el("div", "sample-note");
      note.appendChild(el("p", "", "This is a sample website, so nothing was sent."));
      messageBox.noteText = el("p", "");
      note.appendChild(messageBox.noteText);
      var actions = el("div", "dialog-actions");
      var back = el("button", "btn btn-outline", "Change something");
      back.type = "button";
      back.setAttribute("data-message-back", "");
      var done = el("button", "btn btn-primary", "Done");
      done.type = "button";
      back.addEventListener("click", function () {
        messageBox.dialog.close();
      });
      done.addEventListener("click", function () {
        messageBox.dialog.close();
      });
      actions.append(back, done);
      messageBox.body.append(chat, note, actions);
    }
    messageBox.title.textContent = opts.title || "Your message";
    messageBox.to.textContent = "";
    messageBox.to.appendChild(icon(via === "email" ? "i-mail" : "i-chat", "icon icon-sm"));
    messageBox.to.appendChild(document.createTextNode(via === "email"
      ? "Email to " + data.email + (opts.subject ? ", subject: " + opts.subject : "")
      : "WhatsApp message to " + data.name));
    messageBox.bubble.textContent = opts.text;
    messageBox.bubble.classList.toggle("is-email", via === "email");
    messageBox.noteText.textContent = via === "email"
      ? "On the salon's real website, this button opens your email app with the message above ready to send. " + (opts.reply || "")
      : "On the salon's real website, this button opens WhatsApp with the message above ready to send. " + (opts.reply || "");
    messageBox.dialog.showModal();
    messageBox.title.focus();
  }

  window.LunetteSite = {
    el: el,
    icon: icon,
    sendMessage: sendMessage
  };

  stickyHeader();
  mobileMenu();
  revealOnScroll();
  openStatus();
  hoursTables();
  categoryPrices();
  sampleContacts();
})();
