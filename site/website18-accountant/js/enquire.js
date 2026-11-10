/* The enquiry page: who you are, your turnover, where you are now, what is worrying you and how to reach
   you, turned into a WhatsApp message (or a call-back request) written on the visitor's own device.
   Answers from the package finder arrive in the address (?type=...&band=...) and are filled in. Nothing is
   sent to or stored by this website. */
(function () {
  var data = window.Quarterday;
  var D = window.QuarterdayDates;
  var UI = window.QuarterdayUI;
  var el = UI.el;

  var form = document.querySelector("[data-enquiry]");
  var dialog = document.getElementById("sent-dialog");
  if (!form || !dialog) {
    return;
  }

  var TYPE_WORDS = {
    sole: "Sole trader or freelancer",
    landlord: "Landlord",
    both: "Self-employed and a landlord",
    ltd: "Limited company",
    books: "Looking for bookkeeping only",
    unsure: "Not sure yet"
  };

  var bandSelect = form.querySelector("[data-band-select]");
  var worriesBox = form.querySelector("[data-worries]");
  var callBox = form.querySelector("[data-call-time]");
  var phoneOptional = form.querySelector("[data-phone-optional]");
  var submitText = form.querySelector("[data-submit-text]");
  var submitIcon = form.querySelector("[data-submit] use");
  var fromFinder = form.querySelector("[data-from-finder]");
  var finderSummary = form.querySelector("[data-finder-summary]");
  var finder = null; // the package finder's answers, if the visitor came from it

  /* ---------- Fill the choices from data.js ---------- */

  data.bands.forEach(function (b) {
    var o = el("option", "", b.label + " a year");
    o.value = b.id;
    bandSelect.appendChild(o);
  });
  var unsure = el("option", "", "Not sure");
  unsure.value = "unsure";
  bandSelect.appendChild(unsure);

  // The next date of a deadline (by id, or "mtd" for the next quarterly update), for the worry labels.
  var upcoming = D.deadlines(D.today(), 365);
  function nextDate(id) {
    var match = upcoming.filter(function (d) {
      return id === "mtd" ? d.cat === "mtd" : d.id === id;
    })[0];
    return match ? match.date : null;
  }

  data.enquiry.worries.forEach(function (w) {
    var label = el("label", "check");
    var input = el("input");
    input.type = "checkbox";
    input.name = "worry";
    input.value = w.id;
    var text = el("span", "", w.label);
    var date = w.next ? nextDate(w.next) : null;
    if (date) {
      text.appendChild(el("small", "", "Next: " + D.fmt.full.format(date) + ", " + D.countdown(date).toLowerCase()));
    }
    label.append(input, text);
    worriesBox.appendChild(label);
  });

  /* ---------- Answers from the package finder ---------- */

  var params = new URLSearchParams(window.location.search);
  if (params.get("type") && TYPE_WORDS[params.get("type")]) {
    var radio = form.querySelector('input[name="type"][value="' + params.get("type") + '"]');
    if (radio) {
      radio.checked = true;
    }
  }
  if (params.get("band") && bandSelect.querySelector('option[value="' + params.get("band") + '"]')) {
    bandSelect.value = params.get("band");
  }
  if (params.get("pkg")) {
    finder = {
      pkg: params.get("pkg").slice(0, 120),
      vat: params.get("vat"),
      staff: params.get("staff")
    };
    finderSummary.textContent = finder.pkg;
    fromFinder.hidden = false;
  }

  /* ---------- Reply by WhatsApp or call back ---------- */

  function replyMode() {
    var checked = form.querySelector('input[name="reply"]:checked');
    return checked ? checked.value : "whatsapp";
  }

  function syncReply() {
    var call = replyMode() === "call";
    callBox.hidden = !call;
    phoneOptional.textContent = call ? "Needed for a call back" : "Optional";
    submitText.textContent = call ? "Ask for a call back" : "Write my WhatsApp message";
    submitIcon.setAttribute("href", call ? "#i-phone" : "#i-chat");
    if (!call) {
      clearError("phone");
    }
  }

  form.querySelectorAll('input[name="reply"]').forEach(function (r) {
    r.addEventListener("change", syncReply);
  });
  syncReply();

  /* ---------- Checks ---------- */

  function errorFor(name) {
    return form.querySelector('[data-error-for="' + name + '"]');
  }

  function fieldFor(name) {
    return name === "type" ? form.querySelector('input[name="type"]') : form.elements[name];
  }

  function showError(name) {
    errorFor(name).hidden = false;
    if (name !== "type") {
      fieldFor(name).setAttribute("aria-invalid", "true");
    }
  }

  function clearError(name) {
    errorFor(name).hidden = true;
    if (name !== "type") {
      fieldFor(name).removeAttribute("aria-invalid");
    }
  }

  function validPhone(s) {
    var t = s.replace(/[\s\-().]/g, "");
    return /^(?:\+44|0044|0)\d{9,10}$/.test(t);
  }

  function validEmail(s) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
  }

  function check() {
    var problems = [];
    if (!form.querySelector('input[name="type"]:checked')) {
      problems.push("type");
    }
    if (!form.elements.name.value.trim()) {
      problems.push("name");
    }
    var phone = form.elements.phone.value.trim();
    if ((replyMode() === "call" && !phone) || (phone && !validPhone(phone))) {
      problems.push("phone");
    }
    var email = form.elements.email.value.trim();
    if (email && !validEmail(email)) {
      problems.push("email");
    }
    ["type", "name", "phone", "email"].forEach(function (n) {
      if (problems.indexOf(n) > -1) {
        showError(n);
      } else {
        clearError(n);
      }
    });
    return problems;
  }

  ["name", "phone", "email"].forEach(function (n) {
    form.elements[n].addEventListener("input", function () {
      if (!errorFor(n).hidden) {
        check();
      }
    });
  });
  form.querySelectorAll('input[name="type"]').forEach(function (r) {
    r.addEventListener("change", function () {
      clearError("type");
    });
  });

  /* ---------- The message ---------- */

  function bandWords(id) {
    var b = data.bands.filter(function (x) {
      return x.id === id;
    })[0];
    return b ? b.label + " a year" : id === "unsure" ? "Not sure" : "";
  }

  function message() {
    var f = form.elements;
    var type = form.querySelector('input[name="type"]:checked').value;
    var lines = ["Hello Quarterday, I would like some help with my accounts.", ""];
    lines.push("Name: " + f.name.value.trim());
    lines.push("I am: " + TYPE_WORDS[type]);
    var band = bandWords(f.band.value);
    if (band) {
      lines.push((type === "landlord" ? "Rent" : "Turnover") + ": " + band);
    }
    lines.push("Where I am now: " + data.enquiry.situations[f.situation.value]);

    var worries = [];
    form.querySelectorAll('input[name="worry"]:checked').forEach(function (c) {
      var w = data.enquiry.worries.filter(function (x) {
        return x.id === c.value;
      })[0];
      var date = w.next ? nextDate(w.next) : null;
      if (w.say && date) {
        worries.push(w.say.replace("{date}", D.fmt.full.format(date)));
      } else {
        worries.push(w.label.charAt(0).toLowerCase() + w.label.slice(1));
      }
    });
    if (worries.length) {
      lines.push("Worried about: " + worries.join("; "));
    }
    if (finder) {
      lines.push("From your package finder: " + finder.pkg);
    }
    var note = f.note.value.trim();
    if (note) {
      lines.push("Note: " + note);
    }
    lines.push("");
    var phone = f.phone.value.trim();
    if (replyMode() === "call") {
      lines.push("Please call me back on " + phone + ".");
      lines.push("Best time: " + f.time.value);
    } else {
      lines.push("Please reply on WhatsApp." + (phone ? " My number is " + phone + "." : ""));
    }
    var email = f.email.value.trim();
    if (email) {
      lines.push("Email: " + email);
    }
    return lines.join("\n");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var problems = check();
    if (problems.length) {
      var first = problems[0];
      var target = first === "type" ? form.querySelector('input[name="type"]') : fieldFor(first);
      target.focus();
      if (first === "type") {
        target.closest("fieldset").scrollIntoView({ block: "center" });
      }
      return;
    }
    var text = message();
    var mail = dialog.querySelector("[data-email-instead]");
    mail.href = "mailto:" + data.email + "?subject=" + encodeURIComponent("Enquiry from " + form.elements.name.value.trim()) + "&body=" + encodeURIComponent(text);

    if (data.sample) {
      dialog.querySelector("[data-message]").textContent = text;
      dialog.querySelector("[data-sent-title]").textContent = replyMode() === "call" ? "Your call-back request" : "Your WhatsApp message";
      dialog.showModal();
      dialog.querySelector("[data-sent-title]").focus();
      return;
    }

    var url = "https://wa.me/" + data.whatsapp + "?text=" + encodeURIComponent(text);
    var opened = window.open(url, "_blank");
    if (opened) {
      opened.opener = null;
    } else {
      window.location.href = url;
    }
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
})();
