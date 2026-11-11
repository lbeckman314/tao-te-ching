// src/utils/og.tsx

import satori from "satori";
import { html } from "satori-html";
import { Resvg } from "@resvg/resvg-js";
import siteConfig from "@/site.config";
import notoSansRegular from "@/assets/fonts/NotoSans-Regular.ttf";
import notoSerifRegular from "@/assets/fonts/NotoSerif-Regular.ttf";
import notoSerifBold from "@/assets/fonts/NotoSerif-Bold.ttf";

export type OgImageOptions = {
  title: string;
  description?: string;
  category?: string;
  published?: Date;
  site?: string;
};

const WIDTH = 1200;
const HEIGHT = 630;

type SatoriFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 700;
  style: "normal";
};

// The bundled Noto fonts are Latin-only. For CJK text, satori asks for extra
// fonts per language; fetch a Google Fonts subset containing just the
// characters needed (a few KB), so no large CJK font has to be committed.
const CJK_FAMILIES: Record<string, string> = {
  "zh-TW": "Noto Serif TC",
  "zh-HK": "Noto Serif TC",
  "ja-JP": "Noto Serif JP",
  "ko-KR": "Noto Serif KR",
};

const fontCache = new Map<string, Promise<SatoriFont[]>>();

async function fetchSubsetFonts(family: string, text: string): Promise<SatoriFont[]> {
  const cssUrl =
    `https://fonts.googleapis.com/css2?family=${family.replaceAll(" ", "+")}` +
    `:wght@400;700&text=${encodeURIComponent(text)}`;
  // Google Fonts serves TrueType (which satori needs) to non-browser clients.
  const css = await (await fetch(cssUrl)).text();
  const faces = [...css.matchAll(/font-weight:\s*(\d+);[^}]*?src:\s*url\(([^)]+)\)/g)];

  return Promise.all(
    faces.map(async ([, weight, url]) => ({
      name: family,
      data: await (await fetch(url)).arrayBuffer(),
      weight: Number(weight) === 700 ? 700 : 400,
      style: "normal" as const,
    }))
  );
}

async function loadAdditionalAsset(languageCode: string, segment: string) {
  if (languageCode === "emoji" || languageCode === "unknown") return [];

  const family = CJK_FAMILIES[languageCode] ?? "Noto Serif SC";
  const key = `${family}|${segment}`;

  if (!fontCache.has(key)) {
    fontCache.set(
      key,
      fetchSubsetFonts(family, segment).catch((error) => {
        // Don't fail the build over a missing glyph font; the text just won't render.
        console.warn(`[og] Could not load ${family} for "${segment}":`, error);
        return [];
      })
    );
  }

  return fontCache.get(key)!;
}

function formatDate(date?: Date) {
  if (!date) return "";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(date);
}

export async function generateOgImage({
  title,
  description,
  category,
  published,
  site = siteConfig.url,
  }: OgImageOptions) {
  const markup = html(`
    <div
      style="
        width: 100%;
        height: 100%;
        background: #F5F4ED;
        color: #22201C;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 72px;
      "
    >
      <div
        style="
          display: flex;
          flex-direction: column;
          gap: 28px;
        "
      >
        <div
          style="
            font-family: 'Lipi Sans';
            font-size: 24px;
            opacity: 0.7;
            display: flex;
            gap: 10px;
            align-items: center;
          "
        >
          ${
            category
              ? `<span>${category}</span>`
              : ""
          }

          ${
            category && published
              ? `<span>·</span>`
              : ""
          }

          ${
            published
              ? `<span>${formatDate(
                  published
                )}</span>`
              : ""
          }
        </div>

        <div
          style="
            font-family: 'Lipi Serif';
            font-size: 72px;
            line-height: 1.1;
            font-weight: 700;
            letter-spacing: -0.04em;
            max-width: 900px;
          "
        >
          ${title}
        </div>

        ${
          description
            ? `
            <div
              style="
                font-family: 'Lipi Sans';
                font-size: 30px;
                line-height: 1.45;
                opacity: 0.8;
                max-width: 760px;
              "
            >
              ${description}
            </div>
          `
            : ""
        }
      </div>

      <div
        style="
          font-family: 'Lipi Sans';
          font-size: 24px;
          opacity: 0.6;
        "
      >
        ${site}
      </div>
    </div>
  `);

  const svg = await satori(markup, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
    {
      name: "Lipi Serif",
      data: notoSerifRegular,
      weight: 400,
      style: "normal",
    },

    {
      name: "Lipi Serif",
      data: notoSerifBold,
      weight: 700,
      style: "normal",
    },

    {
      name: "Lipi Sans",
      data: notoSansRegular,
      weight: 400,
      style: "normal",
    },
  ],
    loadAdditionalAsset,
  });

  const resvg = new Resvg(svg);

  return resvg.render().asPng();
}