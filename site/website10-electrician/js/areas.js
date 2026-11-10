/* Areas we cover: reads a postcode, finds its district (the first half, like N12) and checks it against
   the list in data.js. Draws the small district map on the home page. The quote and landlord forms use
   the same lookup to say whether we cover an address. */
(function () {
  var data = window.Earthpin;
  var UI = window.EarthpinUI;
  var el = UI.el;

  var FULL = /^([A-Z]{1,2}[0-9][0-9A-Z]?)([0-9][A-Z]{2})$/;
  var DISTRICT = /^[A-Z]{1,2}[0-9][0-9A-Z]?$/;

  // "n12 8qj" -> { district: "N12", full: "N12 8QJ" }; "EN5" -> { district: "EN5", full: "" }; else null.
  function parse(input) {
    var s = String(input || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    var m = FULL.exec(s);
    if (m) {
      return { district: m[1], full: m[1] + " " + m[2] };
    }
    if (DISTRICT.test(s)) {
      return { district: s, full: "" };
    }
    return null;
  }

  // { ok: false, reason: "empty" | "format" } or { ok: true, district, full, name, status: "yes" | "big" | "no" }.
  function lookup(input) {
    if (!String(input || "").trim()) {
      return { ok: false, reason: "empty" };
    }
    var p = parse(input);
    if (!p) {
      return { ok: false, reason: "format" };
    }
    var area = data.areas[p.district];
    return {
      ok: true,
      district: p.district,
      full: p.full,
      name: area ? area.name : "",
      status: area ? area.status : "no"
    };
  }

  // A short line for forms: "We cover N12 (North Finchley)."
  function shortNote(r) {
    if (!r.ok) {
      return r.reason === "format" ? "That doesn't look like a postcode yet." : "";
    }
    if (r.status === "yes") {
      return "We cover " + r.district + " (" + r.name + ").";
    }
    if (r.status === "big") {
      return r.district + " (" + r.name + "): bigger jobs only.";
    }
    return r.district + " is outside our area. Send it anyway and we'll tell you if we can help.";
  }

  /* ---------- Home page: map and checker ---------- */

  function tilemap() {
    var map = document.querySelector("[data-tilemap]");
    if (!map) {
      return;
    }
    Object.keys(data.areas).forEach(function (code) {
      var a = data.areas[code];
      var li = el("li", "tile is-" + a.status + " c" + a.col + " r" + a.row + (a.home ? " is-home" : ""));
      li.setAttribute("data-district", code);
      li.appendChild(el("b", "", code));
      li.appendChild(el("small", "", a.name));
      li.appendChild(el("span", "visually-hidden", ": " + (a.status === "yes" ? "every job" : "bigger jobs only") + (a.home ? ", our base" : "")));
      map.appendChild(li);
    });
  }

  function checker() {
    var form = document.querySelector("[data-checker]");
    if (!form) {
      return;
    }
    var input = form.elements.postcode;
    var out = form.querySelector("[data-result]");

    function line(parts) {
      var p = el("p");
      parts.forEach(function (part) {
        if (typeof part === "string") {
          p.appendChild(document.createTextNode(part));
        } else {
          p.appendChild(part);
        }
      });
      return p;
    }

    function link(text, href) {
      var a = el("a", "", text);
      a.href = href;
      return a;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var r = lookup(input.value);
      out.textContent = "";
      out.className = "result";
      document.querySelectorAll(".tile.is-hit").forEach(function (t) {
        t.classList.remove("is-hit");
      });

      if (!r.ok) {
        out.classList.add("is-error");
        out.appendChild(line([r.reason === "empty" ? "Type your postcode first, like N12 8QJ." : "That doesn't look like a postcode. Try the first half, like N12 or EN5."]));
        input.setAttribute("aria-invalid", "true");
        input.focus();
        return;
      }
      input.removeAttribute("aria-invalid");
      var label = r.full || r.district;
      if (r.status === "yes") {
        out.classList.add("is-yes");
        out.appendChild(line([el("strong", "", "Yes, we cover " + label + ".")]));
        out.appendChild(line([r.district + " is " + r.name + ", and we do every kind of job there. ", link("Get a guide price", "quote.html?postcode=" + encodeURIComponent(label))]));
      } else if (r.status === "big") {
        out.classList.add("is-big");
        out.appendChild(line([el("strong", "", "Bigger jobs only in " + label + ".")]));
        out.appendChild(line([r.district + " (" + r.name + ") is just outside our usual patch. We come for rewires, fuse box upgrades, EV chargers and landlord EICRs. For a smaller job, message us anyway: we may be nearby that week."]));
      } else {
        out.classList.add("is-no");
        out.appendChild(line([el("strong", "", "Sorry, " + label + " is outside our area.")]));
        out.appendChild(line(["We work around Finchley and Barnet in north London. To find a registered electrician near you, search the ", link("Electrical Competent Person register", "https://www.electricalcompetentperson.co.uk/"), "."]));
      }
      var tile = document.querySelector('.tile[data-district="' + r.district + '"]');
      if (tile) {
        tile.classList.add("is-hit");
      }
    });

    input.addEventListener("input", function () {
      input.removeAttribute("aria-invalid");
    });
  }

  tilemap();
  checker();

  window.EarthpinAreas = {
    parse: parse,
    lookup: lookup,
    shortNote: shortNote
  };
})();
