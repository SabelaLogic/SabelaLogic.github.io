/* City landing. Copy and colours come from config.js only. */
(function () {
  "use strict";

  var cfg = window.APP_CONFIG;
  if (!cfg || !cfg.cities || !cfg.cities.length) return;

  var ICONS = ["\u2600\uFE0F", "\uD83C\uDFE0", "\uD83D\uDCAC"];
  var geoLine = document.getElementById("geoLine");
  var picked = false;

  function $(id) { return document.getElementById(id); }

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function cityByName(name) {
    var n = norm(name);
    for (var i = 0; i < cfg.cities.length; i++) {
      if (norm(cfg.cities[i].name) === n) return cfg.cities[i];
    }
    return null;
  }

  function defaultCity() {
    for (var i = 0; i < cfg.cities.length; i++) {
      if (cfg.cities[i].default) return cfg.cities[i];
    }
    return cfg.cities[0];
  }

  function applyTheme() {
    var c = (cfg.brand && cfg.brand.colors) || {};
    var root = document.documentElement;
    if (c.primary) root.style.setProperty("--primary", c.primary);
    if (c.primaryDark) root.style.setProperty("--primary-dark", c.primaryDark);
    if (c.accent) root.style.setProperty("--accent", c.accent);
    if (c.ink) root.style.setProperty("--ink", c.ink);
    if (c.bg) root.style.setProperty("--bg", c.bg);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta && c.primary) meta.setAttribute("content", c.primary);
  }

  function digits(n) { return String(n || "").replace(/\D/g, ""); }

  function setReason(city, text) {
    var name = city.name;
    var prefix = "Showing " + name;
    geoLine.replaceChildren();
    if (text.indexOf(prefix) === 0) {
      geoLine.append("Showing ");
      var strong = document.createElement("strong");
      strong.textContent = name;
      geoLine.appendChild(strong);
      geoLine.append(text.slice(prefix.length));
    } else {
      geoLine.textContent = text;
    }
  }

  function fillList(ul, items, className) {
    ul.replaceChildren();
    (items || []).forEach(function (item) {
      var li = document.createElement("li");
      if (className) li.className = className;
      li.textContent = item;
      ul.appendChild(li);
    });
  }

  function render(city, reason, ready) {
    var brand = cfg.brand || {};
    $("brandName").textContent = brand.name || "Solar";
    $("tagline").textContent = brand.tagline || "";
    $("logo").textContent = brand.logoText || "RS";
    document.title = (brand.name || "Solar") + " \u00b7 " + city.name + (cfg.demo ? " \u00b7 Demo" : "");

    $("headline").textContent = city.headline || ("Solar for " + city.name);
    $("blurb").textContent = city.blurb || "";

    var benefits = $("benefits");
    benefits.replaceChildren();
    (city.benefits || []).slice(0, 3).forEach(function (text, i) {
      var li = document.createElement("li");
      var mark = document.createElement("span");
      mark.className = "mark";
      mark.setAttribute("aria-hidden", "true");
      mark.textContent = ICONS[i] || "\u2022";
      var p = document.createElement("p");
      p.textContent = text;
      li.appendChild(mark);
      li.appendChild(p);
      benefits.appendChild(li);
    });

    $("priceLine").textContent = city.priceLine || "";
    fillList($("areas"), city.areas || []);

    var num = digits(cfg.whatsapp && cfg.whatsapp.number);
    var msg = city.whatsappMessage || ("Hi, I'm in " + city.name + ". I'd like a solar quote.");
    var wa = $("waBtn");
    wa.href = "https://wa.me/" + num + "?text=" + encodeURIComponent(msg);
    $("waLabel").textContent = "WhatsApp a " + city.name + " quote";

    var buttons = document.querySelectorAll("#switcher button");
    buttons.forEach(function (b) {
      var on = b.getAttribute("data-city") === city.name;
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });

    setReason(city, reason);
    geoLine.dataset.ready = ready ? "1" : "0";

    var foot = $("footerNote");
    foot.replaceChildren();
    var shown = num;
    if (num.length === 11 && num.indexOf("27") === 0) {
      shown = "+27 " + num.slice(2, 4) + " " + num.slice(4, 7) + " " + num.slice(7);
    } else if (num) {
      shown = "+" + num;
    }
    if (cfg.demo) {
      foot.append("Demo only. " + ((cfg.brand && cfg.brand.name) || "This brand") + ", the prices and ");
      var code = document.createElement("strong");
      code.textContent = shown;
      foot.appendChild(code);
      foot.append(" are fictional. City is guessed from your connection (not GPS) via ");
    } else {
      foot.append("City is estimated from your internet connection, not GPS, via ");
    }
    var a = document.createElement("a");
    a.href = "https://www.geojs.io/";
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = "GeoJS";
    foot.appendChild(a);
    foot.append(". Switch city any time.");
  }

  function inSouthAfrica(data) {
    var cc = String(data.country_code || "").toUpperCase();
    if (cc) return cc === "ZA";
    var country = norm(data.country);
    if (!country) return true;
    return country === "south africa" || country === "za";
  }

  // Whole-phrase match so "Park" does not hit "Fichardt Park".
  function placeHit(geoCity, label) {
    var hay = norm(geoCity);
    var needle = norm(label);
    if (!hay || !needle) return false;
    if (hay === needle) return true;
    return (" " + hay + " ").indexOf(" " + needle + " ") !== -1;
  }

  function resolveGeo(data) {
    var cityName = norm(data.city);
    var region = norm(data.region || data.region_name);
    var via = String(data.city || data.region || data.country || "an unknown place").trim();
    var sa = inSouthAfrica(data);
    var i, c, keys, k;

    for (i = 0; i < cfg.cities.length; i++) {
      c = cfg.cities[i];
      if (cityName && (norm(c.name) === cityName || placeHit(data.city, c.name))) {
        return {
          city: c,
          reason: "Showing " + c.name + " because that's where your connection is."
        };
      }
    }

    if (sa) {
      for (i = 0; i < cfg.cities.length; i++) {
        c = cfg.cities[i];
        keys = c.match || [];
        for (k = 0; k < keys.length; k++) {
          if (placeHit(data.city, keys[k])) {
            return {
              city: c,
              reason: "Showing " + c.name + " because your connection is in " + via + ", which we cover from " + c.name + "."
            };
          }
        }
      }

      if (region.indexOf("gauteng") !== -1) {
        c = cityByName("Pretoria") || defaultCity();
        return {
          city: c,
          reason: "Showing " + c.name + " because your connection is in Gauteng" + (data.city ? " (" + data.city + ")" : "") + "."
        };
      }
    }

    c = defaultCity();
    if (via && norm(via) !== "an unknown place") {
      return {
        city: c,
        reason: "Showing " + c.name + " \u2014 your connection is in " + via + ", outside our three cities."
      };
    }
    return {
      city: c,
      reason: "Showing " + c.name + " \u2014 we couldn't read your location, so this is the default."
    };
  }

  function buildSwitcher() {
    var nav = $("switcher");
    cfg.cities.forEach(function (city) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = city.name;
      b.setAttribute("data-city", city.name);
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () {
        picked = true;
        var url = new URL(location.href);
        url.searchParams.set("city", city.name);
        history.replaceState(null, "", url);
        render(city, "Showing " + city.name + " because you selected it.", true);
      });
      nav.appendChild(b);
    });
  }

  function showRibbon() {
    if (!cfg.demo) return;
    var ribbon = $("ribbon");
    ribbon.hidden = false;
    var brand = (cfg.brand && cfg.brand.name) || "This installer";
    ribbon.textContent = "Demo \u00b7 " + brand + " is fictional";
  }

  async function detect() {
    var param = new URLSearchParams(location.search).get("city");
    var fromLink = param ? cityByName(param) : null;
    var fallback = defaultCity();

    if (fromLink) {
      picked = true;
      render(fromLink, "Showing " + fromLink.name + " because you opened this link with ?city=.", true);
      return;
    }

    render(fallback, "Checking where your connection is\u2026", false);

    var endpoint = (cfg.geo && cfg.geo.endpoint) || "https://get.geojs.io/v1/ip/geo.json";
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 5000);
    try {
      var res = await fetch(endpoint, { signal: ctrl.signal, cache: "no-store" });
      if (!res.ok) throw new Error("status " + res.status);
      var data = await res.json();
      if (picked) return;
      var resolved = resolveGeo(data || {});
      render(resolved.city, resolved.reason, true);
    } catch (err) {
      if (picked) return;
      render(
        fallback,
        "Showing " + fallback.name + " \u2014 we couldn't read your location, so this is the default.",
        true
      );
    } finally {
      clearTimeout(timer);
    }
  }

  applyTheme();
  showRibbon();
  buildSwitcher();
  detect();
})();
