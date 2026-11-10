/* The prices page: service prices for the chosen engine size and fuel, what each service includes, and
   guide prices for common repairs. Everything comes from data.js. */
(function () {
  var data = window.Gantry;
  var K = window.GantryKit;
  var el = K.el;

  var spec = document.querySelector("[data-spec]");
  var cards = document.querySelector("[data-service-cards]");
  var table = document.querySelector("[data-compare]");
  if (!spec || !cards || !table) {
    return;
  }
  var order = ["interim", "full", "major"];

  function size() {
    return spec.elements.size.value;
  }

  function fuel() {
    return spec.elements.fuel.value;
  }

  function fuelList(fuels) {
    return K.listWords(fuels.map(function (f) {
      return data.fuels[f].label.toLowerCase();
    }));
  }

  function bookLink(job, service) {
    return "mot.html?job=" + job + "&service=" + service + "&size=" + size() + "&fuel=" + fuel();
  }

  function renderCards() {
    cards.textContent = "";
    order.forEach(function (key) {
      var s = data.services[key];
      var card = el("article", "svc svc-" + key);
      card.appendChild(el("p", "svc-every", s.every));
      card.appendChild(el("h3", "svc-name", s.name));
      var price = el("p", "svc-price", K.money(K.servicePrice(key, size(), fuel())));
      card.appendChild(price);
      card.appendChild(el("p", "svc-for", data.sizes[size()].short + ", " + data.fuels[fuel()].label.toLowerCase()));
      card.appendChild(el("p", "svc-blurb", s.blurb));
      var takes = el("p", "svc-takes");
      takes.appendChild(K.icon("i-clock", "icon-sm"));
      takes.appendChild(document.createTextNode(s.takes + (s.morningOnly ? ". Morning drop-off." : ".")));
      card.appendChild(takes);

      var actions = el("div", "svc-actions");
      var word = s.short.toLowerCase();
      var book = el("a", "btn btn-dark btn-block", "Book " + (/^[aeiou]/.test(word) ? "an " : "a ") + word + " service");
      book.href = bookLink("service", key);
      var both = el("a", "btn btn-outline btn-block", "Add an MOT for " + K.money(data.mot.withService));
      both.href = bookLink("both", key);
      actions.append(book, both);
      card.appendChild(actions);
      cards.appendChild(card);
    });
  }

  function renderTable() {
    table.textContent = "";
    var caption = document.querySelector("[data-compare-for]");
    if (caption) {
      caption.textContent = "(" + data.sizes[size()].short + ", " + data.fuels[fuel()].label.toLowerCase() + ")";
    }
    // Only the rows for the chosen fuel: no fuel filter on a petrol car, no spark plugs on a diesel.
    data.checklist.filter(function (row) {
      return !row.fuel || row.fuel.indexOf(fuel()) > -1;
    }).forEach(function (row) {
      var tr = el("tr");
      var th = el("th", "", row.item);
      th.scope = "row";
      if (row.fuel) {
        var who = fuelList(row.fuel) + " cars";
        th.appendChild(el("small", "", who.charAt(0).toUpperCase() + who.slice(1)));
      }
      tr.appendChild(th);
      row.in.forEach(function (on) {
        var td = el("td");
        if (on) {
          var tick = el("span", "tick");
          tick.appendChild(K.icon("i-check"));
          td.appendChild(tick);
          td.appendChild(el("span", "visually-hidden", "Included"));
        } else {
          td.appendChild(el("span", "dash"));
          td.appendChild(el("span", "visually-hidden", "Not included"));
        }
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
  }

  function renderRepairs() {
    var list = document.querySelector("[data-repairs]");
    if (!list) {
      return;
    }
    list.textContent = "";
    data.repairs.forEach(function (r) {
      var li = el("li", "repair");
      var name = el("span", "repair-name", r.name);
      if (r.note) {
        name.appendChild(el("small", "", r.note));
      }
      var price = el("span", "repair-price");
      if (r.from) {
        price.appendChild(el("small", "", "from"));
      }
      price.appendChild(document.createTextNode(K.money(r.price)));
      var link = el("a", "repair-link", "Get a quote");
      link.href = "quote.html?job=" + r.job;
      link.setAttribute("aria-label", "Get a quote: " + r.name);
      li.append(name, price, link);
      list.appendChild(li);
    });
  }

  // The engine size and fuel buttons take their words from data.js.
  function renderSpec() {
    spec.querySelectorAll('input[name="size"]').forEach(function (input) {
      var sz = data.sizes[input.value];
      var span = input.nextElementSibling;
      span.textContent = "";
      span.appendChild(el("strong", "", sz.short));
      span.appendChild(el("small", "", sz.examples));
    });
    spec.querySelectorAll('input[name="fuel"]').forEach(function (input) {
      input.nextElementSibling.querySelector("strong").textContent = data.fuels[input.value].label;
    });
  }

  function render() {
    renderCards();
    renderTable();
    if (window.history.replaceState) {
      var url = new URL(window.location.href);
      url.searchParams.set("size", size());
      url.searchParams.set("fuel", fuel());
      window.history.replaceState(null, "", url);
    }
  }

  spec.addEventListener("change", render);
  spec.addEventListener("submit", function (event) {
    event.preventDefault();
  });

  // ?size=large&fuel=diesel, from links on other pages.
  var params = new URLSearchParams(window.location.search);
  if (data.sizes[params.get("size")]) {
    spec.querySelector('input[name="size"][value="' + params.get("size") + '"]').checked = true;
  }
  if (data.fuels[params.get("fuel")]) {
    spec.querySelector('input[name="fuel"][value="' + params.get("fuel") + '"]').checked = true;
  }
  renderSpec();
  renderCards();
  renderTable();
  renderRepairs();
})();
