/* Services from data.js: the circuit chart on the home page, the full list on the services page, and the
   EICR guide prices. Every price is worked out with the same rules as the quote form. */
(function () {
  var data = window.Earthpin;
  var P = window.EarthpinPrices;
  var UI = window.EarthpinUI;
  var el = UI.el;

  function no(i) {
    return (i < 9 ? "0" : "") + (i + 1);
  }

  function example(service) {
    var r = P.compute(service.id, service.example.answers);
    return { price: P.range(r.lo, r.hi), label: service.example.label };
  }

  /* ---------- Home: the circuit chart ---------- */

  function chart() {
    var list = document.querySelector("[data-services-list]");
    if (!list) {
      return;
    }
    list.textContent = "";
    data.services.forEach(function (s, i) {
      var ex = example(s);
      var li = el("li", "chart-row");
      var a = el("a", "chart-link");
      a.href = "services.html#" + s.id;

      var num = el("span", "chart-no");
      num.appendChild(el("b", "", no(i)));
      num.appendChild(UI.icon(s.icon, "chart-icon"));

      var main = el("span", "chart-main");
      main.appendChild(el("span", "chart-name", s.name));
      main.appendChild(el("span", "chart-desc", s.short));

      var price = el("span", "chart-price");
      price.appendChild(el("small", "", "Guide price"));
      price.appendChild(el("strong", "", ex.price));
      price.appendChild(el("small", "", ex.label));

      var go = el("span", "chart-go");
      go.appendChild(UI.icon("i-arrow"));

      a.append(num, main, price, go);
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  /* ---------- Services page ---------- */

  function detail() {
    var box = document.querySelector("[data-services-detail]");
    var index = document.querySelector("[data-services-index]");
    if (!box) {
      return;
    }
    box.textContent = "";
    if (index) {
      index.textContent = "";
    }

    data.services.forEach(function (s, i) {
      var ex = example(s);

      if (index) {
        var li = el("li");
        var link = el("a");
        link.href = "#" + s.id;
        link.appendChild(el("b", "", "C" + (i + 1)));
        link.appendChild(document.createTextNode(s.name));
        li.appendChild(link);
        index.appendChild(li);
      }

      var art = el("article", "svc");
      art.id = s.id;
      art.setAttribute("aria-labelledby", s.id + "-title");

      var head = el("header", "svc-head");
      var badge = el("span", "svc-badge");
      badge.appendChild(UI.icon(s.icon));
      var tape = el("p", "tape");
      tape.appendChild(el("span", "tape-no", "C" + (i + 1)));
      tape.appendChild(el("span", "", "Circuit " + (i + 1) + " of " + data.services.length));
      var h2 = el("h2", "", s.name);
      h2.id = s.id + "-title";
      head.append(badge, tape, h2, el("p", "svc-short", s.short));

      var cols = el("div", "svc-cols");
      var when = el("section");
      when.appendChild(el("h3", "", "When you need it"));
      var ul = el("ul", "ticks");
      s.when.forEach(function (t) {
        ul.appendChild(el("li", "", t));
      });
      when.appendChild(ul);
      var inv = el("section");
      inv.appendChild(el("h3", "", "What's involved"));
      var ol = el("ol", "numbered");
      s.involved.forEach(function (t) {
        ol.appendChild(el("li", "", t));
      });
      inv.appendChild(ol);
      cols.append(when, inv);

      var facts = el("dl", "svc-facts");
      [["Time on site", s.time], ["Paperwork", s.paperwork]].forEach(function (f) {
        var d = el("div");
        d.append(el("dt", "", f[0]), el("dd", "", f[1]));
        facts.appendChild(d);
      });
      var pd = el("div");
      var dd = el("dd");
      dd.append(el("strong", "", ex.price), el("small", "", ex.label + ". Guide only, with VAT."));
      pd.append(el("dt", "", "Guide price"), dd);
      facts.appendChild(pd);

      var actions = el("p", "svc-actions");
      var q = el("a", "btn btn-primary", "Work out my guide price");
      q.href = "quote.html?job=" + encodeURIComponent(s.id);
      q.appendChild(UI.icon("i-arrow"));
      actions.appendChild(q);
      if (s.id === "eicr") {
        var l = el("a", "btn btn-outline", "Landlord? Book several");
        l.href = "landlords.html#book";
        actions.appendChild(l);
      } else if (s.id === "faults") {
        var f = el("a", "btn btn-outline", "Checks to try first");
        f.href = "safety.html#tripping";
        actions.appendChild(f);
      }

      art.append(head, cols, facts, actions);
      box.appendChild(art);
    });

    // The page loads with a #fragment before the list exists, so scroll to it once it does.
    if (window.location.hash) {
      var target = document.getElementById(window.location.hash.slice(1));
      if (target) {
        target.scrollIntoView({ block: "start" });
      }
    }
  }

  /* ---------- EICR guide prices ---------- */

  var EICR_ROWS = [
    ["Studio or 1-bedroom flat", { ptype: "flat", beds: "1" }],
    ["2-bedroom flat", { ptype: "flat", beds: "2" }],
    ["3-bedroom house", { ptype: "house", beds: "3" }],
    ["4-bedroom house", { ptype: "house", beds: "4" }],
    ["Shop, office or café", { ptype: "business" }]
  ];

  function eicrPrices() {
    document.querySelectorAll("[data-eicr-prices]").forEach(function (box) {
      box.textContent = "";
      var isTable = box.tagName === "TBODY";
      EICR_ROWS.forEach(function (row) {
        var answers = { reason: "check", boards: "one" };
        Object.keys(row[1]).forEach(function (k) {
          answers[k] = row[1][k];
        });
        var r = P.compute("eicr", answers);
        if (isTable) {
          var tr = el("tr");
          var th = el("th", "", row[0]);
          th.scope = "row";
          tr.append(th, el("td", "", P.range(r.lo, r.hi)));
          box.appendChild(tr);
        } else {
          var d = el("div");
          d.append(el("dt", "", row[0]), el("dd", "", P.range(r.lo, r.hi)));
          box.appendChild(d);
        }
      });
    });
  }

  chart();
  detail();
  eicrPrices();
})();
