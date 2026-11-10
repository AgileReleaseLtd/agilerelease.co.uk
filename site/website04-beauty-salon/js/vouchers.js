/* The gift voucher page: choose an amount or a treatment, personalise it, choose email or a printed card,
   and watch the voucher change as you type. The order is written as a WhatsApp message (or an email) on
   the visitor's own device. There is no online payment: the salon replies with a payment link. */
(function () {
  var data = window.Lunette;
  var H = window.LunetteHours;
  var site = window.LunetteSite;
  var el = site.el;
  var V = data.vouchers;

  var form = document.querySelector("[data-voucher]");
  if (!form) {
    return;
  }
  var f = form.elements;
  var q = function (sel) {
    return form.querySelector(sel);
  };

  var preview = q("[data-preview]");
  var pv = {
    value: q("[data-pv-value]"),
    sub: q("[data-pv-sub]"),
    to: q("[data-pv-to]"),
    msg: q("[data-pv-msg]"),
    from: q("[data-pv-from]"),
    valid: q("[data-pv-valid]"),
    kind: q("[data-pv-kind]")
  };
  var otherBox = q("[data-other]");
  var otherInput = f.other;
  var select = f.treatment;
  var treatmentInfo = q("[data-treatment-info]");
  var counter = q("[data-count]");
  var errorSummary = q("[data-error-summary]");
  var today = H.startOfDay(new Date());
  var validUntil = H.addMonths(today, V.validMonths);

  /* ---------- Built from data.js ---------- */

  function renderAmounts() {
    var box = q("[data-amounts]");
    var wanted = (form.querySelector('input[name="amount"]:checked') || {}).value || String(V.amounts[1]);
    box.textContent = "";
    V.amounts.concat(["other"]).forEach(function (a) {
      var label = el("label", "amount-chip");
      var input = el("input");
      input.type = "radio";
      input.name = "amount";
      input.value = String(a);
      input.checked = String(a) === wanted;
      label.append(input, document.createTextNode(" "), el("span", "", a === "other" ? "Other" : H.money(a)));
      box.appendChild(label);
    });
    q("[data-other-label]").textContent = "Other amount, " + H.money(V.min) + " to " + H.money(V.max);
    q("[data-error=\"amount\"]").textContent = "Enter whole pounds, from " + H.money(V.min) + " to " + H.money(V.max) + ".";
  }

  function renderTreatments() {
    data.categories.forEach(function (cat) {
      var group = el("optgroup");
      group.label = cat.name;
      data.treatments.filter(function (t) {
        return t.cat === cat.id && t.voucher !== false && !t.from;
      }).forEach(function (t) {
        var option = el("option", "", t.name + ", " + H.money(t.price));
        option.value = t.id;
        group.appendChild(option);
      });
      select.appendChild(group);
    });
  }

  // A printed card is ready from the next day the salon is open, never the same day.
  function readyDate() {
    for (var i = 1; i <= 14; i++) {
      var d = H.addDays(today, i);
      if (H.hoursOn(d)) {
        return d;
      }
    }
    return H.addDays(today, 1);
  }

  /* ---------- Reading the form ---------- */

  function radio(name) {
    var checked = form.querySelector('input[name="' + name + '"]:checked');
    return checked ? checked.value : "";
  }

  // The other amount as whole pounds, or NaN when it is not a whole number in range.
  function otherAmount() {
    var s = otherInput.value.trim().replace(/^£/, "");
    if (!/^\d+$/.test(s)) {
      return NaN;
    }
    var n = +s;
    return n >= V.min && n <= V.max ? n : NaN;
  }

  // What the voucher is for: { label, value, sub } or null while it is not chosen yet.
  function what() {
    if (radio("kind") === "treatment") {
      var t = H.treatment(select.value);
      if (!t) {
        return null;
      }
      return { treatment: t, value: t.price, label: t.name, sub: "Worth " + H.money(t.price) + " · " + H.duration(t.mins) };
    }
    var a = radio("amount");
    var n = a === "other" ? otherAmount() : +a;
    if (!n) {
      return null;
    }
    return { value: n, label: H.money(n), sub: "to spend on any treatment" };
  }

  function emailOk(s) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  }

  function sendDate() {
    return H.parseIso(f.sendOn.value);
  }

  function sendDateOk() {
    var d = sendDate();
    if (!f.sendOn.value) {
      return true;
    }
    return !!d && d >= today && d <= H.addDays(today, V.sendAheadDays);
  }

  /* ---------- The live preview ---------- */

  function setText(node, value, placeholder) {
    node.textContent = value || placeholder;
    node.classList.toggle("is-placeholder", !value);
  }

  function update() {
    var kind = radio("kind");
    form.querySelectorAll("[data-kind-panel]").forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-kind-panel") !== kind;
    });
    otherBox.hidden = !(kind === "amount" && radio("amount") === "other");
    var delivery = radio("delivery");
    form.querySelectorAll("[data-delivery-panel]").forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-delivery-panel") !== delivery;
    });

    var w = what();
    if (w) {
      setText(pv.value, w.label, "");
      pv.sub.textContent = w.sub;
    } else {
      setText(pv.value, "", kind === "treatment" ? "Your treatment" : "£");
      pv.sub.textContent = kind === "treatment" ? "Choose a treatment" : "Enter an amount";
    }
    pv.value.classList.toggle("is-treatment", kind === "treatment");
    var t = w && w.treatment;
    treatmentInfo.textContent = t
      ? t.desc + (t.patch ? " It needs a patch test 48 hours before, which we arrange when they book." : "")
      : "The voucher covers the treatment, even if its price goes up.";

    setText(pv.to, f.to.value.trim(), "their name");
    setText(pv.msg, f.message.value.trim(), "Your message appears here.");
    setText(pv.from, f.from.value.trim(), "you");
    pv.valid.textContent = "Valid until " + H.fmt.longYear.format(validUntil);
    pv.kind.textContent = delivery === "card" ? "Printed card" : "E-voucher";

    var design = radio("design") || V.designs[0].id;
    V.designs.forEach(function (d) {
      preview.classList.toggle("v-" + d.id, d.id === design);
    });

    var left = V.messageMax - f.message.value.length;
    counter.textContent = left === V.messageMax ? "Up to " + V.messageMax + " characters." :
      left + (left === 1 ? " character" : " characters") + " left.";

    q("[data-order-value]").textContent = w ? (w.treatment ? w.label + ", " + H.money(w.value) : w.label) : "Not chosen yet";
    q("[data-order-delivery]").textContent = delivery === "card" ? "Printed card, free" : "Email, free";
    q("[data-order-total]").textContent = w ? H.money(w.value) : "None yet";

    if (!errorSummary.hidden) {
      showErrors(validate(), false);
    }
  }

  form.addEventListener("input", update);
  form.addEventListener("change", update);

  /* ---------- Errors and sending ---------- */

  function validate() {
    var errors = [];
    var kind = radio("kind");
    if (kind === "amount" && radio("amount") === "other" && isNaN(otherAmount())) {
      errors.push({ key: "amount", field: otherInput, text: "Enter an amount from " + H.money(V.min) + " to " + H.money(V.max) + "." });
    }
    if (kind === "treatment" && !select.value) {
      errors.push({ key: "treatment", field: select, text: "Choose a treatment." });
    }
    if (!f.to.value.trim()) {
      errors.push({ key: "to", field: f.to, text: "Add the name of the person it is for." });
    }
    if (!f.from.value.trim()) {
      errors.push({ key: "from", field: f.from, text: "Add your name, as it should appear." });
    }
    if (radio("delivery") === "email") {
      if (!emailOk(f.email.value.trim())) {
        errors.push({ key: "email", field: f.email, text: "Add the email address to send it to." });
      }
      if (!sendDateOk()) {
        errors.push({ key: "sendOn", field: f.sendOn, text: "Choose a send date in the next three months, or leave it empty." });
      }
    }
    return errors;
  }

  function showErrors(errors, moveFocus) {
    form.querySelectorAll("[data-error]").forEach(function (node) {
      node.hidden = true;
    });
    form.querySelectorAll("[aria-invalid]").forEach(function (node) {
      node.removeAttribute("aria-invalid");
    });
    var ul = errorSummary.querySelector("ul");
    ul.textContent = "";
    errors.forEach(function (e) {
      var node = form.querySelector('[data-error="' + e.key + '"]');
      if (node) {
        node.hidden = false;
      }
      e.field.setAttribute("aria-invalid", "true");
      var li = el("li");
      var a = el("a", "", e.text);
      a.href = "#" + e.field.id;
      a.setAttribute("data-goto", e.field.id);
      li.appendChild(a);
      ul.appendChild(li);
    });
    errorSummary.hidden = !errors.length;
    if (errors.length && moveFocus) {
      errorSummary.focus();
    }
  }

  errorSummary.addEventListener("click", function (event) {
    var a = event.target.closest("[data-goto]");
    if (!a) {
      return;
    }
    event.preventDefault();
    var field = document.getElementById(a.getAttribute("data-goto"));
    if (field) {
      field.focus();
      field.scrollIntoView({ block: "center", behavior: "auto" });
    }
  });

  function message() {
    var w = what();
    var design = V.designs.filter(function (d) {
      return d.id === (radio("design") || V.designs[0].id);
    })[0];
    var lines = ["Hi " + data.shortName + ", I'd like to order a gift voucher, please.", ""];
    lines.push("Voucher: " + (w.treatment ? w.label + " (worth " + H.money(w.value) + ")" : w.label + ", to spend on any treatment"));
    lines.push("For: " + f.to.value.trim());
    var msg = f.message.value.trim();
    if (msg) {
      lines.push("Message: \"" + msg + "\"");
    }
    lines.push("From: " + f.from.value.trim());
    lines.push("Design: " + design.name);
    if (radio("delivery") === "email") {
      var d = sendDate();
      lines.push("Delivery: E-voucher by email to " + f.email.value.trim() +
        (d ? ", on " + H.fmt.long.format(d) : ", as soon as it's paid"));
      lines.push("Payment: Please send me a payment link.");
    } else {
      lines.push("Delivery: Printed card, which I'll collect from the salon (ready from " + H.fmt.long.format(readyDate()) + ")");
      lines.push("Payment: " + (radio("pay") === "collect" ? "I'll pay by card or cash when I collect it." : "Please send me a payment link."));
    }
    lines.push("");
    lines.push("Thank you!");
    return lines.join("\n");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var errors = validate();
    showErrors(errors, true);
    if (errors.length) {
      return;
    }
    var w = what();
    site.sendMessage({
      text: message(),
      via: event.submitter && event.submitter.getAttribute("data-via") === "email" ? "email" : "whatsapp",
      subject: "Gift voucher order: " + w.label + " for " + f.to.value.trim(),
      title: "Your voucher order",
      reply: "The salon replies with a secure payment link, then sends the voucher once it is paid."
    });
  });

  /* ---------- Start ---------- */

  renderAmounts();
  renderTreatments();
  q("[data-ready-date]").textContent = H.fmt.long.format(readyDate());
  f.sendOn.min = H.isoDate(today);
  f.sendOn.max = H.isoDate(H.addDays(today, V.sendAheadDays));

  // vouchers.html?t=lash-lift opens with that treatment chosen.
  var wanted = H.treatment(new URLSearchParams(window.location.search).get("t") || "");
  if (wanted && wanted.voucher !== false && !wanted.from) {
    form.querySelector('input[name="kind"][value="treatment"]').checked = true;
    select.value = wanted.id;
  }
  update();
})();
