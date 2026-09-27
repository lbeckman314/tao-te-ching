// src/pages/og.png.ts

import type {
  APIRoute,
} from "astro";

import siteConfig from "@/site.config";

import {
  generateOgImage,
} from "@/utils/og";

export const GET: APIRoute =
  async () => {
    const png =
      await generateOgImage(
        {
          // The OG fonts have no CJK glyphs, so drop the Chinese title
          title: siteConfig.title.replace(/[　-鿿]/g, "").trim(),

          description:
            siteConfig.description,

          site: siteConfig.url,
        }
      );

    return new Response(png, {
      headers: {
        "Content-Type":
          "image/png",
      },
    });
  };
