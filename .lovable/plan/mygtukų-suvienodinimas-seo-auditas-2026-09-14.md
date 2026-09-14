# Mygtukų suvienodinimas + SEO auditas

## 1. Dėl kursoriaus (rankytės)

Patikrinau tiesiogiai naršyklėje peržiūroje: „Inquire Now", „Send Inquiry" ir
„All / Current Developments / Sold" mygtukai jau dabar grąžina `cursor: pointer`.
Vadinasi taisyklė veikia, bet Jūsų atidaryta peržiūra dar rodo senąją, iki
pakeitimo įkeltą svetainės versiją (stilių failas kešuojamas).

Pirmas žingsnis: „hard reload" peržiūroje ir patvirtinimas. Jei po to rankytė
vis dar nepasirodo, ieškosiu priežasties giliau (pvz. permatomas sluoksnis virš
mygtuko), o ne dėliosiu naujų taisyklių aklai.

## 2. Vieninga mygtukų sistema (pagrindinis darbas)

Šiandien mygtukai svetainėje aprašyti trimis skirtingais būdais:

- bendros klasės `btn-primary` / `btn-outline` / `btn-ghost` (8 vietose),
- „ranka rašyti" stiliai tiesiai komponente (navigacijos „Inquire Now",
  pagrindinio puslapio mygtukas, karuselių rodyklės ir taškeliai),
- shadcn `Button` komponentas (16 vietų, daugiausia administravimo skydelyje).

Dėl to ta pati funkcija skirtinguose puslapiuose atrodo ir elgiasi nevienodai
(kitokie tarpai, kitoks pakilimas užvedus, kitoks fokuso rėmelis).

Ką padarysiu:

1. Aprašysiu vieną mygtukų rinkinį kaip taisyklę: **primary** (tamsus),
   **outline** (rėmelis), **ghost** (tekstinis), **onLight/onDark** variantai
   tamsiam fonui, ir **icon** (apvalios karuselių rodyklės, uždarymo kryžiukas).
   Kiekvienas turi vienodą aukštį, tarpus, raidžių tarpus, 4px kampus,
   perėjimo trukmę, užvedimo ir fokuso elgseną bei rankytės kursorių.
2. Perrašysiu visus viešosios svetainės mygtukus į šį rinkinį: navigacija
   (desktop ir mobili), pagrindinis puslapis, Developments skirtukai, Gallery
   (įskaitant peržiūros lango valdiklius), Testimonials, Contact, objektų
   puslapiai, poraštė.
3. Administravimo skydelį paliksiu su shadcn `Button`, bet suderinsiu jo
   variantų išvaizdą su tuo pačiu rinkiniu, kad nebūtų dviejų sistemų.
4. **Vizualiai niekas neturi pasikeisti** – dydžiai ir spalvos lieka tokie
   patys, suvienodinama tik logika ir smulkūs nukrypimai. Prieš/po palyginsiu
   ekrano nuotraukomis kiekviename puslapyje.
5. Užrašysiu tai kaip nuolatinę projekto taisyklę, kad ateityje naujas mygtukas
   visada būtų daromas iš šio rinkinio, o ne rašomas iš naujo.

## 3. SEO auditas ir pataisymai

Pagrindiniai dalykai jau tvarkingi: robots.txt, sitemap, serverio pusėje
generuojamas turinys, mobilus vaizdas, unikalūs pavadinimai ir aprašymai
kiekvienam puslapiui.

Radau trūkumų, kuriuos ištaisysiu:

- **Trūksta „canonical" nuorodos** beveik visuose puslapiuose (pagrindinis,
  About, Contact, Gallery, Testimonials, visi Developments sąrašai). Ji yra tik
  objektų puslapiuose. Be jos Google gali laikyti puslapius dublikatais.
- **Trūksta `og:url`** tuose pačiuose puslapiuose – dalinantis nuoroda
  socialiniuose tinkluose rodomas ne tas adresas.
- **Dalinimosi paveikslėlis** visur imamas vienas bendras. Sąrašų puslapiams
  (Gallery, Sold, Current) priskirsiu jų pačių rodomą nuotrauką, kad nuorodos
  peržiūra atitiktų turinį.
- **Struktūriniai duomenys**: prie esamų pridėsiu „naršymo kelią"
  (BreadcrumbList) giluminiuose puslapiuose ir patikrinsiu, ar įmonės duomenys
  atitinka vietos verslo formatą (adresas, regionas, veiklos sritis) – tai
  svarbu vietinėje Ocean City paieškoje.
- **Nuotraukų aprašymai (alt) ir krovimo tvarka**: peržiūrėsiu visas viešas
  nuotraukas, kad aprašymai būtų prasmingi, o ne tušti, ir kad apačioje
  esančios nuotraukos būtų kraunamos vėliau (greitesnis puslapis).
- **Greitis**: patikrinsiu didžiausio hero paveikslėlio dydį ir prioritetą.

Po pataisymų paleisiu pakartotinį SEO patikrinimą ir pateiksiu rezultatą.

## Ko NEKEIČIU

Tekstų, nuotraukų, išdėstymo, spalvų, duomenų bazės, administravimo logikos,
laiškų siuntimo. Nepublikuosiu be Jūsų atskiro leidimo.

## Techninės detalės

- Mygtukų variantai: `src/styles.css` `@layer components` išplėtimas +
  `buttonVariants` (cva) suderinimas `src/components/ui/button.tsx`; bendra
  fokuso ir kursoriaus bazė lieka globalioje `@layer base` taisyklėje.
- Canonical / `og:url` / `og:image` dedami kiekvieno maršruto `head()`
  (`links` masyve canonical – tik lapiniuose maršrutuose, be dubliavimo
  `__root.tsx`).
- BreadcrumbList – `head().scripts` su `application/ld+json`.
- Patikrinimai: `bunx tsc --noEmit`, `bun run build`, Playwright ekrano
  nuotraukos prieš/po, pakartotinis SEO skenavimas.
