/* The home page: the street drawing, the quick search, the newest homes and the rough guide teaser. */
(function () {
  var data = window.Transom;
  var T = window.TransomSite;

  // The street along the bottom of the hero.
  var street = document.querySelector("[data-street]");
  if (street && window.TransomArt) {
    street.appendChild(window.TransomArt.street());
  }

  // The office, next to the contact details.
  var officeArt = document.querySelector("[data-office-art]");
  if (officeArt && window.TransomArt) {
    officeArt.appendChild(window.TransomArt.officeScene());
  }

  // The newest homes still on the market, sales and lettings together.
  var latest = document.querySelector("[data-latest]");
  if (latest) {
    var items = data.properties.filter(function (p) {
      return p.status === "available";
    }).sort(function (a, b) {
      return a.listed - b.listed;
    }).slice(0, 3);
    latest.textContent = "";
    items.forEach(function (p) {
      latest.appendChild(T.card(p));
    });
  }

  // Quick search: builds the same address the search page reads.
  var quick = document.querySelector("[data-quick-search]");
  if (quick) {
    var MAX = {
      sale: [[0, "Any price"], [400000, "Up to £400,000"], [600000, "Up to £600,000"], [750000, "Up to £750,000"], [1000000, "Up to £1,000,000"], [1500000, "Up to £1,500,000"]],
      let: [[0, "Any rent"], [1500, "Up to £1,500 pcm"], [2000, "Up to £2,000 pcm"], [2500, "Up to £2,500 pcm"], [3000, "Up to £3,000 pcm"], [4000, "Up to £4,000 pcm"]]
    };
    var maxSel = quick.elements.max;
    var fillMax = function () {
      var mode = quick.elements.mode.value === "let" ? "let" : "sale";
      maxSel.textContent = "";
      MAX[mode].forEach(function (m) {
        var o = T.el("option", "", m[1]);
        o.value = String(m[0]);
        maxSel.appendChild(o);
      });
      quick.querySelector("[data-quick-submit]").textContent = mode === "let" ? "Search homes to rent" : "Search homes for sale";
    };
    fillMax();
    quick.addEventListener("change", function (event) {
      if (event.target.name === "mode") {
        fillMax();
      }
    });
    quick.addEventListener("submit", function (event) {
      event.preventDefault();
      var params = new URLSearchParams();
      params.set("mode", quick.elements.mode.value === "let" ? "let" : "sale");
      if (quick.elements.type.value) {
        params.set("type", quick.elements.type.value);
      }
      if (quick.elements.beds.value !== "0") {
        params.set("beds", quick.elements.beds.value);
      }
      if (maxSel.value !== "0") {
        params.set("max", maxSel.value);
      }
      window.location.href = "properties.html?" + params.toString();
    });
  }

  // The rough guide teaser.
  var teaser = document.querySelector("[data-guide-teaser]");
  if (teaser) {
    var out = teaser.querySelector("[data-guide-out]");
    var link = teaser.querySelector("[data-guide-link]");
    var show = function () {
      var mode = teaser.elements.gmode.value;
      var type = teaser.elements.gtype.value;
      var beds = parseInt(teaser.elements.gbeds.value, 10);
      var r = T.guideRange(mode, type, beds, "good");
      out.textContent = "";
      if (!r) {
        return;
      }
      out.appendChild(T.el("span", "teaser-range", T.money(r.low) + " to " + T.money(r.high)));
      out.appendChild(T.el("span", "teaser-unit", (mode === "let" ? "Monthly rent" : "Sale price") + " · a rough guide, not a valuation"));
      link.href = "valuation.html?mode=" + mode + "&type=" + type + "&beds=" + beds;
    };
    teaser.addEventListener("change", show);
    teaser.addEventListener("submit", function (event) {
      event.preventDefault();
      window.location.href = link.href;
    });
    show();
  }
})();
