# Admin panelės suvienodinimas pagal Deerva standartą

Tikslas — admin panelė atrodo ir veikia taip pat, kaip visuose kituose Deerva
projektuose. Vieša svetainė lankytojams nesikeičia (išskyrus techninių darbų
režimą, kai jis sąmoningai įjungiamas).

## 1. Meniu pertvarkymas

Dabar sidebar turi vieną grupę „Manage" su visais punktais. Bus trys grupės
fiksuota tvarka:

```text
DAILY      Overview · Inquiries · Analytics
MANAGE     Properties · Testimonials
SETTINGS   Users · Settings
```

„Dashboard" pervadinamas į „Overview". Apačioje lieka el. paštas, rolės žymė
mažosiomis didžiosiomis raidėmis, „Back to site", „Sign out". Papildomai:
rolės žymė dabar moka tik Developer/Owner — pridedama ir Editor, kad
pakviestas personalas matytų teisingą žymę.

## 2. Overview puslapis

Paliekami trys blokai Deerva tvarka:

1. Needs attention — neperskaitytos užklausos, nepublikuoti objektai; tuščia
   būsena parašyta kliento kalba.
2. Numbers — apsilankymai ir lankytojai per 7 dienas, publikuoti / juodraščiai
   / aktyvūs / parduoti objektai.
3. Quick actions — pridėti objektą, užklausos, vartotojai, peržiūrėti svetainę.

„Recent activity" blokas perkeliamas žemiau Quick actions (jis nėra standarto
dalis, bet naudingas — neišmetamas, tik nustoja skaidyti tris pagrindinius
blokus).

## 3. Settings tabai

Dabar: Brand · Homepage · About page. Bus, pagal standartą — pirmas ir
paskutinis fiksuoti, viduriniai atspindi viešus puslapius:

```text
Business      įmonės pavadinimas, adresas, telefonas, el. paštas, soc. tinklai
Appearance    logotipas, logo dydis, favicon, atstatymas į numatytąjį
Home texts    (dabartinis Homepage tabas)
About texts   (dabartinis About page tabas su partneriais)
Contact texts kontaktų puslapio redaguojami tekstai
Maintenance   techninių darbų jungiklis
```

Dabartinis „Brand" tabas išskaidomas: pavadinimas ir kontaktiniai duomenys
keliauja į Business, logotipas ir favicon — į Appearance. Visi nauji laukai
saugomi tose pačiose `page_text` / `page_media` lentelėse naujomis eilutėmis,
migracijų nereikia.

Contact tabas valdo kontaktų puslapio antraštę, paantraštę ir formos
įžanginį tekstą — puslapis vizualiai nesikeičia, tik tekstai tampa
redaguojami vietoj įrašytų kode.

## 4. Techninių darbų režimas

Jungiklis Settings → Maintenance, plius trumpa redaguojama žinutė lankytojams.

- Neprisijungęs lankytojas: visada laikinas puslapis, jokių išimčių.
- Prisijungęs personalas: mato tikrą svetainę su nuolatine juosta viršuje —
  „Techniniai darbai įjungti — svetainę matote tik Jūs, nes esate
  prisijungęs." Juostoje du veiksmai: „Peržiūrėti kaip lankytojas" ir
  „Išjungti" (veda tiesiai į Maintenance tabą).
- Kol dar tikrinama, ar žmogus prisijungęs, rodomas laikinas puslapis, ne
  tikras turinys — niekada neparodoma daugiau, nei įrodyta.
- Laikinas puslapis atiduodamas su `noindex`, kad paieškos sistemos
  neužfiksuotų jo vietoj tikro turinio.
- Numatytoji būsena — išjungta. Niekas nepasikeičia, kol Patrick pats
  neįjungia.

## Techninės detalės

- Sidebar grupės: `src/components/admin/AdminSidebar.tsx`, `ITEMS` masyvas
  skaidomas į tris grupes su `SidebarGroupLabel`.
- `AdminRole` tipas `src/hooks/admin/useAdminAuth.ts` praplečiamas `editor`;
  role check jau leidžia tik developer/owner į panelę — elgesys nekeičiamas,
  tik žymės tekstas.
- Settings tabai: `src/pages/admin/AdminSettings.tsx` — esamas turinys
  perskirstomas, pridedami Business / Contact / Maintenance blokai; rašymas per
  esamus `usePageContentAdmin` hook'us ir `is_admin()` RLS politikas.
- Nauji `page_text` slot'ai: `global`: `business.*`, `logo.scale`,
  `maintenance.enabled`, `maintenance.message`; `contact`: `hero.*`, `form.*`.
  Jokių schemos migracijų.
- Maintenance gate: `src/routes/__root.tsx` — reikšmė paimama esamame root
  loader'yje kartu su global branding; laikinas puslapis renderinamas vietoj
  `<Outlet />`, kol klientinis auth patikrinimas nepatvirtina personalo.
  `/admin/*` maršrutai niekada neblokuojami.
- Neliečiama: `properties`, `property_images`, `leads`, `testimonials`,
  `user_roles` schemos, visos edge funkcijos, viešos svetainės dizainas.

## Patikrinimas

- Admin pravažiavimas naršyklėje: visos grupės, visi tabai, po vieną lauką
  kiekviename naujame tabe išsaugoma ir atsispindi viešame puslapyje.
- Maintenance: įjungus — neprisijungęs seansas mato laikiną puslapį,
  prisijungęs mato svetainę su juosta; išjungus viskas grįžta.
- `bunx tsc --noEmit` ir `bun run build` švarūs.
- Nieko nepublikuojama be atskiro Jūsų leidimo.
