/* The timetable page: this term's dates, the weekly group classes by day with filters for school year and
   subject, places left, prices for a session and for the rest of the term, and links to book a free trial. */
(function () {
  var data = window.Markwell;
  var D = window.MarkwellDates;
  var el = window.MarkwellSite.el;
  var now = new Date();

  var box = document.querySelector("[data-timetable]");
  var yearSelect = document.querySelector("[data-filter-year]");
  var chips = document.querySelectorAll("[data-filter-subject]");
  var count = document.querySelector("[data-filter-count]");
  if (!box || !yearSelect) {
    return;
  }

  var ICON = "http://www.w3.org/2000/svg";
  function icon(id) {
    var svg = document.createElementNS(ICON, "svg");
    svg.setAttribute("class", "icon");
    svg.setAttribute("aria-hidden", "true");
    var use = document.createElementNS(ICON, "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
  }

  var term = D.joinableTerm(now);
  var status = D.termStatus(now);
  var subject = "all";

  /* ---------- Term card ---------- */

  function termCard() {
    var card = document.querySelector("[data-term-card]");
    if (!card) {
      return;
    }
    card.textContent = "";
    var top = el("div", "term-card-top");
    top.appendChild(el("h2", "", term.label));
    var weekText = status.kind === "term" ? "Week " + status.weeks.current + " of " + status.weeks.total :
      status.kind === "half" ? "Half-term this week" : "Starts " + D.fmt.dayMonth.format(term.start);
    top.appendChild(el("span", "term-week", weekText));
    card.appendChild(top);

    // One block per calendar week of term: done, this week, half-term, or still to come.
    var bar = el("div", "term-bar");
    bar.setAttribute("aria-hidden", "true");
    var weeks = 0;
    var thisMonday = D.mondayOf(now);
    for (var m = D.mondayOf(term.start); m <= term.end; m = D.addDays(m, 7)) {
      var cls = D.inHalfTerm(m, term) ? "is-half" : m < thisMonday ? "is-done" : D.sameDay(m, thisMonday) ? "is-now" : "";
      bar.appendChild(el("i", cls));
      weeks += 1;
    }
    bar.classList.add("term-bar-" + weeks);
    card.appendChild(bar);

    var facts = el("ul", "term-facts");
    function fact(label, value) {
      var li = el("li");
      li.append(el("span", "", label), el("span", "", value));
      facts.appendChild(li);
    }
    fact("First classes", D.fmt.long.format(term.start));
    fact("Half-term (no classes)", D.range(term.halfStart, term.halfEnd));
    fact("Last classes", D.fmt.long.format(term.end));
    var after = D.nextTerm(term.end);
    fact(after.name + " starts", D.fmt.long.format(after.start));
    card.appendChild(facts);
  }

  /* ---------- Filters ---------- */

  function fillYears() {
    data.stages.forEach(function (stage) {
      var group = el("optgroup");
      group.label = stage.name + (stage.tag ? " (" + stage.tag + ")" : "");
      for (var y = stage.from; y <= stage.to; y++) {
        var o = el("option", "", D.yearName(y));
        o.value = String(y);
        group.appendChild(o);
      }
      yearSelect.appendChild(group);
    });
  }

  function currentYear() {
    return yearSelect.value === "" ? null : +yearSelect.value;
  }

  function setSubject(value) {
    subject = value;
    chips.forEach(function (c) {
      c.setAttribute("aria-pressed", String(c.getAttribute("data-filter-subject") === value));
    });
  }

  function saveToUrl() {
    if (!window.history.replaceState) {
      return;
    }
    var url = new URL(window.location.href);
    var year = currentYear();
    if (year === null) {
      url.searchParams.delete("year");
    } else {
      url.searchParams.set("year", String(year));
    }
    if (subject === "all") {
      url.searchParams.delete("subject");
    } else {
      url.searchParams.set("subject", subject);
    }
    window.history.replaceState(null, "", url);
  }

  /* ---------- Classes ---------- */

  function classCard(c, year) {
    var li = el("li", "tt-class s-" + c.subject);
    var left = D.placesLeft(c);

    var top = el("div", "tt-top");
    top.appendChild(el("span", "tt-time", D.timeRange(c)));
    top.appendChild(el("span", "tt-subj", data.subjects[c.subject].tab));
    li.appendChild(top);
    li.appendChild(el("h3", "tt-title", c.title));

    var meta = el("ul", "tt-meta");
    function metaItem(iconId, text, cls) {
      var item = el("li", cls || "");
      item.append(icon(iconId), document.createTextNode(text));
      meta.appendChild(item);
    }
    metaItem("i-users", D.yearsLabel(c.from, c.to), "is-years");
    metaItem(c.room === "online" ? "i-laptop" : "i-door", c.room === "online" ? "Online" : data.rooms[c.room].name + ", " + data.rooms[c.room].where);
    metaItem("i-user", data.tutors[c.tutor].name);
    li.appendChild(meta);

    var places = el("p", "tt-places" + (left === 0 ? " is-full" : left <= 2 ? " is-few" : ""));
    var seats = el("span", "seats");
    seats.setAttribute("aria-hidden", "true");
    for (var i = 0; i < c.capacity; i++) {
      seats.appendChild(el("i", i < c.enrolled ? "is-taken" : ""));
    }
    places.append(seats, document.createTextNode(left === 0 ? "Full" : D.plural(left, "place") + " left of " + c.capacity));
    li.appendChild(places);

    var fee = D.termFee(c, term, now);
    var price = el("p", "tt-price");
    price.appendChild(el("strong", "", D.money(fee.price) + " a session"));
    var span = fee.whole ? "for the " + D.plural(fee.sessions, "session") + " " + (status.kind === "holiday" ? "next" : "this") + " term" :
      "for the " + D.plural(fee.sessions, "session") + " left this term";
    price.appendChild(document.createTextNode(" · " + (fee.sessions ? D.money(fee.total) + " " + span : "no sessions left this term")));
    li.appendChild(price);

    var foot = el("div", "tt-foot");
    var next = D.nextSessions(c, 1, now, 0)[0];
    var nextBox = el("span", "tt-next");
    nextBox.appendChild(el("strong", "", next ? D.relativeDay(next, now) : "Next term"));
    nextBox.appendChild(document.createTextNode("next class"));
    foot.appendChild(nextBox);
    var a = el("a", "btn " + (left ? "btn-primary" : "btn-outline"), left ? "Free trial" : "Waiting list");
    a.href = "trial.html?class=" + encodeURIComponent(c.id) + (year !== null ? "&year=" + year : "");
    a.setAttribute("aria-label", (left ? "Book a free trial of " : "Join the waiting list for ") + c.title + ", " + D.DAY_NAMES[c.day % 7] + " " + D.time(c.start));
    foot.appendChild(a);
    li.appendChild(foot);
    return li;
  }

  function render() {
    var year = currentYear();
    box.textContent = "";
    var shown = data.classes.filter(function (c) {
      return D.forYear(c, year) && (subject === "all" || c.subject === subject);
    });

    var withPlaces = shown.filter(function (c) {
      return D.placesLeft(c) > 0;
    }).length;
    count.textContent = "";
    count.appendChild(el("strong", "", D.plural(shown.length, "class", "classes")));
    count.appendChild(document.createTextNode(shown.length ? " a week, " + withPlaces + " with places" : ""));

    if (!shown.length) {
      var empty = el("div", "tt-empty");
      if (year !== null && year < data.firstYear) {
        var stage = D.stageOf(year);
        empty.appendChild(el("p", "", D.yearName(year) + " is in " + (stage.id === "eyfs" ? "the Early Years Foundation Stage" : stage.long) +
          ". Our classes start in Year 3, at the beginning of Key Stage 2."));
      } else {
        empty.appendChild(el("p", "", "No group class for " + (year !== null ? D.yearName(year) : "this choice") +
          (subject !== "all" ? " in " + data.subjects[subject].name.toLowerCase() : "") + " at the moment. One-to-one lessons cover every subject from Year 3 to A level."));
      }
      var p = el("p");
      var one = el("a", "btn btn-primary", "Ask about one-to-one");
      one.href = "trial.html?type=one" + (year !== null && year >= data.firstYear ? "&year=" + year : "") + (subject !== "all" ? "&subject=" + subject : "");
      var all = el("button", "btn btn-outline", "Show all classes");
      all.type = "button";
      all.addEventListener("click", function () {
        yearSelect.value = "";
        setSubject("all");
        update();
      });
      p.append(one, document.createTextNode(" "), all);
      empty.appendChild(p);
      box.appendChild(empty);
      return;
    }

    [1, 2, 3, 4, 5, 6].forEach(function (day) {
      var list = shown.filter(function (c) {
        return c.day === day;
      }).sort(function (a, b) {
        return a.start < b.start ? -1 : a.start > b.start ? 1 : 0;
      });
      if (!list.length) {
        return;
      }
      var section = el("section", "tt-day");
      var head = el("div", "tt-day-head");
      var h2 = el("h2", "tt-day-name", D.DAY_NAMES[day]);
      h2.id = "day-" + day;
      h2.appendChild(el("small", "", D.plural(list.length, "class", "classes")));
      head.appendChild(h2);
      section.setAttribute("aria-labelledby", h2.id);
      var ul = el("ul", "tt-list");
      list.forEach(function (c) {
        ul.appendChild(classCard(c, year));
      });
      section.append(head, ul);
      box.appendChild(section);
    });
  }

  function update() {
    saveToUrl();
    render();
  }

  function onePrices() {
    var ul = document.querySelector("[data-one-prices]");
    if (!ul) {
      return;
    }
    ul.textContent = "";
    data.oneToOne.forEach(function (row) {
      var li = el("li");
      li.append(el("span", "", row.label), el("strong", "", D.money(row.price) + " an hour"));
      ul.appendChild(li);
    });
  }

  /* ---------- Start ---------- */

  fillYears();
  var params = new URLSearchParams(window.location.search);
  var y = params.get("year");
  if (y !== null && /^\d{1,2}$/.test(y) && +y <= 13) {
    yearSelect.value = String(+y);
  }
  var s = params.get("subject");
  setSubject(data.subjects[s] ? s : "all");

  yearSelect.addEventListener("change", update);
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      setSubject(c.getAttribute("data-filter-subject"));
      update();
    });
  });

  termCard();
  onePrices();
  render();
})();
