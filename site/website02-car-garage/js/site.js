/* Every page: sticky header, mobile menu, the open-now line and opening hours, prices and areas filled
   in from data.js, the home page's plate box and postcode checker, and (on the sample site) a short
   explanation in place of WhatsApp, phone and email. */
(function () {
  var data = window.Gantry;
  var K = window.GantryKit;

  document.documentElement.classList.add("js");

  stickyHeader();
  mobileMenu();
  fillFromData();
  openStatus();
  hoursBoard();
  districtList();
  plateJump();
  collectChecker();
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
    window.matchMedia("(min-width: 1081px)").addEventListener("change", function (event) {
      if (event.matches) {
        set(false);
      }
    });
  }

  // Prices, areas and the address appear in the page text; these keep them in step with data.js.
  function fillFromData() {
    var values = {
      "mot-price": K.money(data.mot.price),
      "mot-max": K.money(data.mot.legalMax),
      "mot-with-service": K.money(data.mot.withService),
      "partial-retest": K.money(data.mot.partialRetest),
      "service-from": K.money(K.cheapestService()),
      "free-districts": K.listWords(K.freeDistricts()),
      "collect-fee": K.money(K.collectFee()),
      "labour-rate": K.money(data.labourRate),
      pickup: data.collect.pickup,
      station: data.collect.station,
      address: data.address.join(", "),
      phone: data.phone,
      mobile: data.mobile,
      email: data.email
    };
    document.querySelectorAll("[data-fill]").forEach(function (node) {
      var v = values[node.getAttribute("data-fill")];
      if (v !== undefined) {
        node.textContent = v;
      }
    });
  }

  // "Open now · until 6pm" or "Closed now · opens tomorrow at 8am", from London time.
  function openStatus() {
    var lines = document.querySelectorAll("[data-open-status]");
    if (!lines.length) {
      return;
    }
    function render() {
      var s = K.openStatus();
      lines.forEach(function (line) {
        line.classList.toggle("is-open", s.open);
        line.classList.toggle("is-closed", !s.open);
        line.textContent = "";
        var dot = K.el("span", "status-dot");
        dot.setAttribute("aria-hidden", "true");
        var text = K.el("span", "status-text");
        text.appendChild(K.el("strong", "", s.title));
        if (s.detail) {
          text.appendChild(document.createTextNode(", " + s.detail));
        }
        line.append(dot, text);
      });
    }
    render();
    window.setInterval(render, 60000);
  }

  // The weekly hours from data.js, today marked, and any closures coming up in the next six weeks.
  function hoursBoard() {
    var box = document.querySelector("[data-hours]");
    if (box) {
      var names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      var todayDow = K.londonToday().getDay();
      box.textContent = "";
      [1, 2, 3, 4, 5, 6, 0].forEach(function (dow, i) {
        var h = data.hours[dow];
        var row = K.el("div", dow === todayDow ? "is-today" : "");
        row.appendChild(K.el("dt", "", names[i]));
        row.appendChild(K.el("dd", "", h ? K.clock(h[0]) + " to " + K.clock(h[1]) : "Closed"));
        box.appendChild(row);
      });
    }

    // Closures and short days in the next eight weeks, so Christmas hours show from early November.
    // "Monday to Friday 8am to 6pm", "Saturday 8am to 1pm": runs of days with the same hours.
    var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var runs = [];
    [1, 2, 3, 4, 5, 6, 0].forEach(function (dow) {
      var h = data.hours[dow];
      var text = h ? K.clock(h[0]) + " to " + K.clock(h[1]) : "";
      var last = runs[runs.length - 1];
      if (last && last.text === text) {
        last.to = dow;
      } else {
        runs.push({ from: dow, to: dow, text: text });
      }
    });
    document.querySelectorAll("[data-hours-summary]").forEach(function (node) {
      node.textContent = "";
      runs.filter(function (r) {
        return r.text;
      }).forEach(function (r, i) {
        if (i) {
          node.appendChild(document.createElement("br"));
        }
        node.appendChild(document.createTextNode(dayNames[r.from] + (r.to !== r.from ? " to " + dayNames[r.to] : "") + " " + r.text));
      });
    });

    var note = document.querySelector("[data-closures]");
    if (note) {
      var changes = K.upcomingChanges(56);
      if (!changes.length) {
        return;
      }
      note.textContent = "";
      note.appendChild(K.el("p", "", "Closed on bank holidays. Coming up:"));
      var list = K.el("ul", "closures");
      changes.forEach(function (c) {
        var li = K.el("li");
        li.appendChild(K.el("span", "", K.fmt.short.format(c.date)));
        li.appendChild(K.el("span", "", c.text.charAt(0).toUpperCase() + c.text.slice(1)));
        list.appendChild(li);
      });
      note.appendChild(list);
    }
  }

  function districtList() {
    var list = document.querySelector("[data-district-list]");
    if (!list) {
      return;
    }
    var d = data.collect.districts;
    list.textContent = "";
    Object.keys(d).forEach(function (code) {
      var li = K.el("li", d[code][1] ? "" : "is-free");
      li.appendChild(K.el("b", "", code));
      li.appendChild(document.createTextNode(d[code][0]));
      li.appendChild(K.el("span", "fee", d[code][1] ? K.money(d[code][1]) : "Free"));
      list.appendChild(li);
    });
  }

  // Home page: type a registration, go to the quote form with it filled in.
  function plateJump() {
    var form = document.querySelector("[data-plate-jump]");
    if (!form) {
      return;
    }
    var input = form.querySelector(".plate-input");
    var check = K.wirePlate(input, form.querySelector("[data-plate-status]"));
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (check(false)) {
        window.location.href = "quote.html?reg=" + encodeURIComponent(input.value);
      } else {
        input.focus();
      }
    });
  }

  // Home page: is this postcode in the area we collect from?
  function collectChecker() {
    var form = document.querySelector("[data-collect-check]");
    if (!form) {
      return;
    }
    var input = form.elements.postcode;
    var out = form.querySelector("[data-collect-result]");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var r = K.checkPostcode(input.value);
      out.textContent = "";
      if (!r.ok) {
        input.setAttribute("aria-invalid", "true");
        out.appendChild(K.el("p", "result result-error", r.error));
        input.focus();
        return;
      }
      input.removeAttribute("aria-invalid");
      input.value = r.full || r.district;
      var box = K.el("div", "result " + (r.covered ? "result-ok" : "result-no"));
      if (r.covered) {
        box.appendChild(K.el("p", "", "Yes, we cover " + r.district + " (" + r.area + "). " + K.feeWords(r.fee) + "."));
        var link = K.el("a", "btn btn-dark btn-sm", "Book an MOT with collection");
        link.href = "mot.html?collect=" + encodeURIComponent(r.full || r.district);
        link.appendChild(K.icon("i-arrow"));
        box.appendChild(link);
      } else {
        box.appendChild(K.el("p", "", "Sorry, we don't collect from " + r.district + " yet. You can still drop the car off: " +
          data.collect.station.charAt(0).toLowerCase() + data.collect.station.slice(1)));
      }
      out.appendChild(box);
    });
  }

  // On the sample site the WhatsApp, phone and email buttons explain what they would do, because the
  // numbers and the email address are made up.
  function sampleContacts() {
    if (!data.sample) {
      return;
    }
    var words = {
      whatsapp: "On a real garage's website, this button opens a WhatsApp chat with the garage, so people can ask a question or book in a few taps.",
      phone: "On a real garage's website, this button rings the garage from a phone. The number shown here is a made-up one kept for TV and film.",
      email: "On a real garage's website, this button opens a new email to the garage. The address shown here is a made-up one."
    };
    document.addEventListener("click", function (event) {
      var link = event.target.closest("a[data-contact]");
      if (!link || typeof HTMLDialogElement !== "function") {
        return;
      }
      event.preventDefault();
      K.sampleNotice(words[link.getAttribute("data-contact")] || words.whatsapp);
    });
  }
})();
