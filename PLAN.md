# PLAN.md — OCDG TanStack Start SSR migracija

Papildo AGENTS.md. Pirma perskaityk tą failą, kodėl ir kas neturi keistis.

## Fazė 0 — Blokuojantys sprendimai (prieš bet kokį kodą)

1. **Deploy tikslas.** Patvirtink tiesiogiai, ar TanStack Start SSR šiame
   Lovable projekte toliau publikuojasi per esamą Publish mygtuką + custom
   domain (oceancitydevelopment.com jau nukreiptas į Lovable hosting'ą),
   taip pat kaip HA ir StageHomy — ar reikalauja atskiro pipeline'o.
   Neik prie Fazės 4, kol tai nepatvirtinta.
2. **Patvirtink apimties ribą.** `properties`, `property_images`, `leads`,
   `testimonials`, `user_roles` ir kiekviena edge funkcija lieka nepaliesti
   schemos/logikos prasme. Tik `site_settings` tampa
   `page_text`/`page_media`, ir tik framework'o/rendering sluoksnis
   keičiasi. Jei koks nors žingsnis atrodo reikalaujantis liesti
   apsaugotą lentelę — sustok ir pažymėk tai, netęsk.

## Fazė 1 — AGENTS.md / PLAN.md įkelti

Šis žingsnis. Abu failai atsiduria repo šaknyje, kad kiekviena būsima
Lovable sesija paveldėtų tuos pačius apribojimus be pakartotinio
aiškinimo.

## Fazė 2 — Turinio schema (tik struktūra, dar be duomenų)

Viena migracija, sukurianti:

- `page_text (id, page, slot, value, updated_at)` — `UNIQUE (page, slot)`.
  Jokio `locale` stulpelio (tik anglų kalba).
- `page_media (id, page, slot, storage_path, alt_text, updated_at)` —
  `UNIQUE (page, slot)`. Savininko nustatomos nuotraukos.
- `page_media_defaults (id, page, slot, storage_path)` — developerio
  numatytosios fallback nuotraukos, tas pats trijų sluoksnių sprendimas
  kaip HA/Lumidenta: savininko reikšmė → developerio numatytoji → kodo
  fallback (slotas pasislepia, jei visos trys tuščios).

RLS: viešas SELECT (anon + authenticated), `is_admin()` apsaugotas
INSERT/UPDATE/DELETE — tas pats pattern'as, jau teisingai naudojamas
`site_settings` šiandien. Storage bucket'as page media, tas pats
upload/cleanup pipeline'as kaip jau veikiantis properties nuotraukoms.

Jokių puslapio komponentų pakeitimų dar. Patvirtink, kad schema stovi su
gyva užklausa prieš Fazę 3.

## Fazė 3 — site_settings duomenų perkėlimas į page_text/page_media

Vienkartinis skriptas/migracija, konvertuojanti ~30 esamų `site_settings`
stulpelių (site_name, logo/favicon/hero paths, 19 `about_*` laukų, home
quote laukai) į `page_text`/`page_media` eilutes po `page = 'home'` ir
`page = 'about'`. Mažesnė apimtis nei ankstesnėse migracijose — nereikia
masinio nuotraukų perkodavimo, tik keletą esamų nuotraukų kelių perkelti
tokius, kokie yra, į `page_media`. Patvirtink, kad eilučių skaičius tiksliai
atitinka šaltinio stulpelius, prieš pašalinant bet ką iš `site_settings`.
Nedaryk `site_settings` DROP, kol kiekvienas skaitantis komponentas Fazėje 4
nėra perjungtas ir patvirtintas.

## Fazė 4 — Framework migracija (TanStack Start), puslapis po puslapio

Tvarka: mažiausias/paprasčiausias pirma, didžiausias/sudėtingiausias
paskutinis — tas pats principas, naudotas kiekvienoje ankstesnėje
migracijoje.

1. Contact
2. GalleryPage
3. Testimonials
4. About (pirmas realus page_text/page_media vartotojas — čia patvirtink
   copy()-stiliaus resolution helper'į, prieš pasitikint juo kitur)
5. Index (home)
6. ActiveListings / UnderContract / Sold / ComingSoon / SoldProjects
   (visi ploni wrapper'iai apie `CategoryPage` — perkelk bendrą komponentą
   vieną kartą, šie turėtų sekti beveik nemokamai)
7. Developments (tab + grid + "See More" pagination logika, sukurta šią
   sesiją — sudėtingiausias stateful viešas puslapis, patvirtink, kad
   tab'ų perjungimas ir pagination elgsena išgyvena router'io keitimą
   tiksliai)
8. PropertyPage (dinaminis route'as, sudėtingiausias — per-property
   `head()` yra visa šios migracijos esmė, čia realiai atsiranda
   OG-image-per-listing pataisymas)

Kiekvienas puslapis: server loader pakeičia dabartinį duomenų gavimo
hook'ą, `head()` pakeičia `<SEO>` komponento `<Helmet>` naudojimą,
layout/stilistika nepasikeičia nė pikseliu.

## Fazė 5 — SEO patvirtinimas (šios migracijos tikroji esmė)

Prieš pasitikint pattern'u visuose 14 puslapių: pasirink vieną jau
migruotą puslapį (rekomenduoju About, nes tai pirmas `page_text`
vartotojas) ir patvirtink RAW server HTML atsakymą — ne naršyklėje
atvaizduotą DOM — kad jame yra teisingas title, description, canonical,
OG tag'ai ir JSON-LD. Naudok `curl` ar analogą prieš realų atsakymą, ne
naršyklės dev-tools inspekciją (kuri rodys helmet-įterptus tag'us net jei
SSR sulūžęs, duodama klaidingą teigiamą rezultatą). Tik patvirtinus tęsk
prie likusių puslapių.

## Fazė 6 — Analytics hook'o adaptacija

Perrašyti `src/hooks/usePageTracking.ts` prieš TanStack Start router'į
(pakeičiant `useLocation` iš react-router-dom). Ta pati elgsena: suveikia
keičiant route'ą ir pirmame užkrovime, praleidžia `/admin/*`, `sendBeacon`
su `text/plain` (ne `application/json` — CORS-preflight bug'as, ištaisytas
šią sesiją, neturi grįžti), `fetch(keepalive)` fallback. Patvirtink realiu
apsilankymu, kad nauja `page_views` eilutė atsiranda, taip pat kaip
originali verifikacija.

## Fazė 7 — Admin panelės perkėlimas

Admin route'ams nereikia SSR ar `head()` — jie autentifikuoti,
neindeksuojami, ir gali likti client-rendered TanStack Start aplikacijos
viduje (tas pats pattern'as kaip HA/StageHomy admin sekcijose). Tai
gerokai sumažina apimtį, palyginus su viešais puslapiais: perkelk
`AdminProtected`/`AdminShell`/routing į naują router'į, palik kiekvieno
admin puslapio vidinę logiką nepakeistą (Dashboard, Properties,
PropertyForm, Inquiries, Testimonials, Users, Settings, Analytics, Login,
SetPassword). `editor` rolė jau įmontuota AdminUsers kvietimo sraute —
patvirtink, kad ji išgyvena perkėlimą, neperstatinėk jos.

## Fazė 8 — Galutinė kokybės patikra ir perjungimas

- Pilnas rankinis kiekvieno viešo ir kiekvieno admin puslapio patikrinimas
  preview'e.
- Patvirtink, kad `robots.txt` ir sitemap generavimas vis dar teisingi
  naujam build'ui.
- Patvirtink, kad neliko jokių senų Vite-SPA/react-router/
  react-helmet-async likučių (kartok "jokių drizzle likučių" discipliną iš
  ankstesnio darbo).
- Patvirtink nulinį vizualų skirtumą nuo gyvos svetainės, patikrintą greta.
- Tik tada: Publish.

## Standartinė taisyklė kiekvienai fazei

PLAN režimas Lovable pirmiausia. Claude peržiūri realų plano tekstą prieš
realų repo, prieš patvirtinant. Lovable stato. Claude klonuoja ir
patvirtina realų rezultatą prieš planą, prieš pradedant kitą fazę. Jokia
fazė nepublikuoja savaime — tik Fazė 8 publikuoja, kai viskas aukščiau
patvirtinta nuo pradžios iki galo.
