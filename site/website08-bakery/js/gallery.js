/* The cake gallery: placeholder tiles (a drawing each, until the bakery's own photos go in), filtered by
   occasion. Each tile links to the order form with that cake's occasion, size, flavour and finish chosen.
   On the home page ([data-gallery-preview]) it shows one cake from each occasion and no filters. */
(function () {
  var data = window.Crumb;
  var Art = window.CrumbArt;
  var U = window.CrumbSite;
  var grid = document.querySelector("[data-gallery]");
  if (!grid || !Art || !U) {
    return;
  }
  var el = U.el;
  var preview = grid.hasAttribute("data-gallery-preview");
  var CATEGORY = { birthday: "Birthday", wedding: "Wedding", kids: "Kids", celebration: "Celebration" };

  function find(list, id) {
    return list.filter(function (x) {
      return x.id === id;
    })[0];
  }

  // The price of the cake as drawn: size, plus the sponge and finish extras for that size.
  function priceOf(g) {
    var c = data.cake;
    var size = find(c.sizes, g.size);
    var flavour = find(c.flavours, g.flavour);
    var finish = find(c.finishes, g.finish);
    var filling = g.filling ? find(c.fillings, g.filling) : null;
    return size.price + Math.round(flavour.extra * size.scale) + Math.round(finish.extra * size.scale) + (filling ? Math.round(filling.extra * size.scale) : 0);
  }

  function orderLink(g) {
    return "cakes.html?occasion=" + g.occasion + "&size=" + g.size + "&flavour=" + g.flavour + (g.filling ? "&filling=" + g.filling : "") + "&finish=" + g.finish + "&from=" + g.id + "#order";
  }

  function tile(g, i) {
    var c = data.cake;
    var size = find(c.sizes, g.size);
    var flavour = find(c.flavours, g.flavour);
    var finish = find(c.finishes, g.finish);

    var li = el("li", "tile tile-" + g.bg);
    li.setAttribute("data-category", g.category);
    var fig = el("figure", "tile-figure");
    var photo = el("div", "tile-photo");
    photo.innerHTML = Art.svg(Object.assign({ tiers: size.tiers, size: size.id, seed: i + 3, fit: "zoom" }, g.art));
    ["tl", "tr", "bl", "br"].forEach(function (corner) {
      photo.appendChild(el("span", "corner corner-" + corner));
    });
    var badge = el("span", "tile-badge");
    badge.append(U.icon("i-camera", "icon-sm"), document.createTextNode("Photo to come"));
    photo.appendChild(badge);
    fig.appendChild(photo);

    var cap = el("figcaption", "tile-caption");
    cap.appendChild(el("p", "tile-cat", CATEGORY[g.category]));
    var title = el("h3", "tile-title");
    cap.appendChild(title);
    var filling = g.filling ? find(c.fillings, g.filling) : null;
    cap.appendChild(el("p", "tile-meta", size.label + ", serves " + size.serves + ". " + flavour.label + (filling ? " with " + filling.label.toLowerCase() : "") + ", " + finish.label.toLowerCase() + "."));
    var foot = el("div", "tile-foot");
    foot.appendChild(el("p", "tile-price", "From " + U.money(priceOf(g))));
    if (preview) {
      // On the home page the whole tile is the link, through its title.
      var tlink = el("a", "tile-title-link", g.title);
      tlink.href = orderLink(g);
      tlink.appendChild(el("span", "visually-hidden", ": order one like this"));
      title.appendChild(tlink);
    } else {
      title.textContent = g.title;
      var link = el("a", "tile-link", "Order one like this");
      link.href = orderLink(g);
      link.setAttribute("aria-label", "Order a cake like " + g.title);
      link.appendChild(U.icon("i-arrow", "icon-sm"));
      foot.appendChild(link);
    }
    cap.appendChild(foot);
    fig.appendChild(cap);
    li.appendChild(fig);
    return li;
  }

  var list = data.gallery;
  if (preview) {
    // One from each occasion.
    var seen = {};
    list = list.filter(function (g) {
      if (seen[g.category]) {
        return false;
      }
      seen[g.category] = true;
      return true;
    });
  }
  grid.textContent = "";
  list.forEach(function (g) {
    grid.appendChild(tile(g, data.gallery.indexOf(g)));
  });

  /* ---------- Filters (gallery page) ---------- */

  var buttons = document.querySelectorAll("[data-gallery-filters] [data-filter]");
  var count = document.querySelector("[data-gallery-count]");
  if (!buttons.length) {
    return;
  }

  function apply(value, push) {
    if (!CATEGORY[value]) {
      value = "all";
    }
    var shown = 0;
    grid.querySelectorAll(".tile").forEach(function (t) {
      var on = value === "all" || t.getAttribute("data-category") === value;
      t.hidden = !on;
      if (on) {
        shown++;
      }
    });
    buttons.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === value));
    });
    if (count) {
      count.textContent = value === "all" ? "All " + shown + " cakes" : shown + " of " + data.gallery.length + " cakes: " + CATEGORY[value].toLowerCase();
    }
    if (push && window.history.replaceState) {
      var url = new URL(window.location.href);
      if (value === "all") {
        url.searchParams.delete("show");
      } else {
        url.searchParams.set("show", value);
      }
      window.history.replaceState(null, "", url);
    }
  }

  buttons.forEach(function (b) {
    b.addEventListener("click", function () {
      apply(b.getAttribute("data-filter"), true);
    });
  });

  apply(new URLSearchParams(window.location.search).get("show") || "all", false);
})();
