/* Home page: the treatment cards, the team and the breathing exercise, all from data.js. */
(function () {
  var data = window.Harebell;

  var NHS_TAG = {
    band1: "NHS Band 1",
    band2: "NHS Band 2",
    band3: "NHS Band 3",
    free: "Free on the NHS for under-18s"
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

  function icon(id) {
    var span = el("span", "treat-icon");
    span.setAttribute("aria-hidden", "true");
    span.innerHTML = '<svg class="icon"><use href="#' + id + '"/></svg>';
    return span;
  }

  // Tags for a treatment: its NHS band (or "Private only"), and "Private" when it is offered both ways.
  function tags(t) {
    var box = el("span", "tags");
    if (t.nhs) {
      box.appendChild(el("span", "tag " + (t.nhs === "free" ? "tag-free" : "tag-nhs"), NHS_TAG[t.nhs]));
      if (t.nhs !== "free") {
        box.appendChild(el("span", "tag tag-private", "Private"));
      }
    } else {
      box.appendChild(el("span", "tag tag-private", "Private only"));
    }
    return box;
  }

  function treatments() {
    var grid = document.querySelector("[data-treat-grid]");
    if (!grid) {
      return;
    }
    grid.textContent = "";
    data.treatments.forEach(function (t) {
      var li = el("li", "treat-card" + (t.nhs ? "" : " is-private"));
      var a = el("a", "treat-link");
      a.href = "treatments.html#" + t.id;
      a.append(icon(t.icon), el("span", "treat-name", t.name), el("span", "treat-sum", t.summary), tags(t));
      li.appendChild(a);
      grid.appendChild(li);
    });
  }

  function team() {
    var list = document.querySelector("[data-team]");
    if (!list) {
      return;
    }
    list.textContent = "";
    data.team.forEach(function (p) {
      var li = el("li", "person");
      var mono = el("span", "monogram tone-" + p.tone, p.initials);
      mono.setAttribute("aria-hidden", "true");
      var head = el("div", "person-head");
      head.append(el("h3", "", p.name), el("p", "person-role", p.role));
      var body = el("div", "person-body");
      body.appendChild(el("p", "person-bio", p.bio));
      var meta = el("dl", "person-meta");
      var days = el("div");
      days.append(el("dt", "", "Here on"), el("dd", "", p.days));
      meta.appendChild(days);
      if (p.gdc) {
        var gdc = el("div");
        var dd = el("dd", "gdc-slot");
        dd.append(document.createTextNode("000000 "), el("span", "example-tag", "Example"));
        gdc.append(el("dt", "", "GDC number"), dd);
        meta.appendChild(gdc);
      }
      body.appendChild(meta);
      li.append(mono, head, body);
      list.appendChild(li);
    });
  }

  /* The breathing exercise: in, hold, out, for a few rounds, then it stops by itself. The circle grows and
     shrinks (or keeps still when reduced motion is on), and the words say what to do. */
  function breathing() {
    var box = document.querySelector("[data-breathe]");
    if (!box) {
      return;
    }
    var circle = box.querySelector("[data-breathe-circle]");
    var count = box.querySelector("[data-breathe-count]");
    var phaseText = box.querySelector("[data-breathe-phase]");
    var toggle = box.querySelector("[data-breathe-toggle]");
    var label = box.querySelector("[data-breathe-label]");
    var help = document.querySelector("[data-breathe-help]");
    var b = data.breathing;
    var phases = [
      { words: "Breathe in", seconds: b.inhale, big: true },
      { words: "Hold", seconds: b.hold, big: true },
      { words: "Breathe out", seconds: b.exhale, big: false }
    ].filter(function (p) {
      return p.seconds > 0;
    });
    var timer = null;
    var running = false;

    if (help) {
      help.textContent = "Breathe in for " + b.inhale + ", hold for " + b.hold + ", and out for " + b.exhale + ". " +
        words(b.rounds) + " rounds take under a minute. Try it now, or in our waiting room.";
    }
    toggle.hidden = false;

    function words(n) {
      return ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight"][n] || String(n);
    }

    function setDuration(seconds) {
      for (var i = 1; i <= 8; i++) {
        circle.classList.remove("t-" + i);
      }
      circle.classList.add("t-" + Math.max(1, Math.min(8, seconds)));
    }

    function stop(finished) {
      window.clearTimeout(timer);
      running = false;
      toggle.querySelector("use").setAttribute("href", "#i-play");
      label.textContent = finished ? "Go again" : "Start breathing";
      setDuration(2);
      circle.classList.remove("is-big");
      count.textContent = "";
      phaseText.textContent = finished ? "Well done. Notice how you feel." : "Ready when you are";
    }

    function run(round, index, left) {
      var phase = phases[index];
      if (left === phase.seconds) {
        phaseText.textContent = phase.words;
        setDuration(phase.seconds);
        circle.classList.toggle("is-big", phase.big);
      }
      count.textContent = String(left);
      timer = window.setTimeout(function () {
        if (left > 1) {
          run(round, index, left - 1);
        } else if (index < phases.length - 1) {
          run(round, index + 1, phases[index + 1].seconds);
        } else if (round < b.rounds) {
          run(round + 1, 0, phases[0].seconds);
        } else {
          stop(true);
        }
      }, 1000);
    }

    toggle.addEventListener("click", function () {
      if (running) {
        stop(false);
        return;
      }
      running = true;
      toggle.querySelector("use").setAttribute("href", "#i-pause");
      label.textContent = "Stop";
      run(1, 0, phases[0].seconds);
    });
  }

  // The fee previews: NHS bands and a few private prices.
  function feePreviews() {
    var nhs = document.querySelector("[data-band-mini]");
    if (nhs) {
      nhs.textContent = "";
      data.nhsBands.forEach(function (b) {
        var row = el("div");
        row.append(el("dt", "", b.short), el("dd", "", b.price));
        nhs.appendChild(row);
      });
    }
    var priv = document.querySelector("[data-private-mini]");
    if (priv) {
      var prices = {};
      data.privateFees.forEach(function (group) {
        group.items.forEach(function (item) {
          prices[item[0]] = item[1];
        });
      });
      priv.textContent = "";
      data.homeHighlights.forEach(function (name) {
        if (prices[name]) {
          var row = el("div");
          row.append(el("dt", "", name), el("dd", "", prices[name]));
          priv.appendChild(row);
        }
      });
    }
  }

  treatments();
  team();
  feePreviews();
  breathing();
})();
