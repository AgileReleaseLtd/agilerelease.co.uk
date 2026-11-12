/* Areas page: the home patch list, travel fees and the longer-run examples, all from data.js and the
   estimate engine (the checker and dot map are in checker.js). */
(function () {
  var D = window.HT;
  var E = window.HTEstimate;
  var S = window.HTSite;
  var P = window.HTPostcodes;

  // Districts in the home patch. A split central district (EC1A, EC1M ...) is shown once as EC1 when all
  // of it is in the patch; when only some parts are (SW1A and SW1Y, but not the rest of SW1), those parts
  // are listed instead, so the list agrees with the checker.
  var patch = document.querySelector('[data-patch="home"]');
  if (patch) {
    var groups = {};
    Object.keys(P.districts).forEach(function (code) {
      var d = P.districts[code];
      var key = code.replace(/^([A-Z]+\d+)[A-Z]$/, "$1");
      var g = groups[key] || (groups[key] = { home: [], all: 0 });
      g.all += 1;
      if (E.ringFor({ e: d[0], n: d[1] }).ring.id === "home") {
        g.home.push(code);
      }
    });
    var codes = [];
    Object.keys(groups).forEach(function (key) {
      var g = groups[key];
      if (g.home.length && g.home.length === g.all) {
        codes.push(key);
      } else {
        codes = codes.concat(g.home);
      }
    });
    codes.sort(function (a, b) {
      var ma = /^([A-Z]+)(\d+)/.exec(a);
      var mb = /^([A-Z]+)(\d+)/.exec(b);
      return ma[1] === mb[1] ? +ma[2] - +mb[2] : ma[1] < mb[1] ? -1 : 1;
    });
    patch.textContent = "";
    codes.forEach(function (c) {
      patch.appendChild(S.el("li", "", c));
    });
  }

  document.querySelectorAll("[data-ring-fee]").forEach(function (node) {
    var ring = D.rings.filter(function (r) {
      return r.id === node.getAttribute("data-ring-fee");
    })[0];
    if (ring) {
      node.textContent = ring.travelFee ? "£" + ring.travelFee : "free";
    }
  });
  var LD = D.longDistance;
  var fill = {
    "[data-congestion]": "£" + D.congestion.charge,
    "[data-fuel]": Math.round(LD.fuelPerMile * 100) + "p",
    "[data-over]": String(LD.overMiles),
    "[data-overnight]": String(LD.overnightOverMiles),
    "[data-overnight-fee]": "£" + LD.overnightPerMover
  };
  Object.keys(fill).forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (node) {
      node.textContent = fill[sel];
    });
  });

  // Example longer runs, priced by the same engine as the quote page.
  var runs = document.querySelector("[data-runs]");
  if (runs) {
    var easy = { floor: 0, lift: false, parking: "easy" };
    var places = [["BN1", "Brighton"], ["OX1", "Oxford"], ["CB1", "Cambridge"], ["BS1", "Bristol"], ["B1", "Birmingham"], ["M1", "Manchester"]];
    runs.textContent = "";
    places.forEach(function (p) {
      function est(size) {
        return E.estimate({ mode: "rooms", size: size, fullness: "average", from: D.base, to: p[0], pickup: easy, dropoff: easy, day: "2", packing: "none" });
      }
      var one = est("bed1");
      var three = est("bed3");
      if (!one.ok || !three.ok) {
        return;
      }
      var tr = S.el("tr");
      var th = S.el("th", "", p[1]);
      th.scope = "row";
      th.appendChild(S.el("small", "", " " + p[0]));
      var cells = [
        ["By road", "about " + Math.round(one.route.miles / 5) * 5 + " miles"],
        ["1-bedroom flat", E.money(one.low) + " to " + E.money(one.high)],
        ["3-bedroom house", E.money(three.low) + " to " + E.money(three.high)]
      ];
      tr.appendChild(th);
      cells.forEach(function (c) {
        var td = S.el("td", "num", c[1]);
        td.setAttribute("data-label", c[0]);
        tr.appendChild(td);
      });
      runs.appendChild(tr);
    });
  }
})();
