# OCDG šriftų ir administravimo dalies suvienodinimas

Tikslas — OCDG viešoje svetainėje, prisijungimo languose ir administravimo dalyje pritaikyti tokią pačią šriftų sistemą kaip „Halliday Architects“, o administravimo dalį užbaigti pagal šiuo metu aktyvius Deerva standartus.

## Prieš redagavimą: ribos ir išimtys

- **Viešos svetainės šriftas keisis matomai:** dabartiniai „Inter“ tekstai ir „Playfair Display“ antraštės bus pakeisti viena „Urbanist“ šeima, kaip „Halliday Architects“. Turinys, spalvos, nuotraukos ir išdėstymas nekeičiami.
- **Ankstesnė `max-w-7xl` išimtis panaikinama Jūsų sprendimu:** administravimo turinys naudos visą jam skirtą plotį.
- **Editor prieiga įjungiama Jūsų sprendimu:** editor galės redaguoti turinį, bet negalės trinti įrašų, keisti verslo nustatymų ar valdyti vartotojų.
- **Articles dabar nekuriama:** tai išlieka anksčiau patvirtinta atskiro darbo išimtis.
- OCDG vienos kalbos `page_text` / `page_media` modelis paliekamas, nes tai dokumentuota šio projekto architektūra. Verslo turinys ir esami duomenys neperkeliami bei neišgalvojami.
- Veikiančios el. laiškų ir analitikos funkcijos neliečiamos, išskyrus prieigos atvaizdavimą administravimo sąsajoje.
- Nieko nepublikuojama.

## 1. Viena šriftų sistema visur

- Root dokumente krauti tik „Urbanist“ 300–800 svorius per `<link>` su `display=swap`; pašalinti „Inter“ ir „Playfair Display“ užkrovimą.
- `src/styles.css` nustatyti `--font-sans` ir esamą suderinamumo `--font-serif` į „Urbanist“, kaip Halliday projekte.
- Viešų antraščių, teksto, citatų, kainų ir kitų `font-serif` / `font-display` vietų šeimą suvienodinti į „Urbanist“, išlaikant jų dabartinius dydžius, svorius, kursyvą ir išdėstymą.
- Pašalinti globalią serif antraščių taisyklę. Visi `h1–h6`, administravimo antraštės, dialogai, kortelių pavadinimai ir formos paveldės vieną sans šriftą.
- Pritaikyti Halliday tipografijos principą: stipresnės 600–800 antraštės, 400 body, 500 labels; neperkelti Halliday spalvų ar turinio.

## 2. Administravimo apvalkalas ir navigacija

- `AdminShell` pašalinti centrinį `max-w-7xl`; palikti vienodą `px-4 py-6 md:px-6 md:py-8` tarpą ir viso pločio turinį.
- Išlaikyti lygiai tris grupes: `Workspace`, `Manage`, `Settings`; `Articles` nepridėti pagal aukščiau įvardytą išimtį.
- Išlaikyti bendrą underline tipo `AdminTabs`: skaidri eilė, viena apatinė linija, 3 px aktyvus `primary` pabraukimas, normalus registras ir horizontalus slinkimas telefone.
- Maintenance bloką `Business & appearance` apačioje pakeisti iš suskleidžiamo į nuolat matomą mažą kortelę: paaiškinimas, jungiklis, žinutė ir atskiras `Save`.
- Pašalinti likusias administravimo projektines ar žalias spalvas, įskaitant maintenance juostą, ir naudoti tik semantinius tokenus.

## 3. Editor rolė ir saugi prieiga

- Prisijungimo ir bendras administravimo vartas priims `developer`, `owner` ir `editor` roles, po vieną rolę vartotojui.
- Editor matys `Dashboard`, turinio valdymą (`Properties`, `Testimonials`) ir Settings puslapių turinio tabus.
- Editor nematys arba matys aiškiai išjungtus `Inquiries`, `Analytics`, `Users` ir owner-only `Business & appearance`; tiesioginis bandymas juos atidaryti bus nukreiptas į leidžiamą ekraną su aiškiu paaiškinimu.
- Editor sąsajoje paslėpti trynimą, vartotojų valdymą, verslo nustatymus, maintenance ir developer defaults veiksmus. Publikavimo bei turinio redagavimo veiksmai lieka ten, kur juos leidžia rolė.
- Duomenų bazės prieigos taisykles suderinti su tuo pačiu modeliu: `is_staff()` skaitymui / kūrimui / redagavimui ten, kur editor valdo turinį; `is_admin()` palikti trynimui, inquiries, analytics, vartotojams ir verslo nustatymams. Developer apsaugos nekeisti.
- Migracijoje keisti tik būtinas policies ir funkcijų vykdymo teises; naujų lentelių nereikia. Patikrinti, kad migracija atsirado tik `supabase/migrations/`, be Drizzle artefaktų.

## 4. Administravimo ekranų užbaigimas

- Suvienodinti puslapių antraštes, sekcijų pavadinimus ir tipografinius svorius pagal Halliday / Deerva anatomiją.
- Users sąraše laikyti identity, `You`, rolės ir apsaugos žymes vienoje persikeliančioje eilėje; rodyti paskutinį prisijungimą; editor šio puslapio nepasiekia.
- Pakeisti likusį loading spinnerį Users sąraše į vietą rezervuojančius skeletonus.
- Užbaigti aiškius accessible pavadinimus archyvavimo, atkūrimo, trynimo ir ikonų veiksmams.
- Išlaikyti esamus search, filtrus, rezultatų skaičių, tuščias ir klaidos būsenas, dirty apsaugą, toast pranešimus bei patvirtinimus.
- Prisijungimo ir slaptažodžio nustatymo ekranus palikti padalinto išdėstymo, bet visa jų tipografija ir valdikliai naudos bendrą „Urbanist“ bei bendrus UI komponentus.

## 5. Dokumentacija ir patikrinimas

- Atnaujinti `FRONTEND.md` ir `AGENTS.md`: „Urbanist“ visur, pilno pločio admin, editor teisių ribos ir panaikinta seno pločio išimtis.
- Patikrinti viešą pradžios, About, Contact, Testimonials, Gallery, Developments ir property puslapį, kad visur realiai apskaičiuojamas „Urbanist“ ir neliko „Inter“ / „Playfair Display“.
- Prisijungus patikrinti desktop, planšetės ir telefono pločius: sidebar, tabus, formas, dialogus, loading/empty/error/read-only/dirty/save būsenas.
- Atskirai patikrinti owner/developer ir editor scenarijus, įskaitant tiesioginį draudžiamų URL atidarymą ir trynimo blokavimą duomenų lygmenyje.
- Paleisti TypeScript ir automatines projekto patikras; patikrinti, kad viešas turinys, duomenys, žinutės ir analitika liko veikti. Nieko nepublikuoti.
