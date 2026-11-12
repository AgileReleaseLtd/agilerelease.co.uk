/* Quote page: the form writes a WhatsApp message (or an email) from the answers. On the sample site it shows
   the message instead of opening anything. quote.html?job=regular&freq=weekly&size=small&postcode=SM5
   fills those answers in (the visit plans page and the postcode checker link here like that). */
(function () {
  var data = window.Hornbeam;
  var G = window.HornbeamGarden;
  var el = G.el;

  var form = document.querySelector("[data-quote]");
  if (!form) {
    return;
  }
  var sent = document.querySelector("[data-sent]");
  var params = new URLSearchParams(window.location.search);

  var SIZES = {};
  Object.keys(data.sizes).forEach(function (k) {
    SIZES[k] = [data.sizes[k].name, data.sizes[k].area];
  });
  SIZES.unsure = ["Not sure", "we'll measure when we visit"];

  var FREQS = {};
  Object.keys(data.plans).forEach(function (k) {
    FREQS[k] = data.plans[k].name;
  });
  FREQS.unsure = "Not sure yet";

  /* ---------- Build the choices from data.js ---------- */

  var jobBox = form.querySelector("[data-jobs]");
  Object.keys(data.jobTypes).forEach(function (key) {
    var label = el("label", "job-chip");
    var input = el("input");
    input.type = "checkbox";
    input.name = "job";
    input.value = key;
    input.setAttribute("aria-describedby", "job-error");
    label.append(input, el("span", "", data.jobTypes[key]));
    jobBox.appendChild(label);
  });

  function radios(box, name, entries, describedBy) {
    entries.forEach(function (e) {
      var label = el("label", "option");
      var input = el("input");
      input.type = "radio";
      input.name = name;
      input.value = e[0];
      if (describedBy) {
        input.setAttribute("aria-describedby", describedBy);
      }
      var body = el("span", "option-body");
      body.appendChild(el("span", "option-title", e[1]));
      if (e[2]) {
        body.appendChild(el("span", "option-sub", e[2]));
      }
      label.append(input, body);
      box.appendChild(label);
    });
  }

  radios(form.querySelector("[data-freqs]"), "freq", Object.keys(FREQS).map(function (k) {
    return [k, FREQS[k], data.plans[k] ? data.plans[k].rhythm : ""];
  }));
  radios(form.querySelector("[data-sizes]"), "size", Object.keys(SIZES).map(function (k) {
    var area = data.sizes[k] ? G.keepUnits(data.sizes[k].area) : "";
    var text = area ? area.charAt(0).toUpperCase() + area.slice(1) + ". " + data.sizes[k].text : "We'll measure when we visit.";
    return [k, SIZES[k][0], text];
  }), "size-error");
  radios(form.querySelector("[data-access]"), "access", Object.keys(data.access).map(function (k) {
    return [k, data.access[k]];
  }));
  radios(form.querySelector("[data-waste]"), "waste", Object.keys(data.waste).map(function (k) {
    return [k, data.waste[k]];
  }));

  var when = form.querySelector("[data-timing]");
  Object.keys(data.timing).forEach(function (k) {
    var o = el("option", "", data.timing[k]);
    o.value = k;
    when.appendChild(o);
  });

  /* ---------- Fill in from the link ---------- */

  var freqField = form.querySelector("[data-freq-field]");
  var jobInputs = form.querySelectorAll("input[name=job]");

  function syncFreq() {
    freqField.hidden = !form.querySelector("input[name=job][value=regular]").checked;
  }

  (params.get("job") || "").split(",").forEach(function (j) {
    var input = form.querySelector("input[name=job][value=\"" + j.replace(/[^a-z]/g, "") + "\"]");
    if (input) {
      input.checked = true;
    }
  });
  ["freq", "size"].forEach(function (name) {
    var v = (params.get(name) || "").replace(/[^a-z]/g, "");
    var input = v && form.querySelector("input[name=" + name + "][value=\"" + v + "\"]");
    if (input) {
      input.checked = true;
    }
  });
  if (params.get("postcode")) {
    form.elements.postcode.value = params.get("postcode").slice(0, 9).toUpperCase();
  }
  syncFreq();

  /* ---------- Postcode coverage, as you type ---------- */

  var postcode = form.elements.postcode;
  var status = form.querySelector("[data-postcode-status]");

  function coverage() {
    var r = G.lookup(postcode.value);
    status.textContent = "";
    status.className = "postcode-status";
    if (r.error) {
      return r;
    }
    var kind = r.area ? r.area.status : "out";
    var text;
    if (kind === "all") {
      text = r.area.name + ": we cover you for regular visits and one-off jobs.";
    } else if (kind === "projects") {
      text = r.area.name + ": we cover you for one-off jobs and projects, but it's a little far for regular visits.";
    } else if (kind === "part") {
      text = "We cover part of " + r.district + ". We'll confirm from your full postcode.";
    } else {
      text = r.district + " is outside our usual area, but send it anyway and we'll tell you if we can help.";
    }
    status.classList.add("is-" + kind);
    status.appendChild(G.icon(kind === "all" ? "i-check" : "i-pin"));
    status.appendChild(el("span", "", text));
    return r;
  }

  postcode.addEventListener("input", function () {
    var r = G.lookup(postcode.value);
    // Only judge once there's at least a district to go on.
    if (!r.error) {
      coverage();
      clearError("postcode");
    } else {
      status.textContent = "";
    }
  });
  if (postcode.value) {
    coverage();
  }

  /* ---------- Validation ---------- */

  var errorsBox = form.querySelector("[data-errors]");
  var errorList = form.querySelector("[data-error-list]");

  function showError(name, show) {
    var msg = form.querySelector("[data-error-for=" + name + "]");
    if (msg) {
      msg.hidden = !show;
    }
    var targets = name === "job" ? jobInputs : name === "size" ? form.querySelectorAll("input[name=size]") : [form.elements[name]];
    Array.prototype.forEach.call(targets, function (t) {
      if (show) {
        t.setAttribute("aria-invalid", "true");
      } else {
        t.removeAttribute("aria-invalid");
      }
    });
  }

  function clearError(name) {
    showError(name, false);
    if (!errorsBox.hidden && !validate(true).length) {
      errorsBox.hidden = true;
    }
  }

  function chosen(name) {
    var c = form.querySelector("input[name=" + name + "]:checked");
    return c ? c.value : "";
  }

  function jobsChosen() {
    return Array.prototype.filter.call(jobInputs, function (i) {
      return i.checked;
    }).map(function (i) {
      return i.value;
    });
  }

  // Returns [[field, message, anchor], ...] for what's missing. quiet = don't change the page.
  function validate(quiet) {
    var problems = [];
    if (!jobsChosen().length) {
      problems.push(["job", "Pick at least one job", "f-job"]);
    }
    if (!chosen("size")) {
      problems.push(["size", "Pick the garden size", "f-size"]);
    }
    var pc = G.lookup(postcode.value);
    if (pc.error) {
      problems.push(["postcode", pc.error === "empty" ? "Add your postcode" : "Check the postcode, for example SM5 3AB", "postcode"]);
    }
    if (!form.elements.name.value.trim()) {
      problems.push(["name", "Add your name", "name"]);
    }
    if (!quiet) {
      ["job", "size", "postcode", "name"].forEach(function (f) {
        showError(f, problems.some(function (p) {
          return p[0] === f;
        }));
      });
      var pcError = form.querySelector("[data-error-for=postcode]");
      if (pc.error === "format") {
        pcError.textContent = "That doesn't look like a postcode. Try something like SM5 3AB.";
      } else {
        pcError.textContent = "Add your postcode, for example SM5 3AB.";
      }
    }
    return problems;
  }

  jobInputs.forEach(function (i) {
    i.addEventListener("change", function () {
      syncFreq();
      if (jobsChosen().length) {
        clearError("job");
      }
    });
  });
  form.querySelectorAll("input[name=size]").forEach(function (i) {
    i.addEventListener("change", function () {
      clearError("size");
    });
  });
  form.elements.name.addEventListener("input", function () {
    if (form.elements.name.value.trim()) {
      clearError("name");
    }
  });

  /* ---------- The message ---------- */

  function message(channel) {
    var jobs = jobsChosen().map(function (k) {
      return data.jobTypes[k];
    });
    var lines = ["Hi " + data.name + ", could you quote for some garden work, please?", ""];
    lines.push("Job: " + jobs.join(", "));
    if (jobsChosen().indexOf("regular") !== -1 && chosen("freq")) {
      lines.push("How often: " + FREQS[chosen("freq")]);
    }
    var size = SIZES[chosen("size")];
    lines.push("Garden size: " + size[0] + " (" + size[1] + ")");
    if (chosen("access")) {
      lines.push("Access: " + data.access[chosen("access")]);
    }
    if (chosen("waste")) {
      lines.push("Green waste: " + data.waste[chosen("waste")]);
    }
    var pc = G.lookup(postcode.value);
    lines.push("Postcode: " + pc.full + (pc.area ? " (" + pc.area.name + ")" : ""));
    lines.push("When: " + data.timing[when.value]);
    var details = form.elements.details.value.trim();
    if (details) {
      lines.push("Details: " + details);
    }
    lines.push("Name: " + form.elements.name.value.trim());
    var phone = form.elements.phone.value.trim();
    if (phone) {
      lines.push("Phone: " + phone);
    }
    lines.push("");
    lines.push(channel === "email" ? "I've attached photos of the garden." : "I'll add photos of the garden in this chat.");
    return lines.join("\n");
  }

  var lastButton = "whatsapp";
  form.querySelectorAll("[data-send]").forEach(function (b) {
    b.addEventListener("click", function () {
      lastButton = b.getAttribute("data-send");
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var channel = event.submitter && event.submitter.getAttribute("data-send") || lastButton;
    var problems = validate(false);
    if (problems.length) {
      errorList.textContent = "";
      problems.forEach(function (p) {
        var li = el("li");
        var a = el("a", "", p[1]);
        a.href = "#" + p[2];
        a.addEventListener("click", function (e) {
          e.preventDefault();
          var target = p[0] === "job" ? jobInputs[0] : p[0] === "size" ? form.querySelector("input[name=size]") : form.elements[p[0]];
          target.focus();
        });
        li.appendChild(a);
        errorList.appendChild(li);
      });
      errorsBox.hidden = false;
      errorsBox.focus();
      return;
    }
    errorsBox.hidden = true;

    var text = message(channel);
    if (!data.sample) {
      if (channel === "email") {
        var pc = G.lookup(postcode.value);
        window.location.href = G.mailtoLink("Quote request (" + pc.district + ")", text);
        return;
      }
      G.sendWhatsApp(text);
      return;
    }

    // Sample site: show the message.
    sent.querySelector("[data-message]").textContent = text;
    sent.querySelector("[data-sent-title]").textContent = channel === "email" ? "Your email is ready" : "Your WhatsApp message is ready";
    sent.querySelector("[data-sample-note]").hidden = false;
    sent.setAttribute("data-channel", channel);
    form.hidden = true;
    sent.hidden = false;
    sent.querySelector("[data-copy-label]").textContent = "Copy the message";
    sent.querySelector("[data-sent-title]").focus();
  });

  sent.querySelector("[data-again]").addEventListener("click", function () {
    sent.hidden = true;
    form.hidden = false;
    jobInputs[0].focus();
  });

  sent.querySelector("[data-copy]").addEventListener("click", function () {
    var text = sent.querySelector("[data-message]").textContent;
    var label = sent.querySelector("[data-copy-label]");
    function selectText() {
      var range = document.createRange();
      range.selectNodeContents(sent.querySelector("[data-message]"));
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      label.textContent = "Selected: press Ctrl+C or Copy";
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        label.textContent = "Copied";
      }, selectText);
    } else {
      selectText();
    }
  });
})();
