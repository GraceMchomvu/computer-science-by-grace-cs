/* Silent private visit counter for Computer Science By Grace.CS.
   Records visits in the background and never displays a badge or number. */
(function () {
  "use strict";
  var NS = "gracecs-site";
  var BASE = "https://abacus.jasoncameron.dev";
  var SESSION = "gcs-visit-session";
  var UNIQUE = "gcs-visit-unique";

  function storeGet(store, key) {
    try { return store.getItem(key); } catch (e) { return null; }
  }
  function storeSet(store, key, val) {
    try { store.setItem(key, val); } catch (e) {}
  }

  function hit(key) {
    try {
      var url = BASE + "/hit/" + encodeURIComponent(NS) + "/" + encodeURIComponent(key);
      if (typeof fetch === "function") {
        fetch(url, {
          mode: "no-cors",
          cache: "no-store",
          keepalive: true,
          credentials: "omit"
        }).catch(function () {});
      } else {
        var img = new Image();
        img.src = url;
      }
    } catch (e) {}
  }

  function todayEAT() {
    try {
      var parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Africa/Dar_es_Salaam",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).formatToParts(new Date());
      var map = {};
      for (var i = 0; i < parts.length; i++) map[parts[i].type] = parts[i].value;
      return map.year + "-" + map.month + "-" + map.day;
    } catch (e) {
      var d = new Date();
      var pad = function (n) { return (n < 10 ? "0" : "") + n; };
      return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    }
  }

  function safe(s, n) {
    return String(s || "")
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, n || 80) || "unknown";
  }

  function pageKey() {
    try {
      if (document.querySelector && document.querySelector("main.notfound")) return "page-404";
      var path = (location.pathname || "/").replace(/\/computer-science-by-grace-cs(?=\/|$)/, "");
      path = path.replace(/\/+$/, "") || "/";
      var name;
      if (path === "/" || path === "/index.html") name = "home";
      else name = path.replace(/^\//, "").replace(/\.html$/, "");
      name = safe(name, 60);
      if (name === "reader") {
        var doc = "";
        try { doc = new URLSearchParams(location.search).get("doc") || ""; } catch (e) {}
        if (doc) name = "reader-" + safe(doc, 40);
      }
      return "page-" + name;
    } catch (e) {
      return "page-unknown";
    }
  }

  try {
    if (!storeGet(sessionStorage, SESSION)) {
      storeSet(sessionStorage, SESSION, "1");
      hit("visits");
      hit("day-" + todayEAT());
    }
  } catch (e) {}

  try {
    if (!storeGet(localStorage, UNIQUE)) {
      storeSet(localStorage, UNIQUE, "1");
      hit("uniques");
    }
  } catch (e) {}

  try { hit(pageKey()); } catch (e) {}
})();
