import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { visit, SKIP } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Text, PhrasingContent } from 'mdast';
import { tablerIconSvg } from './tabler-icons';

/**
 * Remark Icons Plugin
 *
 * Inlines icons in markdown by name:
 *   :info-circle:   → Tabler's info-circle (@iconify-json/tabler)
 *   [:github: Source](https://github.com/...)
 *
 * A name is looked up in src/assets first (for custom icons), then in
 * Tabler; ALIASES keeps short names working. Only names that match an
 * icon are replaced, so ordinary text with colons (e.g. "5:30:") is left
 * alone. Icons inherit the surrounding text colour (currentColor) and are
 * sized to 1em.
 */

const ASSETS_DIR = join(process.cwd(), 'src/assets');

// Short names → Tabler names
const ALIASES: Record<string, string> = {
  github: 'brand-github',
};

const INLINE_ATTRIBUTES = 'class="inline-icon" aria-hidden="true" focusable="false"';

function loadIcons(): Map<string, string> {
  const icons = new Map<string, string>();
  for (const file of readdirSync(ASSETS_DIR)) {
    if (!file.endsWith('.svg')) continue;
    const svg = readFileSync(join(ASSETS_DIR, file), 'utf8')
      .trim()
      // Drop any existing size/class so the inline-icon styles apply
      .replace(/<svg\b([^>]*)>/, (_, attrs: string) => {
        const kept = attrs.replace(/\s(width|height|class)="[^"]*"/g, '');
        return `<svg${kept} ${INLINE_ATTRIBUTES}>`;
      });
    if (svg) icons.set(basename(file, '.svg'), svg);
  }
  return icons;
}

function findIcon(icons: Map<string, string>, name: string): string | undefined {
  const local = icons.get(name);
  if (local) return local;

  const svg = tablerIconSvg(ALIASES[name] ?? name, INLINE_ATTRIBUTES);
  if (svg) icons.set(name, svg);
  return svg;
}

const ICON_PATTERN = /:([a-z0-9][a-z0-9-]*):/g;

const remarkIcons: Plugin<[], Root> = () => {
  const icons = loadIcons();

  return (tree) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || typeof index !== 'number') return;

      const parts: PhrasingContent[] = [];
      let last = 0;
      for (const match of node.value.matchAll(ICON_PATTERN)) {
        const svg = findIcon(icons, match[1]);
        if (!svg) continue;
        if (match.index > last) {
          parts.push({ type: 'text', value: node.value.slice(last, match.index) });
        }
        parts.push({ type: 'html', value: svg });
        last = match.index + match[0].length;
      }
      if (!parts.length) return;
      if (last < node.value.length) {
        parts.push({ type: 'text', value: node.value.slice(last) });
      }

      parent.children.splice(index, 1, ...(parts as typeof parent.children));
      return [SKIP, index + parts.length];
    });
  };
};

export default remarkIcons;
