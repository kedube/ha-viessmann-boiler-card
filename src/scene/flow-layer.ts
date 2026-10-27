import { pathD, type Pt } from "./geometry";

export interface FlowStream {
  key: string;
  /** Pipe centreline in scene pixels, in flow direction. */
  points: Pt[];
  /** Pipe diameter in scene pixels. */
  width: number;
  rgb: Rgb;
  /** Fades from `rgb` at the start to this colour at `to`, e.g. hot to cold through a zone coil. */
  fade?: { to: Pt; rgb: Rgb };
  /** Scene pixels per second. */
  speed: number;
  /** Pipes nearer the viewer that hide this stream where they cross it. */
  occluders?: Array<{ points: Pt[]; width: number }>;
}

type Rgb = readonly [number, number, number];
type Paint = string | CanvasGradient;

interface Prepared extends FlowStream {
  path: Path2D;
  dash: number;
  gap: number;
  hidden: Array<{ path: Path2D; width: number }>;
  /** Halo, core and spark strokes. */
  paints: [Paint, Paint, Paint];
}

const FRAME_MS = 1000 / 30;

/**
 * Draws water moving inside the pipes: a darkened channel with glowing streaks
 * coloured by the side of the loop, capped at 30 fps.
 */
export class FlowLayer {
  private readonly ctx: CanvasRenderingContext2D | null;
  private streams: Prepared[] = [];
  private viewBox = { x: 0, y: 0, w: 1, h: 1 };
  private scale = 1;
  private frame = 0;
  private last = 0;
  private elapsed = 0;
  private animate = true;
  private running = false;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d");
  }

  setStreams(streams: FlowStream[]): void {
    // Without a 2D canvas there is nothing to draw on.
    if (!this.ctx) return;
    this.streams = streams.map((s) => {
      const dash = Math.max(5, s.width * 2.2);
      const hidden = (s.occluders ?? []).map((o) => ({ path: new Path2D(pathD(o.points)), width: o.width }));
      const paints: Prepared["paints"] = [this.paint(s, 0.38), this.paint(s, 0.85), this.paint(s, 0.95, true)];
      return { ...s, path: new Path2D(pathD(s.points)), dash, gap: dash * 1.15, hidden, paints };
    });
    this.draw();
  }

  /** A stroke colour, or a gradient from the stream's start to its fade point. */
  private paint(s: FlowStream, alpha: number, light = false): Paint {
    const rgba = (rgb: Rgb) => {
      const [r, g, b] = light ? rgb.map(lighten) : rgb;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    if (!s.fade || !this.ctx) return rgba(s.rgb);
    const [from, to] = [s.points[0], s.fade.to];
    const gradient = this.ctx.createLinearGradient(from[0], from[1], to[0], to[1]);
    gradient.addColorStop(0, rgba(s.rgb));
    gradient.addColorStop(1, rgba(s.fade.rgb));
    return gradient;
  }

  setViewport(viewBox: { x: number; y: number; w: number; h: number }, cssWidth: number, cssHeight: number, dpr: number): void {
    const width = Math.max(1, Math.round(cssWidth * dpr));
    const height = Math.max(1, Math.round(cssHeight * dpr));
    if (this.canvas.width !== width) this.canvas.width = width;
    if (this.canvas.height !== height) this.canvas.height = height;
    this.viewBox = viewBox;
    this.scale = width / viewBox.w;
    this.draw();
  }

  /** With animation off the streams are drawn as a steady glow. */
  setAnimate(animate: boolean): void {
    this.animate = animate;
    if (!animate) this.stop();
    this.draw();
  }

  start(): void {
    if (this.running || !this.animate) return;
    this.running = true;
    this.last = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  private readonly tick = (now: number): void => {
    if (!this.running) return;
    this.frame = requestAnimationFrame(this.tick);
    if (now - this.last < FRAME_MS) return;
    this.elapsed += Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    this.draw();
  };

  private draw(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (!this.streams.length) return;
    const k = this.scale;
    ctx.setTransform(k, 0, 0, k, -this.viewBox.x * k, -this.viewBox.y * k);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const s of this.streams) {
      ctx.setLineDash([]);
      ctx.lineWidth = s.width * 0.5;
      ctx.strokeStyle = "rgba(30, 14, 6, 0.32)";
      ctx.stroke(s.path);
      if (this.animate) {
        ctx.setLineDash([s.dash, s.gap]);
        ctx.lineDashOffset = -((this.elapsed * s.speed) % (s.dash + s.gap));
      }
      const [halo, core, spark] = s.paints;
      ctx.lineWidth = s.width * 0.56;
      ctx.strokeStyle = halo;
      ctx.stroke(s.path);
      ctx.lineWidth = s.width * 0.3;
      ctx.strokeStyle = core;
      ctx.stroke(s.path);
      ctx.lineWidth = s.width * 0.11;
      ctx.strokeStyle = spark;
      ctx.stroke(s.path);
      // Streams are drawn far to near, so erasing nearer pipes here also hides
      // any farther stream behind them, and never a nearer one.
      if (s.hidden.length) {
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.setLineDash([]);
        ctx.strokeStyle = "#000";
        for (const o of s.hidden) {
          ctx.lineWidth = o.width;
          ctx.stroke(o.path);
        }
        ctx.restore();
      }
    }
  }
}

function lighten(c: number): number {
  return Math.round(c + (255 - c) * 0.65);
}
