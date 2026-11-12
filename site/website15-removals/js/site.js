/* Every page: sticky header, mobile menu, scroll reveal, prices filled in from data.js, and the WhatsApp
   hand-off. On the sample site, WhatsApp, phone and email explain what they would do instead of opening. */
(function () {
  var D = window.HT;

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

  function pounds(n) {
    return "£" + (n % 1 ? n.toFixed(2) : String(n));
  }

  function rate(van, crew) {
    return D.vans[van].perHour + crew * D.moverPerHour;
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

    var use = button.querySelector("use");
    function set(open) {
      nav.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", String(open));
      if (use) {
        use.setAttribute("href", open ? "#i-close" : "#i-menu");
      }
    }

    button.addEventListener("click", function (event) {
      var open = !nav.classList.contains("is-open");
      set(open);
      // The links come before this button in the page, so Tab would skip past the open menu. Opened
      // from the keyboard (no pointer: detail is 0), go straight to the first link.
      if (open && event.detail === 0) {
        var first = nav.querySelector("a");
        if (first) {
          first.focus();
        }
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
    window.matchMedia("(min-width: 1021px)").addEventListener("change", function (event) {
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

  /* ---------- Prices from data.js ---------- */

  function fillPrices() {
    document.querySelectorAll("[data-rate]").forEach(function (node) {
      var parts = node.getAttribute("data-rate").split(",");
      node.textContent = pounds(rate(parts[0], +parts[1]));
    });
    var materials = {};
    D.materials.forEach(function (g) {
      g.items.forEach(function (m) {
        materials[m.id] = m;
      });
    });
    document.querySelectorAll("[data-material]").forEach(function (node) {
      var m = materials[node.getAttribute("data-material")];
      if (m) {
        node.textContent = pounds(m.price);
      }
    });
    var body = document.querySelector("[data-rates]");
    if (body) {
      body.textContent = "";
      D.priceTable.forEach(function (row) {
        var van = D.vans[row[0]];
        var tr = el("tr");
        var th = el("th");
        th.scope = "row";
        th.append(el("span", "rate-van", van.name), " ", el("span", "rate-crew", "+ " + row[1] + (row[1] === 1 ? " mover" : " movers")));
        tr.append(th, el("td", "rates-fits", van.fits), el("td", "num", pounds(rate(row[0], row[1]))));
        body.appendChild(tr);
      });
    }
    var rings = document.querySelector("[data-ring-list]");
    if (rings) {
      rings.textContent = "";
      var cls = { home: "ring-home", london: "ring-london", outer: "ring-outer", far: "ring-far" };
      D.rings.forEach(function (r, i) {
        var li = el("li", cls[r.id]);
        var text;
        if (r.travelFee === null) {
          text = "Anywhere in Great Britain. Priced by time and miles.";
        } else {
          var within = (i === 0 ? "Within about " : "Up to about ") + String(r.upTo).replace(".5", "½") + " miles" + (i === 0 ? " of " + D.base : "");
          text = within + ". " + (r.travelFee ? "£" + r.travelFee + " travel fee." : "No travel fee.");
        }
        li.append(el("strong", "", r.name), document.createTextNode(" "), el("span", "", text));
        rings.appendChild(li);
      });
    }
  }

  /* ---------- Dialogs ---------- */

  var dialog = null;
  var parts = {};

  function buildDialog() {
    dialog = el("dialog", "dialog");
    dialog.setAttribute("aria-labelledby", "site-dialog-title");
    var body = el("div", "dialog-body");
    var head = el("div", "dialog-head");
    parts.title = el("h2", "dialog-title");
    parts.title.id = "site-dialog-title";
    parts.title.tabIndex = -1;
    var close = el("button", "dialog-close");
    close.type = "button";
    close.setAttribute("aria-label", "Close");
    close.appendChild(icon("i-close"));
    head.append(parts.title, close);
    parts.text = el("p");
    parts.preview = el("pre", "message-preview");
    parts.preview.setAttribute("data-message", "");
    parts.preview.tabIndex = 0;
    parts.preview.setAttribute("aria-label", "Your message");
    var note = el("div", "sample-note");
    note.appendChild(el("p", "", D.name + " is made up. Agile Release built this site to show what a small business website can do."));
    parts.actions = el("div", "dialog-actions");
    parts.copy = el("button", "btn btn-outline", "Copy the text");
    parts.copy.type = "button";
    var more = el("a", "btn btn-outline", "Get a site like this");
    more.href = "https://agilerelease.co.uk/#websites";
    parts.more = more;
    var ok = el("button", "btn btn-dark", "OK");
    ok.type = "button";
    parts.actions.append(parts.copy, more, ok);
    body.append(head, parts.text, parts.preview, note, parts.actions);
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
    parts.copy.addEventListener("click", function () {
      var text = parts.preview.textContent;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          parts.copy.textContent = "Copied";
        }, function () {
          parts.copy.textContent = "Select and copy the text above";
        });
      }
    });
  }

  function showDialog(title, text, message) {
    if (!dialog) {
      buildDialog();
    }
    parts.title.textContent = title;
    parts.text.textContent = text;
    parts.preview.hidden = !message;
    parts.preview.textContent = message || "";
    parts.copy.hidden = !message || !(navigator.clipboard && navigator.clipboard.writeText);
    parts.copy.textContent = "Copy the text";
    parts.more.hidden = !!message;
    dialog.showModal();
    parts.title.focus();
  }

  // Opens WhatsApp with a ready-written message. On the sample site it shows the message instead.
  function sendWhatsApp(message, what) {
    if (D.sample && typeof HTMLDialogElement === "function") {
      showDialog("Your message is ready", "On the real website, this opens WhatsApp with your " + (what || "message") + " written out, ready to send to " + D.name + ":", message);
      return;
    }
    var url = "https://wa.me/" + D.whatsapp + "?text=" + encodeURIComponent(message);
    var opened = window.open(url, "_blank");
    if (opened) {
      opened.opener = null;
    } else {
      window.location.href = url;
    }
  }

  function emailLink(subject, message) {
    return "mailto:" + D.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(message);
  }

  function sampleContacts() {
    if (!D.sample) {
      return;
    }
    var words = {
      whatsapp: "On a real removals firm's website, this button opens a WhatsApp chat with the office, so you can send postcodes and photos in a few taps.",
      phone: "On a real removals firm's website, this button rings the office from a phone. The number shown here is a made-up one kept for TV and film.",
      email: "On a real removals firm's website, this button opens a new email to the office. The address shown here is a made-up one."
    };
    document.addEventListener("click", function (event) {
      var link = event.target.closest("a[data-contact]");
      if (!link || typeof HTMLDialogElement !== "function") {
        return;
      }
      event.preventDefault();
      showDialog("This is a sample site", words[link.getAttribute("data-contact")] || words.whatsapp, "");
    });
  }

  function params() {
    return new URLSearchParams(window.location.search);
  }

  stickyHeader();
  mobileMenu();
  revealOnScroll();
  fillPrices();
  sampleContacts();

  window.HTSite = {
    el: el,
    icon: icon,
    pounds: pounds,
    rate: rate,
    showDialog: showDialog,
    sendWhatsApp: sendWhatsApp,
    emailLink: emailLink,
    params: params
  };
})();
