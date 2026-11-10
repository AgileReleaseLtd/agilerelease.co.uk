/* The private dining page: the rooms with their capacities and minimum spends, the extras, and the group
   enquiry form. The enquiry becomes a WhatsApp message (or an email) written on the visitor's own device;
   nothing is sent to or stored by this website. */
(function () {
  var data = window.Jonjoli;
  var T = window.JonjoliTime;
  var UI = window.JonjoliUI;
  var el = UI.el;
  var money = UI.money;
  var PD = data.privateDining;
  var params = new URLSearchParams(window.location.search);

  var SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var ICONS = { longtable: "i-table", marani: "i-candle", whole: "i-door" };

  function space(id) {
    return PD.spaces.filter(function (s) {
      return s.id === id;
    })[0] || null;
  }

  function capacityText(s) {
    return "Seats " + s.seated[0] + " to " + s.seated[1] + (s.standing ? ", or " + s.standing + " standing" : "");
  }

  function fits(s, guests) {
    return guests >= s.seated[0] && guests <= Math.max(s.seated[1], s.standing || 0);
  }

  // Minimum spends grouped into runs of days, Monday first: [["Tue to Thu", "£700"], ...].
  function spendRuns(minSpend) {
    var order = [1, 2, 3, 4, 5, 6, 0];
    var runs = [];
    order.forEach(function (dow) {
      var v = minSpend[dow] === undefined ? "Closed" : money(minSpend[dow]);
      var last = runs[runs.length - 1];
      if (last && last.value === v) {
        last.to = dow;
      } else {
        runs.push({ from: dow, to: dow, value: v });
      }
    });
    return runs.map(function (r) {
      return [SHORT[r.from] + (r.to !== r.from ? " to " + SHORT[r.to] : ""), r.value];
    });
  }

  /* ---------- The rooms ---------- */

  function spaces() {
    var box = document.querySelector("[data-spaces]");
    if (!box) {
      return;
    }
    box.textContent = "";
    PD.spaces.forEach(function (s) {
      var card = el("article", "space");
      card.setAttribute("aria-labelledby", "space-" + s.id);
      var icon = el("span", "space-icon");
      icon.appendChild(UI.icon(ICONS[s.id] || "i-table"));
      card.appendChild(icon);
      card.appendChild(el("p", "space-where", s.where));
      var h = el("h3", "space-name", s.name);
      h.id = "space-" + s.id;
      card.appendChild(h);
      card.appendChild(el("p", "space-blurb", s.blurb));

      var stats = el("dl", "space-stats");
      [["Seated", s.seated[0] + " to " + s.seated[1]], ["Standing", s.standing ? "Up to " + s.standing : "Seated only"]].forEach(function (row) {
        var div = el("div");
        div.append(el("dt", "", row[0]), el("dd", "", row[1]));
        stats.appendChild(div);
      });
      card.appendChild(stats);

      var access = el("p", "space-access" + (s.stepFree ? "" : " is-stairs"));
      access.appendChild(UI.icon(s.stepFree ? "i-access" : "i-stairs"));
      access.appendChild(el("span", "", s.stepFree
        ? (s.id === "whole" ? "Step-free on the ground floor. The Marani is down fourteen stairs." : "Step-free, with the accessible toilet close by.")
        : "Down fourteen stairs with a handrail. There is no lift."));
      card.appendChild(access);

      var spend = el("div", "spend");
      spend.appendChild(el("h4", "", "Minimum spend"));
      if (s.minSpend) {
        var table = el("dl", "spend-table");
        spendRuns(s.minSpend).forEach(function (r) {
          var div = el("div");
          div.append(el("dt", "", r[0]), el("dd", "", r[1]));
          table.appendChild(div);
        });
        spend.appendChild(table);
      } else {
        spend.appendChild(el("p", "", s.spendNote));
      }
      card.appendChild(spend);
      box.appendChild(card);
    });
  }

  /* ---------- Extras ---------- */

  function extras() {
    var list = document.querySelector("[data-extras]");
    if (!list) {
      return;
    }
    list.textContent = "";
    PD.extras.forEach(function (x) {
      var li = el("li", "extra");
      var head = el("div", "extra-head");
      head.append(el("h3", "", x.name), el("span", "extra-price", x.price));
      li.append(head, el("p", "", x.blurb));
      list.appendChild(li);
    });
  }

  /* ---------- Enquiry form ---------- */

  function enquiry() {
    var form = document.querySelector("[data-enquiry-form]");
    if (!form) {
      return;
    }
    var f = form.elements;
    var spaceBox = form.querySelector("[data-space-options]");
    var menuBox = form.querySelector("[data-menu-options]");
    var extraBox = form.querySelector("[data-extra-options]");
    var spendLine = form.querySelector("[data-spend-line]");
    var dateHint = form.querySelector("[data-date-hint]");
    var errors = {};
    form.querySelectorAll("[data-error-for]").forEach(function (node) {
      errors[node.getAttribute("data-error-for")] = node;
    });

    var today = T.startOfDay(T.now());
    var minDate = T.addDays(today, 1);
    var maxDate = T.addMonths(today, PD.monthsAhead);
    f.date.min = T.isoDate(minDate);
    f.date.max = T.isoDate(maxDate);
    dateHint.textContent = "From tomorrow up to " + T.fmt.dayMonth.format(maxDate) + " " + maxDate.getFullYear() + ".";

    var wantedGuests = parseInt(params.get("guests"), 10);
    if (wantedGuests >= PD.minGuests && wantedGuests <= PD.maxGuests) {
      f.guests.value = String(wantedGuests);
    }

    // Spaces
    PD.spaces.forEach(function (s) {
      var label = el("label", "option");
      var input = el("input");
      input.type = "radio";
      input.name = "space";
      input.value = s.id;
      var span = el("span");
      span.appendChild(el("strong", "", s.name));
      span.appendChild(el("small", "", capacityText(s) + ". " + s.where + "."));
      label.append(input, span);
      spaceBox.appendChild(label);
    });

    // Extras
    PD.extras.forEach(function (x) {
      var label = el("label", "check");
      var input = el("input");
      input.type = "checkbox";
      input.name = "extra";
      input.value = x.id;
      var span = el("span", "", x.name);
      span.appendChild(el("small", "", x.price));
      label.append(input, span);
      extraBox.appendChild(label);
    });

    function guests() {
      var n = parseInt(f.guests.value, 10);
      return isNaN(n) ? 0 : n;
    }

    function chosenDate() {
      return T.parseIso(f.date.value);
    }

    function updateSpaces() {
      var n = guests();
      var current = f.space.value;
      var firstFit = "";
      spaceBox.querySelectorAll("input").forEach(function (input) {
        var ok = n >= PD.minGuests && fits(space(input.value), n);
        input.disabled = !ok && n >= PD.minGuests;
        if (ok && !firstFit) {
          firstFit = input.value;
        }
      });
      if (!current || !space(current) || (n >= PD.minGuests && !fits(space(current), n))) {
        spaceBox.querySelectorAll("input").forEach(function (input) {
          input.checked = input.value === firstFit;
        });
      }
    }

    function updateMenus() {
      var n = guests();
      var current = f.menu ? f.menu.value : (params.get("menu") || "");
      menuBox.textContent = "";
      var choices = data.feasts.map(function (feast) {
        return { id: feast.id, name: feast.name, sub: money(feast.price) + " a head" + (feast.vegan ? ", all vegan" : "") + (feast.id === "standing" ? ", " + feast.minGuests + " or more" : ""), min: feast.minGuests };
      });
      choices.push({ id: "advise", name: "Not sure yet", sub: "Suggest one for us", min: 0 });
      choices.forEach(function (c) {
        var label = el("label", "option");
        var input = el("input");
        input.type = "radio";
        input.name = "menu";
        input.value = c.id;
        input.disabled = n > 0 && n < c.min;
        input.checked = c.id === current && !input.disabled;
        var span = el("span");
        span.appendChild(el("strong", "", c.name));
        span.appendChild(document.createTextNode(c.sub));
        label.append(input, span);
        menuBox.appendChild(label);
      });
      if (!f.menu.value) {
        menuBox.querySelector('input[value="supra"]').checked = true;
      }
    }

    // Lunch only on days with a lunch service (or for whole-restaurant hire).
    function updateMeals() {
      var d = chosenDate();
      var lunch = f.meal[0];
      var hasLunch = true;
      if (d && f.space.value !== "whole") {
        hasLunch = (data.hours[d.getDay()] || []).some(function (p) {
          return T.minutes(p[0]) < 15 * 60;
        });
      }
      lunch.disabled = !hasLunch;
      if (!hasLunch && lunch.checked) {
        f.meal[1].checked = true;
      }
    }

    // A reason the date cannot work, or "".
    function dateProblem() {
      var d = chosenDate();
      if (!d) {
        return "Please choose a date.";
      }
      if (d < minDate || d > maxDate) {
        return "Please choose a date between tomorrow and " + T.fmt.long.format(maxDate) + ".";
      }
      var reason = T.closedReason(d);
      if (reason) {
        return "We are closed on " + reason + ". Please choose another date.";
      }
      var s = space(f.space.value);
      if (!(data.hours[d.getDay()] || []).length && !(s && s.mondays)) {
        return "We are closed on " + T.dayNames[d.getDay()] + "s, except for hire of the whole restaurant. Please choose another date.";
      }
      return "";
    }

    function updateSpend() {
      var d = chosenDate();
      var s = space(f.space.value);
      spendLine.textContent = "";
      if (!s || !d || dateProblem()) {
        spendLine.hidden = true;
        return;
      }
      spendLine.appendChild(UI.icon("i-info"));
      var text;
      if (!s.minSpend) {
        text = "No minimum spend at " + s.name.replace(/^The /, "the ") + ": the table orders one of our feast menus.";
      } else {
        text = "Minimum spend for " + s.name.replace(/^The /, "the ") + " on a " + T.dayNames[d.getDay()] + ": " + money(s.minSpend[d.getDay()]) + " for food and drink, before service.";
      }
      spendLine.appendChild(el("span", "", text));
      spendLine.hidden = false;
    }

    function clearError(name) {
      if (errors[name]) {
        errors[name].hidden = true;
      }
      if (f[name] && f[name].removeAttribute) {
        f[name].removeAttribute("aria-invalid");
      }
    }

    function setError(name, text) {
      if (text) {
        errors[name].textContent = text;
      }
      errors[name].hidden = false;
      if (f[name] && f[name].setAttribute) {
        f[name].setAttribute("aria-invalid", "true");
      }
    }

    function refresh() {
      updateSpaces();
      updateMenus();
      updateMeals();
      updateSpend();
    }

    f.guests.addEventListener("input", function () {
      clearError("guests");
      refresh();
    });
    f.date.addEventListener("change", function () {
      clearError("date");
      var d = chosenDate();
      var problem = d ? dateProblem() : "";
      if (problem) {
        setError("date", problem);
      } else if (d) {
        dateHint.textContent = "That is a " + T.dayNames[d.getDay()] + ".";
      }
      updateMeals();
      updateSpend();
    });
    spaceBox.addEventListener("change", function () {
      clearError("space");
      if (f.date.value) {
        clearError("date");
        var problem = dateProblem();
        if (problem) {
          setError("date", problem);
        }
      }
      updateMeals();
      updateSpend();
    });
    f.name.addEventListener("input", function () {
      if (f.name.value.trim()) {
        clearError("name");
      }
    });

    // Feast cards on this page: "Ask about ..." picks that feast in the form.
    document.addEventListener("click", function (event) {
      var link = event.target.closest('a[href^="?menu="]');
      if (!link) {
        return;
      }
      event.preventDefault();
      var id = new URLSearchParams(link.getAttribute("href").split("#")[0]).get("menu");
      var input = menuBox.querySelector('input[value="' + id + '"]');
      if (input && input.disabled) {
        var feast = data.feasts.filter(function (x) {
          return x.id === id;
        })[0];
        f.guests.value = String(Math.max(guests(), feast.minGuests));
        refresh();
        input = menuBox.querySelector('input[value="' + id + '"]');
      }
      if (input) {
        input.checked = true;
      }
      document.getElementById("enquire").scrollIntoView({ behavior: UI.reducedMotion() ? "auto" : "smooth", block: "start" });
      f.guests.focus({ preventScroll: true });
    });

    function message() {
      var s = space(f.space.value);
      var d = chosenDate();
      var feast = data.feasts.filter(function (x) {
        return x.id === f.menu.value;
      })[0];
      var lines = [
        "Hi Jonjoli, I'd like to ask about a group booking, please.",
        "",
        "Name: " + f.name.value.trim()
      ];
      if (f.company.value.trim()) {
        lines.push("Company: " + f.company.value.trim());
      }
      lines.push("Guests: " + guests());
      lines.push("Where: " + s.name);
      lines.push("Date: " + T.fmt.long.format(d) + " " + d.getFullYear() + (f.flexible.checked ? " (our dates are flexible)" : ""));
      lines.push("Meal: " + f.meal.value);
      lines.push("Feast: " + (feast ? feast.name + " (" + money(feast.price) + " a head)" : "Not sure yet, please suggest one"));
      var ex = Array.prototype.map.call(form.querySelectorAll('input[name="extra"]:checked'), function (i) {
        return PD.extras.filter(function (x) {
          return x.id === i.value;
        })[0].name;
      });
      if (ex.length) {
        lines.push("Extras: " + ex.join(", "));
      }
      if (f.occasion.value.trim()) {
        lines.push("Occasion: " + f.occasion.value.trim());
      }
      if (f.dietary.value.trim()) {
        lines.push("Dietary needs: " + f.dietary.value.trim());
      }
      if (f.note.value.trim()) {
        lines.push("Note: " + f.note.value.trim());
      }
      lines.push("", "Could you send me a quote, please?");
      return lines.join("\n");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var bad = null;
      var n = guests();
      if (n < PD.minGuests || n > PD.maxGuests) {
        setError("guests", n > 0 && n < PD.minGuests
          ? "For " + n + (n === 1 ? " person" : " people") + ", please book a table instead: tables are for 1 to " + data.booking.maxGuests + "."
          : "Please enter a number from " + PD.minGuests + " to " + PD.maxGuests + ".");
        bad = bad || f.guests;
      }
      var problem = dateProblem();
      if (problem) {
        setError("date", problem);
        bad = bad || f.date;
      }
      if (!f.space.value) {
        setError("space");
        bad = bad || spaceBox.querySelector("input:not(:disabled)");
      }
      if (!f.name.value.trim()) {
        setError("name");
        bad = bad || f.name;
      }
      if (bad) {
        bad.focus();
        return;
      }
      var d = chosenDate();
      UI.send({
        text: message(),
        channel: event.submitter && event.submitter.value === "email" ? "email" : "whatsapp",
        email: data.eventsEmail,
        title: "Your group enquiry",
        subject: "Group enquiry: " + guests() + " guests, " + T.fmt.long.format(d),
        confirmNote: "Jonjoli replies within a day with a quote and holds the date for three days. Nothing is booked until you pay the deposit."
      });
    });

    refresh();
  }

  spaces();
  extras();
  enquiry();
})();
