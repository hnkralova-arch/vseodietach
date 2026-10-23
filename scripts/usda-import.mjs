#!/usr/bin/env node
/**
 * Stáhne nutriční hodnoty z USDA FoodData Central a zapíše je do src/data/foods.json.
 *
 * Použití:
 *   1. Zdarma si vyžádej API klíč: https://fdc.nal.usda.gov/api-key-signup
 *   2. USDA_API_KEY=tvuj_klic npm run usda
 *
 * U každé potraviny se hledá podle `usdaQuery` (nebo se použije `fdcId`, pokud je vyplněné).
 * Skript vypíše, co našel, a označí hodnoty jako ověřené (verified: true).
 * Výsledek zkontroluj: hlavně u syrové vs. vařené potraviny a správného popisu.
 */
import { readFile, writeFile } from 'node:fs/promises';

const KEY = process.env.USDA_API_KEY;
if (!KEY) {
  console.error('Chybí USDA_API_KEY. Klíč získáš zdarma na https://fdc.nal.usda.gov/api-key-signup');
  process.exit(1);
}
const FILE = new URL('../src/data/foods.json', import.meta.url);
const NUTRIENTS = { kcal: 1008, protein: 1003, fat: 1004, carbs: 1005, fiber: 1079 };
const api = (path, params = {}) => {
  const u = new URL(`https://api.nal.usda.gov/fdc/v1/${path}`);
  u.searchParams.set('api_key', KEY);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return fetch(u).then((r) => {
    if (!r.ok) throw new Error(`USDA ${r.status} ${r.statusText}`);
    return r.json();
  });
};
const round = (v) => Math.round(v * 100) / 100;

const data = JSON.parse(await readFile(FILE, 'utf8'));
for (const [id, food] of Object.entries(data.foods)) {
  let fdcId = food.fdcId;
  if (!fdcId) {
    const res = await api('foods/search', { query: food.usdaQuery, dataType: food.dataType ?? 'SR Legacy,Foundation', pageSize: '1' });
    if (!res.foods?.length) { console.warn(`! ${id}: nic nenalezeno pro "${food.usdaQuery}"`); continue; }
    fdcId = res.foods[0].fdcId;
  }
  const detail = await api(`food/${fdcId}`);
  const byNumber = Object.fromEntries((detail.foodNutrients ?? []).map((n) => [Number(n.nutrient?.number ?? n.nutrientNumber), n.amount ?? n.value]));
  const per100g = {};
  for (const [k, num] of Object.entries(NUTRIENTS)) per100g[k] = round(Number(byNumber[num] ?? 0));
  if (!per100g.kcal) {
    // Některé záznamy Foundation mají energii jen jako Atwater (2047/2048).
    per100g.kcal = round(Number(byNumber[2047] ?? byNumber[2048] ?? 0));
  }
  Object.assign(food, { fdcId, usdaDescription: detail.description, per100g, verified: true, fetchedAt: new Date().toISOString().slice(0, 10) });
  console.log(`✓ ${id} → ${fdcId} ${detail.description}: ${per100g.kcal} kcal, B ${per100g.protein} g, T ${per100g.fat} g, S ${per100g.carbs} g`);
}
await writeFile(FILE, JSON.stringify(data, null, 2) + '\n');
console.log('Hotovo. Zkontroluj změny v src/data/foods.json a commitni je.');
