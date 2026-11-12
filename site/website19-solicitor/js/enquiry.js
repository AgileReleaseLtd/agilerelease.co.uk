/* The enquiry form. The questions change with the kind of matter, and the answers become a short message the
   visitor sends on WhatsApp or by email from their own device. Nothing is sent to or stored by this website.
   On the sample site, the send buttons explain what they would do instead. */
(function () {
  var data = window.QM;
  var D = window.QMDates;
  var F = window.QMFees;
  var form = document.querySelector("[data-enquiry]");
  if (!form) {
    return;
  }
  var f = form.elements;
  var details = form.querySelector("[data-details]");
  var contact = form.querySelector("[data-contact-block]");
  var dialog = document.getElementById("preview-dialog");
  var messageBox = dialog.querySelector("[data-message]");
  var status = dialog.querySelector("[data-send-status]");
  var currentText = "";

  var MATTERS = {
    conveyancing: { name: "Residential conveyancing", title: "About your move" },
    will: { name: "Making a will", title: "About your will" },
    probate: { name: "Probate or an estate", title: "About the estate" },
    lpa: { name: "Lasting power of attorney", title: "About the LPA" },
    family: { name: "Family law", title: "About your family matter" },
    landlord: { name: "Landlord and tenant", title: "About the tenancy" },
    other: { name: "Something else", title: "Tell us about it" }
  };
  var DEALS = { buy: "Buying", sell: "Selling", both: "Selling and buying", remortgage: "Remortgaging" };
  var REPLY = { phone: "Phone call", email: "Email", whatsapp: "WhatsApp" };

  function value(name) {
    var field = f[name];
    if (!field) {
      return "";
    }
    return (field.value || "").trim();
  }

  function parseMoney(s) {
    var n = Number(String(s || "").replace(/[£,\s]/g, ""));
    return s && isFinite(n) && n > 0 ? n : null;
  }

  /* ---------- Showing the right questions ---------- */

  function sync() {
    var matter = value("matter");
    var chosen = !!matter;
    details.hidden = !chosen;
    contact.hidden = !chosen;
    if (chosen) {
      form.querySelector("[data-details-title]").textContent = MATTERS[matter].title;
    }
    form.querySelectorAll("[data-q]").forEach(function (group) {
      group.hidden = group.getAttribute("data-q") !== matter;
    });

    var deal = value("deal");
    form.querySelectorAll("[data-show-deal]").forEach(function (node) {
      node.hidden = node.getAttribute("data-show-deal").split(" ").indexOf(deal) < 0;
    });

    form.querySelector("[data-lpa-note]").hidden = value("lpaFor") !== "A relative";
    form.querySelector("[data-lt-wales]").hidden = f.ltEngland.checked;

    var reply = value("replyBy");
    form.querySelectorAll("[data-need]").forEach(function (node) {
      node.hidden = node.getAttribute("data-need").split(" ").indexOf(reply) < 0;
    });

    var left = 400 - f.note.value.length;
    form.querySelector("[data-note-count]").textContent = left + (left === 1 ? " character left." : " characters left.");
  }

  form.addEventListener("change", function (event) {
    sync();
    if (event.target.name === "matter") {
      showError("matter", false);
    }
  });
  form.addEventListener("input", function (event) {
    sync();
    var name = event.target.name;
    if (["name", "phone", "email", "note"].indexOf(name) >= 0 && event.target.getAttribute("aria-invalid")) {
      validate(name);
    }
  });

  // Commas in prices, once the visitor leaves the box.
  ["buyPrice", "sellPrice", "loan"].forEach(function (name) {
    f[name].addEventListener("blur", function () {
      var n = parseMoney(f[name].value);
      if (n) {
        f[name].value = Math.round(n).toLocaleString("en-GB");
      }
    });
  });

  /* ---------- Checking the answers ---------- */

  function showError(name, on) {
    var msg = form.querySelector('[data-error="' + name + '"]');
    if (msg) {
      msg.hidden = !on;
    }
    var field = f[name];
    if (field && field.setAttribute && !(field instanceof RadioNodeList)) {
      if (on) {
        field.setAttribute("aria-invalid", "true");
      } else {
        field.removeAttribute("aria-invalid");
      }
    }
  }

  // Returns true when the named field is fine (and shows or hides its message).
  function validate(name) {
    var ok = true;
    var reply = value("replyBy");
    if (name === "matter") {
      ok = !!value("matter");
    } else if (name === "name") {
      ok = value("name").length > 1;
    } else if (name === "phone") {
      ok = reply === "email" || value("phone").replace(/\D/g, "").length >= 10;
    } else if (name === "email") {
      ok = reply !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value("email"));
    } else if (name === "note") {
      ok = value("matter") !== "other" || value("note").length >= 5;
    } else if (name === "understand") {
      ok = f.understand.checked;
    }
    showError(name, !ok);
    return ok;
  }

  f.understand.addEventListener("change", function () {
    validate("understand");
  });

  /* ---------- The message ---------- */

  function line(lines, label, text) {
    if (text) {
      lines.push("- " + label + ": " + text);
    }
  }

  function money(n) {
    return n ? F.money(n) : "";
  }

  function buildMessage(now) {
    var matter = value("matter");
    var lines = ["Hello Quinlan Mensah, I'd like to make an enquiry.", "", "About: " + MATTERS[matter].name];

    if (matter === "conveyancing") {
      var deal = value("deal");
      line(lines, "Transaction", DEALS[deal]);
      if (deal === "buy" || deal === "both") {
        line(lines, "Buying at", money(parseMoney(value("buyPrice"))));
      }
      if (deal === "sell" || deal === "both") {
        line(lines, "Selling at", money(parseMoney(value("sellPrice"))));
      }
      if (deal === "remortgage") {
        line(lines, "New mortgage", money(parseMoney(value("loan"))));
      }
      if (deal === "buy" || deal === "both") {
        line(lines, "Mortgage", value("mortgage"));
        if (f.firstTime.checked) {
          line(lines, "First-time buyer", "Yes");
        }
      }
      line(lines, "Tenure", value("tenure"));
      line(lines, "Stage", value("stage"));
    } else if (matter === "will") {
      line(lines, "Will for", value("willFor"));
      line(lines, "Children under 18", f.willChildren.checked ? "Yes" : "No");
      if (f.willAbroad.checked) {
        line(lines, "Property outside England and Wales", "Yes");
      }
      if (f.willExisting.checked) {
        line(lines, "Existing will", "Yes, I want to change it");
      }
      line(lines, "Meeting", value("meet"));
    } else if (matter === "probate") {
      line(lines, "Is there a will", value("probWill"));
      line(lines, "Property in the estate", value("probHome"));
      line(lines, "Help wanted", value("probHelp"));
      line(lines, "I am", value("probRole"));
    } else if (matter === "lpa") {
      line(lines, "Kind of LPA", value("lpaType"));
      line(lines, "For", value("lpaFor"));
    } else if (matter === "family") {
      line(lines, "Topic", value("familyTopic"));
      if (f.familyCourt.checked) {
        line(lines, "Court date or deadline", "Yes");
      }
    } else if (matter === "landlord") {
      line(lines, "I am", { Landlord: "The landlord", Tenant: "The tenant", "Letting agent": "A letting agent" }[value("ltRole")] || value("ltRole"));
      line(lines, "Issue", value("ltIssue"));
      if (f.ltNotice.checked) {
        line(lines, "Notice already served", "Yes");
      }
      line(lines, "Property in England", f.ltEngland.checked ? "Yes" : "No");
    }

    var note = value("note");
    if (note) {
      lines.push("", "In brief: " + note);
    }

    var reply = value("replyBy");
    lines.push("", "Name: " + value("name"));
    var how = REPLY[reply];
    if (reply === "email") {
      how += ", " + value("email");
    } else {
      how += ", " + value("phone");
      if (reply === "phone" && value("time") !== "Any time") {
        how += " (" + value("time").toLowerCase() + ")";
      }
    }
    lines.push("Please reply by: " + how);
    if (value("heard")) {
      lines.push("Heard about you: " + value("heard"));
    }
    lines.push("", "Sent " + D.fmt.long.format(now) + " " + now.getFullYear() + ". I understand this enquiry does not make you my solicitors yet.");
    return lines.join("\n");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var order = ["matter", "note", "name", "phone", "email", "understand"];
    var firstBad = null;
    order.forEach(function (name) {
      if (!validate(name) && !firstBad) {
        firstBad = name;
      }
    });
    if (firstBad) {
      var target = firstBad === "matter" ? form.querySelector('input[name="matter"]') : f[firstBad];
      target.focus();
      return;
    }
    currentText = buildMessage(new Date());
    messageBox.textContent = currentText;
    status.textContent = "";
    status.className = "dialog-status";
    dialog.querySelector("[data-sample-note]").hidden = !data.sample;
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
      dialog.querySelector("#preview-title").focus();
    }
  });

  /* ---------- Sending ---------- */

  dialog.querySelectorAll("[data-send]").forEach(function (button) {
    button.addEventListener("click", function () {
      var how = button.getAttribute("data-send");
      if (data.sample) {
        status.className = "dialog-status is-note";
        status.textContent = how === "whatsapp"
          ? "Sample site: on a real firm's website this opens WhatsApp with your message ready to send to " + data.mobile + "."
          : "Sample site: on a real firm's website this opens your email app with the message addressed to " + data.email + ".";
        status.scrollIntoView({ block: "nearest" });
        return;
      }
      var url = how === "whatsapp"
        ? "https://wa.me/" + data.whatsapp + "?text=" + encodeURIComponent(currentText)
        : "mailto:" + data.email + "?subject=" + encodeURIComponent("Enquiry: " + MATTERS[value("matter")].name) + "&body=" + encodeURIComponent(currentText);
      if (how === "whatsapp") {
        var opened = window.open(url, "_blank");
        if (opened) {
          opened.opener = null;
        } else {
          window.location.href = url;
        }
      } else {
        window.location.href = url;
      }
    });
  });

  dialog.querySelectorAll("[data-close]").forEach(function (b) {
    b.addEventListener("click", function () {
      dialog.close();
    });
  });
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  /* ---------- Start: answers passed in the address (from the calculator or a guide) ---------- */

  var params = new URLSearchParams(window.location.search);
  var matter = params.get("matter");
  if (matter && MATTERS[matter]) {
    form.querySelector('input[name="matter"][value="' + matter + '"]').checked = true;
    var deal = params.get("deal");
    if (deal && DEALS[deal]) {
      form.querySelector('input[name="deal"][value="' + deal + '"]').checked = true;
    }
    var price = parseMoney(params.get("price"));
    if (price) {
      var target = deal === "sell" ? "sellPrice" : deal === "remortgage" ? "loan" : "buyPrice";
      f[target].value = Math.round(price).toLocaleString("en-GB");
    }
    var tenure = params.get("tenure");
    if (tenure === "freehold" || tenure === "leasehold") {
      form.querySelector('input[name="tenure"][value="' + (tenure === "freehold" ? "Freehold" : "Leasehold") + '"]').checked = true;
    }
    var mortgage = params.get("mortgage");
    if (mortgage === "yes" || mortgage === "no") {
      form.querySelector('input[name="mortgage"][value="' + (mortgage === "yes" ? "Yes" : "No") + '"]').checked = true;
    }
    if (params.get("first") === "yes") {
      f.firstTime.checked = true;
    }
  }
  sync();
  if (matter && MATTERS[matter]) {
    details.querySelector(".step-legend").scrollIntoView();
  }
})();
