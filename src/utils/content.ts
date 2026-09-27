import { getCollection, type CollectionEntry, } from "astro:content";
import { getAssetPath } from "./url";
import { slugify } from "./text";
import siteConfig from "@/site.config";
import {CHAPTERS_PATH, PAGES_PATH} from "@/content.config";

export type Chapter = CollectionEntry<"chapters">;
export type Page = CollectionEntry<"pages">;
export type TagArchive = {
  tag: string;
  slug: string;
  count: number;
  chapters: Chapter[];
};

let chaptersCache: Chapter[] | null = null;
let pagesCache: Page[] | null = null;


function isVisiblePage(page: Page): boolean {
  // Show drafts in development
  if (import.meta.env.DEV) {
    return true;
  }

  return !page.data.draft;
}

function isPublicPage(page: Page): boolean {
  return page.id !== "home-intro";
}

function isVisibleChapter(chapter: Chapter): boolean {
  // Show drafts and scheduled chapters in development
  if (import.meta.env.DEV) {
    return true;
  }

  // Chapters dated in the future stay hidden until a build on or after that date
  const { draft, published } = chapter.data;
  return !draft && (!published || published <= new Date());
}

export async function getAllChapters(): Promise<Chapter[]> {
  if (chaptersCache) {
    return chaptersCache;
  }

  const chapters = await getCollection(
    "chapters",
    isVisibleChapter,
  );

  chaptersCache = chapters.sort((a, b) => {
    const aNum = parseInt(a.id, 10);
    const bNum = parseInt(b.id, 10);

    if (!Number.isNaN(aNum) && !Number.isNaN(bNum) && aNum !== bNum) {
      return aNum - bNum;
    }

    return a.id.localeCompare(b.id);
  });

  return chaptersCache;
}

export async function getAllPages(): Promise<Page[]> {
  if (pagesCache) {
    return pagesCache;
  }

  const pages = await getCollection(
    "pages",
    (page) =>
      isVisiblePage(page) &&
      isPublicPage(page)
  );

  pagesCache = pages;

  return pagesCache;
}

export async function getAllTagArchives(): Promise<TagArchive[]> {
  const chapters = await getAllChapters();
  const archives = new Map<
    string,
    {
      tag: string;
      slug: string;
      chapters: Chapter[];
      chapterIds: Set<string>;
    }
  >();

  for (const chapter of chapters) {
    for (const tag of chapter.data.tags ?? []) {
      const slug = slugify(tag);

      if (!slug) {
        continue;
      }

      const archive =
        archives.get(slug) ??
        {
          tag,
          slug,
          chapters: [],
          chapterIds: new Set<string>(),
        };

      if (!archive.chapterIds.has(chapter.id)) {
        archive.chapters.push(chapter);
        archive.chapterIds.add(chapter.id);
      }

      archives.set(slug, archive);
    }
  }

  return Array.from(archives.values())
    .map(({ tag, slug, chapters }) => ({
      tag,
      slug,
      count: chapters.length,
      chapters,
    }))
    .sort((a, b) =>
      a.tag.localeCompare(b.tag)
    );
}

/**
 * Remove hidden folders and normalize directory segments.
 *
 * Example:
 * chapters/_2026/Japan Beyond Places.md
 * -> []
 *
 * chapters/travel/Japan/Tokyo.md
 * -> ["travel", "japan"]
 */
export function getChapterPathSegments(
  filePath?: string
): string[] {
  if (!filePath) {
    return [];
  }

  return filePath
    .replace(CHAPTERS_PATH, "")
    .split("/")
    .filter(Boolean)
    .filter((segment) => !segment.startsWith("_"))
    .slice(0, -1)
    .map(slugify);
}

/**
 * Get the final slug segment from Astro content entry ID.
 *
 * Example:
 * "travel/tokyo-beyond-places"
 * -> "tokyo-beyond-places"
 */
export function getEntrySlugSegment(id: string): string {
  const segments = id.split("/");

  return segments.at(-1) ?? id;
}

/**
 * Generate nested slug path from file structure.
 *
 * Example:
 * travel/japan/tokyo.md
 * -> "travel/japan/tokyo"
 */
export function getChapterSlugPath(
  id: string,
  filePath?: string
): string {
  const segments = getChapterPathSegments(filePath);

  const slug =
    slugify(getEntrySlugSegment(id));

  return segments.length > 0
    ? [...segments, slug].join("/")
    : slug;
}

/**
 * Route param slug used in getStaticPaths().
 *
 * Example:
 * "/travel/japan/tokyo"
 */
export function getChapterSlug(
  id: string,
  filePath?: string
): string {
  return `/${getChapterSlugPath(id, filePath)}`;
}

export function getPagePathSegments(
  filePath?: string
): string[] {
  if (!filePath) {
    return [];
  }

  return filePath
    .replace(PAGES_PATH, "")
    .split("/")
    .filter(Boolean)
    .filter((segment) => !segment.startsWith("_"))
    .slice(0, -1)
    .map(slugify);
}

export function getPageSlugPath(
  id: string,
  filePath?: string
): string {
  const segments = getPagePathSegments(filePath);
  const slug = slugify(getEntrySlugSegment(id));

  return segments.length > 0
    ? [...segments, slug].join("/")
    : slug;
}

export function getPageSlug(
  id: string,
  filePath?: string
): string {
  return `/${getPageSlugPath(id, filePath)}`;
}

/**
 * Full chapter URL.
 *
 * Example:
 * "/chapters/travel/japan/tokyo"
 */
export function getChapterUrl(
  id: string,
  filePath?: string
): string {
  return getAssetPath(
    `chapters/${getChapterSlugPath(id, filePath)}`
  );
}

/**
 * Get adjacent chapters.
 */
export function getAdjacentChapters<
  T extends Chapter
>(
  chapters: T[],
  currentChapter: T
) {
  const index = chapters.findIndex(
    (chapter) => chapter.id === currentChapter.id
  );

  return {
    prevChapter:
      index > 0
        ? chapters[index - 1]
        : null,

    nextChapter:
      index < chapters.length - 1
        ? chapters[index + 1]
        : null,
  };
}
