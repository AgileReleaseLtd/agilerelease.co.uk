/* Every page: sticky header, mobile menu, scroll reveal, "open now", today's hours, and the WhatsApp and
   email hand-off. On the sample site (sample: true in data.js) nothing opens: a dialog explains what would
   happen and shows the message that would be sent. */
(function () {
  var data = window.Earthpin;
  var D = window.EarthpinDates;

  document.documentElement.classList.add("js");

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

  // An <svg class="icon"> using a symbol from the page's sprite.
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
    window.matchMedia("(min-width: 961px)").addEventListener("change", function (event) {
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

  /* ---------- Open now, and today's hours ---------- */

  function openStatus() {
    var box = document.querySelector("[data-status]");
    if (box) {
      var s = D.status();
      box.classList.toggle("is-open", s.open);
      box.querySelector("[data-status-text]").textContent = s.text;
      box.querySelector("[data-status-detail]").textContent = s.detail;
    }
    var today = String(new Date().getDay());
    document.querySelectorAll("[data-hours] [data-days]").forEach(function (row) {
      var on = row.getAttribute("data-days").split(" ").indexOf(today) !== -1;
      row.classList.toggle("is-today", on);
      if (on) {
        var dt = row.querySelector("dt");
        dt.appendChild(el("span", "visually-hidden", " (today)"));
      }
    });
  }

  /* ---------- Dialog: shared by the sample notices and the message preview ---------- */

  var dialog = null;

  function closeDialog() {
    if (dialog && dialog.open) {
      dialog.close();
    }
  }

  function getDialog() {
    if (dialog) {
      return dialog;
    }
    dialog = el("dialog", "dialog");
    dialog.setAttribute("aria-labelledby", "msg-dialog-title");
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) {
        closeDialog();
      }
    });
    document.body.appendChild(dialog);
    return dialog;
  }

  // Fills the dialog: a title, any nodes for the middle, then the sample note and the buttons.
  function showDialog(title, middle, noteLines) {
    var d = getDialog();
    d.textContent = "";
    var body = el("div", "dialog-body");
    var head = el("div", "dialog-head");
    var h = el("h2", "dialog-title", title);
    h.id = "msg-dialog-title";
    h.tabIndex = -1;
    var close = el("button", "dialog-close");
    close.type = "button";
    close.setAttribute("aria-label", "Close");
    close.appendChild(icon("i-close"));
    close.addEventListener("click", closeDialog);
    head.append(h, close);
    body.appendChild(head);
    middle.forEach(function (node) {
      body.appendChild(node);
    });
    var note = el("div", "sample-note");
    noteLines.forEach(function (line, i) {
      var p = el("p");
      if (i === 0) {
        p.appendChild(el("strong", "", line));
      } else {
        p.textContent = line;
      }
      note.appendChild(p);
    });
    body.appendChild(note);
    var actions = el("div", "dialog-actions");
    var more = el("a", "btn btn-outline", "Get a site like this");
    more.href = "https://agilerelease.co.uk/#websites";
    var ok = el("button", "btn btn-dark", "OK");
    ok.type = "button";
    ok.setAttribute("data-dialog-ok", "");
    ok.addEventListener("click", closeDialog);
    actions.append(more, ok);
    body.appendChild(actions);
    d.appendChild(body);
    if (!d.open) {
      d.showModal();
    }
    h.focus();
  }

  /* ---------- Sending a message ---------- */

  function whatsappUrl(text) {
    return "https://wa.me/" + data.whatsapp + "?text=" + encodeURIComponent(text);
  }

  function mailUrl(subject, text) {
    return "mailto:" + data.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
  }

  // Sends a ready-written message by WhatsApp (via = "whatsapp") or email (via = "email").
  // opts.photos: true adds the reminder to attach photos in WhatsApp.
  function send(via, text, opts) {
    opts = opts || {};
    if (data.sample && typeof HTMLDialogElement === "function") {
      var middle = [];
      if (via === "email") {
        var mail = el("div", "mail-preview");
        mail.appendChild(el("p", "", "To: " + data.email));
        mail.appendChild(el("p", "", "Subject: " + (opts.subject || "Enquiry")));
        var pre = el("pre", "", text);
        pre.setAttribute("data-message", "");
        pre.tabIndex = 0;
        mail.appendChild(pre);
        middle.push(mail);
      } else {
        var chat = el("div", "chat");
        var to = el("p", "chat-to");
        to.append(icon("i-chat", "icon-sm"), document.createTextNode("To " + data.name + " on WhatsApp"));
        var bubble = el("p", "bubble", text);
        bubble.setAttribute("data-message", "");
        bubble.tabIndex = 0;
        chat.append(to, bubble);
        middle.push(chat);
      }
      var lines = ["This is a sample website, so nothing was sent."];
      if (via === "email") {
        lines.push("On a real electrician's website, this button opens your email app with the message above ready to send.");
      } else {
        lines.push("On a real electrician's website, this button opens WhatsApp with the message above ready to send.");
        if (opts.photos) {
          lines.push("You would then attach your photos in the WhatsApp chat: this website can't take them.");
        }
      }
      showDialog(via === "email" ? "Your email" : "Your WhatsApp message", middle, lines);
      return;
    }
    var url = via === "email" ? mailUrl(opts.subject || "Enquiry", text) : whatsappUrl(text);
    if (via === "email") {
      window.location.href = url;
      return;
    }
    var opened = window.open(url, "_blank");
    if (opened) {
      opened.opener = null;
    } else {
      window.location.href = url;
    }
  }

  // On the sample site the WhatsApp, phone and email buttons explain what they would do.
  function sampleContacts() {
    if (!data.sample) {
      return;
    }
    var words = {
      whatsapp: "On a real electrician's website, this button opens a WhatsApp chat, so you can ask a question or send photos of the job in a few taps.",
      phone: "On a real electrician's website, this button rings the office from your phone. The number shown here is a made-up one kept for TV and film.",
      email: "On a real electrician's website, this button opens a new email. The address shown here is a made-up one."
    };
    document.addEventListener("click", function (event) {
      var link = event.target.closest("a[data-contact]");
      if (!link || typeof HTMLDialogElement !== "function") {
        return;
      }
      event.preventDefault();
      var p = el("p", "", words[link.getAttribute("data-contact")] || words.whatsapp);
      showDialog("This is a sample site", [p], ["Earthpin Electrical is made up.", "Agile Release built this site to show what a small business website can do."]);
    });
  }

  stickyHeader();
  mobileMenu();
  revealOnScroll();
  openStatus();
  sampleContacts();

  window.EarthpinUI = {
    el: el,
    icon: icon,
    send: send,
    closeDialog: closeDialog,
    reducedMotion: reducedMotion
  };
})();
