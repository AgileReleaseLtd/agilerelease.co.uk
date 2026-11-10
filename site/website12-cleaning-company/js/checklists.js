/* The checklists page: one tab for each service, each a room-by-room list of what is and isn't included,
   built from the checklists in data.js. */
(function () {
  var data = window.Tessel;
  var site = window.TesselSite;
  var el = site.el;
  var icon = site.icon;

  var tabs = Array.prototype.slice.call(document.querySelectorAll("[data-tab]"));
  if (!tabs.length) {
    return;
  }
  var cta = document.querySelector("[data-cta-estimate]");

  function iconTile(id) {
    var tile = el("span", "icon-tile");
    tile.appendChild(icon(id));
    return tile;
  }

  function renderPanel(service) {
    var panel = document.querySelector('[data-panel="' + service + '"]');
    var list = data.checklists[service];
    var svc = data.services[service];
    panel.textContent = "";

    var intro = el("div", "panel-intro");
    var words = el("div");
    words.appendChild(el("h2", "h2", svc.name));
    words.appendChild(el("p", "", list.intro));
    var actions = el("div", "panel-intro-actions");
    var print = el("button", "btn btn-outline");
    print.type = "button";
    print.setAttribute("data-print", "");
    print.append(icon("i-print"), document.createTextNode(" Print this checklist"));
    print.addEventListener("click", function () {
      window.print();
    });
    var estimate = el("a", "btn btn-primary", "Get an estimate");
    estimate.href = "estimate.html?svc=" + service;
    actions.append(print, estimate);
    intro.append(words, actions);
    panel.appendChild(intro);

    if (list.promise) {
      var extra = el("div", "tenancy-extra");
      var promise = el("div", "promise");
      var h = el("h3");
      h.append(iconTile("i-refresh"), document.createTextNode(list.promise.title));
      promise.appendChild(h);
      promise.appendChild(el("p", "", list.promise.text));
      promise.appendChild(el("p", "promise-small", list.promise.small));
      var big = el("span", "promise-hours", "48h");
      big.setAttribute("aria-hidden", "true");
      promise.appendChild(big);

      var before = el("div", "panel");
      var bh = el("h3");
      bh.append(icon("i-list"), document.createTextNode("Before we arrive"));
      before.appendChild(bh);
      var ol = el("ol", "before-list");
      list.before.forEach(function (line) {
        ol.appendChild(el("li", "", line));
      });
      before.appendChild(ol);
      extra.append(promise, before);
      panel.appendChild(extra);
    }

    var rooms = el("div", "rooms");
    if (list.promise) {
      rooms.classList.add("rooms-after");
    }
    list.rooms.forEach(function (room, i) {
      var odd = list.rooms.length % 2 === 1 && i === list.rooms.length - 1;
      var card = el("article", "room" + (odd ? " room-wide" : ""));
      var head = el("div", "room-head");
      head.append(iconTile(room.icon), el("h3", "", room.name), el("span", "room-count", room.yes.length + " included"));
      card.appendChild(head);

      var yesBlock = el("div");
      yesBlock.appendChild(el("h4", "", "Included"));
      var yes = el("ul", "room-yes");
      room.yes.forEach(function (line) {
        var li = el("li");
        li.append(icon("i-check"), el("span", "", line));
        yes.appendChild(li);
      });
      yesBlock.appendChild(yes);
      card.appendChild(yesBlock);

      if (room.no && room.no.length) {
        var split = el("div", "room-split");
        split.appendChild(el("h4", "", "Not included"));
        var no = el("ul", "room-no");
        room.no.forEach(function (item) {
          var li = el("li");
          var span = el("span", "", item.text);
          if (item.extra) {
            var link = el("a", "extra-link", "Add as an extra");
            link.href = "estimate.html?svc=" + service + "&x=" + item.extra;
            link.setAttribute("aria-label", "Add " + item.text.toLowerCase() + " as an extra");
            span.appendChild(document.createTextNode(" "));
            span.appendChild(link);
          }
          li.append(icon("i-dash"), span);
          no.appendChild(li);
        });
        split.appendChild(no);
        card.appendChild(split);
      }
      rooms.appendChild(card);
    });
    panel.appendChild(rooms);
  }

  function select(service, opts) {
    opts = opts || {};
    tabs.forEach(function (tab) {
      var on = tab.getAttribute("data-tab") === service;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && opts.focus) {
        tab.focus();
      }
    });
    document.querySelectorAll("[data-panel]").forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-panel") !== service;
    });
    if (cta) {
      cta.href = "estimate.html?svc=" + service;
    }
    if (opts.push && window.history.replaceState) {
      window.history.replaceState(null, "", "#" + service);
    }
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () {
      select(tab.getAttribute("data-tab"), { push: true });
    });
    tab.addEventListener("keydown", function (event) {
      var next = null;
      if (event.key === "ArrowRight") {
        next = tabs[(i + 1) % tabs.length];
      } else if (event.key === "ArrowLeft") {
        next = tabs[(i - 1 + tabs.length) % tabs.length];
      } else if (event.key === "Home") {
        next = tabs[0];
      } else if (event.key === "End") {
        next = tabs[tabs.length - 1];
      }
      if (next) {
        event.preventDefault();
        select(next.getAttribute("data-tab"), { focus: true, push: true });
      }
    });
  });

  Object.keys(data.checklists).forEach(renderPanel);

  function fromHash() {
    var wanted = window.location.hash.replace("#", "");
    return data.checklists[wanted] ? wanted : "regular";
  }

  window.addEventListener("hashchange", function () {
    select(fromHash());
  });

  select(fromHash());
})();
