/* =====================================================================
 *  CLIENT CONFIG — edit ONLY this file to rebrand.
 *  Brand, colours, WhatsApp number, and the three cities all live here.
 *  The page reads this object and nothing else for copy or price.
 * ===================================================================== */
window.APP_CONFIG = {
  demo: true, // ribbon + "fictional" footer. Set false for a paying client.

  brand: {
    name: "Rose City Solar",
    tagline: "Home solar, quoted on WhatsApp",
    logoText: "RS",
    colors: {
      primary: "#0E6B4F",      // buttons, price card, selected city
      primaryDark: "#083E2E",  // price-card shade
      accent: "#E8A317",       // sun highlights, demo ribbon
      ink: "#142019",          // main text
      bg: "#F3F0E8"            // page background
    }
  },

  // Digits only, country code, no plus. PLACEHOLDER — replace before a real client.
  whatsapp: {
    number: "27710000000"
  },

  // Free, no-key IP lookup. Must return JSON with city, region, country, country_code.
  // Swap for https://ipapi.co/json/ if you prefer (same fields, ~1,000 requests/day).
  geo: {
    endpoint: "https://get.geojs.io/v1/ip/geo.json"
  },

  // First city with default:true is used when geo fails or the city is not one of these.
  // match: nearby places folded into this city (Free State goldfields → Welkom,
  //         greater Gauteng → Pretoria, Mangaung surroundings → Bloemfontein).
  //         Anything else falls back to the default city.
  cities: [
    {
      name: "Bloemfontein",
      default: true,
      match: [
        "Mangaung", "Botshabelo", "Thaba Nchu", "Dewetsdorp", "Brandfort",
        "Soutpan", "Bainsvlei", "Bloemspruit", "Heidedal", "Langenhovenpark",
        "Langenhoven Park", "Westdene", "Universitas", "Fichardtpark",
        "Fichardt Park", "Pellissier", "Navalsig", "Willows", "Dan Pienaar",
        "Bayswater", "Waverley", "Fauna", "Lourierpark", "Reddersburg"
      ],
      headline: "Solar for Bloemfontein roofs",
      blurb: "Highveld sun, cold July mornings, outages in the suburbs first. Sized for how Mangaung lives.",
      benefits: [
        "A local crew, not a Johannesburg call centre",
        "Hybrid backup for evenings in Westdene and Langenhovenpark",
        "The price is on the table before anyone climbs the roof"
      ],
      priceLine: "From R89,000 · 5 kW hybrid, installed in Mangaung",
      areas: ["Westdene", "Langenhovenpark", "Universitas", "Fichardt Park", "Heidedal", "CBD"],
      whatsappMessage: "Hi Rose City Solar, I'm in Bloemfontein. I'd like a solar quote."
    },
    {
      name: "Welkom",
      match: [
        "Odendaalsrus", "Virginia", "Hennenman", "Allanridge", "Riebeeckstad",
        "Thabong", "Bronville", "Naudeville", "Dagbreek", "Bedelia",
        "Flamingo Park", "Rheederpark", "St Helena", "Theunissen",
        "Ventersburg", "Wesselsbron"
      ],
      headline: "Solar built for Welkom",
      blurb: "Goldfields heat, wide roofs, and shifts that do not wait for the grid. We install around Thabong, Riebeeckstad and Virginia.",
      benefits: [
        "Installers who already know Welkom roof types",
        "Backup for load-shedding on night-shift weeks",
        "One WhatsApp thread from quote to switch-on"
      ],
      priceLine: "From R94,500 · 5 kW hybrid for goldfields homes",
      areas: ["Riebeeckstad", "Thabong", "Flamingo Park", "Bedelia", "Dagbreek", "Virginia"],
      whatsappMessage: "Hi Rose City Solar, I'm in Welkom. I'd like a solar quote."
    },
    {
      name: "Pretoria",
      match: [
        "Tshwane", "Centurion", "Midrand", "Irene", "Akasia", "Mamelodi",
        "Soshanguve", "Atteridgeville", "Hatfield", "Menlyn", "Montana",
        "Wonderboom", "Hammanskraal", "Cullinan", "Bronkhorstspruit",
        "Silverton", "Faerie Glen", "Lynnwood", "Brooklyn", "Arcadia",
        "Johannesburg", "Sandton", "Randburg", "Roodepoort", "Soweto",
        "Fourways", "Rosebank", "Bryanston", "Kempton Park", "Edenvale",
        "Germiston", "Boksburg", "Benoni", "Alberton", "Krugersdorp",
        "Springs", "Vereeniging", "Vanderbijlpark", "Sasolburg"
      ],
      headline: "Pretoria solar, without the runaround",
      blurb: "Estate rules, east-facing roofs and summer storms. Quoted like a neighbour, not a national script.",
      benefits: [
        "Estate paperwork handled with the quote",
        "Sized for Pretoria summers, not a generic kit",
        "WhatsApp quote — no showroom visit"
      ],
      priceLine: "From R99,000 · 5 kW hybrid, installed in Tshwane",
      areas: ["Centurion", "Menlyn", "Montana", "Akasia", "Mamelodi", "Hatfield"],
      whatsappMessage: "Hi Rose City Solar, I'm in Pretoria. I'd like a solar quote."
    }
  ]
};
