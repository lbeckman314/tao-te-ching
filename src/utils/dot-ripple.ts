/*
 * A water ripple drawn in dot characters, after Puddle.js (MIT, batman-nair/puddle.js)
 * and vale.rocks: Hugo Elias's two-buffer water model on a grid of cells, each cell
 * drawn as one glyph from a quiet-to-dense ramp. One canvas, no dependencies.
 *
 * With echoes off, each drop is a single ring that widens and fades instead: the
 * water model keeps ringing behind every front, which reads as two or three rings.
 */

export interface DotRippleOptions {
  /** Characters from still water to crest; the first is drawn as nothing. */
  ramp?: string;
  /** Cell size in CSS px. */
  cell?: number;
  /** Share of each wave kept per step (0–1); higher travels further. */
  damping?: number;
  /** Simulation steps per second. */
  rate?: number;
  /** Drop a light ripple every so often, so the field is never fully still. */
  rain?: boolean;
  /** Open with a few rings already travelling (a still frame under reduced motion); false starts blank. */
  seed?: boolean;
  /** Let the water keep ringing behind each front (the Puddle.js look); false draws one ring per drop. */
  echoes?: boolean;
}

/** One widening ring, for echoes off. Position in CSS px, age in simulation steps. */
interface Ring {
  x: number;
  y: number;
  strength: number;
  age: number;
}

export interface DotRipple {
  /** A small ripple under the pointer (each cell drips at most every 450ms). */
  move(x: number, y: number): void;
  /** A bigger ripple, for a click or tap. */
  press(x: number, y: number): void;
  destroy(): void;
}

const MOVE_STRENGTH = 100;
const PRESS_STRENGTH = 260;
const MOVE_DELAY = 450;
const RAIN_EVERY = 700;
const CUTOFF = 1.5;
// Single rings: about the water model's own front speed, and a front about a cell thick
const RING_SPEED = 0.7; // cells per step
const RING_WIDTH = 0.9; // cells

