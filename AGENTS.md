# AGENTS.md — Ocean City Development Group (OCDG)

## Kas yra šis projektas

OCDG yra gyva, pajamas generuojanti nekilnojamo turto developerio platforma
Ocean City Development Group (savininkas: Patrick Halliday). Tai NĖRA
daugelio klientų šablonas kaip HA/Lumidenta/Demo-Rentals — tai vienas
dedikuotas vieno verslo platforma, aktyviai naudojama šiandien: Patrick
prisijungia, gauna inquiries, žymi properties kaip Active/Under
Contract/Sold, ir moka mėnesinį mokestį už nuolatinę priežiūrą.

Tai keičia rizikos lygį, palyginus su bet kuria kita šio developerio
migracija: **viešoji svetainė neturi pasikeisti jokiu matomu būdu**, o admin
panelė, kurią Patrick jau naudoja kasdien, turi toliau veikti tiksliai taip,
kaip jis ją žino. Tai variklio keitimas, ne perdarymas.

## Kodėl ši migracija, kodėl dabar

OCDG šiuo metu neturi jokio server-rendered HTML. `SEO.tsx` naudoja
`react-helmet-async`, kuris meta tag'us į `<head>` įrašo tik po to, kai
JavaScript paleidžiamas naršyklėje — crawler'iai ir socialinės žiniasklaidos
nuorodų peržiūros (Facebook, WhatsApp, Google'o ne-JS praėjimas, MLS
sindikacijos botai), kurie skaito žalią HTML, negauna NĖ VIENO puslapio
title, description, OG image ar canonical URL. Nekilnojamo turto svetainei
tai reiškia, kad naujai iškeltas namas gali likti neindeksuotas ar be
veikiančios peržiūros nuotraukos kelias dienas — tai realus, tekantis
kaštas, ne teorinis.

Tai ta pati problema, kuri jau išspręsta stagehomy.com, halliday-architects,
Lumidenta ir Demo-Rentals projektuose, migruojant į TanStack Start su tikru
SSR ir route-level `head()` metaduomenimis. OCDG yra paskutinis projektas ant
senos architektūros.

## Tikslinė architektūra (suvienodinta su likusiu portfolio)

- **Framework:** TanStack Start + Tailwind v4 (SSR), pakeičiantis Vite SPA +
  react-router-dom.
- **Metaduomenys:** route-level `head()` funkcijos, visiškai pakeičiančios
  `react-helmet-async`. Kiekvienas viešas route'as privalo grąžinti pilną
  title/description/OG/canonical/JSON-LD server-rendered atsakyme — tai ir
  yra visa šios migracijos esmė, patvirtinti tai pirma ant mažiausio
  puslapio, prieš pasitikint pattern'u likusiuose.
- **Turinio modelis:** `site_settings` (dabar ~30 stulpelių platus
  singleton — `about_story_paragraph_1`, `about_story_paragraph_2` ir t.t.,
  po stulpelį kiekvienam teksto blokui) pakeičiamas į
  `page_text` / `page_media` / `page_media_defaults`, tuo pačiu key-value
  modeliu, jau patvirtintu HA ir Lumidenta projektuose. Naujas tekstas =
  nauja eilutė, niekada nauja migracija.
- **Jokios dvikalbystės sudėtingumo.** OCDG yra tik anglų kalba. Nepridėk
  `locale` stulpelio ar Lumidenta stiliaus locale-resolution sluoksnio —
  tai apimtis, kurios šiam projektui nereikia.

## Kas NETURI keistis

Šios lentelės jau brandžios, gerai suprojektuotos ir kritinės veikimui.
Neperstruktūrink jų šios migracijos metu — adaptuok tik kodą, kuris jas
skaito, prie naujo framework'o:

- `properties` / `property_images` — jau turi slug, published, sort_order,
  specs, highlights. Tai gera schema; palik ją ramybėje.
- `leads` — inquiry surinkimas, jau turi teisingą RLS (`is_admin()`
  apsaugotas SELECT/UPDATE, anon tik insert, jokio viešo skaitymo).
- `testimonials` — published-flag pattern, jau teisingas.
- `user_roles` — `developer` / `owner` / `editor` hierarchija jau pilnai
  pastatyta DB lygmenyje (`is_admin`, `is_owner`, `is_staff`,
  `is_developer`, `has_role`), IR AdminUsers kvietimo UI jau leidžia
  priskirti `editor`. Neperstatinėk to — perkelk tokį, koks yra.
