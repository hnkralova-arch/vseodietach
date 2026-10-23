import data from '../data/foods.json';

export type Unit = 'g' | 'ml' | 'ks' | 'lžička' | 'lžíce';
export interface Food {
  name: string;
  per100g: { kcal: number; protein: number; fat: number; carbs: number; fiber: number };
  density?: number;
  gramsPerPiece?: number;
  gramsPerTsp?: number;
  gramsPerTbsp?: number;
  verified: boolean;
  fdcId?: number;
}
export interface IngredientInput { food: string; amount: number; unit: Unit; label?: string }

const foods = (data as unknown as { foods: Record<string, Food> }).foods;

export function getFood(id: string): Food {
  const f = foods[id];
  if (!f) throw new Error(`Potravina "${id}" chybí v src/data/foods.json`);
  return f;
}

export function toGrams(ing: IngredientInput): number {
  const f = getFood(ing.food);
  switch (ing.unit) {
    case 'g': return ing.amount;
    case 'ml': return ing.amount * (f.density ?? 1);
    case 'ks':
      if (!f.gramsPerPiece) throw new Error(`U potraviny "${ing.food}" chybí gramsPerPiece`);
      return ing.amount * f.gramsPerPiece;
    case 'lžička': return ing.amount * (f.gramsPerTsp ?? 5);
    case 'lžíce': return ing.amount * (f.gramsPerTbsp ?? 15);
  }
}

/** Součet živin receptu a hodnoty na porci. */
export function recipeNutrition(ingredients: IngredientInput[], portions: number) {
  const t = { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 };
  let verified = true;
  for (const ing of ingredients) {
    const f = getFood(ing.food);
    const g = toGrams(ing);
    if (!f.verified) verified = false;
    for (const k of Object.keys(t) as (keyof typeof t)[]) t[k] += (f.per100g[k] * g) / 100;
  }
  const per = Object.fromEntries(Object.entries(t).map(([k, v]) => [k, v / portions])) as typeof t;
  return { total: t, perPortion: per, verified };
}

/** Zaokrouhlení, které jde odvážit nebo odměřit. Sdílí ho server i prohlížeč (kopie v KcalScaler). */
export function roundAmount(v: number, unit: Unit): number {
  if (unit === 'g' || unit === 'ml') {
    if (v < 10) return Math.round(v * 2) / 2;
    if (v < 100) return Math.round(v);
    return Math.round(v / 5) * 5;
  }
  return Math.max(0.5, Math.round(v * 2) / 2);
}

export const nf = (v: number, d = 0) => v.toLocaleString('cs-CZ', { maximumFractionDigits: d });
