/* The home page: the class finder in the hero, the school-year ruler with what we teach in each year, the
   birthday helper, the example report, the tutors, and the report and meeting dates for this term. */
(function () {
  var data = window.Markwell;
  var D = window.MarkwellDates;
  var el = window.MarkwellSite.el;
  var now = new Date();

  var ICONS = { maths: "i-maths", english: "i-book", science: "i-flask", elevenplus: "i-shapes" };
  var SUBJECT_ORDER = ["maths", "english", "science", "elevenplus"];

  function icon(id, className) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", className || "icon");
    svg.setAttribute("aria-hidden", "true");
    var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
  }

  function classesFor(year, subject) {
    return data.classes.filter(function (c) {
      return D.forYear(c, year) && (!subject || subject === "all" || c.subject === subject);
    });
  }

  /* ---------- Hero: classes with places ---------- */

  function finder() {
    var list = document.querySelector("[data-finder-list]");
    var yearSelect = document.querySelector("[data-finder-year]");
    var tabs = document.querySelectorAll("[data-finder-subject]");
    var more = document.querySelector("[data-finder-more]");
    var termNote = document.querySelector("[data-finder-term]");
    if (!list || !yearSelect) {
      return;
    }
    for (var y = data.firstYear; y <= 13; y++) {
      var opt = el("option", "", D.yearName(y));
      opt.value = String(y);
      yearSelect.appendChild(opt);
    }
    var subject = "all";

    function render() {
      var year = yearSelect.value === "" ? null : +yearSelect.value;
      var upcoming = [];
      classesFor(year, subject).forEach(function (c) {
        if (D.placesLeft(c) < 1) {
          return;
        }
        var next = D.nextSessions(c, 1, now, 2)[0];
        if (next) {
          upcoming.push({ c: c, date: next, start: D.classStart(c, next) });
        }
      });
      upcoming.sort(function (a, b) {
        return a.start - b.start;
      });
      upcoming = upcoming.slice(0, 4);

      list.textContent = "";
      if (!upcoming.length) {
        var empty = el("li", "finder-empty");
        empty.appendChild(document.createTextNode("No group class with places for this choice right now. "));
        var a = el("a", "", "Ask about one-to-one");
        a.href = "trial.html?type=one" + (year !== null ? "&year=" + year : "") + (subject !== "all" ? "&subject=" + subject : "");
        empty.appendChild(a);
        empty.appendChild(document.createTextNode("."));
        list.appendChild(empty);
      }
      var lastDay = "";
      upcoming.forEach(function (u) {
        var day = D.relativeDay(u.date, now);
        if (day !== lastDay) {
          list.appendChild(el("li", "finder-day", day));
          lastDay = day;
        }
        var left = D.placesLeft(u.c);
        var item = el("li", "finder-item");
        var link = el("a");
        link.href = "trial.html?class=" + encodeURIComponent(u.c.id) + "&date=" + D.isoDate(u.date) + (year !== null ? "&year=" + year : "");
        link.setAttribute("aria-label", "Try " + u.c.title + " free, " + day + " at " + D.time(u.c.start) + ", " +
          D.yearsLabel(u.c.from, u.c.to) + ", " + data.rooms[u.c.room].name + ", " + D.plural(left, "place") + " left");
        var time = el("span", "finder-time", D.time(u.c.start));
        var body = el("span");
        var name = el("span", "finder-name");
        var sw = el("span", "sw sw-" + u.c.subject);
        sw.setAttribute("aria-hidden", "true");
        name.append(sw, document.createTextNode(u.c.title));
        body.appendChild(name);
        body.appendChild(el("span", "finder-meta", D.yearsLabel(u.c.from, u.c.to) + " · " + data.rooms[u.c.room].name + " · " + data.tutors[u.c.tutor].name));
        var places = el("span", "finder-places" + (left <= 2 ? " is-few" : ""), D.plural(left, "place") + " left");
        link.append(time, body, places);
        item.appendChild(link);
        list.appendChild(item);
      });

      var params = [];
      if (year !== null) {
        params.push("year=" + year);
      }
      if (subject !== "all") {
        params.push("subject=" + subject);
      }
      more.href = "timetable.html" + (params.length ? "?" + params.join("&") : "");
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        subject = tab.getAttribute("data-finder-subject");
        tabs.forEach(function (t) {
          t.setAttribute("aria-pressed", String(t === tab));
        });
        render();
      });
    });
    yearSelect.addEventListener("change", render);

    var status = D.termStatus(now);
    if (status.kind === "term") {
      termNote.textContent = status.term.label + ", week " + status.weeks.current + " of " + status.weeks.total + ".";
    } else if (status.kind === "half") {
      termNote.textContent = "Half-term: back on " + D.fmt.long.format(status.back) + ".";
    } else {
      termNote.textContent = status.term.label + " starts " + D.fmt.long.format(status.term.start) + ".";
    }
    render();
  }

  /* ---------- Subjects: the ruler and the year panel ---------- */

  function oneToOnePrice(level) {
    var index = level.subject === "elevenplus" ? 1 : { ks2: 0, ks3: 2, ks4: 3, ks5: 4 }[D.stageOf(level.from).id];
    return data.oneToOne[index].price;
  }

  function levelFor(subject, year) {
    return data.levels.filter(function (l) {
      return l.subject === subject && year >= l.from && year <= l.to;
    })[0] || null;
  }

  function subjectCard(subject, inner) {
    var li = el("li", "subject-card s-" + subject);
    var tab = el("p", "subject-tab");
    tab.append(icon(ICONS[subject]), document.createTextNode(data.subjects[subject].name));
    li.appendChild(tab);
    inner(li);
    return li;
  }

  function footLine(li, iconId, nodes) {
    var p = el("p");
    p.appendChild(icon(iconId));
    var span = el("span");
    nodes.forEach(function (n) {
      span.appendChild(typeof n === "string" ? document.createTextNode(n) : n);
    });
    p.appendChild(span);
    li.appendChild(p);
  }

  function link(text, href) {
    var a = el("a", "", text);
    a.href = href;
    return a;
  }

  function overview(panel) {
    var summary = el("div", "year-summary");
    summary.appendChild(el("h3", "", "Every year we teach"));
    summary.appendChild(el("span", "stage-chip", "Year 3 to Year 13"));
    summary.appendChild(el("p", "", "Choose a year on the ruler for the detail."));
    panel.appendChild(summary);

    var grid = el("ul", "subject-grid");
    SUBJECT_ORDER.forEach(function (subject) {
      grid.appendChild(subjectCard(subject, function (li) {
        var levels = data.levels.filter(function (l) {
          return l.subject === subject;
        });
        li.appendChild(el("h4", "", data.subjects[subject].strap));
        var ul = el("ul", "subject-levels");
        levels.forEach(function (l) {
          var row = el("li");
          var stage = D.stageOf(l.from);
          var label = subject === "elevenplus" ? "11+ preparation" : stage.tag || stage.name;
          row.append(el("span", "", label), el("span", "", D.yearsLabel(l.from, l.to)));
          ul.appendChild(row);
        });
        li.appendChild(ul);
        var foot = el("div", "subject-foot");
        var n = classesFor(null, subject).length;
        footLine(foot, "i-users", [link(D.plural(n, "group class", "group classes") + " a week", "timetable.html?subject=" + subject)]);
        var prices = levels.map(oneToOnePrice);
        footLine(foot, "i-user", ["One-to-one from " + D.money(Math.min.apply(null, prices)) + " an hour"]);
        li.appendChild(foot);
      }));
    });
    panel.appendChild(grid);
  }

  function yearView(panel, year) {
    var stage = D.stageOf(year);
    var summary = el("div", "year-summary");
    summary.appendChild(el("h3", "", D.yearName(year)));
    summary.appendChild(el("span", "stage-chip", stage.name + (stage.tag ? " · " + stage.tag : "")));
    summary.appendChild(el("p", "", "Ages " + (year + 4) + " to " + (year + 5) + (stage.exams ? ". " + stage.exams : ".")));
    panel.appendChild(summary);

    if (year < data.firstYear) {
      var note = el("div", "year-note");
      note.appendChild(icon("i-info"));
      var body = el("div");
      body.appendChild(el("p", "", "Our classes start in Year 3, at the beginning of Key Stage 2. " +
        (year === 0 ? "Reception is part of the Early Years Foundation Stage, not a key stage. " : "") +
        "At this age, reading together at home every day and your school's phonics work matter most."));
      var p = el("p");
      p.append(document.createTextNode("Want to talk it through, or join a Year 3 class from September? "), link("Message us", "#visit"), document.createTextNode("."));
      body.appendChild(p);
      note.appendChild(body);
      panel.appendChild(note);
      return;
    }

    var grid = el("ul", "subject-grid");
    SUBJECT_ORDER.forEach(function (subject) {
      var level = levelFor(subject, year);
      if (!level) {
        return;
      }
      grid.appendChild(subjectCard(subject, function (li) {
        li.appendChild(el("h4", "", level.title));
        var ul = el("ul", "ticks");
        level.points.forEach(function (point) {
          ul.appendChild(el("li", "", point));
        });
        li.appendChild(ul);
        if (level.tiers) {
          var tiers = el("p", "subject-extra");
          tiers.append(el("strong", "", "Tiers and courses"), document.createTextNode(level.tiers));
          li.appendChild(tiers);
        }
        if (level.boards) {
          var boards = el("p", "subject-extra");
          boards.append(el("strong", "", "Exam boards"), document.createTextNode(level.boards.join(" · ")));
          li.appendChild(boards);
        }
        var foot = el("div", "subject-foot");
        var n = classesFor(year, subject).length;
        if (n) {
          footLine(foot, "i-users", [link(D.plural(n, "group class", "group classes") + " a week for " + D.yearName(year), "timetable.html?year=" + year + "&subject=" + subject)]);
        } else {
          footLine(foot, "i-users", ["No group class for " + D.yearName(year) + " this term: one-to-one instead"]);
        }
        footLine(foot, "i-user", ["One-to-one, in the centre or online: " + D.money(oneToOnePrice(level)) + " an hour"]);
        if (subject === "elevenplus") {
          footLine(foot, "i-info", [link("Read our note on the 11+", "#eleven-plus")]);
        }
        li.appendChild(foot);
      }));
    });
    panel.appendChild(grid);
  }

  function ruler() {
    var group = document.querySelector(".ruler-years");
    var panel = document.querySelector("[data-year-panel]");
    if (!group || !panel) {
      return;
    }
    for (var y = 0; y <= 13; y++) {
      var b = el("button", y < data.firstYear ? "is-before" : "");
      b.type = "button";
      b.setAttribute("data-ruler-year", String(y));
      b.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-label", D.yearName(y));
      b.appendChild(document.createTextNode(y === 0 ? "R" : String(y)));
      b.appendChild(el("small", "", y === 0 ? "Rec" : "Year"));
      group.appendChild(b);
    }
    var buttons = group.querySelectorAll("button");
    var stages = document.querySelectorAll(".rs");

    function select(value, focus) {
      buttons.forEach(function (b) {
        var on = b.getAttribute("data-ruler-year") === value;
        b.setAttribute("aria-pressed", String(on));
        if (on && focus) {
          b.focus();
        }
      });
      var year = value === "" ? null : +value;
      var stage = year === null ? null : D.stageOf(year);
      stages.forEach(function (s) {
        s.classList.toggle("is-active", !!stage && s.classList.contains("rs-" + stage.id));
      });
      panel.textContent = "";
      if (year === null) {
        overview(panel);
      } else {
        yearView(panel, year);
      }
    }

    group.addEventListener("click", function (event) {
      var b = event.target.closest("button");
      if (b) {
        select(b.getAttribute("data-ruler-year"));
      }
    });
    // Left and right arrows move along the ruler.
    group.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }
      var list = Array.prototype.slice.call(buttons);
      var i = list.indexOf(document.activeElement);
      if (i < 0) {
        return;
      }
      event.preventDefault();
      var next = list[Math.max(0, Math.min(list.length - 1, i + (event.key === "ArrowRight" ? 1 : -1)))];
      select(next.getAttribute("data-ruler-year"), true);
    });

    select("");
    window.MarkwellRuler = select;
  }

  /* ---------- Which school year? ---------- */

  function birthHelper() {
    var month = document.querySelector("[data-birth-month]");
    var year = document.querySelector("[data-birth-year]");
    var out = document.querySelector("[data-birth-result]");
    if (!month || !year) {
      return;
    }
    var names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    names.forEach(function (n, i) {
      var o = el("option", "", n);
      o.value = String(i + 1);
      month.appendChild(o);
    });
    var start = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
    for (var y = start - 4; y >= start - 18; y--) {
      var o = el("option", "", String(y));
      o.value = String(y);
      year.appendChild(o);
    }
    var original = out.textContent;

    function update() {
      if (!month.value || !year.value) {
        out.textContent = original;
        return;
      }
      var y = D.yearFromBirth(+year.value, +month.value, now);
      out.textContent = "";
      if (y < 0) {
        out.textContent = "Not at school yet in " + D.schoolYearLabel(now) + ". Children start Reception in the September after they turn four.";
        return;
      }
      if (y > 13) {
        out.textContent = "That is after Year 13, so school is finished.";
        return;
      }
      out.appendChild(document.createTextNode("Most children with this birthday are in "));
      out.appendChild(el("strong", "", D.yearName(y)));
      out.appendChild(document.createTextNode(" in the " + D.schoolYearLabel(now) + " school year. A few summer-born children start school a year later."));
      var show = el("button", "", "Show " + D.yearName(y));
      show.type = "button";
      show.addEventListener("click", function () {
        window.MarkwellRuler(String(y), true);
      });
      out.appendChild(show);
    }
    month.addEventListener("change", update);
    year.addEventListener("change", update);
  }

  /* ---------- The example report ---------- */

  function report() {
    var rep = data.exampleReport;
    var rows = document.querySelector("[data-report-rows]");
    var legend = document.querySelector("[data-report-legend]");
    if (!rows || !rep) {
      return;
    }
    document.querySelector("[data-report-title]").textContent = rep.pupil;
    document.querySelector("[data-report-sub]").textContent = rep.subject;
    var NS = "http://www.w3.org/2000/svg";

    function svgEl(tag, attrs) {
      var node = document.createElementNS(NS, tag);
      Object.keys(attrs).forEach(function (k) {
        node.setAttribute(k, attrs[k]);
      });
      return node;
    }

    function pct(score) {
      return (score / rep.outOf) * 100 + "%";
    }

    rep.checks.forEach(function (name, i) {
      var li = el("li");
      var svg = svgEl("svg", { viewBox: "0 0 12 12", "aria-hidden": "true" });
      svg.appendChild(svgEl("circle", { cx: 6, cy: 6, r: 5, class: "rc-dot rc-dot-" + i }));
      li.append(svg, document.createTextNode(name));
      legend.appendChild(li);
    });

    rep.topics.forEach(function (topic) {
      var row = el("div", "rrow");
      var name = el("div", "rrow-name", topic.name);
      name.appendChild(el("span", "rrow-scores", topic.scores.join(" → ") + " out of " + rep.outOf));
      row.appendChild(name);

      var svg = svgEl("svg", { class: "rrow-chart", "aria-hidden": "true" });
      svg.appendChild(svgEl("rect", { class: "rc-zone", x: "0", y: "9", width: pct(rep.gettingThereFrom), height: "12", rx: "3" }));
      svg.appendChild(svgEl("rect", { class: "rc-zone rc-zone-mid", x: pct(rep.gettingThereFrom), y: "9", width: pct(rep.secureFrom - rep.gettingThereFrom), height: "12" }));
      svg.appendChild(svgEl("rect", { class: "rc-zone rc-zone-top", x: pct(rep.secureFrom), y: "9", width: pct(rep.outOf - rep.secureFrom), height: "12", rx: "3" }));
      svg.appendChild(svgEl("line", { class: "rc-axis", x1: pct(rep.gettingThereFrom), x2: pct(rep.gettingThereFrom), y1: "5", y2: "25" }));
      svg.appendChild(svgEl("line", { class: "rc-axis", x1: pct(rep.secureFrom), x2: pct(rep.secureFrom), y1: "5", y2: "25" }));
      var lo = Math.min.apply(null, topic.scores);
      var hi = Math.max.apply(null, topic.scores);
      svg.appendChild(svgEl("line", { class: "rc-link", x1: pct(lo), x2: pct(hi), y1: "15", y2: "15" }));
      topic.scores.forEach(function (s, i) {
        var dot = svgEl("circle", { class: "rc-dot rc-dot-" + i, cx: pct(s), cy: "15", r: "6" });
        var title = svgEl("title", {});
        title.textContent = rep.checks[i] + ": " + s + " out of " + rep.outOf;
        dot.appendChild(title);
        svg.appendChild(dot);
      });
      row.appendChild(svg);

      var last = topic.scores[topic.scores.length - 1];
      var status = last >= rep.secureFrom ? ["st-secure", "i-check", "Secure"] :
        last >= rep.gettingThereFrom ? ["st-getting", "i-arrow", "Getting there"] : ["st-not", "i-info", "Not yet"];
      var st = el("span", "rrow-status " + status[0]);
      st.append(icon(status[1]), document.createTextNode(status[2]));
      row.appendChild(st);
      rows.appendChild(row);
    });

    // Score marks under the chart column, lined up with the shaded bands (10, 5 and 5 points wide).
    var scale = el("div", "report-scale");
    scale.setAttribute("aria-hidden", "true");
    var bands = el("span", "report-bands");
    var top = el("span");
    top.append(el("span", "", String(rep.secureFrom)), el("span", "", String(rep.outOf)));
    bands.append(el("span", "", "0"), el("span", "", String(rep.gettingThereFrom)), top);
    scale.append(el("span"), bands, el("span"));
    rows.appendChild(scale);
    rows.appendChild(el("p", "report-key", "Shading: under " + rep.gettingThereFrom + " is not yet, " + rep.gettingThereFrom + " to " +
      (rep.secureFrom - 1) + " is getting there, " + rep.secureFrom + " or more is secure."));

    // The same numbers as a table, for screen readers and anyone who prefers one.
    var details = el("details", "report-table");
    details.appendChild(el("summary", "", "Show the scores as a table"));
    var table = el("table");
    var thead = el("thead");
    var hr = el("tr");
    hr.appendChild(el("th", "", "Topic"));
    rep.checks.forEach(function (c) {
      hr.appendChild(el("th", "", c));
    });
    thead.appendChild(hr);
    var tbody = el("tbody");
    rep.topics.forEach(function (t) {
      var tr = el("tr");
      var th = el("th", "", t.name);
      th.scope = "row";
      tr.appendChild(th);
      t.scores.forEach(function (s) {
        tr.appendChild(el("td", "", s + " / " + rep.outOf));
      });
      tbody.appendChild(tr);
    });
    table.append(thead, tbody);
    details.appendChild(table);
    rows.parentNode.insertBefore(details, rows.nextSibling);
  }

  /* ---------- Tutors ---------- */

  function tutors() {
    var list = document.querySelector("[data-tutors]");
    if (!list) {
      return;
    }
    list.textContent = "";
    Object.keys(data.tutors).forEach(function (key) {
      var t = data.tutors[key];
      var li = el("li", "tutor");
      var top = el("div", "tutor-top");
      var mono = el("span", "monogram m-" + t.colour, t.initial);
      mono.setAttribute("aria-hidden", "true");
      var who = el("div");
      who.appendChild(el("h3", "", t.name));
      who.appendChild(el("p", "tutor-role", t.role));
      top.append(mono, who);
      li.appendChild(top);
      li.appendChild(el("p", "tutor-teaches", t.teaches));
      li.appendChild(el("p", "tutor-bg", t.background));
      var badges = el("p", "tutor-badges");
      var dbs = el("span", "badge badge-example");
      dbs.append(icon("i-shield"), document.createTextNode("Enhanced DBS check (example)"));
      badges.appendChild(dbs);
      if (data.safeguarding.lead === key || data.safeguarding.deputy === key) {
        var dsl = el("span", "badge");
        dsl.append(icon("i-shield"), document.createTextNode(data.safeguarding.lead === key ? "Safeguarding lead" : "Deputy safeguarding lead"));
        badges.appendChild(dsl);
      }
      li.appendChild(badges);
      list.appendChild(li);
    });
  }

  /* ---------- Report and meeting dates ---------- */

  function progressDates() {
    var reportBox = document.querySelector("[data-report-date]");
    var meetingBox = document.querySelector("[data-meeting-date]");
    var today = D.startOfDay(now);
    var terms = D.allTerms(now);
    if (reportBox) {
      var t = D.joinableTerm(now);
      var lastWeek = D.mondayOf(t.end);
      reportBox.textContent = t.name + " reports: the week of " + D.fmt.dayMonth.format(lastWeek) + ".";
    }
    if (meetingBox) {
      // Meetings are in the week after each half-term.
      var next = terms.map(function (t) {
        return D.addDays(t.halfEnd, 2);
      }).filter(function (monday) {
        return D.addDays(monday, 5) >= today;
      })[0];
      if (next) {
        meetingBox.textContent = "Next meetings: the week of " + D.fmt.dayMonth.format(next) + ".";
      }
    }
  }

  finder();
  ruler();
  birthHelper();
  report();
  tutors();
  progressDates();
})();
