# Planas: išvalyti Lovable kūrimo srautą iš analitikos ir atnaujinti Deerva standartą

## Tikslas

Analitika turi rodyti Patrickui tik verslui prasmingą srautą: Google, paiešką, socialinius tinklus, partnerius, tiesioginius lankytojus ir kitus realius referral šaltinius.

Lovable preview / dev / project domenai neturi būti rodomi kaip referral'ai, nes tai yra kūrimo ir testavimo triukšmas, ne pirkėjų srautas.

## Ką patvirtinau dabar

Per paskutines 90 dienų analitikoje yra Lovable kilmės referral'ai:

- `lovable.dev` — 72 peržiūros
- `*.lovableproject.com` — 12 peržiūrų
- `preview--*.lovable.app` — 1 peržiūra
- `id-preview--*.lovable.app` — 1 peržiūra

Dabar jie patenka į „Referring sites“ sąrašą ir dalis jų grupuojama kaip „Other sites“. Tai nėra gerai pagal Deerva standartą, nes klientui maišo realius srauto šaltinius su mūsų kūrimo aplinka.

## Siūlomas sprendimas

### 1. Ateities duomenims

Pakeisti analitikos įrašymo logiką taip, kad šie host'ai būtų laikomi vidiniu / kūrimo srautu ir nebūtų saugomi kaip referral šaltiniai:

- `lovable.dev`
- `*.lovable.app`
- `*.lovableproject.com`
- preview domenai
- development / builder referrer'iai, jei jie atsiranda per Lovable peržiūrą

Logika:

```text
Jei referrer yra OCDG domenas arba Lovable kūrimo / preview domenas:
  referrer_host = null
  source = direct arba ignore-development, priklausomai nuo situacijos
```

Praktiškai klientui geriausia: nerodyti jų „Referring sites“ sąraše. Jei vartotojas tikrai atėjo tiesiogiai į live svetainę, tai lieka „Direct“.

### 2. Esamiems duomenims

Vienkartiniu duomenų pataisymu išvalyti jau sukauptą kūrimo triukšmą:

- `lovable.dev`
- `*.lovable.app`
- `*.lovableproject.com`

Pataisymas būtų konservatyvus:

```text
referrer_host -> null
source -> direct
utm laukų neliesti, jei jie nėra Lovable kūrimo šaltiniai
```

Taip bendri lankytojų/peržiūrų skaičiai nesikeis, bet „Referring sites“ nebebus užterštas kūrimo šaltiniais.

### 3. Analytics puslapio apsauga nuo triukšmo

Papildomai padaryti, kad admin puslapis pats niekada nerodytų Lovable host'ų referrers sąraše net jei ateityje atsirastų senų ar importuotų eilučių.

Tai yra antra apsauga: duomenys išvalomi įrašymo metu, o vaizdavimas lieka profesionalus net jei DB atsirastų legacy įrašų.

### 4. Atnaujinti Deerva analytics standartą

Aktyvių workspace skills failų šiame projekte tiesiogiai nekeisiu, nes jie valdomi per Lovable Skills nustatymus.

Paruošiu aiškią formuluotę, kurią galima įkelti į Deerva analytics standartą:

```text
Development / preview / builder traffic is not business traffic.
Never show Lovable preview, lovableproject, builder, localhost, staging or internal development referrers in client-facing analytics. Filter them at collection time when possible, and exclude them from referrer reports as a fallback. Client analytics should show only real acquisition sources: direct, search, social, AI assistants, partner sites, listing portals, and meaningful external referrers.
```

Jei norėsite, po šio pataisymo galėsiu atskirai padėti perrašyti patį Deerva skill tekstą, kad jis būtų bendras standartas visiems ateities projektams.

## Patikrinimas po pakeitimų

Patikrinsiu:

1. `lovable.dev` ir preview domenai neberodomi „Referring sites“ sąraše.
2. Realūs referral'ai lieka matomi: `google.com`, `bing.com`, `facebook.com`, partnerių svetainės.
3. `source` grupės lieka prasmingos: Direct, Google, Other search, Social, AI assistants, Partner sites, Listing sites, Other sites.
4. Naujas testinis preview apsilankymas neįrašo Lovable kaip referral.
5. Typecheck ir build švarūs.

## Ko nekeisiu šiame žingsnyje

- Nekeisiu bendros analitikos architektūros.
- Nekeisiu lankytojų skaičiavimo logikos: 5 sekundės / scroll / click / keypress lieka.
- Nekeisiu Google / social / partner attribution logikos.
- Nekeisiu jokių kitų SEO ar admin panelės dalių.
- Nepublikuosiu be atskiro leidimo.
