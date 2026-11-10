/* The team, from data.js: the strip on the home page and the full cards on team.html. Monograms only, no
   photos. SRA ID numbers are shown as "example" slots because the firm and its people are made up. */
(function () {
  var data = window.QM;
  var U = window.QMUtil;
  var el = U.el;

  strip();
  cards();

  function strip() {
    var list = document.querySelector("[data-team-strip]");
    if (!list) {
      return;
    }
    list.textContent = "";
    data.team.forEach(function (p) {
      var li = el("li");
      li.appendChild(U.monogram(p));
      var link = el("a", "", p.name);
      link.href = "team.html#" + p.id;
      li.appendChild(link);
      li.appendChild(el("p", "role", p.role));
      list.appendChild(li);
    });
  }

  function cards() {
    var list = document.querySelector("[data-team]");
    if (!list) {
      return;
    }
    list.textContent = "";
    data.team.forEach(function (p) {
      var li = el("li", "person");
      li.id = p.id;
      li.setAttribute("aria-labelledby", p.id + "-name");

      var head = el("div", "person-head");
      head.appendChild(U.monogram(p, "monogram-lg"));
      var names = el("div");
      var h2 = el("h2", "person-name", p.name);
      h2.id = p.id + "-name";
      names.appendChild(h2);
      names.appendChild(el("p", "person-role", p.role));
      head.appendChild(names);
      li.appendChild(head);

      var qual = el("p", "person-qual");
      qual.appendChild(el("span", "qual" + (p.solicitor ? "" : " qual-not"), U.personQual(p)));
      if (p.solicitor) {
        var sra = el("span", "sra-id", "SRA ID: ");
        sra.appendChild(el("span", "example-slot", "example"));
        qual.appendChild(sra);
      }
      li.appendChild(qual);

      if (p.firmRole) {
        li.appendChild(el("p", "firm-role", p.firmRole));
      }

      li.appendChild(el("p", "person-bio", p.bio));

      var chips = el("ul", "chips");
      chips.setAttribute("aria-label", "Specialisms");
      var tab = U.personTab(p);
      p.specialisms.forEach(function (s) {
        chips.appendChild(el("li", "chip " + tab, s));
      });
      li.appendChild(chips);

      var foot = el("dl", "person-foot");
      function row(label, value) {
        var div = el("div");
        div.appendChild(el("dt", "", label));
        div.appendChild(el("dd", "", value));
        foot.appendChild(div);
      }
      if (p.areas.length) {
        row("Works on:", p.areas.map(function (id) {
          return U.area(id).name;
        }).join(", "));
      }
      if (p.supervisedBy) {
        row("Supervised by:", U.person(p.supervisedBy).name);
      }
      if (p.supervises && p.supervises.length) {
        row("Supervises:", p.supervises.map(function (id) {
          return U.person(id).name;
        }).join(", "));
      }
      row("Speaks:", p.languages);
      li.appendChild(foot);
      list.appendChild(li);
    });

    // The cards were drawn after the page loaded, so jump to the person named in the address (#rhys).
    var id = decodeURIComponent((window.location.hash || "").slice(1));
    var target = id && document.getElementById(id);
    if (target) {
      target.scrollIntoView();
    }
  }
})();
