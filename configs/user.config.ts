import type { UserConfig } from "../src/site.config";

const userConfig: UserConfig = {
  title: "Tao Te Ching · 道德经",
  description:
    "A Book about the Way and the Power of the Way.",

  // Override the path the site is served under with BASE_PATH
  // (e.g. `BASE_PATH=/ pnpm dev` to serve from the root).
  url: new URL(
    process.env.BASE_PATH ?? "/tao-te-ching",
    "https://lbeckman314.github.io",
  ).href,
  author: "Lao Tzu",
  translator: "Ursula K. Le Guin",

  logo: "/logo.svg",
  avatar: "/avatar.png",

  navigation: [
    { title: "About", url: "/about" },
  ],

  footerLinks: [
    { title: "RSS", url: "/rss.xml" },
  ],

  social: [],

  repository: {
    url: "https://github.com/lbeckman314/tao-te-ching",
    branch: "main",
  },

  footerCredits: "Designed for reading. Built with Astro & Lipi",

  // Shown in the footer. Confirm the wording with the Le Guin Estate.
  rightsNotice:
    "© The Ursula K. Le Guin Estate",

  recentChapters: 6,
  relatedChapters: 4,

  showThemeToggle: true,
  showReadingTime: false,

  heroVariant: "studio",

  annotation: "A Book about the Way and the Power of the Way.",
};

export default userConfig;