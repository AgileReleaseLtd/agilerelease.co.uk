/* The landlords page: the three services and the one-off fees, drawn from data.js with VAT added, and a
   calculator that shows what each service would cost on a given rent. */
(function () {
  var data = window.Transom;
  var T = window.TransomSite;

  // The three service cards.
  var tiers = document.querySelector("[data-tiers]");
  if (tiers) {
    data.lettingTiers.forEach(function (t) {
      var li = T.el("li", "tier" + (t.featured ? " tier-featured" : ""));
      li.setAttribute("data-tier", t.id);
      if (t.featured) {
        li.appendChild(T.el("p", "tier-badge", "Most landlords choose this"));
      }
      li.appendChild(T.el("h3", "tier-name", t.name));
      li.appendChild(T.el("p", "tier-blurb", t.blurb));
      var fee = T.el("p", "tier-fee");
      fee.appendChild(T.el("strong", "", T.pctText(T.withVat(t.pct))));
      fee.appendChild(T.el("span", "", "including VAT (" + T.pctText(t.pct) + " + VAT)"));
      li.appendChild(fee);
      li.appendChild(T.el("p", "tier-charge", t.charge));
      var ul = T.el("ul", "ticks");
      t.includes.forEach(function (inc) {
        var item = T.el("li");
        item.appendChild(T.icon("check"));
        item.appendChild(document.createTextNode(inc));
        ul.appendChild(item);
      });
      li.appendChild(ul);
      var a = T.el("a", "btn " + (t.featured ? "btn-primary" : "btn-outline") + " btn-block", "Ask about " + t.name.toLowerCase());
      a.href = "valuation.html?mode=let";
      li.appendChild(a);
      tiers.appendChild(li);
    });
  }

  // One-off fees.
  var extras = document.querySelector("[data-extras]");
  if (extras) {
    data.landlordExtras.forEach(function (row) {
      var tr = T.el("tr");
      var th = T.el("th", "", row[0]);
      th.setAttribute("scope", "row");
      tr.appendChild(th);
      var td = T.el("td");
      if (row[1]) {
        td.textContent = (row[2] === "from" ? "From " : "") + T.money(row[1]);
      } else {
        td.textContent = row[2].charAt(0).toUpperCase() + row[2].slice(1);
      }
      tr.appendChild(td);
      extras.appendChild(tr);
    });
  }

  // The calculator.
  var calc = document.querySelector("[data-calc]");
  if (!calc) {
    return;
  }
  var input = calc.elements.rent;
  var error = document.getElementById("rent-error");
  var body = calc.querySelector("[data-calc-rows]");
  var caption = calc.querySelector("[data-calc-rent]");

  function render() {
    var raw = String(input.value).replace(/[£,\s]/g, "");
    var rent = Math.round(parseFloat(raw) || 0);
    var ok = /^\d+(\.\d+)?$/.test(raw) && rent >= 300 && rent <= 20000;
    error.hidden = ok || raw === "";
    if (ok || raw === "") {
      input.removeAttribute("aria-invalid");
    } else {
      input.setAttribute("aria-invalid", "true");
    }
    body.textContent = "";
    if (!ok) {
      caption.textContent = "Enter a rent to see the fees";
      return;
    }
    caption.textContent = "On a rent of " + T.money(rent) + " a month, including VAT";
    data.lettingTiers.forEach(function (t) {
      var rate = T.withVat(t.pct) / 100;
      var tr = T.el("tr");
      tr.setAttribute("data-row", t.id);
      var th = T.el("th", "", t.name);
      th.setAttribute("scope", "row");
      tr.appendChild(th);
      if (t.basis === "once") {
        tr.appendChild(T.el("td", "", "Nothing"));
        tr.appendChild(T.el("td", "", T.moneyPence(rent * 12 * rate) + ", once"));
      } else {
        tr.appendChild(T.el("td", "", T.moneyPence(rent * rate)));
        tr.appendChild(T.el("td", "", T.moneyPence(rent * 12 * rate)));
      }
      body.appendChild(tr);
    });
  }

  input.addEventListener("input", render);
  calc.addEventListener("submit", function (event) {
    event.preventDefault();
    render();
  });
  render();
})();
