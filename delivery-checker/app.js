(function () {
  "use strict";
  const C = window.APP_CONFIG, Z = window.ZoneLogic;
  const $ = s => document.querySelector(s);
  const cur = C.delivery.currency;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- 1. Apply branding from config ---------- */
  const root = document.documentElement.style, col = C.brand.colors;
  root.setProperty("--primary", col.primary); root.setProperty("--primary-dark", col.primaryDark);
  root.setProperty("--accent", col.accent); root.setProperty("--ink", col.ink); root.setProperty("--bg", col.bg);
  document.querySelector('meta[name="theme-color"]').setAttribute("content", col.primary);
  document.title = `${C.brand.name} · Do we deliver to you?`;
  $("#brandName").textContent = C.brand.name;
  $("#brandTagline").textContent = C.brand.tagline;
  $("#logo").innerHTML = C.brand.logoImage ? `<img src="${esc(C.brand.logoImage)}" alt="">` : esc(C.brand.logoText);
  $("#storeName").textContent = C.store.name;
  $("#storeAddr").textContent = C.store.address;
  $("#storeHours").textContent = C.store.openHours;
  const maxKm = Math.max(...C.zones.map(z => z.maxKm));
  $("#minOrder").textContent = `Delivery up to ${maxKm} km · min. order ${cur}${C.delivery.minOrder}`;
  $("#demoRibbon").hidden = !C.demo;
  $("#footDemo").hidden = !C.demo;

  /* ---------- 2. Map ---------- */
  const store = L.latLng(C.store.lat, C.store.lng);
  const map = L.map("map", { zoomControl: true, scrollWheelZoom: false, tap: true });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  [...C.zones].sort((a, b) => b.maxKm - a.maxKm).forEach(z => {
    L.circle(store, { radius: z.maxKm * 1000, color: z.color, weight: 2, fillColor: z.color, fillOpacity: 0.10, dashArray: "6 6" })
      .bindTooltip(`${z.name} · up to ${z.maxKm} km · ${cur}${z.fee}`).addTo(map);
  });
  (C.polygonZones || []).forEach(p => {
    L.polygon(p.coords, { color: p.color, weight: 2, fillColor: p.color, fillOpacity: 0.18 })
      .bindTooltip(`${p.name} · ${cur}${p.fee}`).addTo(map);
  });
  const storeIcon = L.divIcon({ className: "", html: `<div class="store-pin">${esc(C.brand.logoText)}</div>`, iconSize: [40, 40], iconAnchor: [20, 20] });
  L.marker(store, { icon: storeIcon, title: C.store.name, keyboard: false }).bindPopup(`<b>${esc(C.store.name)}</b><br>${esc(C.store.address)}`).addTo(map);
  map.fitBounds(store.toBounds(maxKm * 2000), { padding: [6, 6], animate: false });
  let meMarker = null, meLine = null;

  const legend = $("#legend");
  legend.innerHTML = C.zones.map((z, i) => {
    const from = i === 0 ? 0 : C.zones[i - 1].maxKm;
    return `<li><i style="background:${z.color}"></i>${from}–${z.maxKm} km · ${cur}${z.fee}</li>`;
  }).join("") + (C.polygonZones || []).map(p => `<li><i style="background:${p.color}"></i>${esc(p.name)} · ${cur}${p.fee}</li>`).join("")
    + `<li><i style="background:#999"></i>${maxKm}+ km · collection</li>`;

  /* ---------- 3. Geocoding (Photon for autocomplete, Nominatim for search/reverse) ---------- */
  const G = C.geocoding, [bx1, by1, bx2, by2] = G.biasBox;
  const cache = new Map();
  let lastNominatim = 0;
  async function nominatim(path, params) {
    // Usage policy: max 1 request/second, no autocomplete, cache results, attribute OSM.
    const wait = Math.max(0, lastNominatim + 1100 - Date.now());
    if (wait) await new Promise(r => setTimeout(r, wait));
    lastNominatim = Date.now();
    const q = new URLSearchParams({ format: "jsonv2", addressdetails: "1", "accept-language": "en", ...params });
    if (G.contactEmail) q.set("email", G.contactEmail);
    const key = path + q; if (cache.has(key)) return cache.get(key);
    const res = await fetch(`https://nominatim.openstreetmap.org/${path}?${q}`, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("Address service busy (" + res.status + ")");
    const data = await res.json(); cache.set(key, data); return data;
  }
  async function searchAddress(text) {
    const data = await nominatim("search", { q: text, countrycodes: G.countryCode, limit: "1", viewbox: `${bx1},${by2},${bx2},${by1}`, bounded: "0" });
    if (data.length) return { lat: +data[0].lat, lng: +data[0].lon, label: prettyNominatim(data[0]) };
    const ph = await photon(text, 1); // fallback
    return ph[0] || null;
  }
  async function reverse(lat, lng) {
    try { const d = await nominatim("reverse", { lat, lon: lng, zoom: "18" }); return d && d.display_name ? prettyNominatim(d) : null; }
    catch { return null; }
  }
  function prettyNominatim(d) {
    const a = d.address || {};
    const street = [a.house_number, a.road].filter(Boolean).join(" ");
    const parts = [d.name && d.name !== a.road ? d.name : null, street, a.suburb || a.neighbourhood || a.quarter, a.city || a.town || a.village].filter(Boolean);
    return parts.length ? [...new Set(parts)].join(", ") : d.display_name;
  }
  let photonCtl = null;
  async function photon(text, limit = 6) {
    const q = new URLSearchParams({ q: text, limit: String(limit + 4), lang: "en", lat: C.store.lat, lon: C.store.lng, bbox: "16.3,-35.0,33.0,-22.0" });
    const key = "ph" + q; if (cache.has(key)) return cache.get(key);
    if (photonCtl) photonCtl.abort(); photonCtl = new AbortController();
    const res = await fetch(`https://photon.komoot.io/api/?${q}`, { signal: photonCtl.signal });
    if (!res.ok) throw new Error("Search unavailable");
    const js = await res.json();
    const seen = new Set();
    const out = js.features.filter(f => (f.properties.countrycode || "").toUpperCase() === G.countryCode.toUpperCase()).map(f => {
      const p = f.properties;
      const main = p.name || [p.housenumber, p.street].filter(Boolean).join(" ") || p.city;
      const sub = [p.name && p.street ? [p.housenumber, p.street].filter(Boolean).join(" ") : null, p.locality || p.district, p.city || p.county, p.state].filter(Boolean).filter(x => x !== main).join(", ");
      return { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0], main, sub, label: [main, sub].filter(Boolean).join(", ") };
    }).filter(r => { if (seen.has(r.label)) return false; seen.add(r.label); return true; }).slice(0, limit);
    cache.set(key, out); return out;
  }

  /* ---------- 4. Autocomplete UI ---------- */
  const input = $("#addr"), list = $("#suggestions"), combo = $("#combo"), clearBtn = $("#clearBtn");
  let items = [], active = -1, picked = null, debounceT = null;
  function renderList() {
    if (!items.length) { list.hidden = true; combo.setAttribute("aria-expanded", "false"); return; }
    list.innerHTML = items.map((it, i) => `<li role="option" id="opt${i}" aria-selected="${i === active}" data-i="${i}">
      <span class="s-ico" aria-hidden="true">📍</span><span><div class="s-main">${esc(it.main)}</div><div class="s-sub">${esc(it.sub)}</div></span></li>`).join("");
    list.hidden = false; combo.setAttribute("aria-expanded", "true");
    input.setAttribute("aria-activedescendant", active >= 0 ? "opt" + active : "");
  }
  input.addEventListener("input", () => {
    picked = null; clearBtn.hidden = !input.value;
    clearTimeout(debounceT);
    const v = input.value.trim();
    if (v.length < 3) { items = []; renderList(); return; }
    debounceT = setTimeout(async () => {   // debounce: 1 request per pause in typing
      try { items = await photon(v); active = -1; renderList(); } catch (e) { if (e.name !== "AbortError") { items = []; renderList(); } }
    }, 400);
  });
  input.addEventListener("keydown", e => {
    if (list.hidden) return;
    if (e.key === "ArrowDown") { active = (active + 1) % items.length; renderList(); e.preventDefault(); }
    else if (e.key === "ArrowUp") { active = (active - 1 + items.length) % items.length; renderList(); e.preventDefault(); }
    else if (e.key === "Enter" && active >= 0) { e.preventDefault(); choose(items[active]); }
    else if (e.key === "Escape") { items = []; renderList(); }
  });
  list.addEventListener("mousedown", e => e.preventDefault());
  list.addEventListener("click", e => { const li = e.target.closest("li"); if (li) choose(items[+li.dataset.i]); });
  input.addEventListener("blur", () => setTimeout(() => { items = []; renderList(); }, 150));
  clearBtn.addEventListener("click", () => { input.value = ""; picked = null; clearBtn.hidden = true; items = []; renderList(); input.focus(); });
  function choose(it) { picked = it; input.value = it.label; clearBtn.hidden = false; items = []; renderList(); showResult({ lat: it.lat, lng: it.lng }, it.label); }

  /* ---------- 5. Actions ---------- */
  const status = $("#status"), checkBtn = $("#checkBtn"), locBtn = $("#locBtn");
  const setStatus = (msg, err) => { status.textContent = msg || ""; status.classList.toggle("err", !!err); };
  function busy(btn, on, label) {
    btn.disabled = on;
    if (on) { btn.dataset.html = btn.innerHTML; btn.innerHTML = `<span class="spinner" aria-hidden="true"></span>${label}`; }
    else if (btn.dataset.html) btn.innerHTML = btn.dataset.html;
  }
  $("#searchForm").addEventListener("submit", async e => {
    e.preventDefault();
    const v = input.value.trim();
    if (picked) return showResult({ lat: picked.lat, lng: picked.lng }, picked.label);
    if (v.length < 3) { setStatus("Please type your street address or suburb.", true); input.focus(); return; }
    busy(checkBtn, true, "Checking…"); setStatus("Finding your address…");
    try {
      const r = await searchAddress(v);
      if (!r) setStatus("We couldn't find that address. Try adding your suburb, e.g. “Kellner St, Westdene”.", true);
      else { setStatus(""); showResult({ lat: r.lat, lng: r.lng }, r.label); }
    } catch (err) { setStatus(err.message || "Something went wrong — please try again.", true); }
    busy(checkBtn, false);
  });

  locBtn.addEventListener("click", () => {
    if (!("geolocation" in navigator)) return ipFallback("Location isn't available on this device.");
    busy(locBtn, true, "Locating…"); setStatus("Getting your location…");
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude: lat, longitude: lng, accuracy } = pos.coords;
      setStatus("Looking up your street…");
      const label = await reverse(lat, lng);
      busy(locBtn, false);
      input.value = label || `${lat.toFixed(5)}, ${lng.toFixed(5)}`; clearBtn.hidden = false;
      setStatus(accuracy > 500 ? `Location accuracy is about ${Math.round(accuracy)} m — type your address for a precise quote.` : "");
      showResult({ lat, lng }, input.value);
    }, err => {
      busy(locBtn, false);
      ipFallback(err.code === 1 ? "Location permission was denied." : "Couldn't get your GPS location.");
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  });

  async function ipFallback(reason) {
    if (!G.ipFallback) return setStatus(reason + " Please type your address instead.", true);
    try {
      setStatus(reason + " Trying an approximate location…");
      const r = await fetch("https://get.geojs.io/v1/ip/geo.json"); const d = await r.json();
      if (!d.latitude || (d.country_code || "").toLowerCase() !== G.countryCode) throw 0;
      const lat = +d.latitude, lng = +d.longitude;
      setStatus(`${reason} Showing an approximate area (${d.city || "your network"}) — type your address for an exact quote.`, true);
      showResult({ lat, lng }, `Approx. area: ${d.city || "unknown"} (network location)`, true);
    } catch { setStatus(reason + " Please type your address instead.", true); }
  }

  /* ---------- 6. Result ---------- */
  const result = $("#result");
  function showResult(pt, label, approx) {
    const r = Z.evaluate(C, pt);
    const here = L.latLng(pt.lat, pt.lng);
    if (meMarker) meMarker.remove(); if (meLine) meLine.remove();
    meMarker = L.marker(here, { icon: L.divIcon({ className: "", html: '<div class="me-pin"></div>', iconSize: [22, 22], iconAnchor: [11, 11] }), title: "You" })
      .bindPopup(`<b>${approx ? "Approximate location" : "Your address"}</b><br>${esc(label)}`).addTo(map);
    meLine = L.polyline([store, here], { color: r.inZone ? "#12824A" : "#B42318", weight: 3, dashArray: "4 8", opacity: .85 }).addTo(map);
    const b = L.latLngBounds([store, here]);
    if (r.km < maxKm) b.extend(store.toBounds(Math.max(r.km * 1.2, 2) * 2000));
    map.fitBounds(b.pad(0.12), { maxZoom: 15, animate: false });

    const km = r.km < 10 ? r.km.toFixed(1) : Math.round(r.km);
    const mapsPin = `https://www.google.com/maps/search/?api=1&query=${pt.lat.toFixed(6)},${pt.lng.toFixed(6)}`;
    if (r.inZone) {
      const msg = [
        C.whatsapp.greeting, "",
        `📍 Delivery address: ${label}`,
        `🗺️ Pin: ${mapsPin}`,
        `🛵 ${r.zone.name} · ${km} km · delivery fee ${cur}${r.zone.fee}`,
        `⏱️ Quoted ETA: ${r.etaMin}–${r.etaMax} min`, "",
        "My order:", "- "
      ].join("\n");
      const wa = `https://wa.me/${C.whatsapp.number}?text=${encodeURIComponent(msg)}`;
      result.innerHTML = `<div class="r-ok">
        <div class="r-head"><div class="r-badge" aria-hidden="true">✓</div><div>
          <p class="r-title">Great news — we deliver to you!</p>
          <p class="r-addr">${esc(label)}</p>
          <span class="r-zone"><i style="background:${r.zone.color}"></i>${esc(r.zone.name)}</span></div></div>
        <div class="stats">
          <div class="stat"><b>${cur}${r.zone.fee}</b><span>Delivery</span></div>
          <div class="stat"><b>${km} km</b><span>Distance</span></div>
          <div class="stat"><b>${r.etaMin}–${r.etaMax}</b><span>Minutes</span></div>
        </div>
        <div class="r-body">
          <a class="btn btn-wa" href="${wa}" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.4 5.1 5.24-1.37A9.9 9.9 0 1 0 12.04 2Zm5.8 14.1c-.24.68-1.4 1.3-1.93 1.35-.5.05-1.12.07-1.8-.11a16.4 16.4 0 0 1-1.63-.6 12.8 12.8 0 0 1-4.9-4.33c-.36-.48-1.03-1.6-1.030-3.05 0-1.45.76-2.17 1.03-2.46.27-.3.6-.37.8-.37h.57c.18 0 .43-.07.67.51.25.6.84 2.05.91 2.2.08.15.12.32.03.52-.1.2-.15.32-.3.49l-.44.52c-.15.15-.3.31-.13.6.17.3.77 1.27 1.65 2.05 1.13 1 2.09 1.32 2.38 1.47.3.15.47.12.64-.07.18-.2.74-.86.94-1.16.2-.3.39-.25.66-.15.27.1 1.72.81 2.01.96.3.15.5.22.57.35.07.12.07.72-.17 1.4Z"/></svg>
            Order on WhatsApp</a>
          <p class="r-note">${approx ? "Based on an approximate network location — confirm your address in the chat. " : ""}Distance is measured in a straight line from our kitchen; ETA includes ~${C.delivery.prepMinutes} min prep. Min. order ${cur}${C.delivery.minOrder}.</p>
        </div></div>`;
    } else {
      const dir = `https://www.google.com/maps/dir/?api=1&origin=${pt.lat.toFixed(6)},${pt.lng.toFixed(6)}&destination=${C.store.lat},${C.store.lng}&travelmode=driving`;
      const msg = `${C.whatsapp.greeting.replace(/for delivery\.?/i, "for collection.")}\n\n(I'm outside your delivery area — I'll collect.)\n\nMy order:\n- `;
      const wa = `https://wa.me/${C.whatsapp.number}?text=${encodeURIComponent(msg)}`;
      result.innerHTML = `<div class="r-no">
        <div class="r-head"><div class="r-badge" aria-hidden="true">✕</div><div>
          <p class="r-title">Sorry, you're outside our delivery area</p>
          <p class="r-addr">${esc(label)}</p></div></div>
        <div class="stats">
          <div class="stat"><b>${km} km</b><span>From us</span></div>
          <div class="stat"><b>${maxKm} km</b><span>Max range</span></div>
          <div class="stat"><b>${cur}0</b><span>Collection</span></div>
        </div>
        <div class="r-body">
          <p class="r-note" style="color:var(--ink);font-size:.95rem"><b>Collection is always welcome!</b> Order ahead on WhatsApp and it'll be hot and ready when you arrive at ${esc(C.store.name)}.</p>
          <a class="btn btn-dark" href="${dir}" target="_blank" rel="noopener">🧭 Get directions to collect</a>
          <a class="btn btn-wa" href="${wa}" target="_blank" rel="noopener">Order for collection on WhatsApp</a>
        </div></div>`;
    }
    result.hidden = false;
    result.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }

  /* ---------- 7. Deep links for demos: ?q=address or ?lat=..&lng=.. ---------- */
  const qs = new URLSearchParams(location.search);
  if (qs.get("lat") && qs.get("lng")) {
    const lat = +qs.get("lat"), lng = +qs.get("lng");
    input.value = qs.get("label") || `${lat.toFixed(5)}, ${lng.toFixed(5)}`; clearBtn.hidden = false;
    map.whenReady(() => showResult({ lat, lng }, input.value));
  } else if (qs.get("q")) {
    input.value = qs.get("q"); clearBtn.hidden = false;
    $("#searchForm").requestSubmit();
  }
})();
