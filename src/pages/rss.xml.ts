import rss from "@astrojs/rss";
import siteConfig from "@/site.config";
import {
  getAllChapters,
  getChapterUrl,
} from "@/utils/content";

export async function GET() {
  const chapters = await getAllChapters();
  const site = siteConfig.url;

  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site,
    items: chapters.toReversed().map((chapter) => ({
      title: chapter.data.title,
      description: chapter.data.description,
      pubDate: chapter.data.published,
      link: getChapterUrl(
        chapter.id,
        chapter.filePath
      ),
    })),
  });
}
