/* Safety page: the "which switch has gone down?" tabs, and the fault-finding rates from data.js.
   Without JavaScript all three sets of steps simply show one after another. */
(function () {
  var data = window.Earthpin;

  document.querySelectorAll("[data-rate]").forEach(function (node) {
    var n = data.jobs.faults.rates[node.getAttribute("data-rate")];
    if (n) {
      node.textContent = "£" + n;
    }
  });

  var list = document.querySelector("[data-tabs]");
  if (!list) {
    return;
  }
  var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));

  function select(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) {
      tab.focus();
    }
  }

  list.hidden = false;
  select(tabs[0], false);

  list.addEventListener("click", function (event) {
    var tab = event.target.closest('[role="tab"]');
    if (tab) {
      select(tab, false);
    }
  });

  // Arrow keys move between the tabs; Home and End jump to the first and last.
  list.addEventListener("keydown", function (event) {
    var i = tabs.indexOf(document.activeElement);
    if (i === -1) {
      return;
    }
    var next = null;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      next = tabs[(i + 1) % tabs.length];
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      next = tabs[(i - 1 + tabs.length) % tabs.length];
    } else if (event.key === "Home") {
      next = tabs[0];
    } else if (event.key === "End") {
      next = tabs[tabs.length - 1];
    }
    if (next) {
      event.preventDefault();
      select(next, true);
    }
  });
})();
