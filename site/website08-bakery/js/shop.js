/* The shop page: bake times for any day of the week, the everyday range with an allergen filter, the
   14 allergens, and the cake collection slots. */
(function () {
  var data = window.Crumb;
  var T = window.CrumbTime;
  var U = window.CrumbSite;
  if (!U) {
    return;
  }
  var el = U.el;
  var AL = { gluten: "G", eggs: "E", milk: "M", nuts: "N" };
  var AL_NAME = { gluten: "Gluten", eggs: "Eggs", milk: "Milk", nuts: "Nuts" };

  bakeTimes();
  range();
  allergens();
  slotsTable();

  /* ---------- Bake times ---------- */

  function bakeTimes() {
    var picker = document.querySelector("[data-bake-days]");
    var list = document.querySelector("[data-bake-list]");
    var title = document.querySelector("[data-bake-title]");
    if (!picker || !list) {
      return;
    }
    var now = T.now();
    var today = T.today();
    // The next seven days, starting today, so a holiday this week shows as closed.
    var days = [];
    for (var i = 0; i < 7; i++) {
      days.push(T.addDays(today, i));
    }
    var start = T.bakeDay(now).date;

    days.forEach(function (d) {
      var b = el("button", "day-chip");
      b.type = "button";
      b.setAttribute("data-day", T.isoDate(d));
      var rel = T.daysBetween(today, d);
      b.appendChild(el("span", "day-chip-name", rel === 0 ? "Today" : T.fmt.weekdayShort.format(d)));
      b.appendChild(el("span", "day-chip-date", T.fmt.dayShort.format(d)));
      if (!T.hoursOn(d)) {
        b.classList.add("is-closed");
        b.appendChild(el("span", "day-chip-closed", "Closed"));
      }
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () {
        show(d);
      });
      picker.appendChild(b);
    });

    function show(d) {
      picker.querySelectorAll(".day-chip").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-day") === T.isoDate(d)));
      });
      var rel = T.daysBetween(today, d);
      var name = rel === 0 ? "Today" : rel === 1 ? "Tomorrow" : T.fmt.weekday.format(d);
      title.textContent = name + ", " + T.fmt.dayMonth.format(d);
      list.textContent = "";
      var h = T.hoursOn(d);
      if (!h) {
        var li = el("li", "bake bake-closed");
        li.appendChild(el("span", "bake-time", "Closed"));
        var body = el("span", "bake-body");
        body.appendChild(el("span", "bake-name", "No baking for the shop " + T.closedWhy(d) + "."));
        var next = T.nextOpening(d);
        if (next) {
          body.appendChild(el("span", "bake-note", "We open again " + T.whenWords(next.date, today) + " at " + T.timeLabel(next.time) + "."));
        }
        li.appendChild(body);
        list.appendChild(li);
        return;
      }
      var live = rel === 0;
      var openLi = el("li", "bake bake-open");
      openLi.appendChild(el("span", "bake-time", T.timeLabel(h[0])));
      var ob = el("span", "bake-body");
      ob.appendChild(el("span", "bake-name", "Doors open"));
      ob.appendChild(el("span", "bake-note", "Until " + T.timeLabel(h[1])));
      openLi.appendChild(ob);
      list.appendChild(openLi);
      T.bakesOn(d).forEach(function (b) {
        var out = live && T.minutes(b.time) <= T.minutesOf(now);
        var item = el("li", "bake" + (out ? " is-out" : ""));
        item.appendChild(el("span", "bake-time", T.timeLabel(b.time)));
        var body = el("span", "bake-body");
        body.appendChild(el("span", "bake-name", b.name));
        if (b.note) {
          body.appendChild(el("span", "bake-note", b.note));
        }
        item.appendChild(body);
        if (out) {
          var tag = el("span", "bake-tag");
          tag.append(U.icon("i-check", "icon-sm"), document.createTextNode("Out"));
          item.appendChild(tag);
        }
        list.appendChild(item);
      });
    }

    show(days.filter(function (d) {
      return T.sameDay(d, start);
    })[0] || today);
  }

  /* ---------- The everyday range ---------- */

  function range() {
    var box = document.querySelector("[data-range]");
    var filter = document.querySelector("[data-range-filter]");
    var count = document.querySelector("[data-range-count]");
    if (!box) {
      return;
    }
    var icons = { bread: "i-loaf", pastries: "i-croissant", slices: "i-slice" };
    box.textContent = "";
    var total = 0;
    data.range.forEach(function (cat) {
      var col = el("section", "range-col");
      col.setAttribute("aria-labelledby", "range-" + cat.id);
      var head = el("div", "counter-head");
      var badge = el("span", "counter-icon");
      badge.appendChild(U.icon(icons[cat.id] || "i-loaf"));
      head.appendChild(badge);
      var ht = el("div");
      var h3 = el("h3", "h3", cat.title);
      h3.id = "range-" + cat.id;
      ht.appendChild(h3);
      ht.appendChild(el("p", "counter-from", "From " + T.timeLabel(cat.from)));
      head.appendChild(ht);
      col.appendChild(head);
      col.appendChild(el("p", "counter-note", cat.note));
      var ul = el("ul", "range-list");
      cat.items.forEach(function (it) {
        total++;
        var li = el("li", "range-item");
        li.setAttribute("data-allergens", it.allergens.join(" "));
        var top = el("div", "range-top");
        top.appendChild(el("span", "price-name", it.name));
        top.appendChild(el("span", "price-dots"));
        top.appendChild(el("span", "price", U.money(it.price)));
        li.appendChild(top);
        var meta = el("div", "range-meta");
        meta.appendChild(el("span", "range-detail", it.detail || ""));
        var tags = el("span", "al-tags");
        it.allergens.forEach(function (a) {
          var ab = el("abbr", "al al-" + a, AL[a]);
          ab.title = AL_NAME[a];
          ab.setAttribute("aria-hidden", "true"); // the hidden "Contains: ..." text says it in words
          tags.appendChild(ab);
        });
        var sr = el("span", "visually-hidden", "Contains: " + it.allergens.map(function (a) {
          return AL_NAME[a].toLowerCase();
        }).join(", ") + ".");
        tags.appendChild(sr);
        meta.appendChild(tags);
        li.appendChild(meta);
        ul.appendChild(li);
      });
      col.appendChild(ul);
      col.appendChild(el("p", "range-empty", "Nothing in this section without those."));
      box.appendChild(col);
    });

    function apply() {
      var hide = [];
      if (filter) {
        filter.querySelectorAll("input:checked").forEach(function (input) {
          hide.push(input.value);
        });
      }
      var shown = 0;
      box.querySelectorAll(".range-col").forEach(function (col) {
        var inCol = 0;
        col.querySelectorAll(".range-item").forEach(function (li) {
          var has = li.getAttribute("data-allergens").split(" ");
          var on = !hide.some(function (a) {
            return has.indexOf(a) !== -1;
          });
          li.hidden = !on;
          if (on) {
            inCol++;
          }
        });
        col.classList.toggle("is-empty", inCol === 0);
        shown += inCol;
      });
      if (count) {
        count.textContent = hide.length ? "Showing " + shown + " of " + total + " items" : "All " + total + " items";
      }
    }
    if (filter) {
      filter.addEventListener("change", apply);
    }
    apply();
  }

  /* ---------- Allergens ---------- */

  function allergens() {
    var used = document.querySelector('[data-allergens="used"]');
    var unused = document.querySelector('[data-allergens="unused"]');
    if (!used || !unused) {
      return;
    }
    used.textContent = "";
    unused.textContent = "";
    data.allergens.forEach(function (a) {
      var li = el("li");
      li.appendChild(el("strong", "", a.name));
      if (a.used) {
        li.appendChild(el("span", "", a.where));
        used.appendChild(li);
      } else {
        unused.appendChild(li);
      }
    });
  }

  /* ---------- Cake collection slots ---------- */

  function slotsTable() {
    var table = document.querySelector("[data-slots-table]");
    if (!table) {
      return;
    }
    var today = T.today();
    table.textContent = "";
    U.DAYS.forEach(function (dow) {
      var slots = data.collectionSlots[dow] || [];
      var row = el("div", today.getDay() === dow ? "is-today" : "");
      var dt = el("dt", "", U.DAY_NAMES[dow]);
      if (today.getDay() === dow) {
        dt.appendChild(el("span", "tag", "Today"));
      }
      row.appendChild(dt);
      var dd = el("dd", "slot-cells");
      if (!slots.length || !data.hours[dow]) {
        dd.textContent = "Closed";
      } else {
        slots.forEach(function (s) {
          dd.appendChild(el("span", "slot-cell", T.rangeLabel(s)));
        });
      }
      row.appendChild(dd);
      table.appendChild(row);
    });
  }
})();
