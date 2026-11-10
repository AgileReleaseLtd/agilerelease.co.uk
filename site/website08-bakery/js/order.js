/* The celebration cakes page: the sizes and the menu from data.js, and the order form. The form shows a
   live drawing of the cake and a price estimate, keeps to the notice each size needs and the days the
   shop is closed, and ends in a WhatsApp message (or an email) written on the visitor's own device.
   Nothing is sent to or stored by this website. */
(function () {
  var data = window.Crumb;
  var T = window.CrumbTime;
  var Art = window.CrumbArt;
  var U = window.CrumbSite;
  if (!U || !Art) {
    return;
  }
  var C = data.cake;
  var el = U.el;
  var money = U.money;

  function byId(list, id) {
    return list.filter(function (x) {
      return x.id === id;
    })[0] || null;
  }

  // An extra priced for a 6 inch cake, at the chosen size.
  function scaled(extra, size) {
    return Math.round(extra * size.scale);
  }

  /* ---------- Sizes and menu (above the form) ---------- */

  function renderSizes() {
    var box = document.querySelector("[data-sizes]");
    if (!box) {
      return;
    }
    box.textContent = "";
    C.sizes.forEach(function (s, i) {
      var li = el("li", "size-card");
      var art = el("div", "size-art");
      art.innerHTML = Art.svg({ tiers: s.tiers, size: s.id, frosting: ["pink", "cream", "lemon", "pistachio", "white"][i], beads: true, seed: 20 + i });
      li.appendChild(art);
      li.appendChild(el("h3", "size-name", s.label));
      li.appendChild(el("p", "size-serves", "Serves " + s.serves));
      var foot = el("div", "size-foot");
      foot.appendChild(el("p", "size-price", money(s.price)));
      foot.appendChild(el("p", "size-lead", s.lead + " days' notice"));
      li.appendChild(foot);
      var pick = el("a", "size-pick", "Choose this size");
      pick.href = "#step-size";
      pick.setAttribute("aria-label", "Choose " + s.label + " in the order form");
      pick.addEventListener("click", function (event) {
        var input = form && form.querySelector('input[name="size"][value="' + s.id + '"]');
        if (input) {
          event.preventDefault();
          input.checked = true;
          input.dispatchEvent(new Event("change", { bubbles: true }));
          document.getElementById("step-size").scrollIntoView({ behavior: smooth(), block: "start" });
          input.focus({ preventScroll: true });
        }
      });
      li.appendChild(pick);
      box.appendChild(li);
    });
  }

  function renderMenu() {
    var lists = {
      flavours: C.flavours,
      fillings: C.fillings,
      finishes: C.finishes
    };
    Object.keys(lists).forEach(function (key) {
      var ul = document.querySelector('[data-menu="' + key + '"]');
      if (!ul) {
        return;
      }
      ul.textContent = "";
      lists[key].forEach(function (item) {
        var li = el("li");
        var top = el("div", "menu-top");
        top.appendChild(el("span", "menu-name", item.label));
        top.appendChild(el("span", "menu-price", item.extra ? "+" + money(item.extra) : "Included"));
        li.appendChild(top);
        var notes = [];
        if (item.hint) {
          notes.push(item.hint);
        }
        if (item.nuts) {
          notes.push("Contains nuts");
        }
        if (item.notFor) {
          notes.push("Not " + item.notFor.map(dietWord).join(" or "));
        }
        if (notes.length) {
          li.appendChild(el("span", "menu-note", notes.join(". ") + "."));
        }
        ul.appendChild(li);
      });
    });
  }

  function dietWord(id) {
    return { eggless: "eggless", vegan: "vegan", gf: "without gluten" }[id] || id;
  }

  function smooth() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  }

  renderSizes();
  renderMenu();

  // On phones the full menu starts folded away: the order form lists the same choices with prices.
  var menuDetails = document.querySelector("[data-menu-details]");
  if (menuDetails && window.matchMedia("(max-width: 640px)").matches) {
    menuDetails.open = false;
  }

  /* ---------- The form ---------- */

  var form = document.querySelector("[data-order]");
  if (!form) {
    return;
  }
  var dialog = document.getElementById("order-dialog");
  var preview = form.querySelector("[data-preview]");
  var summary = form.querySelector("[data-summary]");
  var totalEl = form.querySelector("[data-total]");
  var depositEl = form.querySelector("[data-deposit]");
  var errorsBox = form.querySelector("[data-errors]");
  var leadNote = form.querySelector("[data-lead-note] span");
  var dietChange = form.querySelector("[data-diet-change]");
  var numbersField = form.querySelector("[data-numbers-field]");
  var wordingCount = form.querySelector("[data-wording-count]");
  var bar = document.querySelector("[data-estimate-bar]");
  var barTotal = document.querySelector("[data-bar-total]");

  var today = T.today();
  var lastDay = T.addDays(today, C.maxDaysAhead);
  var state = { date: null, month: null, focus: null };

  // A radio or checkbox "card": <label><input><span class="choice-body">...</span></label>
  function choice(type, name, item, opts) {
    opts = opts || {};
    var label = el("label", "choice" + (opts.chip ? " choice-chip" : ""));
    var input = el("input");
    input.type = type;
    input.name = name;
    input.value = item.id;
    if (opts.checked) {
      input.checked = true;
    }
    label.appendChild(input);
    var body = el("span", "choice-body");
    if (opts.tiers) {
      var icon = el("span", "tier-icon tier-icon-" + item.id);
      icon.setAttribute("aria-hidden", "true");
      for (var i = 0; i < item.tiers; i++) {
        icon.appendChild(el("i"));
      }
      body.appendChild(icon);
    }
    var text = el("span", "choice-text");
    text.appendChild(el("span", "choice-label", opts.label || item.label));
    if (opts.meta) {
      text.appendChild(el("span", "choice-meta", opts.meta));
    }
    var why = el("span", "choice-why");
    why.hidden = true;
    text.appendChild(why);
    body.appendChild(text);
    if (!opts.chip) {
      body.appendChild(el("span", "choice-price"));
    }
    label.appendChild(body);
    return label;
  }

  function fill(group, nodes) {
    var box = form.querySelector('[data-choices="' + group + '"]');
    box.textContent = "";
    nodes.forEach(function (n) {
      box.appendChild(n);
    });
    return box;
  }

  fill("occasion", C.occasions.map(function (o) {
    return choice("radio", "occasion", o, { chip: true });
  }));
  fill("size", C.sizes.map(function (s, i) {
    return choice("radio", "size", s, { checked: s.id === "8in", tiers: true, meta: "Serves " + s.serves + (s.lead > 5 ? ". " + s.lead + " days' notice" : "") });
  }));
  fill("diet", C.diets.map(function (d, i) {
    return choice("radio", "diet", d, { checked: i === 0, meta: d.hint });
  }));
  fill("flavour", C.flavours.map(function (f, i) {
    return choice("radio", "flavour", f, { checked: i === 0, meta: f.nuts ? "Contains nuts" : "" });
  }));
  fill("filling", C.fillings.map(function (f, i) {
    return choice("radio", "filling", f, { checked: i === 0 });
  }));
  fill("finish", C.finishes.map(function (f, i) {
    return choice("radio", "finish", f, { checked: i === 0, meta: f.hint });
  }));
  fill("extras", C.extras.map(function (x) {
    return choice("checkbox", "extras", x);
  }));

  function value(name) {
    var input = form.querySelector('input[name="' + name + '"]:checked');
    return input ? input.value : "";
  }

  function current() {
    var extras = [];
    form.querySelectorAll('input[name="extras"]:checked').forEach(function (input) {
      extras.push(byId(C.extras, input.value));
    });
    return {
      occasion: byId(C.occasions, value("occasion")),
      size: byId(C.sizes, value("size")) || C.sizes[1],
      diet: byId(C.diets, value("diet")) || C.diets[0],
      flavour: byId(C.flavours, value("flavour")),
      filling: byId(C.fillings, value("filling")),
      finish: byId(C.finishes, value("finish")) || C.finishes[0],
      extras: extras,
      numbers: form.elements.numbers.value.replace(/[^0-9]/g, "").slice(0, 3),
      wording: form.elements.wording.value.replace(/\s+/g, " ").trim(),
      photo: form.elements.photo.checked,
      slot: value("slot"),
      name: form.elements.name.value.trim(),
      phone: form.elements.phone.value.trim(),
      notes: form.elements.notes.value.trim()
    };
  }

  // The price, line by line: [[label, amount, isExtra]].
  function priceLines(o) {
    var lines = [[o.size.label, o.size.price, false]];
    if (o.flavour && o.flavour.extra) {
      lines.push([o.flavour.label + " sponge", scaled(o.flavour.extra, o.size), true]);
    }
    if (o.filling && o.filling.extra) {
      lines.push([o.filling.label, scaled(o.filling.extra, o.size), true]);
    }
    if (o.diet.extra) {
      lines.push([o.diet.label, scaled(o.diet.extra, o.size), true]);
    }
    if (o.finish.extra) {
      lines.push([o.finish.label, scaled(o.finish.extra, o.size), true]);
    }
    o.extras.forEach(function (x) {
      lines.push([x.label, x.price, true]);
    });
    return lines;
  }

  function totals(o) {
    var total = priceLines(o).reduce(function (sum, l) {
      return sum + l[1];
    }, 0);
    return { total: total, deposit: Math.ceil(total * C.deposit) };
  }

  /* ---------- Prices on the choices, and what the diet rules out ---------- */

  function updateChoices() {
    var o = current();
    var groups = { flavour: C.flavours, filling: C.fillings, diet: C.diets, finish: C.finishes };
    Object.keys(groups).forEach(function (name) {
      groups[name].forEach(function (item) {
        var input = form.querySelector('input[name="' + name + '"][value="' + item.id + '"]');
        var price = input.parentNode.querySelector(".choice-price");
        var amount = scaled(item.extra, o.size);
        price.textContent = amount ? "+" + money(amount) : "";
      });
    });
    C.sizes.forEach(function (s) {
      form.querySelector('input[name="size"][value="' + s.id + '"]').parentNode.querySelector(".choice-price").textContent = money(s.price);
    });
    C.extras.forEach(function (x) {
      form.querySelector('input[name="extras"][value="' + x.id + '"]').parentNode.querySelector(".choice-price").textContent = "+" + money(x.price);
    });
  }

  // Grey out sponges and fillings the chosen diet rules out, and move off one that was chosen.
  function applyDiet() {
    var diet = value("diet");
    var moved = [];
    [["flavour", C.flavours, "sponge"], ["filling", C.fillings, "filling"]].forEach(function (g) {
      g[1].forEach(function (item) {
        var input = form.querySelector('input[name="' + g[0] + '"][value="' + item.id + '"]');
        var no = !!(item.notFor && item.notFor.indexOf(diet) !== -1);
        input.disabled = no;
        input.parentNode.classList.toggle("is-off", no);
        var why = input.parentNode.querySelector(".choice-why");
        why.hidden = !no;
        why.textContent = no ? "Not available " + dietWord(diet) : "";
        if (no && input.checked) {
          input.checked = false;
          var first = form.querySelector('input[name="' + g[0] + '"]:not(:disabled)');
          first.checked = true;
          moved.push(item.label + " cannot be made " + dietWord(diet) + ", so we have changed your " + g[2] + " to " + byId(g[1], first.value).label + ".");
        }
      });
    });
    if (moved.length) {
      dietChange.textContent = moved.join(" ") + " Choose another if you like.";
      dietChange.hidden = false;
    } else if (dietChange.textContent && !dietChange.hidden) {
      dietChange.hidden = true;
      dietChange.textContent = "";
    }
  }

  /* ---------- Collection calendar ---------- */

  var cal = form.querySelector("[data-cal]");
  var calDays = form.querySelector("[data-cal-days]");
  var calTitle = form.querySelector("[data-cal-title]");
  var prevBtn = form.querySelector("[data-cal-prev]");
  var nextBtn = form.querySelector("[data-cal-next]");
  var dateError = form.querySelector('[data-error="date"]');
  var slotsWrap = form.querySelector("[data-slots-wrap]");
  var slotsEmpty = form.querySelector("[data-slots-empty]");
  var slotsTitle = form.querySelector("[data-slots-title]");

  function lead() {
    return current().size.lead;
  }

  function monthStart(d) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  function renderCalendar(focusIt) {
    var m = state.month;
    var problemFor = function (d) {
      return T.collectionProblem(d, lead(), today);
    };
    calTitle.textContent = T.fmt.month.format(m);
    prevBtn.disabled = monthStart(m) <= monthStart(today);
    nextBtn.disabled = new Date(m.getFullYear(), m.getMonth() + 1, 1) > lastDay;
    calDays.textContent = "";
    var blanks = (m.getDay() + 6) % 7;
    for (var b = 0; b < blanks; b++) {
      var gap = el("span", "cal-gap");
      gap.setAttribute("aria-hidden", "true");
      calDays.appendChild(gap);
    }
    // Which day takes keyboard focus: the remembered one, the chosen one, or the first that can be picked.
    var focusDay = state.focus && state.focus.getMonth() === m.getMonth() && state.focus.getFullYear() === m.getFullYear() ? state.focus : null;
    if (!focusDay && state.date && state.date.getMonth() === m.getMonth() && state.date.getFullYear() === m.getFullYear()) {
      focusDay = state.date;
    }
    var daysIn = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
    if (!focusDay) {
      for (var f = 1; f <= daysIn; f++) {
        var cand = new Date(m.getFullYear(), m.getMonth(), f);
        if (!problemFor(cand)) {
          focusDay = cand;
          break;
        }
      }
    }
    if (!focusDay) {
      focusDay = new Date(m.getFullYear(), m.getMonth(), 1);
    }
    state.focus = focusDay;
    for (var day = 1; day <= daysIn; day++) {
      var d = new Date(m.getFullYear(), m.getMonth(), day);
      var problem = problemFor(d);
      var btn = el("button", "cal-day");
      btn.type = "button";
      btn.setAttribute("data-date", T.isoDate(d));
      btn.appendChild(el("span", "", String(day)));
      var label = T.fmt.long.format(d);
      var picked = state.date && T.sameDay(d, state.date);
      if (problem) {
        btn.setAttribute("aria-disabled", "true");
        var past = problem === "in the past" || problem.indexOf("too soon") === 0 || problem.indexOf("too far") === 0;
        btn.classList.add(past ? "is-out" : "is-closed");
        label += ", not available: " + problem;
      } else {
        btn.classList.add("is-open");
      }
      if (T.sameDay(d, today)) {
        btn.classList.add("is-today");
        label = "Today, " + label;
      }
      btn.setAttribute("aria-pressed", picked ? "true" : "false");
      btn.setAttribute("aria-label", label);
      btn.tabIndex = T.sameDay(d, focusDay) ? 0 : -1;
      calDays.appendChild(btn);
    }
    if (focusIt) {
      var target = calDays.querySelector('[data-date="' + T.isoDate(focusDay) + '"]');
      if (target) {
        target.focus();
      }
    }
  }

  function goMonth(delta, focusIt) {
    var m = new Date(state.month.getFullYear(), state.month.getMonth() + delta, 1);
    if (m < monthStart(today) || m > lastDay) {
      return;
    }
    state.month = m;
    state.focus = null;
    renderCalendar(focusIt);
  }

  prevBtn.addEventListener("click", function () {
    goMonth(-1);
  });
  nextBtn.addEventListener("click", function () {
    goMonth(1);
  });

  function pickDate(d) {
    var problem = T.collectionProblem(d, lead(), today);
    if (problem) {
      dateError.textContent = T.fmt.long.format(d) + " is not available: " + problem + ".";
      dateError.hidden = false;
      return;
    }
    state.date = d;
    state.focus = d;
    dateError.hidden = true;
    renderCalendar(true);
    renderSlots();
    update();
  }

  calDays.addEventListener("click", function (event) {
    var b = event.target.closest(".cal-day");
    if (b) {
      pickDate(T.parseIso(b.getAttribute("data-date")));
    }
  });

  // Arrow keys move a day or a week, Home and End go to the start or end of the week, Page Up and Page
  // Down change month. Enter or Space picks the day.
  calDays.addEventListener("keydown", function (event) {
    var b = event.target.closest(".cal-day");
    if (!b) {
      return;
    }
    var d = T.parseIso(b.getAttribute("data-date"));
    var moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    var target = null;
    if (moves[event.key]) {
      target = T.addDays(d, moves[event.key]);
    } else if (event.key === "Home") {
      target = T.addDays(d, -((d.getDay() + 6) % 7));
    } else if (event.key === "End") {
      target = T.addDays(d, 6 - ((d.getDay() + 6) % 7));
    } else if (event.key === "PageUp" || event.key === "PageDown") {
      var delta = event.key === "PageUp" ? -1 : 1;
      target = new Date(d.getFullYear(), d.getMonth() + delta, Math.min(d.getDate(), 28));
    }
    if (!target) {
      return;
    }
    event.preventDefault();
    if (target < today) {
      target = today;
    }
    if (target > lastDay) {
      target = lastDay;
    }
    state.focus = target;
    if (target.getMonth() !== state.month.getMonth() || target.getFullYear() !== state.month.getFullYear()) {
      state.month = monthStart(target);
    }
    renderCalendar(true);
  });

  function renderSlots() {
    var box = form.querySelector('[data-choices="slot"]');
    var keep = value("slot");
    box.textContent = "";
    if (!state.date) {
      slotsWrap.hidden = true;
      slotsEmpty.hidden = false;
      return;
    }
    slotsEmpty.hidden = true;
    var slots = T.slotsOn(state.date);
    slotsTitle.textContent = "Collection time on " + T.fmt.long.format(state.date);
    slots.forEach(function (s) {
      var id = s[0] + "-" + s[1];
      box.appendChild(choice("radio", "slot", { id: id, label: T.rangeLabel(s) }, { chip: true, checked: id === keep || slots.length === 1 }));
    });
    slotsWrap.hidden = false;
  }

  // The notice the size needs, and what that means for the chosen day.
  function applyLead(announce) {
    var o = current();
    var earliest = T.earliestCollection(o.size.lead, today);
    leadNote.textContent = (o.size.tiers > 1 ? "Tiered cakes need " : "We need ") + o.size.lead + " days' notice" + (o.size.tiers > 1 ? "" : " for this size") + ". The earliest collection is " + T.fmt.long.format(earliest) + ". Closed on Mondays.";
    if (state.date && T.collectionProblem(state.date, o.size.lead, today)) {
      var was = T.fmt.long.format(state.date);
      state.date = null;
      state.focus = earliest;
      state.month = monthStart(earliest);
      renderSlots();
      if (announce) {
        dateError.textContent = o.size.label + " needs " + o.size.lead + " days' notice, so " + was + " is too soon. Please choose another day: the earliest is " + T.fmt.long.format(earliest) + ".";
        dateError.hidden = false;
      }
    }
    if (!state.month) {
      state.month = monthStart(earliest);
    }
    renderCalendar(false);
  }

  /* ---------- Preview, summary and estimate ---------- */

  var DRIP = { vanilla: "raspberry", chocolate: "chocolate", lemon: "white", redvelvet: "raspberry", carrot: "caramel", pistachio: "raspberry" };

  function artFor(o) {
    var flavour = o.flavour || C.flavours[0];
    var opts = { tiers: o.size.tiers, size: o.size.id, frosting: flavour.colour, seed: 5, wording: true, fit: "height" };
    var f = o.finish.id;
    if (f === "drip") {
      opts.drip = DRIP[flavour.id] || "raspberry";
      opts.sprinkles = true;
    } else if (f === "naked") {
      opts.naked = true;
      opts.berries = true;
    } else if (f === "piped") {
      opts.rosettes = flavour.id === "lemon" ? "daisy" : "rose";
      opts.beads = true;
    } else if (f === "fresh") {
      opts.flowers = true;
      opts.beads = true;
    } else {
      opts.beads = true;
      opts.topBeads = true;
    }
    o.extras.forEach(function (x) {
      if (x.id === "candles") {
        opts.candles = o.size.tiers > 1 ? 3 : 5;
      } else if (x.id === "numbers" && o.numbers) {
        opts.numbers = o.numbers;
      } else if (x.id === "cupcakes") {
        opts.cupcakes = true;
      }
    });
    return opts;
  }

  // One line of the summary: what was chosen, and what it adds to the price.
  function row(dl, term, desc, opts) {
    opts = opts || {};
    var div = el("div", opts.empty ? "is-empty" : "");
    div.appendChild(el("dt", "", term));
    var dd = el("dd");
    dd.appendChild(el("span", "", desc));
    if (opts.price) {
      dd.appendChild(el("span", "sum-price", (opts.plus ? "+" : "") + money(opts.price)));
    }
    div.appendChild(dd);
    dl.appendChild(div);
  }

  function collectionText(o) {
    if (!state.date) {
      return "";
    }
    var slot = o.slot ? o.slot.split("-") : null;
    return T.fmt.long.format(state.date) + (slot ? ", " + T.rangeLabel(slot) : "");
  }

  function update() {
    var o = current();
    var t = totals(o);

    preview.innerHTML = Art.svg(artFor(o));
    Art.setWording(preview.querySelector("svg"), o.wording);

    summary.textContent = "";
    var extra = function (item) {
      return item && item.extra ? scaled(item.extra, o.size) : 0;
    };
    row(summary, "Occasion", o.occasion ? o.occasion.label : "Not chosen yet", { empty: !o.occasion });
    row(summary, "Size", o.size.label + ", serves " + o.size.serves, { price: o.size.price });
    row(summary, "Sponge", o.flavour ? o.flavour.label : "Not chosen yet", { empty: !o.flavour, price: extra(o.flavour), plus: true });
    row(summary, "Filling", o.filling ? o.filling.label : "Not chosen yet", { empty: !o.filling, price: extra(o.filling), plus: true });
    if (o.diet.id !== "none") {
      row(summary, "Diet", o.diet.label, { price: extra(o.diet), plus: true });
    }
    row(summary, "Finish", o.finish.label, { price: extra(o.finish), plus: true });
    if (o.extras.length) {
      row(summary, "Extras", o.extras.map(function (x) {
        return x.id === "numbers" && o.numbers ? x.label + " (" + o.numbers + ")" : x.label;
      }).join(", "), { price: o.extras.reduce(function (sum, x) {
        return sum + x.price;
      }, 0), plus: true });
    }
    row(summary, "Wording", o.wording ? "“" + o.wording + "”" : "None");
    row(summary, "Collection", collectionText(o) || "Not chosen yet", { empty: !collectionText(o) || !o.slot });

    // Once the visitor has tried to send, keep the list of what is missing up to date.
    if (!errorsBox.hidden) {
      showProblems(problems(o));
    }
    totalEl.textContent = money(t.total);
    depositEl.textContent = money(t.deposit);
    if (barTotal) {
      barTotal.textContent = money(t.total);
    }

    numbersField.hidden = !o.extras.some(function (x) {
      return x.id === "numbers";
    });
    var n = form.elements.wording.value.length;
    wordingCount.textContent = n ? n + " of " + C.wordingMax + " characters." : "Up to " + C.wordingMax + " characters.";
  }

  form.addEventListener("change", function (event) {
    var name = event.target.name;
    if (name === "size") {
      applyLead(true);
    }
    if (name === "diet") {
      applyDiet();
    }
    if (name === "size" || name === "diet") {
      updateChoices();
    }
    if (name && form.querySelector('[data-error="' + name + '"]')) {
      form.querySelector('[data-error="' + name + '"]').hidden = true;
    }
    update();
  });

  form.addEventListener("input", function (event) {
    if (event.target.name === "name" && event.target.value.trim()) {
      form.querySelector('[data-error="name"]').hidden = true;
      event.target.removeAttribute("aria-invalid");
      if (!errorsBox.hidden) {
        showProblems(problems(current()));
      }
    }
    if (event.target.name === "wording" || event.target.name === "numbers") {
      update();
    }
  });

  /* ---------- Sending ---------- */

  function problems(o) {
    var list = [];
    if (!o.occasion) {
      list.push(["occasion", "step-occasion", "Choose the occasion"]);
    }
    if (!state.date) {
      list.push(["date", "step-collect", "Choose a collection day"]);
    } else if (!o.slot) {
      list.push(["slot", "step-collect", "Choose a collection time"]);
    }
    if (!o.name) {
      list.push(["name", "step-details", "Add your name"]);
    }
    return list;
  }

  function showProblems(list) {
    form.querySelectorAll("[data-error]").forEach(function (e) {
      if (e.getAttribute("data-error") !== "date" || !list.length) {
        e.hidden = true;
      }
    });
    errorsBox.textContent = "";
    if (!list.length) {
      errorsBox.hidden = true;
      return;
    }
    errorsBox.appendChild(el("p", "error-title", list.length === 1 ? "One thing to do before sending:" : list.length + " things to do before sending:"));
    var ul = el("ul");
    list.forEach(function (p) {
      var err = form.querySelector('[data-error="' + p[0] + '"]');
      if (err) {
        if (p[0] === "date") {
          err.textContent = "Please choose a collection day.";
        }
        err.hidden = false;
      }
      var li = el("li");
      var a = el("a", "", p[2]);
      a.href = "#" + (p[0] === "name" ? "order-name" : p[1]);
      a.addEventListener("click", function (event) {
        event.preventDefault();
        var target = p[0] === "name" ? form.elements.name : document.getElementById(p[1]);
        target.scrollIntoView({ behavior: smooth(), block: "center" });
        if (p[0] === "name") {
          target.focus({ preventScroll: true });
        } else {
          var focusable = target.querySelector('input:not(:disabled), button[tabindex="0"]');
          if (focusable) {
            focusable.focus({ preventScroll: true });
          }
        }
      });
      li.appendChild(a);
      ul.appendChild(li);
    });
    errorsBox.appendChild(ul);
    errorsBox.hidden = false;
    var nameMissing = list.some(function (p) {
      return p[0] === "name";
    });
    if (nameMissing) {
      form.elements.name.setAttribute("aria-invalid", "true");
    } else {
      form.elements.name.removeAttribute("aria-invalid");
    }
  }

  var fromGallery = null;

  function message(o) {
    var t = totals(o);
    var slot = o.slot.split("-");
    var lines = [
      "Hi Crumb & Candle, I'd like to order a cake.",
      "",
      "Occasion: " + o.occasion.label,
      "Collection: " + T.fmt.long.format(state.date) + ", " + T.rangeLabel(slot),
      "Size: " + o.size.label + " (serves " + o.size.serves + ")",
      "Sponge: " + o.flavour.label,
      "Filling: " + o.filling.label
    ];
    if (o.diet.id !== "none") {
      lines.push("Dietary: " + o.diet.label);
    }
    lines.push("Finish: " + o.finish.label);
    if (o.extras.length) {
      lines.push("Extras: " + o.extras.map(function (x) {
        return x.id === "numbers" && o.numbers ? x.label + " (" + o.numbers + ")" : x.label;
      }).join(", "));
    }
    lines.push("Wording: " + (o.wording ? "“" + o.wording + "”" : "none"));
    if (fromGallery) {
      lines.push("Like the cake in your gallery: " + fromGallery.title);
    }
    if (o.photo) {
      lines.push("Reference photo: I'll send it in this chat next.");
    }
    lines.push("Website estimate: " + money(t.total) + " (deposit " + money(t.deposit) + ")");
    lines.push("");
    lines.push("Name: " + o.name);
    if (o.phone) {
      lines.push("Phone: " + o.phone);
    }
    if (o.notes) {
      lines.push("Notes: " + o.notes);
    }
    lines.push("");
    lines.push("Please confirm the price and send the deposit link.");
    return lines.join("\n");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var via = event.submitter && event.submitter.value === "email" ? "email" : "whatsapp";
    var o = current();
    var list = problems(o);
    showProblems(list);
    if (list.length) {
      errorsBox.focus();
      return;
    }
    var text = message(o);
    var subject = "Cake order: " + o.occasion.label + ", " + T.fmt.short.format(state.date);

    if (data.sample && dialog && typeof dialog.showModal === "function") {
      dialog.querySelector("[data-message]").textContent = text;
      dialog.querySelector("[data-sent-to]").textContent = via === "email" ? "To " + data.email + " (" + subject + ")" : "To Crumb & Candle on WhatsApp";
      dialog.querySelector("[data-sent-how]").textContent = via === "email"
        ? "On the bakery's real website, this button opens your email app with the order above ready to send."
        : "On the bakery's real website, this button opens WhatsApp with the message above ready to send.";
      dialog.querySelector("[data-sent-photo]").hidden = !o.photo;
      dialog.querySelector("[data-sent-photo]").textContent = via === "email" ? "Attach your reference photo to the email, or send it on WhatsApp." : "Attach your reference photo in the same chat.";
      dialog.showModal();
      dialog.querySelector("#sent-title").focus();
      return;
    }

    var url = via === "email"
      ? "mailto:" + data.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text)
      : "https://wa.me/" + data.whatsapp + "?text=" + encodeURIComponent(text);
    if (via === "email") {
      window.location.href = url;
      return;
    }
    var opened = window.open(url, "_blank");
    if (opened) {
      opened.opener = null;
    } else {
      window.location.href = url;
    }
  });

  if (dialog) {
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
  }

  /* ---------- The estimate bar on phones ---------- */

  function estimateBar() {
    if (!bar || !("IntersectionObserver" in window)) {
      return;
    }
    var card = form.querySelector(".summary-card");
    var formVisible = false;
    var cardVisible = false;
    var narrow = window.matchMedia("(max-width: 1040px)");
    function set() {
      var on = narrow.matches && formVisible && !cardVisible;
      bar.hidden = !on;
      document.body.classList.toggle("has-estimate-bar", on);
    }
    new IntersectionObserver(function (entries) {
      formVisible = entries[0].isIntersecting;
      set();
    }).observe(form.querySelector(".order-steps"));
    new IntersectionObserver(function (entries) {
      cardVisible = entries[0].isIntersecting;
      set();
    }, { threshold: 0.15 }).observe(card);
    narrow.addEventListener("change", set);
  }

  /* ---------- Start ---------- */

  // Links from the gallery and the home page can choose the occasion, size, flavour, filling and finish.
  var params = new URLSearchParams(window.location.search);
  ["occasion", "size", "flavour", "filling", "finish"].forEach(function (name) {
    var v = params.get(name);
    var input = v && form.querySelector('input[name="' + name + '"][value="' + v.replace(/[^a-z0-9]/gi, "") + '"]');
    if (input) {
      input.checked = true;
    }
  });
  var fromId = params.get("from");
  fromGallery = fromId ? byId(data.gallery, fromId) : null;
  var note = document.querySelector("[data-from-gallery]");
  if (fromGallery && note) {
    note.textContent = "";
    note.appendChild(U.icon("i-sparkle"));
    var span = el("span");
    span.appendChild(document.createTextNode("Starting from "));
    span.appendChild(el("strong", "", fromGallery.title));
    span.appendChild(document.createTextNode(" in the gallery. Change anything you like."));
    note.appendChild(span);
    note.hidden = false;
  }

  applyDiet();
  updateChoices();
  applyLead(false);
  update();
  estimateBar();
})();
