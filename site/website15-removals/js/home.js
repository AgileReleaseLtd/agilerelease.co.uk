/* Home page: the quick estimate in the hero. A weekday move with easy access at both ends; the full
   calculator on quote.html adds stairs, parking, the day and packing. */
(function () {
  var D = window.HT;
  var E = window.HTEstimate;
  var S = window.HTSite;

  var form = document.querySelector("[data-quick]");
  if (!form) {
    return;
  }
  var size = form.elements.size;
  var from = form.elements.from;
  var to = form.elements.to;
  var box = form.querySelector("[data-quick-result]");
  var link = form.querySelector("[data-quick-link]");
  var easy = { floor: 0, lift: false, parking: "easy" };

  from.classList.add("code-input");
  to.classList.add("code-input");

  function rangeText(r) {
    return E.money(r.low) + " to " + E.money(r.high);
  }

  function run(input) {
    return E.estimate({
      mode: "rooms", size: input.size, fullness: "average", from: input.from, to: input.to,
      pickup: easy, dropoff: easy, day: "any", packing: "none"
    });
  }

  function update() {
    var s = size.value;
    var f = from.value.trim();
    var t = to.value.trim();
    var q = new URLSearchParams();
    if (s === "items") {
      q.set("mode", "items");
    } else {
      q.set("size", s);
    }
    if (E.outward(f)) {
      q.set("from", E.outward(f));
    }
    if (E.outward(t)) {
      q.set("to", E.outward(t));
    }
    link.href = "quote.html?" + q.toString();

    box.textContent = "";
    if (s === "items") {
      var p = S.el("p", "quick-idle");
      p.append("Small moves are priced by the item, from ");
      p.appendChild(S.el("strong", "", S.pounds(S.rate("small", 1)) + " an hour"));
      p.append(" for a van and a mover. Pick your items on the full calculator.");
      box.appendChild(p);
      link.firstChild.textContent = "Pick your items ";
      return;
    }
    link.firstChild.textContent = "Fine-tune your estimate ";

    var badFrom = f && !E.lookup(f);
    var badTo = t && !E.lookup(t);
    if (badFrom || badTo) {
      box.appendChild(S.el("p", "quick-problem", "We can't find “" + (badFrom ? f : t).toUpperCase().slice(0, 12) + "”. Try the first part of the postcode, like N7 or SE15."));
      return;
    }
    if (!f || !t) {
      var ex = run({ size: s, from: "N7", to: "SE15" });
      var idle = S.el("p", "quick-idle");
      var short = D.sizes[s].short;
      idle.append("For example, " + (/^[aeiou]/.test(short) ? "an " : "a ") + short + " move from N7 to SE15 is about ");
      idle.appendChild(S.el("strong", "", rangeText(ex)));
      idle.append(" on a weekday. Add your postcodes for yours.");
      box.appendChild(idle);
      return;
    }
    var r = run({ size: s, from: f, to: t });
    if (!r.ok) {
      return;
    }
    var price = S.el("p", "quick-price");
    price.appendChild(S.el("small", "", "Weekday estimate"));
    price.append(rangeText(r));
    box.appendChild(price);
    box.appendChild(S.el("p", "quick-detail", E.crewText(r.load.van, r.crew) + ", about " + E.hoursShort(r.hours) + ". Roughly " + Math.max(1, Math.round(r.route.miles)) + " miles by road."));
  }

  form.addEventListener("input", update);
  form.addEventListener("change", update);
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    window.location.href = link.href;
  });
  update();
})();
