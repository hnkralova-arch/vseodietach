import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const source = z.object({ title: z.string(), url: z.string().url().optional(), todo: z.boolean().default(false) });
const level = z.number().int().min(1).max(3);

/** Karta diety. Soubory začínající podtržítkem (šablony) se nenačítají. */
const diety = defineCollection({
  loader: glob({ pattern: '[^_]*.md', base: './src/content/diety' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    cardSummary: z.string(),
    lead: z.string(),
    quickAnswer: z.string(),
    forWhom: z.array(z.string()).min(2),
    notFor: z.array(z.string()).min(2),
    difficulty: level,
    cost: level,
    macros: z.object({ carbs: z.number(), protein: z.number(), fat: z.number() }),
    tags: z.array(z.string()).max(2).default([]),
    risks: z.string(),
    compare: z.object({
      title: z.string(),
      columns: z.array(z.string()),
      rows: z.array(z.object({ label: z.string(), values: z.array(z.string()) })),
      verdict: z.string(),
    }).optional(),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    similar: z.array(z.string()).default([]),
    sources: z.array(source).min(1),
    updated: z.coerce.date(),
    published: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

const unit = z.enum(['g', 'ml', 'ks', 'lžička', 'lžíce']);
const recepty = defineCollection({
  loader: glob({ pattern: '[^_]*.md', base: './src/content/recepty' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    lead: z.string(),
    portions: z.number().int().min(1),
    minutes: z.number().int(),
    tags: z.array(z.string()).max(3).default([]),
    diets: z.array(z.object({ label: z.string(), href: z.string().optional(), note: z.string().optional() })).default([]),
    ingredients: z.array(z.object({ food: z.string(), amount: z.number(), unit, label: z.string().optional() })),
    steps: z.array(z.string()),
    updated: z.coerce.date(),
    published: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

/** Problémové stránky („Proč nehubnu“…). Rozcestník na ně odkazuje, jen když existují a nejsou draft. */
const problemy = defineCollection({
  loader: glob({ pattern: '[^_]*.md', base: './src/content/problemy' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    lead: z.string(),
    quickAnswer: z.string(),
    checklist: z.array(z.string()),
    whenToSeeDoctor: z.string(),
    tool: z.object({ label: z.string(), href: z.string() }).optional(),
    sources: z.array(source).min(1),
    updated: z.coerce.date(),
    published: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { diety, recepty, problemy };
