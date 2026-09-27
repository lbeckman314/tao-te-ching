import type {
  APIRoute,
} from "astro";

import {
  getAllChapters,
  getChapterSlug,
} from "@/utils/content";

import {
  generateOgImage,
} from "@/utils/og";

export async function getStaticPaths() {
  const chapters =
    await getAllChapters();

  return chapters.map((chapter) => ({
    params: {
      slug: getChapterSlug(
        chapter.id,
        chapter.filePath
      ),
    },

    props: {
      chapter,
    },
  }));
}

export const GET: APIRoute =
  async ({ props }) => {
    const { chapter } = props;

    const png =
      await generateOgImage({
        title: chapter.data.title,

        description:
          chapter.data.description,

        category:
          chapter.data.category,

        published:
          chapter.data.updated ??
          chapter.data.published,
      });

    return new Response(png, {
      headers: {
        "Content-Type":
          "image/png",
      },
    });
  };