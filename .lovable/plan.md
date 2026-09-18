# OCDG administravimo dalies atnaujinimas pagal naujausius Deerva standartus

Tikslas — dar kartą suvienodinti visą administravimo dalį pagal dabar aktyvius Deerva standartus, nekeičiant viešos svetainės išvaizdos, verslo turinio, duomenų schemos ar veikiančių užklausų srauto.

## Sąmoningos OCDG išimtys prieš redagavimą

- **Articles dabar nekuriama.** Tai lieka atskiras būsimas darbas.
- **Vienodas `max-w-7xl` administravimo turinio plotis paliekamas.** Tai anksčiau patvirtinta OCDG išimtis; atskiri puslapiai papildomų pločio ribojimų negaus.
- **Esama duomenų schema, prieigos taisyklės ir veikiančios serverio funkcijos neliečiamos.** Auditas nekeis `properties`, `property_images`, `leads`, `testimonials`, `user_roles` ar el. laiškų funkcijų.
- **Vieša svetainė nekeičiama ir niekas nepublikuojama.**

## 1. Skirtukai pagal atnaujintą standartą

- Perrašyti bendrą `AdminTabs`: skaidri viena horizontali eilė su viena apatine linija.
- Aktyvus skirtukas turės aiškią `primary` apatinę liniją ir `foreground` tekstą; neaktyvus — `muted-foreground`.
- Pašalinti užpildytą konteinerį, kiekvieno skirtuko rėmelį, kampų apvalinimą ir didžiąsias raides.
- Telefone palikti vienos eilės horizontalų slinkimą be nukirstų pavadinimų.
- Visuose administravimo puslapiuose naudoti tik šį bendrą variantą.

## 2. Bendri mygtukai ir valdikliai

- Administravimo prisijungimo lange ir kituose likusiuose taškuose pakeisti ranka sukurtus mygtukus bei laukus bendrais sistemos komponentais.
- Pašalinti administravimo dalyje likusius projektinius spalvų pavadinimus ir naudoti tik semantinius tokenus.
- Ikonų mygtukams pridėti aiškius pavadinimus / tooltip'us, kur jų trūksta; išjungtiems perrikiavimo veiksmams rodyti teisingą būseną.
- Destructive veiksmams naudoti vienodą variantą ir aiškią patvirtinimo kalbą.

## 3. Puslapių antraštės ir bendras išdėstymas

- Suvienodinti visų puslapių pradžią: pavadinimas, vienas paaiškinantis sakinys ir daugiausia vienas pagrindinis veiksmas dešinėje.
- `Overview` ekrano pavadinimą pakeisti į `Dashboard`, kad sutaptų su meniu.
- Pašalinti dvigubą vidinį tarpą Analytics puslapyje; palikti tik bendro administravimo apvalkalo tarpą.
- Patikrinti, kad telefonuose antraštės ir veiksmai persikeltų į naują eilutę bei nesikirstų.

## 4. Sąrašų ir būsenų nuoseklumas

- Inquiries: pridėti bendrą rezultatų skaičių, aiškią klaidos būseną su `Try again`, išlaikant paiešką, filtrus, archyvą ir automatinį perskaitymo pažymėjimą.
- Properties: pridėti klaidos būseną su pakartotiniu bandymu ir rodyti filtruotų / visų įrašų skaičių įrankių juostoje; esamo grid/table pasirinkimo nekeisti.
- Analytics: tekstinį „Loading…“ pakeisti galutinį išdėstymą rezervuojančiais skeletonais, o klaidos būsenoje pridėti `Try again`.
- Users: loading pakeisti sąrašo skeletonais, klaidai pridėti `Try again`, rolėms ir tapatybei naudoti bendrą `Badge`, o negalimo veiksmo priežastį palikti aiškiai matomą.
- Property form: loading pakeisti formos struktūrą rezervuojančiu skeletonu; grįžimo veiksmą pakeisti sistemos mygtuku; išlaikyti esamą neišsaugotų pakeitimų apsaugą.

## 5. Neišsaugotų pakeitimų ir išskleidžiamų įrašų elgsena

- Settings skirtukų keitimas turės perspėti, jei aktyvioje dalyje yra neišsaugotų pakeitimų; naršyklės uždarymo apsauga lieka.
- Testimonials redagavime pridėti apsaugą prieš eilutės uždarymą, visų eilučių uždarymą ar išėjimą iš puslapio, kai yra neišsaugotų pakeitimų.
- Pagal standartą numatytai laikyti atvertą daugiausia vieną atsiliepimą; „Expand all / Collapse all“ lieka sąmoningas naudotojo veiksmas.
- Išsaugojimas ir publikavimo keitimas toliau rodys aiškų rezultatą; tekstas ir duomenys nebus keičiami.

## 6. Patikrinimas

- Patikrinti visus administravimo ekranus prisijungusioje peržiūroje kompiuterio ir telefono pločiais.
- Patikrinti skirtukų slinkimą, mygtukų fokusą, išjungtas būsenas, sąrašų loading/empty/error vaizdus ir neišsaugotų pakeitimų perspėjimus.
- Patikrinti, kad Inquiries archyvas ir žinučių srautas liko veikiantys, o vieša svetainė vizualiai nepakito.
- Paleisti automatines TypeScript ir projekto patikras. Nieko nepublikuoti.
