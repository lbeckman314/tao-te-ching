---
title: Colophon
description: The typefaces, tools, and decisions behind Lipi.
updated: 2026-05-26
---

A colophon records how a book was made: who set the type, which press printed it, when and where. This page serves that function for Lipi.

## Typefaces

The body typeface is **Literata**, designed by Veronika Burian and José Scaglione at TypeTogether and expanded by Google Fonts. It is a contemporary serif intended for sustained on-screen reading: optically sized for text use, warm enough to feel literary, and technically precise enough to hold its weight at a wide range of sizes. It is the closest thing to a book face that loads well from a web font.

The interface typeface is **Manrope**, a geometric sans-serif that works at small sizes without losing clarity. It carries post metadata, navigation labels, and other elements where the type needs to function rather than to be read.

The monospaced typeface is **Fira Code**, used for inline code and code blocks. It includes ligatures for common programming symbols, but these are not forced: if you prefer to disable them, set `font-variant-ligatures: none` on `code` elements.

The annotation typeface is **Caveat**, a handwritten face used for the single flourish on the home page. It appears in one place, rotated two degrees, in the primary accent colour. Using it more widely would undercut the effect.

## Design Language

Lipi's visual and typographic character is inspired by the [Kami](https://kami.tw93.fun) design language. The guiding principles are: warm over cool, constrained over expansive, quiet over assertive.

The base colour scale is a single warm neutral ramp of eleven steps, from a near-white parchment (`#F5F4ED`) to a near-black (`#141413`). There is one brand colour, a terracotta (`#E85D2A`), used sparingly: links on hover, the reading progress bar, the drop capital, the CTA on the featured post. The scale is not cold grey and it is not blue. It reads like a printed page rather than a screen.

The reading measure is held at 68 characters per line. The paragraph spacing is generous. Headings are tracked tightly and balanced with `text-wrap: balance`. Images carry a hairline inset border that separates them from the parchment ground. There is a subtle paper texture applied to the entire page via a CSS noise filter at 3% opacity: present enough to soften the backlit quality of a screen, invisible enough to go unnoticed by most readers.

## Technology

Lipi is built with **Astro**, a static site generator with an island architecture. The output is primarily static HTML with JavaScript only where the interface requires it (the theme toggle, the scroll-to-top button, the search).

Styling is handled by **Tailwind CSS v4**, configured without a Tailwind config file. All theme tokens are defined as CSS custom properties and consumed through the Tailwind CSS variable bridge. There are no custom Tailwind plugins.

Syntax highlighting uses **Shiki**, which is bundled with Astro. It renders code to static HTML with no client-side JavaScript. The colour tokens are mapped to Lipi's theme variables so highlighting adapts to light and dark mode.

Search is provided by **Pagefind**, a static full-text search library that runs entirely in the browser against a pre-built index. The index is generated at build time. Search adds no external API calls and no tracking.

Fonts are loaded through **Astro's font API**, which optimises loading, subsets the files, and generates the `@font-face` declarations automatically. Font files are bundled into the build output rather than loaded from a third-party CDN.

## Design Decisions Worth Naming

**The hairline rules** between sections are generated with a CSS gradient, not a solid border. They fade at both ends. This is a small thing, but it softens what would otherwise be a mechanical cut across the page.

**The drop capital** on the first paragraph of each post is applied with `initial-letter` and scoped to viewports wider than 768px, where the layout has enough room for it to work. On mobile, the first paragraph renders normally. No JavaScript is involved.

**Print continuity** means that Cmd+P produces a result close to the screen layout: the parchment background is preserved, the type scale holds, and the page does not collapse into a plain-text dump. Lipi is one of few web templates where printing is considered rather than ignored.

**The reading progress bar** at the top of each post is powered by CSS scroll-driven animations, with no JavaScript fallback needed for modern browsers.

## Source

The Lipi is MIT licensed and the source is available at the link in the footer.
