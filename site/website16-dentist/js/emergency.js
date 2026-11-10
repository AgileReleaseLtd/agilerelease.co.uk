/* Emergency page: whether the emergency line is open now, today's held-back slots, the charges, and the
   "is it an emergency?" guide, all from data.js. Add ?now=2026-11-15T10:00 to see another moment. */
(function () {
  var data = window.Harebell;
  var clock = window.HarebellClock;

  var LEVELS = {
    "999": { tag: "Call 999 or go to A&E now", className: "level-999" },
    today: { tag: "Call us today", className: "level-today" },
    soon: { tag: "Book in the next few days", className: "level-soon" }
  };

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== undefined) {
      node.textContent = text;
    }
    return node;
  }

  function phoneButton(className, label, tel, contact) {
    var a = el("a", "btn " + className);
    a.href = "tel:" + tel;
    if (contact) {
      a.setAttribute("data-contact", "phone");
    }
    a.innerHTML = '<svg class="icon"><use href="#i-phone"/></svg>';
    a.appendChild(document.createTextNode(" " + label));
    return a;
  }

  // "Emergency line open now, until 5:30pm" / "Closed now. Opens tomorrow at 8am".
  function lineStatus() {
    var box = document.querySelector("[data-line-status]");
    if (!box) {
      return;
    }
    var state = clock.describe(data.emergencyLine, clock.now(), { open: "Open now", closed: "Closed now" });
    box.classList.remove("is-open", "is-closed", "is-soon");
    box.classList.add(state.open ? (state.soon ? "is-soon" : "is-open") : "is-closed");
    box.querySelector("[data-line-headline]").textContent = state.headline;
    box.querySelector("[data-line-detail]").textContent = state.open
      ? state.detail
      : (state.detail ? state.detail + ". Until then, call NHS 111." : "Call NHS 111.");
  }

  function slots() {
    var list = document.querySelector("[data-slots]");
    if (!list) {
      return;
    }
    var at = clock.now();
    var today = clock.slotsToday(at);
    var title = document.querySelector("[data-slots-title]");
    var none = document.querySelector("[data-slots-none]");
    var intro = document.querySelector("[data-slots-intro]");
    var weekday = (data.emergencySlots[1] || []).length;
    var saturday = (data.emergencySlots[6] || []).length;
    intro.textContent = "Every weekday we hold back " + weekday + " appointments for emergencies, and " + saturday + " on Saturday mornings.";
    title.textContent = "Held back today, " + clock.fmt.long.format(at);
    list.textContent = "";
    var left = today.filter(function (s) {
      return !s.past;
    });
    today.forEach(function (s) {
      var li = el("li", "slot-chip" + (s.past ? " is-past" : ""), s.label);
      if (s.past) {
        li.appendChild(el("span", "visually-hidden", " (gone)"));
      }
      list.appendChild(li);
    });
    list.hidden = !today.length;
    if (!left.length) {
      var line = clock.status(data.emergencyLine, at);
      var reason = clock.closedReason(at);
      var next = line.opens ? "The line opens " + clock.whenWords(line.opens.date, at) + " at " + clock.formatTime(line.opens.time) + "." : "";
      none.textContent = (reason ? "We are closed today (" + reason + "). " : today.length ? "Today's slots have all gone. " : "No emergency slots today: we are closed. ") +
        next + " For urgent help before then, call NHS 111.";
      none.hidden = false;
    } else {
      none.hidden = true;
    }
  }

  function charges() {
    var urgent = data.nhsBands.filter(function (b) {
      return b.id === "urgent";
    })[0];
    var urgentBox = document.querySelector("[data-urgent-price]");
    if (urgent && urgentBox) {
      urgentBox.textContent = urgent.price;
    }
    var privateBox = document.querySelector("[data-private-emergency]");
    data.privateFees.forEach(function (group) {
      group.items.forEach(function (item) {
        if (item[0] === "Emergency appointment" && privateBox) {
          privateBox.textContent = item[1];
        }
      });
    });
  }

  function triage() {
    var box = document.querySelector("[data-triage-choices]");
    var result = document.querySelector("[data-triage-result]");
    if (!box || !result) {
      return;
    }
    box.textContent = "";
    data.triage.forEach(function (item) {
      var label = el("label", "choice");
      var input = el("input");
      input.type = "radio";
      input.name = "problem";
      input.value = item.id;
      var text = el("span", "choice-text");
      text.appendChild(el("strong", "", item.label));
      label.append(input, text);
      box.appendChild(label);
    });

    var tag = result.querySelector(".level-tag");
    var title = result.querySelector("[data-triage-title]");
    var advice = result.querySelector("[data-triage-advice]");
    var actions = result.querySelector("[data-triage-actions]");

    function show(id) {
      var item = data.triage.filter(function (t) {
        return t.id === id;
      })[0];
      if (!item) {
        return;
      }
      var level = LEVELS[item.level];
      result.className = "triage-result " + level.className;
      tag.textContent = level.tag;
      title.textContent = item.label;
      advice.textContent = item.advice;
      actions.textContent = "";
      var at = clock.now();
      if (item.level === "999") {
        actions.appendChild(phoneButton("btn-alert", "Call 999", "999", false));
      } else if (item.level === "today") {
        var line = clock.status(data.emergencyLine, at);
        if (line.open) {
          advice.appendChild(document.createTextNode(" Our emergency line is open now: call and we will try to see you today."));
          actions.appendChild(phoneButton("btn-primary", "Call " + data.emergencyPhone, data.emergencyPhoneLink, true));
        } else {
          var when = line.opens ? " It opens " + clock.whenWords(line.opens.date, at) + " at " + clock.formatTime(line.opens.time) + "." : "";
          advice.appendChild(document.createTextNode(" Our emergency line is closed now." + when + " Until then, call NHS 111 for urgent dental care."));
          actions.appendChild(phoneButton("btn-primary", "Call NHS 111", "111", false));
        }
      } else {
        advice.appendChild(document.createTextNode(" Call reception to book, or send us a WhatsApp message."));
        actions.appendChild(phoneButton("btn-outline", "Call " + data.phone, data.phoneLink, true));
        var wa = el("a", "btn btn-ghost");
        wa.href = "https://wa.me/" + data.whatsapp;
        wa.setAttribute("data-contact", "whatsapp");
        wa.innerHTML = '<svg class="icon"><use href="#i-chat"/></svg>';
        wa.appendChild(document.createTextNode(" WhatsApp us"));
        actions.appendChild(wa);
      }
      if (window.history.replaceState) {
        var url = new URL(window.location.href);
        url.searchParams.set("problem", id);
        url.hash = "";
        window.history.replaceState(null, "", url);
      }
    }

    box.addEventListener("change", function (event) {
      if (event.target.name === "problem") {
        show(event.target.value);
      }
    });

    // On phones the guide sits under the list, so a tap brings it into view. Arrow keys do not (event.detail
    // is 0 for keyboard), so keyboard users stay in the list.
    box.addEventListener("click", function (event) {
      if (event.detail > 0 && event.target.closest(".choice") && window.matchMedia("(max-width: 960px)").matches) {
        window.setTimeout(function () {
          result.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        }, 50);
      }
    });

    // emergency.html?problem=toothache opens with that answer picked.
    var wanted = new URLSearchParams(window.location.search).get("problem");
    var input = wanted && box.querySelector('input[value="' + wanted.replace(/[^a-z0-9-]/g, "") + '"]');
    if (input) {
      input.checked = true;
      show(wanted);
    }
  }

  lineStatus();
  slots();
  charges();
  triage();
  window.setInterval(function () {
    lineStatus();
    slots();
  }, 60000);
})();
