# Auditas pagal Deerva standartus — radiniai ir taisymų planas

Peržiūrėjau visą svetainę pagal visus septynis Deerva standartus. Bendras vaizdas geras: SSR veikia, turinio modelis teisingas, analitika atitinka standartą beveik visu 100%, rolės ir prieiga sutvarkytos. Trūkumai — daugiausia SEO detalės, kelios admin spragos ir vizualinė tvarka kode.

## Kas jau atitinka standartą

- Visi vieši puslapiai renderinami serveryje, kiekvienas su savo pavadinimu, aprašymu ir canonical nuoroda.
- Analitika: be slapukų, sesija naršyklės atmintyje, 5 sek. įsitraukimo riba, botai filtruojami, admin puslapiai neskaičiuojami, prisijungęs personalas neskaičiuojamas, 14 mėn. valymas, 7/30/90 dienų palyginimas su ankstesniu laikotarpiu, šaltinių grupės su „Partner sites" ir „AI assistants", Deerva ženklelis su UTM.
- Rolės: developer/owner/editor per saugias DB funkcijas, savęs pažeminimas ir paskutinio savininko pašalinimas blokuojami, developer eilutė apsaugota.
- Turinio modelis: page_text / page_media / page_media_defaults su numatytųjų atstatymu; kontaktai, logotipas ir partneriai ateina iš admin.
- Techninis pagrindas: TanStack Start, Vite 8, Tailwind v4 be konfigūracijos failo, laiškai iš notify.oceancitydevelopment.com.

## Radiniai ir taisymai

### 1 fazė — SEO ir greitis (didžiausia nauda)

1. **Šriftai stabdo puslapio piešimą.** Dabar užkraunami per CSS `@import`, todėl naršyklė jų neranda anksti. Perkelsiu į nuorodą puslapio antraštėje — tekstas atsiras greičiau.
2. **Svetainės žemėlapis turi tris skirtingus šaltinius**, kurie gali prasilenkti: įrašytas failas, generavimo skriptas ir gyva funkcija. Paliksiu vieną tiesos šaltinį — gyvai generuojamą — kad naujas namas atsirastų iškart, be perbūdinimo.
3. **Dalinimosi nuotrauka.** Objekto puslapis be nuotraukos šiandien lieka visai be dalinimosi paveikslėlio. Sutvarkysiu, kad tokiu atveju būtų naudojamas bendras svetainės paveikslėlis, o pagrindiniai puslapiai (About, Gallery, Developments) gautų prasmingus savo paveikslėlius.
4. **Įmonės struktūriniai duomenys** (pavadinimas, adresas, telefonas, el. paštas paieškos varikliams) šiandien įrašyti kode. Perjungsiu juos į admin nustatymus, kad pakeitus kontaktus Google matytų tą patį.
5. **Judesio mažinimas.** Kas turi įjungę „sumažinti judesį", šiandien vis tiek mato slenkančius ir artėjančius vaizdus. Pridėsiu globalią taisyklę, kuri juos išjungia.

### 2 fazė — admin panelė

6. **Nustatymų skirtukai nepadengia visų puslapių.** Šiandien redaguojami tik pradinis, About ir Contact. Gallery, Testimonials ir Developments antraštės bei įžangos tekstai įrašyti kode. Pridėsiu jiems skirtukus ir perkelsiu tekstus į turinio sistemą.
7. **Pradinio puslapio „Architectural Excellence / Premier Locations / Turnkey Luxury" blokai ir atsiliepimų citatos** įrašyti kode — perkelsiu į „Home texts", kad Patrick galėtų keisti pats.
8. **Neišsaugotų pakeitimų įspėjimo nėra.** Pridėsiu — išeinant iš nustatymų ar objekto formos su neišsaugotais pakeitimais pasirodys klausimas.
9. **Editor rolė mato viską.** Šiandien editor mato ir „Users" bei „Settings", nors serveris jį atmeta. Paslėpsiu tai, ko jis negali daryti, kad nebūtų klaidinančių klaidų.

### 3 fazė — tvarka ir priežiūra

10. **Spalvos kode.** 112 vietų (labiausiai poraštė ir pradinis puslapis) naudoja tiesiogines spalvas vietoj vieningų svetainės spalvų. Sutvarkysiu — išvaizda nesikeis, bet ateity temą keisti bus galima vienoje vietoje.
11. **Analitikos valymas neturi tvarkaraščio** — funkcija yra, bet niekas jos nepaleidžia. Pridėsiu automatinį paleidimą kartą per parą.
12. **FRONTEND.md trūksta** projekto šaknyje — paruošiu pagal standartą.
13. **Senoji `admin` rolės reikšmė** ir nebenaudojamas `site_settings` skaitytuvas — nebenaudojami likučiai. Paliksiu kaip yra (saugos tinklas), tik pažymėsiu dokumentacijoje.

## Ko sąmoningai nedarysiu be atskiro sprendimo

- **Nuotraukų WebP formatas.** Šiandien viskas JPEG/PNG. WebP sumažintų svorį ~30%, bet paliestų visą įkėlimo grandinę ir 700+ esamų nuotraukų — tai atskiras planas.
- **Edge funkcijų pašalinimas.** Pagal projekto taisykles jos lieka nepaliestos.
- **Jokių vizualinių pakeitimų** viešoje svetainėje — Patrick neturi pastebėti skirtumo.

## Techninės detalės

- Šriftai: `@import` iš `src/styles.css:1` → `<link rel="stylesheet">` `src/routes/__root.tsx` head, išlaikant `preconnect` ir `display=swap`.
- Sitemap: `robots.txt` nukreipiamas į gyvą generatorių; `public/sitemap.xml` ir `scripts/generate-sitemap.ts` pašalinami, kad nebūtų trijų šaltinių.
- `src/lib/seo.ts`: `pageHead()` gauna numatytąjį `image`, kad `og:image`/`twitter:image` niekada nebūtų tušti; `developments/$slug.tsx` naudoja fallback.
- Organization JSON-LD `__root.tsx:39-68` perrašomas iš root loader `business` duomenų (`resolveBusinessInfo`).
- `prefers-reduced-motion: reduce` blokas `src/styles.css` gale — išjungia `animate-ken-burns`, `fadeIn/fadeInUp/slideInRight`, parallax transformacijas.
- Nauji `page_text` slot'ai puslapiams `gallery`, `testimonials`, `developments`; nauji `AdminSettings` skirtukai tuo pačiu `saveTextWithToast` keliu. Naujų lentelių nereikia — tik eilutės.
- Neišsaugoti pakeitimai: `isDirty` palyginimas + `beforeunload` + router `blocker`.
- Editor: `AdminSidebar` GROUPS filtruojamas pagal rolę; `AdminUsers`/`AdminSettings` route'uose — „read-only" pranešimas.
- Spalvos: nauji `--color-on-dark*` tokenai `styles.css`, `text-white` → `text-on-dark` ir pan.
- `analytics_purge_old()`: pg_cron įrašas naujoje migracijoje `supabase/migrations/`, GRANT tik `service_role`.
- Po kiekvienos fazės: `bunx tsc --noEmit`, `bun run build`, patikrinimas naršyklėje, migracijos tikrinamos `supabase/migrations/` (ne `drizzle/`). Nieko nepublikuoju be leidimo.
