---
title: The Elements of the Page
description: A typographic inventory of every markdown element Lipi renders, written as an essay worth reading.
published: 2026-05-16
category: Guide
tags:
  - markdown
  - typography
  - writing
---

Every publishing system makes decisions about prose. The decisions you can see (typeface, measure, spacing) are downstream of decisions you cannot: how blockquotes are weighted, whether footnotes interrupt or defer, how a table earns its place in a text. This page renders each typographic element Lipi supports, using real content so you can judge not just the rendering but whether the element earns its place.

---

# On the Weight of Words

The tradition of marking up a document goes back further than HTML. Medieval scribes had their own system: rubrication for headings, flourishes for opening paragraphs, marginal annotations for commentary. What we call semantic markup is, in one sense, a continuation of practices that predate the printing press.

## The Paragraph, Revisited

The paragraph is the unit of sustained thought. Typography serves the paragraph before it serves anything else. A generous measure (around 68 characters per line), a comfortable line-height, and a face with sufficient optical size at body weight: these are the conditions under which reading becomes effortless rather than managed.

Lipi constrains its measure to 68 characters. This is narrower than many web layouts, which often run to 90 or 100 characters to fill a widescreen viewport. The narrower measure is deliberate. The eye returns to the left margin more frequently, which creates rhythm. Rhythm is what makes reading feel easy.

### Emphasis in Running Text

The first instrument of emphasis is **bold**, used for terms that carry load and should not be skimmed past. The second is *italic*, which is subtler: it leans into the text without breaking the line. Both work best when used sparingly. A page where every other sentence is bolded is a page where nothing is emphasised.

~~Strikethrough~~ has a narrower use. In technical writing, it marks a correction or a superseded instruction. In personal writing, it sometimes marks a thought the writer reconsidered but chose not to delete. Its presence acknowledges the time the text was written in.

Inline `code` marks technical terms, file paths, configuration values, and command names. It shifts the reader into a different register for a moment, then returns them to the prose.

#### Links and References

[The shape of a link](https://example.com) inside a paragraph is a small interruption. The underline signals that the text is a pointer, not just a word. Lipi uses a muted border-colour underline at rest, and shifts to the primary accent on hover. The goal is that links are findable without being distracting.

---

## The Quotation in Context

A blockquote is borrowed authority. It says: someone else said this, and it was worth preserving. The convention is to indent it, to set it off from the surrounding prose, to give it a left border that functions as a speaker mark.

> The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.

<cite>Marcel Proust</cite>

A pullquote works differently. Where a blockquote imports text from elsewhere, a pullquote lifts a passage from the article itself, enlarges it, and places it as a visual anchor in the flow. It is a magazine convention, and it works best when the quoted sentence is strong enough to stand alone.

<blockquote class="pullquote">
Typography is not decoration. It is the architecture of reading.
</blockquote>

---

## Lists That Earn Their Place

A list is appropriate when the items are genuinely discrete and parallel. When they are not, prose usually serves better. This is a list that earns its place:

The conditions under which a reader stays on the page:

1. The text rewards their attention within the first paragraph.
2. The measure is comfortable enough that their eyes move without effort.
3. The page does not interrupt them with widgets, banners, or motion.
4. The typeface is legible at the size the reader has chosen.

And a list that does not need to be a list, but would fragment poorly as prose:

- Kyoto in November, when the maple leaves turn without announcement
- The overnight ferry from Osaka to Beppu, the sea visible through a porthole
- A teahouse in the hills above Uji, closed on the day we arrived

Nested lists are possible, but warrant scrutiny. Use them only when the hierarchy is real:

- Japan
  - Kyoto
    - Arashiyama
    - Gion
  - Osaka
- Portugal
  - Lisbon
  - Porto

---

## Code With Context

A code block is not a footnote. It is a primary element of technical writing, and it should render with as much care as a paragraph. Lipi uses Shiki for syntax highlighting and preserves the warm neutral palette across light and dark modes.

```ts
// src/content.config.ts
const postsCollection = defineCollection({
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      published: z.coerce.date(),
      tags: z.array(z.string()).optional(),
      draft: z.boolean().default(false),
    }),
});
```

The filename in the code fence (`ts` followed by the path) renders as a label above the block. Use it when the path is meaningful to the reader: when you are telling them which file to open, not just illustrating a concept.

---

## Tables for Structured Comparison

A table is justified when the data has two or more meaningful axes. A table used to present a single list with labels is usually a list in disguise.

| Element | When to use | When to reach for prose instead |
| --- | --- | --- |
| Blockquote | External sources, borrowed authority | Short paraphrases that fit the flow |
| Table | Structured comparison across two axes | Single-axis data with no cross-reference |
| Footnote | Tangential facts that would interrupt the sentence | Essential context that belongs in the body |
| List | Genuinely discrete, parallel items | Items with natural connective tissue between them |

---

## The Figure and Its Caption

A figure is an image with context. The caption is not a description of what the image shows; the reader can see that. The caption explains why the image is there, or what to notice.

The syntax in Lipi is standard markdown image syntax inside a `<figure>` element:

<figure>
  <img src="/placeholder.jpg" alt="The stone lanterns at Fushimi Inari, photographed at dusk with the path behind them still warm from the day." />
  <figcaption>Fushimi Inari, Kyoto. The lanterns at the base of the mountain are the oldest; the ones near the summit are more recent dedications.</figcaption>
</figure>

---

## Definition Lists

Definition lists are a publishing convention that HTML supports natively but markdown largely ignores. In Lipi, you can use raw HTML for definitions:

<dl>
  <dt>Measure</dt>
  <dd>The width of a line of type, expressed in characters or physical units. The comfortable reading measure for body text falls between 45 and 75 characters per line.</dd>

  <dt>Leading</dt>
  <dd>The vertical distance between baselines, named after the strips of lead used to separate lines of type in hand composition. In CSS, this is line-height.</dd>

  <dt>Tracking</dt>
  <dd>The uniform adjustment of spacing between all letters in a word or passage, as distinct from kerning, which is the adjustment of space between specific letter pairs.</dd>
</dl>

---

## Footnotes

Footnotes are a device for honesty.[^1] They acknowledge that a sentence has more to say than the body can hold without interrupting itself. Used well, they extend the text for readers who want more without burdening readers who do not.[^2]

[^1]: And, occasionally, for humour. The footnote as comic register is a long tradition, from Gibbon to Pratchett.

[^2]: Lipi renders footnotes at the bottom of the post, linked from the inline marker. The styling is restrained: a small horizontal rule, then the note text in a slightly reduced size, clearly connected to its parent sentence.

---

## The Horizontal Rule

The `---` rule is a section break: a breath between topics that do not warrant a heading. Use it when the material shifts register or subject without requiring a new structural marker. It is quieter than a heading and more deliberate than a blank line.

The rule above this paragraph closes the list of elements and returns the essay to its conclusion.

---

Typography does not make writing good. But it can make good writing readable, and readable writing is more likely to be read to the end. Every element in this reference exists to serve that purpose: not to display Lipi's features, but to give the words the best possible conditions for being met.
