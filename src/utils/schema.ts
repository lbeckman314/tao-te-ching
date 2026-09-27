import siteConfig from "@/site.config";
import { type Chapter, type Page, getChapterUrl } from "./content";

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
  };
}

export function generateChapterSchema(
  chapter: Chapter
) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: chapter.data.title,
    description: chapter.data.description,
    datePublished: chapter.data.published,
    dateModified:
      chapter.data.updated ??
      chapter.data.published,

    url: getChapterUrl(
      chapter.id,
      chapter.filePath
    ),

    author: {
      "@type": "Person",
      name: siteConfig.author,
    },
  };
}

export function generateAboutSchema(
  page: Page
) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: page.data.title,
    description: page.data.description,
    url: new URL(
      "/about",
      siteConfig.url
    ).toString(),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.title,
      url: siteConfig.url,
    },
    author: {
      "@type": "Person",
      name: siteConfig.author,
    },
  };
}