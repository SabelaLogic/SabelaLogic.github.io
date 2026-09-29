/* Pure zone logic — no DOM. Works in the browser (window.ZoneLogic) and Node (require). */
(function (root) {
  function haversineKm(a, b) {
    const R = 6371, toRad = d => d * Math.PI / 180;
    const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  // Ray-casting point-in-polygon; coords = [[lat,lng],...]
  function inPolygon(pt, coords) {
    let inside = false;
    for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
      const [yi, xi] = coords[i], [yj, xj] = coords[j];
      if ((yi > pt.lat) !== (yj > pt.lat) && pt.lng < (xj - xi) * (pt.lat - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function evaluate(cfg, pt) {
    const store = { lat: cfg.store.lat, lng: cfg.store.lng };
    const km = haversineKm(store, pt);
    const d = cfg.delivery;
    let zone = null;
    for (const p of (cfg.polygonZones || [])) {
      if (p.coords && p.coords.length > 2 && inPolygon(pt, p.coords)) { zone = { name: p.name, fee: p.fee, color: p.color, kind: "polygon" }; break; }
    }
    if (!zone) {
      for (const z of cfg.zones) if (km <= z.maxKm) { zone = { name: z.name, fee: z.fee, color: z.color, kind: "ring", maxKm: z.maxKm }; break; }
    }
    const roadKm = km * (d.roadFactor || 1.3);
    const driveMin = roadKm / (d.avgSpeedKmh || 30) * 60;
    const eta = d.prepMinutes + driveMin;
    const lo = Math.max(15, Math.round(eta / 5) * 5), hi = lo + 10;
    return { inZone: !!zone, zone, km, roadKm, etaMin: lo, etaMax: hi, driveMin: Math.round(driveMin) };
  }
  const api = { haversineKm, inPolygon, evaluate };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.ZoneLogic = api;
})(this);
