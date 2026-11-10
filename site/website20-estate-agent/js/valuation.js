/* The valuation page: the request form, which becomes a WhatsApp message, and the instant rough guide,
   which works from the price ranges in data.js. The guide is only a starting point; the valuation is the
   visit. */
(function () {
  var data = window.Transom;
  var T = window.TransomSite;
  var form = document.querySelector("[data-valuation-form]");
  var guide = document.querySelector("[data-guide]");
  if (!form || !guide) {
    return;
  }

  var TYPES = { house: "house", flat: "flat", maisonette: "maisonette" };
  var MODES = { sale: "Sell", let: "Let", both: "Not sure yet: sell or let" };

  /* ---------- Start from the address (from the home page teaser) ---------- */

  var params = new URLSearchParams(window.location.search);
  if (TYPES[params.get("type")]) {
    form.elements.type.value = params.get("type");
  }
  var b = parseInt(params.get("beds"), 10);
  if (b >= 0 && b <= 5) {
    form.elements.beds.value = String(b);
  }
  if (MODES[params.get("mode")]) {
    form.elements.mode.value = params.get("mode");
  }

  /* ---------- Appointment days and times ---------- */

  var days = T.appointmentDays();
  var daySel = form.elements.day;
  days.forEach(function (d) {
    var o = T.el("option", "", d.label);
    o.value = d.iso;
    daySel.appendChild(o);
  });
  var timeBox = form.querySelector("[data-times]");
  function fillTimes() {
    var d = days.filter(function (x) {
      return x.iso === daySel.value;
    })[0];
    var kept = (form.querySelector('input[name="time"]:checked') || {}).value;
    timeBox.textContent = "";
    d.slots.forEach(function (s, i) {
      var lab = T.el("label", "choice");
      var input = T.el("input");
      input.type = "radio";
      input.name = "time";
      input.id = "vtime-" + s[0];
      input.value = s[0];
      input.checked = kept ? kept === s[0] : i === 0;
      lab.setAttribute("for", input.id);
      lab.appendChild(input);
      lab.appendChild(T.el("span", "", s[1]));
      timeBox.appendChild(lab);
    });
    if (!form.querySelector('input[name="time"]:checked')) {
      form.querySelector('input[name="time"]').checked = true;
    }
  }
  daySel.addEventListener("change", fillTimes);
  fillTimes();

  /* ---------- The rough guide ---------- */

  var out = guide.querySelector("[data-guide-ranges]");
  var cond = guide.querySelector("[data-condition]");
  var similar = guide.querySelector("[data-guide-similar]");
  var fallback = guide.querySelector("[data-guide-fallback]");
  var described = guide.querySelector("[data-guide-for]");
  // On phones the full guide sits below the form, so a short line inside the form shows the range too.
  var inline = form.querySelector("[data-guide-inline]");

  function bedsWord(beds) {
    return beds === 0 ? "studio" : beds + (beds >= 5 ? "+" : "") + " bedroom";
  }

  function renderGuide() {
    var type = form.elements.type.value;
    var beds = parseInt(form.elements.beds.value, 10);
    var mode = form.elements.mode.value;
    var condition = cond.elements.condition.value;
    var modes = mode === "both" ? ["sale", "let"] : [mode];
    described.textContent = (beds === 0 ? "Studio " + type : bedsWord(beds) + " " + type) + " in Bow, Old Ford or Mile End";
    out.textContent = "";
    if (inline) {
      inline.textContent = "";
      inline.appendChild(T.el("span", "", "Rough guide"));
    }
    var notExact = false;
    modes.forEach(function (m) {
      var r = T.guideRange(m, type, beds, condition);
      if (!r) {
        return;
      }
      if (inline) {
        inline.appendChild(T.el("strong", "", T.money(r.low) + " to " + T.money(r.high) + (m === "let" ? " a month" : "")));
      }
      notExact = notExact || !r.exact;
      var row = T.el("div", "range");
      row.appendChild(T.el("p", "range-label", m === "let" ? "To let" : "To sell"));
      row.appendChild(T.el("p", "range-value", T.money(r.low) + " to " + T.money(r.high)));
      row.appendChild(T.el("p", "range-unit", m === "let" ? "rent a month" : "sale price"));
      out.appendChild(row);
    });
    fallback.hidden = !notExact;
    if (inline) {
      var more = T.el("a", "", "Not a valuation: see why");
      more.href = "#guide-title";
      inline.appendChild(more);
    }

    // Homes like it on our books now, linking to the search.
    var m0 = modes[0];
    var count = data.properties.filter(function (p) {
      return p.mode === m0 && p.type === type && p.beds === beds;
    }).length;
    similar.textContent = "";
    var a = T.el("a", "", count ? "See " + count + " similar " + (count === 1 ? "home" : "homes") + " on our books" : "See what is on our books now");
    a.href = "properties.html?mode=" + m0 + "&type=" + type + (beds ? "&beds=" + beds : "");
    similar.appendChild(a);
  }

  form.addEventListener("change", renderGuide);
  cond.addEventListener("change", renderGuide);
  cond.addEventListener("submit", function (event) {
    event.preventDefault();
  });
  renderGuide();

  /* ---------- Sending the request ---------- */

  var required = [
    [form.elements.address, document.getElementById("address-error")],
    [form.elements.name, document.getElementById("vname-error")]
  ];
  required.forEach(function (pair) {
    pair[0].addEventListener("input", function () {
      if (pair[0].value.trim()) {
        pair[1].hidden = true;
        pair[0].removeAttribute("aria-invalid");
      }
    });
  });

  function label(select) {
    return select.options[select.selectedIndex].text;
  }

  function message() {
    var beds = parseInt(form.elements.beds.value, 10);
    var type = form.elements.type.value;
    var d = days.filter(function (x) {
      return x.iso === daySel.value;
    })[0];
    var t = form.querySelector('input[name="time"]:checked');
    var address = form.elements.address.value.trim();
    var postcode = form.elements.postcode.value.trim().toUpperCase();
    var lines = [
      "Hi Transom & Co, I'd like a valuation.",
      "",
      "Address: " + address + (postcode ? ", " + postcode : ""),
      "Property: " + (beds === 0 ? "Studio " + type : bedsWord(beds) + " " + type),
      "Looking to: " + MODES[form.elements.mode.value],
      "Timescale: " + label(form.elements.timescale),
      "Appointment: " + T.fmt.long.format(d.date) + ", " + t.nextSibling.textContent.replace(/^(\w)/, function (c) { return c.toLowerCase(); }),
      "Name: " + form.elements.name.value.trim()
    ];
    var note = form.elements.note.value.trim();
    if (note) {
      lines.push("Note: " + note);
    }
    return lines.join("\n");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var firstBad = null;
    required.forEach(function (pair) {
      var bad = !pair[0].value.trim();
      pair[1].hidden = !bad;
      if (bad) {
        pair[0].setAttribute("aria-invalid", "true");
        firstBad = firstBad || pair[0];
      } else {
        pair[0].removeAttribute("aria-invalid");
      }
    });
    if (firstBad) {
      firstBad.focus();
      return;
    }
    T.send(message(), form.querySelector('button[type="submit"]'));
  });
})();
