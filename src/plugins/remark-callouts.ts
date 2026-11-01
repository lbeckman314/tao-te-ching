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

const iconPaths: Record<string, string> = {
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="m12 8 .01 0"/>',
  lightbulb:
    '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  star: '<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>',
  'triangle-alert':
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="m12 17 .01 0"/>',
  'circle-alert':
    '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="m12 16 .01 0"/>',
  'circle-x':
    '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  'circle-help':
    '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  'circle-check':
    '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  bug: '<path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/>',
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  quote:
    '<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>',
  'file-text':
    '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
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
            '<svg class="callout__toggle-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6,9 12,15 18,9"></polyline></svg>',
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
