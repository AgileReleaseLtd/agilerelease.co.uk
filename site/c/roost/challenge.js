(function () {
  "use strict";

  var PKG = "uk.co.agilerelease.roost";

  function crc32(bytes) {
    var c, crc = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) {
      c = (crc ^ bytes[i]) & 0xFF;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      crc = (crc >>> 8) ^ c;
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function describe(payload) {
    if (!payload) return null;
    var raw;
    try { raw = atob(payload.replace(/-/g, "+").replace(/_/g, "/") + "="); } catch (e) { return null; }
    if (raw.length !== 8) return null;
    var b = [];
    for (var i = 0; i < 8; i++) b.push(raw.charCodeAt(i));
    if (b[0] !== 1) return null;
    var salted = [];
    var salt = "roost-challenge-v1";
    for (var j = 0; j < salt.length; j++) salted.push(salt.charCodeAt(j));
    if ((crc32(salted.concat(b.slice(0, 6))) & 0xFFFF) !== ((b[6] << 8) | b[7])) return null;
    var n = (b[1] << 8) | b[2];
    var secs = (b[3] << 8) | b[4];
    var miss = b[5];
    if (n < 1 || secs < 1 || miss > 2) return null;
    var clock = Math.floor(secs / 60) + ":" + (secs % 60 < 10 ? "0" : "") + (secs % 60);
    var errors = miss === 0 ? "with no mistakes" : (miss === 1 ? "with 1 mistake" : "with " + miss + " mistakes");
    return "Your friend solved Roost Daily #" + n + " in " + clock + " " + errors + ". Can you beat that?";
  }

  var p = new URLSearchParams(window.location.search).get("p") || "";
  if (!/^[A-Za-z0-9_-]{11}$/.test(p)) p = "";
  var line = describe(p);
  if (!line) p = "";

  var referrer = "utm_source=challenge&utm_medium=link" + (p ? "&c=" + p : "");
  var play = "https://play.google.com/store/apps/details?id=" + PKG + "&referrer=" + encodeURIComponent(referrer);

  document.getElementById("play").href = play;
  if (p) {
    var open = document.getElementById("open");
    open.href = "roost://c?p=" + p;
    open.hidden = false;
    document.getElementById("target").textContent = line;
  }

  var key = "roost-challenge-opened:" + p;
  var seen = false;
  try {
    seen = window.sessionStorage.getItem(key) === "1";
    window.sessionStorage.setItem(key, "1");
  } catch (e) { seen = false; }

  if (seen) {
    document.getElementById("note").textContent = "Install Roost from Google Play, or open the challenge if you already have it.";
  } else {
    window.location.href = play;
  }
})();
