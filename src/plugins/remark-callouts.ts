import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Blockquote, Paragraph, Text, PhrasingContent, BlockContent } from 'mdast';
import { tablerIconSvg } from './tabler-icons';

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

// ── Icons ─────────────────────────────────────────────────────────────────────
// Callout icon roles → Tabler icon names (@iconify-json/tabler)

const iconNames: Record<string, string> = {
  info: 'info-circle',
  lightbulb: 'bulb',
  star: 'star',
  'triangle-alert': 'alert-triangle',
  'circle-alert': 'alert-circle',
  'circle-x': 'circle-x',
  'circle-help': 'help-circle',
  'circle-check': 'circle-check',
  bug: 'bug',
  code: 'code',
  quote: 'quote',
  'file-text': 'file-text',
};

function getIconSVG(iconName: string): string {
  const name = iconNames[iconName] ?? iconNames.info;
  return tablerIconSvg(name, 'width="16" height="16" class="callout__icon" aria-hidden="true"') ?? '';
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
            tablerIconSvg('chevron-down', 'class="callout__toggle-icon" width="16" height="16" aria-hidden="true"') ?? '',
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
