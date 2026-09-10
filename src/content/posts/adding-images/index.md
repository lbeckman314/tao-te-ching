---
title: Images and Galleries
description: How Lipi handles inline images, cover images, and post galleries — and the folder structure that makes it work.
published: 2026-05-14
category: Guide
cover: posts/adding-images/attachments/cover.png
tags:
  - guide
  - images
  - gallery
  - writing
---

Lipi supports images in two distinct ways. The first is inline: images embedded inside post content using standard markdown syntax, sitting alongside the prose. The second is a dedicated gallery that renders below the article as a separate visual section. The two serve different purposes and are set up differently, but they share the same folder convention.

## Folder-based posts

Flat post files (a single `.md` file in `src/content/posts/`) work well for most writing. But as soon as a post needs attached images — either inline or in a gallery — it needs its own folder.

A folder-based post looks like this:

```txt
src/content/posts/
└── my-post/
    ├── index.md         ← the post itself
    ├── attachments/     ← inline images and cover image
    │   ├── cover.jpg
    │   └── section-image.jpg
    └── gallery/         ← gallery images, auto-detected
        ├── 01-first.jpg
        └── 02-second.jpg
```

The post file must be named `index.md`. The folder name becomes the URL slug: `my-post/index.md` is served at `/posts/my-post`.

Folders prefixed with `_` are stripped from the URL the same way they are for flat posts. A folder `_2026/my-post/index.md` serves at `/posts/my-post`.

## Inline images

Inside the post body, images use standard markdown syntax with paths relative to `index.md`:

![Placeholder Inline Image](./attachments/inline-image.png)

```md
![A view of the fort from the valley floor](./attachments/fort-valley.jpg)
```

The `./attachments/` prefix is the convention Lipi expects. Place the image file in the post's `attachments/` directory, and reference it from there.

Inline images render as full-width figures within the article's reading column. Captions are supported through the standard `<figure>` and `<figcaption>` elements in MDX, or directly in markdown with the image `alt` text.

The `rehype-unwrap-images` plugin in Lipi's markdown pipeline removes the `<p>` wrapper that markdown normally places around `<img>` tags, so images participate cleanly in the prose layout.

Here is what an inline image with a caption looks like in MDX:

```mdx
<figure>
  <img src="./attachments/pagoda-detail.jpg" alt="Stone carving at the base of the pagoda" />
  <figcaption>The carvings date to the twelfth century. Restoration work finished in 2019.</figcaption>
</figure>
```

## Inline gallery

When the inline images added without any extra line in-between, the images will be converted in inline-gallery.

![Placeholder Inline Image](./attachments/inline-image.png)
![Placeholder Inline Image](./attachments/inline-image-2.png)
![Placeholder Inline Image](./attachments/inline-image-3.png)
![Placeholder Inline Image](./attachments/inline-image-4.png)

```md
![A view of the fort from the valley floor](./attachments/fort-view.jpg)
![A view of valley from fort](./attachments/valley-view.jpg)
![A fort gate](./attachments/fort-gate.jpg)
```

## Cover images

A post's cover image is set in frontmatter. It appears above the article content on the post page and is used as the Open Graph image in place of the auto-generated OG card.

```yaml
---
title: My Post
cover: posts/my-post/attachments/cover.jpg
---
```

The path is vault-absolute from `src/content/` — not a relative path. This is different from inline image references, which use `./attachments/` relative paths.

When `cover` is omitted, Lipi generates an OG image automatically from the post title using Satori. No cover file is required.

## Galleries

Any images placed in the `gallery/` directory of a post folder are automatically detected and rendered as a grid below the article. No frontmatter configuration is needed. Lipi discovers them at build time through a static glob and renders the `PostGallery` component when the folder is non-empty.

Name gallery images with a leading number to control display order:

```txt
gallery/
├── 01-wide-shot.jpg
├── 02-detail.jpg
├── 03-portrait.jpg
└── 04-closing.jpg
```

Lipi derives alt text from the filename automatically. Hyphens and underscores become spaces, the leading number is stripped, and each word is capitalised. `03-north-rampart-at-dusk.jpg` becomes `North Rampart At Dusk`. You can rely on this convention or override alt text by renaming the files descriptively.

The gallery renders below the post body and above the tags and navigation. It includes a photo count and a section heading that defaults to `Gallery`. GLightbox handles the lightbox on click — each image opens full-screen with keyboard and swipe navigation, and all images in the post's gallery group together into a single browsable set.

## Supported formats

Lipi's image glob picks up `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, and `.gif` in both upper and lower case. Astro's image optimisation pipeline handles resizing and format conversion at build time, so you can supply high-resolution originals and let the build process produce the sizes the browser needs.
