---
title: Colour Schemes
description: Lipi's default colour system, its light and dark expressions, and how to build your own named scheme on top of it.
published: 2026-05-18
category: Guide
tags:
  - design
  - customisation
  - colour
---

Lipi ships with one colour scheme, drawing on the warmth and restraint of the Kami design language. It comes in two modes, light and dark, and it is designed to serve long reading sessions without tiring the eye. This post describes the character of each mode, and then shows how to build named schemes of your own using the same variable system.

## Lipi Light

The default. The ground is `#F5F4ED`, a warm off-white that reads as paper under good light rather than as a backlit screen. The foreground is `#252523`, a near-black with a faint warm undertone that keeps text readable without the harshness of a pure `#000000`. The single accent is `#E85D2A`, a terracotta-to-burnt-orange that reads as ink rather than as a notification.

Lipi Light suits long-form essays, travel writing, and personal journals. It is a natural choice for any publication that wants to feel like a printed thing rather than a digital one. The parchment ground reduces eye strain over sustained reading, and the warm neutrals hold their character across a wide range of display calibrations.

## Lipi Dark

The dark mode inverts the scale without abandoning the warmth. The ground is `#141413`, a near-black that is warmer than `#000` and avoids the flat, screen-like quality of a pure black background. The foreground steps up to `#ECEAE2`, a warm off-white. The terracotta accent holds across both modes, giving the site a consistent identity whether the reader prefers light or dark.

Lipi Dark suits low-light reading, late-night writing sessions, and any context where the screen needs to recede. It is not a high-contrast dark theme. It is a quiet one, designed for sustained use rather than for visual impact.

## Building a Custom Scheme

Any named scheme follows the same structure. You define a `[data-theme="name"]` block in `src/styles/theme.css` and override only the base tokens that need to change. The semantic layer inherits automatically.

**Paper** is a cooler, slightly brighter variant suited to note-taking and developer writing. Ground closer to white, neutral foreground, a slate-blue accent. It reads like a legal pad under fluorescent light: clear and unsentimental.

**Forest** shifts the neutral scale toward a desaturated green. The background gains a slight olive tone, the foreground stays near-black, and the accent moves to a muted sage. It suits nature writing, botanical journals, and any publication that wants to feel grounded rather than archival.

**Midnight** is the high-contrast companion to Lipi Dark. The background moves to a true near-black (`#0D0C0B`), the foreground brightens, and the accent warms to a gold-leaning amber. It suits technical writing and developer journals where strong text contrast matters more than reading warmth.

To activate any of these, define a `[data-theme]` block in `theme.css` with the tokens you want to override, then set `data-theme` on the `<html>` element in your base layout. The rest of the system handles itself.

The full customisation guide covers the exact token names and shows the CSS structure in detail.
