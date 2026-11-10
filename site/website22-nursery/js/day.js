/* The day page: the timeline of a typical day for the chosen room, the EYFS area highlighter, the seven areas
   of learning, and this week's lunches. Everything comes from data.js. */
(function () {
  var data = window.ButtonTin;
  var BT = window.BT;
  var el = BT.el;

  var timeline = document.querySelector("[data-timeline]");
  if (!timeline) {
    return;
  }
  var roomButtons = document.querySelectorAll("[data-room]");
  var filterBox = document.querySelector("[data-area-filter]");
  var filterNote = document.querySelector("[data-filter-note]");

  var params = new URLSearchParams(window.location.search);
  var room = BT.room(params.get("room")) ? params.get("room") : "thimbles";
  var area = "";

  function areaById(id) {
    return data.eyfs.filter(function (a) {
      return a.id === id;
    })[0];
  }

  function shortName(a) {
    return a.short || a.name;
  }

  // The part of the day happening now, if the nursery is open.
  function currentPart() {
    var now = new Date();
    var mins = now.getHours() * 60 + now.getMinutes();
    if (!BT.isOpenDay(now) || mins < BT.minutes(data.hours.open) || mins >= BT.minutes(data.hours.close)) {
      return null;
    }
    var current = null;
    data.day.forEach(function (part) {
      if (BT.minutes(part.time) <= mins) {
        current = part;
      }
    });
    return current;
  }

  /* ---------- Timeline ---------- */

  function renderTimeline() {
    var now = currentPart();
    timeline.textContent = "";
    data.day.forEach(function (part) {
      var li = el("li", "moment");
      li.id = part.id;
      li.setAttribute("data-areas", part.areas.join(" "));

      var when = el("div", "moment-when");
      var bead = el("span", "bead tone-" + part.tone);
      bead.setAttribute("aria-hidden", "true");
      bead.innerHTML = '<svg class="icon"><use href="#' + part.icon + '"/></svg>';
      var time = el("time", "moment-time", BT.clock(part.time));
      time.setAttribute("datetime", part.time);
      when.append(bead, time);

      var card = el("div", "moment-card patch");
      var h3 = el("h3");
      h3.appendChild(el("span", "", part.title));
      if (now && now.id === part.id) {
        li.classList.add("is-now");
        h3.appendChild(el("span", "now-tag", "Happening now"));
      }
      card.appendChild(h3);
      card.appendChild(el("p", "moment-text", (part.rooms && part.rooms[room]) || part.text));

      var learn = el("p", "moment-learn");
      learn.appendChild(el("strong", "", "What children learn"));
      learn.appendChild(document.createTextNode(part.learn));
      card.appendChild(learn);

      var chips = el("ul", "chips");
      chips.setAttribute("aria-label", "Areas of learning");
      part.areas.forEach(function (id) {
        var a = areaById(id);
        var chip = el("li", "chip tone-" + a.tone);
        var dot = el("span", "chip-dot");
        dot.setAttribute("aria-hidden", "true");
        chip.append(dot, document.createTextNode(shortName(a)));
        chips.appendChild(chip);
      });
      card.appendChild(chips);

      li.append(when, card);
      timeline.appendChild(li);
    });
    applyFilter();
  }

  /* ---------- Room switch ---------- */

  function setRoom(id, fromClick) {
    room = id;
    roomButtons.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-room") === id));
    });
    renderTimeline();
    if (fromClick && window.history.replaceState) {
      var url = new URL(window.location.href);
      url.searchParams.set("room", id);
      window.history.replaceState(null, "", url);
    }
  }

  roomButtons.forEach(function (b) {
    b.addEventListener("click", function () {
      setRoom(b.getAttribute("data-room"), true);
    });
  });

  /* ---------- Area highlighter ---------- */

  function buildFilter() {
    data.eyfs.forEach(function (a) {
      var b = el("button", "chip tone-" + a.tone);
      b.type = "button";
      b.setAttribute("data-area", a.id);
      b.setAttribute("aria-pressed", "false");
      var dot = el("span", "chip-dot");
      dot.setAttribute("aria-hidden", "true");
      b.append(dot, document.createTextNode(shortName(a)));
      filterBox.appendChild(b);
    });
    filterBox.addEventListener("click", function (event) {
      var b = event.target.closest("[data-area]");
      if (!b) {
        return;
      }
      var id = b.getAttribute("data-area");
      area = area === id ? "" : id;
      applyFilter();
    });
  }

  function applyFilter() {
    filterBox.querySelectorAll("[data-area]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-area") === area));
    });
    var hits = [];
    timeline.querySelectorAll(".moment").forEach(function (li) {
      var match = !area || li.getAttribute("data-areas").split(" ").indexOf(area) !== -1;
      li.classList.toggle("is-dim", !match);
      if (area && match) {
        hits.push(li.querySelector("h3 span").textContent.toLowerCase());
      }
    });
    if (!filterNote) {
      return;
    }
    if (!area) {
      filterNote.textContent = "Pick an area to see which parts of the day build it most.";
      return;
    }
    var names = hits.length > 1 ? hits.slice(0, -1).join(", ") + " and " + hits[hits.length - 1] : hits[0];
    var text = areaById(area).name + ": " + names + ".";
    filterNote.textContent = text.charAt(0).toUpperCase() + text.slice(1);
  }

  /* ---------- The seven areas ---------- */

  function renderEyfs() {
    var box = document.querySelector("[data-eyfs]");
    if (!box) {
      return;
    }
    box.textContent = "";
    [[true, "The three prime areas"], [false, "The four specific areas"]].forEach(function (group) {
      box.appendChild(el("h3", "eyfs-group-title", group[1]));
      data.eyfs.filter(function (a) {
        return a.prime === group[0];
      }).forEach(function (a) {
        var card = el("div", "eyfs-card tone-" + a.tone);
        card.appendChild(el("h4", "", a.name));
        card.appendChild(el("p", "", a.what));
        var parts = data.day.filter(function (p) {
          return p.areas.indexOf(a.id) !== -1;
        }).map(function (p) {
          return p.title.toLowerCase();
        });
        if (parts.length) {
          var list = parts.length > 1 ? parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1] : parts[0];
          card.appendChild(el("p", "eyfs-when", "In our day: " + list + "."));
        }
        box.appendChild(card);
      });
    });
  }

  /* ---------- This week's lunches ---------- */

  function renderMenu() {
    var list = document.querySelector("[data-menu]");
    if (!list) {
      return;
    }
    var today = BT.startOfDay(new Date());
    var dow = today.getDay();
    // At the weekend, show next week's menu.
    var monday = BT.addDays(today, dow === 0 ? 1 : dow === 6 ? 2 : 1 - dow);
    var ref = new Date(2026, 0, 5); // a Monday: week 1 of the menu
    var week = ((Math.round((monday - ref) / (7 * 86400000)) % data.menu.length) + data.menu.length) % data.menu.length;
    var title = document.querySelector("[data-menu-title]");
    if (title) {
      title.textContent = (dow === 0 || dow === 6 ? "Lunch next week" : "Lunch this week") + " (week " + (week + 1) + " of " + data.menu.length + ")";
    }
    list.textContent = "";
    data.menu[week].forEach(function (dish, i) {
      var d = BT.addDays(monday, i);
      var reason = BT.closedReason(d);
      var li = el("li", (BT.isoDate(d) === BT.isoDate(today) ? "is-today" : "") + (reason ? " is-closed" : ""));
      li.appendChild(el("span", "menu-day", BT.fmt.short.format(d)));
      li.appendChild(el("span", "", reason ? "Closed: " + reason : dish));
      list.appendChild(li);
    });
  }

  buildFilter();
  setRoom(room);
  renderEyfs();
  renderMenu();

  // Jumping to #lunch from the home page: the timeline is drawn now, so scroll to it.
  if (window.location.hash) {
    var target = document.getElementById(window.location.hash.slice(1));
    if (target) {
      target.scrollIntoView({ block: "start" });
    }
  }
})();
