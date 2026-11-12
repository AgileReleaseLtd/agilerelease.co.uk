/* Prices page: the price list, the packages and the cancellation policy, all from data.js. */
(function () {
  "use strict";
  var D = window.Spindle;
  var C = window.SpindleCore;

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

  var table = document.querySelector("[data-price-table]");
  if (table) {
    table.textContent = "";
    [["physio", "Physiotherapy"], ["massage", "Sports massage"]].forEach(function (group) {
      var head = el("tr", "group-row");
      var th = el("th", "", group[1]);
      th.colSpan = 3;
      th.scope = "colgroup";
      head.appendChild(th);
      table.appendChild(head);
      Object.keys(D.types).forEach(function (id) {
        var t = D.types[id];
        if (t.kind !== group[0]) {
          return;
        }
        var tr = el("tr");
        var name = el("th", "", t.kind === "massage" ? "Sports massage" : t.name);
        name.scope = "row";
        name.appendChild(el("small", "", t.blurb));
        tr.appendChild(name);
        tr.appendChild(el("td", "len", t.minutes + " min"));
        var price = el("td", "num", C.money(t.price));
        tr.appendChild(price);
        table.appendChild(tr);
      });
    });
  }

  var packages = document.querySelector("[data-packages]");
  if (packages) {
    packages.textContent = "";
    D.packages.forEach(function (pkg) {
      var t = D.types[pkg.type];
      var p = C.packagePrices(pkg);
      var card = el("article", "package");
      card.appendChild(el("h3", "", t.kind === "massage" ? pkg.count + " sports massages, " + t.minutes + " minutes" : pkg.count + " physio follow-ups"));
      card.appendChild(el("p", "package-price", C.money(pkg.price)));
      card.appendChild(el("p", "package-each", C.money(p.each) + " each, instead of " + C.money(p.single)));
      card.appendChild(el("p", "package-save", "You save " + C.money(p.saving)));
      packages.appendChild(card);
    });
  }

  var rules = document.querySelector("[data-package-rules]");
  if (rules) {
    var months = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"][D.packageValidMonths] || String(D.packageValidMonths);
    rules.textContent = "Packages are for one person and last " + months + (D.packageValidMonths === 1 ? " month" : " months") + " from the day you buy them. They cannot be used with an insurance claim. If you stop early, we refund the appointments you have not used, less the discount you have had so far.";
  }

  var policy = D.cancellation;
  var free = document.querySelector("[data-policy-free]");
  var late = document.querySelector("[data-policy-late]");
  var missed = document.querySelector("[data-policy-missed]");
  if (free) {
    free.textContent = policy.freeHours + " hours";
  }
  if (late) {
    late.textContent = policy.lateShare + "%";
  }
  if (missed) {
    missed.textContent = policy.missedShare + "%";
  }
})();
