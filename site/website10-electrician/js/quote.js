/* The guide price form: pick a job, answer its questions (they change with the job), see a guide price
   range from data.js, then send it all as a WhatsApp message or an email. Nothing is sent to or kept by
   this website. */
(function () {
  var data = window.Earthpin;
  var P = window.EarthpinPrices;
  var A = window.EarthpinAreas;
  var UI = window.EarthpinUI;
  var el = UI.el;

  var form = document.querySelector("[data-quote]");
  if (!form) {
    return;
  }

  var jobsBox = form.querySelector("[data-jobs]");
  var qBox = form.querySelector("[data-questions]");
  var jobLegend = form.querySelector("[data-job-legend]");
  var jobIntro = form.querySelector("[data-job-intro]");
  var photosList = form.querySelector("[data-photos]");
  var errorsBox = form.querySelector("[data-errors]");
  var pcNote = form.querySelector("[data-postcode-note]");
  var mini = form.querySelector("[data-mini-price]");
  var est = {
    job: document.querySelector("[data-est-job]"),
    price: document.querySelector("[data-est-price]"),
    small: document.querySelector("[data-est-small]"),
    notes: document.querySelector("[data-est-notes]"),
    includes: document.querySelector("[data-est-includes]")
  };

  var jobId = "";
  var lastVia = "whatsapp";

  /* ---------- Building the form ---------- */

  function fillSelects() {
    form.querySelectorAll("select[data-options]").forEach(function (select) {
      data[select.getAttribute("data-options")].forEach(function (text) {
        var o = el("option", "", text);
        o.value = text;
        select.appendChild(o);
      });
    });
  }

  function jobCards() {
    jobsBox.textContent = "";
    data.jobOrder.forEach(function (id) {
      var job = data.jobs[id];
      var label = el("label", "job-card");
      var input = el("input");
      input.type = "radio";
      input.name = "job";
      input.value = id;
      label.appendChild(input);
      label.appendChild(UI.icon(job.icon));
      label.appendChild(el("strong", "", job.title));
      label.appendChild(el("small", "", job.hint));
      jobsBox.appendChild(label);
    });
  }

  function questionId(q) {
    return "q-" + jobId + "-" + q.id;
  }

  function choiceQuestion(q) {
    var fs = el("fieldset", "q");
    fs.setAttribute("data-q", q.id);
    fs.appendChild(el("legend", "q-label", q.label));
    if (q.help) {
      var help = el("p", "q-help", q.help);
      help.id = questionId(q) + "-help";
      fs.setAttribute("aria-describedby", help.id);
      fs.appendChild(help);
    }
    var chips = el("div", "chips");
    q.options.forEach(function (opt) {
      var label = el("label", "chip");
      var input = el("input");
      input.type = "radio";
      input.name = "q-" + q.id;
      input.value = opt.value;
      label.appendChild(input);
      label.appendChild(el("span", "", opt.label));
      if (opt.hint) {
        label.appendChild(el("small", "", opt.hint));
      }
      chips.appendChild(label);
    });
    fs.appendChild(chips);
    return fs;
  }

  function countQuestion(q) {
    var wrap = el("div", "q");
    wrap.setAttribute("data-q", q.id);
    var id = questionId(q);
    var label = el("label", "q-label", q.label);
    label.htmlFor = id;
    wrap.appendChild(label);
    if (q.help) {
      var help = el("p", "q-help", q.help);
      help.id = id + "-help";
      wrap.appendChild(help);
    }
    var stepper = el("div", "stepper");
    var minus = el("button");
    minus.type = "button";
    minus.setAttribute("aria-label", "One fewer");
    minus.appendChild(UI.icon("i-minus"));
    var input = el("input");
    input.type = "number";
    input.id = id;
    input.name = "q-" + q.id;
    input.min = String(q.min);
    input.max = String(q.max);
    input.value = String(q.start);
    input.inputMode = "numeric";
    if (q.help) {
      input.setAttribute("aria-describedby", id + "-help");
    }
    var plus = el("button");
    plus.type = "button";
    plus.setAttribute("aria-label", "One more");
    plus.appendChild(UI.icon("i-plus"));

    function clamp(n) {
      return Math.min(q.max, Math.max(q.min, n));
    }
    function sync() {
      var n = parseInt(input.value, 10);
      minus.disabled = !(n > q.min);
      plus.disabled = !(n < q.max);
    }
    minus.addEventListener("click", function () {
      input.value = String(clamp((parseInt(input.value, 10) || q.min) - 1));
      sync();
      update();
    });
    plus.addEventListener("click", function () {
      input.value = String(clamp((parseInt(input.value, 10) || 0) + 1));
      sync();
      update();
    });
    input.addEventListener("change", function () {
      input.value = String(clamp(parseInt(input.value, 10) || q.min));
      sync();
      update();
    });
    stepper.append(minus, input, plus);
    wrap.appendChild(stepper);
    sync();
    return wrap;
  }

  function renderQuestions() {
    var job = data.jobs[jobId];
    qBox.textContent = "";
    if (!job) {
      jobIntro.hidden = false;
      return;
    }
    jobLegend.textContent = "About the " + job.title.toLowerCase().replace("eicr", "EICR").replace("ev ", "EV ");
    jobIntro.hidden = true;
    job.questions.forEach(function (q) {
      qBox.appendChild(q.type === "count" ? countQuestion(q) : choiceQuestion(q));
    });
    photosList.textContent = "";
    job.photos.forEach(function (t) {
      photosList.appendChild(el("li", "", t));
    });
  }

  /* ---------- Reading the answers ---------- */

  function answers() {
    var job = data.jobs[jobId];
    var out = {};
    if (!job) {
      return out;
    }
    job.questions.forEach(function (q) {
      var field = form.elements["q-" + q.id];
      if (!field) {
        return;
      }
      out[q.id] = q.type === "count" ? String(parseInt(field.value, 10) || q.start) : field.value;
    });
    return out;
  }

  // Shows or hides questions that depend on another answer.
  function applyShowIf(ans) {
    var job = data.jobs[jobId];
    if (!job) {
      return;
    }
    job.questions.forEach(function (q) {
      var box = qBox.querySelector('[data-q="' + q.id + '"]');
      if (box) {
        box.hidden = !P.applies(q, ans);
      }
    });
  }

  function optionLabel(q, value) {
    var opt = P.chosenOption(q, (function () {
      var a = {};
      a[q.id] = value;
      return a;
    })());
    return opt ? opt.label : value;
  }

  /* ---------- The guide price panel ---------- */

  function update() {
    var job = data.jobs[jobId];
    est.notes.textContent = "";
    est.includes.textContent = "";
    if (!job) {
      return;
    }
    var ans = answers();
    applyShowIf(ans);
    var r = P.compute(jobId, ans);

    est.job.textContent = "";
    est.job.append(UI.icon(job.icon), document.createTextNode(job.name));

    est.price.className = "estimate-price";
    if (r.stop) {
      est.price.classList.add("is-stop");
      est.price.textContent = r.stop;
      est.small.hidden = true;
    } else if (r.missing.length) {
      est.price.classList.add("is-empty");
      est.price.textContent = r.missing.length === 1 ? "One more question to go." : r.missing.length + " questions to go.";
      est.small.hidden = true;
    } else {
      est.price.textContent = P.range(r.lo, r.hi);
      est.small.hidden = false;
      est.small.textContent = "Including VAT" + (job.minimum ? ". Minimum charge " + P.money(job.minimum) + "." : ".");
    }

    // The same price, inside the form, for narrow screens where the panel sits below it.
    mini.textContent = "";
    if (!r.stop && !r.missing.length) {
      mini.append(document.createTextNode("Guide price, with VAT"), el("strong", "", P.range(r.lo, r.hi)));
    }

    r.notes.forEach(function (n) {
      est.notes.appendChild(el("li", "", n));
    });
    if (!r.stop) {
      job.includes.forEach(function (t) {
        var li = el("li");
        li.append(UI.icon("i-check"), document.createTextNode(t));
        est.includes.appendChild(li);
      });
    }
  }

  function selectJob(id, opts) {
    if (!data.jobs[id]) {
      return;
    }
    jobId = id;
    var radio = form.querySelector('input[name="job"][value="' + id + '"]');
    if (radio) {
      radio.checked = true;
    }
    renderQuestions();
    update();
    clearErrors();
    if (opts && opts.url && window.history.replaceState) {
      var url = new URL(window.location.href);
      url.searchParams.set("job", id);
      window.history.replaceState(null, "", url);
    }
  }

  /* ---------- Postcode note ---------- */

  function postcodeNote() {
    var r = A.lookup(form.elements.postcode.value);
    pcNote.className = "field-note";
    if (!r.ok) {
      pcNote.textContent = r.reason === "format" ? "That doesn't look like a postcode yet." : "So we know it's in our area.";
      return r;
    }
    pcNote.classList.add(r.status === "no" ? "is-no" : "is-yes");
    pcNote.textContent = A.shortNote(r);
    return r;
  }

  /* ---------- Checking and sending ---------- */

  function fieldError(name, show) {
    var input = form.elements[name];
    var msg = form.querySelector('[data-error-for="' + name + '"]');
    msg.hidden = !show;
    if (show) {
      input.setAttribute("aria-invalid", "true");
    } else {
      input.removeAttribute("aria-invalid");
    }
  }

  function clearErrors() {
    errorsBox.hidden = true;
    errorsBox.textContent = "";
  }

  function problems() {
    var list = [];
    if (!data.jobs[jobId]) {
      list.push("Pick the job you need.");
    } else {
      var ans = answers();
      data.jobs[jobId].questions.forEach(function (q) {
        if (q.type !== "count" && P.applies(q, ans) && !ans[q.id]) {
          list.push("Answer: " + q.label);
        }
      });
    }
    var name = form.elements.name.value.trim();
    fieldError("name", !name);
    if (!name) {
      list.push("Add your name.");
    }
    var pc = A.lookup(form.elements.postcode.value);
    fieldError("postcode", !pc.ok);
    if (!pc.ok) {
      list.push("Add the postcode of the job.");
    }
    return list;
  }

  function message() {
    var job = data.jobs[jobId];
    var ans = answers();
    var r = P.compute(jobId, ans);
    var lines = ["Hi Earthpin, I'd like a price for a job, please.", "", "Job: " + job.name];
    job.questions.forEach(function (q) {
      if (!P.applies(q, ans)) {
        return;
      }
      lines.push(q.short + ": " + (q.type === "count" ? ans[q.id] : optionLabel(q, ans[q.id])));
    });
    lines.push("");
    lines.push(r.stop ? "Guide price: the website couldn't give one for these answers." : "Guide price on your website: " + P.range(r.lo, r.hi));
    lines.push("");
    var pc = A.lookup(form.elements.postcode.value);
    lines.push("Name: " + form.elements.name.value.trim());
    lines.push("Postcode: " + (pc.full || pc.district));
    lines.push("When: " + form.elements.timing.value);
    lines.push("Best time to reach me: " + form.elements.contact.value);
    var notes = form.elements.notes.value.trim();
    if (notes) {
      lines.push("Notes: " + notes);
    }
    if (lastVia === "whatsapp") {
      var photos = job.photos.map(function (t) {
        return t.replace(/\s*\(.*?\)/g, "").replace(/\byour\b/g, "my");
      });
      lines.push("");
      lines.push("I'll attach photos in this chat: " + photos.join("; ") + ".");
    }
    return lines.join("\n");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var via = event.submitter && event.submitter.getAttribute("data-via");
    lastVia = via === "email" ? "email" : "whatsapp";
    var list = problems();
    if (list.length) {
      errorsBox.textContent = "";
      errorsBox.appendChild(el("p", "", "Nearly there. Please:"));
      var ul = el("ul");
      list.forEach(function (t) {
        ul.appendChild(el("li", "", t));
      });
      errorsBox.appendChild(ul);
      errorsBox.hidden = false;
      errorsBox.focus();
      return;
    }
    clearErrors();
    UI.send(lastVia, message(), { photos: lastVia === "whatsapp", subject: "Guide price: " + data.jobs[jobId].name });
  });

  form.addEventListener("change", function (event) {
    if (event.target.name === "job") {
      selectJob(event.target.value, { url: true });
      return;
    }
    update();
  });

  form.elements.name.addEventListener("input", function () {
    if (form.elements.name.value.trim()) {
      fieldError("name", false);
    }
  });

  form.elements.postcode.addEventListener("input", function () {
    var r = postcodeNote();
    if (r.ok) {
      fieldError("postcode", false);
    }
  });

  /* ---------- Start ---------- */

  fillSelects();
  jobCards();
  var params = new URLSearchParams(window.location.search);
  if (params.get("postcode")) {
    form.elements.postcode.value = params.get("postcode").slice(0, 9);
    postcodeNote();
  }
  if (params.get("job")) {
    selectJob(params.get("job"));
  }
})();
