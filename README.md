# Vše o dietách

Klidný průvodce dietami. Statický web postavený v [Astro](https://astro.build), nasazený na Cloudflare Pages.

## Spuštění na počítači

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # hotový web do složky dist/
```

## Kde co je

| Co | Kde |
| --- | --- |
| Diety (karty diet) | `src/content/diety/*.md` – šablona `_sablona.md` |
| Recepty | `src/content/recepty/*.md` – šablona `_sablona.md` |
| Problémové stránky (Proč nehubnu…) | `src/content/problemy/*.md` – šablona `_sablona.md` |
| Nutriční hodnoty potravin | `src/data/foods.json` |
| Komponenty (logo, rozcestník, kalkulačky…) | `src/components/` |
| Barvy, písmo, rozměry | `src/styles/tokens.css` (z design systému) |
| Hlavička, patička, SEO | `src/layouts/Base.astro` |
| Spuštění pro vyhledávače | `src/config.ts` → `LAUNCHED` |

Nový článek = nový `.md` soubor. Název souboru je adresa stránky (`keto.md` → `/diety/keto/`).
Rozcestník „Co právě řešíte?“ odkazuje na problémovou stránku až ve chvíli, kdy existuje (`proc-nehubnu.md`, `jojo-efekt.md`, `vecerni-chute.md`, `injekce-na-hubnuti.md`). Do té doby ukazuje „Připravujeme“.

## Nutriční data (USDA)

Hodnoty v `src/data/foods.json` jsou zatím předběžné (`verified: false`) a web to u receptů uvádí. Ověřené hodnoty stáhneš takto:

1. Zdarma si vyžádej klíč: https://fdc.nal.usda.gov/api-key-signup
2. `USDA_API_KEY=tvuj_klic npm run usda`
3. Zkontroluj, co skript našel (hlavně syrové vs. vařené), a změny commitni.

Novou potravinu přidáš do `foods.json` s anglickým `usdaQuery` a spustíš skript znovu.

## Nasazení na Cloudflare Pages

1. https://dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git → vyber repozitář `vseodietach`.
2. Framework preset **Astro**, build command `npm run build`, output directory `dist`.
3. Po prvním nasazení: Custom domains → přidej svou doménu. Cloudflare ti ukáže DNS záznam (CNAME), který nastavíš u Forpsi.
4. Každý push do větve `main` se nasadí automaticky.

## Před spuštěním (checklist)

- [x] Doména `https://www.vseodietach.cz` nastavená v `astro.config.mjs` (`SITE_URL`).
- [ ] Přesměrovat `vseodietach.cz` (bez www) na `www.vseodietach.cz` (301).
- [ ] Doplnit zdroje u Keto (`src/content/diety/keto.md`, položky `todo: true`).
- [ ] Spustit `npm run usda` a ověřit nutriční hodnoty.
- [ ] Doplnit provozovatele a kontakt (`src/pages/o-nas.astro`, `src/pages/ochrana-osobnich-udaju.astro`).
- [ ] Ověřit kontakty na stránce Kde najít pomoc (`src/pages/pomoc.astro`).
- [ ] Vlastní fotky receptů místo zástupných rámečků.
- [ ] Přepnout `LAUNCHED = true` v `src/config.ts` (zruší noindex a povolí robots.txt).
- [ ] Přidat web do Google Search Console a odeslat `sitemap-index.xml`.
- [ ] Analytika (GA4) až s lištou souhlasu s cookies a aktualizovanou stránkou o osobních údajích.
