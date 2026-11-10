/* The quote form: the kind of job, what is wrong, how soon, the postcode and how to reply. The website
   cannot take photos, so the message says they follow in WhatsApp, and the "message ready" window tells
   the visitor how to attach them. Nothing is sent to or stored by this website. */
(function () {
  var data = window.Pinn;
  var site = window.PinnSite;
  var el = site.el;

  var form = document.querySelector("[data-quote-form]");
  if (!form) {
    return;
  }
  var F = form.elements;

  /* ---------- Build the options from data.js ---------- */

  var typeBox = form.querySelector("[data-job-types]");
  data.jobTypes.forEach(function (job) {
    var label = el("label", "jobtype");
    var input = el("input");
    input.type = "radio";
    input.name = "jobType";
    input.value = job.id;
    var iconBox = el("span", "jobtype-icon");
    iconBox.appendChild(site.icon(job.icon));
    label.append(input, iconBox, el("span", "jobtype-name", job.name));
    typeBox.appendChild(label);
  });

  var urgencyBox = form.querySelector("[data-urgency]");
  data.urgency.forEach(function (u, i) {
    var label = el("label", "pill");
    var input = el("input");
    input.type = "radio";
    input.name = "urgency";
    input.value = u.id;
    input.checked = i === 0;
    label.append(input, document.createTextNode(" "), el("span", "", u.name));
    urgencyBox.appendChild(label);
  });

  var callTimes = form.querySelector("[data-call-times]");
  data.callTimes.forEach(function (t) {
    var o = el("option", "", t);
    o.value = t;
    callTimes.appendChild(o);
  });

  /* ---------- Reading the form ---------- */

  function value(name) {
    var field = F[name];
    if (!field) {
      return "";
    }
    if (field instanceof RadioNodeList) {
      return field.value;
    }
    return field.type === "checkbox" ? field.checked : String(field.value).trim();
  }

  function jobType() {
    return data.jobTypes.filter(function (j) {
      return j.id === value("jobType");
    })[0];
  }

  /* ---------- Live feedback ---------- */

  var hint = form.querySelector("[data-details-hint]");
  var tips = form.querySelector("[data-photo-tips]");
  var tipsTitle = form.querySelector("[data-photo-tips-title]");
  var urgentNote = form.querySelector("[data-urgent-note]");
  var phoneBox = form.querySelector("[data-contact-phone]");
  var emailBox = form.querySelector("[data-contact-email]");
  var postcodeNote = form.querySelector("[data-postcode-note]");

  function updateJob() {
    var job = jobType();
    form.querySelectorAll(".jobtype").forEach(function (label) {
      label.classList.toggle("is-selected", label.querySelector("input").checked);
    });
    if (!job) {
      return;
    }
    hint.textContent = job.example;
    tipsTitle.textContent = "Useful photos for " + job.name.toLowerCase();
    tips.textContent = "";
    job.photos.forEach(function (p) {
      var li = el("li");
      li.appendChild(site.icon("i-camera", "icon-sm"));
      li.appendChild(el("span", "", p));
      tips.appendChild(li);
    });
    urgentNote.hidden = !(value("urgency") === "soon" && (job.id === "leak" || job.id === "boiler-repair" || job.id === "heating"));
  }

  function updateContact() {
    var how = value("contact");
    phoneBox.hidden = how !== "phone";
    emailBox.hidden = how !== "email";
  }

  function updatePostcode() {
    var pc = value("postcode");
    var result = site.lookup(pc);
    postcodeNote.textContent = pc && result.valid ? site.coverageLine(result) : "";
    postcodeNote.className = "postcode-note" + (pc && result.valid ? (result.covered ? " is-in" : " is-out") : "");
  }

  form.addEventListener("change", function (event) {
    var name = event.target.name;
    if (name) {
      showError(name, false);
    }
    if (name === "jobType" || name === "urgency") {
      updateJob();
    }
    if (name === "contact") {
      updateContact();
    }
    if (name === "postcode") {
      updatePostcode();
    }
  });
  form.addEventListener("input", function (event) {
    if (event.target.name === "postcode") {
      updatePostcode();
    }
    if (event.target.name && value(event.target.name)) {
      showError(event.target.name, false);
    }
  });

  /* ---------- Checking and sending ---------- */

  var errorsBox = form.querySelector("[data-form-errors]");

  function showError(key, show) {
    var msg = form.querySelector('[data-error-for="' + key + '"]');
    if (msg) {
      msg.hidden = !show;
    }
    var field = F[key];
    if (field && !(field instanceof RadioNodeList)) {
      if (show) {
        field.setAttribute("aria-invalid", "true");
      } else {
        field.removeAttribute("aria-invalid");
      }
    }
  }

  function check() {
    var bad = [];
    function need(key, ok) {
      showError(key, !ok);
      if (!ok) {
        bad.push(key);
      }
    }
    var how = value("contact");
    need("jobType", !!jobType());
    need("details", value("details").length >= 3);
    need("name", !!value("name"));
    need("postcode", site.lookup(value("postcode")).valid);
    need("phone", how !== "phone" || /\d{6,}/.test(value("phone").replace(/\D/g, "")));
    need("email", how !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value("email")));
    return bad;
  }

  function message() {
    var job = jobType();
    var area = site.lookup(value("postcode"));
    var urgency = data.urgency.filter(function (u) {
      return u.id === value("urgency");
    })[0];
    var how = value("contact");
    var reply = {
      whatsapp: "WhatsApp, here",
      phone: "Phone call on " + value("phone") + (value("callTime") && value("callTime") !== "Any time" ? ", " + value("callTime").toLowerCase() : ", any time"),
      email: "Email to " + value("email")
    }[how];
    var lines = [
      "Hi " + data.short + ", could I have a quote please?",
      "",
      "Job: " + job.name,
      "Details: " + value("details"),
      "How soon: " + urgency.name,
      "Postcode: " + area.postcode + (area.covered ? " (" + area.place + ")" : ""),
      "Name: " + value("name"),
      "Best way to reply: " + reply
    ];
    lines.push(value("photos") ? "Photos: I'll send them in this chat." : "Photos: none for now.");
    return lines.join("\n");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var bad = check();
    if (bad.length) {
      errorsBox.hidden = false;
      errorsBox.textContent = bad.length === 1 ? "One thing needs a look before we can send this. It is marked below." :
        bad.length + " things need a look before we can send this. They are marked below.";
      var first = F[bad[0]];
      if (first instanceof RadioNodeList) {
        first = form.querySelector('[name="' + bad[0] + '"]');
      }
      if (first && first.focus) {
        first.focus();
      }
      return;
    }
    errorsBox.hidden = true;
    site.sendMessage(message(), {
      title: "Your quote request is ready",
      subject: "Quote request",
      next: value("photos") ? ["Then add your photos", "After you send the message, tap the paperclip (or + on an iPhone) in the same WhatsApp chat and pick your photos. A close-up and a wider shot of each is ideal."] : null
    });
  });

  /* ---------- Start ---------- */

  var wanted = new URLSearchParams(window.location.search).get("job");
  var start = wanted && form.querySelector('input[name="jobType"][value="' + wanted.replace(/[^a-z-]/g, "") + '"]');
  if (start) {
    start.checked = true;
  }
  updateJob();
  updateContact();
})();
