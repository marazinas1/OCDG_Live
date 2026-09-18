# Admin panelės auditas pagal Deerva standartus

Peržiūrėjau visą admin dalį (šoninį meniu, apvalkalą, Settings, Properties, Testimonials, Inquiries, Users, Analytics, Overview, prisijungimą) ir palyginau su aktyviais Deerva standartais.

## Kas jau atitinka

- Trys meniu grupės, ikonos iš standartinio žodyno, apačioje el. paštas, rolė, „Back to site“, „Sign out“.
- Turinio modelis: `page_text` / `page_media` / `page_media_defaults`, nauja eilutė vietoj naujos migracijos.
- Rolės atskiroje lentelėje su security-definer funkcijomis; developer eilutė apsaugota.
- Analitika ir SEO pagrindas jau sutvarkyti ankstesniuose etapuose.
- Users sąraše yra paskutinio prisijungimo laikas.

## Sąmoninga projekto išimtis

Standartas reikalauja, kad admin puslapiai tęstųsi per visą plotį be `max-w`. Jūsų sprendimu paliekame vienodą `max-w-7xl` plotį — tai užfiksuosiu kaip dokumentuotą OCDG išimtį projekto dokumentuose, kad ateityje niekas jos „netaisytų“.

Taip pat: „Articles“ skiltis dabar nekuriama (blogas — atskiras darbas).

## Ką taisysime

### 1. Šoninis meniu
- Grupė „Daily“ pervadinama į „Workspace“ (standartinis pavadinimas: Workspace / Manage / Settings).
- „Overview“ pervadinamas į „Dashboard“, tvarka: Dashboard → Inquiries → Analytics.

### 2. Settings tabai — svarbiausias neatitikimas
Dabar 9 tabai, tarp jų atskiri „Appearance“ ir „Maintenance“, o tvarka neatitinka viešo meniu.

Nauja struktūra:

```text
Business & appearance   (verslo duomenys + logotipas + favicon + Maintenance kaip suskleidžiamas blokas)
Home texts
Developments texts
Gallery texts
Testimonials texts
About texts
Contact texts           (visada paskutinis)
```

Tai tiksliai atkartoja viešo meniu tvarką. Jokio turinio neprarandama — laukai tie patys, tik pergrupuoti.

### 3. Bendras tabų komponentas
Sukuriamas vienas `AdminTabs`, naudojamas visur: matomas rėmelis, stabilus aukštis, aktyvus tabas keičia visą paviršių, jokio pritaikyto kampų apvalinimo. Mobiliajame — horizontalus slinkimas, tekstas nekerpamas.

### 4. Semantinės spalvos admin dalyje
Pašalinamos likusios „kietai įrašytos“ spalvos ir svetimi pavadinimai:
- `AdminUsers` — geltoni įspėjimų blokai → `warning` tokenai;
- `AdminAnalytics` — žalias/raudonas pokytis → `success` / `destructive`;
- `AdminProperties`, `AdminPropertyForm` — žalios „published“ ir „slug free“ žymos → `success`;
- `AdminSettings` — `text-slate`, `charcoal` → standartiniai `foreground` / `primary` tokenai.

Vizualiai skirtumas minimalus, bet spalvos tampa valdomos iš vienos vietos.

### 5. Neišsaugotų pakeitimų apsauga objekto formoje
`AdminPropertyForm` (didžiausia forma panelėje) šiuo metu leidžia išeiti be įspėjimo. Pridedamas toks pat dirty-state įspėjimas kaip Settings: juosta viršuje + naršyklės klausimas prieš uždarant.

### 6. Testimonials — išskleidžiamos eilutės
Perdaroma į etaloninį modelį: suskleista eilutė rodo vardą, publikavimo būseną, tvarką ir santrauką; redagavimas atsiveria vietoje; „Expand all / Collapse all“; aiškus „Shown on site“ jungiklis; trynimo patvirtinimas įvardija, kas dings iš svetainės.

### 7. Būsenų sutvarkymas
Kiekvienas sąrašas gauna konkretų tuščios būsenos tekstą, klaidos būseną su „Try again“, o krovimosi būsena rezervuoja galutinį išdėstymą (skeletonai vietoj „Loading…“ eilutės).

## Techninės detalės

Liečiami failai: `src/components/admin/AdminSidebar.tsx`, naujas `src/components/admin/AdminTabs.tsx`, `src/pages/admin/AdminSettings.tsx`, `AdminTestimonials.tsx`, `AdminPropertyForm.tsx`, `AdminProperties.tsx`, `AdminUsers.tsx`, `AdminAnalytics.tsx`, `src/styles.css` (tik jei trūksta `warning`/`success` tokenų), `FRONTEND.md` + `AGENTS.md` (išimties fiksavimas).

Neliečiama: vieša svetainė, `properties` / `property_images` / `leads` / `testimonials` / `user_roles` schemos, RLS politikos, edge funkcijos, analitika, turinio duomenys. Migracijų nereikia.

## Patikrinimas

Po darbo patikrinsiu naršyklėje su prisijungusia sesija: visi admin puslapiai telefono, planšetės ir kompiuterio pločiais, tabų slinkimas mobiliajame, klaviatūros fokusas, rankos kursorius, neišsaugotų pakeitimų įspėjimas, atsiliepimų išskleidimas/išsaugojimas/trynimas, ir kad viešas puslapis nepakito. `tsc` ir `build` turi būti švarūs. Nieko nepublikuosiu.
