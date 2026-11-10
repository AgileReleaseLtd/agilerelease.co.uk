/* The quote page: the car's registration (format checked here; the garage looks the car up itself),
   the work needed and the visitor's details, sent as a WhatsApp message (or an email) from the
   visitor's own device. Nothing is sent to or stored by this website. */
(function () {
  var data = window.Gantry;
  var K = window.GantryKit;
  var el = K.el;

  var form = document.querySelector("[data-quote]");
  if (!form) {
    return;
  }

  var jobsBox = form.querySelector("[data-jobs]");
  var detailsTag = form.querySelector("[data-details-optional]");
  var checkReg = K.wirePlate(form.elements.reg, form.querySelector("[data-plate-status]"));

  // The tick boxes, from data.js.
  Object.keys(data.jobs).forEach(function (key) {
    var label = el("label", "chip");
    var input = el("input");
    input.type = "checkbox";
    input.name = "jobs";
    input.value = key;
    var span = el("span");
    span.appendChild(el("strong", "", data.jobs[key].label));
    span.appendChild(el("small", "", data.jobs[key].hint));
    label.append(input, span);
    jobsBox.appendChild(label);
  });

  function ticked() {
    return Array.prototype.filter.call(form.querySelectorAll('input[name="jobs"]'), function (box) {
      return box.checked;
    }).map(function (box) {
      return box.value;
    });
  }

  // "Something else" needs a description.
  function detailsNeeded() {
    var jobs = ticked();
    return !jobs.length || jobs.indexOf("other") > -1;
  }

  function onJobsChange() {
    detailsTag.textContent = detailsNeeded() ? "Needed" : "Optional";
    if (ticked().length) {
      K.fieldError(form, "details", "");
    }
  }

  jobsBox.addEventListener("change", onJobsChange);
  form.elements.details.addEventListener("input", function () {
    if (form.elements.details.value.trim()) {
      K.fieldError(form, "details", "");
    }
  });
  ["name", "phone", "mileage"].forEach(function (name) {
    form.elements[name].addEventListener("input", function () {
      if (form.elements[name].getAttribute("aria-invalid") === "true") {
        K.fieldError(form, name, "");
      }
    });
  });

  // Guide prices in the side panel.
  var guide = document.querySelector("[data-guide-list]");
  if (guide) {
    guide.textContent = "";
    data.repairs.slice(0, 5).forEach(function (r) {
      var li = el("li");
      li.appendChild(el("span", "", r.name));
      li.appendChild(el("b", "", (r.from ? "from " : "") + K.money(r.price)));
      guide.appendChild(li);
    });
  }

  function mileage() {
    var raw = form.elements.mileage.value.trim();
    if (!raw) {
      return "";
    }
    var n = raw.replace(/[\s,.]/g, "").replace(/k$/i, "000");
    return /^\d{1,7}$/.test(n) ? Number(n).toLocaleString("en-GB") : null;
  }

  function validate() {
    var problems = [];
    if (!checkReg(false)) {
      problems.push(form.elements.reg);
    }
    if (mileage() === null) {
      K.fieldError(form, "mileage", "Please give the mileage in numbers, for example 72,000.");
      problems.push(form.elements.mileage);
    }
    if (detailsNeeded() && !form.elements.details.value.trim()) {
      K.fieldError(form, "details", ticked().length
        ? "Please tell us what the something else is."
        : "Please tick a job above, or tell us what's wrong.");
      problems.push(ticked().length ? form.elements.details : form.querySelector('input[name="jobs"]'));
    }
    if (!form.elements.name.value.trim()) {
      K.fieldError(form, "name", "Please add your name.");
      problems.push(form.elements.name);
    }
    if (!K.looksLikePhone(form.elements.phone.value)) {
      K.fieldError(form, "phone", form.elements.phone.value.trim() ? "That doesn't look like a UK phone number. Please check it." : "Please add a mobile number, so we can send the quote.");
      problems.push(form.elements.phone);
    } else {
      K.fieldError(form, "phone", "");
    }
    return problems[0] || null;
  }

  function message() {
    var reg = K.checkPlate(form.elements.reg.value);
    var car = form.elements.car.value.trim();
    var jobs = ticked().map(function (key) {
      return data.jobs[key].label;
    });
    var lines = [
      "Hi " + data.name + ", please could I have a quote?",
      "",
      "Registration: " + reg.plate,
      "Car: " + (car || "not given, please look it up from the registration")
    ];
    if (mileage()) {
      lines.push("Mileage: about " + mileage());
    }
    if (jobs.length) {
      lines.push("Work needed: " + jobs.join(", "));
    }
    var details = form.elements.details.value.trim();
    if (details) {
      lines.push("Details: " + details);
    }
    lines.push("Name: " + form.elements.name.value.trim());
    lines.push("Mobile: " + form.elements.phone.value.trim());
    lines.push("Best way to reply: " + form.elements.reply.value);
    return lines.join("\n");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var bad = validate();
    if (bad) {
      bad.focus();
      return;
    }
    var via = event.submitter && event.submitter.value === "email" ? "email" : "whatsapp";
    K.sendMessage({
      via: via,
      reply: "The garage replies with a price.",
      title: "Your quote request",
      subject: "Quote request: " + K.checkPlate(form.elements.reg.value).plate,
      text: message()
    });
  });

  // Links from other pages: ?reg=AB12CDE&job=brakes
  var params = new URLSearchParams(window.location.search);
  if (params.get("reg")) {
    form.elements.reg.value = params.get("reg");
    checkReg(true);
  }
  var job = form.querySelector('input[name="jobs"][value="' + (params.get("job") || "").replace(/[^a-z]/g, "") + '"]');
  if (job) {
    job.checked = true;
  }
  onJobsChange();
})();
