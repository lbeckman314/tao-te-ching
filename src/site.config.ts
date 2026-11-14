import userConfig from "../configs/user.config";

export interface NavItem {
  title: string;
  url: string;
  // Shown in place of the title, which stays as the link's accessible name and tooltip
  icon?: "github" | "info-circle";
}

export interface SocialItem {
  title: string;
  url: string;
  icon?: string;
}

export interface UserConfig {
  title: string;
  description: string;
  url: string;
  author: string;
  translator: string;

  avatar?: string;
  logo?: string;
  defaultOGImage?: string;

  navigation?: NavItem[];
  footerLinks?: NavItem[];
  social?: SocialItem[];

  footerCredits?: string;
  rightsNotice?: string;

  // Source repository, used for "Edit on GitHub" links
  repository?: {
    url: string;
    branch: string;
  };

  recentChapters?: number;
  relatedChapters?: number;
  // Chapters in the complete work; shows a progress tracker above the header
  totalChapters?: number;

  showLogo?: boolean;
  showThemeToggle?: boolean;
  showReadingTime?: boolean;

  heroVariant?: "default" | "studio";

  annotation?: string;

};

const siteConfig = {
  title: userConfig.title,
  description: userConfig.description,
  url: userConfig.url,
  author: userConfig.author,
  translator: userConfig.translator,

  avatar: userConfig.avatar,
  logo: userConfig.logo,
  ogImage: userConfig.defaultOGImage ?? "/og.jpg",

  navigation: userConfig.navigation ?? [],
  footerLinks: userConfig.footerLinks ?? [],
  social: userConfig.social ?? [],

  footerCredits: userConfig.footerCredits,
  rightsNotice: userConfig.rightsNotice,
  repository: userConfig.repository,

  recentChapters: userConfig.recentChapters ?? 6,
  relatedChapters: userConfig.relatedChapters ?? 4,
  totalChapters: userConfig.totalChapters,

  showLogo: userConfig.showLogo ?? false,
  showThemeToggle: userConfig.showThemeToggle ?? true,
  showReadingTime: userConfig.showReadingTime ?? true,

  heroVariant: userConfig.heroVariant ?? "default",

  annotation: userConfig.annotation,
};

export default siteConfig;