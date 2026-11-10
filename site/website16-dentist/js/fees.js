/* Fees page: NHS charges and private prices from data.js, shown as two tabs. fees.html?tab=private opens
   the private list. */
(function () {
  var data = window.Harebell;

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

  function nhsBands() {
    var box = document.querySelector("[data-bands]");
    if (!box) {
      return;
    }
    box.textContent = "";
    data.nhsBands.forEach(function (b) {
      var li = el("li", "band" + (b.id === "urgent" ? " band-urgent" : ""));
      li.append(el("h3", "band-name", b.name), el("p", "band-price", b.price), el("p", "band-covers", b.covers));
      var ul = el("ul");
      b.includes.forEach(function (item) {
        ul.appendChild(el("li", "", item));
      });
      li.appendChild(ul);
      box.appendChild(li);
    });
  }

  function lists() {
    var free = document.querySelector("[data-nhs-free]");
    if (free) {
      free.textContent = "";
      data.nhsFree.forEach(function (line) {
        var li = el("li");
        li.innerHTML = '<svg class="icon"><use href="#i-check"/></svg>';
        li.appendChild(el("span", "", line));
        free.appendChild(li);
      });
    }
    var rules = document.querySelector("[data-nhs-rules]");
    if (rules) {
      rules.textContent = "";
      data.nhsRules.forEach(function (line) {
        rules.appendChild(el("li", "", line));
      });
    }
    var source = document.querySelector("[data-nhs-source]");
    if (source) {
      source.textContent = "Source: NHS dental charges in England from " + data.nhsSource.from + ", checked on ";
      var a = el("a", "", "nhs.uk");
      a.href = data.nhsSource.url;
      source.append(a, document.createTextNode(" on " + data.nhsSource.checked + ". The charges change each April."));
    }
  }

  function privatePrices() {
    var box = document.querySelector("[data-price-groups]");
    if (!box) {
      return;
    }
    box.textContent = "";
    data.privateFees.forEach(function (group) {
      var art = el("article", "price-group");
      art.appendChild(el("h3", "", group.group));
      var table = el("table", "price-table");
      var caption = el("caption", "visually-hidden", group.group + ": private prices");
      var tbody = el("tbody");
      group.items.forEach(function (item) {
        var tr = el("tr");
        var th = el("th", "", item[0]);
        th.scope = "row";
        if (item[2]) {
          th.appendChild(el("small", "", item[2]));
        }
        tr.append(th, el("td", "", item[1]));
        tbody.appendChild(tr);
      });
      table.append(caption, tbody);
      art.appendChild(table);
      box.appendChild(art);
    });
  }

  // Two tabs, keyboard as the ARIA tabs pattern: arrows move between tabs, Home and End go to the ends.
  function tabs() {
    var list = document.querySelector("[data-tabs]");
    if (!list) {
      return;
    }
    var buttons = Array.prototype.slice.call(list.querySelectorAll("[role=tab]"));

    function select(name, opts) {
      opts = opts || {};
      buttons.forEach(function (b) {
        var on = b.getAttribute("data-tab") === name;
        b.setAttribute("aria-selected", String(on));
        b.tabIndex = on ? 0 : -1;
        document.getElementById(b.getAttribute("aria-controls")).hidden = !on;
        if (on && opts.focus) {
          b.focus();
        }
      });
      if (opts.updateUrl && window.history.replaceState) {
        var url = new URL(window.location.href);
        if (name === "nhs") {
          url.searchParams.delete("tab");
        } else {
          url.searchParams.set("tab", name);
        }
        window.history.replaceState(null, "", url);
      }
    }

    buttons.forEach(function (b, i) {
      b.addEventListener("click", function () {
        select(b.getAttribute("data-tab"), { updateUrl: true });
      });
      b.addEventListener("keydown", function (event) {
        var next = null;
        if (event.key === "ArrowRight") {
          next = buttons[(i + 1) % buttons.length];
        } else if (event.key === "ArrowLeft") {
          next = buttons[(i - 1 + buttons.length) % buttons.length];
        } else if (event.key === "Home") {
          next = buttons[0];
        } else if (event.key === "End") {
          next = buttons[buttons.length - 1];
        }
        if (next) {
          event.preventDefault();
          select(next.getAttribute("data-tab"), { focus: true, updateUrl: true });
        }
      });
    });

    var wanted = new URLSearchParams(window.location.search).get("tab") || window.location.hash.replace("#", "");
    select(wanted === "private" ? "private" : "nhs");
  }

  nhsBands();
  lists();
  privatePrices();
  tabs();
})();
