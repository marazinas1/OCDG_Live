---
name: deerva-analytics-attribution
description: Naudok, kai diegi ar tvarkai Deerva projekto lankytojų analitiką — cookie-free rinkimą, botų filtrą, engagement logiką, analitikos puslapį admin'e arba Deerva footer badge su UTM žymomis. Netinka SEO metaduomenims ar dizainui.
---

# 05 — Analitika ir atribucija

Kiekvienas klientas gauna sąžiningus skaičius. Deerva iš tos pačios sistemos gauna augimo kilpą.

## Rinkimas

First-party, be slapukų. Jokio Google Analytics, jokio trečios šalies pixel, nereikia sutikimo juostos.

- Sesijos id `sessionStorage`, generuojamas kiekvienam apsilankymui. Jokios cross-site tapatybės.
- Apsilankymas fiksuojamas tik po **realaus įsitraukimo**: 5 sekundės puslapyje arba scroll / paspaudimas / klavišas — kas įvyksta pirmiau. Trumpiau yra triukšmas, ne lankytojas.
- Galutinė trukmė siunčiama išeinant (`visibilitychange` + beacon).
- IP adresai niekada nesaugomi. Šalis nustatoma serveryje, laikomas tik dviejų raidžių kodas.
- Botai filtruojami serveryje pagal user-agent prieš insert, ir niekada neskaičiuojami.
- Admin route'ai, API route'ai ir **prisijungusio personalo apsilankymai** neįtraukiami. Savininkas, perkraunantis savo svetainę, neišpučia savo skaičių.
- Eilutės valomos po 14 mėnesių.

## Vidinio / kūrimo srauto filtravimas

Analitika klientui turi rodyti tik verslui reikšmingą srautą. Kūrėjo, preview, builderio ir testavimo aplinkos nėra realūs referral'ai.

- `localhost`, `127.0.0.1`, `lovable.dev`, `*.lovable.dev`, `*.lovable.app`, `*.lovableproject.com` ir kiti platformos preview / builder host'ai **niekada nerodomi** klientui kaip nukreipiančios svetainės.
- Jei referrer host'as yra kūrimo aplinka, naujas įrašas saugomas be `referrer_host`, o `source` nustatomas kaip `direct`.
- Jei `utm_source` ateina iš kūrimo / preview host'o, jis nelaikomas kampanijos šaltiniu.
- Admin analitikos UI ir `analytics_summary` turi filtruoti tokius host'us net istoriniuose duomenyse, kad klientas nematytų techninio triukšmo.
- Realių šaltinių filtras neturi pašalinti Google, Bing, Yahoo, Facebook, Instagram, listing sites, partner sites ar AI asistentų referral'ų.
- Keičiant šią logiką, testuok abu dalykus: kūrimo host'ai dingsta, realūs referral'ai lieka.

## Ką rodo analitikos puslapis

Intervalai 7 / 30 / 90 dienų, kiekvienas lyginamas su ankstesniu lygiu laikotarpiu.

Lankytojai · peržiūros · vidutinė apsilankymo trukmė · atmetimo rodiklis · puslapiai per apsilankymą · dienos grafikas · šalys · šaltiniai · įrenginiai · populiariausi puslapiai · nukreipiančios svetainės.

Šaltiniai grupuojami: direct, google, kita paieška, socialiniai pagal tinklą, AI asistentai (ChatGPT / Perplexity / Claude), partner sites, listing sites, kita. Nukreipiantys hostai rodomi šalia žali, nes „kita" slepia būtent tą srautą, kuris svarbiausias.

## Deerva badge — augimo kilpa

Kiekviena Deerva pastatyta platforma savo footer'yje turi:

```
Platform developed and maintained by Deerva
```

su nuoroda:

```
https://www.deerva.com/?utm_source=<kliento-domenas>&utm_medium=referral&utm_campaign=platform-badge
```

UTM žymos fiksuojamos pirmo apsilankymo metu ir saugomos su page view, tad Deerva analitika rodo, **kuri kliento svetainė atsiuntė kurį lankytoją**. Be žymų kiekvienas referral subyra į „kita" ir kilpa tampa nematoma.

Taisyklės:

- vienas `utm_source` vienam kliento domenui, visada grynas domenas (`lumidenta.lt`, ne `https://lumidenta.lt/`)
- `utm_medium=referral`, `utm_campaign=platform-badge` — niekada nevarijuoja
- UTM žymos tik išorinėse nuorodose į deerva.com; niekada vidinėje navigacijoje
- tylus stilius: muted tekstas, accent ant hover, be logo, be mygtuko

Daugiau platformų → daugiau badge'ų → daugiau užklausų → daugiau platformų. Visas verslo modelis vienoje footer'io eilutėje.
