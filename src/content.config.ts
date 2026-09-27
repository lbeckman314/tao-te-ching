import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

export const CHAPTERS_PATH = "src/content/chapters/";
export const PAGES_PATH = "src/content/pages/";

function removeDupsAndLowerCase(array: string[]) {
	if (!array.length) return array;
	const lowercaseItems = array.map((str) => str.toLowerCase());
	const distinctItems = new Set(lowercaseItems);
	return Array.from(distinctItems);
}

const chaptersCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: `./${CHAPTERS_PATH}` }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    published: z.coerce.date().optional(),
    updated: z.coerce.date().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).transform(removeDupsAndLowerCase).optional(),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
    lang: z.string().optional(),
    annotation: z.string().optional(),
  })
});

const pagesCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: `./${PAGES_PATH}` }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    updated: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    lang: z.string().optional(),
    annotation: z.string().optional(),
  })
});

export const collections = {
  chapters: chaptersCollection,
  pages: pagesCollection,
};