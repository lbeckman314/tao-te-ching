import type { UserConfig } from "../src/site.config";

const userConfig: UserConfig = {
  title: "Tao Te Ching / 道德经",
  description:
    "A Book about the Way and the Power of the Way.",

  url: "https://lbeckman314.github.io/tao-te-ching",
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
    "Tao Te Ching, translated by Ursula K. Le Guin (Shambhala, ISBN 978-1611807240). © The Ursula K. Le Guin Estate. Published by permission; not for commercial use.",

  recentChapters: 6,
  relatedChapters: 4,

  showThemeToggle: true,
  showReadingTime: false,

  heroVariant: "studio",

  annotation: "A Book about the Way and the Power of the Way.",
};

export default userConfig;