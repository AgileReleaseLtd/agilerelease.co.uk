/* The "Is it an emergency?" helper: pick what is happening and see what to do right now. The advice is
   in data.js (emergencies); the drawings are in emergency.html. A choice is kept in the address (#leak,
   #gas, #heating, #other), so the home page can link straight to one. */
(function () {
  var data = window.Pinn;
  var site = window.PinnSite;
  var el = site.el;

  var box = document.querySelector("[data-helper]");
  if (!box) {
    return;
  }
  var choices = box.querySelector("[data-helper-choices]");
  var panel = box.querySelector("[data-helper-panel]");
  var empty = box.querySelector("[data-helper-empty]");
  var body = box.querySelector("[data-helper-body]");
  var title = box.querySelector("[data-helper-title]");
  var intro = box.querySelector("[data-helper-intro]");
  var steps = box.querySelector("[data-helper-steps]");
  var note = box.querySelector("[data-helper-note]");
  var actions = box.querySelector("[data-helper-actions]");
  var caption = box.querySelector("[data-helper-caption]");

  var ICONS = { leak: "i-drop", gas: "i-flame", heating: "i-radiator", other: "i-question" };
  var CAPTIONS = {
    "fig-stopcock": "The stopcock: turn it clockwise, to the right, until it stops.",
    "fig-meter": "The lever by the gas meter: a quarter turn, so it sits across the pipe, turns the gas off.",
    "fig-gauge": "The boiler's pressure gauge should read between 1 and 1.5 bar when the heating is cold.",
    "fig-photo": "In WhatsApp, tap the paperclip (or + on an iPhone) to add photos to your message."
  };

  Object.keys(data.emergencies).forEach(function (key) {
    var item = data.emergencies[key];
    var label = el("label", "choice choice-" + key);
    var input = el("input");
    input.type = "radio";
    input.name = "emergency";
    input.value = key;
    var iconBox = el("span", "choice-icon");
    iconBox.appendChild(site.icon(ICONS[key] || "i-question"));
    var words = el("span", "choice-words");
    words.append(el("span", "choice-title", item.label), el("span", "choice-sub", item.sub));
    label.append(input, iconBox, words);
    choices.appendChild(label);
  });

  function button(className, href, iconId, text, contact) {
    var a = el("a", "btn " + className);
    a.href = href;
    a.appendChild(site.icon(iconId));
    a.appendChild(document.createTextNode(" " + text));
    if (contact) {
      a.setAttribute("data-contact", contact);
    }
    return a;
  }

  function render(key) {
    var item = data.emergencies[key];
    if (!item) {
      return;
    }
    choices.querySelectorAll(".choice").forEach(function (c) {
      var on = c.querySelector("input").value === key;
      c.classList.toggle("is-selected", on);
      c.querySelector("input").checked = on;
    });
    panel.className = "helper-panel is-" + key;
    empty.hidden = true;
    body.hidden = false;

    title.textContent = item.title;
    intro.textContent = item.intro;
    steps.textContent = "";
    item.steps.forEach(function (step) {
      var li = el("li", "helper-step");
      li.append(el("strong", "", step[0]), el("span", "", " " + step[1]));
      steps.appendChild(li);
    });
    note.textContent = item.note;

    actions.textContent = "";
    if (item.action === "gas") {
      actions.appendChild(button("btn-gas btn-lg", "tel:" + data.gasEmergency.link, "i-phone", "Call " + data.gasEmergency.phone));
      var after = el("p", "helper-after");
      after.appendChild(document.createTextNode("Free, 24 hours. Once the gas is safe, call us about any repairs on "));
      var us = el("a", "", data.phone);
      us.href = "tel:" + data.phoneLink;
      us.setAttribute("data-contact", "phone");
      after.appendChild(us);
      after.appendChild(document.createTextNode("."));
      actions.appendChild(after);
    } else if (item.action === "quote") {
      actions.appendChild(button("btn-dark", "quote.html?job=other", "i-camera", "Get a quote with photos"));
      actions.appendChild(button("btn-outline", "tel:" + data.phoneLink, "i-phone", "Not sure? Call " + data.phone, "phone"));
    } else {
      actions.appendChild(button("btn-signal btn-lg", "tel:" + data.phoneLink, "i-phone", "Call " + data.phone, "phone"));
      actions.appendChild(button("btn-outline", "https://wa.me/" + data.whatsapp, "i-chat", "WhatsApp us a photo", "whatsapp"));
    }

    // SVG elements have no .hidden property, so set the attribute itself.
    box.querySelectorAll("[data-figure]").forEach(function (fig) {
      fig.toggleAttribute("hidden", fig.getAttribute("data-figure") !== item.figure);
    });
    caption.textContent = CAPTIONS[item.figure] || "";

    if (window.history.replaceState) {
      window.history.replaceState(null, "", "#" + key);
    }
  }

  // After a link from the home page (emergency.html#gas), bring the question and the steps into view.
  function bringIntoView() {
    var target = document.getElementById("helper-title") || box;
    var top = target.getBoundingClientRect().top;
    if (top > window.innerHeight * 0.4 || top < 0) {
      target.scrollIntoView({ behavior: site.reducedMotion() ? "auto" : "smooth", block: "start" });
    }
  }

  choices.addEventListener("change", function (event) {
    if (event.target.name !== "emergency") {
      return;
    }
    render(event.target.value);
    // On a phone the steps sit under the choices: move to them.
    if (window.matchMedia("(max-width: 860px)").matches) {
      panel.scrollIntoView({ behavior: site.reducedMotion() ? "auto" : "smooth", block: "start" });
    }
  });

  function fromHash() {
    var key = (window.location.hash || "").replace("#", "");
    if (data.emergencies[key]) {
      render(key);
      return true;
    }
    return false;
  }

  if (fromHash()) {
    bringIntoView();
  }
  window.addEventListener("hashchange", function () {
    if (fromHash()) {
      bringIntoView();
    }
  });
})();
