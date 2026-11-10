/* Packing page: packing prices from data.js, and the box shop. An order becomes a WhatsApp message; nothing
   is sent to or stored by this website. */
(function () {
  var D = window.HT;
  var S = window.HTSite;
  var el = S.el;

  function money(n) {
    return "£" + n.toFixed(2);
  }

  /* ---------- Packing prices ---------- */

  var homes = ["studio", "bed1", "bed2", "bed3", "bed4", "bed5"];
  document.querySelectorAll("[data-pack-from]").forEach(function (node) {
    var key = node.getAttribute("data-pack-from");
    var low = Math.min.apply(null, homes.map(function (h) {
      return D.packingPrices[h][key];
    }));
    node.textContent = "£" + low;
  });
  var table = document.querySelector("[data-pack-table]");
  if (table) {
    table.textContent = "";
    homes.concat(["office1", "office2"]).forEach(function (h) {
      var tr = el("tr");
      var th = el("th", "", D.sizes[h].name);
      th.scope = "row";
      tr.appendChild(th);
      ["fragile", "partial", "full"].forEach(function (k) {
        var td = el("td", "num", "£" + D.packingPrices[h][k]);
        td.setAttribute("data-label", { fragile: "Fragile only", partial: "Kitchen and breakables", full: "Full packing" }[k]);
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
  }

  /* ---------- Box shop ---------- */

  var form = document.querySelector("[data-shop]");
  if (!form) {
    return;
  }
  var groupsBox = form.querySelector("[data-shop-groups]");
  var lines = document.querySelector("[data-order-lines]");
  var totalNode = document.querySelector("[data-order-total]");
  var deliveryBox = document.querySelector("[data-delivery]");
  var nameInput = document.getElementById("order-name");
  var postcodeInput = document.getElementById("order-postcode");
  var errors = {
    name: document.getElementById("order-name-error"),
    postcode: document.getElementById("order-postcode-error"),
    empty: document.querySelector("[data-order-error]")
  };
  var byId = {};

  D.materials.forEach(function (g) {
    var group = el("section", "shop-group");
    var h = el("h3", "shop-group-title", g.group);
    group.appendChild(h);
    var list = el("ul", "shop-items");
    g.items.forEach(function (m) {
      byId[m.id] = m;
      var li = el("li", "shop-item");
      var info = el("div", "shop-info");
      var name = el("label", "shop-name", m.name);
      name.htmlFor = "qty-" + m.id;
      info.appendChild(name);
      var detail = [m.size, m.use].filter(Boolean).join(". ");
      if (detail) {
        info.appendChild(el("p", "shop-detail", detail));
      }
      var price = el("p", "shop-price", money(m.price));
      var box = el("div", "stepper");
      var minus = el("button", "stepper-btn");
      minus.type = "button";
      minus.setAttribute("data-step", "-1");
      minus.setAttribute("aria-label", "One fewer: " + m.name);
      minus.appendChild(S.icon("i-minus"));
      var qty = el("input", "stepper-input");
      qty.type = "number";
      qty.inputMode = "numeric";
      qty.min = "0";
      qty.max = "200";
      qty.value = "0";
      qty.id = "qty-" + m.id;
      qty.setAttribute("data-id", m.id);
      var plus = el("button", "stepper-btn");
      plus.type = "button";
      plus.setAttribute("data-step", "1");
      plus.setAttribute("aria-label", "One more: " + m.name);
      plus.appendChild(S.icon("i-plus"));
      box.append(minus, qty, plus);
      li.append(info, price, box);
      list.appendChild(li);
    });
    group.appendChild(list);
    groupsBox.appendChild(group);
  });

  D.delivery.forEach(function (d, i) {
    var row = el("div", "radio-row");
    var r = el("input");
    r.type = "radio";
    r.name = "delivery";
    r.value = d.id;
    r.id = "delivery-" + d.id;
    r.checked = i === 0;
    var label = el("label", "", d.name);
    label.htmlFor = r.id;
    label.appendChild(el("span", "radio-price", d.fee ? "£" + d.fee : "Free"));
    row.append(r, label);
    deliveryBox.appendChild(row);
  });

  function order() {
    var out = [];
    form.querySelectorAll(".stepper-input").forEach(function (f) {
      var n = Math.max(0, Math.min(200, Math.floor(+f.value || 0)));
      if (n) {
        out.push({ item: byId[f.getAttribute("data-id")], qty: n });
      }
    });
    return out;
  }

  function delivery() {
    var checked = deliveryBox.querySelector("input:checked");
    return D.delivery.filter(function (d) {
      return checked && d.id === checked.value;
    })[0] || D.delivery[0];
  }

  function update() {
    var items = order();
    var del = delivery();
    lines.textContent = "";
    var total = 0;
    if (!items.length) {
      lines.appendChild(el("li", "order-empty", "Nothing yet. Use the + buttons to add boxes and wrap."));
    }
    items.forEach(function (o) {
      var sub = o.qty * o.item.price;
      total += sub;
      var li = el("li");
      li.append(el("span", "", o.qty + " × " + o.item.name), el("span", "num", money(sub)));
      lines.appendChild(li);
    });
    if (items.length && del.fee) {
      total += del.fee;
      var li = el("li", "order-delivery-line");
      li.append(el("span", "", "Delivery"), el("span", "num", money(del.fee)));
      lines.appendChild(li);
    }
    totalNode.textContent = money(total);
    form.querySelectorAll(".shop-item").forEach(function (row) {
      row.classList.toggle("has-value", +row.querySelector("input").value > 0);
    });
    if (items.length) {
      errors.empty.hidden = true;
    }
    return { items: items, delivery: del, total: total };
  }

  form.addEventListener("click", function (event) {
    var b = event.target.closest("[data-step]");
    if (!b) {
      return;
    }
    var f = b.parentNode.querySelector("input");
    f.value = String(Math.max(0, Math.min(200, (Math.floor(+f.value) || 0) + +b.getAttribute("data-step"))));
    update();
  });
  form.addEventListener("input", update);
  form.addEventListener("submit", function (event) {
    event.preventDefault();
  });
  deliveryBox.addEventListener("change", update);

  function setError(input, node, on) {
    node.hidden = !on;
    if (on) {
      input.setAttribute("aria-invalid", "true");
    } else {
      input.removeAttribute("aria-invalid");
    }
  }

  document.querySelector("[data-order-send]").addEventListener("click", function () {
    var o = update();
    var needsPostcode = o.delivery.id === "home" || o.delivery.id === "london";
    var badName = !nameInput.value.trim();
    var badPostcode = needsPostcode && !postcodeInput.value.trim();
    setError(nameInput, errors.name, badName);
    setError(postcodeInput, errors.postcode, badPostcode);
    errors.empty.hidden = !!o.items.length;
    if (!o.items.length) {
      form.querySelector(".stepper-btn[data-step='1']").focus();
      return;
    }
    if (badName) {
      nameInput.focus();
      return;
    }
    if (badPostcode) {
      postcodeInput.focus();
      return;
    }
    var msg = ["Hi " + D.name + ", I'd like to order some packing materials.", ""];
    o.items.forEach(function (x) {
      msg.push(x.qty + " × " + x.item.name + " (" + money(x.item.price) + " each) = " + money(x.qty * x.item.price));
    });
    msg.push("Delivery: " + o.delivery.says + (o.delivery.fee ? " (" + money(o.delivery.fee) + ")" : " (free)"));
    msg.push("Total: " + money(o.total), "");
    msg.push("Name: " + nameInput.value.trim());
    if (postcodeInput.value.trim()) {
      msg.push("Postcode: " + postcodeInput.value.trim().toUpperCase());
    }
    S.sendWhatsApp(msg.join("\n"), "order");
  });

  [nameInput, postcodeInput].forEach(function (input) {
    input.addEventListener("input", function () {
      if (input.value.trim()) {
        setError(input, input === nameInput ? errors.name : errors.postcode, false);
      }
    });
  });

  update();
})();
