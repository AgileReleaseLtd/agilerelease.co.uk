/* Price sums for the conveyancing calculator and the price tables. Everything comes from data.js. */
(function () {
  var data = window.QM;
  var C = data.conveyancing;

  // Round to whole pence, avoiding 0.1 + 0.2 style errors.
  function pence(n) {
    return Math.round(n * 100) / 100;
  }

  function band(bands, value) {
    for (var i = 0; i < bands.length; i++) {
      if (value <= bands[i].up) {
        return bands[i];
      }
    }
    return bands[bands.length - 1];
  }

  // "£1,350" or "£1,350.50"; always two decimals when cents is true.
  var whole = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0, minimumFractionDigits: 0 });
  var exact = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function money(n, cents) {
    if (cents) {
      return exact.format(n);
    }
    return Math.round(n) === pence(n) ? whole.format(n) : exact.format(n);
  }

  // Band labels for tables: "Up to £250,000", "£250,001 to £500,000", "Over £2,500,000".
  function bandLabels(bands) {
    return bands.map(function (b, i) {
      var low = i === 0 ? 0 : bands[i - 1].up + 1;
      var text;
      if (i === 0) {
        text = "Up to " + money(b.up);
      } else if (b.up === Infinity) {
        text = "Over " + money(low - 1);
      } else {
        text = money(low) + " to " + money(b.up);
      }
      return { label: text, fee: b.fee, up: b.up };
    });
  }

  // Stamp Duty Land Tax for a home in England. status: "standard", "first" (first-time buyer) or "additional".
  function sdlt(price, status) {
    var S = data.sdlt;
    var bands = S.standard;
    var firstTimeRelief = status === "first" && price <= S.firstTime.maxPrice;
    if (firstTimeRelief) {
      bands = S.firstTime.bands;
    }
    var tax = 0;
    var low = 0;
    for (var i = 0; i < bands.length && price > low; i++) {
      var top = Math.min(price, bands[i].up);
      tax += (top - low) * bands[i].rate;
      low = bands[i].up;
    }
    if (status === "additional" && price >= S.additionalFrom) {
      tax += price * S.additionalSurcharge;
    }
    return { tax: Math.floor(tax), firstTimeRelief: firstTimeRelief, firstTimeTooDear: status === "first" && !firstTimeRelief };
  }

  function line(label, net, vat, extra) {
    var l = { label: label, net: pence(net), vat: pence(vat || 0) };
    l.total = pence(l.net + l.vat);
    if (extra) {
      Object.keys(extra).forEach(function (k) {
        l[k] = extra[k];
      });
    }
    return l;
  }

  function dis(item, times, label) {
    times = times || 1;
    return line(label || item.label, item.net * times, item.vat * times);
  }

  /* An estimate for one transaction.
     o.type: "purchase", "sale" or "remortgage"; o.value: price (or the new loan for a remortgage);
     o.leasehold, o.mortgage, o.newBuild, o.lisa: booleans; o.people: 1 to 4; o.sdlt: "standard", "first", "additional". */
  function estimate(o) {
    var type = o.type;
    var value = Math.max(0, Math.round(o.value || 0));
    var people = Math.min(4, Math.max(1, o.people || 1));
    var vatRate = data.vatRate;
    var S = C.supplements;
    var feeBand = band(C.bands[type], value);
    var fees = [];
    var quote = feeBand.fee === null;

    if (!quote) {
      fees.push(line("Legal fee", feeBand.fee));
    }
    if (o.leasehold) {
      var lk = type === "purchase" ? "leaseholdPurchase" : type === "sale" ? "leaseholdSale" : "leaseholdRemortgage";
      fees.push(line(S[lk].label, S[lk].fee));
    }
    if (type === "purchase" && o.mortgage) {
      fees.push(line(S.lender.label, S.lender.fee));
    }
    if (type === "purchase" && o.newBuild) {
      fees.push(line(S.newBuild.label, S.newBuild.fee));
    }
    if (type === "purchase" && o.lisa) {
      fees.push(line(S.lisa.label, S.lisa.fee));
    }
    fees.push(line("Same-day bank transfer fee", S.transfer.fee));
    fees.forEach(function (f) {
      f.vat = pence(f.net * vatRate);
      f.total = pence(f.net + f.vat);
    });

    var disb = [];
    var lr = null;
    if (type === "purchase") {
      disb.push(dis(C.searchPack, 1, "Search pack (council, water and environmental searches)"));
      lr = band(C.landRegistry.scale1, value).fee;
      disb.push(line("HM Land Registry fee to register you as owner", lr, 0));
      disb.push(dis(C.os1));
      disb.push(dis(C.bankruptcy, people, "Bankruptcy search (" + people + (people === 1 ? " person)" : " people)")));
      disb.push(dis(C.idCheck, people, "Electronic ID check (" + people + (people === 1 ? " person)" : " people)")));
    } else if (type === "sale") {
      disb.push(dis(C.officialCopies));
      disb.push(dis(C.idCheck, people, "Electronic ID check (" + people + (people === 1 ? " person)" : " people)")));
    } else {
      lr = band(C.landRegistry.scale2, value).fee;
      disb.push(line("HM Land Registry fee to register the new mortgage", lr, 0));
      disb.push(dis(C.officialCopies));
      disb.push(dis(C.os1));
      disb.push(dis(C.bankruptcy, people, "Bankruptcy search (" + people + (people === 1 ? " person)" : " people)")));
      disb.push(dis(C.idCheck, people, "Electronic ID check (" + people + (people === 1 ? " person)" : " people)")));
      disb.push(dis(C.searchIndemnity));
    }

    function sum(list, key) {
      return pence(list.reduce(function (t, l) {
        return t + l[key];
      }, 0));
    }

    var result = {
      type: type,
      value: value,
      quote: quote,
      fees: fees,
      feesNet: sum(fees, "net"),
      feesVat: sum(fees, "vat"),
      feesTotal: sum(fees, "total"),
      disbursements: disb,
      disbTotal: sum(disb, "total"),
      timescale: C.timescales[type]
    };
    result.total = pence(result.feesTotal + result.disbTotal);
    if (type === "purchase") {
      result.sdlt = sdlt(value, o.sdlt || "standard");
    }
    return result;
  }

  window.QMFees = {
    money: money,
    band: band,
    bandLabels: bandLabels,
    sdlt: sdlt,
    estimate: estimate,
    pence: pence
  };
})();
