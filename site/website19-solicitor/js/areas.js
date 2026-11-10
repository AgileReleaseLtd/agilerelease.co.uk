/* Practice areas, from data.js: the divider cards on the home page, and the full plain-English guides on
   practice-areas.html (what each covers, the steps and timescales, what we need from you, who handles it). */
(function () {
  var data = window.QM;
  var U = window.QMUtil;
  var el = U.el;

  homeCards();
  guides();

  /* ---------- Home page cards ---------- */

  function homeCards() {
    var list = document.querySelector("[data-area-cards]");
    if (!list) {
      return;
    }
    list.textContent = "";
    data.areas.forEach(function (a) {
      var li = el("li", "divider-card tab-" + a.tab);
      var tab = el("span", "divider-tab");
      tab.appendChild(U.icon(a.icon));
      tab.appendChild(document.createTextNode(a.tabLabel));
      tab.setAttribute("aria-hidden", "true");
      li.appendChild(tab);

      var h3 = el("h3");
      var link = el("a", "", a.name);
      link.href = "practice-areas.html#" + a.id;
      h3.appendChild(link);
      li.appendChild(h3);
      li.appendChild(el("p", "divider-short", a.short));

      var ul = el("ul", "divider-list");
      a.points.forEach(function (text) {
        var item = el("li");
        item.appendChild(U.icon("i-check"));
        item.appendChild(el("span", "", text));
        ul.appendChild(item);
      });
      li.appendChild(ul);

      var foot = el("div", "divider-foot");
      foot.appendChild(el("p", "divider-price", a.fromPrice));
      var team = el("ul", "mini-team");
      team.setAttribute("aria-label", "Handled by " + a.team.map(function (id) {
        return U.person(id).name;
      }).join(" and "));
      a.team.forEach(function (id) {
        var p = U.person(id);
        var m = el("li");
        var mono = el("span", "mono-sm " + U.personTab(p), p.initials);
        mono.title = p.name;
        mono.setAttribute("aria-hidden", "true");
        m.appendChild(mono);
        team.appendChild(m);
      });
      foot.appendChild(team);
      li.appendChild(foot);
      list.appendChild(li);
    });
  }

  /* ---------- Practice areas page ---------- */

  function guides() {
    var box = document.querySelector("[data-areas]");
    if (!box) {
      return;
    }
    box.textContent = "";
    data.areas.forEach(function (a) {
      box.appendChild(areaSection(a));
    });

    // The guides are drawn after the page loads, so jump to the area or guide named in the address
    // (#family, or #wills-probate-and-estates for one guide), now and whenever the address changes.
    showHash();
    window.addEventListener("hashchange", showHash);
  }

  function showHash() {
    var id = decodeURIComponent((window.location.hash || "").slice(1));
    if (!id) {
      return;
    }
    var target = document.getElementById(id);
    var guideTab = document.querySelector('[data-guide-id="' + id + '"]');
    if (guideTab) {
      guideTab.click();
      target = guideTab.closest(".area");
    }
    if (target) {
      target.scrollIntoView();
    }
  }

  function areaSection(a) {
    var section = el("section", "area tab-" + a.tab);
    section.id = a.id;
    section.setAttribute("aria-labelledby", a.id + "-title");
    var wrap = el("div", "wrap");

    var head = el("header", "area-head");
    var tab = el("p", "area-tab");
    tab.appendChild(U.icon(a.icon));
    tab.appendChild(document.createTextNode(a.tabLabel));
    head.appendChild(tab);
    var h2 = el("h2", "h2", a.name);
    h2.id = a.id + "-title";
    head.appendChild(h2);
    head.appendChild(el("p", "area-intro", a.intro));
    wrap.appendChild(head);

    var panels = a.guides.map(function (g) {
      return guidePanel(a, g);
    });

    if (a.guides.length > 1) {
      wrap.appendChild(guideTabs(a, panels));
    }
    panels.forEach(function (p) {
      wrap.appendChild(p);
    });
    section.appendChild(wrap);
    return section;
  }

  function slug(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  // Buying / Selling / Remortgaging switcher: an ARIA tab list, with arrow keys.
  function guideTabs(a, panels) {
    var list = el("div", "guide-tabs");
    list.setAttribute("role", "tablist");
    list.setAttribute("aria-label", a.name + " guides");
    var tabs = a.guides.map(function (g, i) {
      var b = el("button", "guide-tab", g.short || g.title);
      b.type = "button";
      b.id = a.id + "-tab-" + i;
      b.setAttribute("role", "tab");
      b.setAttribute("aria-controls", panels[i].id);
      b.setAttribute("data-guide-id", a.id + "-" + slug(g.title));
      panels[i].setAttribute("role", "tabpanel");
      panels[i].setAttribute("aria-labelledby", b.id);
      list.appendChild(b);
      return b;
    });

    function select(index, focus) {
      tabs.forEach(function (t, i) {
        var on = i === index;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;
      });
      if (focus) {
        tabs[index].focus();
      }
    }

    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () {
        select(i);
      });
      t.addEventListener("keydown", function (event) {
        var next = null;
        if (event.key === "ArrowRight") {
          next = (i + 1) % tabs.length;
        } else if (event.key === "ArrowLeft") {
          next = (i - 1 + tabs.length) % tabs.length;
        } else if (event.key === "Home") {
          next = 0;
        } else if (event.key === "End") {
          next = tabs.length - 1;
        }
        if (next !== null) {
          event.preventDefault();
          select(next, true);
        }
      });
    });
    select(0);
    return list;
  }

  function guidePanel(a, g) {
    var panel = el("div", "guide");
    panel.id = a.id + "-" + slug(g.title);

    var main = el("div", "guide-main");
    if (a.guides.length > 1) {
      main.appendChild(el("h3", "guide-title", g.title));
    }

    main.appendChild(el("h3", "sub-title", "What it covers"));
    var covers = el("ul", "tick-list");
    g.covers.forEach(function (c) {
      covers.appendChild(el("li", "", c));
    });
    main.appendChild(covers);

    main.appendChild(el("h3", "sub-title", "Steps and timescales"));
    var tl = el("ol", "timeline");
    g.steps.forEach(function (s, i) {
      var li = el("li");
      var num = el("span", "tl-num", String(i + 1));
      num.setAttribute("aria-hidden", "true");
      li.appendChild(num);
      var h = el("div", "tl-head");
      h.appendChild(el("h4", "", s.title));
      var time = el("span", "tl-time");
      time.appendChild(U.icon("i-calendar"));
      time.appendChild(document.createTextNode(s.time));
      h.appendChild(time);
      li.appendChild(h);
      li.appendChild(el("p", "", s.text));
      tl.appendChild(li);
    });
    main.appendChild(tl);

    if (g.note) {
      var note = el("p", "guide-note");
      note.appendChild(U.icon("i-info"));
      note.appendChild(el("span", "", g.note));
      main.appendChild(note);
    }
    panel.appendChild(main);

    var side = el("div", "guide-side");

    var need = el("div", "side-card");
    need.appendChild(el("h3", "", "What we'll need from you"));
    var nl = el("ul", "need-list");
    g.provide.forEach(function (p) {
      var li = el("li");
      var box = el("span", "need-box");
      box.setAttribute("aria-hidden", "true");
      li.appendChild(box);
      li.appendChild(el("span", "", p));
      nl.appendChild(li);
    });
    need.appendChild(nl);
    side.appendChild(need);

    var who = el("div", "side-card");
    who.appendChild(el("h3", "", "Who handles it"));
    var wl = el("ul", "who-list");
    a.team.forEach(function (id) {
      wl.appendChild(U.whoItem(U.person(id)));
    });
    who.appendChild(wl);
    side.appendChild(who);

    var price = el("div", "side-card");
    price.appendChild(el("h3", "", "Price"));
    price.appendChild(el("p", "side-price", g.price || a.fromPrice));
    price.appendChild(el("p", "hint", "VAT is 20%. Fees paid to others are listed on the prices page."));
    var actions = el("div", "side-actions");
    var enquire = el("a", "btn btn-primary", "Enquire about this");
    enquire.href = "enquiry.html?matter=" + (g.enquire || a.enquire);
    var prices = el("a", "btn btn-outline", "See the full prices");
    prices.href = g.priceLink || a.priceLink;
    actions.append(enquire, prices);
    price.appendChild(actions);
    side.appendChild(price);

    panel.appendChild(side);
    return panel;
  }
})();
