# Analitika pagal Deerva standartą

Dabartinė analitika jau yra first-party, be slapukų ir be trečių šalių, bet ji
fiksuoja kiekvieną puslapio užkrovimą ir rodo tik kelis rodiklius. Deerva
standartas reikalauja tikslesnio matavimo ir platesnio vaizdo. Šis planas
suvienodina abu dalykus. Vieša svetainė vizualiai nesikeičia (išskyrus vieną
poraštės nuorodą).

## Kas keisis matavime

- **Apsilankymas skaičiuojamas tik po realaus įsitraukimo** — 5 sekundės
  puslapyje arba scroll / paspaudimas / klavišo paspaudimas, kas įvyksta
  pirmiau. Trumpi atsitiktiniai užkrovimai nebeišpučia skaičių.
- **Sesija** — atsitiktinis id, laikomas tik naršyklės kortelės atmintyje
  (`sessionStorage`). Jokio sekimo tarp svetainių, jokių slapukų.
- **Apsilankymo trukmė** — siunčiama išeinant iš puslapio, kad būtų galima
  rodyti vidutinę trukmę ir atmetimo rodiklį.
- **UTM žymos** — fiksuojamos pirmo apsilankymo metu, kad būtų matomos realios
  kampanijos ir nukreipimai.
- **Prisijungęs personalas neskaičiuojamas** — Patrick ar bet kuris kitas
  prisijungęs naudotojas, naršydamas savo svetainę, nebeišpučia statistikos.
  Admin ir API adresai, kaip ir dabar, visai neregistruojami.
- **Šalis** nustatoma serveryje, IP adresas niekada nesaugomas (kaip ir dabar).
- **Senesni nei 14 mėnesių įrašai** valomi automatiškai.

## Kas keisis analitikos puslapyje

Intervalai lieka 7 / 30 / 90 dienų, kiekvienas lyginamas su ankstesniu tos
pačios trukmės laikotarpiu. Pridedama:

- vidutinė apsilankymo trukmė
- atmetimo rodiklis (apsilankymai, kuriuose peržiūrėtas tik vienas puslapis)
- puslapiai per apsilankymą
- šalys
- nukreipiančios svetainės (konkretūs domenai, ne tik „kita")
- šaltinių grupavimas papildomas **AI asistentais** (ChatGPT, Perplexity,
  Claude) — vis daugiau lankytojų ateina būtent iš ten

Esami blokai (peržiūros, lankytojai, užklausos, konversija, dienos grafikas,
populiariausi puslapiai, įrenginiai) lieka. Populiariausi puslapiai bus rodomi
žmogui suprantamais pavadinimais, ne tik adresais.

## Poraštės nuoroda

Dabartinė „Platform developed and maintained by Deerva" nuoroda veda į
deerva.com be jokių žymų, todėl Deerva pusėje šis srautas dingsta į „kita".
Pridedamos standartinės žymos (`utm_source=oceancitydevelopment.com`,
`utm_medium=referral`, `utm_campaign=platform-badge`). Vizualiai niekas
nesikeičia.

## Techninė dalis

1. **Migracija** `supabase/migrations/<timestamp>_analytics_deerva_standard.sql`
   (paprastas SQL failas, ne Drizzle):
   - `page_views` papildoma stulpeliais `session_id text`,
     `duration_seconds integer`, `utm_source/utm_medium/utm_campaign text`;
     indeksas `(day, session_id)`.
   - `analytics_summary(date, date)` perrašoma: prideda `avg_duration`,
     `bounce_rate`, `pages_per_visit`, `countries`, `referrers`, o `sources`
     papildomi AI asistentų grupe. Išlieka `is_admin()` sargyba ir datos
     intervalo validacija.
   - `analytics_purge_old()` — trina >14 mėnesių eilutes.
   - Grantai ir RLS lieka tokie patys (skaityti gali tik `is_admin()`).
2. **`supabase/functions/track-view/index.ts`** — priima `session_id`,
   `duration`, UTM laukus ir `event` tipą (`view` arba `duration`); trukmės
   ping'as atnaujina esamą eilutę pagal `session_id` + `path`. Origin
   allowlist, botų filtras ir hash'avimas nesikeičia.
3. **`src/hooks/usePageTracking.ts`** — įsitraukimo slenkstis, sesijos id,
   UTM fiksavimas, trukmės siuntimas per `visibilitychange` + `sendBeacon`,
   praleidžiami `/admin/*` ir prisijungę naudotojai (patikra per esamą
   Supabase sesiją). Išlieka `text/plain` beacon.
4. **`src/hooks/admin/useAnalytics.ts`** — išplečiamas naujais laukais.
5. **`src/pages/admin/AdminAnalytics.tsx`** — 3 nauji rodikliai viršuje ir
   2 nauji blokai (šalys, nukreipiančios svetainės); esamas stilius
   nekeičiamas. Populiarių puslapių pavadinimai gaunami iš `properties`
   lentelės pagal slug.
6. **`src/components/GlobalFooter.tsx`** — UTM žymos Deerva nuorodoje.

Neliečiama: `properties`, `property_images`, `leads`, `testimonials`,
`user_roles`, kitos edge funkcijos ir visa vieša svetainės išvaizda.
Nieko nepublikuosiu be atskiro Jūsų leidimo.
