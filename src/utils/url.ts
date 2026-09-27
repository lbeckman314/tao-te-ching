import siteConfig from "@/site.config";

const base = import.meta.env.BASE_URL.replace(/\/+$/, "");
const baseRoot = base === "" ? "/" : `${base}/`;

function isExternal(path: string): boolean {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(path);
}

export function getAssetPath(path: string): string {
  if (isExternal(path)) return path;

  const normalized = path.replace(/^\/+/, "");

  return normalized ? `${baseRoot}${normalized}` : baseRoot;
}

export function absoluteUrl(
  path: string,
  site?: string | URL
): string {
  return new URL(getAssetPath(path), site).toString();
}
export function getEditUrl(filePath?: string): string | undefined {
  const { repository } = siteConfig;
  if (!repository || !filePath) return undefined;

  return `${repository.url.replace(/\/+$/, "")}/blob/${repository.branch}/${filePath}`;
}
