/* Moving checklist: the stages in data.js, dated from the visitor's moving day. Ticks and the date are kept
   in this browser's local storage only (a convenience: the page works the same without it). */
(function () {
  var D = window.HT;
  var T = window.HTDates;
  var S = window.HTSite;
  var el = S.el;

  var list = document.querySelector("[data-stages]");
  var dateInput = document.querySelector("[data-move-date]");
  if (!list || !dateInput) {
    return;
  }
  var KEY = "ht-checklist";
  var today = T.startOfDay(new Date());
  var state = load();

  function load() {
    try {
      var saved = JSON.parse(window.localStorage.getItem(KEY) || "{}");
      return { date: saved.date || "", done: saved.done || {} };
    } catch (e) {
      return { date: "", done: {} };
    }
  }

  function save() {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      // Private windows and blocked storage: the ticks just won't be remembered.
    }
  }

  var moveDay = T.parseIso(state.date) || T.addDays(today, 56);
  dateInput.value = T.isoDate(moveDay);

  function plural(n, word) {
    return n + " " + word + (n === 1 ? "" : "s");
  }

  function countdown() {
    var n = T.daysBetween(today, moveDay);
    var note = document.querySelector("[data-move-countdown]");
    if (n > 13) {
      note.textContent = T.fmt.long.format(moveDay) + ": " + plural(Math.floor(n / 7), "week") + (n % 7 ? " and " + plural(n % 7, "day") : "") + " to go.";
    } else if (n > 1) {
      note.textContent = T.fmt.long.format(moveDay) + ": " + plural(n, "day") + " to go.";
    } else if (n === 1) {
      note.textContent = "Tomorrow. Good luck!";
    } else if (n === 0) {
      note.textContent = "Today's the day.";
    } else {
      note.textContent = "That was " + plural(-n, "day") + " ago. Hope it went well.";
    }
  }

  function render() {
    list.textContent = "";
    var stages = D.checklist;
    stages.forEach(function (stage, i) {
      var due = T.addDays(moveDay, stage.days);
      var next = stages[i + 1] ? T.addDays(moveDay, stages[i + 1].days) : null;
      var status = today < due ? "later" : next && today >= next ? "past" : "now";
      var li = el("li", "stage is-" + status);
      li.id = "stage-" + stage.id;
      var head = el("div", "stage-head");
      var pin = el("span", "stage-pin");
      pin.setAttribute("aria-hidden", "true");
      pin.appendChild(S.icon(stage.days === 0 ? "i-van" : stage.days > 0 ? "i-house" : "i-calendar"));
      var title = el("h2", "stage-title", stage.title);
      var when = el("p", "stage-when");
      var dateText = T.fmt.short.format(due);
      if (stage.days < 0) {
        when.textContent = "By " + dateText;
      } else if (stage.days === 0) {
        when.textContent = dateText;
      } else {
        when.textContent = "From " + dateText;
      }
      var flag = { now: "Now", past: stage.days < 0 ? "Catch up" : "Done?", later: "" }[status];
      if (flag) {
        when.appendChild(el("span", "stage-flag", flag));
      }
      head.append(pin, title, when);
      li.appendChild(head);

      var tasks = el("ul", "tasks");
      stage.items.forEach(function (item) {
        var t = el("li", "task");
        var box = el("input");
        box.type = "checkbox";
        box.id = "task-" + item.id;
        box.checked = !!state.done[item.id];
        box.setAttribute("data-task", item.id);
        var label = el("label", "", item.text);
        label.htmlFor = box.id;
        t.append(box, label);
        if (box.checked) {
          t.classList.add("is-done");
        }
        tasks.appendChild(t);
      });
      li.appendChild(tasks);
      list.appendChild(li);
    });
    progress();
    countdown();
  }

  function progress() {
    var all = list.querySelectorAll("[data-task]");
    var done = list.querySelectorAll("[data-task]:checked");
    document.querySelector("[data-progress-text]").textContent = done.length + " of " + all.length + " done";
    document.querySelector("[data-progress-bar]").className = "progress-bar w-" + Math.round(done.length / all.length * 20) * 5;
  }

  list.addEventListener("change", function (event) {
    var box = event.target.closest("[data-task]");
    if (!box) {
      return;
    }
    if (box.checked) {
      state.done[box.getAttribute("data-task")] = true;
    } else {
      delete state.done[box.getAttribute("data-task")];
    }
    box.parentNode.classList.toggle("is-done", box.checked);
    save();
    progress();
  });

  dateInput.addEventListener("change", function () {
    var d = T.parseIso(dateInput.value);
    if (!d) {
      return;
    }
    moveDay = d;
    state.date = dateInput.value;
    save();
    render();
  });

  document.querySelector("[data-print]").addEventListener("click", function () {
    window.print();
  });

  document.querySelector("[data-clear]").addEventListener("click", function () {
    state.done = {};
    save();
    render();
  });

  render();
})();
