/* The prices page: every table is drawn from data.js, so the tables and the calculator always agree.
   The calculator shows an estimate only; the firm confirms a fixed fee in writing. */
(function () {
  var data = window.QM;
  var U = window.QMUtil;
  var F = window.QMFees;
  var el = U.el;
  var C = data.conveyancing;
  var vatRate = data.vatRate;

  if (!document.querySelector("[data-calc]")) {
    return;
  }

  // Whole pounds where the amount is whole ("£1,195"), pence where it is not ("£14.40").
  function money(n) {
    return F.money(n);
  }

  // The calculator always shows pence, so its columns line up.
  function exact(n) {
    return F.money(n, true);
  }

  function vatOf(n) {
    return F.pence(n * vatRate);
  }

  // A table with a header row. rows: arrays of cells; a cell is a string or { text, cls, small, th }.
  function table(head, rows, caption, extraClass) {
    var t = el("table", "price-table" + (extraClass ? " " + extraClass : ""));
    if (caption) {
      var cap = el("caption", "visually-hidden", caption);
      t.appendChild(cap);
    }
    var thead = el("thead");
    var tr = el("tr");
    head.forEach(function (h, i) {
      var th = el("th", i > 0 ? "num" : "", h);
      th.scope = "col";
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    t.appendChild(thead);
    var tbody = el("tbody");
    rows.forEach(function (r) {
      var row = el("tr");
      r.forEach(function (cell, i) {
        var c = typeof cell === "string" ? { text: cell } : cell;
        var node = el(i === 0 ? "th" : "td", (i > 0 ? "num " : "") + (c.cls || ""), c.text);
        if (i === 0) {
          node.scope = "row";
        }
        if (c.span) {
          node.colSpan = c.span;
        }
        if (c.small) {
          node.appendChild(el("small", "", c.small));
        }
        row.appendChild(node);
      });
      tbody.appendChild(row);
    });
    t.appendChild(tbody);
    return t;
  }

  function fill(selector, node) {
    var box = document.querySelector(selector);
    if (box) {
      box.textContent = "";
      box.appendChild(node);
    }
  }

  /* ---------- Conveyancing tables ---------- */

  var bandNames = { purchase: "Price", sale: "Price", remortgage: "New mortgage" };
  ["purchase", "sale", "remortgage"].forEach(function (type) {
    var rows = F.bandLabels(C.bands[type]).map(function (b) {
      if (b.fee === null) {
        return [b.label, { text: "We give you a fixed quote", cls: "quote", span: 3 }];
      }
      return [b.label, money(b.fee), money(vatOf(b.fee)), { text: money(b.fee + vatOf(b.fee)), cls: "total" }];
    });
    fill('[data-band-table="' + type + '"]', table([bandNames[type], "Fee", "VAT", "Total"], rows, "Legal fees by " + bandNames[type].toLowerCase()));
  });

  var S = C.supplements;
  var supRows = [
    [S.leaseholdPurchase, "Buying a leasehold home"],
    [S.leaseholdSale, "Selling a leasehold home"],
    [S.leaseholdRemortgage, "Remortgaging a leasehold home"],
    [S.lender, "Buying with a mortgage"],
    [S.newBuild, "Buying a new-build home"],
    [S.sharedOwnership, "Buying a shared ownership home"],
    [S.lisa, "Buying with an ISA bonus"],
    [S.gift, "Buying with help from family"],
    [S.unregistered, "Land not yet registered"],
    [S.extraMortgage, "Selling"],
    [S.transfer, "Every transaction"]
  ].map(function (pair) {
    var s = pair[0];
    return [{ text: s.label, small: pair[1] }, money(s.fee), { text: money(s.fee + vatOf(s.fee)), cls: "total" }];
  });
  fill("[data-supplements]", table(["Fee", "Before VAT", "With VAT"], supRows, "Extra legal fees", "price-table-items"));

  function disbRow(item, note) {
    return [{ text: item.label, small: note }, { text: item.vat ? money(item.net) + " + " + money(item.vat) + " VAT" : "No VAT", cls: "wrap" }, { text: money(item.net + item.vat), cls: "total" }];
  }

  fill("[data-disb-purchase]", table(["Item", "Cost", "You pay"], [
    disbRow(C.searchPack, "Varies by council. This is typical for west London."),
    [{ text: "HM Land Registry registration fee", small: "Depends on the price: see the table below" }, "No VAT", { text: "£20 to £500", cls: "total" }],
    disbRow(C.os1, "Protects your purchase while it is registered"),
    disbRow(C.bankruptcy, "One for each buyer"),
    disbRow(C.idCheck, "One for each buyer")
  ], "Disbursements on a purchase", "price-table-items"));

  fill("[data-disb-other]", table(["Item", "Cost", "You pay"], [
    disbRow(C.officialCopies, "Sale and remortgage"),
    disbRow(C.idCheck, "Sale and remortgage: one for each owner"),
    [{ text: "HM Land Registry fee to register a new mortgage", small: "Remortgage. Depends on the loan: £20 to £140" }, "No VAT", { text: "£20 to £140", cls: "total" }],
    disbRow(C.os1, "Remortgage"),
    disbRow(C.bankruptcy, "Remortgage: one for each borrower"),
    disbRow(C.searchIndemnity, "Remortgage, instead of searches")
  ], "Disbursements on a sale or remortgage", "price-table-items"));

  fill("[data-lr-table]", table(["Price", "Fee"], F.bandLabels(C.landRegistry.scale1).map(function (b) {
    return [b.label, { text: money(b.fee), cls: "total" }];
  }), "HM Land Registry fees by price"));

  fill("[data-lease-table]", table(["Fee", "Typical cost"], C.leaseholdExtras.map(function (x) {
    return [x.label, { text: x.range, cls: "total" }];
  }), "Leasehold fees set by the lease"));

  document.querySelectorAll("[data-who]").forEach(function (list) {
    var a = U.area(list.getAttribute("data-who"));
    a.team.forEach(function (id) {
      list.appendChild(U.whoItem(U.person(id)));
    });
  });

  /* ---------- Probate ---------- */

  var P = data.probate;
  function bigPrice(selector, main, sub) {
    var box = document.querySelector(selector);
    if (!box) {
      return;
    }
    var div = el("p", "big-price");
    div.appendChild(el("strong", "", main));
    div.appendChild(el("span", "", sub));
    box.appendChild(div);
  }
  bigPrice("[data-probate-grant]", F.money(P.grantOnly.fee) + " + VAT",
    "Fixed fee. VAT " + money(vatOf(P.grantOnly.fee)) + ", total " + money(P.grantOnly.fee + vatOf(P.grantOnly.fee)) + ". Plus disbursements.");
  bigPrice("[data-probate-full]", F.money(P.full.low) + " to " + F.money(P.full.high) + " + VAT",
    "Usual range. With VAT, " + F.money(P.full.low + vatOf(P.full.low)) + " to " + F.money(P.full.high + vatOf(P.full.high)) + ". Plus disbursements.");
  // A worked example, priced at our hourly rates.
  var exBox = document.querySelector("[data-probate-example]");
  if (exBox && P.example) {
    var exTotal = 0;
    var parts = P.example.hours.map(function (h) {
      var rate = data.rates.filter(function (r) {
        return r.role === h[0];
      })[0].rate;
      exTotal += rate * h[1];
      return h[1] + " hours of " + h[0].toLowerCase() + " time at " + money(rate);
    });
    var exP = el("p");
    exP.appendChild(el("strong", "", "Example: "));
    exP.appendChild(document.createTextNode("an estate with " + P.example.estate + " might take " + parts.join(" and ") +
      ". That is " + money(exTotal) + " + VAT (" + money(exTotal + vatOf(exTotal)) + " in all), plus disbursements."));
    exBox.appendChild(exP);
  }

  var hours = document.querySelector("[data-probate-hours]");
  if (hours) {
    hours.textContent = P.full.hoursLow + " to " + P.full.hoursHigh;
  }
  fill("[data-probate-disb]", table(["Item", "Cost", "You pay"], P.disbursements.map(function (d) {
    return disbRow(d, d.note);
  }), "Probate disbursements", "price-table-items"));

  /* ---------- Other fixed fees and hourly rates ---------- */

  var other = document.querySelector("[data-other-fees]");
  if (other) {
    ["wills", "lpa", "family", "landlord"].forEach(function (id) {
      var a = U.area(id);
      var block = el("div", "price-block tab-" + a.tab);
      var h = el("h3", "h3");
      h.appendChild(U.icon(a.icon));
      h.appendChild(document.createTextNode(id === "wills" ? "Wills" : a.name));
      block.appendChild(h);
      var rows = data.otherFees.filter(function (f) {
        return f.area === id;
      }).map(function (f) {
        var fee = (f.from ? "From " : "") + money(f.fee);
        return [{ text: f.label, small: f.extra ? f.extra.charAt(0).toUpperCase() + f.extra.slice(1) : "" }, fee, { text: (f.from ? "From " : "") + money(f.fee + vatOf(f.fee)), cls: "total" }];
      });
      block.appendChild(table(["Service", "Before VAT", "With VAT"], rows, a.name + " fees"));
      var who = el("ul", "who-list");
      block.appendChild(el("h4", "h4", "Who does the work"));
      a.team.forEach(function (pid) {
        who.appendChild(U.whoItem(U.person(pid)));
      });
      block.appendChild(who);
      other.appendChild(block);
    });
  }

  fill("[data-rates]", table(["Role", "Per hour", "With VAT"], data.rates.map(function (r) {
    return [r.role, money(r.rate), { text: money(r.rate + vatOf(r.rate)), cls: "total" }];
  }), "Hourly rates"));

  /* ---------- Calculator ---------- */

  var form = document.querySelector("[data-calc]");
  var valueInput = form.elements.value;
  var valueLabel = form.querySelector("[data-value-label]");
  var valueHint = form.querySelector("[data-value-hint]");
  var valueError = form.querySelector("[data-value-error]");
  var peopleLabel = form.querySelector("[data-people-label]");
  var out = {
    total: document.querySelector("[data-calc-total]"),
    summary: document.querySelector("[data-calc-summary]"),
    quote: document.querySelector("[data-calc-quote]"),
    fees: document.querySelector("[data-calc-fees]"),
    feesFoot: document.querySelector("[data-calc-fees-foot]"),
    disb: document.querySelector("[data-calc-disb]"),
    disbFoot: document.querySelector("[data-calc-disb-foot]"),
    sdlt: document.querySelector("[data-calc-sdlt]"),
    lease: document.querySelector("[data-calc-lease]"),
    leaseList: document.querySelector("[data-calc-lease-list]"),
    time: document.querySelector("[data-calc-time]"),
    enquire: document.querySelector("[data-calc-enquire]"),
    mini: document.querySelector("[data-calc-mini-total]")
  };

  var WORDS = {
    purchase: { value: "Price of the property", hint: "The agreed price, or your best guess.", people: "How many people are buying?", what: "Buying" },
    sale: { value: "Price of the property", hint: "The agreed price, or your best guess.", people: "How many people are selling?", what: "Selling" },
    remortgage: { value: "Amount of the new mortgage", hint: "The amount you are borrowing from the new lender.", people: "How many people are borrowing?", what: "Remortgaging" }
  };

  function parseMoney(s) {
    var n = Number(String(s).replace(/[£,\s]/g, ""));
    return isFinite(n) ? n : NaN;
  }

  function readForm() {
    var f = form.elements;
    return {
      type: f.type.value,
      value: parseMoney(valueInput.value),
      leasehold: f.tenure.value === "leasehold",
      mortgage: f.mortgage.checked,
      newBuild: f.newBuild.checked,
      lisa: f.lisa.checked,
      people: Number(f.people.value),
      sdlt: f.sdlt.value
    };
  }

  function row(tbody, label, amount, small) {
    var tr = el("tr");
    var th = el("th", "", label);
    th.scope = "row";
    if (small) {
      th.appendChild(el("small", "", small));
    }
    tr.appendChild(th);
    tr.appendChild(el("td", "num", amount));
    tbody.appendChild(tr);
    return tr;
  }

  function render() {
    var o = readForm();
    var w = WORDS[o.type];
    valueLabel.textContent = w.value;
    valueHint.textContent = w.hint;
    peopleLabel.textContent = w.people;
    form.querySelectorAll("[data-for]").forEach(function (block) {
      block.hidden = block.getAttribute("data-for") !== o.type;
    });

    var bad = !(o.value >= 10000 && o.value <= 10000000);
    valueError.hidden = !bad;
    if (bad) {
      valueInput.setAttribute("aria-invalid", "true");
      out.total.textContent = "–";
      if (out.mini) {
        out.mini.textContent = "–";
      }
      out.summary.textContent = "Enter a price to see the estimate.";
      [out.fees, out.feesFoot, out.disb, out.disbFoot].forEach(function (n) {
        n.textContent = "";
      });
      out.sdlt.hidden = true;
      out.lease.hidden = true;
      out.quote.hidden = true;
      return;
    }
    valueInput.removeAttribute("aria-invalid");

    var r = F.estimate(o);

    out.total.textContent = exact(r.total);
    if (out.mini) {
      out.mini.textContent = exact(r.total);
    }
    out.summary.textContent = w.what + " " + (o.leasehold ? "a leasehold" : "a freehold") + " home" +
      (o.type === "remortgage" ? " with a new mortgage of " : " at ") + F.money(r.value) +
      ". Includes our fees, VAT and disbursements" + (o.type === "purchase" ? ", but not Stamp Duty." : ".");
    out.quote.hidden = !r.quote;

    out.fees.textContent = "";
    r.fees.forEach(function (f) {
      row(out.fees, f.label, exact(f.net));
    });
    out.feesFoot.textContent = "";
    var sub = row(out.feesFoot, "Fees before VAT", exact(r.feesNet));
    sub.className = "sub";
    var vat = row(out.feesFoot, "VAT at " + Math.round(vatRate * 100) + "%", exact(r.feesVat));
    vat.className = "sub";
    row(out.feesFoot, "Our fees with VAT", exact(r.feesTotal));

    out.disb.textContent = "";
    r.disbursements.forEach(function (d) {
      row(out.disb, d.label, exact(d.total), d.vat ? "Includes " + exact(d.vat) + " VAT" : "No VAT");
    });
    out.disbFoot.textContent = "";
    row(out.disbFoot, "Disbursements", exact(r.disbTotal));

    // Stamp Duty: shown, but kept out of the total, as the SRA's guidance suggests.
    out.sdlt.textContent = "";
    out.sdlt.hidden = o.type !== "purchase";
    if (r.sdlt) {
      out.sdlt.appendChild(el("h3", "", "Stamp Duty Land Tax"));
      out.sdlt.appendChild(el("p", "sdlt-figure", F.money(r.sdlt.tax)));
      var why = "Estimate for a home in England, paid to HMRC. Not part of our fees, and not in the total above.";
      if (r.sdlt.firstTimeRelief) {
        why += " Includes first-time buyer relief.";
      } else if (r.sdlt.firstTimeTooDear) {
        why += " First-time buyer relief does not apply above £500,000, so the standard rates are used.";
      }
      if (o.sdlt === "additional") {
        why += " Includes the 5% higher rate for additional homes.";
      }
      out.sdlt.appendChild(el("p", "", why));
      var check = el("p");
      var link = el("a", "", "Check it with HMRC's Stamp Duty calculator");
      link.href = "https://www.tax.service.gov.uk/calculate-stamp-duty-land-tax/";
      check.appendChild(link);
      check.appendChild(document.createTextNode(". Buyers who are not UK resident usually pay 2% more."));
      out.sdlt.appendChild(check);
    }

    out.lease.hidden = !(o.leasehold && o.type !== "sale");
    out.leaseList.textContent = "";
    C.leaseholdExtras.forEach(function (x) {
      if (o.type === "remortgage" && !/charge/i.test(x.label)) {
        return;
      }
      var li = el("li");
      li.appendChild(el("span", "", x.label));
      li.appendChild(el("span", "", x.range));
      out.leaseList.appendChild(li);
    });

    out.time.textContent = "";
    out.time.appendChild(el("strong", "", "Usual timescale: "));
    var weeks = o.type === "purchase" ? (o.leasehold ? "16 to 20 weeks" : "12 to 16 weeks") : r.timescale;
    out.time.appendChild(document.createTextNode(weeks + " from instruction to completion."));

    var deal = { purchase: "buy", sale: "sell", remortgage: "remortgage" }[o.type];
    var params = "matter=conveyancing&deal=" + deal + "&price=" + r.value + "&tenure=" + (o.leasehold ? "leasehold" : "freehold");
    if (o.type === "purchase") {
      params += "&mortgage=" + (o.mortgage ? "yes" : "no") + (o.sdlt === "first" ? "&first=yes" : "");
    }
    out.enquire.href = "enquiry.html?" + params;
  }

  form.addEventListener("input", render);
  form.addEventListener("change", render);
  form.addEventListener("submit", function (event) {
    event.preventDefault();
  });

  // Tidy the number with commas when the visitor leaves the box.
  valueInput.addEventListener("blur", function () {
    var n = parseMoney(valueInput.value);
    if (n > 0 && isFinite(n)) {
      valueInput.value = Math.round(n).toLocaleString("en-GB");
    }
  });

  render();
})();
