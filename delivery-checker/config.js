/* =====================================================================
 *  CLIENT CONFIG — edit ONLY this file to rebrand for a new takeaway.
 *  Everything (name, colours, logo, WhatsApp, location, zones, fees)
 *  is driven from this one object.
 * ===================================================================== */
window.APP_CONFIG = {
  demo: true,                       // shows the "Demo" ribbon; set false for a live client

  brand: {
    name: "Rose City Grill",
    tagline: "Flame-grilled in the City of Roses",
    logoText: "RC",                 // 1–3 letters shown in the round badge
    logoImage: "",                  // optional: URL/path to a logo (overrides logoText)
    colors: {
      primary: "#C8102E",           // buttons, header, brand accents
      primaryDark: "#8E0B20",
      accent: "#FFB400",            // highlights, badges
      ink: "#17171C",               // main text
      bg: "#FFF8F1"                 // page background
    }
  },

  whatsapp: {
    number: "27710000000",          // international format, digits only (PLACEHOLDER)
    greeting: "Hi Rose City Grill! I'd like to place an order for delivery."
  },

  store: {
    name: "Rose City Grill — CBD",
    address: "Demo address, Bloemfontein CBD, 9301",
    lat: -29.1180,
    lng: 26.2145,
    openHours: "Mon–Sun · 10:00–22:00",
    phone: "+27 71 000 0000"        // display only
  },

  // Distance rings, measured in a straight line from the store (km).
  // Checked in order; first match wins. Anything beyond the last ring = no delivery.
  zones: [
    { name: "Zone A", maxKm: 3,  fee: 20, color: "#1E9E5A" },
    { name: "Zone B", maxKm: 6,  fee: 35, color: "#E9A100" },
    { name: "Zone C", maxKm: 10, fee: 50, color: "#E0582B" }
  ],

  // Optional polygon zones, checked BEFORE the rings (e.g. a campus special).
  // coords are [lat, lng] pairs. Remove entries / leave empty to disable.
  polygonZones: [
    {
      name: "UFS Campus Special",
      fee: 15,
      color: "#6B4EFF",
      coords: [
        [-29.1045, 26.1795], [-29.1045, 26.1945],
        [-29.1175, 26.1955], [-29.1185, 26.1800]
      ]
    }
  ],

  delivery: {
    currency: "R",
    minOrder: 80,                   // display only
    prepMinutes: 20,                // kitchen time before driver leaves
    avgSpeedKmh: 28,                // average driver speed in town
    roadFactor: 1.35                // straight-line → approx. road distance
  },

  geocoding: {
    countryCode: "za",
    // Bias results around the store (lon/lat bbox: minLon,minLat,maxLon,maxLat)
    biasBox: [25.6, -29.6, 27.2, -28.6],
    contactEmail: "",               // optional; appended to Nominatim requests per usage policy
    ipFallback: true                // approximate location by IP if GPS is denied
  }
};