- Visos edge funkcijos (`manage-users`, `track-view`, `sitemap`,
  `send-inquiry-notification`, `auth-email-hook`, `handle-email-events`,
  `preview-transactional-email`) jau veikia server-side Supabase pusėje ir
  yra framework-agnostiškos. Jų nereikia keisti dėl SSR migracijos pačios
  savaime — keisti reikia tik kliento kodą, kuris jas kviečia.

## Kas turi būti adaptuota, ne tik perkelta

- **`src/hooks/usePageTracking.ts`** yra tvirtai priklausomas nuo
  react-router `useLocation()`. Reikia perrašyti prieš TanStack Start
  router'į (`useRouterState` ar router'io navigacijos subscription) — ta
  pati elgsena (suveikia keičiant route'ą, praleidžia `/admin/*`,
  `sendBeacon` su `text/plain`, kad išvengtų CORS-preflight bug'o, jau
  ištaisyto šioje sesijoje), naujas router'is po apačia.
- **`scripts/generate-sitemap.ts`** ir **`public/robots.txt`** — dabar
  teisingi (`Allow: /` visiems pagrindiniams crawler'iams, sitemap
  susietas). Išsaugoti elgseną; adaptuoti tik tai, ko mechaniškai
  reikalauja naujas build pipeline'as.
- **Deploy tikslas** — šis projektas šiuo metu publikuojamas per Lovable
  įmontuotą Publish mygtuką + custom domain (ta pati DNS struktūra,
  naudojama Vite SPA versijai, oceancitydevelopment.com nukreiptas į
  Lovable hosting'ą). Patvirtink su Lovable tiesiogiai, anksti, ar TanStack
  Start SSR projektai tęsia per tą patį Publish/custom-domain srautą (kaip
  atrodo veikia HA ir StageHomy atveju), ar reikalauja atskiro pipeline'o.
  Nepriimk kaip savaime suprantamo dalyko — patvirtink prieš Fazę 1.

## Taisyklės, perkeltos iš kiekvienos kitos šios paskyros migracijos

- Niekada neliesk `send-inquiry-notification`, `manage-users` ar bet kokios
  RLS policy kaip šalutinio nesusijusio pakeitimo efekto — jei failą reikia
  keisti dėl framework'o keitimo, tai turi būti aiškiai pasakyta plane
  prieš liečiant.
- Jokio vizualaus/dizaino pakeitimo. Tie patys šriftai, tie patys tarpai,
  tas pats tekstas, tas pats layout. Patrick neturi galėti pastebėti, kad
  kažkas įvyko.
- Publikuoti tik kai fazė pilnai patvirtinta — Lovable snapshot/preview
  modelis (jau sėkmingai naudotas šioje paskyroje) reiškia, kad gyvas
  domenas niekada neliečiamas darbo eigoje.
- Kiekvienas planas peržiūrimas čia (Claude, su realiu GitHub repo
  klonuotu ir patikrintu) prieš patvirtinimą Lovable, ir kiekvienas
  užbaigtas darbas patikrinamas prieš realų repo po to — niekada
  nepasitikėti vien Lovable ataskaita. Tai sugavo realias problemas
  kiekvienoje ankstesnėje migracijoje.
- Jei kažkas čia aiškiai neaprašyta — klausk prieš darant prielaidas; šis
  dokumentas bus papildomas, kai atsiras naujų sprendimų, lygiai taip pat,
  kaip buvo su StageHomy ir HA.

## Žinoma pasikartojanti problema

Šis Lovable projektas kartkartėmis sugeneruoja Drizzle migracijas (drizzle/ katalogas, drizzle.config.ts) vietoj įprastų supabase/migrations/*.sql failų, nepaisant to, kad projekto istorija visada naudojo pastaruosius. Tai įvyko bent tris kartus. Kai schema keitimas paprašomas, VISADA patikrink po darbo, ar migracija atsirado supabase/migrations/, o ne drizzle/. Jei atsirado drizzle/, sutvarkyk tuo pačiu būdu: nukopijuok SQL turinį pažodžiui į supabase/migrations/, tada pašalink drizzle artefaktus.

## Dabartinis dizaino ir admin standartas

- Viešos svetainės antraštės naudoja Bodoni Moda 400–500, o tekstai ir valdikliai — Urbanist 300–800. Auth ir admin visur naudoja tik Urbanist.
- Admin turinys naudoja visą shell plotį, be `max-w-7xl` išimties.
- Editor gali valdyti Properties, Testimonials ir viešų puslapių turinį, bet nemato Inquiries, Analytics, Users ar Business & appearance ir negali trinti.
- Settings Maintenance yra visada matoma paskutinė Business & appearance kortelė, ne collapsible blokas.
