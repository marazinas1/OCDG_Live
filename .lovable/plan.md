# OCDG tipografikos sugrąžinimas į lengvesnę klasikinę kryptį

## Rekomendacija

Viešoje svetainėje naudoti pasirinktą **Classical high-contrast serif** kryptį: elegantišką, ploną serif šriftą antraštėms ir „Urbanist“ visam pagalbiniam tekstui. Admin, prisijungimo ir formų dalyse palikti vien „Urbanist“.

Logotipo raidyno tiesiogiai nekopijuoti visoje sistemoje. Logotipas yra ženklas, todėl jo šrifto charakterį geriau atkartoti tik viešose antraštėse; ilguose tekstuose ir administravimo valdikliuose toks šriftas mažintų skaitomumą.

## Matomi pakeitimai

- „Building the Future of Ocean City“, „Current Developments“ ir kitos viešos antraštės taps plonesnės, elegantiškesnės ir artimesnės prisegtam ankstesniam vaizdui.
- Viešų antraščių šriftui naudoti „Bodoni Moda“ regular svorį; kursyvą palikti tik citatoms ar ten, kur jis jau buvo numatytas.
- Viešo pagrindinio teksto, meniu, mygtukų, mažų žymų ir kortelių aprašymų šriftą palikti „Urbanist“, naudojant santūrius 300–500 svorius.
- Admin, prisijungimo ir priežiūros ekranai lieka „Urbanist“; jų struktūra, tabai, teisės ir būsenos nesikeičia.
- Logotipo failai, dydis ir administruojamas logotipo nustatymas nesikeičia.

## Įgyvendinimas

- Root dokumente šalia „Urbanist“ per `<link>` užkrauti „Bodoni Moda“ reikalingus regular ir italic svorius.
- Dizaino sistemoje atskirti `font-sans` nuo viešoms antraštėms skirto serif tokeno.
- Panaikinti globalią taisyklę, kuri visoms antraštėms automatiškai uždeda „Urbanist 700“.
- Viešos svetainės `heading-display`, `heading-section`, `heading-card` ir esamus `font-serif` naudojimus pervesti į pasirinktą klasikinę šeimą su lengvesniais svoriais.
- Admin ir auth srityse aiškiai išlaikyti sans šriftą, kad viešos svetainės serif taisyklės ten nepatektų.
- Nekeičiami tekstai, spalvos, nuotraukos, tarpai, puslapių struktūra, duomenys ir veikimas.

## Patikra

- Palyginti pradžios puslapio pirmą ekraną ir „Current Developments“ su prisegtu ankstesniu vaizdu.
- Patikrinti Home, Developments, property, Gallery, Testimonials, About ir Contact puslapių antraštes darbalaukyje bei telefone.
- Patikrinti admin ir login ekranus: visur turi likti „Urbanist“, be serif nutekėjimo.
- Patikrinti, kad tekstai nepersidengia, neatsiranda horizontalaus slinkimo ir naršyklėje nėra klaidų.
- Atlikti automatinę kodo patikrą. Nieko nepublikuoti be atskiro leidimo.
