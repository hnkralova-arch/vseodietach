import { getCollection } from 'astro:content';

export const published = async <C extends 'diety' | 'recepty' | 'problemy'>(c: C) =>
  (await getCollection(c, ({ data }) => !data.draft)).sort((a, b) => a.data.title.localeCompare(b.data.title, 'cs'));

/** Odkaz z rozcestníku jen na stránku, která opravdu existuje. */
export async function problemHref(slug: string): Promise<string | undefined> {
  const all = await published('problemy');
  return all.some((p) => p.id === slug) ? `/problemy/${slug}/` : undefined;
}
