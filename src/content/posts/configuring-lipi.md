---
title: Configuring Lipi
description: A field-by-field guide to lipi.config.ts and what each setting changes in the published site.
published: 2026-05-24
category: Guide
tags:
  - configuration
  - guide
  - setup
---

All of Lipi's site-level configuration lives in one file: `configs/lipi.config.ts`. Open it, change a value, and the dev server reflects the change immediately. There is no separate environment file, no admin panel, no database entry to update. The configuration is code, which means it is in version control, diffable, and portable.

## Identity

The four required fields establish who you are and where the site lives.

```ts
// configs/lipi.config.ts
const userConfig: UserConfig = {
  title: "The Long Read",
  description: "Essays and travel notes from the edge of the timetable.",
  url: "https://thelongread.com",
  author: "Your Name",
};
```

`title` appears in the browser tab, the page `<title>` element, and the default OG image. `description` is the fallback meta description for any page that does not provide its own. `url` is the canonical base URL and is used to build absolute links in the sitemap and RSS feed. `author` appears in the JSON-LD structured data attached to each post.

## Branding

```ts
  logo: "/logo.svg",
  avatar: "/avatar.png",
  defaultOGImage: "/og.jpg",
```

`logo` is the path to the site logo, served from the `public/` directory. It is only shown when `showLogo` is set to `true`. `avatar` is the author image shown in the hero area. `defaultOGImage` is the fallback Open Graph image used when a post does not define its own cover; Lipi generates per-post OG images automatically, so this file only appears on the home page and on pages without post context.

## Navigation

The header and footer links are configured separately, which lets you show a compact top navigation while keeping secondary links (RSS, archive, source) in the footer.

```ts
  navigation: [
    { title: "Writing", url: "/posts" },
    { title: "Archive", url: "/archive" },
    { title: "About", url: "/about" },
  ],

  footerLinks: [
    { title: "RSS", url: "/rss.xml" },
    { title: "Archive", url: "/archive" },
    { title: "Source", url: "https://github.com/yourusername/yourrepo" },
  ],
```

Each item takes a `title` (the visible label) and a `url`. Navigation links support both internal paths and external URLs.

## Social Links

```ts
  social: [
    { title: "GitHub", url: "https://github.com/yourusername", icon: "github" },
    { title: "X", url: "https://x.com/yourhandle", icon: "x" },
  ],
```

Social links appear in the header alongside the theme toggle. The `icon` field accepts `"github"`, `"x"`, or `"linkedin"`. If you omit `icon`, the link renders as plain text. Remove the social array entirely if you prefer no social links.

## Footer Credits

```ts
  footerCredits: "Designed for reading. Built with Astro & Lipi",
```

This string appears at the very bottom of every page, in small text. It is a good place for a tagline, a copyright notice, or a brief attribution. Leave it empty to show nothing.

## Pagination and Feed Depth

```ts
  postsPerPage: 8,
  recentPosts: 6,
  relatedPosts: 4,
```

`postsPerPage` controls how many posts appear per page in the `/posts` listing and the `/archive` view. `recentPosts` sets the number of posts shown in the "Recent" section on the home page (not counting the featured post). `relatedPosts` sets how many posts appear in the "You might also like" section at the bottom of each post, matched by shared tags.

## Display Toggles

```ts
  showLogo: false,
  showThemeToggle: true,
  showReadingTime: true,
```

`showLogo` controls whether the logo image is shown in the header. When `false`, the site title text is shown instead. `showThemeToggle` shows or hides the light/dark toggle button. Set it to `false` if you want to commit to one mode. `showReadingTime` shows or hides the estimated reading time that appears in post metadata.

## Hero Variant

```ts
  heroVariant: "studio",
```

The home page hero comes in two variants: `"default"` renders a minimal text-based hero, and `"studio"` renders the full studio hero with the studio logotype and handwritten annotation. If you are publishing under your own name rather than a studio brand, `"default"` is the cleaner choice.
