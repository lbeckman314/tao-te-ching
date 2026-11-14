import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Blockquote, Paragraph, Text, PhrasingContent, BlockContent } from 'mdast';

/**
 * Remark Callouts Plugin
 *
 * Converts Obsidian callout syntax into styled HTML blocks.
 * Supports collapsible callouts via [!type]+ (open) and [!type]- (closed),
 * rendered as <details>/<summary> so no client-side script is needed.
 *
 * Supported types: note, tip, important, warning, caution,
 * danger, info, question, success, failure, bug, example,
 * quote, abstract, summary, tldr
 */

// ── Icon SVG paths ────────────────────────────────────────────────────────────
// Tabler icons (outline, @tabler/icons 3.51.0), named by role; the Tabler name is noted where it differs

const iconPaths: Record<string, string> = {
  // info-circle
  info: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 9h.01"/><path d="M11 12h1v4h1"/>',
  // bulb
  lightbulb:
    '<path d="M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7"/><path d="M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3"/><path d="M9.7 17l4.6 0"/>',
  star: '<path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873l-6.158 -3.245"/>',
  // alert-triangle
  'triangle-alert':
    '<path d="M12 9v4"/><path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0"/><path d="M12 16h.01"/>',
  // alert-circle
  'circle-alert':
    '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  'circle-x':
    '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M10 10l4 4m0 -4l-4 4"/>',
  // help-circle
  'circle-help':
    '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 16v.01"/><path d="M12 13a2 2 0 0 0 .914 -3.782a1.98 1.98 0 0 0 -2.414 .483"/>',
  'circle-check':
    '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M9 12l2 2l4 -4"/>',
  bug: '<path d="M9 9v-1a3 3 0 0 1 6 0v1"/><path d="M8 9h8a6 6 0 0 1 1 3v3a5 5 0 0 1 -10 0v-3a6 6 0 0 1 1 -3"/><path d="M3 13l4 0"/><path d="M17 13l4 0"/><path d="M12 20l0 -6"/><path d="M4 19l3.35 -2"/><path d="M20 19l-3.35 -2"/><path d="M4 7l3.75 2.4"/><path d="M20 7l-3.75 2.4"/>',
  code: '<path d="M7 8l-4 4l4 4"/><path d="M17 8l4 4l-4 4"/><path d="M14 4l-4 16"/>',
  quote:
    '<path d="M10 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5"/><path d="M19 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5"/>',
  'file-text':
    '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2"/><path d="M9 9l1 0"/><path d="M9 13l6 0"/><path d="M9 17l6 0"/>',
};

function getIconSVG(iconName: string): string {
  const path = iconPaths[iconName] || iconPaths['info'];
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="callout__icon">${path}</svg>`;
}

// ── Callout type map ──────────────────────────────────────────────────────────

interface CalloutMapping {
  type: string;
  icon: string;
  title: string;
}

const calloutMappings: Record<string, CalloutMapping> = {
  note:      { type: 'note',      icon: 'info',          title: 'Note'      },
  tip:       { type: 'tip',       icon: 'lightbulb',     title: 'Tip'       },
  important: { type: 'important', icon: 'star',          title: 'Important' },
  warning:   { type: 'warning',   icon: 'triangle-alert',title: 'Warning'   },
  caution:   { type: 'caution',   icon: 'circle-alert',  title: 'Caution'   },
  danger:    { type: 'caution',   icon: 'circle-x',      title: 'Danger'    },
  info:      { type: 'note',      icon: 'info',          title: 'Info'      },
  question:  { type: 'important', icon: 'circle-help',   title: 'Question'  },
  success:   { type: 'tip',       icon: 'circle-check',  title: 'Success'   },
  failure:   { type: 'caution',   icon: 'circle-x',      title: 'Failure'   },
  bug:       { type: 'caution',   icon: 'bug',           title: 'Bug'       },
  example:   { type: 'tip',       icon: 'code',          title: 'Example'   },
  quote:     { type: 'note',      icon: 'quote',         title: 'Quote'     },
  abstract:  { type: 'important', icon: 'file-text',     title: 'Abstract'  },
  summary:   { type: 'important', icon: 'file-text',     title: 'Summary'   },
  tldr:      { type: 'important', icon: 'file-text',     title: 'TL;DR'     },
};

// ── Plugin ────────────────────────────────────────────────────────────────────

const remarkCallouts: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'blockquote', (node: Blockquote) => {
      const firstChild = node.children[0];
      if (!firstChild || firstChild.type !== 'paragraph') return;

      const firstText = (firstChild as Paragraph).children[0];
      if (!firstText || firstText.type !== 'text') return;

      const text = (firstText as Text).value;
      const calloutMatch = text.match(/^\[!([\w-]+)\]([+\-]?)[ \t]*(.*)/);
      if (!calloutMatch) return;

      const [fullMatch, calloutType, collapseState, customTitle] = calloutMatch;
      const mapping =
        calloutMappings[calloutType.toLowerCase()] || {
          type: 'note',
          icon: 'info',
          title:
            calloutType.charAt(0).toUpperCase() + calloutType.slice(1),
        };

      const isCollapsible = collapseState === '+' || collapseState === '-';
      const isCollapsed = collapseState === '-';
      const calloutTitle = customTitle.trim() || mapping.title;

      // Strip the `[!type] Title` line; drop the first paragraph if it's now empty
      const remainingText = text.slice(fullMatch.length).replace(/^\s+/, '');
      const firstParagraph = firstChild as Paragraph;
      if (remainingText) {
        (firstText as Text).value = remainingText;
      } else {
        firstParagraph.children.shift();
      }
      const contentChildren = (
        firstParagraph.children.length ? node.children : node.children.slice(1)
      ) as BlockContent[];

      const titleChildren: PhrasingContent[] = [
        { type: 'html', value: getIconSVG(mapping.icon) },
        {
          type: 'emphasis',
          data: { hName: 'span', hProperties: { className: ['callout__label'] } },
          children: [{ type: 'text', value: calloutTitle }],
        },
      ];
      if (isCollapsible) {
        titleChildren.push({
          type: 'html',
          value:
            '<svg class="callout__toggle-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6l6 -6"/></svg>', // Tabler chevron-down
        });
      }

      // Rewrite the blockquote in place as the callout wrapper
      const callout = node as any;
      callout.type = 'callout';
      callout.data = {
        hName: isCollapsible ? 'details' : 'div',
        hProperties: {
          className: [
            'callout',
            `callout-${mapping.type}`,
            ...(isCollapsible ? ['callout--collapsible'] : []),
          ],
          dataCallout: calloutType.toLowerCase(),
          ...(isCollapsible && !isCollapsed ? { open: true } : {}),
        },
      };
      callout.children = [
        {
          type: 'paragraph',
          data: {
            hName: isCollapsible ? 'summary' : 'div',
            hProperties: { className: ['callout__title'] },
          },
          children: titleChildren,
        },
        {
          type: 'callout-content',
          data: { hName: 'div', hProperties: { className: ['callout__content'] } },
          children: contentChildren,
        },
      ];
    });
  };
};

export default remarkCallouts;