export function mountDotRipple(host: HTMLElement, options: DotRippleOptions = {}): DotRipple {
  const {
    ramp = " ·∘○◎◉●",
    cell = 14,
    damping = 0.9,
    rate = 12,
    rain = true,
    seed: seeded = true,
    echoes = true,
  } = options;
  const glyphs = [...ramp];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
  host.append(canvas);
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  let cols = 0;
  let rows = 0;
  let cur = new Float32Array(0);
  let next = new Float32Array(0);
  let lastDrip = new Float64Array(0);
  let rings: Ring[] = [];
  let ink = "";
  let font = "";
  let timer = 0;
  let lastRain = 0;

  /** Copies the overlap of an old grid into a new one, so the water survives a resize. */
  function regrid<T extends Float32Array | Float64Array>(old: T, fresh: T, oldCols: number, newCols: number, newRows: number) {
    const oldRows = oldCols ? old.length / oldCols : 0;
    const width = Math.min(oldCols, newCols);
    for (let y = 0; y < Math.min(oldRows, newRows); y++) {
      fresh.set(old.subarray(y * oldCols, y * oldCols + width), y * newCols);
    }
    return fresh;
  }

  /*
   * Phones resize the viewport while scrolling (the address bar shows and hides), so a
   * resize keeps the ripples in flight rather than starting from still water.
   */
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { clientWidth: w, clientHeight: h } = host;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const first = cols === 0;
    const newCols = Math.ceil(w / cell);
    const newRows = Math.ceil(h / cell);
    if (newCols !== cols || newRows !== rows) {
      const size = newCols * newRows;
      cur = regrid(cur, new Float32Array(size), cols, newCols, newRows);
      next = regrid(next, new Float32Array(size), cols, newCols, newRows);
      lastDrip = regrid(lastDrip, new Float64Array(size), cols, newCols, newRows);
      cols = newCols;
      rows = newRows;
    }

    if (first && seeded) seed();
    else draw();
  }

  function readTheme() {
    const style = getComputedStyle(host);
    ink = style.getPropertyValue("--dot-ink").trim() || style.color;
    // The site's mono face, with a fallback for glyphs it lacks
    const mono = style.getPropertyValue("--font-lipi-mono").trim();
    font = `${Math.round(cell * 0.92)}px ${mono ? `${mono}, ` : ""}ui-monospace, monospace`;
    draw();
  }

  function drop(x: number, y: number, strength: number, radius = 0) {
    if (!echoes) {
      // A wider drop (a press) gives a stronger ring rather than a wider one
      rings.push({ x, y, strength: strength * (1 + radius * 0.4), age: 0 });
      start();
      return;
    }
    const cx = Math.floor(x / cell);
    const cy = Math.floor(y / cell);
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const xx = cx + dx;
        const yy = cy + dy;
        if (xx < 0 || yy < 0 || xx >= cols || yy >= rows) continue;
        cur[yy * cols + xx] = strength * (dx || dy ? 0.6 : 1);
      }
    }
    start();
  }

  /**
   * One step of single rings: each widens by RING_SPEED and fades by `damping` per step,
   * thinning as it spreads; a cell shows the strongest ring passing over it.
   */
  function stepRings() {
    cur.fill(0);
    const width = RING_WIDTH * cell;
    rings = rings.filter((ring) => {
      ring.age++;
      const radius = ring.age * RING_SPEED * cell;
      const amplitude = (ring.strength * damping ** ring.age) / Math.sqrt(1 + radius / cell);
      if (amplitude < CUTOFF) return false;

      // Only the cells around the ring's circle can be lit
      const reach = radius + width * 3;
      const x0 = Math.max(0, Math.floor((ring.x - reach) / cell));
      const x1 = Math.min(cols - 1, Math.floor((ring.x + reach) / cell));
      const y0 = Math.max(0, Math.floor((ring.y - reach) / cell));
      const y1 = Math.min(rows - 1, Math.floor((ring.y + reach) / cell));
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const d = Math.hypot(x * cell + cell / 2 - ring.x, y * cell + cell / 2 - ring.y);
          const profile = Math.exp(-(((d - radius) / width) ** 2));
          // Trim the soft edge, or every cell in reach draws the lightest glyph
          if (profile < 0.25) continue;
          const v = amplitude * profile;
          const i = y * cols + x;
          if (v >= CUTOFF && v > cur[i]) cur[i] = v;
        }
      }
      return true;
    });
    return rings.length > 0;
  }

  /** One step of the water model; false once every cell has settled. */
  function step() {
    if (!echoes) return stepRings();
    let active = false;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        const sum =
          (x > 0 ? cur[i - 1] : 0) +
          (x < cols - 1 ? cur[i + 1] : 0) +
          (y > 0 ? cur[i - cols] : 0) +
          (y < rows - 1 ? cur[i + cols] : 0);
        let v = (sum / 2 - next[i]) * damping;
        if (Math.abs(v) < CUTOFF) v = 0;
        else active = true;
        next[i] = v;
      }
    }
    [cur, next] = [next, cur];
    return active;
  }

  function draw() {
    const last = glyphs.length - 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = ink;
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const v = cur[y * cols + x];
        if (v <= 0) continue;
        const index = Math.min(last, Math.ceil((Math.min(v, 100) / 100) * last));
        if (index > 0) ctx.fillText(glyphs[index], x * cell + cell / 2, y * cell + cell / 2);
      }
    }
  }

  function tick() {
    const now = performance.now();
    if (rain && now - lastRain > RAIN_EVERY) {
      lastRain = now;
      const { clientWidth: w, clientHeight: h } = host;
      drop(Math.random() * w, Math.random() * h, 70 + Math.random() * 60);
    }
    const active = step();
    draw();
    if (!active && !rain) stop();
  }

  function start() {
    if (timer || reduced.matches || document.hidden) return;
    timer = window.setInterval(tick, 1000 / rate);
  }

  function stop() {
    clearInterval(timer);
    timer = 0;
  }

  /** Open with a few rings already travelling; under reduced motion this is the one still frame. */
  function seed() {
    stop();
    const { clientWidth: w, clientHeight: h } = host;
    for (const [fx, fy] of [[0.1, 0.35], [0.9, 0.55], [0.14, 0.8], [0.88, 0.2]]) {
      drop(fx * w, fy * h, PRESS_STRENGTH, 1);
    }
    for (let i = 0; i < 10; i++) step();
    draw();
    start();
  }

  const onVisibility = () => (document.hidden ? stop() : start());
  /** Still water: clears every ripple (a blank field's reduced-motion state). */
  function calm() {
    stop();
    rings = [];
    cur.fill(0);
    next.fill(0);
    draw();
  }

  const onMotion = () => {
    if (!reduced.matches) start();
    else if (seeded) seed();
    else calm();
  };
  let resizeTimer = 0;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 150);
  };
  const themeObserver = new MutationObserver(readTheme);

  document.addEventListener("visibilitychange", onVisibility);
  reduced.addEventListener("change", onMotion);
  window.addEventListener("resize", onResize);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  readTheme();
  resize();
  document.fonts?.ready.then(readTheme);

  return {
    move(x, y) {
      if (reduced.matches) return;
      const cx = Math.floor(x / cell);
      const cy = Math.floor(y / cell);
      if (cx < 0 || cy < 0 || cx >= cols || cy >= rows) return;
      const i = cy * cols + cx;
      const now = performance.now();
      if (now - lastDrip[i] < MOVE_DELAY) return;
      lastDrip[i] = now;
      drop(x, y, MOVE_STRENGTH);
    },
    press(x, y) {
      if (!reduced.matches) drop(x, y, PRESS_STRENGTH, 1);
    },
    destroy() {
      stop();
      clearTimeout(resizeTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", onMotion);
      window.removeEventListener("resize", onResize);
      themeObserver.disconnect();
      canvas.remove();
    },
  };
}
