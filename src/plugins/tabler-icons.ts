import { createRequire } from 'node:module';

/**
 * Tabler icons (@iconify-json/tabler) for the remark plugins, which run on
 * Markdown and so can't use astro-icon's <Icon> component. Each icon body
 * carries its own stroke settings and draws in currentColor.
 */

interface IconSet {
  icons: Record<string, { body: string }>;
  aliases?: Record<string, { parent: string }>;
}

const require = createRequire(import.meta.url);
const tabler: IconSet = require('@iconify-json/tabler/icons.json');

/** The icon's SVG body, following Tabler's aliases for renamed icons. */
export function tablerIconBody(name: string): string | undefined {
  let current = name;
  for (let hops = 0; !tabler.icons[current] && hops < 5; hops++) {
    const parent = tabler.aliases?.[current]?.parent;
    if (!parent) break;
    current = parent;
  }
  return tabler.icons[current]?.body;
}

/** A complete <svg> for the icon, with the given extra attributes, or undefined if there's no such icon. */
export function tablerIconSvg(name: string, attributes = ''): string | undefined {
  const body = tablerIconBody(name);
  if (!body) return undefined;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"${attributes ? ` ${attributes}` : ''}>${body}</svg>`;
}
