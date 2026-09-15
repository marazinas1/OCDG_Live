# Partnerių logotipai ir partnerių srauto matomumas

## Ką gausite

About puslapio skiltyje „Our Partners / Trusted collaborators" virš kiekvieno partnerio
pavadinimo atsiras jo logotipas:

- Halliday Architects — logotipas paimtas iš Halliday Architects svetainės projekto
- Halliday-Leonard — logotipas paimtas iš Halliday-Leonard svetainės projekto

Logotipai nebus įrašyti „kietai" į kodą — jie bus įkelti per tą pačią vietą, kurią jau
naudoja admin panelė (Settings → About texts → Partners), todėl ateityje logotipą bus
galima pakeisti ar pašalinti pačioje panelėje, be programuotojo.

Vaizdas bus toks pat, kaip Halliday Architects svetainėje (prisegtame paveikslėlyje):
logotipas pilkas ir šiek tiek prigesintas, o užvedus pele — tampa spalvotas ir ryškus.

## Analitika: partnerių tinklas

Trys įmonės susijusios, todėl analitikoje bus aiškiai matoma, kiek lankytojų ateina iš
partnerių svetainių:

- Naujas šaltinio tipas „Partner sites" — apsilankymai, atėję iš hallidayarchitects.com
  ir hallidayleonardllc.com, bus rodomi atskira eilute, o ne bendrame „Referral" krūvyje.
- Nuorodos į partnerius About puslapyje bus pažymėtos, kad partnerių svetainių analitika
  matytų, jog lankytojas atėjo iš oceancitydevelopment.com.

Pastaba: kad OCDG matytų srautą iš partnerių svetainių, tose svetainėse turi būti
nuorodos į oceancitydevelopment.com. Halliday Architects svetainė tokią nuorodą jau turi;
Halliday-Leonard pusėje tai reikėtų padaryti atskirai, tame projekte.

## Kas nesikeičia

Jokių kitų vizualinių pakeitimų, jokių pakeitimų kituose puslapiuose, admin panelės
struktūra ta pati. Niekas nepublikuojama be atskiro Jūsų leidimo.

## Techninė dalis

1. Abu logotipų failai nukopijuojami iš partnerių projektų momentinių kopijų
   (`halliday-logo.png`, `halliday-leonard-logo.png`), optimizuojami (max 800 px plotis,
   permatomas PNG išsaugomas) ir įkeliami į `page-media` bucket'ą į `about/partner-logo/`.
2. Įrašomos `page_media` eilutės `about / partner.01.logo` ir `about / partner.02.logo`
   (tas pats slot formatas, kurį rašo `AdminSettings.handleSaveAbout`), taip pat tos
   pačios eilutės `page_media_defaults`, kad admin „atstatyti numatytąjį" grąžintų šiuos
   logotipus.
3. `src/pages/About.tsx` (eil. 115–125): logotipo `img` klasės papildomos
   `opacity-55 grayscale group-hover:opacity-100 group-hover:grayscale-0` su švelniu
   perėjimu — atitinka Halliday Architects `PartnersSection`.
4. `src/pages/About.tsx`: partnerio nuoroda papildoma UTM parametrais
   (`utm_source=oceancitydevelopment.com`, `utm_medium=referral`,
   `utm_campaign=partner-network`), išsaugant esamus URL parametrus.
5. `supabase/functions/track-view/index.ts` — `sourceFrom()` gauna `partner` grupę
   (`hallidayarchitects.com`, `hallidayleonardllc.com`); funkcija perdeployinama.
6. `src/pages/admin/AdminAnalytics.tsx` — `SOURCE_LABEL` papildomas
   `partner: "Partner sites"`.
7. Patikra: `bunx tsc --noEmit`, `bun run build`, About puslapis peržiūroje (logotipai
   matomi, hover veikia), admin Settings → About rodo abu logotipus su galimybe pakeisti.
