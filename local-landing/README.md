# Rose City Solar — local landing (demo)

Mobile-first page that opens on the visitor's city using a free IP geolocation lookup, with a manual city switcher for sales demos.

Live: https://sabelalogic.github.io/local-landing/

Fictional brand. Not a real installer. WhatsApp number is a placeholder.

## Rebrand

Edit **only** `config.js`.

| Field | What it changes |
| --- | --- |
| `demo` | `true` shows the demo ribbon and fictional footer. `false` for a real client. |
| `brand.name`, `brand.tagline`, `brand.logoText` | Name, line under the name, letters in the badge. |
| `brand.colors` | `primary`, `primaryDark`, `accent`, `ink`, `bg`. |
| `whatsapp.number` | Digits only, country code, no `+`. Example: `27821234567`. |
| `geo.endpoint` | IP lookup URL. Default GeoJS. `https://ipapi.co/json/` also works. |
| `cities[].name` | City label, switcher button, and headline fallback. |
| `cities[].default` | City used when lookup fails or the visitor is outside the list. |
| `cities[].match` | Nearby places folded into this city. |
| `cities[].headline`, `blurb`, `benefits` | Phone-feel copy. `benefits` is three short lines. |
| `cities[].priceLine` | The one price teaser. |
| `cities[].areas` | Suburb chips ("areas served"). |
| `cities[].whatsappMessage` | Prefilled WhatsApp text. Keep the city name and "I'd like a solar quote". |

`?city=Welkom` (or Bloemfontein / Pretoria) opens that city without waiting for the lookup. The three buttons do the same thing.

## Deploy

This folder is served by GitHub Pages from `SabelaLogic/SabelaLogic.github.io` on branch `main`. Pushing `local-landing/` is enough. Do not replace `delivery-checker/`.
