# Delivery-Area Checker (demo) — Rose City Grill

Static, mobile-first "Do we deliver to you?" page for takeaways. No backend.

## Rebrand for a client (≈5 min)
Edit **`config.js` only**:

| Field | What |
|---|---|
| `demo` | `false` hides the "Demo" ribbon/footer note |
| `brand.name`, `brand.tagline` | Shop name + strapline |
| `brand.logoText` / `brand.logoImage` | Badge letters, or path/URL to a square logo (put file next to index.html) |
| `brand.colors.primary / primaryDark / accent / ink / bg` | Brand colours |
| `whatsapp.number` | Digits only, intl format, e.g. `27821234567` |
| `whatsapp.greeting` | First line of prefilled WhatsApp message |
| `store.name / address / lat / lng / openHours / phone` | Kitchen location (lat/lng = centre of rings) |
| `zones[]` | Distance rings `{name, maxKm, fee, color}` in ascending order; beyond last = collection only |
| `polygonZones[]` | Optional custom areas `{name, fee, color, coords:[[lat,lng],...]}`, checked before rings (empty array to disable) |
| `delivery.minOrder / prepMinutes / avgSpeedKmh / roadFactor` | Min order text + ETA estimate |
| `geocoding.biasBox` | lon/lat box around the client's town to bias search results |
| `geocoding.contactEmail` | Your email, sent to Nominatim per its usage policy |
| `geocoding.ipFallback` | Approximate location by IP (get.geojs.io) if GPS denied |

Demo deep links: `?q=Mimosa Mall, Bloemfontein` or `?lat=-29.10&lng=26.20&label=Test`.

## Services / licensing
- Map tiles: OpenStreetMap (tile.openstreetmap.org) — © OSM contributors, ODbL; fine for low-traffic demos, heavy use should move to a tile provider (MapTiler/Stadia/Carto free tiers).
- Autocomplete: Photon (photon.komoot.io), debounced 400 ms, min 3 chars, cached.
- Search on submit + reverse geocode: Nominatim, throttled to ≤1 req/s, cached, no autocomplete (per policy).
- IP fallback: get.geojs.io (free, no key).
- Leaflet 1.9.4 (BSD-2) from unpkg with SRI.
