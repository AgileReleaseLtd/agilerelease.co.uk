/* The quote request. Pick a project type and the questions for it appear (from data.js); the price guide
   beside the form follows the answers. On send, the answers become a WhatsApp message (or an email)
   written on the visitor's own device. Nothing is sent to or stored by this website. */
(function () {
  var data = window.Kember;
  var KD = window.KD;
  var el = KD.el;

  var form = document.querySelector("[data-quote-form]");
  var dialog = document.getElementById("quote-dialog");
  if (!form || !dialog) {
    return;
  }

  var typeBox = form.querySelector("[data-types]");
  var questionBox = form.querySelector("[data-questions]");
  var drawingsBox = form.querySelector("[data-drawings]");
  var postcode = form.elements.postcode;
  var postcodeNote = form.querySelector("[data-postcode-note]");
  var photoList = form.querySelector("[data-photo-list]");

  var guide = {
    title: document.querySelector("[data-guide-title]"),
    figure: document.querySelector("[data-guide-figure]"),
    list: document.querySelector("[data-guide-list]"),
    note: document.querySelector("[data-guide-note]"),
    weeks: document.querySelector("[data-guide-weeks]")
  };

  var current = null; // the chosen project type
  var answers = {}; // answers[type][question id], kept if the visitor switches type and back

  /* ---------- Building the form from data.js ---------- */

  Object.keys(data.types).forEach(function (key) {
    var type = data.types[key];
    var label = el("label", "type-card");
    var input = el("input");
    input.type = "radio";
    input.name = "type";
    input.value = key;
    input.setAttribute("aria-describedby", "type-error");
    label.appendChild(input);
    label.appendChild(KD.icon(type.icon));
    var text = el("span");
    text.appendChild(el("strong", "", type.name));
    var keys = Object.keys(type.guide);
    text.appendChild(el("small", "", keys.length ? "From " + KD.money(KD.lowest(key)) : "Tell us what"));
    label.appendChild(text);
    typeBox.appendChild(label);
  });

  form.querySelectorAll("select[data-options]").forEach(function (select) {
    data[select.getAttribute("data-options")].forEach(function (o) {
      var option = el("option", "", o[1]);
      option.value = o[0];
      select.appendChild(option);
    });
  });

  data.drawings.forEach(function (d, i) {
    drawingsBox.appendChild(choice("drawings", d[0], d[1], d[2], i === 0));
  });

  function choice(name, value, title, small, checked) {
    var label = el("label", "choice");
    var input = el("input");
    input.type = "radio";
    input.name = name;
    input.value = value;
    input.checked = !!checked;
    var text = el("span");
    text.appendChild(el("strong", "", title));
    if (small) {
      text.appendChild(el("small", "", small));
    }
    label.append(input, text);
    return label;
  }

  function renderQuestions(type) {
    questionBox.textContent = "";
    var t = data.types[type];
    var title = el("p", "part-title");
    title.appendChild(el("span", "part-num", "2"));
    title.appendChild(document.createTextNode(type === "other" ? "The details" : "About the " + t.name.toLowerCase()));
    questionBox.appendChild(title);
    var saved = answers[type] || {};

    data.questions[type].forEach(function (q) {
      var id = "qq-" + q.id;
      var hintId = id + "-hint";
      var noteId = id + "-note";
      var wrap;
      if (q.type === "choice" || q.type === "multi") {
        wrap = el("fieldset", "field question");
        wrap.appendChild(el("legend", "field-label", q.label));
        var grid = el("div", q.type === "choice" ? "choice-grid" : "check-grid");
        q.options.forEach(function (o) {
          if (q.type === "choice") {
            grid.appendChild(choice("q-" + q.id, o[0], o[1], o[2], saved[q.id] === o[0]));
          } else {
            var label = el("label", "check");
            var box = el("input");
            box.type = "checkbox";
            box.name = "q-" + q.id;
            box.value = o[0];
            box.checked = (saved[q.id] || []).indexOf(o[0]) !== -1;
            label.append(box, el("span", "", o[1]));
            grid.appendChild(label);
          }
        });
        wrap.appendChild(grid);
      } else {
        wrap = el("div", "field question");
        var label2 = el("label", "field-label", q.label);
        label2.htmlFor = id;
        if (q.required) {
          var star = el("span", "req", " *");
          star.setAttribute("aria-hidden", "true");
          label2.appendChild(star);
        }
        wrap.appendChild(label2);
        var input;
        if (q.type === "select") {
          input = el("select");
          var blank = el("option", "", "Choose one");
          blank.value = "";
          input.appendChild(blank);
          q.options.forEach(function (o) {
            var option = el("option", "", o[1]);
            option.value = o[0];
            input.appendChild(option);
          });
          input.value = saved[q.id] || "";
        } else {
          input = el("textarea");
          input.rows = 3;
          input.maxLength = 400;
          input.placeholder = q.placeholder || "";
          input.value = saved[q.id] || "";
          if (q.required) {
            input.required = true;
          }
        }
        input.id = id;
        input.name = "q-" + q.id;
        wrap.appendChild(input);
        if (q.required) {
          var err = el("p", "field-error", "Please tell us a little about the job.");
          err.id = id + "-error";
          err.setAttribute("data-error-for", "q-" + q.id);
          err.hidden = true;
          wrap.appendChild(err);
          input.setAttribute("aria-describedby", err.id);
        }
      }
      if (q.hint) {
        var hint = el("p", "field-hint", q.hint);
        hint.id = hintId;
        wrap.appendChild(hint);
        var target = wrap.querySelector("select, textarea") || wrap;
        target.setAttribute("aria-describedby", ((target.getAttribute("aria-describedby") || "") + " " + hintId).trim());
      }
      if (q.notes) {
        var note = el("p", "field-note is-flat");
        note.id = noteId;
        note.setAttribute("aria-live", "polite");
        note.hidden = true;
        wrap.appendChild(note);
      }
      wrap.setAttribute("data-question", q.id);
      questionBox.appendChild(wrap);
    });
    updateNotes();
  }

  /* ---------- Reading answers ---------- */

  function questionsFor(type) {
    return type ? data.questions[type] : [];
  }

  function valueOf(q) {
    var name = "q-" + q.id;
    if (q.type === "choice") {
      var checked = form.querySelector('input[name="' + name + '"]:checked');
      return checked ? checked.value : "";
    }
    if (q.type === "multi") {
      return Array.prototype.map.call(form.querySelectorAll('input[name="' + name + '"]:checked'), function (b) {
        return b.value;
      });
    }
    var field = form.elements[name];
    return field ? field.value.trim() : "";
  }

  function labelOf(q, value) {
    if (q.type === "text") {
      return value;
    }
    function one(v) {
      var o = q.options.filter(function (x) {
        return x[0] === v;
      })[0];
      return o ? o[1] : v;
    }
    return Array.isArray(value) ? value.map(one).join(", ") : one(value);
  }

  function remember() {
    if (!current) {
      return;
    }
    var saved = {};
    questionsFor(current).forEach(function (q) {
      saved[q.id] = valueOf(q);
    });
    answers[current] = saved;
  }

  function radioValue(name) {
    var checked = form.querySelector('input[name="' + name + '"]:checked');
    return checked ? checked.value : "";
  }

  function optionLabel(list, value) {
    var o = list.filter(function (x) {
      return x[0] === value;
    })[0];
    return o ? o[1] : "";
  }

  /* ---------- Price guide, notes and photo tips ---------- */

  // A one-line version of the guide inside the form, shown on narrow screens where the card is far below.
  var inline = form.querySelector("[data-inline-guide]");

  function updateInline(picked) {
    if (!inline) {
      return;
    }
    var t = current && data.types[current];
    inline.textContent = "";
    inline.hidden = !t || !Object.keys(t.guide).length;
    if (inline.hidden) {
      return;
    }
    if (picked && t.guide[picked]) {
      var label = t.guide[picked].label;
      inline.appendChild(document.createTextNode("Rough guide, " + label.charAt(0).toLowerCase() + label.slice(1) + ": "));
      inline.appendChild(el("strong", "", KD.range(t.guide[picked])));
      inline.appendChild(document.createTextNode(", including VAT."));
    } else {
      inline.appendChild(document.createTextNode("Rough guide: "));
      inline.appendChild(el("strong", "", "from " + KD.money(KD.lowest(current))));
      inline.appendChild(document.createTextNode(", including VAT."));
    }
  }

  function updateGuide() {
    guide.list.textContent = "";
    if (!current) {
      guide.title.textContent = "Rough price guide";
      guide.figure.textContent = "Pick a project type to see a rough price.";
      guide.weeks.hidden = true;
      return;
    }
    var t = data.types[current];
    var keys = Object.keys(t.guide);
    guide.title.textContent = "Rough guide: " + (current === "other" ? "something else" : t.plural.toLowerCase());
    guide.figure.textContent = "";
    var picked = t.guideBy ? valueOf(data.questions[current].filter(function (q) {
      return q.id === t.guideBy;
    })[0]) : "";
    if (picked && t.guide[picked]) {
      guide.figure.appendChild(el("strong", "", KD.range(t.guide[picked])));
      guide.figure.appendChild(document.createTextNode(t.guide[picked].label + ", including VAT"));
    } else if (keys.length) {
      guide.figure.appendChild(el("strong", "", "From " + KD.money(KD.lowest(current))));
      guide.figure.appendChild(document.createTextNode("Choose an answer under “" + data.questions[current][0].label + "” for a closer guide."));
    } else {
      guide.figure.appendChild(document.createTextNode("We'll give you an honest idea of cost at the visit."));
    }
    keys.forEach(function (k) {
      var li = el("li", k === picked ? "is-current" : "");
      li.append(el("span", "", t.guide[k].label), el("span", "", KD.range(t.guide[k])));
      guide.list.appendChild(li);
    });
    updateInline(picked);
    guide.note.textContent = t.guideNote + (keys.length ? " Guides include VAT." : "");
    guide.weeks.hidden = !t.weeks;
    guide.weeks.textContent = t.weeks ? "Usually " + t.weeks + "." : "";
  }

  // Notes tied to an answer (for example, extensions to flats always need planning).
  function updateNotes() {
    questionsFor(current).forEach(function (q) {
      if (!q.notes) {
        return;
      }
      var note = questionBox.querySelector("#qq-" + q.id + "-note");
      var text = q.notes[valueOf(q)] || "";
      note.textContent = text;
      note.hidden = !text;
    });
  }

  function updatePhotos() {
    photoList.textContent = current ? data.types[current].photos : "the rooms involved, and the outside of the house";
  }

  function setType(type, opts) {
    opts = opts || {};
    if (!data.types[type]) {
      return;
    }
    remember();
    current = type;
    var radio = form.querySelector('input[name="type"][value="' + type + '"]');
    radio.checked = true;
    showError("type", false);
    renderQuestions(type);
    updateGuide();
    updatePhotos();
  }

  typeBox.addEventListener("change", function (event) {
    if (event.target.name === "type") {
      setType(event.target.value);
    }
  });

  questionBox.addEventListener("change", function () {
    updateGuide();
    updateNotes();
  });

  questionBox.addEventListener("input", function (event) {
    if (event.target.required && event.target.value.trim()) {
      showError(event.target.name, false);
    }
  });

  /* ---------- Postcode ---------- */

  // "br31ab" -> { full: "BR3 1AB", outward: "BR3" }, or null if it isn't a UK postcode.
  function parsePostcode(raw) {
    var m = /^([A-Z]{1,2}[0-9][A-Z0-9]?)\s*([0-9][A-Z]{2})$/.exec((raw || "").toUpperCase().replace(/\s+/g, " ").trim());
    return m ? { full: m[1] + " " + m[2], outward: m[1] } : null;
  }

  function checkPostcode() {
    var pc = parsePostcode(postcode.value);
    postcodeNote.className = "field-note";
    postcodeNote.textContent = "";
    if (!pc) {
      return;
    }
    if (data.usualAreas.indexOf(pc.outward) !== -1) {
      postcodeNote.textContent = "In our usual area.";
      postcodeNote.classList.add("is-good");
    } else {
      postcodeNote.textContent = "A bit outside our usual area. Send it anyway and we'll tell you honestly if we can help.";
      postcodeNote.classList.add("is-far");
    }
  }

  postcode.addEventListener("input", function () {
    checkPostcode();
    if (parsePostcode(postcode.value)) {
      showError("postcode", false);
    }
  });

  postcode.addEventListener("blur", function () {
    var pc = parsePostcode(postcode.value);
    if (pc) {
      postcode.value = pc.full;
    }
  });

  /* ---------- Errors ---------- */

  function showError(name, on, text) {
    var err = form.querySelector('[data-error-for="' + name + '"]');
    if (!err) {
      return;
    }
    err.hidden = !on;
    if (text) {
      err.textContent = text;
    }
    var fields = name === "type" ? [] : form.querySelectorAll('[name="' + name + '"]');
    fields.forEach(function (f) {
      if (on) {
        f.setAttribute("aria-invalid", "true");
      } else {
        f.removeAttribute("aria-invalid");
      }
    });
  }

  ["address", "name"].forEach(function (name) {
    form.elements[name].addEventListener("input", function () {
      if (form.elements[name].value.trim()) {
        showError(name, false);
      }
    });
  });

  // Returns the first field that needs attention, after showing every error.
  function validate() {
    var first = null;
    function fail(name, field, text) {
      showError(name, true, text);
      first = first || field;
    }
    if (!current) {
      fail("type", form.querySelector('input[name="type"]'));
    } else {
      questionsFor(current).forEach(function (q) {
        if (q.required && !valueOf(q)) {
          fail("q-" + q.id, form.elements["q-" + q.id]);
        }
      });
    }
    var pc = parsePostcode(postcode.value);
    if (!postcode.value.trim()) {
      fail("postcode", postcode, "Please add the postcode, for example BR3 1AB.");
    } else if (!pc) {
      fail("postcode", postcode, "That doesn't look like a UK postcode. Try something like BR3 1AB.");
    } else {
      postcode.value = pc.full;
      showError("postcode", false);
    }
    if (!form.elements.address.value.trim()) {
      fail("address", form.elements.address);
    }
    if (!form.elements.name.value.trim()) {
      fail("name", form.elements.name);
    }
    return first;
  }

  /* ---------- The message ---------- */

  function message(via) {
    var t = data.types[current];
    var lines = ["Hi Kember & Daughter, I'd like a quote, please.", "", "Project: " + t.name];
    questionsFor(current).forEach(function (q) {
      var v = valueOf(q);
      if (v && v.length) {
        lines.push(q.msg + ": " + labelOf(q, v));
      }
    });
    lines.push("Address: " + form.elements.address.value.trim() + ", " + parsePostcode(postcode.value).full);
    lines.push("Budget: " + optionLabel(data.budgets, form.elements.budget.value));
    lines.push("Timing: " + optionLabel(data.timings, form.elements.timing.value));
    lines.push("Drawings and planning: " + optionLabel(data.drawings, radioValue("drawings")));
    lines.push("Name: " + form.elements.name.value.trim());
    var phone = form.elements.phone.value.trim();
    if (phone) {
      lines.push("Phone: " + phone);
    }
    var notes = form.elements.notes.value.trim();
    if (notes) {
      lines.push("Notes: " + notes);
    }
    lines.push("");
    lines.push(via === "email" ? "I can send photos of " + t.photos + "." : "I'll attach photos of " + t.photos + " here.");
    return lines.join("\n");
  }

  function subject() {
    return "Quote request: " + data.types[current].name + ", " + parsePostcode(postcode.value).full;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var via = event.submitter && event.submitter.getAttribute("data-via") === "email" ? "email" : "whatsapp";
    var bad = validate();
    if (bad) {
      bad.focus();
      return;
    }
    var text = message(via);

    if (data.sample) {
      var chat = dialog.querySelector("[data-chat]");
      var to = dialog.querySelector("[data-chat-to]");
      var explain = dialog.querySelector("[data-sample-explain]");
      chat.classList.toggle("is-email", via === "email");
      to.textContent = "";
      to.appendChild(KD.icon(via === "email" ? "i-mail" : "i-chat", "icon-sm"));
      to.appendChild(document.createTextNode(via === "email"
        ? " Email to " + data.email + " · " + subject()
        : " To Kember & Daughter on WhatsApp"));
      explain.textContent = via === "email"
        ? "On the firm's real website, this button opens your email app with the message above ready to send."
        : "On the firm's real website, this button opens WhatsApp with the message above ready to send, and you attach your photos in the chat.";
      dialog.querySelector("[data-message]").textContent = text;
      dialog.showModal();
      dialog.querySelector("[data-sent-title]").focus();
      return;
    }

    if (via === "email") {
      window.location.href = "mailto:" + data.email + "?subject=" + encodeURIComponent(subject()) + "&body=" + encodeURIComponent(text);
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

  dialog.querySelectorAll("[data-close], [data-done]").forEach(function (b) {
    b.addEventListener("click", function () {
      dialog.close();
    });
  });

  // A click on the dimmed backdrop lands on the dialog element itself.
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  /* ---------- Start ---------- */

  var wanted = new URLSearchParams(window.location.search).get("type");
  if (wanted && data.types[wanted]) {
    setType(wanted);
  } else {
    updateGuide();
    updatePhotos();
  }
})();
