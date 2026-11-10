/* Before-and-after comparison: two pictures of the same job, one over the other, with a divider you can
   drag, move with the arrow keys, or jump with the Before / Both / After buttons. Left of the divider is
   "before", right of it is "after".

   The divider position is a data-pos attribute (0 to 100) that css/style.css turns into a
   clip and a handle position, so no inline styles are needed.

   Also draws the featured project on the home page ([data-featured]). */
(function () {
  var data = window.Kember;
  var KD = window.KD;
  var el = KD.el;
  var icon = KD.icon;

  function describe(pos) {
    if (pos >= 100) {
      return "Before only";
    }
    if (pos <= 0) {
      return "After only";
    }
    if (pos === 50) {
      return "Half before, half after";
    }
    return pos + "% before, " + (100 - pos) + "% after";
  }

  function create(project) {
    var fig = el("figure", "compare");
    var frame = el("div", "ba");

    var before = el("img", "ba-img ba-before");
    before.src = project.before.src;
    before.alt = "Before. " + project.before.alt;
    before.width = 800;
    before.height = 600;
    before.decoding = "async";

    var after = el("img", "ba-img ba-after");
    after.src = project.after.src;
    after.alt = "After. " + project.after.alt;
    after.width = 800;
    after.height = 600;
    after.decoding = "async";

    var tagBefore = el("span", "ba-tag ba-tag-before", "Before");
    var tagAfter = el("span", "ba-tag ba-tag-after", "After");
    tagBefore.setAttribute("aria-hidden", "true");
    tagAfter.setAttribute("aria-hidden", "true");

    var handle = el("span", "ba-handle");
    handle.setAttribute("aria-hidden", "true");
    var knob = el("span", "ba-knob");
    knob.appendChild(icon("i-drag"));
    handle.appendChild(knob);

    var input = el("input", "ba-range");
    input.type = "range";
    input.min = "0";
    input.max = "100";
    input.step = "1";
    input.value = "50";
    input.setAttribute("aria-label", "Before and after, " + project.title + ". Before is on the left of the divider, after on the right.");

    frame.append(before, after, tagBefore, tagAfter, handle, input);

    var bar = el("div", "ba-bar");
    var controls = el("div", "ba-controls");
    controls.setAttribute("role", "group");
    controls.setAttribute("aria-label", "Show " + project.title);
    var buttons = {};
    [["before", "Before", 100], ["split", "Both", 50], ["after", "After", 0]].forEach(function (b) {
      var button = el("button", "", b[1]);
      button.type = "button";
      button.setAttribute("data-show", b[0]);
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", function () {
        set(b[2], true);
      });
      buttons[b[2]] = button;
      controls.appendChild(button);
    });

    var note = el("figcaption", "ba-note");
    note.appendChild(icon("i-camera"));
    note.appendChild(el("span", "", "Drawing for this sample. Our photos of the job go here."));
    bar.append(controls, note);
    fig.append(frame, bar);

    var timer = null;

    function set(value, animate) {
      var pos = Math.max(0, Math.min(100, Math.round(value)));
      if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        fig.classList.add("is-animating");
        clearTimeout(timer);
        timer = setTimeout(function () {
          fig.classList.remove("is-animating");
        }, 480);
      }
      fig.setAttribute("data-pos", String(pos));
      input.value = String(pos);
      input.setAttribute("aria-valuetext", describe(pos));
      Object.keys(buttons).forEach(function (k) {
        buttons[k].setAttribute("aria-pressed", String(+k === pos));
      });
    }

    input.addEventListener("input", function () {
      set(+input.value, false);
    });

    // Arrow keys move the divider 5% at a time (10% with Page Up and Page Down); Home and End show only
    // the "after" or the "before" picture.
    input.addEventListener("keydown", function (event) {
      var pos = +fig.getAttribute("data-pos");
      var moves = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -10, PageUp: 10 };
      if (moves[event.key] !== undefined) {
        event.preventDefault();
        set(pos + moves[event.key], false);
      } else if (event.key === "Home") {
        event.preventDefault();
        set(0, true);
      } else if (event.key === "End") {
        event.preventDefault();
        set(100, true);
      }
    });

    set(50, false);
    return fig;
  }

  // "Finished August 2026", worked out from finishedMonthsAgo.
  function finished(project) {
    return KD.fmt.monthYear.format(KD.monthsAgo(project.finishedMonthsAgo));
  }

  // The words next to a comparison: type, title, summary, facts, work done, links.
  function details(project, headingTag) {
    var body = el("div", "project-body");
    var type = data.types[project.type];
    body.appendChild(el("p", "project-kicker", type.name + " · " + project.area));
    body.appendChild(el(headingTag || "h3", "project-title", project.title));
    body.appendChild(el("p", "project-summary", project.summary));

    var facts = el("dl", "project-facts");
    [["House", project.house], ["On site", project.weeks + " weeks"], ["Finished", finished(project)], ["Cost", project.cost]].forEach(function (f) {
      var row = el("div");
      row.append(el("dt", "", f[0]), el("dd", "", f[1]));
      facts.appendChild(row);
    });
    body.appendChild(facts);

    var work = el("ul", "project-work");
    project.work.forEach(function (w) {
      work.appendChild(el("li", "", w));
    });
    body.appendChild(work);
    return body;
  }

  function links(project, more) {
    var p = el("p", "project-links");
    var ask = el("a", "", "Ask about a job like this");
    ask.href = "quote.html?type=" + project.type;
    p.appendChild(ask);
    if (more) {
      var all = el("a", "", "See all " + data.projects.length + " projects");
      all.href = "projects.html";
      p.appendChild(all);
    }
    return p;
  }

  window.KDCompare = { create: create, details: details, links: links };

  // Home page: the featured project.
  var box = document.querySelector("[data-featured]");
  if (box) {
    var project = data.projects.filter(function (p) {
      return p.featured;
    })[0] || data.projects[0];
    box.textContent = "";
    var body = details(project, "h3");
    body.appendChild(links(project, true));
    box.append(create(project), body);
  }
})();
