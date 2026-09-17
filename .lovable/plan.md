# Du nauji namai: 1420 ir 1424 Pleasure Ave

Sukelti du naujus objektus taip, kaip darėme anksčiau: per esamą turinio sistemą, su
nuotraukomis, aprašymais, aukštų vaizdais ir žemėlapiu. Abu publikuojami „Coming Soon"
statusu, be kainos.

## Ką jau patikrinau

- Dropbox aplankas pasiekiamas — 32 failai: bendri išorės renderiai (2 aerial, front/rear
  ir closeup kiekvienam namui) plius atskiri poaplankiai su vidaus renderiais ir 3D aukštų
  vaizdais kiekvienam namui.
- PDF (preliminary variance set) duoda tikslius duomenis:
  - 1424 Pleasure Ave — naujas sklypas 7.02, 35 pėdų plotis, 3 500 sq ft sklypas,
    2 578 sq ft namas, 5 miegamieji, 3 parkavimo vietos.
  - 1420 Pleasure Ave — naujas sklypas 8.02, 30 pėdų plotis, 3 000 sq ft sklypas,
    2 227 sq ft namas, 4 miegamieji, 3 parkavimo vietos.
  - Abu — keturi lygiai (Ground / 1st / 2nd / 3rd), liftas, R-B Residential Bayfront zona
    prie Beach Thorofare (vandens pusė), architektas Halliday Architects.
- Vonių skaičių suskaičiuosiu iš PDF aukštų planų ir nurodysiu kiekvienam namui atskirai.

## Nuotraukų paskirstymas

Kiekvienam namui po 6 išorės vaizdus: priekis, galas, aerial, plius 3 close-up renderiai
(priekio ir galo detalės). Aerial vaizdai — po vieną kiekvienam namui.

Vidaus renderiai (virtuvė, svetainė, miegamieji, vonia) eina į objekto galeriją.
3D aukštų vaizdai priskiriami atitinkamiems aukštams — Ground, First, Second, Third —
kaip ir kituose objektuose.

Visos nuotraukos prieš įkėlimą sumažinamos iki 2400 px ir suspaudžiamos (dabar originalai
8–18 MB), kad puslapis kraunasi greitai.

## Turinys

Kiekvienam namui parašysiu:

- Pavadinimą, antraštę ir trumpą pristatymą
- Aprašymą pagal PDF: keturi lygiai, liftas, bayfront vieta, sklypo ir namo dydis
- Pagrindinius skaičius (miegamieji, vonios, kvadratūra, lygiai, liftas)
- Aukštų aprašymus (Ground / First / Second / Third) pagal PDF kambarių išdėstymą
- Vietos skiltį — Pleasure Ave, prie Beach Thorofare, su žemėlapiu pagal adresą

Rašysiu tuo pačiu stiliumi kaip esami objektai; jokių išgalvotų kainų, jokių
prekės ženklų ar įrangos, kurios nėra dokumentuose.

## Statusas

Abu objektai — „Coming Soon", be kainos, publikuoti (matomi svetainėje ir sitemap).
Naujausi objektai atsiduria sąrašo viršuje.

## Techninės detalės

- Nuotraukos keliamos į `property-images` bucket per tą pačią schemą kaip admin panelė
  (`<slug>/<category>/<uuid>.jpg`), kategorijos: `hero`, `card`, `exterior`, `interior`,
  `floor_plan` (su `floor_plan_id`), plius `vision`.
- Eilutės rašomos į `properties` ir `property_images` — jokių schemos pakeitimų,
  jokių migracijų.
- Slug'ai: `1420-pleasure-avenue` ir `1424-pleasure-avenue`; kanoniniai URL
  `/developments/1420-pleasure-avenue` ir `/developments/1424-pleasure-avenue`.
- `map_embed_query` — tikslus adresas, kad žemėlapis rastų vietą.
- Po įkėlimo patikrinsiu abu puslapius naršyklėje (nuotraukos, aukštai, žemėlapis,
  inquiry forma) ir sitemap.

## Ko nedarysiu

- Nekeisiu jokio esamo objekto, dizaino ar admin panelės.
- Nepublikuosiu svetainės (Publish) be atskiro Jūsų leidimo — objektai bus matomi
  peržiūroje.
